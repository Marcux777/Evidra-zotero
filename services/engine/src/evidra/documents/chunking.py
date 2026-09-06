"""Page-local chunks with reversible search normalization and immutable offsets."""

import unicodedata
from dataclasses import dataclass

POLICY_VERSION = "page-paragraph-2400-320-v1"


@dataclass(frozen=True)
class Chunk:
    start: int
    end: int
    original: str
    normalized: str
    normalization_map: list[tuple[int, int]]


def normalize(text: str) -> tuple[str, list[tuple[int, int]]]:
    output: list[str] = []
    positions: list[tuple[int, int]] = []
    for index, character in enumerate(text):
        if character.isspace():
            if output and output[-1] == " ":
                positions[-1] = (positions[-1][0], index + 1)
            else:
                output.append(" ")
                positions.append((index, index + 1))
        else:
            for value in unicodedata.normalize("NFKC", character).casefold():
                output.append(value)
                positions.append((index, index + 1))
    return "".join(output), positions


def chunks(text: str) -> list[Chunk]:
    result = []
    start = 0
    while start < len(text):
        end = min(start + 2400, len(text))
        if end < len(text):
            paragraph = max(
                text.rfind("\r\n\r\n", start + 1200, end), text.rfind("\n\n", start + 1200, end)
            )
            if paragraph >= 0:
                end = paragraph
        original = text[start:end]
        normalized, positions = normalize(original)
        if normalized.strip():
            result.append(
                Chunk(
                    start, end, original, normalized, [(a + start, b + start) for a, b in positions]
                )
            )
        if end == len(text):
            break
        start = max(start + 1, end - 320)
    return result
