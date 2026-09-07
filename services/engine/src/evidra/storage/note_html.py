"""Safe deterministic note content. No model-supplied markup or external targets."""

import re
from html import escape

from evidra.research.execution import ArtifactVersion, AuditOutput, ResearchInputs, ScreeningOutput


def escaped(value: str) -> str:
    # Match native setNote normalization before hashing the exact preview.
    return escape(re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value), quote=True)


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
    }
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
                f"<h2>{escaped(output.decision)}</h2>",
                f"<p>{escaped(output.rationale)}</p>",
                "<p>" + escaped(", ".join(output.criterion_ids)) + "</p>",
            ]
        )
    elif isinstance(output, AuditOutput):
        for claim in output.claims:
            parts.extend(
                [
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
                parts.append(f"<p>{escaped(reference.citation)} — {label}</p>")
        parts.append(f"<p>{escaped(output.collection_limitations)}</p>")
    else:
        for section in output.sections:
            parts.extend(
                [
                    f"<h2>{escaped(section.heading)}</h2>",
                    f"<p>{escaped(section.text)}</p>",
                    f"<p>{labels['basis']}: {escaped(section.basis)}</p>",
                    f"<p>{labels['context']}: {escaped(section.comparability)}</p>",
                ]
            )
        parts.append(f"<h2>{labels['limitations']}</h2>")
        parts.extend(f"<p>{escaped(text)}</p>" for text in output.limitations)
    parts.append(f"<h2>{labels['evidence']}</h2>")
    studies = {s.source_id: s for s in inputs.studies}
    for evidence in inputs.evidence:
        study = studies[evidence.source_id]
        target = (
            f"{study.title} | {study.identity.library_id}/{study.identity.item_key} "
            f"| {evidence.content_key}"
        )
        if evidence.page_index is not None:
            target += f" | page {evidence.page_index + 1}"
        parts.extend(
            [f"<p>{escaped(target)}</p>", f"<blockquote>{escaped(evidence.excerpt)}</blockquote>"]
        )
    parts.append(
        f"<p>{labels['provenance']}: {uuid}; "
        f"Evidra {artifact.artifact_id}/{artifact.revision}</p></div></div>"
    )
    return "\n".join(parts)
