"""Offline text parsers used only inside the existing bounded Windows worker.

File hashes cover original bytes; the single unpaginated text unit retains decoded
text (plain formats) or ordered text nodes (markup/EPUB), never PDF geometry.
"""

import codecs
import posixpath
import re
import stat
import zipfile
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from email.message import Message
from html.parser import HTMLParser
from typing import BinaryIO
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET

from evidra.domain.documents import ParsedPage, ParserLimits
from evidra.domain.errors import EvidraError

TEXT_FILE_PARSER_VERSION = "evidra-text-file-v1"
PLAIN_TYPES = {"text/plain", "text/csv", "text/tab-separated-values", "text/markdown"}
MARKUP_TYPES = {"text/html", "text/xml", "application/xhtml+xml"}
BLOCKS = {
    "p",
    "div",
    "br",
    "hr",
    "li",
    "tr",
    "td",
    "th",
    "section",
    "article",
    "header",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "pre",
    "blockquote",
}
HIDDEN = {"head", "script", "style", "template"}


def decode(data: bytes, charset: str | None = None) -> str:
    encoding = charset or "utf-8"
    if data.startswith((codecs.BOM_UTF32_LE, codecs.BOM_UTF32_BE)):
        encoding = "utf-32"
    elif data.startswith((codecs.BOM_UTF16_LE, codecs.BOM_UTF16_BE)):
        encoding = "utf-16"
    elif data.startswith(codecs.BOM_UTF8):
        encoding = "utf-8-sig"
    try:
        codec = codecs.lookup(encoding)
        if codec.name not in {
            "utf-8",
            "utf-8-sig",
            "utf-16",
            "utf-16-le",
            "utf-16-be",
            "utf-32",
            "utf-32-le",
            "utf-32-be",
            "ascii",
            "iso8859-1",
            "cp1252",
        }:
            raise EvidraError(
                "UNSUPPORTED_TEXT_FORMAT", "The declared text encoding is unsupported."
            )
        text = data.decode(encoding, errors="strict")
    except (LookupError, UnicodeError) as exc:
        raise EvidraError(
            "TEXT_ENCODING_ERROR", "The original bytes cannot be decoded strictly."
        ) from exc
    if any(ord(c) < 32 and c not in "\t\r\n\f" for c in text):
        raise EvidraError("TEXT_ENCODING_ERROR", "Binary control bytes are not original text.")
    return text


def xml_source(data: bytes) -> str:
    # Decode before inspection, so UTF-16/32 cannot conceal entity declarations.
    encoding = re.match(rb"""\s*<\?xml[^>]*encoding=["']([^"']+)["']""", data[:512])
    text = decode(data, encoding[1].decode("ascii") if encoding else None)
    if re.search(r"<!\s*(DOCTYPE|ENTITY)", text, re.IGNORECASE):
        raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "DTD and entity declarations are unsupported.")
    return text


def xml(data: bytes) -> ET.Element:
    return ET.fromstring(xml_source(data))


def xml_text(root: ET.Element, *, html: bool) -> str:
    parts: list[str] = []

    def visit(element: ET.Element) -> None:
        tag = element.tag.rsplit("}", 1)[-1].lower()
        if html and tag in HIDDEN:
            return
        if tag in BLOCKS:
            parts.append("\n")
        if element.text:
            parts.append(element.text)
        for child in element:
            visit(child)
            if child.tail:
                parts.append(child.tail)
        if tag in BLOCKS:
            parts.append("\n")

    visit(root)
    return "".join(parts)


class _HTMLText(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.hidden: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in HIDDEN:
            self.hidden.append(tag)
        if not self.hidden and tag in BLOCKS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if self.hidden and tag == self.hidden[-1]:
            self.hidden.pop()
        elif not self.hidden and tag in BLOCKS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.hidden:
            self.parts.append(data)


def html_source(data: bytes, charset: str | None) -> str:
    if charset is None:
        declared = re.search(
            rb"""<meta\s[^>]*charset\s*=\s*["']?([a-zA-Z0-9_-]+)""", data[:4096], re.I
        )
        charset = declared[1].decode("ascii") if declared else None
    text = decode(data, charset)
    if re.search(r"<!\s*ENTITY|<!DOCTYPE[^>]*\[", text, re.I):
        raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "HTML entity declarations are unsupported.")
    return text


