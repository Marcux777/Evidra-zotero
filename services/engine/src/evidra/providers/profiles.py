"""Revisioned, idempotent settings and notebook/endpoint-bound consent."""

import hashlib
import json
import sqlite3
from typing import Any

from pydantic import Field

from evidra.domain.errors import EvidraError
from evidra.providers.models import (
    ContentCategory,
    ProfilePage,
    ProfileWrite,
    ProviderProfile,
    StrictModel,
)
from evidra.scope.service import ScopeContext, ScopeService


class Settings(StrictModel):
    block_paid_apis: bool = True
    revision: int = 0


class SettingsWrite(StrictModel):
    block_paid_apis: bool
    expected_revision: int = Field(ge=0)
    idempotency_key: str = Field(min_length=1, max_length=200)


class ResumeWrite(StrictModel):
    expected_revision: int = Field(ge=1)
    idempotency_key: str = Field(min_length=1, max_length=200)


class ConsentWrite(StrictModel):
    categories: frozenset[ContentCategory]
    granted: bool
    profile_revision: int = Field(ge=1)
    expected_revision: int = Field(ge=0)
    idempotency_key: str = Field(min_length=1, max_length=200)


class Consent(StrictModel):
    notebook_id: str
    profile_id: str
    profile_revision: int
    revision: int
    categories: frozenset[ContentCategory]
    granted: bool
    base_url: str


def replay(
    connection: sqlite3.Connection, owner: str, target: str, body: Any
) -> dict[str, Any] | None:
    raw = json.dumps(body.model_dump(mode="json"), sort_keys=True)
    fingerprint = hashlib.sha256(raw.encode()).hexdigest()
    row = connection.execute(
        "SELECT * FROM provider_writes WHERE owner=? AND target=? AND idempotency_key=?",
        (owner, target, body.idempotency_key),
    ).fetchone()
    if row:
        if row["fingerprint"] != fingerprint:
            raise EvidraError("IDEMPOTENCY_CONFLICT", "The idempotency key has different content.")
        result: dict[str, Any] = json.loads(row["result"])
        return result
    return None


def remember(
    connection: sqlite3.Connection, owner: str, target: str, body: Any, result: StrictModel
) -> None:
    raw = json.dumps(body.model_dump(mode="json"), sort_keys=True)
    connection.execute(
        "INSERT INTO provider_writes VALUES(?,?,?,?,?)",
        (
            owner,
            target,
            body.idempotency_key,
            hashlib.sha256(raw.encode()).hexdigest(),
            result.model_dump_json(),
        ),
    )


def revision(actual: int, expected: int) -> None:
    if actual != expected:
        raise EvidraError("REVISION_CONFLICT", "The provider configuration has changed.")


