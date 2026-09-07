"""Typed CSV conventions: numeric values remain numbers; all text is formula-safe."""

import csv
import io
import math
from typing import Any, Literal

from evidra.domain.errors import EvidraError
from evidra.exports.models import PortableNotebook
from evidra.extraction.models import ExperimentalResult, NumericValue


def csv_cell(value: object, *, kind: Literal["text", "number", "boolean"] = "text") -> object:
    if value is None:
        return ""
    if kind == "number":
        if (
            isinstance(value, bool)
            or not isinstance(value, (float, int))
            or not math.isfinite(value)
        ):
            raise EvidraError("INVALID_REQUEST", "CSV numeric cells require finite typed numbers.")
        return value
    if kind == "boolean":
        if not isinstance(value, bool):
            raise EvidraError("INVALID_REQUEST", "CSV boolean cells require typed booleans.")
        return value
    if not isinstance(value, str):
        raise EvidraError("INVALID_REQUEST", "CSV text cells require text.")
    # Leading controls/whitespace must not hide a spreadsheet formula trigger.
    if value.startswith(("\t", "\r", "\n")) or value.lstrip(" \t\r\n\ufeff").startswith(
        ("=", "+", "-", "@")
    ):
        return "'" + value
    return value


def result_rows(notebook: PortableNotebook) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    domains = {(r.origin_profile_id, r.origin_notebook_id, r.origin) for r in notebook.records}
    for profile, book, origin in sorted(domains):
        records = [
            r
            for r in notebook.records
            if (r.origin_profile_id, r.origin_notebook_id, r.origin) == (profile, book, origin)
        ]
        forms = [r.data for r in records if r.kind == "form"]
        if not forms:
            continue
        form = max(forms, key=lambda f: f.revision)
        sources = {r.data.id: r.data for r in records if r.kind == "source"}
        evidence = {r.data.id: r.data for r in records if r.kind == "evidence"}
        proposals = {r.data.id: r.data for r in records if r.kind == "proposal"}
        decisions = [r.data for r in records if r.kind == "decision"]
        for sid, source in sorted(sources.items()):
            for field in form.fields:
                candidates = [
                    d
                    for d in decisions
                    if d.new.source_id == sid
                    and d.new.field_key == field.key
                    and d.new.field_origin_form_version_id == form.field_origins[field.key]
                ]
                decision = (
                    max(candidates, key=lambda d: (d.new.revision, d.created_at))
                    if candidates
                    else None
                )
                pending = [
                    p
                    for p in proposals.values()
                    if p.source_id == sid
                    and p.field_key == field.key
                    and p.field_origin_form_version_id == form.field_origins[field.key]
                ]
                proposal = (
                    proposals.get(decision.proposal_id)
                    if decision
                    else max(pending, key=lambda p: p.created_at)
                    if pending
                    else None
                )
                cell = decision.new if decision else proposal
                value = cell.value if cell else None
                common: dict[str, Any] = {
                    "profile": source.identity.profile_instance_id,
                    "library": source.identity.library_id,
                    "item_key": source.identity.item_key,
                    "source_id": sid,
                    "title": source.title,
                    "doi": source.doi or "",
                    "year": source.year,
                    "origin": origin,
                    "form_version": form.id,
                    "field": field.key,
                    "field_label": field.label,
                    "value_state": cell.value_state if cell else "UNPROCESSED",
                    "review_state": decision.action if decision else "UNREVIEWED",
                    "revision": decision.new.revision if decision else 0,
                    "proposal_id": proposal.id if proposal else "",
                    "decision_id": decision.id if decision else "",
                    "author": decision.author if decision else "",
                    "unit": field.unit or "",
                    "condition": "",
                    "dataset": "",
                    "metric": "",
                    "baseline": "",
                    "direction": "",
                    "value": "",
                    "original": "",
                    "evidence": "",
                    "locator": "",
                    "coverage": proposal.coverage if proposal else "",
                }
                if proposal:
                    cited = [evidence[e] for e in proposal.evidence_ids if e in evidence]
                    common["evidence"] = "\n".join(e.excerpt for e in cited)
                    common["locator"] = "\n".join(
                        f"{e.source_identity.item_key}/{e.content_key}; "
                        f"document={e.document_version_id}; page={e.page_label or e.page_index}; "
                        f"offsets={e.start}:{e.end}; evidence={e.id}"
                        for e in cited
                    )
                values = (
                    value
                    if isinstance(value, list)
                    and value
                    and isinstance(value[0], ExperimentalResult)
                    else [value]
                )
                for result in values:
                    row = dict(common)
                    if isinstance(result, ExperimentalResult):
                        row.update(
                            value=result.number.normalized,
                            original=result.number.original,
                            metric=result.metric,
                            condition=result.condition or "",
                            dataset=result.dataset or "",
                            unit=result.unit or "",
                            baseline=result.baseline or "",
                            direction=result.direction,
                        )
                    elif isinstance(result, NumericValue):
                        row.update(value=result.normalized, original=result.original)
                    elif isinstance(result, list):
                        row.update(value="; ".join(result))
                    elif result is not None:
                        row.update(value=result)
                    rows.append(row)
    return rows


RESULT_COLUMNS = [
    "profile",
    "library",
    "item_key",
    "source_id",
    "title",
    "doi",
    "year",
    "origin",
    "form_version",
    "field",
    "field_label",
    "value",
    "original",
    "value_state",
    "review_state",
    "revision",
    "unit",
    "condition",
    "dataset",
    "metric",
    "baseline",
    "direction",
    "coverage",
    "evidence",
    "locator",
    "proposal_id",
    "decision_id",
    "author",
]


def render_csv(notebook: PortableNotebook, *, per_study: bool, excel: bool) -> bytes:
    rows = result_rows(notebook)
    columns = RESULT_COLUMNS
    if per_study:
        identity_columns = RESULT_COLUMNS[:9]
        detail_columns = RESULT_COLUMNS[11:]
        combined: dict[tuple[object, ...], dict[str, Any]] = {}
        fields = sorted({r["field"] for r in rows})
        # Multiple experimental results remain separately named within a study row;
        # do not collapse typed numeric results into ambiguous prose.
        counts: dict[tuple[object, ...], int] = {}
        max_results: dict[str, int] = {}
        for row in rows:
            identity = tuple(row[k] for k in identity_columns)
            key = (*identity, row["field"])
            index = counts.get(key, 0) + 1
            counts[key] = index
            max_results[row["field"]] = max(index, max_results.get(row["field"], 0))
            target = combined.setdefault(identity, {k: row[k] for k in identity_columns})
            for col in detail_columns:
                target[f"{row['field']}.{index}.{col}"] = row[col]
        columns = identity_columns + [
            f"{field}.{i}.{col}"
            for field in fields
            for i in range(1, max_results[field] + 1)
            for col in detail_columns
        ]
        rows = list(combined.values())
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\r\n")
    writer.writeheader()
    for row in rows:
        writer.writerow(
            {
                key: csv_cell(
                    value,
                    kind="boolean"
                    if isinstance(value, bool)
                    else "number"
                    if isinstance(value, (int, float))
                    else "text",
                )
                for key, value in row.items()
            }
        )
    return stream.getvalue().encode("utf-8-sig" if excel else "utf-8")
