"""Original-file structure, exact EPUB resource identity, and bounded native transport."""

import base64
import hashlib
import io
import json
import os
import zipfile

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from test_documents import document_scope, finished, ingest, register
from test_runtime_notebooks import HEADERS, make_app
from test_scopes import source


@pytest.mark.parametrize("kind", ["html", "xhtml", "xml", "epub", "epub_duplicate", "large_html"])
def test_original_view_uses_verified_bytes_structure_and_spine_ranges(tmp_path, kind):
    is_epub = kind.startswith("epub")
    with io.BytesIO() as output:
        Image.new("RGB", (3, 2), (40, 100, 160)).save(output, "PNG")
        png = output.getvalue()
    image = "data:image/png;base64," + base64.b64encode(png).decode()
    body = (
        "<h1>Original heading 😀</h1><p>repeated quotation targetchapter</p>"
        '<table><caption>Original table</caption><thead><tr><th colspan="2" scope="col">'
        'Exposure</th></tr></thead><tbody><tr><td rowspan="2">12</td><td>34</td></tr>'
        '<tr><td>56</td></tr></tbody></table><figure><img src="' + image + '" alt="Blue square"/>'
        "<figcaption>Original figure</figcaption></figure>"
        '<script>fetch("zotero://attachment/FOREIGN/")</script>'
        '<p onclick="unsafe()"><a href="file:///C:/private">Original link text</a></p>'
        '<img src="zotero://attachment/FOREIGN/" alt="Unavailable foreign image"/>'
        '<svg xmlns="http://www.w3.org/2000/svg"><text>Vector figure label</text></svg>'
    )
    if kind == "large_html":
        body += "<p>Preserved large context 😀</p>" * 5000
    if is_epub:
        # Keep the cited chunk wholly inside the second unit, beyond its leading boundary.
        body = "<p>Second resource context.</p>" * 150 + body
    markup = '<html xmlns="http://www.w3.org/1999/xhtml"><head><style>p{color:red}</style>'
    markup += "</head><body>" + body + "</body></html>"
    data = markup.encode()
    mime = "application/xhtml+xml" if kind == "xhtml" else "text/html"
    if kind == "xml":
        markup = (
            '<?xml version="1.0" encoding="UTF-16"?>\r\n<study label="😀">\n'
            '  <result unit="%">targetchapter 12</result>\n</study>'
        )
        data, mime = markup.encode("utf-16"), "text/xml"
    if is_epub:
        mime = "application/epub+zip"
        # Same quote in both units: only verified source ranges can pick the second.
        first = '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>repeated quotation</p>'
        first += "<p>First resource padding.</p>" * 500 + "</body></html>"
        markup = markup.replace(image, "images/figure.png")
        with io.BytesIO() as output:
            with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
                archive.writestr("mimetype", "application/epub+zip")
                archive.writestr(
                    "META-INF/container.xml",
                    '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
                    '<rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>',
                )
                archive.writestr(
                    "OPS/book.opf",
                    '<package xmlns="http://www.idpf.org/2007/opf"><manifest>'
                    '<item id="b" href="b.xhtml" media-type="application/xhtml+xml"/>'
                    '<item id="a" href="a.xhtml" media-type="application/xhtml+xml"/>'
                    '<item id="figure" href="images/figure.png" media-type="image/png"/>'
                    '<item id="unused"/><item id="unused-bad" href="%FF" media-type="image/png"/>'
                    + (
                        '<item id="duplicate" href="images/figure.png" media-type="image/png"/>'
                        if kind == "epub_duplicate"
                        else ""
                    )
                    + '</manifest><spine><itemref idref="a"/>'
                    '<itemref idref="b"/></spine></package>',
                )
                archive.writestr("OPS/a.xhtml", first)
                archive.writestr("OPS/b.xhtml", markup)
                archive.writestr("OPS/images/figure.png", png)
            data = output.getvalue()
    path = tmp_path / "original"
    path.write_bytes(data)
    item = source()
    item["contents"] = [
        {"key": "TEXT1", "kind": "text_attachment", "version": "1", "media_type": mime}
    ]
    app = make_app(tmp_path / "engine", [0.0])
    with TestClient(app, base_url="http://127.0.0.1:49200") as client:
        notebook, snapshot, preview, prefix = document_scope(client, [item])
        sid = preview["items"][0]["id"]
        result = finished(
            client, prefix, ingest(client, prefix, register(client, prefix, sid, path, "TEXT1"))
        )
        assert result["state"] == "COMPLETE", result
        hit = client.post(
            prefix + "/search", headers=HEADERS, json={"query": "targetchapter"}
        ).json()["items"][0]
        request = {"evidence_id": hit["evidence_id"], "path": str(path)}

        def read(**settings):
            response = client.post(
                prefix + "/documents/original-view", headers=HEADERS, json=request | settings
            )
            assert response.status_code == 200, response.text
            assert len(response.content) < 900_000
            return response.json()

        first_chunk = read()
        assert first_chunk["evidence"]["document_sha256"] == hashlib.sha256(data).hexdigest()
        assert first_chunk["unit_index"] == (1 if is_epub else 0)
        assert first_chunk["unit_count"] == (2 if is_epub else 1)
        assert (
            first_chunk["target_first"] == first_chunk["target_last"] == first_chunk["unit_index"]
        )
        assert first_chunk["offset"] == 0 and len(first_chunk["content"]) <= 64000
        if kind == "xml":
            assert first_chunk["format"] == "source" and first_chunk["content"] == markup
        else:
            assembled = first_chunk["content"]
            while len(assembled) < first_chunk["total"]:
                part = read(unit_index=first_chunk["unit_index"], offset=len(assembled))
                assert part["payload_sha256"] == first_chunk["payload_sha256"]
                assert part["offset"] == len(assembled)
                assembled += part["content"]
            assert hashlib.sha256(assembled.encode()).hexdigest() == first_chunk["payload_sha256"]
            original = json.loads(assembled)
            tokens = original["tokens"]
            assert any(t["tag"] == "th" and t["attributes"].get("colspan") == "2" for t in tokens)
            assert any(t["tag"] == "td" and t["attributes"].get("rowspan") == "2" for t in tokens)
            assert any(t["kind"] == "text" and "Original figure" in t["text"] for t in tokens)
            if kind == "epub_duplicate":
                assert original["images"] == []
                assert any(x["code"] == "UNDECLARED_IMAGE" for x in original["limitations"])
            else:
                assert len(original["images"]) == 1
                decoded = base64.b64decode(original["images"][0]["data_base64"], validate=True)
                assert decoded.startswith(b"\x89PNG")
                assert hashlib.sha256(decoded).hexdigest() == original["images"][0]["sha256"]
            assert {x["code"] for x in original["limitations"]} >= {
                "ACTIVE_CONTENT",
                "EXTERNAL_RESOURCE",
                "UNSUPPORTED_ELEMENT",
            }
            assert not any(t["tag"] in {"script", "svg", "a"} for t in tokens)
            assert all(
                not any(k in {"src", "href", "style", "onclick"} for k in t["attributes"])
                for t in tokens
            )
            inspected = read(unit_index=first_chunk["unit_index"], representation="source")
            assert inspected["content"] == markup[:64000]
            assert inspected["format"] == "source"
            if kind == "large_html":
                assert (
                    first_chunk["total"] > 64000
                    and assembled.count("Preserved large context") == 5000
                )
            if is_epub:
                prior = read(unit_index=0)
                assert prior["resource_id"] == "OPS/a.xhtml"
                assert first_chunk["resource_id"] == "OPS/b.xhtml"
                assert prior["extraction_end"] + 2 == first_chunk["extraction_start"]
        wrong = client.post(
            prefix + "/documents/original-view",
            headers=HEADERS,
            json=request | {"offset": first_chunk["total"]},
        )
        assert wrong.status_code == 422 and wrong.json()["code"] == "INVALID_TEXT_OFFSET"
        if kind == "html":
            from evidra.documents.registry import open_verified

            # Same Windows file identity/size/mtime is insufficient: the immutable digest wins.
            with app.state.services.database.transaction() as connection:
                identity = connection.execute("SELECT file_identity FROM documents").fetchone()[0]
            before = path.stat()
            path.write_bytes(data[:-1] + bytes([data[-1] ^ 1]))
            os.utime(path, ns=(before.st_atime_ns, before.st_mtime_ns))
            with open_verified(path) as opened:
                assert opened.identity == identity
            mismatch = client.post(
                prefix + "/documents/original-view", headers=HEADERS, json=request
            )
            assert mismatch.status_code == 409 and mismatch.json()["code"] == "DOCUMENT_STALE"
            path.write_bytes(data)
        path.write_bytes(b"changed original")
        stale = client.post(prefix + "/documents/original-view", headers=HEADERS, json=request)
        assert stale.status_code == 409 and stale.json()["code"] == "DOCUMENT_STALE"
        assert (
            client.post(
                f"/v1/notebooks/{notebook}/sources/{sid}/revoke",
                headers=HEADERS,
                json={"expected_revision": snapshot["revision"]},
            ).status_code
            == 200
        )
        assert (
            client.post(
                prefix + "/documents/original-view", headers=HEADERS, json=request
            ).status_code
            == 403
        )
