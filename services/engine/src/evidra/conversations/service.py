"""Durable prepared runs, explicit dispatch, bounded draft events and validated promotion."""

import asyncio
import json
import logging
import secrets
import sqlite3
from contextlib import aclosing
from datetime import UTC, datetime
from typing import Literal

from evidra.conversations.models import (
    Answer,
    CancelReceipt,
    ConversationCreate,
    ConversationPage,
    ConversationRecord,
    EventPage,
    RunAccess,
    RunEvent,
    RunPage,
    RunPrepare,
    RunRecord,
    RunSummary,
    VisualProvenance,
)
from evidra.conversations.validation import validate_answer
from evidra.documents.ingestion import IngestionService
from evidra.domain.documents import SearchRequest
from evidra.domain.errors import EvidraError
from evidra.providers.base import GenerationIncomplete, NativeProvider
from evidra.providers.models import (
    ContentCategory,
    GenerationRequest,
    ImageInput,
    Message,
    OllamaOptions,
)
from evidra.providers.registry import ProviderRegistry
from evidra.providers.usage import CallIdentity
from evidra.retrieval.context import SYSTEM, build_context
from evidra.retrieval.fusion import fuse
from evidra.retrieval.lexical import LexicalSearch
from evidra.retrieval.vectors import VectorSearch
from evidra.scope.service import ScopeContext


