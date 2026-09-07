"""Exact scoped cosine in <=64-vector compact blocks; no persistent RAM cache."""

import asyncio
import logging
import secrets
import sqlite3
from itertools import groupby

import numpy as np

from evidra.conversations.models import VectorBuild, VectorGeneration, VectorJob
from evidra.domain.errors import EvidraError
from evidra.domain.sources import content_version
from evidra.evidence.service import EvidenceService
from evidra.providers.models import EmbeddingBatch
from evidra.providers.registry import ProviderRegistry
from evidra.scope.service import ScopeContext


class VectorSearch:
    def __init__(self, evidence: EvidenceService, providers: ProviderRegistry):
        self.evidence, self.providers, self.scopes = evidence, providers, evidence.scopes
        self.tasks: dict[str, asyncio.Task[None]] = {}
        with self.scopes.database.transaction() as connection:
            connection.execute(
                "UPDATE vector_jobs SET payload=json_set(payload,'$.state','FAILED',"
                "'$.error','ENGINE_INTERRUPTED') WHERE json_extract(payload,'$.state')='RUNNING'"
            )

    def allowed(self, connection: sqlite3.Connection, context: ScopeContext) -> list[str]:
        connection.execute(
            "CREATE TEMP TABLE IF NOT EXISTS vector_allowed(version_id TEXT PRIMARY KEY)"
        )
        connection.execute("DELETE FROM vector_allowed")
        for row in self.scopes.members(connection, context.notebook_id, context.snapshot_id):
            source = self.scopes.content(connection, row)
            for content in source.contents:
                connection.execute(
                    "INSERT OR IGNORE INTO vector_allowed SELECT current_version_id FROM documents "
                    "WHERE source_id=? AND content_key=? AND content_version=? "
                    "AND current_version_id IS NOT NULL AND coverage!='MISSING_FILE' "
                    "AND (source_kind NOT IN ('pdf','text_attachment') OR file_identity!='')",
                    (source.id, content.key, content_version(content)),
                )
        return [
            r[0]
            for r in connection.execute(
                "SELECT c.id FROM document_chunks c JOIN "
                "vector_allowed a ON c.version_id=a.version_id ORDER BY c.id"
            )
        ]

    def start(self, context: ScopeContext, body: VectorBuild) -> VectorJob:
        profile = self.providers.profiles.get(body.profile_id)
        if profile.purpose != "embedding":
            raise EvidraError("CAPABILITY_UNSUPPORTED", "Select a local embedding profile.")
        with self.scopes.guarded(context, capability=context.capability) as connection:
            prior = connection.execute(
                "SELECT * FROM vector_jobs WHERE notebook_id=? AND snapshot_id=? "
                "AND idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            if prior:
                if prior["profile_id"] != body.profile_id:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Different embedding profile.")
                return VectorJob.model_validate_json(prior["payload"])
            ids = self.allowed(connection, context)
            if not ids:
                raise EvidraError("NO_EVIDENCE", "Index source text before building embeddings.")
            if len(ids) > 50000:
                raise EvidraError(
                    "VECTOR_LIMIT", "The 50,000 chunk index limit was exceeded; no chunks omitted."
                )
            job = VectorJob(id=secrets.token_hex(16), state="RUNNING", processed=0, total=len(ids))
            connection.execute(
                "INSERT INTO vector_jobs VALUES(?,?,?,?,?,?)",
                (
                    job.id,
                    context.notebook_id,
                    context.snapshot_id,
                    body.idempotency_key,
                    body.profile_id,
                    job.model_dump_json(),
                ),
            )
        task = asyncio.create_task(
            self._build(context, body.profile_id, profile.revision, ids, job)
        )
        self.tasks[job.id] = task
        task.add_done_callback(lambda _: self.tasks.pop(job.id, None))
        return job

    async def _build(
        self, context: ScopeContext, profile_id: str, revision: int, ids: list[str], job: VectorJob
    ) -> None:
        generation: VectorGeneration | None = None
        try:
            for offset in range(0, len(ids), 16):
                selected = ids[offset : offset + 16]
                with self.scopes.guarded(context, capability=context.capability) as connection:
                    texts = [
                        self.evidence.from_connection(connection, context, i).excerpt
                        for i in selected
                    ]
                batch = await self.providers.embed(context, profile_id, texts)
                if batch.dimensions > 16384:
                    raise EvidraError(
                        "VECTOR_LIMIT", "Embedding dimension exceeds the bounded block limit."
                    )
                if generation is None:
                    generation = VectorGeneration(
                        id=job.id,
                        profile_id=profile_id,
                        model=batch.model,
                        digest=batch.digest,
                        dimensions=batch.dimensions,
                        normalized=batch.normalized,
                        chunks=len(ids),
                    )
                    with self.scopes.guarded(context, capability=context.capability) as connection:
                        connection.execute(
                            "INSERT INTO vector_generations VALUES(?,?,?,?,?,?,0)",
                            (
                                job.id,
                                context.notebook_id,
                                context.snapshot_id,
                                profile_id,
                                revision,
                                generation.model_dump_json(),
                            ),
                        )
                self._match(generation, batch)
                matrix = self._matrix(batch, len(selected))
                with self.scopes.guarded(context, capability=context.capability) as connection:
                    connection.execute(
                        "INSERT INTO vector_blocks VALUES(?,?,?)",
                        (job.id, offset, matrix.tobytes()),
                    )
                    connection.executemany(
                        "INSERT INTO vector_members VALUES(?,?,?,?)",
                        [(job.id, i, offset, n) for n, i in enumerate(selected)],
                    )
                    job = job.model_copy(update={"processed": offset + len(selected)})
                    connection.execute(
                        "UPDATE vector_jobs SET payload=? WHERE id=?",
                        (job.model_dump_json(), job.id),
                    )
            with self.scopes.guarded(context, capability=context.capability) as connection:
                if self.providers.profiles.load(connection, profile_id).revision != revision:
                    raise EvidraError(
                        "REVISION_CONFLICT", "Embedding profile changed during rebuild."
                    )
                if ids != self.allowed(connection, context):
                    raise EvidraError(
                        "DOCUMENT_STALE", "Indexed chunk versions changed during rebuild."
                    )
                connection.execute(
                    "UPDATE vector_generations SET active=0 WHERE notebook_id=? AND "
                    "snapshot_id=? AND profile_id=?",
                    (context.notebook_id, context.snapshot_id, profile_id),
                )
                connection.execute("UPDATE vector_generations SET active=1 WHERE id=?", (job.id,))
                job = job.model_copy(update={"state": "COMPLETE", "generation": generation})
                connection.execute(
                    "UPDATE vector_jobs SET payload=? WHERE id=?", (job.model_dump_json(), job.id)
                )
        except BaseException as exc:
            code = (
                exc.code
                if isinstance(exc, EvidraError)
                else "CANCELLED"
                if isinstance(exc, asyncio.CancelledError)
                else "VECTOR_BUILD_FAILED"
            )
            logging.getLogger("evidra.vectors").warning(
                "build %s failed: %s (%s)", job.id, code, type(exc).__name__
            )
            job = job.model_copy(
                update={"state": "CANCELLED" if code == "CANCELLED" else "FAILED", "error": code}
            )
            with self.scopes.database.transaction() as connection:
                connection.execute(
                    "UPDATE vector_jobs SET payload=? WHERE id=?", (job.model_dump_json(), job.id)
                )
                connection.execute(
                    "DELETE FROM vector_generations WHERE id=? AND active=0", (job.id,)
                )

    @staticmethod
    def _match(generation: VectorGeneration, batch: EmbeddingBatch) -> None:
        if (generation.model, generation.digest, generation.dimensions, generation.normalized) != (
            batch.model,
            batch.digest,
            batch.dimensions,
            batch.normalized,
        ):
            raise EvidraError(
                "VECTOR_MISMATCH",
                "Embedding model/revision/dimension/normalization differs from index.",
            )

    @staticmethod
    def _matrix(batch: EmbeddingBatch, count: int) -> np.ndarray:
        values = np.asarray(batch.vectors, dtype="<f4")
        if (
            values.shape != (count, batch.dimensions)
            or not np.isfinite(values).all()
            or (np.linalg.norm(values, axis=1) == 0).any()
        ):
            raise EvidraError("VECTOR_MISMATCH", "Invalid embedding shape or values.")
        return values

    def search_batch(
        self,
        context: ScopeContext,
        profile_id: str,
        batch: EmbeddingBatch,
        limit: int = 40,
        document_version_id: str | None = None,
    ) -> list[str]:
        query = self._matrix(batch, 1)[0]
        query = query / np.linalg.norm(query)
        with self.scopes.guarded(context, capability=context.capability) as connection:
            row = connection.execute(
                "SELECT * FROM vector_generations WHERE notebook_id=? AND snapshot_id=? AND "
                "profile_id=? AND active=1",
                (context.notebook_id, context.snapshot_id, profile_id),
            ).fetchone()
            if row is None:
                raise EvidraError(
                    "VECTOR_INDEX_REQUIRED", "Build the selected embedding index first."
                )
            generation = VectorGeneration.model_validate_json(row["payload"])
            self._match(generation, batch)
            if (
                self.providers.profiles.load(connection, profile_id).revision
                != row["profile_revision"]
            ):
                raise EvidraError(
                    "VECTOR_MISMATCH", "Embedding profile changed; rebuild explicitly."
                )
            self.allowed(connection, context)
            # SQL intersects exact permitted versions before loading blocks and before top-k.
            members = connection.execute(
                "SELECT m.chunk_id,m.block,m.position FROM vector_members m "
                "JOIN document_chunks c ON c.id=m.chunk_id JOIN vector_allowed a ON "
                "a.version_id=c.version_id "
                "WHERE m.generation_id=? AND (? IS NULL OR c.version_id=?) ORDER BY "
                "m.block,m.position",
                (generation.id, document_version_id, document_version_id),
            )
            results: list[tuple[float, str]] = []
            for block, grouped in groupby(members, key=lambda row: row["block"]):
                selected = list(grouped)
                raw = connection.execute(
                    "SELECT data FROM vector_blocks WHERE generation_id=? AND block=?",
                    (generation.id, block),
                ).fetchone()[0]
                values = np.frombuffer(raw, dtype="<f4").reshape(-1, generation.dimensions)
                permitted = values[[r["position"] for r in selected]]
                scores = permitted @ query / np.linalg.norm(permitted, axis=1)
                results.extend(
                    (float(score), r["chunk_id"]) for score, r in zip(scores, selected, strict=True)
                )
                results = sorted(results, key=lambda v: (-v[0], v[1]))[:limit]
            return [value[1] for value in results]

    async def search(
        self,
        context: ScopeContext,
        profile_id: str,
        query: str,
        document_version_id: str | None = None,
    ) -> list[str]:
        batch = await self.providers.embed(context, profile_id, [query])
        return self.search_batch(
            context, profile_id, batch, document_version_id=document_version_id
        )

    def read(self, context: ScopeContext, job_id: str, *, cancel: bool = False) -> VectorJob:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            row = connection.execute(
                "SELECT payload FROM vector_jobs WHERE id=? AND notebook_id=? AND snapshot_id=?",
                (job_id, context.notebook_id, context.snapshot_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Embedding job not found.")
            job = VectorJob.model_validate_json(row[0])
        if cancel and job_id in self.tasks:
            self.tasks[job_id].cancel()
        return job

    async def close(self) -> None:
        tasks = list(self.tasks.values())
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
