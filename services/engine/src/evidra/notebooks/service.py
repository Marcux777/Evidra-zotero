import secrets
from datetime import UTC, datetime
from uuid import UUID

from evidra.domain.errors import EvidraError
from evidra.domain.models import Notebook, NotebookCreate, NotebookPage
from evidra.security.runtime import BridgeSession
from evidra.storage.database import Database


class NotebookService:
    def __init__(
        self, database: Database, session: BridgeSession, profile_instance_id: str
    ) -> None:
        self.database = database
        self.session = session
        self.profile_instance_id = profile_instance_id

    def create(self, request: NotebookCreate) -> Notebook:
        with self.database.transaction() as connection:
            self.session.assert_current()
            existing = connection.execute(
                "SELECT * FROM notebooks WHERE profile_instance_id=? AND idempotency_key=?",
                (self.profile_instance_id, request.idempotency_key),
            ).fetchone()
            if existing:
                if existing["name"] != request.name:
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "The creation key is already used.")
                return Notebook.model_validate(dict(existing))
            notebook_id = str(UUID(bytes=secrets.token_bytes(16), version=4))
            snapshot_id = str(UUID(bytes=secrets.token_bytes(16), version=4))
            now = datetime.now(UTC).isoformat()
            connection.execute(
                "INSERT INTO notebooks VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    notebook_id,
                    self.profile_instance_id,
                    request.name,
                    request.idempotency_key,
                    now,
                    now,
                    1,
                    snapshot_id,
                ),
            )
            connection.execute(
                "INSERT INTO snapshots VALUES (?, ?, ?, ?, ?)",
                (snapshot_id, self.profile_instance_id, notebook_id, now, 1),
            )
            row = connection.execute(
                "SELECT * FROM notebooks WHERE id=?", (notebook_id,)
            ).fetchone()
            return Notebook.model_validate(dict(row))

    def get(self, notebook_id: str) -> Notebook:
        with self.database.transaction() as connection:
            self.session.assert_current()
            row = connection.execute(
                "SELECT * FROM notebooks WHERE profile_instance_id=? AND id=?",
                (self.profile_instance_id, notebook_id),
            ).fetchone()
            if row is None:
                raise EvidraError("NOT_FOUND", "Notebook not found.")
            return Notebook.model_validate(dict(row))

    def list(self, offset: int, limit: int) -> NotebookPage:
        with self.database.transaction() as connection:
            self.session.assert_current()
            rows = connection.execute(
                "SELECT * FROM notebooks WHERE profile_instance_id=? ORDER BY created_at, id "
                "LIMIT ? OFFSET ?",
                (self.profile_instance_id, limit, offset),
            ).fetchall()
            total = connection.execute(
                "SELECT COUNT(*) FROM notebooks WHERE profile_instance_id=?",
                (self.profile_instance_id,),
            ).fetchone()[0]
            return NotebookPage(
                items=[Notebook.model_validate(dict(row)) for row in rows],
                offset=offset,
                limit=limit,
                total=total,
            )
