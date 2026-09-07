"""Generate schemas without starting services or reading a Zotero profile."""
import json
from pathlib import Path

from evidra.api.app import create_app
from evidra.distribution import EngineManifest
from evidra.domain.sources import SelectionSpec
from evidra.domain.documents import DocumentCommand
from evidra.conversations.commands import ConversationCommand, ProviderCommand
from evidra.extraction.commands import MatrixCommand
from evidra.jobs.models import JobCommand
from evidra.research.commands import ResearchCommand
from evidra.mcp.commands import McpCommand, McpSetup
from evidra.conversations.models import EventPage
from evidra.providers.models import EmbeddingBatch, GenerationEvent, GenerationRequest
from evidra.security.runtime import RuntimeSettings
from pydantic import SecretStr, TypeAdapter

destination = Path("packages/contracts/generated")
destination.mkdir(parents=True, exist_ok=True)
settings = RuntimeSettings(
    data_dir=Path(".local/schema-only").resolve(),
    profile_instance_id="schema-only",
    session_token=SecretStr("0" * 64),
    port=49152,
)
schema = create_app(settings).openapi()
for provider_model in (GenerationEvent, GenerationRequest, EmbeddingBatch, EventPage, McpSetup):
    provider_schema = provider_model.model_json_schema()
    schema["components"]["schemas"].update(provider_schema.pop("$defs", {}))
    schema["components"]["schemas"][provider_model.__name__] = provider_schema
documents = TypeAdapter(DocumentCommand).json_schema()
(destination / "document-command.schema.json").write_text(json.dumps(documents, indent=2) + "\n", encoding="utf-8")
schema["components"]["schemas"].update(documents.pop("$defs"))
schema["components"]["schemas"]["DocumentCommand"] = documents
for name, command in [("conversation", ConversationCommand), ("provider", ProviderCommand), ("matrix", MatrixCommand), ("job", JobCommand), ("research", ResearchCommand), ("mcp", McpCommand)]:
    commands = TypeAdapter(command).json_schema()
    (destination / f"{name}-command.schema.json").write_text(json.dumps(commands, indent=2) + "\n", encoding="utf-8")
    schema["components"]["schemas"].update(commands.pop("$defs"))
    schema["components"]["schemas"][name.title() + "Command"] = commands
(destination / "selection.schema.json").write_text(json.dumps(SelectionSpec.model_json_schema(), indent=2) + "\n", encoding="utf-8")
manifest = EngineManifest.model_json_schema()
(destination / "engine-manifest.schema.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
schema["components"]["schemas"]["EngineManifest"] = EngineManifest.model_json_schema()
definitions = schema["components"]["schemas"]["EngineManifest"].pop("$defs")
schema["components"]["schemas"].update(definitions)
text = json.dumps(schema, ensure_ascii=False, indent=2).replace("#/$defs/", "#/components/schemas/")
(destination / "openapi.json").write_text(text + "\n", encoding="utf-8")
