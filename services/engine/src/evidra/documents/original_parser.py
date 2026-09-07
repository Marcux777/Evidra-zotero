"""Worker-only structural representation from the verified original stream.

The output is a flat, URL-free token grammar, never a browser input document.
Images are decoded locally from the same file/archive and re-encoded as passive PNG.
"""

import base64
import binascii
import hashlib
import io
import re
import warnings
import zipfile
from email.message import Message
from html.parser import HTMLParser
from typing import BinaryIO, Literal
from xml.etree import ElementTree as ET

from PIL import Image, ImageOps, UnidentifiedImageError

from evidra.documents.text_parser import (
    PLAIN_TYPES,
    EpubArchive,
    decode,
    epub_archive,
    epub_member,
    html_source,
    html_text_source,
    xml_source,
    xml_text,
)
from evidra.domain.documents import (
    OriginalContentChunk,
    OriginalImage,
    OriginalLimitation,
    OriginalLimitationCode,
    OriginalStructure,
    OriginalToken,
    OriginalWorkerResult,
    ParserLimits,
)
from evidra.domain.errors import EvidraError

TAGS = frozenset(
    (
        "article section div header footer main aside nav h1 h2 h3 h4 h5 h6 p br hr "
        "ul ol li dl dt dd blockquote pre code kbd samp var strong b em i small mark "
        "sub sup cite q s u ins del span bdi bdo time ruby rt rp "
        "table caption colgroup col thead tbody tfoot tr th td figure figcaption"
    ).split()
)
VOID = frozenset("br hr col img area base embed input link meta param source track wbr".split())
ACTIVE = frozenset(
    "script iframe frame frameset object embed form input button select textarea".split()
)
ATTRIBUTES = frozenset("title lang dir colspan rowspan scope abbr start reversed value".split())
RASTER = {"image/png": "PNG", "image/jpeg": "JPEG", "image/gif": "GIF", "image/webp": "WEBP"}


