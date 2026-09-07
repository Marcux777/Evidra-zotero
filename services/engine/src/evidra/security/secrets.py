"""Owned keyring entries or process memory; metadata never contains credentials."""

import hashlib
import hmac
from threading import RLock
from typing import Any, Literal

import keyring
from pydantic import Field, SecretStr

from evidra.domain.errors import EvidraError
from evidra.providers.models import StrictModel
from evidra.providers.profiles import revision
from evidra.storage.database import Database


class SecretReceipt(StrictModel):
    storage: Literal["KEYRING", "MEMORY_ONLY", "MISSING"]
    revision: int = 0
    code: str | None = None
    cause_type: str | None = None
    keyring_entry_may_remain: bool = False


class SecretDelete(StrictModel):
    expected_revision: int = Field(ge=0)
    idempotency_key: str = Field(min_length=1, max_length=200)


class SecretWrite(SecretDelete):
    value: SecretStr
    memory_only: bool = False


class SecretStore:
    def __init__(self, owner: str, database: Database | None = None, *, backend: Any = None):
        self.owner, self.database, self.backend = owner, database, backend
        self._memory: dict[str, str] = {}
        self._known: dict[str, tuple[SecretReceipt, str | None, bool]] = {}
        self._service = "Evidra/" + hashlib.sha256(owner.encode()).hexdigest()
        self._lock = RLock()

    def _keyring(self) -> Any:
        return self.backend if self.backend is not None else keyring.get_keyring()

    def _meta(self, profile_id: str) -> tuple[SecretReceipt, str | None, bool]:
        if self.database:
            with self.database.transaction() as connection:
                row = connection.execute(
                    "SELECT * FROM provider_secrets WHERE owner=? AND profile_id=?",
                    (self.owner, profile_id),
                ).fetchone()
                if row:
                    return (
                        SecretReceipt.model_validate_json(row["receipt"]),
                        row["operation_key"],
                        bool(row["keyring_present"]),
                    )
        return self._known.get(profile_id, (SecretReceipt(storage="MISSING"), None, False))

    def _record(
        self,
        profile_id: str,
        receipt: SecretReceipt,
        operation_key: str | None,
        keyring_present: bool,
    ) -> SecretReceipt:
        if self.database:
            with self.database.transaction() as connection:
                connection.execute(
                    "INSERT INTO provider_secrets VALUES(?,?,?,?,?) ON CONFLICT("
                    "owner,profile_id) DO UPDATE SET receipt=excluded.receipt,"
                    "operation_key=excluded.operation_key,keyring_present=excluded.keyring_present",
                    (
                        self.owner,
                        profile_id,
                        receipt.model_dump_json(),
                        operation_key,
                        int(keyring_present),
                    ),
                )
        self._known[profile_id] = (receipt, operation_key, keyring_present)
        return receipt

    def status(self, profile_id: str) -> SecretReceipt:
        receipt, _, _ = self._meta(profile_id)
        if receipt.storage == "MEMORY_ONLY" and profile_id not in self._memory:
            return receipt.model_copy(update={"storage": "MISSING", "code": "MEMORY_SECRET_LOST"})
        return receipt

    def _delete_keyring(self, profile_id: str) -> None:
        try:
            self._keyring().delete_password(self._service, profile_id)
        except Exception as exc:
            raise EvidraError(
                "KEYRING_UNAVAILABLE", "Unable to delete the owned keyring entry."
            ) from exc

    def set(
        self,
        profile_id: str,
        value: str,
        *,
        memory_only: bool = False,
        expected_revision: int | None = None,
        idempotency_key: str | None = None,
    ) -> SecretReceipt:
        if not value or len(value) > 8192:
            raise EvidraError("INVALID_REQUEST", "Invalid secret.")
        with self._lock:
            previous, previous_key, present = self._meta(profile_id)
            if idempotency_key and previous_key == idempotency_key:
                stored = self.get(profile_id)
                same_mode = memory_only == (previous.storage == "MEMORY_ONLY")
                if previous.code == "KEYRING_UNAVAILABLE" and not memory_only:
                    same_mode = True
                if stored is None or not hmac.compare_digest(stored, value) or not same_mode:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "The secret operation differs.")
                return previous
            if expected_revision is not None:
                revision(previous.revision, expected_revision)
            next_revision = previous.revision + 1
            if memory_only:
                if present:
                    self._delete_keyring(profile_id)
                self._memory[profile_id] = value
                return self._record(
                    profile_id,
                    SecretReceipt(storage="MEMORY_ONLY", revision=next_revision),
                    idempotency_key,
                    False,
                )
            try:
                self._keyring().set_password(self._service, profile_id, value)
            except Exception as exc:
                # A backend may fail after a partial write. Never claim the keyring is empty.
                self._memory[profile_id] = value
                return self._record(
                    profile_id,
                    SecretReceipt(
                        storage="MEMORY_ONLY",
                        revision=next_revision,
                        code="KEYRING_UNAVAILABLE",
                        cause_type=type(exc).__name__,
                        keyring_entry_may_remain=True,
                    ),
                    idempotency_key,
                    True,
                )
            self._memory.pop(profile_id, None)
            return self._record(
                profile_id,
                SecretReceipt(storage="KEYRING", revision=next_revision),
                idempotency_key,
                True,
            )

    def get(self, profile_id: str) -> str | None:
        receipt, _, _ = self._meta(profile_id)
        if receipt.storage == "MEMORY_ONLY":
            return self._memory.get(profile_id)
        if receipt.storage == "KEYRING":
            try:
                value: str | None = self._keyring().get_password(self._service, profile_id)
                return value
            except Exception as exc:
                raise EvidraError(
                    "KEYRING_UNAVAILABLE", "Unable to read the configured keyring secret."
                ) from exc
        return None

    def delete(
        self,
        profile_id: str,
        *,
        expected_revision: int | None = None,
        idempotency_key: str | None = None,
    ) -> SecretReceipt:
        with self._lock:
            previous, previous_key, present = self._meta(profile_id)
            if idempotency_key and previous_key == idempotency_key:
                if previous.storage != "MISSING":
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "The secret operation differs.")
                return previous
            if expected_revision is not None:
                revision(previous.revision, expected_revision)
            if present:
                self._delete_keyring(profile_id)
            self._memory.pop(profile_id, None)
            return self._record(
                profile_id,
                SecretReceipt(storage="MISSING", revision=previous.revision + 1),
                idempotency_key,
                False,
            )

    def clear(self) -> None:
        self._memory.clear()