def html_text(data: bytes, charset: str | None) -> str:
    return html_text_source(html_source(data, charset))


def html_text_source(source: str) -> str:
    parser = _HTMLText()
    parser.feed(source)
    parser.close()
    if parser.hidden:
        raise EvidraError("INVALID_TEXT_DOCUMENT", "An HTML text exclusion was not closed.")
    return "".join(parser.parts)


def _archive_name(name: str) -> str:
    if (
        not name
        or name.startswith("/")
        or any(c in name for c in "\\\0:")
        or any(part in {"", ".", ".."} for part in name.rstrip("/").split("/"))
    ):
        raise EvidraError("INVALID_TEXT_DOCUMENT", "An EPUB entry name is invalid.")
    return name


@dataclass
class EpubUnit:
    name: str
    source: str
    root: ET.Element
    text: str


@dataclass
class EpubArchive:
    archive: zipfile.ZipFile
    limits: ParserLimits
    spine: list[str]
    manifest: list[ET.Element]
    package_name: str

    def read(self, name: str) -> bytes:
        _archive_name(name)
        with self.archive.open(name) as member:
            data = member.read(self.limits.max_file_bytes + 1)
        if len(data) > self.limits.max_file_bytes:
            raise EvidraError("FILE_LIMIT", "The EPUB member exceeds the byte limit.")
        return data

    def units(self) -> Iterator[EpubUnit]:
        # Keep extraction's original streaming memory behavior: one source/tree at a time.
        for name in self.spine:
            source = xml_source(self.read(name))
            root = ET.fromstring(source)
            if root.tag != "{http://www.w3.org/1999/xhtml}html":
                raise EvidraError("INVALID_TEXT_DOCUMENT", "The EPUB spine member is not XHTML.")
            extracted = xml_text(root, html=True)
            if not extracted.strip():
                raise EvidraError("INCOMPLETE_TEXT", "An EPUB spine unit has no extractable text.")
            yield EpubUnit(name, source, root, extracted)

    def image_type(self, name: str) -> str | None:
        # Asset declarations are irrelevant to extraction admission. Resolve them only
        # for this requested image; malformed/duplicate declarations cannot authorize it.
        matches: list[str | None] = []
        for item in self.manifest:
            href = item.attrib.get("href")
            if href is None:
                continue
            try:
                member = epub_member(self.package_name, href)
            except (EvidraError, ValueError, UnicodeError):
                continue
            if member == name:
                matches.append(item.attrib.get("media-type"))
        return matches[0] if len(matches) == 1 else None


def epub_member(base: str, reference: str) -> str:
    href = urlsplit(reference)
    if href.scheme or href.netloc or href.query or href.fragment:
        raise EvidraError("INVALID_TEXT_DOCUMENT", "The EPUB resource is not a local member.")
    return _archive_name(
        posixpath.normpath(
            posixpath.join(posixpath.dirname(base), unquote(href.path, errors="strict"))
        )
    )


