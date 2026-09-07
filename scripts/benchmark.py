"""Declared synthetic corpus; real SQLite indexing/scoped retrieval; no model calls."""

import argparse
import hashlib
import json
import platform
import sys
import time
import traceback
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
import win32api
import win32process
from fastapi.testclient import TestClient
from run_tools import ROOT, build_inputs, new_run, sha256, write_json

sys.path.insert(0, str(ROOT / "services/engine/tests"))
sys.path.insert(0, str(ROOT / "services/engine/src"))
from evidra.conversations.models import VectorGeneration
from evidra.documents.chunking import POLICY_VERSION
from evidra.documents.ingestion import persist_pages
from evidra.domain.documents import ParsedPage, SearchRequest
from evidra.domain.sources import SourceContent, content_version
from evidra.providers.models import EmbeddingBatch
from evidra.retrieval.fusion import fuse
from test_runtime_notebooks import HEADERS, make_app
from test_scopes import setup, source, sync


def checked(response, status):
    if response.status_code != status:
        raise RuntimeError(f"HTTP {response.status_code}: {response.text}")
    return response.json()


def metric(values):
    return {
        "samples": len(values),
        "p50_seconds": float(np.percentile(values, 50)),
        "p95_seconds": float(np.percentile(values, 95)),
        "max_seconds": max(values),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    parser.add_argument("--hardware", type=Path, required=True)
    args = parser.parse_args()
    directory = new_run("benchmarks", args.output)
    inputs = build_inputs()
    write_json(directory / "inputs-before.json", inputs)
    report = {
        "status": "RUNNING",
        "classification": "SYNTHETIC_FIXTURE_REAL_CPU_RETRIEVAL",
        "hardware": json.loads(args.hardware.read_text(encoding="utf-8-sig")),
        "hardware_receipt_sha256": sha256(args.hardware),
        "python": sys.version,
        "platform": platform.platform(),
        "seed": 7,
        "papers": 1000,
        "pages_per_paper": 50,
        "target_chunks": 50000,
        "vector_dimensions": 384,
        "vector_dtype": "little-endian float32",
        "vectors": "Seeded random unit vectors; no learned embeddings or semantic quality claim",
        "parser": "Synthetic pages via production persist_pages; PDFium measured in package smoke",
        "query_embedding": "NOT_RUN: no model calls",
        "provider_first_token": "NOT_RUN: no model calls",
        "provider_completion": "NOT_RUN: no model calls",
        "ui_progress_latency": "NOT_MEASURED: headless CPU benchmark",
        "warmups": 3,
        "measured_queries": 30,
        "samples": [],
    }
    database_dir = directory / "synthetic-data"
    try:
        app = make_app(database_dir, [0.0])
        with TestClient(app, base_url="http://127.0.0.1:49200") as client:
            notebook = setup(client)
            items = []
            for index in range(1000):
                item = source(key=f"B{index:07d}")
                item["contents"] = [
                    {"key": item["identity"]["item_key"], "kind": "abstract", "version": "1"}
                ]
                items.append(item)
            start = time.perf_counter()
            stage = None
            for offset in range(0, 1000, 100):
                stage = checked(
                    sync(
                        client,
                        notebook,
                        items[offset : offset + 100],
                        stage_id=stage,
                        final=offset == 900,
                    ),
                    200,
                )["stage_id"]
            synced_at = time.perf_counter()
            preview = checked(
                client.post(
                    f"/v1/notebooks/{notebook}/sources/preview",
                    headers=HEADERS,
                    json={"selection": {}, "stage_id": stage},
                ),
                200,
            )
            previewed_at = time.perf_counter()
            snapshot = checked(
                client.post(
                    f"/v1/notebooks/{notebook}/snapshots",
                    headers=HEADERS,
                    json={
                        "preview_id": preview["id"],
                        "expected_revision": 1,
                        "idempotency_key": "benchmark-snapshot",
                    },
                ),
                201,
            )
            report["selection"] = {
                "sync_seconds": synced_at - start,
                "resolve_seconds": previewed_at - synced_at,
                "snapshot_seconds": time.perf_counter() - previewed_at,
            }
            services = app.state.services
            context = services.scopes.resolve(
                services.scopes.principal, notebook, snapshot["id"], capability="commit"
            )
            assert len(context.source_ids) == 1000
            corpus_digest = hashlib.sha256()
            byte_count = 0
            started = time.perf_counter()
            with services.scopes.guarded(context, capability="commit") as connection:
                for index, item in enumerate(items):
                    key = item["identity"]["item_key"]
                    source_id = next(
                        row[0]
                        for row in connection.execute(
                            "SELECT id FROM sources WHERE item_key=?", (key,)
                        )
                    )
                    document_id, version_id = f"document-{index}", f"version-{index}"
                    pages = []
                    for page in range(50):
                        text = (
                            f"Synthetic paper {index}, page {page}. Topic topic{index % 30}. "
                            f"Method method{page % 5}. Accuracy {70 + index % 29} percent. "
                            "Evidence is synthetic and has no clinical meaning."
                        )
                        encoded = text.encode("utf-8")
                        corpus_digest.update(encoded)
                        byte_count += len(encoded)
                        pages.append(
                            ParsedPage(
                                page_index=page,
                                page_label=str(page + 1),
                                original_text=text,
                                quality="TEXT",
                                crop_box=None,
                                media_box=None,
                                bbox=None,
                                rotation=None,
                                char_boxes=[],
                                mapping_verified=False,
                            )
                        )
                    raw = "\n".join(p.original_text for p in pages).encode()
                    digest = hashlib.sha256(raw).hexdigest()
                    content = SourceContent.model_validate(item["contents"][0])
                    connection.execute(
                        "INSERT INTO documents (id,source_id,content_key,"
                        "content_version,source_kind,path,file_identity,revision,coverage) "
                        "VALUES(?,?,?,?,'abstract','',?,1,'FULL_TEXT_PARSED')",
                        (document_id, source_id, key, content_version(content), digest),
                    )
                    connection.execute(
                        "INSERT INTO document_versions VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                        (
                            version_id,
                            document_id,
                            digest,
                            "structured-benchmark-pages-v1",
                            POLICY_VERSION,
                            digest,
                            "FULL_TEXT_PARSED",
                            50,
                            50,
                            len(raw),
                            datetime.now(UTC).isoformat(),
                        ),
                    )
                    persist_pages(connection, version_id, pages)
                    connection.execute(
                        "UPDATE documents SET current_version_id=? WHERE id=?",
                        (version_id, document_id),
                    )
                ids = [
                    r[0] for r in connection.execute("SELECT id FROM document_chunks ORDER BY id")
                ]
            assert len(ids) == 50000
            report["indexing"] = {
                "seconds": time.perf_counter() - started,
                "pages": 50000,
                "chunks": len(ids),
                "original_text_bytes": byte_count,
                "corpus_sha256": corpus_digest.hexdigest(),
            }
            checked(
                client.put(
                    "/v1/providers/profiles/benchmark",
                    headers=HEADERS,
                    json={
                        "expected_revision": 0,
                        "idempotency_key": "benchmark-profile",
                        "spec": {
                            "adapter": "ollama",
                            "mode": "LOCAL",
                            "purpose": "embedding",
                            "base_url": "http://127.0.0.1:11434",
                            "model": "synthetic-seed7",
                            "capabilities": {
                                "embeddings": {"supported": True, "provenance": "USER_DECLARED"}
                            },
                        },
                    },
                ),
                200,
            )
            generation = VectorGeneration(
                id="benchmark-vectors",
                profile_id="benchmark",
                model="synthetic-seed7",
                digest="seed7-v1",
                dimensions=384,
                normalized=True,
                chunks=50000,
            )
            rng = np.random.default_rng(7)
            started = time.perf_counter()
            with services.scopes.guarded(context, capability="commit") as connection:
                connection.execute(
                    "INSERT INTO vector_generations VALUES(?,?,?,?,?,?,1)",
                    (
                        generation.id,
                        notebook,
                        snapshot["id"],
                        "benchmark",
                        1,
                        generation.model_dump_json(),
                    ),
                )
                for offset in range(0, len(ids), 64):
                    selected = ids[offset : offset + 64]
                    vectors = rng.standard_normal((len(selected), 384), dtype=np.float32)
                    vectors /= np.linalg.norm(vectors, axis=1, keepdims=True)
                    connection.execute(
                        "INSERT INTO vector_blocks VALUES(?,?,?)",
                        (generation.id, offset, vectors.astype("<f4").tobytes()),
                    )
                    connection.executemany(
                        "INSERT INTO vector_members VALUES(?,?,?,?)",
                        [
                            (generation.id, identity, offset, n)
                            for n, identity in enumerate(selected)
                        ],
                    )
            report["synthetic_vector_storage_seconds"] = time.perf_counter() - started
            for number in range(-3, 30):
                query = f"topic{number % 30} method{number % 5}"
                vector = rng.standard_normal(384, dtype=np.float32)
                vector /= np.linalg.norm(vector)
                batch = EmbeddingBatch(
                    model=generation.model,
                    digest=generation.digest,
                    dimensions=384,
                    normalized=True,
                    vectors=[vector.tolist()],
                )
                began = time.perf_counter()
                lexical = services.lexical.search(context, SearchRequest(query=query, limit=40))
                lexical_end = time.perf_counter()
                ranked = services.vectors.search_batch(context, "benchmark", batch)
                vector_end = time.perf_counter()
                fused = fuse([hit.evidence_id for hit in lexical.items], ranked)
                finished = time.perf_counter()
                assert lexical.total > 0 and len(ranked) == 40 and fused
                if number >= 0:
                    report["samples"].append(
                        {
                            "query": query,
                            "lexical_seconds": lexical_end - began,
                            "vector_seconds": vector_end - lexical_end,
                            "fusion_seconds": finished - vector_end,
                            "combined_seconds": finished - began,
                            "lexical_total": lexical.total,
                            "lexical_ids": [hit.evidence_id for hit in lexical.items],
                            "vector_ids": ranked,
                        }
                    )
                if number % 10 == 0:
                    print(json.dumps({"phase": "retrieval", "query": number}), flush=True)
            report["retrieval"] = {
                name: metric([s[name + "_seconds"] for s in report["samples"]])
                for name in ("lexical", "vector", "fusion", "combined")
            }
            report["warm_p95_under_2_seconds"] = report["retrieval"]["combined"]["p95_seconds"] < 2
        restart_start = time.perf_counter()
        restarted = make_app(database_dir, [0.0])
        with TestClient(restarted, base_url="http://127.0.0.1:49200") as client:
            services = restarted.state.services
            # New bridge sessions must revalidate native availability before any read.
            for offset in range(0, 1000, 100):
                checked(sync(client, notebook, items[offset:offset + 100],
                    purpose="revalidation", snapshot_id=snapshot["id"]), 200)
            context = services.scopes.resolve(services.scopes.principal, notebook, snapshot["id"])
            page = services.lexical.search(context, SearchRequest(query="topic7 method2", limit=40))
            with services.database.transaction() as connection:
                count = connection.execute("SELECT count(*) FROM document_chunks").fetchone()[0]
            if count != 50000 or page.total == 0:
                raise RuntimeError(f"RESUME_FAILED: chunks={count}, scoped_hits={page.total}")
            report["resume"] = {
                "seconds": time.perf_counter() - restart_start,
                "chunks": count,
                "retrieved": len(page.items),
            }
        report["memory"] = win32process.GetProcessMemoryInfo(win32api.GetCurrentProcess())
        report["memory_scope"] = (
            "Python/TestClient/NumPy benchmark process; excludes the PDFium smoke child"
        )
        report["index_files"] = [
            {"file": p.name, "bytes": p.stat().st_size}
            for p in database_dir.rglob("*")
            if p.is_file()
        ]
        after = build_inputs()
        write_json(directory / "inputs-after.json", after)
        if inputs["files"] != after["files"]:
            raise RuntimeError("BENCHMARK_INPUTS_CHANGED")
        report["status"] = "MEASURED"
    except BaseException as exc:
        (directory / "logs/failure.log").write_text(traceback.format_exc(), encoding="utf-8")
        report.update(status="FAILED", failure={"type": type(exc).__name__, "message": str(exc)})
        raise
    finally:
        write_json(directory / "report.json", report)
        print(
            json.dumps({"report": str(directory / "report.json"), "status": report["status"]}),
            flush=True,
        )


if __name__ == "__main__":
    main()
