"""Readable complete research history without interpreting source HTML or commands."""

import html
from typing import Any

from evidra.exports.models import PortableNotebook


def literal(value: object) -> str:
    return (
        html.escape(str(value))
        .replace("\\", "\\\\")
        .replace("`", "\\`")
        .replace("[", "\\[")
        .replace("]", "\\]")
        .replace("*", "\\*")
        .replace("_", "\\_")
        .replace("|", "\\|")
        .replace("#", "\\#")
    )


def readable(value: Any, depth: int = 0) -> list[str]:
    prefix = "  " * depth
    if isinstance(value, dict):
        result = []
        for key, child in value.items():
            if isinstance(child, (dict, list)):
                result.append(f"{prefix}- **{literal(key)}**:")
                result.extend(readable(child, depth + 1))
            else:
                text = "null (explicitly absent)" if child is None else literal(child)
                indented = text.replace(chr(10), chr(10) + prefix + "  ")
                result.append(f"{prefix}- **{literal(key)}**: {indented}")
        return result
    if isinstance(value, list):
        result = []
        for index, child in enumerate(value):
            result.append(f"{prefix}- {index + 1}:")
            result.extend(readable(child, depth + 1))
        return result or [f"{prefix}- (empty)"]
    return [f"{prefix}- {literal(value)}"]


def render_markdown(notebook: PortableNotebook) -> bytes:
    lines = [
        f"# {literal(notebook.name)}",
        "",
        f"Exported: {notebook.exported_at}",
        "",
        "Source quotations retain their original language. Imported history is "
        "not a local approval.",
        "",
    ]
    for record in notebook.records:
        lines.extend(
            [
                f"## {record.kind} — {record.origin}",
                "",
                f"Record: {literal(record.id)}",
                "",
                f"Original profile / notebook: {literal(record.origin_profile_id)} / "
                f"{literal(record.origin_notebook_id)}",
                "",
            ]
        )
        lines.extend(readable(record.data.model_dump(mode="json")))
        lines.append("")
    if notebook.omissions:
        lines.extend(["## Omitted history", ""])
        lines.extend(f"- {o.kind}: {o.id} — {o.reason}" for o in notebook.omissions)
    return ("\n".join(lines) + "\n").encode("utf-8")
