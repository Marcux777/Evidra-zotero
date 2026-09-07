"""Deterministic RRF defaults are engineering parameters, not a quality claim."""


def fuse(lexical: list[str], vectors: list[str]) -> list[str]:
    scores: dict[str, float] = {}
    for ranking in (lexical[:40], vectors[:40]):
        for rank, identity in enumerate(ranking, 1):
            scores[identity] = scores.get(identity, 0) + 1 / (60 + rank)
    return sorted(scores, key=lambda identity: (-scores[identity], identity))
