"""One bounded PDFium worker; PDFium is imported only in the child process.

Process isolation is platform specific (`_worker_windows`: Job Objects; `_worker_posix`:
rlimits, session/process group, kill-on-exit), chosen by `sys.platform`.
"""

import base64
import hashlib
import io
import json
import math
import os
import sys
from typing import Any, Literal

from evidra.documents._worker_common import CHILD_CODES, child_diagnostic, diagnostic
from evidra.domain.documents import (
    PagePreview,
    PagePreviewRequest,
    ParsedPage,
    ParserLimits,
    Rectangle,
)
from evidra.domain.errors import EvidraError

if sys.platform == "win32":
    from evidra.documents._worker_windows import apply_child_limits, open_worker_stream, run_worker
else:
    from evidra.documents._worker_posix import apply_child_limits, open_worker_stream, run_worker

__all__ = [
    "CHILD_CODES",
    "PARSER_VERSION",
    "child_diagnostic",
    "diagnostic",
    "run_worker",
    "worker_main",
]

PARSER_VERSION = "pypdfium2-5.13.0/pdfium-153.0.7999.0/evidra-1"


def _page(pdf: Any, index: int) -> ParsedPage:
    import pypdfium2.raw as raw  # type: ignore[import-untyped]

    page, textpage = None, None
    try:
        label_size = raw.FPDF_GetPageLabel(pdf, index, None, 0)
        label = pdf.get_page_label(index) if label_size else None
        page = pdf[index]
        textpage = page.get_textpage()
        count = textpage.count_chars()
        original = textpage.get_text_bounded(errors="strict")
        mapping = len(original) == count
        boxes: list[Rectangle | None] = []
        unicode_errors = False
        for position in range(count):
            issue = raw.FPDFText_HasUnicodeMapError(textpage, position)
            generated = raw.FPDFText_IsGenerated(textpage, position)
            if issue == -1 or generated == -1:
                raise EvidraError("TEXT_MAPPING_ERROR", "Character mapping could not be inspected.")
            unicode_errors |= bool(issue)
            if not mapping:
                continue
            character = original[position]
            if (
                issue
                or raw.FPDFText_GetUnicode(textpage, position) != ord(character)
                or raw.FPDFText_GetTextIndexFromCharIndex(textpage, position) != position
                or raw.FPDFText_GetCharIndexFromTextIndex(textpage, position) != position
                or generated
                and not character.isspace()
            ):
                mapping = False
                continue
            if character.isspace():
                boxes.append(None)
                continue
            box = textpage.get_charbox(position)
            if not all(math.isfinite(v) for v in box) or box[0] >= box[2] or box[1] >= box[3]:
                mapping = False
                continue
            boxes.append(box)
        quality: Literal["TEXT", "EMPTY", "UNMAPPABLE", "ERROR"]
        if unicode_errors:
            quality, reason = "UNMAPPABLE", "UNICODE_MAP_ERROR"
        elif not original.strip():
            quality, reason = "EMPTY", "NO_EXTRACTABLE_TEXT"
        else:
            quality, reason = "TEXT", None
        return ParsedPage(
            page_index=index,
            page_label=label,
            original_text=original,
            quality=quality,
            diagnostic=reason,
            crop_box=page.get_cropbox(fallback_ok=False),
            media_box=page.get_mediabox(fallback_ok=False),
            bbox=page.get_bbox(),
            rotation=page.get_rotation(),
            char_boxes=boxes if mapping else [],
            mapping_verified=mapping and not unicode_errors,
        )
    except MemoryError:
        raise
    except Exception as exc:
        return ParsedPage(
            page_index=index,
            page_label=None,
            original_text="",
            quality="ERROR",
            diagnostic=json.dumps(diagnostic(exc), separators=(",", ":")),
            crop_box=None,
            media_box=None,
            bbox=None,
            rotation=None,
            char_boxes=[],
            mapping_verified=False,
        )
    finally:
        if textpage is not None:
            textpage.close()
        if page is not None:
            page.close()