class _ResourceBase(HTMLParser):
    """Detect original base declarations before resolving any relative image reference."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.reference: str | None = None
        self.templates = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "template":
            self.templates += 1
        if self.templates:
            return
        values = dict(attrs)
        base = values.get("href") if tag == "base" else values.get("xml:base")
        if base is not None and self.reference is None:
            self.reference = base

    def handle_endtag(self, tag: str) -> None:
        if tag == "template" and self.templates:
            self.templates -= 1


class Structure(HTMLParser):
    def __init__(
        self, limits: ParserLimits, resource: str, book: EpubArchive | None, base: str | None
    ) -> None:
        super().__init__(convert_charrefs=True)
        self.limits, self.resource, self.book = limits, resource, book
        self.base = base
        self.tokens: list[OriginalToken] = []
        self.images: list[OriginalImage] = []
        self.limitations: dict[tuple[str, str, str], OriginalLimitation] = {}
        self.stack: list[tuple[str, bool, bool]] = []

    def limitation(self, code: OriginalLimitationCode, tag: str, reference: str = "") -> None:
        key = (code, tag, reference)
        old = self.limitations.get(key)
        self.limitations[key] = OriginalLimitation(
            code=code, element=tag, reference=reference, count=old.count + 1 if old else 1
        )

    def _image(self, attrs: dict[str, str]) -> None:
        reference = attrs.get("src", "")
        if "srcset" in attrs:
            self.limitation("REMOVED_ATTRIBUTE", "img", "srcset=" + attrs["srcset"])
        if not reference:
            self.limitation("UNDECLARED_IMAGE", "img", reference)
            return
        try:
            if reference.startswith("data:"):
                header, separator, encoded = reference.partition(",")
                match = re.fullmatch(r"data:(image/[a-z+.-]+);base64", header, re.I)
                if not separator or not match or match[1].lower() not in RASTER:
                    self.limitation("IMAGE_FORMAT", "img", header)
                    return
                mime = match[1].lower()
                data = base64.b64decode(encoded, validate=True)
            elif self.book is not None:
                if self.base is not None:
                    self.limitation(
                        "UNDECLARED_IMAGE",
                        "img",
                        reference
                        + " (original base declaration is unsupported: "
                        + self.base
                        + ")",
                    )
                    return
                try:
                    member = epub_member(self.resource, reference)
                except EvidraError:
                    self.limitation("EXTERNAL_RESOURCE", "img", reference)
                    return
                mime = self.book.image_type(member) or ""
                if not mime:
                    self.limitation("UNDECLARED_IMAGE", "img", reference)
                    return
                if mime not in RASTER:
                    self.limitation("IMAGE_FORMAT", "img", reference + " (" + mime + ")")
                    return
                try:
                    data = self.book.read(member)
                except KeyError as exc:
                    self.limitation(
                        "UNDECLARED_IMAGE", "img", reference + " (" + type(exc).__name__ + ")"
                    )
                    return
            else:
                self.limitation("EXTERNAL_RESOURCE", "img", reference)
                return
            if len(data) > self.limits.max_file_bytes:
                self.limitation("IMAGE_LIMIT", "img", reference[:256] + " (file bytes)")
                return
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                with Image.open(io.BytesIO(data)) as image:
                    if image.format != RASTER[mime]:
                        self.limitation(
                            "IMAGE_FORMAT", "img", reference[:256] + " (signature mismatch)"
                        )
                        return
                    if image.width * image.height > min(16_000_000, self.limits.memory_bytes // 16):
                        self.limitation("IMAGE_LIMIT", "img", reference[:256] + " (pixel limit)")
                        return
                    if getattr(image, "n_frames", 1) != 1:
                        self.limitation("IMAGE_ANIMATION", "img", reference[:256])
                        return
                    image.load()
                    if image.info.get("icc_profile"):
                        self.limitation(
                            "IMAGE_FORMAT",
                            "img",
                            reference[:256] + " (source color profile omitted)",
                        )
                    with (
                        ImageOps.exif_transpose(image) as oriented,
                        oriented.convert("RGBA") as clean,
                    ):
                        clean.info.clear()
                        with io.BytesIO() as output:
                            clean.save(output, "PNG")
                            png = output.getvalue()
                        asset = OriginalImage(
                            sha256=hashlib.sha256(png).hexdigest(),
                            width=clean.width,
                            height=clean.height,
                            data_base64=base64.b64encode(png).decode("ascii"),
                        )
        except (
            binascii.Error,
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
            Image.DecompressionBombWarning,
        ) as exc:
            self.limitation(
                "IMAGE_DECODE",
                "img",
                reference[:256] + " (" + type(exc).__name__ + ": " + str(exc) + ")",
            )
            return
        index = next(
            (i for i, value in enumerate(self.images) if value.sha256 == asset.sha256),
            len(self.images),
        )
        if index == len(self.images):
            self.images.append(asset)
        self.tokens.append(
            OriginalToken(
                kind="image", tag="img", attributes={"alt": attrs.get("alt", "")}, image_index=index
            )
        )

    def handle_starttag(self, tag: str, attributes: list[tuple[str, str | None]]) -> None:
        attrs = {key: value or "" for key, value in attributes}
        blocked = any(value[2] for value in self.stack)
        if tag in ACTIVE:
            self.limitation("ACTIVE_CONTENT", tag)
        elif tag in {"style", "link"}:
            self.limitation("SOURCE_STYLE", tag, attrs.get("href", ""))
        elif tag not in TAGS | {"html", "body", "head", "title", "meta", "base", "a", "img"}:
            self.limitation("UNSUPPORTED_ELEMENT", tag)
        for key, value in attrs.items():
            if key.startswith("on"):
                self.limitation("ACTIVE_CONTENT", tag, key)
            elif key == "style":
                self.limitation("SOURCE_STYLE", tag, key)
            elif key not in ATTRIBUTES | {"xmlns"} and not (
                tag == "img" and key in {"src", "srcset", "alt"}
            ):
                self.limitation("REMOVED_ATTRIBUTE", tag, key + "=" + value)
        allowed = not blocked and tag in TAGS
        suppress = blocked or tag not in TAGS | {"html", "body", "a", "img"}
        if not blocked and tag == "img":
            self._image(attrs)
        if allowed:
            safe = {}
            for key, value in attrs.items():
                if key not in ATTRIBUTES:
                    continue
                valid = (
                    key in {"title", "lang", "abbr"}
                    or key == "dir"
                    and value in {"ltr", "rtl", "auto"}
                    or key in {"colspan", "rowspan"}
                    and re.fullmatch(r"[1-9][0-9]{0,3}", value)
                    or key == "scope"
                    and value in {"row", "col", "rowgroup", "colgroup"}
                    or key in {"start", "value"}
                    and re.fullmatch(r"-?[0-9]{1,9}", value)
                    or key == "reversed"
                    and tag == "ol"
                )
                if valid:
                    safe[key] = value
                else:
                    self.limitation("REMOVED_ATTRIBUTE", tag, key + "=" + value)
            self.tokens.append(OriginalToken(kind="start", tag=tag, attributes=safe))
        if tag not in VOID:
            self.stack.append((tag, allowed, suppress))
        elif allowed:
            self.tokens.append(OriginalToken(kind="end", tag=tag))

    def handle_endtag(self, tag: str) -> None:
        matching = next(
            (i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i][0] == tag), None
        )
        if matching is None:
            return
        for name, emitted, _ in reversed(self.stack[matching:]):
            if emitted:
                self.tokens.append(OriginalToken(kind="end", tag=name))
        del self.stack[matching:]

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        if data and not any(value[2] for value in self.stack):
            self.tokens.append(OriginalToken(kind="text", text=data))

    def from_xml(self, root: ET.Element) -> None:
        def visit(element: ET.Element) -> None:
            tag = element.tag.removeprefix("{http://www.w3.org/1999/xhtml}")
            self.handle_starttag(tag, list(element.attrib.items()))
            if element.text:
                self.handle_data(element.text)
            for child in element:
                visit(child)
                if child.tail:
                    self.handle_data(child.tail)
            self.handle_endtag(tag)

        visit(root)

    def result(self) -> str:
        while self.stack:
            self.handle_endtag(self.stack[-1][0])
        return OriginalStructure(
            tokens=self.tokens, images=self.images, limitations=list(self.limitations.values())
        ).model_dump_json()


def original_content(
    stream: BinaryIO,
    media_type: str,
    limits: ParserLimits,
    *,
    start: int,
    end: int,
    unit_index: int | None,
    representation: Literal["structure", "source"],
    offset: int,
) -> OriginalWorkerResult:
    """Rebuild deterministically inside the existing worker; no process-wide cache or URLs."""
    header = Message()
    header["content-type"] = media_type
    kind, charset = media_type.partition(";")[0].strip().lower(), header.get_content_charset()

    def selected(
        units: list[tuple[str, str, str, ET.Element | None]], book: EpubArchive | None
    ) -> OriginalWorkerResult:
        extraction = "\n\n".join(unit[2] for unit in units)
        if len(extraction) > min(20_000_000, limits.memory_bytes // 256):
            raise EvidraError(
                "TEXT_LIMIT", "The original extraction exceeds the existing unit limit."
            )
        if not 0 <= start < end <= len(extraction):
            raise EvidraError("EVIDENCE_INVARIANT", "The cited extraction range is unavailable.")
        ranges, position = [], 0
        for _, _, text, _ in units:
            ranges.append((position, position + len(text)))
            position += len(text) + 2
        targets = [i for i, (a, b) in enumerate(ranges) if start < b and end > a]
        if not targets:
            raise EvidraError("EVIDENCE_INVARIANT", "The citation has no original source unit.")
        index = targets[0] if unit_index is None else unit_index
        if not 0 <= index < len(units):
            raise EvidraError("INVALID_ORIGINAL_UNIT", "The original source unit is unavailable.")
        name, source, _, root = units[index]
        format: Literal["source", "structure", "plain"]
        if kind == "text/xml" or representation == "source":
            payload, format = source, "source"
        elif kind in PLAIN_TYPES:
            payload, format = source, "plain"
        else:
            bases = _ResourceBase()
            bases.feed(source)
            bases.close()
            parser = Structure(limits, name, book, bases.reference)
            if root is not None:
                parser.from_xml(root)
            else:
                parser.feed(source)
                parser.close()
            payload, format = parser.result(), "structure"
        if not 0 <= offset < len(payload):
            raise EvidraError("INVALID_TEXT_OFFSET", "The original content offset is unavailable.")
        return OriginalWorkerResult(
            extraction_sha256=hashlib.sha256(extraction.encode()).hexdigest(),
            chunk=OriginalContentChunk(
                unit_index=index,
                unit_count=len(units),
                resource_id=name,
                extraction_start=ranges[index][0],
                extraction_end=ranges[index][1],
                target_first=targets[0],
                target_last=targets[-1],
                format=format,
                content=payload[offset : offset + 64000],
                offset=offset,
                total=len(payload),
                payload_sha256=hashlib.sha256(payload.encode()).hexdigest(),
            ),
        )

    try:
        if kind == "application/epub+zip":
            with epub_archive(stream, limits) as book:
                units: list[tuple[str, str, str, ET.Element | None]] = []
                position, chosen = 0, unit_index
                for index, unit in enumerate(book.units()):
                    if chosen is None and start < position + len(unit.text) and end > position:
                        chosen = index
                    units.append(
                        (
                            unit.name,
                            unit.source if index == chosen else "",
                            unit.text,
                            unit.root if index == chosen else None,
                        )
                    )
                    position += len(unit.text) + 2
                return selected(units, book)
        data = stream.read(limits.max_file_bytes + 1)
        if len(data) > limits.max_file_bytes:
            raise EvidraError("FILE_LIMIT", "The original exceeds the configured byte limit.")
        root = None
        if kind == "text/html":
            source = html_source(data, charset)
            extraction = html_text_source(source)
        elif kind in {"text/xml", "application/xhtml+xml"}:
            source = xml_source(data)
            root = ET.fromstring(source)
            if kind == "application/xhtml+xml" and root.tag not in {
                "html",
                "{http://www.w3.org/1999/xhtml}html",
            }:
                raise EvidraError("INVALID_TEXT_DOCUMENT", "The XHTML root is not HTML.")
            extraction = xml_text(root, html=kind == "application/xhtml+xml" or root.tag == "html")
        elif kind in PLAIN_TYPES:
            source = extraction = decode(data, charset)
        else:
            raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "The original format is unsupported.")
        return selected([("original", source, extraction, root)], None)
    except (ET.ParseError, zipfile.BadZipFile, KeyError, ValueError, RecursionError) as exc:
        raise EvidraError("INVALID_TEXT_DOCUMENT", "The original document is malformed.") from exc
