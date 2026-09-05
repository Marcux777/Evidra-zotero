from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotebookCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str = Field(min_length=1, max_length=200)
    idempotency_key: str = Field(min_length=1, max_length=200)


class Notebook(BaseModel):
    model_config = ConfigDict(frozen=True)
    id: str
    profile_instance_id: str
    name: str
    created_at: datetime
    updated_at: datetime
    revision: int
    initial_snapshot_id: str


class NotebookPage(BaseModel):
    items: list[Notebook]
    offset: int
    limit: int
    total: int


class HealthStatus(BaseModel):
    status: str = "ok"
    protocol_version: int = 1


class RuntimeStatus(HealthStatus):
    profile_instance_id: str
    heartbeat_interval_seconds: int = 10
    heartbeat_timeout_seconds: int = 30