def _preview(pdf: Any, request: dict[str, Any], limits: ParserLimits) -> PagePreview:
    body = PagePreviewRequest.model_validate(request["preview"])
    if body.page_index >= len(pdf):
        raise EvidraError("INVALID_PAGE", "The selected physical page does not exist.")
    page = pdf[body.page_index]
    bitmap = None
    try:
        bounds = page.get_bbox()
        region = body.region or bounds
        if not (
            bounds[0] <= region[0] < region[2] <= bounds[2]
            and bounds[1] <= region[1] < region[3] <= bounds[3]
        ):
            raise EvidraError("INVALID_REGION", "The selected region is outside the visible page.")
        width, height = (
            math.ceil(page.get_width() * body.scale),
            math.ceil(page.get_height() * body.scale),
        )
        if width * height > min(16_000_000, limits.memory_bytes // 16):
            raise EvidraError(
                "PREVIEW_PIXEL_LIMIT", "Reduce the scale of the selected page preview."
            )
        bitmap = page.render(scale=body.scale, may_draw_forms=False, draw_annots=False)
        converter = bitmap.get_posconv(page)
        points = [
            converter.to_bitmap(x, y)
            for x in (region[0], region[2])
            for y in (region[1], region[3])
        ]
        crop = (
            min(p[0] for p in points),
            min(p[1] for p in points),
            max(p[0] for p in points),
            max(p[1] for p in points),
        )
        with bitmap.to_pil() as full:
            with full.crop(crop) as selected, io.BytesIO() as output:
                selected.save(output, format="PNG")
                png = output.getvalue()
                if len(png) > 600_000:
                    raise EvidraError(
                        "PREVIEW_TRANSPORT_LIMIT",
                        "Reduce the preview region or scale to fit the display channel.",
                    )
                return PagePreview(
                    document_version_id=body.document_version_id,
                    page_index=body.page_index,
                    region=region,
                    width=selected.width,
                    height=selected.height,
                    sha256=hashlib.sha256(png).hexdigest(),
                    data_base64=base64.b64encode(png).decode("ascii"),
                )
    finally:
        if bitmap is not None:
            bitmap.close()
        page.close()


def _parent_pid(argv: list[str]) -> int | None:
    if "--parent-pid" not in argv:
        return None
    return int(argv[argv.index("--parent-pid") + 1])


def worker_main() -> None:
    """Private stdin protocol; no socket, shell, document actions or host database access."""
    try:
        request = json.loads(sys.stdin.buffer.read(65537))
        limits = ParserLimits.model_validate(request["limits"])
        apply_child_limits(limits, _parent_pid(sys.argv))
        with open_worker_stream(request["handle"]) as stream:
            size = os.fstat(stream.fileno()).st_size
            if size > limits.max_file_bytes:
                raise EvidraError("FILE_LIMIT", "The file exceeds its configured byte limit.")
            if request.get("source_kind") == "text_attachment":
                from evidra.documents.text_parser import TEXT_FILE_PARSER_VERSION, parse_text

                if request["kind"] == "original_view":
                    from evidra.documents.original_parser import original_content

                    result = original_content(
                        stream,
                        request["media_type"],
                        limits,
                        start=request["start"],
                        end=request["end"],
                        unit_index=request["unit_index"],
                        representation=request["representation"],
                        offset=request["offset"],
                    )
                    # The inherited stdout encoding is not necessarily UTF-8.
                    print(json.dumps(result.model_dump(), ensure_ascii=True))
                    return
                if request["kind"] != "ingest":
                    raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "Text files have no PDF preview.")
                page = parse_text(stream, request["media_type"], limits)
                print(
                    json.dumps(
                        {
                            "type": "header",
                            "page_count": 1,
                            "parser_version": TEXT_FILE_PARSER_VERSION,
                        }
                    )
                )
                print(json.dumps({"type": "page", "page": page.model_dump()}, ensure_ascii=True))
                print(json.dumps({"type": "done", "page_count": 1}))
                return
            import pypdfium2 as pdfium

            if str(pdfium.PDFIUM_INFO) != "153.0.7999.0":
                raise EvidraError("PARSER_VERSION_MISMATCH", "The bundled PDFium version differs.")
            with pdfium.PdfDocument(stream) as pdf:
                count = len(pdf)
                if count > limits.max_pages:
                    print(
                        json.dumps({"type": "limit", "reason": "PAGE_LIMIT", "page_count": count})
                    )
                    return
                if request["kind"] == "preview":
                    print(_preview(pdf, request, limits).model_dump_json())
                    return
                print(
                    json.dumps(
                        {"type": "header", "page_count": count, "parser_version": PARSER_VERSION}
                    )
                )
                for index in range(count):
                    print(
                        json.dumps(
                            {"type": "page", "page": _page(pdf, index).model_dump()},
                            ensure_ascii=True,
                        )
                    )
                    sys.stdout.flush()
                print(json.dumps({"type": "done", "page_count": count}))
    except BaseException as exc:
        print(json.dumps(diagnostic(exc), separators=(",", ":")), file=sys.stderr)
        raise SystemExit(1) from None
