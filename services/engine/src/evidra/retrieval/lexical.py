"""Offline FTS5 search: authorized version joins precede ranking and pagination."""

import re
from typing import Literal

from evidra.documents.chunking import normalize
from evidra.domain.documents import SearchHit, SearchPage, SearchRequest
from evidra.domain.sources import content_version
from evidra.evidence.service import EvidenceService
from evidra.scope.service import ScopeContext

WORD = re.compile(r"[^\W_]+", flags=re.UNICODE)
PHRASE = re.compile(r'"([^"]*)"')
MAX_TERMS = 32
# Function words of the two interface languages. A natural-language question keeps only
# its content terms; the original query text is never altered or used as FTS syntax.
STOPWORDS = frozenset(
    """a about above after again all also am an and any are as at be because been before
    being between both but by can could did do does doing done during each either for from
    had has have having he her here hers him his how i if in into is it its itself just me
    more most my no nor not of off on once only or other our out over own same she should so
    some such than that the their them then there these they this those through to too under
    until up very was we were what when where which while who whom why will with would you
    your study studies paper papers report reports reported article work
    à às ao aos aquela aquele aquilo as até com como da das de dela dele deles do dos e é ela
    ele eles em entre era essa esse esta está estão este eu foi foram há isso isto já la lhe
    mais mas me mesmo meu minha muito na nas nem no nos nós o os ou para pela pelas pelo pelos
    por qual quais quando que quem se sem ser seu sua são só também te tem têm um uma umas uns
    você vocês informa informam sobre estudo estudos artigo artigos trabalho""".split()
)


def fts_query(text: str, match: Literal["any", "all"] = "any") -> str:
    """Return FTS5 syntax built only from quoted Unicode word tokens and quoted phrases.

    `any` ranks chunks containing any content term by BM25, so a natural question retrieves
    passages sharing its rare terms. `all` requires every content term and phrase. Stopwords
    are dropped unless the query has no other term.
    """
    normalized = normalize(text)[0]
    phrases = [WORD.findall(p) for p in PHRASE.findall(normalized)]
    words = WORD.findall(PHRASE.sub(" ", normalized))
    content = [w for w in words if w not in STOPWORDS] or words
    parts = [" ".join(p) for p in phrases if p] + content
    unique = list(dict.fromkeys(parts))[:MAX_TERMS]
    joiner = " AND " if match == "all" else " OR "
    return joiner.join('"' + part.replace('"', '""') + '"' for part in unique)


class LexicalSearch:
    def __init__(self, evidence: EvidenceService) -> None:
        self.evidence, self.scopes = evidence, evidence.scopes

    def search(
        self, context: ScopeContext, body: SearchRequest, *, document_version_id: str | None = None
    ) -> SearchPage:
        # All query syntax is data. Unicode word tokens are individually quoted, never SQL.
        query = fts_query(body.query, body.match)
        with self.scopes.guarded(context, capability=context.capability) as connection:
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
                        "AND (source_kind NOT IN ('pdf','text_attachment') OR file_identity!='')",
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
            parameters: tuple[str, ...] = (query,)
            if document_version_id is not None:
                joins += " AND c.version_id=?"
                parameters += (document_version_id,)
            total = connection.execute("SELECT count(*)" + joins, parameters).fetchone()[0]
            rows = connection.execute(
                "SELECT c.id,bm25(document_fts) AS score,v.document_id"
                + joins
                + " ORDER BY score,c.id LIMIT ? OFFSET ?",
                (*parameters, body.limit, body.offset),
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
