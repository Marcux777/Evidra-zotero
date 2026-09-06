"""Source contracts. Compound local identity is independent of remote group identifiers."""

import hashlib
import json
from datetime import datetime
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from evidra.domain.errors import EvidraError


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class SourceIdentity(StrictModel):
    profile_instance_id: str = Field(min_length=1, max_length=200)
    library_id: int = Field(ge=1)
    item_key: str = Field(min_length=1, max_length=200)

    @property
    def source_id(self) -> str:
        return hashlib.sha256(
            json.dumps(
                [self.profile_instance_id, self.library_id, self.item_key], ensure_ascii=True
            ).encode()
        ).hexdigest()


class SourceContent(StrictModel):
    key: str = Field(min_length=1, max_length=200)
    kind: Literal[
        "pdf",
        "abstract",
        "human_note",
        "human_annotation",
        "ai_artifact",
        "approved_data",
        "text_attachment",
    ]
    role: Literal["unassigned", "principal", "supplement"] = "unassigned"
    title: str = Field(default="", max_length=2000)
    version: str = Field(default="", max_length=200)


class SourceInput(StrictModel):
    identity: SourceIdentity
    version: str = Field(min_length=1, max_length=200)
    title: str = Field(max_length=10000)
    year: int | None = Field(default=None, ge=1, le=9999)
    item_type: str = Field(min_length=1, max_length=200)
    tags: list[str] = Field(default_factory=list, max_length=1000)
    doi: str | None = Field(default=None, max_length=2000)
    remote_library_id: str | None = Field(default=None, max_length=200)
    remote_group_id: int | None = Field(default=None, ge=1)
    contents: list[SourceContent] = Field(default_factory=list, max_length=1000)

    @model_validator(mode="after")
    def distinct_content(self) -> Self:
        if len({c.key for c in self.contents}) != len(self.contents):
            raise ValueError("Duplicate content identity")
        if sum(c.role == "principal" for c in self.contents) > 1:
            raise ValueError("Only one explicitly chosen principal attachment")
        return self


class Source(SourceInput):
    id: str
    version_id: str
    year_state: Literal["known", "missing"]


class SourceSync(StrictModel):
    items: list[SourceInput] = Field(max_length=100)
    purpose: Literal["selection", "revalidation"]
    stage_id: str | None = Field(max_length=200)
    final: bool


class SourcePage(StrictModel):
    items: list[Source]
    offset: int = 0
    limit: int
    total: int
    stage_id: str | None


class Selector(StrictModel):
    kind: Literal["library", "collection", "search", "item"]
    library_id: int = Field(ge=1)
    key: str | None = Field(default=None, max_length=200)


class AttachmentRole(StrictModel):
    identity: SourceIdentity
    key: str = Field(min_length=1, max_length=200)
    role: Literal["unassigned", "principal", "supplement"]


class SelectionSpec(StrictModel):
    selectors: list[Selector] = Field(default_factory=list, max_length=1000)
    include_descendants: bool = False
    year_min: int | None = Field(default=None, ge=1, le=9999)
    year_max: int | None = Field(default=None, ge=1, le=9999)
    item_types: list[str] = Field(default_factory=list, max_length=100)
    tags: list[str] = Field(default_factory=list, max_length=100)
    tag_mode: Literal["AND", "OR"] = "AND"
    pdf_only: bool = False
    include_notes: bool = False
    include_annotations: bool = False
    exclusions: list[SourceIdentity] = Field(default_factory=list, max_length=1000)
    attachment_roles: list[AttachmentRole] = Field(default_factory=list, max_length=1000)

    @model_validator(mode="after")
    def year_order(self) -> Self:
        if self.year_min and self.year_max and self.year_min > self.year_max:
            raise ValueError("Invalid year range")
        keys = [(r.identity.source_id, r.key) for r in self.attachment_roles]
        principal = [r.identity.source_id for r in self.attachment_roles if r.role == "principal"]
        if len(set(keys)) != len(keys) or len(set(principal)) != len(principal):
            raise ValueError("Conflicting attachment roles")
        return self


class PreviewRequest(StrictModel):
    selection: SelectionSpec
    stage_id: str = Field(min_length=1, max_length=200)


class RemovedSource(StrictModel):
    identity: SourceIdentity
    title: str | None
    reason: Literal["excluded", "year", "type", "tags", "pdf", "unavailable"]


class SelectionPreview(StrictModel):
    id: str
    stage_id: str
    notebook_id: str
    expected_revision: int
    selection: SelectionSpec
    items: list[Source]
    removed: list[RemovedSource]
    added: list[str]
    dropped: list[str]
    changed: list[str]
    possible_duplicates: list[list[str]]


class SnapshotCreate(StrictModel):
    preview_id: str = Field(min_length=1, max_length=200)
    expected_revision: int = Field(ge=1)
    idempotency_key: str = Field(min_length=1, max_length=200)


class Snapshot(StrictModel):
    id: str
    notebook_id: str
    revision: int
    created_at: datetime
    selection: SelectionSpec
    member_count: int


class SnapshotPage(StrictModel):
    items: list[Snapshot]
    offset: int
    limit: int
    total: int


class SnapshotSource(StrictModel):
    source: Source
    state: Literal["current", "stale"]


class SnapshotSourcePage(StrictModel):
    items: list[SnapshotSource]
    offset: int
    limit: int
    total: int
    unavailable_count: int


class Invalidation(StrictModel):
    identities: list[SourceIdentity] = Field(max_length=100)
    reason: Literal["changed", "deleted", "missing", "library_missing", "archived"]


class InvalidationResult(StrictModel):
    invalidated_count: int


class Revocation(StrictModel):
    expected_revision: int = Field(ge=1)


class SourceChange(StrictModel):
    revision: int


class IdentityPage(StrictModel):
    items: list[SourceIdentity]
    offset: int
    limit: int
    total: int


def filtered(source: Source, spec: SelectionSpec) -> tuple[Source | None, str | None]:
    if source.identity in spec.exclusions:
        return None, "excluded"
    if (spec.year_min is not None and (source.year is None or source.year < spec.year_min)) or (
        spec.year_max is not None and (source.year is None or source.year > spec.year_max)
    ):
        return None, "year"
    if spec.item_types and source.item_type not in spec.item_types:
        return None, "type"
    if spec.tags:
        matches = [tag in source.tags for tag in spec.tags]
        if not (all(matches) if spec.tag_mode == "AND" else any(matches)):
            return None, "tags"
    if spec.pdf_only and not any(c.kind == "pdf" for c in source.contents):
        return None, "pdf"
    contents = [
        c
        for c in source.contents
        if c.kind != "ai_artifact"
        and (c.kind != "human_note" or spec.include_notes)
        and (c.kind != "human_annotation" or spec.include_annotations)
    ]
    roles = {r.key: r.role for r in spec.attachment_roles if r.identity == source.identity}
    contents = [
        c.model_copy(update={"role": roles.get(c.key, c.role)})
        if c.kind in {"pdf", "text_attachment"}
        else c
        for c in contents
    ]
    if sum(c.role == "principal" for c in contents) > 1:
        raise EvidraError("INVALID_REQUEST", "Select only one principal attachment.")
    return source.model_copy(update={"contents": contents}), None