class ProfileService:
    def __init__(self, scopes: ScopeService):
        self.scopes = scopes
        self.database = scopes.database
        self.owner = scopes.principal.profile_instance_id

    def load(self, connection: sqlite3.Connection, profile_id: str) -> ProviderProfile:
        row = connection.execute(
            "SELECT * FROM provider_profiles WHERE id=? AND owner=?", (profile_id, self.owner)
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Provider profile not found.")
        return ProviderProfile(
            **json.loads(row["spec"]),
            id=row["id"],
            revision=row["revision"],
            paused_code=row["paused_code"],
        )

    def get(self, profile_id: str) -> ProviderProfile:
        self.scopes.authorize(self.scopes.principal)
        with self.database.transaction() as connection:
            return self.load(connection, profile_id)

    def list(self, offset: int, limit: int) -> ProfilePage:
        self.scopes.authorize(self.scopes.principal)
        with self.database.transaction() as connection:
            rows = connection.execute(
                "SELECT id FROM provider_profiles WHERE owner=? ORDER BY id LIMIT ? OFFSET ?",
                (self.owner, limit, offset),
            )
            items = [self.load(connection, r["id"]) for r in rows]
            total = connection.execute(
                "SELECT COUNT(*) FROM provider_profiles WHERE owner=?", (self.owner,)
            ).fetchone()[0]
            return ProfilePage(items=items, offset=offset, limit=limit, total=total)

    def write(self, profile_id: str, body: ProfileWrite) -> ProviderProfile:
        self.scopes.authorize(self.scopes.principal, "manage")
        with self.database.transaction() as connection:
            target = "profile:" + profile_id
            previous = replay(connection, self.owner, target, body)
            if previous:
                return ProviderProfile(**previous)
            row = connection.execute(
                "SELECT owner,revision,paused_code FROM provider_profiles WHERE id=?", (profile_id,)
            ).fetchone()
            if row is not None and row["owner"] != self.owner:
                raise EvidraError("FORBIDDEN", "Profile belongs to another principal.")
            revision(row["revision"] if row else 0, body.expected_revision)
            # The settings UI may declare capabilities; it cannot forge probe evidence.
            if any(
                c.provenance not in ["USER_DECLARED", "UNSUPPORTED"]
                for c in body.spec.capabilities.values()
            ):
                raise EvidraError("INVALID_REQUEST", "Capability evidence must be server-owned.")
            result = ProviderProfile(
                **body.spec.model_dump(),
                id=profile_id,
                revision=body.expected_revision + 1,
                paused_code=row["paused_code"] if row else None,
            )
            connection.execute(
                "INSERT INTO provider_profiles(id,owner,revision,spec) VALUES(?,?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,spec=excluded.spec",
                (profile_id, self.owner, result.revision, body.spec.model_dump_json()),
            )
            remember(connection, self.owner, target, body, result)
            return result

    def pause(self, profile_id: str, code: str) -> None:
        with self.database.transaction() as connection:
            connection.execute(
                "UPDATE provider_profiles SET paused_code=?,revision=revision+1 "
                "WHERE id=? AND owner=?",
                (code, profile_id, self.owner),
            )

    def resume(self, profile_id: str, body: ResumeWrite) -> ProviderProfile:
        self.scopes.authorize(self.scopes.principal, "manage")
        with self.database.transaction() as connection:
            target = "resume:" + profile_id
            previous = replay(connection, self.owner, target, body)
            if previous:
                return ProviderProfile(**previous)
            profile = self.load(connection, profile_id)
            revision(profile.revision, body.expected_revision)
            connection.execute(
                "UPDATE provider_profiles SET paused_code=NULL,revision=revision+1 "
                "WHERE id=? AND owner=?",
                (profile_id, self.owner),
            )
            result = self.load(connection, profile_id)
            remember(connection, self.owner, target, body, result)
            return result

    def settings(self, connection: sqlite3.Connection) -> Settings:
        row = connection.execute(
            "SELECT * FROM provider_settings WHERE owner=?", (self.owner,)
        ).fetchone()
        return (
            Settings(block_paid_apis=bool(row["block_paid_apis"]), revision=row["revision"])
            if row
            else Settings()
        )

    def read_settings(self) -> Settings:
        self.scopes.authorize(self.scopes.principal)
        with self.database.transaction() as connection:
            return self.settings(connection)

    def write_settings(self, body: SettingsWrite) -> Settings:
        self.scopes.authorize(self.scopes.principal, "manage")
        with self.database.transaction() as connection:
            previous = replay(connection, self.owner, "settings", body)
            if previous:
                return Settings(**previous)
            revision(self.settings(connection).revision, body.expected_revision)
            result = Settings(
                block_paid_apis=body.block_paid_apis, revision=body.expected_revision + 1
            )
            connection.execute(
                "INSERT INTO provider_settings VALUES(?,?,?) ON CONFLICT(owner) "
                "DO UPDATE SET revision=excluded.revision,block_paid_apis=excluded.block_paid_apis",
                (self.owner, result.revision, int(result.block_paid_apis)),
            )
            remember(connection, self.owner, "settings", body, result)
            return result

    def read_consent(self, notebook_id: str, profile_id: str) -> Consent:
        self.scopes.authorize(self.scopes.principal)
        with self.database.transaction() as connection:
            self.scopes.notebook(connection, self.scopes.principal, notebook_id)
            profile = self.load(connection, profile_id)
            row = connection.execute(
                "SELECT * FROM provider_consents WHERE notebook_id=? AND profile_id=?",
                (notebook_id, profile_id),
            ).fetchone()
            return Consent(
                notebook_id=notebook_id,
                profile_id=profile_id,
                profile_revision=profile.revision,
                revision=row["revision"] if row else 0,
                categories=frozenset(json.loads(row["categories"])) if row else frozenset(),
                granted=bool(
                    row and row["granted"] and row["profile_revision"] == profile.revision
                ),
                base_url=profile.base_url,
            )

    def consent(self, notebook_id: str, profile_id: str, body: ConsentWrite) -> Consent:
        self.scopes.authorize(self.scopes.principal, "manage")
        with self.database.transaction() as connection:
            self.scopes.notebook(connection, self.scopes.principal, notebook_id)
            profile = self.load(connection, profile_id)
            target = f"consent:{notebook_id}:{profile_id}"
            previous = replay(connection, self.owner, target, body)
            if previous:
                return Consent(**previous)
            revision(profile.revision, body.profile_revision)
            row = connection.execute(
                "SELECT revision FROM provider_consents WHERE notebook_id=? AND profile_id=?",
                (notebook_id, profile_id),
            ).fetchone()
            revision(row["revision"] if row else 0, body.expected_revision)
            result = Consent(
                notebook_id=notebook_id,
                profile_id=profile_id,
                profile_revision=profile.revision,
                revision=body.expected_revision + 1,
                categories=body.categories,
                granted=body.granted,
                base_url=profile.base_url,
            )
            connection.execute(
                "INSERT INTO provider_consents VALUES(?,?,?,?,?,?) ON CONFLICT("
                "notebook_id,profile_id) DO UPDATE SET revision=excluded.revision,"
                "profile_revision=excluded.profile_revision,categories=excluded.categories,"
                "granted=excluded.granted",
                (
                    notebook_id,
                    profile_id,
                    result.revision,
                    profile.revision,
                    json.dumps(sorted(body.categories)),
                    int(body.granted),
                ),
            )
            remember(connection, self.owner, target, body, result)
            return result

    def authorize(
        self, context: ScopeContext, profile_id: str, categories: frozenset[ContentCategory]
    ) -> ProviderProfile:
        with self.scopes.guarded(context, capability=context.capability) as connection:
            profile = self.load(connection, profile_id)
            observed = connection.execute(
                "SELECT cloud FROM provider_model_observations WHERE "
                "profile_id=? AND base_url=? AND model=?",
                (profile_id, profile.base_url, profile.model),
            ).fetchone()
            if profile.mode == "LOCAL" and observed and observed["cloud"]:
                raise EvidraError(
                    "LOCAL_CLOUD_MODEL", "The runner reports this model as cloud-based."
                )
            if profile.paused_code:
                raise EvidraError(profile.paused_code, "This provider profile is paused.")
            if profile.mode == "API":
                if self.settings(connection).block_paid_apis:
                    raise EvidraError(
                        "API_BLOCKED", "API profiles are blocked, including free tiers."
                    )
                row = connection.execute(
                    "SELECT * FROM provider_consents WHERE notebook_id=? AND profile_id=?",
                    (context.notebook_id, profile_id),
                ).fetchone()
                if (
                    row is None
                    or not row["granted"]
                    or row["profile_revision"] != profile.revision
                    or not categories <= set(json.loads(row["categories"]))
                ):
                    raise EvidraError(
                        "CONSENT_REQUIRED", "Consent is required for these content categories."
                    )
            return profile
