"""SQLite consent, reservations and secret boundaries; HTTP observes actual sends."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal

import httpx
import pytest
from fastapi.testclient import TestClient as FastAPITestClient
from test_providers import collect, profile_data, stream
from test_runtime_notebooks import HEADERS
from test_runtime_notebooks import make_app as runtime_app


def make_app(tmp_path):
    return runtime_app(tmp_path, [0.0])


def TestClient(app):
    return FastAPITestClient(app, base_url="http://127.0.0.1:49200")


def setup(tmp_path, client):
    services = client.app.state.services
    assert hasattr(services, "providers"), "scoped provider service missing"
    notebook = client.post(
        "/v1/notebooks",
        headers=HEADERS,
        json={"name": "Synthetic", "idempotency_key": "provider-test"},
    ).json()
    context = services.scopes.resolve(
        services.scopes.principal, notebook["id"], notebook["initial_snapshot_id"], "commit"
    )
    return services, context


def write_profile(client, kind="openai", **fields):
    response = client.put(
        "/v1/providers/profiles/fixture-profile",
        headers=HEADERS,
        json={"spec": profile_data(kind) | fields, "expected_revision": 0, "idempotency_key": "p"},
    )
    assert response.status_code == 200, response.text
    return response.json()


@pytest.mark.parametrize(
    "spec",
    [
        {"base_url": "http://example.test"},
        {"base_url": "http://127.0.0.1:23119"},
        {"base_url": "http://user:secret@127.0.0.1"},
        {"model": "model:cloud"},
        {"cloud": True},
        {"purpose": "embedding", "adapter": "openai_compatible"},
    ],
)
def test_local_profile_rejects_egress_and_cloud_before_any_http(tmp_path, spec):
    with TestClient(make_app(tmp_path)) as client:
        setup(tmp_path, client)
        response = client.put(
            "/v1/providers/profiles/fixture-profile",
            headers=HEADERS,
            json={
                "spec": profile_data("ollama") | spec,
                "expected_revision": 0,
                "idempotency_key": "p",
            },
        )
        assert response.status_code == 422


async def test_consent_exact_endpoint_categories_and_revocation_guard_send(tmp_path):
    from evidra.domain.errors import EvidraError

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        from evidra.providers.models import GenerationRequest
        from evidra.providers.usage import CallIdentity

        profile = write_profile(client)
        consent_path = f"/v1/notebooks/{context.notebook_id}/providers/fixture-profile/consent"
        initial_consent = client.get(consent_path, headers=HEADERS)
        assert initial_consent.status_code == 200
        assert not initial_consent.json()["granted"] and initial_consent.json()["revision"] == 0
        services.providers.secrets.set("fixture-profile", "synthetic-key", memory_only=True)
        calls = []

        async def boundary(request):
            calls.append(request)
            return httpx.Response(200, text=stream("openai"))

        async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as transport:
            services.providers.client = transport
            request = GenerationRequest(
                messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32
            )
            for expected in ["API_BLOCKED", "CONSENT_REQUIRED", None]:
                identity = CallIdentity(
                    call_id=expected or "allowed", job_id="job", session_id="session"
                )
                if expected:
                    with pytest.raises(EvidraError) as exc:
                        await collect(
                            services.providers.generate(
                                context, profile["id"], request, asyncio.Event(), identity=identity
                            )
                        )
                    assert exc.value.code == expected
                    assert calls == []
                else:
                    assert (
                        await collect(
                            services.providers.generate(
                                context, profile["id"], request, asyncio.Event(), identity=identity
                            )
                        )
                    )[-1].kind == "final"
                if expected == "API_BLOCKED":
                    response = client.put(
                        "/v1/providers/settings",
                        headers=HEADERS,
                        json={
                            "block_paid_apis": False,
                            "expected_revision": 0,
                            "idempotency_key": "unblock",
                        },
                    )
                    assert response.status_code == 200
                if expected == "CONSENT_REQUIRED":
                    response = client.put(
                        f"/v1/notebooks/{context.notebook_id}/providers/fixture-profile/consent",
                        headers=HEADERS,
                        json={
                            "categories": ["excerpts"],
                            "granted": True,
                            "expected_revision": 0,
                            "profile_revision": 1,
                            "idempotency_key": "consent",
                        },
                    )
                    assert response.status_code == 200, response.text
            assert len(calls) == 1
            with pytest.raises(EvidraError) as exc:
                await collect(
                    services.providers.generate(
                        context,
                        profile["id"],
                        request.model_copy(update={"categories": frozenset({"metadata"})}),
                        asyncio.Event(),
                        identity=CallIdentity(
                            call_id="no-metadata", job_id="job", session_id="session"
                        ),
                    )
                )
            assert exc.value.code == "CONSENT_REQUIRED" and len(calls) == 1
            # Profile revision changes invalidate consent, even for the same host.
            response = client.put(
                "/v1/providers/profiles/fixture-profile",
                headers=HEADERS,
                json={
                    "spec": profile_data("openai"),
                    "expected_revision": 1,
                    "idempotency_key": "p2",
                },
            )
            assert response.status_code == 200
            with pytest.raises(EvidraError) as exc:
                await collect(
                    services.providers.generate(
                        context,
                        profile["id"],
                        request,
                        asyncio.Event(),
                        identity=CallIdentity(
                            call_id="changed", job_id="job", session_id="session"
                        ),
                    )
                )
            assert exc.value.code == "CONSENT_REQUIRED" and len(calls) == 1


def test_reservation_atomic_caps_unknown_cost_and_billing_persistence(tmp_path):
    from evidra.domain.errors import EvidraError

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        from evidra.providers.models import PriceConfig
        from evidra.providers.usage import BudgetWrite, CallIdentity, InputBound

        profile = write_profile(client)
        ledger = services.providers.usage

        def identity(i):
            return CallIdentity(call_id=i, job_id="job", session_id="session")

        ledger.set_budget(
            context,
            BudgetWrite(
                kind="session",
                identity="session",
                currency="USD",
                ceiling=Decimal("0.000020"),
                expected_revision=0,
                idempotency_key="b",
            ),
        )
        with pytest.raises(EvidraError) as exc:
            ledger.reserve(context, profile["id"], identity("unknown"), 4, None)
        assert exc.value.code == "PRICE_UNKNOWN"
        ledger.add_price(
            PriceConfig(
                version="synthetic-1",
                adapter="openai",
                model="fixture-model",
                currency="USD",
                effective_date="2026-09-06",
                source="synthetic fixture; not production pricing",
                input_per_million="1",
                output_per_million="2",
            )
        )
        with pytest.raises(EvidraError) as exc:
            ledger.reserve(context, profile["id"], identity("unbounded"), 4, None)
        assert exc.value.code == "TOKEN_BOUND_REQUIRED"
        bound = InputBound(
            tokens=8, provenance="PROVIDER_REPORTED", source="synthetic exact fixture"
        )

        def reserve(i):
            try:
                return ledger.reserve(context, profile["id"], identity(i), 4, bound).state
            except EvidraError as exc:
                return exc.code

        with ThreadPoolExecutor(max_workers=2) as pool:
            outcomes = list(pool.map(reserve, ["first", "second"]))
        assert sorted(outcomes) == ["BUDGET_EXCEEDED", "RESERVED"]
        call = "first" if outcomes[0] == "RESERVED" else "second"
        ledger.mark_sent(call)
        ledger.finish(call, None, None, error="PROVIDER_TIMEOUT")
        row = ledger.read(context, call)
        assert row.state == "BILLING_UNKNOWN" and row.cost is None
        assert row.reserved == Decimal("0.000016")
        assert reserve("third") == "BUDGET_EXCEEDED"
        services.database.backup(tmp_path / "usage-backup.sqlite3")
        import sqlite3

        with sqlite3.connect(tmp_path / "usage-backup.sqlite3") as db:
            assert (
                db.execute("SELECT state FROM provider_calls WHERE call_id=?", (call,)).fetchone()[
                    0
                ]
                == "BILLING_UNKNOWN"
            )


def test_memory_secret_and_failed_keyring_do_not_enter_sqlite_or_backup(tmp_path):
    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client)
        from evidra.security.secrets import SecretStore

        class LockedKeyring:
            def set_password(self, *args):
                raise RuntimeError("sensitive-keyring-diagnostic")

        secrets = SecretStore("synthetic-profile", backend=LockedKeyring())
        receipt = secrets.set("fixture-profile", "super-sensitive-key")
        assert receipt.storage == "MEMORY_ONLY" and receipt.code == "KEYRING_UNAVAILABLE"
        assert secrets.get("fixture-profile") == "super-sensitive-key"
        assert "super-sensitive-key" not in repr(receipt)
        services.database.backup(tmp_path / "clean-backup.sqlite3")
        assert b"super-sensitive-key" not in (tmp_path / "clean-backup.sqlite3").read_bytes()
        secrets.clear()
        assert secrets.get("fixture-profile") is None


@pytest.mark.parametrize(
    "boundary",
    [
        "timeout_after_usage",
        "scope_revoked",
        "cancel_after_usage",
        "malformed_shape",
        "unexpected_failure",
    ],
)
async def test_post_send_failure_preserves_billing_and_never_yields_final(
    tmp_path, boundary, caplog
):
    from evidra.domain.errors import EvidraError
    from evidra.providers.models import GenerationRequest
    from evidra.providers.usage import CallIdentity

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client, "lm_studio")
        cancel = asyncio.Event()

        class Bytes(httpx.AsyncByteStream):
            async def __aiter__(self):
                yield b'data: {"choices":[],"usage":{"prompt_tokens":8,"completion_tokens":4}}\n\n'
                if boundary == "timeout_after_usage":
                    raise httpx.ReadTimeout("synthetic sensitive text")
                if boundary == "unexpected_failure":
                    raise RuntimeError("synthetic sensitive text")
                if boundary == "malformed_shape":
                    yield b'data: {"choices":[{"delta":null}]}\n\n'
                    return
                if boundary == "scope_revoked":
                    with services.database.transaction() as db:
                        db.execute(
                            "UPDATE notebooks SET revision=revision+1 WHERE id=?",
                            (context.notebook_id,),
                        )
                else:
                    cancel.set()
                yield (
                    b'data: {"choices":[{"index":0,"delta":{"content":"draft"},'
                    b'"finish_reason":null}]}\n\n'
                )

        sends = []

        def transport(request):
            sends.append(request)
            return httpx.Response(200, stream=Bytes())

        async with httpx.AsyncClient(transport=httpx.MockTransport(transport)) as http:
            services.providers.client = http
            with pytest.raises(EvidraError) as exc:
                await collect(
                    services.providers.generate(
                        context,
                        "fixture-profile",
                        GenerationRequest(
                            messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32
                        ),
                        cancel,
                        identity=CallIdentity(call_id="uncertain", job_id="j", session_id="s"),
                    )
                )
            assert (
                exc.value.code
                == {
                    "timeout_after_usage": "PROVIDER_TIMEOUT",
                    "scope_revoked": "SCOPE_STALE",
                    "cancel_after_usage": "CANCELLED",
                    "malformed_shape": "PROVIDER_PROTOCOL_ERROR",
                    "unexpected_failure": "PROVIDER_INTERNAL_ERROR",
                }[boundary]
            )
            assert len(sends) == 1
            assert "synthetic sensitive text" not in caplog.text
            if boundary == "timeout_after_usage":
                assert "ReadTimeout" in caplog.text and "uncertain" in caplog.text
            if boundary in ["malformed_shape", "unexpected_failure"]:
                assert exc.value.code in caplog.text
                assert isinstance(
                    exc.value.__cause__,
                    TypeError if boundary == "malformed_shape" else RuntimeError,
                )
            with services.database.transaction() as db:
                row = db.execute(
                    "SELECT state,input_tokens,output_tokens,cost,error FROM provider_calls "
                    "WHERE call_id=?",
                    ("uncertain",),
                ).fetchone()
                assert row["state"] == "BILLING_UNKNOWN" and row["cost"] is None
                assert row["error"] == exc.value.code


@pytest.mark.parametrize("offset", [0, 1])
async def test_catalog_cloud_observation_blocks_local_send_without_disabling_manual_config(
    tmp_path,
    offset,
):
    from evidra.domain.errors import EvidraError
    from evidra.providers.models import GenerationRequest
    from evidra.providers.usage import CallIdentity

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client, "ollama")
        calls = []

        def boundary(request):
            calls.append(request)
            return httpx.Response(
                200,
                json={"models": [{"name": "fixture-model", "remote_host": "https://cloud.test"}]},
            )

        async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as transport:
            services.providers.client = transport
            page = await services.providers.catalog("fixture-profile", offset, 50)
            if offset == 0:
                assert page.items[0].cloud
            with pytest.raises(EvidraError) as exc:
                await collect(
                    services.providers.generate(
                        context,
                        "fixture-profile",
                        GenerationRequest(
                            messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32
                        ),
                        asyncio.Event(),
                        identity=CallIdentity(call_id="cloud", job_id="j", session_id="s"),
                    )
                )
            assert exc.value.code == "LOCAL_CLOUD_MODEL" and len(calls) == 1


def test_one_explicit_repair_and_reconciliation_keep_call_job_session_identity(tmp_path):
    from evidra.domain.errors import EvidraError
    from evidra.providers.usage import CallIdentity

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client)
        ledger = services.providers.usage
        original = CallIdentity(call_id="original", job_id="job", session_id="session")
        ledger.reserve(context, "fixture-profile", original, 32, None)
        ledger.mark_sent("original")
        ledger.finish("original", 8, 4, error="INVALID_OUTPUT")
        repair = CallIdentity(
            call_id="repair", job_id="job", session_id="session", repair_of="original"
        )
        result = ledger.reserve(context, "fixture-profile", repair, 32, None)
        assert (
            result.repair_of == "original"
            and result.job_id == "job"
            and result.session_id == "session"
        )
        with pytest.raises(EvidraError) as exc:
            ledger.reserve(
                context,
                "fixture-profile",
                repair.model_copy(update={"call_id": "repair2"}),
                32,
                None,
            )
        assert exc.value.code == "REPAIR_NOT_ALLOWED"
        with pytest.raises(EvidraError) as exc:
            ledger.reserve(context, "fixture-profile", original, 32, None)
        assert exc.value.code == "CALL_ALREADY_EXISTS"


async def test_rate_limit_pauses_profile_until_explicit_revisioned_resume(tmp_path):
    from evidra.domain.errors import EvidraError
    from evidra.providers.models import GenerationRequest
    from evidra.providers.usage import CallIdentity

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client, "ollama")
        sends = []

        def transport(request):
            sends.append(request)
            return httpx.Response(429)

        async with httpx.AsyncClient(transport=httpx.MockTransport(transport)) as http:
            services.providers.client = http
            for call_id in ["first", "second"]:
                with pytest.raises(EvidraError) as exc:
                    await collect(
                        services.providers.generate(
                            context,
                            "fixture-profile",
                            GenerationRequest(
                                messages=[{"role": "user", "text": "synthetic"}],
                                max_output_tokens=32,
                            ),
                            asyncio.Event(),
                            identity=CallIdentity(call_id=call_id, job_id="j", session_id="s"),
                        )
                    )
                assert exc.value.code == "RATE_LIMITED"
            assert len(sends) == 1
            profile = services.providers.profiles.get("fixture-profile")
            assert profile.paused_code == "RATE_LIMITED"
            resumed = client.post(
                "/v1/providers/profiles/fixture-profile/resume",
                headers=HEADERS,
                json={"expected_revision": profile.revision, "idempotency_key": "resume"},
            )
            assert resumed.status_code == 200 and resumed.json()["paused_code"] is None


async def test_real_loopback_http_reconciles_before_final_and_releases_database_lock(tmp_path):
    from evidra.providers.models import GenerationRequest
    from evidra.providers.usage import CallIdentity

    received = asyncio.Event()
    release = asyncio.Event()
    requests = []

    async def server(reader, writer):
        header = await reader.readuntil(b"\r\n\r\n")
        size = int(
            next(
                line.split(b":", 1)[1]
                for line in header.split(b"\r\n")
                if line.lower().startswith(b"content-length:")
            )
        )
        requests.append(await reader.readexactly(size))
        received.set()
        await release.wait()
        content = stream("ollama").encode()
        writer.write(
            b"HTTP/1.1 200 OK\r\nContent-Type: application/x-ndjson\r\nContent-Length: "
            + str(len(content)).encode()
            + b"\r\nConnection: close\r\n\r\n"
            + content
        )
        await writer.drain()
        writer.close()
        await writer.wait_closed()

    async with await asyncio.start_server(server, "127.0.0.1", 0) as listener:
        port = listener.sockets[0].getsockname()[1]
        with TestClient(make_app(tmp_path)) as client:
            services, context = setup(tmp_path, client)
            write_profile(client, "ollama", base_url=f"http://127.0.0.1:{port}")

            async def consume():
                async for event in services.providers.generate(
                    context,
                    "fixture-profile",
                    GenerationRequest(
                        messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32
                    ),
                    asyncio.Event(),
                    identity=CallIdentity(call_id="real-http", job_id="j", session_id="s"),
                ):
                    if event.kind == "final":
                        assert (
                            services.providers.usage.read(context, "real-http").state == "CONFIRMED"
                        )

            pending = asyncio.create_task(consume())
            await asyncio.wait_for(received.wait(), 2)
            # Real SQLite is writable while the actual loopback response is pending.
            with services.database.transaction() as db:
                assert db.execute("SELECT state FROM provider_calls").fetchone()[0] == "SENT"
            release.set()
            await asyncio.wait_for(pending, 2)
            assert len(requests) == 1


@pytest.mark.parametrize("cleanup_failure", [False, True])
async def test_registry_shutdown_finishes_inflight_accounting_before_database_close(
    tmp_path, cleanup_failure, caplog
):
    from evidra.domain.errors import EvidraError
    from evidra.providers.models import GenerationRequest
    from evidra.providers.usage import CallIdentity

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client, "ollama")
        entered = asyncio.Event()

        async def boundary(request):
            entered.set()
            try:
                await asyncio.Event().wait()
            finally:
                if cleanup_failure:
                    raise RuntimeError("sensitive synthetic cleanup detail")

        async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as http:
            services.providers.client = http
            pending = asyncio.create_task(
                collect(
                    services.providers.generate(
                        context,
                        "fixture-profile",
                        GenerationRequest(
                            messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32
                        ),
                        asyncio.Event(),
                        identity=CallIdentity(call_id="shutdown", job_id="j", session_id="s"),
                    )
                )
            )
            await asyncio.wait_for(entered.wait(), 2)
            if cleanup_failure:
                with pytest.raises(EvidraError) as failed:
                    await services.providers.close()
                assert failed.value.code == "PROVIDER_SHUTDOWN_FAILED"
                assert failed.value.__cause__.code == "PROVIDER_CLEANUP_FAILED"
                assert isinstance(failed.value.__cause__.__cause__, RuntimeError)
                assert "RuntimeError" in caplog.text
                assert "sensitive synthetic cleanup detail" not in caplog.text
            else:
                await services.providers.close()
            row = services.providers.usage.read(context, "shutdown")
            assert row.state == "BILLING_UNKNOWN"
            with pytest.raises((EvidraError, asyncio.CancelledError)) as cancelled:
                await pending
            if cleanup_failure:
                assert cancelled.value.code == row.error == "PROVIDER_CLEANUP_FAILED"


@pytest.mark.parametrize(
    "stop_after,cleanup_failure",
    [
        ("draft", False),
        ("draft", True),
        ("terminal", False),
        ("terminal", True),
        ("cancel_cleanup", False),
    ],
)
async def test_registry_aclosing_owns_response_cleanup_before_accounting(
    tmp_path, cleanup_failure, stop_after, caplog
):
    from contextlib import aclosing

    from evidra.domain.errors import EvidraError
    from evidra.providers.models import GenerationRequest
    from evidra.providers.usage import CallIdentity

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        kind = "ollama" if stop_after == "draft" else "lm_studio"
        write_profile(client, kind)
        closed = asyncio.Event()
        cancel, cleanup_started, release_cleanup = (asyncio.Event() for _ in range(3))
        cancel_during_cleanup = stop_after == "cancel_cleanup"
        final_events = []

        class Bytes(httpx.AsyncByteStream):
            async def __aiter__(self):
                if stop_after == "draft":
                    yield b'{"message":{"content":"synthetic draft"},"done":false}\n'
                else:
                    # [DONE] ends compatible generation before the HTTP body is exhausted.
                    yield stream(kind).encode()
                await asyncio.Event().wait()

            async def aclose(self):
                # The original call must remain pending until its HTTP response closes.
                assert services.providers.usage.read(context, "outer-close").state == "SENT"
                if cancel_during_cleanup:
                    cleanup_started.set()
                    await release_cleanup.wait()
                closed.set()
                if cleanup_failure:
                    raise RuntimeError("sensitive response cleanup detail")

        response = httpx.Response(200, stream=Bytes())
        await services.providers.client.aclose()
        async with httpx.AsyncClient(
            transport=httpx.MockTransport(lambda request: response)
        ) as http:
            services.providers.client = http

            async def consume_one():
                async with aclosing(
                    services.providers.generate(
                        context,
                        "fixture-profile",
                        GenerationRequest(
                            messages=[{"role": "user", "text": "synthetic"}], max_output_tokens=32
                        ),
                        cancel,
                        identity=CallIdentity(call_id="outer-close", job_id="j", session_id="s"),
                    )
                ) as events:
                    if stop_after == "draft":
                        assert (await anext(events)).kind == "delta"
                    else:
                        async for event in events:
                            if event.kind == "final":
                                final_events.append(event)

            if cancel_during_cleanup:
                pending = asyncio.create_task(consume_one())
                try:
                    await asyncio.wait_for(cleanup_started.wait(), 2)
                    assert not final_events
                    cancel.set()
                    release_cleanup.set()
                    with pytest.raises(EvidraError) as cancelled:
                        await asyncio.wait_for(pending, 2)
                    assert cancelled.value.code == "CANCELLED"
                finally:
                    release_cleanup.set()
                    await asyncio.gather(pending, return_exceptions=True)
            elif cleanup_failure:
                with pytest.raises(EvidraError) as failed:
                    await consume_one()
                assert failed.value.code == "PROVIDER_CLEANUP_FAILED"
                assert isinstance(failed.value.__cause__, RuntimeError)
                assert "sensitive response cleanup detail" not in caplog.text
            else:
                await consume_one()
            assert closed.is_set() and response.is_closed
            row = services.providers.usage.read(context, "outer-close")
            if stop_after != "draft":
                # Native terminal usage is known even if local response cleanup fails.
                assert row.state == "CONFIRMED" and (row.input_tokens, row.output_tokens) == (8, 4)
                expected = (
                    "CANCELLED"
                    if cancel_during_cleanup
                    else "PROVIDER_CLEANUP_FAILED"
                    if cleanup_failure
                    else None
                )
                assert row.error == expected
                assert len(final_events) == (0 if cleanup_failure or cancel_during_cleanup else 1)
            else:
                assert row.state == "BILLING_UNKNOWN" and not final_events
                assert row.error == ("PROVIDER_CLEANUP_FAILED" if cleanup_failure else "CANCELLED")
            await services.providers.close()


@pytest.mark.parametrize("operation", ["catalog", "embed"])
@pytest.mark.parametrize("cleanup_failure", [False, True])
async def test_registry_shutdown_drains_non_generation_before_teardown(
    tmp_path, operation, cleanup_failure
):
    from evidra.domain.errors import EvidraError

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        spec = profile_data("ollama")
        if operation == "embed":
            spec["purpose"] = "embedding"
            spec["capabilities"]["embeddings"] = {"supported": True, "provenance": "USER_DECLARED"}
        write_profile(client, **spec)
        registry = services.providers
        registry.secrets.set("fixture-profile", "synthetic-memory-key", memory_only=True)
        entered, cleanup_started, release_cleanup = (asyncio.Event() for _ in range(3))
        requests, completed_cleanup = [], []

        async def boundary(request):
            requests.append(request)
            entered.set()
            try:
                await asyncio.Event().wait()
            finally:
                cleanup_started.set()
                await release_cleanup.wait()
                # Cancellation cleanup must finish while the actual SQLite DB is still open.
                with services.database.transaction() as db:
                    completed_cleanup.append(
                        db.execute("SELECT COUNT(*) FROM notebooks").fetchone()[0]
                    )
                if cleanup_failure:
                    raise RuntimeError("synthetic cancellation cleanup failure")

        async def invoke():
            if operation == "catalog":
                return await registry.catalog("fixture-profile", 0, 50)
            return await registry.embed(context, "fixture-profile", ["synthetic"])

        await registry.client.aclose()
        async with httpx.AsyncClient(transport=httpx.MockTransport(boundary)) as http:
            registry.client = http
            pending = asyncio.create_task(invoke())
            closing = None
            observed_cleanup = asyncio.create_task(cleanup_started.wait())
            try:
                await asyncio.wait_for(entered.wait(), 2)
                closing = asyncio.create_task(registry.close())
                await asyncio.wait(
                    [closing, observed_cleanup], timeout=2, return_when=asyncio.FIRST_COMPLETED
                )
                assert cleanup_started.is_set(), "close returned without cancelling the operation"
                assert not closing.done(), "close did not await operation cleanup"
                assert not http.is_closed
                assert registry.secrets.get("fixture-profile") == "synthetic-memory-key"
                with pytest.raises(EvidraError) as stopped:
                    await invoke()
                assert stopped.value.code == "ENGINE_STOPPING" and len(requests) == 1
                release_cleanup.set()
                if cleanup_failure:
                    with pytest.raises(EvidraError) as failed:
                        await asyncio.wait_for(closing, 2)
                    assert failed.value.code == "PROVIDER_SHUTDOWN_FAILED"
                    assert isinstance(failed.value.__cause__, RuntimeError)
                    assert str(failed.value.__cause__) == "synthetic cancellation cleanup failure"
                    with pytest.raises(RuntimeError):
                        await pending
                else:
                    await asyncio.wait_for(closing, 2)
                    with pytest.raises(asyncio.CancelledError):
                        await pending
                assert completed_cleanup == [1] and http.is_closed
                assert registry.secrets.get("fixture-profile") is None
                services.database.close()
                # A closed DB turns any attempted authorization/persistence into DATABASE_CLOSED.
                # The required ENGINE_STOPPING proves entry is refused before those reads/writes.
                with pytest.raises(EvidraError) as stopped:
                    await invoke()
                assert stopped.value.code == "ENGINE_STOPPING"
                assert pending.done() and len(requests) == 1
            finally:
                release_cleanup.set()
                if not pending.done():
                    pending.cancel()
                await asyncio.gather(
                    pending,
                    observed_cleanup,
                    *([closing] if closing else []),
                    return_exceptions=True,
                )


def test_secret_write_revisions_idempotency_and_keyring_to_memory_deletion(tmp_path):
    from evidra.security.secrets import SecretStore

    with TestClient(make_app(tmp_path)) as client:
        services, context = setup(tmp_path, client)
        write_profile(client)

        class OwnedKeyring:
            def __init__(self):
                self.values = {}

            def set_password(self, service, account, value):
                self.values[(service, account)] = value

            def get_password(self, service, account):
                return self.values.get((service, account))

            def delete_password(self, service, account):
                del self.values[(service, account)]

        backend = OwnedKeyring()
        services.providers.secrets = SecretStore("profile-a", services.database, backend=backend)
        path = "/v1/providers/profiles/fixture-profile/secret"
        first = {
            "value": "first-synthetic",
            "memory_only": False,
            "expected_revision": 0,
            "idempotency_key": "secret1",
        }
        response = client.put(path, headers=HEADERS, json=first)
        assert response.status_code == 200, response.text
        assert response.json()["revision"] == 1
        assert client.put(path, headers=HEADERS, json=first).json() == response.json()
        conflict = client.put(path, headers=HEADERS, json=first | {"value": "changed"})
        assert conflict.status_code == 409
        second = client.put(
            path,
            headers=HEADERS,
            json={
                "value": "second-synthetic",
                "memory_only": True,
                "expected_revision": 1,
                "idempotency_key": "secret2",
            },
        )
        assert second.status_code == 200 and second.json()["storage"] == "MEMORY_ONLY"
        assert not backend.values
        assert services.providers.secrets.get("fixture-profile") == "second-synthetic"
        services.database.backup(tmp_path / "secrets-backup.sqlite3")
        data = (tmp_path / "secrets-backup.sqlite3").read_bytes()
        assert b"first-synthetic" not in data and b"second-synthetic" not in data
