"""Generate schemas without starting services or reading a Zotero profile."""
import json
from pathlib import Path

from evidra.api.app import create_app
from evidra.distribution import EngineManifest
from evidra.domain.sources import SelectionSpec
from evidra.security.runtime import RuntimeSettings
from pydantic import SecretStr

destination = Path("packages/contracts/generated")
destination.mkdir(parents=True, exist_ok=True)
settings = RuntimeSettings(
    data_dir=Path(".local/schema-only").resolve(),
    profile_instance_id="schema-only",
    session_token=SecretStr("0" * 64),
    port=49152,
)
schema = create_app(settings).openapi()
(destination / "selection.schema.json").write_text(json.dumps(SelectionSpec.model_json_schema(), indent=2) + "\n", encoding="utf-8")
manifest = EngineManifest.model_json_schema()
(destination / "engine-manifest.schema.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
schema["components"]["schemas"]["EngineManifest"] = EngineManifest.model_json_schema()
definitions = schema["components"]["schemas"]["EngineManifest"].pop("$defs")
schema["components"]["schemas"].update(definitions)
text = json.dumps(schema, ensure_ascii=False, indent=2).replace("#/$defs/", "#/components/schemas/")
(destination / "openapi.json").write_text(text + "\n", encoding="utf-8")
