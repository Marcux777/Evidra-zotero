"""Single owned SQLite connection with serialized explicit transactions."""

import sqlite3
from collections.abc import Iterator
from contextlib import closing, contextmanager
from importlib.resources import files
from pathlib import Path
from threading import RLock

from evidra.domain.errors import EvidraError

SCHEMA_VERSION = 5


class Database:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = RLock()
        self._closed = False
        path.parent.mkdir(parents=True, exist_ok=True)
        self._connection = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        self._connection.row_factory = sqlite3.Row
        try:
            version = self._connection.execute("PRAGMA user_version").fetchone()[0]
            if version > SCHEMA_VERSION:
                raise EvidraError("FUTURE_SCHEMA", "The database requires a newer engine.")
            self._connection.execute("PRAGMA foreign_keys=ON")
            self._connection.execute("PRAGMA journal_mode=WAL")
            if version < SCHEMA_VERSION:
                if version > 0:
                    self.backup(path.with_suffix(f".before-v{SCHEMA_VERSION}.sqlite3"))
                with self.transaction() as connection:
                    for target in range(version + 1, SCHEMA_VERSION + 1):
                        migration = files("evidra.storage.migrations").joinpath(
                            f"{target:03d}_initial.sql"
                        )
                        statement = ""
                        for line in migration.read_text(encoding="utf-8").splitlines(True):
                            statement += line
                            if sqlite3.complete_statement(statement):
                                connection.execute(statement)
                                statement = ""
                        if statement.strip():
                            raise EvidraError("INVALID_MIGRATION", "Incomplete schema migration.")
                        connection.execute(f"PRAGMA user_version={target}")
        except BaseException:
            self.close()
            raise

    @contextmanager
    def transaction(self) -> Iterator[sqlite3.Connection]:
        with self._lock:
            if self._closed:
                raise EvidraError("DATABASE_CLOSED", "The database has been closed.")
            self._connection.execute("BEGIN IMMEDIATE")
            try:
                yield self._connection
                self._connection.execute("COMMIT")
            except BaseException:
                self._connection.execute("ROLLBACK")
                raise

    def backup(self, destination: Path) -> None:
        with self._lock:
            if destination.resolve() == self.path.resolve() or destination.exists():
                raise EvidraError("INVALID_BACKUP", "The backup destination must be new.")
            with closing(sqlite3.connect(destination)) as backup:
                self._connection.backup(backup)

    def close(self) -> None:
        with self._lock:
            if not self._closed:
                self._connection.close()
                self._closed = True
