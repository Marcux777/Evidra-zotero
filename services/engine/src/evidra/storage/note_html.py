"""Safe deterministic note content. No model-supplied markup or external targets."""

import re
from html import escape

from evidra.extraction.models import ExperimentalResult, NumericValue, Value
from evidra.research.execution import ArtifactVersion, AuditOutput, ResearchInputs, ScreeningOutput


def escaped(value: str) -> str:
    # Match native setNote normalization before hashing the exact preview.
    return escape(re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value), quote=True)


def cell_value(value: Value, pt: bool) -> str:
    if value is None:
        return "—"
    if isinstance(value, bool):
        return ("Sim" if value else "Não") if pt else ("Yes" if value else "No")
    if isinstance(value, str):
        return value
    if isinstance(value, NumericValue):
        return f"{value.original} ({value.normalized})"
    values = []
    for item in value:
        if isinstance(item, ExperimentalResult):
            context = "; ".join(
                f"{name}: {getattr(item, name) or '—'}"
                for name in ("dataset", "condition", "unit", "baseline", "direction")
            )
            values.append(
                f"{item.metric}: {item.number.original} ({item.number.normalized}); {context}"
            )
        else:
            values.append(item)
    return "; ".join(values)


def note_html(
    uuid: str, title: str, artifact: ArtifactVersion, inputs: ResearchInputs, locale: str
) -> str:
    pt = locale == "pt-BR"
    labels = {
        "proposal": "Artefato derivado por IA; revisão humana: "
        if pt
        else "AI-derived artifact; human review: ",
        "coverage": "Cobertura" if pt else "Coverage",
        "partial": "Parcial" if pt else "Partial",
        "complete": "Células revisadas completas" if pt else "Complete reviewed cells",
        "evidence": "Evidências originais; âncoras não comprovam sustentação"
        if pt
        else "Original evidence; anchors do not prove support",
        "indirect": "Citação indireta — trabalho não lido"
        if pt
        else "Indirect citation — work not read",
        "direct": "Somente trechos fornecidos" if pt else "Supplied excerpts only",
        "absent": "Referência não disponível no caderno"
        if pt
        else "Reference unavailable in notebook",
        "basis": "Base" if pt else "Basis",
        "context": "Contexto de comparação" if pt else "Comparison context",
        "limitations": "Limitações" if pt else "Limitations",
        "provenance": "UUID de proveniência" if pt else "Provenance UUID",
        "cells": "Células selecionadas da matriz" if pt else "Selected matrix cells",
        "no_evidence": "Nenhum trecho original selecionado para este resultado."
        if pt
        else "No original excerpt selected for this result.",
    }
    studies = {s.source_id: s for s in inputs.studies}
    evidence_by_id = {e.id: e for e in inputs.evidence}
    cells_by_id = {cell.id: cell for cell in inputs.cells}

    def anchors(ids: list[str]) -> list[str]:
        result = [f"<h2>{labels['evidence']}</h2>"]
        if not ids:
            result.append(f"<p>{labels['no_evidence']}</p>")
        for evidence_id in ids:
            evidence = evidence_by_id[evidence_id]
            study = studies[evidence.source_id]
            target = (
                f"{study.title} | {study.identity.library_id}/{study.identity.item_key} "
                f"| {evidence.content_key} | {evidence.id}"
            )
            if evidence.page_index is not None:
                target += f" | page {evidence.page_index + 1}"
            result.extend(
                [
                    f"<p>{escaped(target)}</p>",
                    f"<blockquote>{escaped(evidence.excerpt)}</blockquote>",
                ]
            )
        return result

    def selected_cells(ids: list[str]) -> list[str]:
        result = [f"<h2>{labels['cells']}</h2>"]
        for cell_id in ids:
            selected = cells_by_id[cell_id]
            cell = selected.cell
            study = studies[cell.source_id]
            description = (
                f"{study.title} | {study.identity.library_id}/{study.identity.item_key} "
                f"| {cell.field_key} | {selected.basis} | {cell.review_state} "
                f"| {cell.value_state or '—'} | revision {cell.revision}"
            )
            provenance = (
                f"{selected.id} | {cell.proposal_id or '—'} | "
                f"form {cell.form_version_id} | field origin {cell.field_origin_form_version_id}"
            )
            result.extend(
                [
                    f"<p>{escaped(description)}</p>",
                    f"<p>{escaped(cell_value(cell.value, pt))}</p>",
                    f"<p>{escaped(provenance)}</p>",
                ]
            )
        return result

    parts = [
        '<div class="zotero-note znv1">',
        f'<div data-evidra-origin="ai" data-evidra-outbox="{uuid}">',
        f"<h1>{escaped(title)}</h1>",
        f"<p>{labels['proposal']}{escaped(artifact.review_state)}</p>",
        f"<p>{labels['coverage']}: "
        f"{labels['complete'] if artifact.coverage.complete else labels['partial']}; "
        f"{artifact.coverage.included_studies}/{artifact.coverage.snapshot_members}</p>",
    ]
    output = artifact.output
    if isinstance(output, ScreeningOutput):
        parts.extend(
            [
                "<div>",
                f"<h2>{escaped(output.decision)}</h2>",
                f"<p>{escaped(output.rationale)}</p>",
                "<p>" + escaped(", ".join(output.criterion_ids)) + "</p>",
            ]
        )
        parts.extend(anchors(output.evidence_ids))
        parts.append("</div>")
    elif isinstance(output, AuditOutput):
        for claim in output.claims:
            parts.extend(
                [
                    "<div>",
                    f"<blockquote>{escaped(claim.text)}</blockquote>",
                    f"<p>{escaped(claim.support)}: {escaped(claim.explanation)}</p>",
                ]
            )
            for reference in claim.references:
                label = (
                    labels["indirect"]
                    if reference.relationship == "INDIRECT_MENTION"
                    else (
                        labels["direct"] if reference.relationship == "DIRECT" else labels["absent"]
                    )
                )
                study = studies.get(reference.source_id) if reference.source_id else None
                target = (
                    f" | {study.title} | {study.identity.library_id}/{study.identity.item_key}"
                    if study
                    else ""
                )
                parts.append(f"<p>{escaped(reference.citation)} — {label}{escaped(target)}</p>")
            parts.extend(anchors(claim.evidence_ids))
            parts.append("</div>")
        parts.append(f"<p>{escaped(output.collection_limitations)}</p>")
    else:
        for section in output.sections:
            parts.extend(
                [
                    "<div>",
                    f"<h2>{escaped(section.heading)}</h2>",
                    f"<p>{escaped(section.text)}</p>",
                    f"<p>{labels['basis']}: {escaped(section.basis)}</p>",
                    f"<p>{labels['context']}: {escaped(section.comparability)}</p>",
                ]
            )
            parts.extend(selected_cells(section.cell_ids))
            parts.extend(anchors(section.evidence_ids))
            parts.append("</div>")
        parts.append(f"<h2>{labels['limitations']}</h2>")
        parts.extend(f"<p>{escaped(text)}</p>" for text in output.limitations)
    parts.append(
        f"<p>{labels['provenance']}: {uuid}; "
        f"Evidra {artifact.artifact_id}/{artifact.revision}</p></div></div>"
    )
    return "\n".join(parts)
