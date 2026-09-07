import json
import secrets
import sqlite3
from datetime import UTC, datetime

from evidra.domain.errors import EvidraError
from evidra.extraction.models import FieldDefinition, FieldKind, FormPage, FormVersion, FormWrite
from evidra.providers.models import StrictModel
from evidra.scope.service import ScopeContext, ScopeService


def author(context: ScopeContext) -> str:
    if context.principal.credential_kind == "mcp":
        return f"mcp:{context.principal.connection_id}"
    return f"{context.principal.credential_kind}:{context.principal.profile_instance_id}"


def now() -> str:
    return datetime.now(UTC).isoformat()


def fingerprint(body: StrictModel) -> str:
    return json.dumps(body.model_dump(mode="json"), sort_keys=True, ensure_ascii=False)


def computing_template() -> list[FieldDefinition]:
    entries: list[tuple[str, str, FieldKind]] = [
        ("problem", "Problema", "text"),
        ("method", "Método", "text"),
        ("claimed_contribution", "Contribuição alegada", "text"),
        ("data", "Dados", "list"),
        ("sample_size", "Tamanho da amostra/instâncias", "number"),
        ("split", "Divisão de treino/validação/teste", "text"),
        ("comparators", "Comparadores", "list"),
        ("metrics", "Métricas", "list"),
        ("results", "Resultados com contexto", "experimental_result"),
        ("seeds", "Repetições/seeds", "text"),
        ("ablations", "Ablações", "text"),
        ("statistics", "Estatística reportada", "text"),
        ("author_limitations", "Limitações dos autores", "list"),
        ("reviewer_limitations", "Limitações propostas pelo revisor", "list"),
        ("availability", "Disponibilidade de código/dados", "text"),
    ]
    return [
        FieldDefinition(
            key=k,
            label=label,
            kind=kind,
            question=f"O que o estudo informa sobre {label.lower()}?",
            definition=label,
            rules=["Preservar evidências e contexto; usar estado explícito para ausência."],
            required=False,
        )
        for k, label, kind in entries
    ]


class FormService:
    def __init__(self, scopes: ScopeService) -> None:
        self.scopes = scopes

    def from_connection(
        self, conn: sqlite3.Connection, context: ScopeContext, identity: str
    ) -> FormVersion:
        row = conn.execute(
            "SELECT payload FROM form_versions WHERE id=? AND notebook_id=?",
            (identity, context.notebook_id),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Form version not found.")
        return FormVersion.model_validate_json(row[0])

    def read(self, context: ScopeContext, identity: str) -> FormVersion:
        with self.scopes.guarded(context) as conn:
            return self.from_connection(conn, context, identity)

    def origin(self, conn: sqlite3.Connection, form_id: str, field_key: str) -> str:
        row = conn.execute(
            "SELECT origin_form_version_id FROM form_field_lineage "
            "WHERE form_version_id=? AND field_key=?",
            (form_id, field_key),
        ).fetchone()
        if row is None:
            raise EvidraError("NOT_FOUND", "Field lineage not found.")
        return str(row[0])

    def list(self, context: ScopeContext, offset: int, limit: int) -> FormPage:
        with self.scopes.guarded(context) as conn:
            total = conn.execute(
                "SELECT count(*) FROM form_versions WHERE notebook_id=?", (context.notebook_id,)
            ).fetchone()[0]
            rows = conn.execute(
                "SELECT payload FROM form_versions WHERE notebook_id=? "
                "ORDER BY revision DESC LIMIT ? OFFSET ?",
                (context.notebook_id, limit, offset),
            ).fetchall()
            return FormPage(
                items=[FormVersion.model_validate_json(r[0]) for r in rows],
                offset=offset,
                limit=limit,
                total=total,
            )

    def create(self, context: ScopeContext, body: FormWrite) -> FormVersion:
        with self.scopes.guarded(context, capability="commit") as conn:
            old = conn.execute(
                "SELECT * FROM form_versions WHERE notebook_id=? AND idempotency_key=?",
                (context.notebook_id, body.idempotency_key),
            ).fetchone()
            if old:
                if old["request"] != fingerprint(body):
                    raise EvidraError("IDEMPOTENCY_CONFLICT", "Form request changed.")
                return FormVersion.model_validate_json(old["payload"])
            revision = conn.execute(
                "SELECT coalesce(max(revision),0) FROM form_versions WHERE notebook_id=?",
                (context.notebook_id,),
            ).fetchone()[0]
            if revision != body.expected_revision:
                raise EvidraError("REVISION_CONFLICT", "Active form changed.")
            identity = secrets.token_hex(16)
            latest = conn.execute(
                "SELECT payload FROM form_versions WHERE notebook_id=? "
                "ORDER BY revision DESC LIMIT 1",
                (context.notebook_id,),
            ).fetchone()
            prior = FormVersion.model_validate_json(latest[0]) if latest else None
            prior_fields = {f.key: f for f in prior.fields} if prior else {}
            origins = {
                f.key: prior.field_origins[f.key]
                if prior and prior_fields.get(f.key) == f
                else identity
                for f in body.fields
            }
            form = FormVersion(
                id=identity,
                notebook_id=context.notebook_id,
                revision=revision + 1,
                name=body.name,
                fields=body.fields,
                field_origins=origins,
                author=author(context),
                created_at=now(),
            )
            conn.execute(
                "INSERT INTO form_versions VALUES(?,?,?,?,?,?)",
                (
                    form.id,
                    context.notebook_id,
                    form.revision,
                    body.idempotency_key,
                    fingerprint(body),
                    form.model_dump_json(),
                ),
            )
            conn.executemany(
                "INSERT INTO form_field_lineage VALUES(?,?,?)",
                [(identity, key, origin) for key, origin in origins.items()],
            )
            return form
