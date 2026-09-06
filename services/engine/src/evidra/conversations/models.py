"""Bounded conversation contracts. Models select evidence IDs, never source coordinates."""

from typing import Literal

from pydantic import Field

from evidra.domain.documents import Rectangle
from evidra.providers.models import ContentCategory, OllamaOptions, ProviderProfile, StrictModel


class ConversationCreate(StrictModel):
    idempotency_key: str = Field(min_length=1, max_length=200)


class ConversationRecord(StrictModel):
    id: str
    notebook_id: str
    snapshot_id: str
    revision: int


class ConversationPage(StrictModel):
    items: list[ConversationRecord]
    offset: int
    limit: int
    total: int


class RunPrepare(ConversationCreate):
    expected_revision: int = Field(ge=0)
    profile_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,100}$")
    question: str = Field(min_length=1, max_length=2000)
    context_tokens: int = Field(ge=1024, le=1_000_000)
    max_output_tokens: int = Field(ge=1, le=32768)
    ollama_options: OllamaOptions | None = None
    embedding_profile_id: str | None = Field(default=None, pattern=r"^[a-zA-Z0-9_-]{1,100}$")
    preview_operation_id: str | None = Field(default=None, pattern=r"^[a-f0-9]{32}$")


class Citation(StrictModel):
    evidence_id: str = Field(min_length=1, max_length=64)
    excerpt: str = Field(min_length=1, max_length=4000)


class Claim(StrictModel):
    text: str = Field(min_length=1, max_length=8000)
    kind: Literal["source", "general", "visual_proposal"]
    evidence: list[Citation] = Field(max_length=12)


class Answer(StrictModel):
    claims: list[Claim] = Field(min_length=1, max_length=32)


class ContextEvidence(StrictModel):
    id: str
    excerpt: str
    document_version_id: str
    source_id: str
    content_key: str
    source_kind: str
    start: int
    end: int


class ContextPreview(StrictModel):
    evidence: list[ContextEvidence]
    documents_retrieved: int
    documents_used: int
    candidates: int
    excluded_overlap: int
    excluded_budget: int
    excluded_limit: int
    estimated_input_tokens: int
    estimate_method: Literal["utf8-bytes-plus-overhead-v1"] = "utf8-bytes-plus-overhead-v1"
    context_tokens: int
    max_output_tokens: int
    history_messages: int
    history: list[dict[str, str]]
    system: str
    prompt: str
    coverage: Literal["RETRIEVED_CHUNKS_ONLY"] = "RETRIEVED_CHUNKS_ONLY"


class VisualProvenance(StrictModel):
    operation_id: str
    document_version_id: str
    page_index: int
    region: Rectangle
    sha256: str
    destination: str
    interpretation: Literal["PROPOSED_REQUIRES_HUMAN_REVIEW"] = "PROPOSED_REQUIRES_HUMAN_REVIEW"


class RunRecord(StrictModel):
    id: str
    conversation_id: str
    conversation_revision: int
    state: Literal["PREPARED", "RUNNING", "COMPLETE", "FAILED", "CANCELLED"]
    profile: ProviderProfile
    ollama_options: OllamaOptions | None = None
    question: str
    prompt_version: Literal["conversation-v1"] = "conversation-v1"
    context: ContextPreview
    categories: frozenset[ContentCategory]
    visual: VisualProvenance | None = None
    output: Answer | None = None
    error: str | None = None
    created_at: str
    anchor_status: Literal["VERIFIED_EXISTENCE_ONLY"] = "VERIFIED_EXISTENCE_ONLY"
    support_status: Literal["PROPOSED"] = "PROPOSED"
    human_review: Literal["NOT_REVIEWED"] = "NOT_REVIEWED"


class RunSummary(StrictModel):
    id: str
    question: str
    state: str
    model: str
    error: str | None


class RunPage(StrictModel):
    items: list[RunSummary]
    offset: int
    limit: int
    total: int


class RunEvent(StrictModel):
    cursor: int
    kind: Literal["draft", "complete", "failed", "cancelled"]
    text: str | None = None
    code: str | None = None


class EventPage(StrictModel):
    items: list[RunEvent]
    cursor: int
    state: str


class VectorBuild(ConversationCreate):
    profile_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,100}$")


class VectorGeneration(StrictModel):
    id: str
    profile_id: str
    model: str
    digest: str | None
    dimensions: int
    normalized: bool
    chunks: int


class VectorJob(StrictModel):
    id: str
    state: Literal["RUNNING", "COMPLETE", "FAILED", "CANCELLED"]
    processed: int
    total: int
    error: str | None = None
    generation: VectorGeneration | None = None