class ConversationService:
    def __init__(
        self,
        lexical: LexicalSearch,
        vectors: VectorSearch,
        providers: ProviderRegistry,
        ingestion: IngestionService,
    ):
        self.lexical, self.vectors, self.providers, self.ingestion = (
            lexical,
            vectors,
            providers,
            ingestion,
        )
        self.evidence, self.scopes = lexical.evidence, lexical.scopes
        self.tasks: dict[str, tuple[asyncio.Task[None], asyncio.Event]] = {}
        with self.scopes.database.transaction() as connection:
            connection.execute(
                "UPDATE conversation_runs SET payload=json_set(payload,'$.state','FAILED',"
                "'$.error','ENGINE_INTERRUPTED') WHERE json_extract(payload,'$.state')='RUNNING'"
            )

    def create(self, context: ScopeContext, body: ConversationCreate) -> ConversationRecord:
        with self.scopes.guarded(context, capability="commit") as connection:
            connection.execute(
                "INSERT OR IGNORE INTO conversations VALUES(?,?,?,?,?)",
                (
                    secrets.token_hex(16),
                    context.notebook_id,
                    context.snapshot_id,
                    0,
                    body.idempotency_key,
                ),
            )
            row = connection.execute(
                "SELECT * FROM conversations WHERE notebook_id=? AND snapshot_id=? AND "
                "idempotency_key=?",
                (context.notebook_id, context.snapshot_id, body.idempotency_key),
            ).fetchone()
            return ConversationRecord(**{key: row[key] for key in ConversationRecord.model_fields})

    def conversation(self, context: ScopeContext, conversation_id: str) -> ConversationRecord:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            return self._conversation(connection, context, conversation_id)

    def _conversation(
        self, connection: sqlite3.Connection, context: ScopeContext, conversation_id: str
    ) -> ConversationRecord:
        row = connection.execute(
            "SELECT * FROM conversations WHERE id=? AND notebook_id=? AND snapshot_id=?",
            (conversation_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Conversation not found in this snapshot.")
        return ConversationRecord(**{key: row[key] for key in ConversationRecord.model_fields})

    def list(self, context: ScopeContext, offset: int, limit: int) -> ConversationPage:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            params = (context.notebook_id, context.snapshot_id)
            ids = connection.execute(
                "SELECT id FROM conversations WHERE notebook_id=? AND snapshot_id=? ORDER BY "
                "rowid DESC LIMIT ? OFFSET ?",
                (*params, limit, offset),
            ).fetchall()
            total = connection.execute(
                "SELECT count(*) FROM conversations WHERE notebook_id=? AND snapshot_id=?", params
            ).fetchone()[0]
            return ConversationPage(
                items=[self._conversation(connection, context, r[0]) for r in ids],
                offset=offset,
                limit=limit,
                total=total,
            )

    def read(self, context: ScopeContext, run_id: str) -> RunRecord:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            return self._read(connection, context, run_id)

    def access(self, context: ScopeContext, run_id: str) -> RunAccess:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            run = self._read(connection, context, run_id)
            versions = {value.document_version_id for value in run.context.evidence}
            versions.update(run.context.history_visual_versions)
            for identity in run.context.history_evidence_ids:
                versions.add(
                    self.evidence.from_connection(connection, context, identity).document_version_id
                )
            if run.visual:
                versions.add(run.visual.document_version_id)
            documents = set()
            for version in versions:
                row = connection.execute(
                    "SELECT document_id FROM document_versions WHERE id=?", (version,)
                ).fetchone()
                document = self.ingestion.registry.require(connection, context, row[0])
                documents.add((document["source_id"], document["content_key"]))
            source_ids = {source for source, _ in documents}
            access = self.scopes.snapshot_access(
                connection, context.notebook_id, context.snapshot_id
            )
            return RunAccess(
                items=[item for item in access if item.identity.source_id in source_ids],
                documents=sorted(documents),
            )

    def _read(
        self, connection: sqlite3.Connection, context: ScopeContext, run_id: str
    ) -> RunRecord:
        row = connection.execute(
            "SELECT r.payload FROM conversation_runs r JOIN conversations c ON "
            "c.id=r.conversation_id "
            "WHERE r.id=? AND c.notebook_id=? AND c.snapshot_id=?",
            (run_id, context.notebook_id, context.snapshot_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Run not found in this snapshot.")
        run = RunRecord.model_validate_json(row[0])
        for identity in run.context.history_evidence_ids:
            self.evidence.from_connection(connection, context, identity)
        for version in run.context.history_visual_versions:
            document = connection.execute(
                "SELECT document_id FROM document_versions WHERE id=?", (version,)
            ).fetchone()
            if document is None:
                raise EvidraError("NOT_FOUND", "Historical visual source is unavailable.")
            self.ingestion.registry.require(connection, context, document[0])
        for value in run.context.evidence:
            current = self.evidence.from_connection(connection, context, value.id)
            if (
                current.excerpt != value.excerpt
                or current.document_version_id != value.document_version_id
            ):
                raise EvidraError("EVIDENCE_INVARIANT", "Run evidence no longer verifies.")
        if run.visual:
            self.ingestion.registry.require(
                connection,
                context,
                connection.execute(
                    "SELECT document_id FROM document_versions WHERE id=?",
                    (run.visual.document_version_id,),
                ).fetchone()[0],
            )
        return run

    def runs(self, context: ScopeContext, conversation_id: str, offset: int, limit: int) -> RunPage:
        self.conversation(context, conversation_id)
        with self.scopes.guarded(context, capability=context.capability) as connection:
            rows = connection.execute(
                "SELECT id FROM conversation_runs WHERE conversation_id=? ORDER BY rowid LIMIT ? "
                "OFFSET ?",
                (conversation_id, limit, offset),
            ).fetchall()
            total = connection.execute(
                "SELECT count(*) FROM conversation_runs WHERE conversation_id=?", (conversation_id,)
            ).fetchone()[0]
            items = []
            for row in rows:
                run = self._read(connection, context, row[0])
                items.append(
                    RunSummary(
                        id=run.id,
                        question=run.question,
                        state=run.state,
                        model=run.profile.model,
                        error=run.error,
                    )
                )
            return RunPage(items=items, offset=offset, limit=limit, total=total)

    async def prepare(
        self, context: ScopeContext, conversation_id: str, body: RunPrepare
    ) -> RunRecord:
        conversation = self.conversation(context, conversation_id)
        raw = body.model_dump_json()
        with self.scopes.guarded(context, capability="commit") as connection:
            prior = connection.execute(
                "SELECT id,request FROM conversation_runs WHERE conversation_id=? AND "
                "idempotency_key=?",
                (conversation_id, body.idempotency_key),
            ).fetchone()
            if prior:
                if prior["request"] != raw:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "The prepared request differs.")
                return self._read(connection, context, prior["id"])
            history = []
            history_categories: set[ContentCategory] = set()
            history_evidence: set[str] = set()
            history_visual: set[str] = set()
            for row in connection.execute(
                "SELECT id FROM conversation_runs WHERE conversation_id=? AND "
                "json_extract(payload,'$.state')='COMPLETE' ORDER BY rowid",
                (conversation_id,),
            ):
                run = self._read(connection, context, row[0])
                assert run.output is not None
                # Historical prose can retain source metadata/quotations even when this
                # turn retrieves nothing. Images themselves are not replayed in history.
                history_categories.update(run.categories & {"excerpts", "metadata"})
                if any(claim.evidence for claim in run.output.claims):
                    history_categories.update({"excerpts", "metadata"})
                history_evidence.update(value.id for value in run.context.evidence)
                history_evidence.update(run.context.history_evidence_ids)
                history_visual.update(run.context.history_visual_versions)
                if run.visual:
                    history_visual.add(run.visual.document_version_id)
                history.extend(
                    [
                        {"role": "user", "text": run.question},
                        {"role": "assistant", "text": run.output.model_dump_json()},
                    ]
                )
            if len(history) > 198:
                raise EvidraError(
                    "CONTEXT_LIMIT",
                    "Complete history exceeds 198 messages. Start an explicit new conversation.",
                )
        if conversation.revision != body.expected_revision:
            raise EvidraError("REVISION_CONFLICT", "Conversation history changed.")
        profile = self.providers.profiles.get(body.profile_id)
        if body.ollama_options and (
            profile.adapter != "ollama"
            or body.ollama_options.num_ctx not in [None, body.context_tokens]
        ):
            raise EvidraError(
                "INVALID_REQUEST", "Ollama options require matching model/context configuration."
            )
        options = (
            (body.ollama_options or OllamaOptions()).model_copy(
                update={"num_ctx": body.context_tokens}
            )
            if profile.adapter == "ollama"
            else None
        )
        if profile.purpose != "generation" or not profile.supports("generation"):
            raise EvidraError("CAPABILITY_UNSUPPORTED", "Select a generation model.")
        visual = None
        if body.preview_operation_id:
            if not profile.supports("images"):
                raise EvidraError(
                    "CAPABILITY_UNSUPPORTED", "This model has no declared vision capability."
                )
            # Preview verifies exact registered PDF bytes outside a database lock.
            read_context = self.scopes.resolve(
                context.principal, context.notebook_id, context.snapshot_id
            )
            preview = self.ingestion.preview(read_context, body.preview_operation_id)
            visual = VisualProvenance(
                operation_id=body.preview_operation_id,
                document_version_id=preview.document_version_id,
                page_index=preview.page_index,
                region=preview.region,
                sha256=preview.sha256,
                destination=f"{profile.adapter} / {profile.model} / {profile.base_url}",
            )
        if body.evidence_id and body.document_version_id:
            raise EvidraError("INVALID_REQUEST", "Select one question scope: excerpt or document.")
        hits = self.lexical.search(
            context,
            SearchRequest(query=body.question, limit=40),
            document_version_id=body.document_version_id,
        )
        vector_ids = (
            await self.vectors.search(
                context, body.embedding_profile_id, body.question, body.document_version_id
            )
            if body.embedding_profile_id and not body.evidence_id
            else []
        )
        ids = fuse([h.evidence_id for h in hits.items], vector_ids)
        values = (
            [self.evidence.read(context, body.evidence_id)]
            if body.evidence_id
            else [self.evidence.read(context, identity) for identity in ids]
        )
        built = build_context(
            body.question,
            values,
            history,
            body.context_tokens,
            body.max_output_tokens,
            NativeProvider.plan_schema(profile, SYSTEM, Answer.model_json_schema()),
            image_estimate=4096 if visual else 0,
        )
        if not built.evidence and not visual:
            raise EvidraError(
                "NO_EVIDENCE",
                "No retrieved evidence fits this question/context. Lexical reading remains "
                "available.",
            )
        built = built.model_copy(
            update={
                "history_evidence_ids": sorted(history_evidence),
                "history_visual_versions": sorted(history_visual),
            }
        )
        categories: set[ContentCategory] = {"excerpts", "metadata"} if built.evidence else set()
        categories.update(history_categories)
        if history:
            categories.add("history")
        if visual:
            categories.add("images")
        run = RunRecord(
            id=secrets.token_hex(16),
            conversation_id=conversation_id,
            conversation_revision=conversation.revision,
            state="PREPARED",
            profile=profile,
            ollama_options=options,
            question=body.question,
            context=built,
            categories=frozenset(categories),
            visual=visual,
            created_at=datetime.now(UTC).isoformat(),
        )
        if len(run.model_dump_json().encode()) > 800000:
            raise EvidraError(
                "CONTEXT_LIMIT",
                "Complete prepared run exceeds bounded display transport; nothing was sent.",
            )
        with self.scopes.guarded(context, capability="commit") as connection:
            if (
                self._conversation(connection, context, conversation_id).revision
                != conversation.revision
            ):
                raise EvidraError("REVISION_CONFLICT", "History changed while preparing.")
            connection.execute(
                "INSERT INTO conversation_runs VALUES(?,?,?,?,?,?,?)",
                (
                    run.id,
                    conversation_id,
                    body.idempotency_key,
                    raw,
                    run.model_dump_json(),
                    context.notebook_revision,
                    context.fingerprint,
                ),
            )
        return run

    def start(self, context: ScopeContext, run_id: str) -> RunRecord:
        run = self.read(context, run_id)
        if run.state != "PREPARED":
            return run  # A transport retry never dispatches a second call.
        if run.context.schema_mode is None or run.context.output_schema is None:
            raise EvidraError(
                "SCHEMA_PLAN_MISSING",
                "Historical preparation has no exact schema plan; prepare a new run.",
            )
        current = self.providers.profiles.authorize(context, run.profile.id, run.categories)
        if current != run.profile:
            raise EvidraError("REVISION_CONFLICT", "Prepared provider changed.")
        with self.scopes.guarded(context, capability="commit") as connection:
            row = connection.execute(
                "SELECT scope_revision,scope_fingerprint FROM conversation_runs WHERE id=?",
                (run_id,),
            ).fetchone()
            if row[0] != context.notebook_revision or row[1] != context.fingerprint:
                raise EvidraError("SCOPE_STALE", "Prepared scope changed; prepare a new run.")
            if (
                self._conversation(connection, context, run.conversation_id).revision
                != run.conversation_revision
            ):
                raise EvidraError("REVISION_CONFLICT", "Prepared history changed.")
            if connection.execute(
                "SELECT 1 FROM conversation_runs WHERE conversation_id=? AND "
                "json_extract(payload,'$.state')='RUNNING'",
                (run.conversation_id,),
            ).fetchone():
                raise EvidraError("RUN_BUSY", "A conversation run is already active.")
            current = self.providers.profiles.load(connection, run.profile.id)
            if current != run.profile:
                raise EvidraError("REVISION_CONFLICT", "Prepared provider changed.")
            run = run.model_copy(update={"state": "RUNNING"})
            self._save(connection, run)
        cancel = asyncio.Event()
        task = asyncio.create_task(self._produce(context, run, cancel))
        self.tasks[run.id] = (task, cancel)
        task.add_done_callback(lambda _: self.tasks.pop(run.id, None))
        return run

    @staticmethod
    def _save(connection: sqlite3.Connection, run: RunRecord) -> None:
        connection.execute(
            "UPDATE conversation_runs SET payload=? WHERE id=?", (run.model_dump_json(), run.id)
        )

    def _event(
        self,
        connection: sqlite3.Connection,
        run_id: str,
        kind: Literal["draft", "complete", "failed", "cancelled"],
        text: str | None = None,
        code: str | None = None,
    ) -> None:
        cursor = connection.execute(
            "SELECT coalesce(max(cursor),0)+1 FROM conversation_events WHERE run_id=?", (run_id,)
        ).fetchone()[0]
        event = RunEvent(cursor=cursor, kind=kind, text=text, code=code)
        connection.execute(
            "INSERT INTO conversation_events VALUES(?,?,?)",
            (run_id, cursor, event.model_dump_json()),
        )

    async def _produce(self, context: ScopeContext, run: RunRecord, cancel: asyncio.Event) -> None:
        try:
            images = []
            if run.visual:
                read_context = self.scopes.resolve(
                    context.principal, context.notebook_id, context.snapshot_id
                )
                preview = self.ingestion.preview(read_context, run.visual.operation_id)
                if preview.sha256 != run.visual.sha256:
                    raise EvidraError("DOCUMENT_STALE", "Prepared image changed.")
                images = [ImageInput(mime_type=preview.mime_type, data=preview.data_base64)]
            request = GenerationRequest(
                messages=[Message.model_validate(m) for m in run.context.history]
                + [Message(role="user", text=run.context.prompt, images=images)],
                system=run.context.system,
                max_output_tokens=run.context.max_output_tokens,
                output_schema=run.context.output_schema,
                prepared_schema_mode=run.context.schema_mode,
                categories=run.categories,
                ollama_options=run.ollama_options,
            )
            text = ""
            final = False
            async with aclosing(
                self.providers.generate(
                    context,
                    run.profile.id,
                    request,
                    cancel,
                    identity=CallIdentity(
                        call_id=run.id, job_id=run.id, session_id=run.conversation_id
                    ),
                )
            ) as events:
                async for event in events:
                    if event.kind == "error":
                        raise EvidraError(
                            event.code or "STREAM_INCOMPLETE", "Provider rejected the generation."
                        )
                    if event.kind == "final":
                        final = True
                    if event.kind == "delta" and event.text:
                        if final:
                            raise EvidraError(
                                "STREAM_INCOMPLETE", "Unexpected content after terminal event."
                            )
                        text += event.text
                        if len(text.encode()) > 100000:
                            raise EvidraError(
                                "OUTPUT_LIMIT", "Model draft exceeded the bounded output size."
                            )
                        with self.scopes.guarded(context, capability="commit") as connection:
                            for start in range(0, len(event.text), 2000):
                                self._event(
                                    connection, run.id, "draft", event.text[start : start + 2000]
                                )
            if not final:
                raise EvidraError("STREAM_INCOMPLETE", "Provider ended without a terminal result.")
            if cancel.is_set():
                raise EvidraError("CANCELLED", "Run cancelled.")
            output = validate_answer(text, run, context, self.evidence)
            with self.scopes.guarded(context, capability="commit") as connection:
                self._read(connection, context, run.id)
                if self.providers.profiles.load(connection, run.profile.id) != run.profile:
                    raise EvidraError("REVISION_CONFLICT", "Provider changed before final commit.")
                if (
                    self._conversation(connection, context, run.conversation_id).revision
                    != run.conversation_revision
                ):
                    raise EvidraError("REVISION_CONFLICT", "History changed before final commit.")
                run = run.model_copy(
                    update={
                        "state": "COMPLETE",
                        "output": output,
                        "anchor_status": "VERIFIED_EXISTENCE_ONLY"
                        if any(c.evidence for c in output.claims)
                        else None,
                    }
                )
                self._save(connection, run)
                connection.execute(
                    "UPDATE conversations SET revision=revision+1 WHERE id=?",
                    (run.conversation_id,),
                )
                self._event(connection, run.id, "complete")
        except BaseException as exc:
            code = (
                exc.code
                if isinstance(exc, EvidraError)
                else "CANCELLED"
                if isinstance(exc, asyncio.CancelledError)
                else "CONVERSATION_FAILED"
            )
            causes: list[dict[str, str | None]] = []
            termination_reason = None
            cause: BaseException | None = exc
            while cause is not None and len(causes) < 8:
                causes.append({"type": type(cause).__name__, "code": getattr(cause, "code", None)})
                if isinstance(cause, GenerationIncomplete):
                    termination_reason = cause.termination_reason
                    causes[-1]["termination_reason"] = termination_reason
                cause = cause.__cause__
            logging.getLogger("evidra.conversations").warning(
                json.dumps(
                    {
                        "operation": "conversation",
                        "run_id": run.id,
                        "profile_id": run.profile.id,
                        "code": code,
                        "causes": causes,
                    }
                )
            )
            # Diagnostic state can survive revocation; it never promotes or adds research text.
            with self.scopes.database.transaction() as connection:
                connection.execute(
                    "UPDATE conversation_runs SET "
                    "payload=json_set(payload,'$.state',?,'$.error',?,'$.termination_reason',?) "
                    "WHERE id=?",
                    (
                        "CANCELLED" if code == "CANCELLED" else "FAILED",
                        code,
                        termination_reason,
                        run.id,
                    ),
                )
                self._event(
                    connection, run.id, "cancelled" if code == "CANCELLED" else "failed", code=code
                )

    def cancel(self, context: ScopeContext, run_id: str) -> CancelReceipt:
        # Cancellation returns no source/model content and remains possible after invalidation.
        with self.scopes.guarded(context, capability="commit") as connection:
            row = connection.execute(
                "SELECT r.payload FROM conversation_runs r JOIN conversations c ON "
                "c.id=r.conversation_id WHERE r.id=? AND c.notebook_id=? AND c.snapshot_id=?",
                (run_id, context.notebook_id, context.snapshot_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Run not found in this snapshot.")
            run = RunRecord.model_validate_json(row[0])
        active = self.tasks.get(run_id)
        if active:
            active[1].set()
            active[0].cancel()
        elif run.state == "PREPARED":
            run = run.model_copy(update={"state": "CANCELLED", "error": "CANCELLED"})
            with self.scopes.guarded(context, capability="commit") as connection:
                self._save(connection, run)
                self._event(connection, run.id, "cancelled", code="CANCELLED")
        return CancelReceipt(id=run.id, state=run.state)

    def events(self, context: ScopeContext, run_id: str, cursor: int) -> EventPage:
        run = self.read(context, run_id)
        with self.scopes.guarded(context, capability=context.capability) as connection:
            rows = connection.execute(
                "SELECT payload FROM conversation_events WHERE run_id=? AND cursor>? ORDER BY "
                "cursor LIMIT 8",
                (run_id, cursor),
            ).fetchall()
            events = [RunEvent.model_validate_json(row[0]) for row in rows]
            return EventPage(
                items=events, cursor=events[-1].cursor if events else cursor, state=run.state
            )

    async def close(self) -> None:
        tasks = list(self.tasks.values())
        for task, cancel in tasks:
            cancel.set()
            task.cancel()
        await asyncio.gather(*(task for task, _ in tasks), return_exceptions=True)
