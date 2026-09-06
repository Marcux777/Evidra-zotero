"""Offline FTS5 search: authorized version joins precede ranking and pagination."""

import re

from evidra.documents.chunking import normalize
from evidra.domain.documents import SearchHit, SearchPage, SearchRequest
from evidra.domain.sources import content_version
from evidra.evidence.service import EvidenceService
from evidra.scope.service import ScopeContext


class LexicalSearch:
    def __init__(self, evidence: EvidenceService) -> None:
        self.evidence, self.scopes = evidence, evidence.scopes

    def search(self, context: ScopeContext, body: SearchRequest) -> SearchPage:
        # All query syntax is data. Unicode word tokens are individually quoted, never SQL.
        terms = re.findall(r"[^\W_]+", normalize(body.query)[0], flags=re.UNICODE)
        query = " AND ".join('"' + term.replace('"', '""') + '"' for term in terms)
        with self.scopes.guarded(context) as connection:
            connection.execute(
                "CREATE TEMP TABLE IF NOT EXISTS lexical_allowed (version_id TEXT PRIMARY KEY)"
            )
            connection.execute("DELETE FROM lexical_allowed")
            for member in self.scopes.members(connection, context.notebook_id, context.snapshot_id):
                source = self.scopes.content(connection, member)
                for content in source.contents:
                    connection.execute(
                        "INSERT OR IGNORE INTO lexical_allowed "
                        "SELECT current_version_id FROM documents "
                        "WHERE source_id=? AND content_key=? "
                        "AND content_version=? AND current_version_id IS NOT NULL "
                        "AND coverage!='MISSING_FILE' "
                        "AND (source_kind!='pdf' OR file_identity!='')",
                        (source.id, content.key, content_version(content)),
                    )
            if not query:
                return SearchPage(
                    items=[], offset=body.offset, limit=body.limit, total=0, documents_retrieved=0
                )
            joins = (
                " FROM document_fts JOIN document_chunks c ON c.id=document_fts.chunk_id "
                "JOIN lexical_allowed a ON a.version_id=c.version_id "
                "JOIN document_versions v ON v.id=c.version_id WHERE document_fts MATCH ?"
            )
            total = connection.execute("SELECT count(*)" + joins, (query,)).fetchone()[0]
            rows = connection.execute(
                "SELECT c.id,bm25(document_fts) AS score,v.document_id"
                + joins
                + " ORDER BY score,c.id LIMIT ? OFFSET ?",
                (query, body.limit, body.offset),
            ).fetchall()
            hits = []
            for row in rows:
                value = self.evidence.from_connection(connection, context, row["id"])
                hits.append(
                    SearchHit(
                        evidence_id=value.id,
                        source_id=value.source_id,
                        content_key=value.content_key,
                        source_kind=value.source_kind,
                        excerpt=value.excerpt,
                        page_index=value.page_index,
                        page_label=value.page_label,
                        historical=value.historical,
                        score=row["score"],
                    )
                )
            return SearchPage(
                items=hits,
                offset=body.offset,
                limit=body.limit,
                total=total,
                documents_retrieved=len({row["document_id"] for row in rows}),
            )