@contextmanager
def epub_archive(stream: BinaryIO, limits: ParserLimits) -> Iterator[EpubArchive]:
    with zipfile.ZipFile(stream) as archive:
        entries = archive.infolist()
        if len(entries) > 10000:
            raise EvidraError("PAGE_LIMIT", "The EPUB exceeds 10000 archive entries.")
        names: set[str] = set()
        expanded = 0
        for entry in entries:
            name = _archive_name(entry.filename)
            if name in names or entry.flag_bits & 1 or stat.S_ISLNK(entry.external_attr >> 16):
                raise EvidraError("INVALID_TEXT_DOCUMENT", "Duplicate or encrypted EPUB entry.")
            if entry.compress_type not in {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED}:
                raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "Unsupported EPUB compression.")
            names.add(name)
            expanded += entry.file_size
            if expanded > limits.max_file_bytes:
                raise EvidraError("FILE_LIMIT", "The EPUB exceeds the decompressed byte limit.")
        if "META-INF/encryption.xml" in names:
            raise EvidraError(
                "UNSUPPORTED_TEXT_FORMAT", "Encrypted EPUB resources are unsupported."
            )

        book = EpubArchive(archive, limits, [], [], "")
        read = book.read

        if read("mimetype") != b"application/epub+zip":
            raise EvidraError("INVALID_TEXT_DOCUMENT", "The EPUB mimetype does not match.")
        rootfiles = xml(read("META-INF/container.xml")).findall(
            "{urn:oasis:names:tc:opendocument:xmlns:container}rootfiles/"
            "{urn:oasis:names:tc:opendocument:xmlns:container}rootfile"
        )
        if len(rootfiles) != 1:
            raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "Exactly one EPUB rendition is required.")
        package_name = _archive_name(rootfiles[0].attrib["full-path"])
        book.package_name = package_name
        package = xml(read(package_name))
        ns = "{http://www.idpf.org/2007/opf}"
        items = package.findall(f"{ns}manifest/{ns}item")
        book.manifest = items
        manifest = {item.attrib["id"]: item for item in items}
        spine = package.findall(f"{ns}spine/{ns}itemref")
        if len(manifest) != len(items) or not spine:
            raise EvidraError("INVALID_TEXT_DOCUMENT", "The EPUB manifest/spine is incomplete.")
        if len(spine) > limits.max_pages:
            raise EvidraError("PAGE_LIMIT", "The EPUB exceeds the configured spine-unit limit.")
        for reference in spine:
            item = manifest[reference.attrib["idref"]]
            if item.attrib["media-type"] != "application/xhtml+xml":
                raise EvidraError("UNSUPPORTED_TEXT_FORMAT", "The EPUB spine requires XHTML text.")
            member_name = epub_member(package_name, item.attrib["href"])
            book.spine.append(member_name)
        yield book


def epub_text(stream: BinaryIO, limits: ParserLimits) -> str:
    with epub_archive(stream, limits) as book:
        return "\n\n".join(unit.text for unit in book.units())


def parse_text(stream: BinaryIO, media_type: str, limits: ParserLimits) -> ParsedPage:
    header = Message()
    header["content-type"] = media_type
    kind, charset = media_type.partition(";")[0].strip().lower(), header.get_content_charset()
    try:
        if kind == "application/epub+zip":
            text = epub_text(stream, limits)
        elif kind in PLAIN_TYPES | MARKUP_TYPES:
            data = stream.read(limits.max_file_bytes + 1)
            if len(data) > limits.max_file_bytes:
                raise EvidraError("FILE_LIMIT", "The text file exceeds the byte limit.")
            if kind == "text/html":
                text = html_text(data, charset)
            elif kind in {"text/xml", "application/xhtml+xml"}:
                root = xml(data)
                if kind == "application/xhtml+xml" and root.tag not in {
                    "html",
                    "{http://www.w3.org/1999/xhtml}html",
                }:
                    raise EvidraError("INVALID_TEXT_DOCUMENT", "The XHTML root is not HTML.")
                text = xml_text(root, html=kind == "application/xhtml+xml" or root.tag == "html")
            else:
                text = decode(data, charset)
        else:
            raise EvidraError(
                "UNSUPPORTED_TEXT_FORMAT", "The declared textual format is unsupported."
            )
    except (ET.ParseError, zipfile.BadZipFile, KeyError, ValueError, RecursionError) as exc:
        raise EvidraError("INVALID_TEXT_DOCUMENT", "The textual document is malformed.") from exc
    if len(text) > min(20_000_000, limits.memory_bytes // 256):
        # Bound the unpaginated normalization map published by the engine as well
        # as the child's parsing allocation. Increase the existing memory limit.
        raise EvidraError("TEXT_LIMIT", "The original text exceeds the bounded text-unit limit.")
    return ParsedPage(
        page_index=0,
        page_label=None,
        original_text=text,
        quality="TEXT" if text.strip() else "EMPTY",
        crop_box=None,
        media_box=None,
        bbox=None,
        rotation=None,
        char_boxes=[],
        mapping_verified=False,
    )
