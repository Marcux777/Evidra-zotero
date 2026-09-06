"""Author-owned PDFs with literal contents, independent of the parser under test."""

from pathlib import Path


def pdf_bytes(pages: list[dict], *, labels: bool = False) -> bytes:
    """Minimal PDF 1.7: explicit xref, Type1 font, optional crop/rotation/labels."""
    objects: list[bytes] = []
    label_tree = b" /PageLabels << /Nums [0 << /S /r >> 1 << /S /D /St 7 >>] >>" if labels else b""
    objects.append(b"<< /Type /Catalog /Pages 2 0 R" + label_tree + b" >>")
    kids = " ".join(f"{4 + 2 * i} 0 R" for i in range(len(pages)))
    objects.append(f"<< /Type /Pages /Count {len(pages)} /Kids [{kids}] >>".encode())
    objects.append(
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    )
    for i, page in enumerate(pages):
        rotation = page.get("rotation", 0)
        crop = " ".join(str(v) for v in page.get("crop", [0, 0, 400, 500]))
        objects.append(
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 500] /CropBox [{crop}] "
            f"/Rotate {rotation} /Resources << /Font << /F1 3 0 R >> >> "
            f"/Contents {5 + 2 * i} 0 R >>".encode()
        )
        operations = []
        for x, y, text in page.get("lines", []):
            escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            operations.append(f"BT /F1 12 Tf 1 0 0 1 {x} {y} Tm ({escaped}) Tj ET")
        operations.extend(page.get("operations", []))
        stream = "\n".join(operations).encode("cp1252")
        objects.append(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")
    result = bytearray(b"%PDF-1.7\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(len(result))
        result.extend(f"{number} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = len(result)
    result.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]:
        result.extend(f"{offset:010d} 00000 n \n".encode())
    result.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    )
    return bytes(result)


def write_pdf(path: Path, text: str = "decisive finding") -> bytes:
    data = pdf_bytes([{"lines": [(40, 440, text)]}])
    path.write_bytes(data)
    return data
