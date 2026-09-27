"""Relevance-triage pilot metrics from an Evidra JSON export and a human label sheet.

Usage (from the repository root):
  uv run --project services/engine python scripts/relevance_metrics.py template EXPORT.json > labels.csv
  uv run --project services/engine python scripts/relevance_metrics.py score EXPORT.json labels.csv \
      --stage TITLE_ABSTRACT --threshold 2 --out report.json

The export is the portable JSON (notebook.json) the plugin writes. Labels are made by a
person before looking at model proposals. Model failures are never dropped: a study
without a valid proposal counts as forwarded to manual review, so recall is not inflated
and the missing work is visible. Nothing here writes to the notebook.
"""

import argparse
import csv
import io
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

FORWARD = {"INCLUDE", "UNCERTAIN"}


def load_export(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return data["notebook"] if "notebook" in data and "records" not in data else data


def screening_rows(
    export: dict[str, Any], stage: str, protocol: str | None = None
) -> list[dict[str, Any]]:
    """Latest screening run per study for one stage, with its latest artifact version."""
    records = [r for r in export["records"] if r.get("origin", "LOCAL") == "LOCAL"]
    sources = {r["data"]["id"]: r["data"] for r in records if r["kind"] == "source"}
    runs = {r["data"]["id"]: r["data"] for r in records if r["kind"] == "research_run"}
    previews = {
        r["data"]["run_id"]: r["data"]
        for r in records
        if r["kind"] == "research_preview"
    }
    latest_artifact: dict[str, dict[str, Any]] = {}
    for record in records:
        if record["kind"] != "artifact":
            continue
        value = record["data"]
        current = latest_artifact.get(value["artifact_id"])
        if current is None or value["revision"] > current["revision"]:
            latest_artifact[value["artifact_id"]] = value
    by_run = {a["run_id"]: a for a in latest_artifact.values()}
    protocols = sorted(
        {
            p["request"]["protocol_version_id"]
            for p in previews.values()
            if p["request"]["kind"] == "SCREENING"
        }
    )
    if protocol is None:
        chosen = [
            r
            for r in records
            if r["kind"] == "protocol" and r["data"]["id"] in protocols
        ]
        protocol = (
            max(chosen, key=lambda r: r["data"]["revision"])["data"]["id"]
            if chosen
            else None
        )
    latest: dict[str, dict[str, Any]] = {}
    for run_id, preview in previews.items():
        request = preview["request"]
        if (request["kind"], request.get("stage"), request["protocol_version_id"]) != (
            "SCREENING",
            stage,
            protocol,
        ) or run_id not in runs:
            continue
        run = runs[run_id]
        source_id = request["source_id"]
        if (
            source_id not in latest
            or run["created_at"] > latest[source_id]["run"]["created_at"]
        ):
            latest[source_id] = {"run": run, "artifact": by_run.get(run_id)}
    rows = []
    for source_id, source in sources.items():
        found = latest.get(source_id)
        artifact = found and found["artifact"]
        rows.append(
            {
                "item_key": source["identity"]["item_key"],
                "library_id": source["identity"]["library_id"],
                "title": source.get("title", ""),
                "run_state": found and found["run"]["state"],
                "run_reason": found and found["run"].get("reason"),
                "review_state": artifact and artifact["review_state"],
                "output": artifact and artifact["output"],
            }
        )
    return sorted(rows, key=lambda r: (r["title"].casefold(), r["item_key"]))


def template(rows: list[dict[str, Any]], criteria: list[str]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(
        [
            "item_key",
            "title",
            "grade",
            "decision",
            *[f"criterion:{c}" for c in criteria],
            "reusable",
            "notes",
        ]
    )
    for row in rows:
        writer.writerow(
            [row["item_key"], row["title"], "", "", *["" for _ in criteria], "", ""]
        )
    return buffer.getvalue()


def weighted_kappa(pairs: list[tuple[int, int]], levels: list[int]) -> float | None:
    if len(pairs) < 2 or len(levels) < 2:
        return None
    index = {v: i for i, v in enumerate(levels)}
    k = len(levels)
    observed = [[0.0] * k for _ in range(k)]
    for human, model in pairs:
        observed[index[human]][index[model]] += 1
    n = len(pairs)
    rows = [sum(r) for r in observed]
    cols = [sum(observed[i][j] for i in range(k)) for j in range(k)]
    weight = [[((i - j) ** 2) / ((k - 1) ** 2) for j in range(k)] for i in range(k)]
    num = sum(weight[i][j] * observed[i][j] for i in range(k) for j in range(k))
    den = sum(weight[i][j] * rows[i] * cols[j] / n for i in range(k) for j in range(k))
    return None if den == 0 else 1 - num / den


def ratio(numerator: int, denominator: int) -> float | None:
    return None if denominator == 0 else numerator / denominator


def score(
    rows: list[dict[str, Any]], labels: list[dict[str, str]], threshold: int
) -> dict[str, Any]:
    by_key = {r["item_key"]: r for r in rows}
    labelled = [label for label in labels if label.get("grade", "").strip() != ""]
    unknown = [
        label["item_key"] for label in labelled if label["item_key"] not in by_key
    ]
    papers = []
    for label in labelled:
        row = by_key.get(label["item_key"])
        if row is None:
            continue
        output = row["output"]
        status = (
            "PROPOSED"
            if output
            else ("NOT_RUN" if row["run_state"] is None else "NO_VALID_PROPOSAL")
        )
        papers.append(
            {
                "item_key": label["item_key"],
                "title": row["title"],
                "human_grade": int(label["grade"]),
                "human_positive": int(label["grade"]) >= threshold,
                "status": status,
                "run_state": row["run_state"],
                "run_reason": row["run_reason"],
                "model_decision": output and output["decision"],
                "model_grade": output and output.get("relevance_grade"),
                # A study without a valid proposal must still be screened by a person.
                "forwarded": (output is None) or output["decision"] in FORWARD,
                "verdicts": {
                    v["criterion_id"]: v["verdict"]
                    for v in (output or {}).get("verdicts", [])
                },
                "labels": {
                    k.split(":", 1)[1]: v.strip()
                    for k, v in label.items()
                    if k and k.startswith("criterion:") and v and v.strip()
                },
            }
        )
    positives = [p for p in papers if p["human_positive"]]
    included = [p for p in papers if p["model_decision"] == "INCLUDE"]
    forwarded = [p for p in papers if p["forwarded"]]
    missed = [p for p in positives if not p["forwarded"]]
    # Ranked screening: papers without a model grade are reviewed first (conservative).
    ranked = sorted(
        papers,
        key=lambda p: (
            p["model_grade"] is not None,
            -(p["model_grade"] if p["model_grade"] is not None else 0),
            p["title"].casefold(),
        ),
    )
    wss = None
    if positives:
        needed = -(-95 * len(positives) // 100)
        found = 0
        for reviewed, paper in enumerate(ranked, 1):
            found += paper["human_positive"]
            if found >= needed:
                wss = (len(papers) - reviewed) / len(papers) - 0.05
                break
    graded = [
        (p["human_grade"], p["model_grade"])
        for p in papers
        if p["model_grade"] is not None
    ]
    levels = sorted({g for pair in graded for g in pair})
    criteria: dict[str, dict[str, int]] = {}
    for paper in papers:
        for criterion, human in paper["labels"].items():
            model = paper["verdicts"].get(criterion)
            entry = criteria.setdefault(
                criterion, {"labelled": 0, "agree": 0, "no_model_verdict": 0}
            )
            entry["labelled"] += 1
            entry["agree"] += model == human
            entry["no_model_verdict"] += model is None
    ties = Counter(p["model_grade"] for p in papers if p["model_grade"] is not None)
    return {
        "threshold": threshold,
        "planned_labelled": len(labelled),
        "labels_without_study": unknown,
        "evaluated": len(papers),
        "status": dict(Counter(p["status"] for p in papers)),
        "failure_reasons": dict(
            Counter(p["run_reason"] for p in papers if p["status"] != "PROPOSED")
        ),
        "human_positives": len(positives),
        "recall_forwarded": ratio(len(positives) - len(missed), len(positives)),
        "recall_include": ratio(
            sum(p["human_positive"] for p in included), len(positives)
        ),
        "precision_include": ratio(
            sum(p["human_positive"] for p in included), len(included)
        ),
        "forwarded_fraction": ratio(len(forwarded), len(papers)),
        "missed_positives": [
            {
                "item_key": p["item_key"],
                "title": p["title"],
                "model_decision": p["model_decision"],
                "model_grade": p["model_grade"],
            }
            for p in missed
        ],
        "wss_at_95": wss,
        "grade_pairs": len(graded),
        "grade_exact": ratio(sum(h == m for h, m in graded), len(graded)),
        "grade_within_one": ratio(sum(abs(h - m) <= 1 for h, m in graded), len(graded)),
        "grade_quadratic_kappa": weighted_kappa(graded, levels),
        "grade_ties": {str(k): v for k, v in sorted(ties.items())},
        "criteria": {
            k: v | {"agreement": ratio(v["agree"], v["labelled"])}
            for k, v in criteria.items()
        },
        "papers": papers,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)
    tpl = sub.add_parser("template")
    tpl.add_argument("export", type=Path)
    tpl.add_argument("--stage", default="TITLE_ABSTRACT")
    run = sub.add_parser("score")
    run.add_argument("export", type=Path)
    run.add_argument("labels", type=Path)
    run.add_argument(
        "--stage", default="TITLE_ABSTRACT", choices=["TITLE_ABSTRACT", "FULL_TEXT"]
    )
    run.add_argument("--threshold", type=int, default=2)
    run.add_argument("--protocol")
    run.add_argument("--out", type=Path)
    args = parser.parse_args(argv)
    export = load_export(args.export)
    if args.command == "template":
        rows = screening_rows(export, args.stage)
        protocols = [r["data"] for r in export["records"] if r["kind"] == "protocol"]
        criteria = (
            [c["id"] for c in max(protocols, key=lambda p: p["revision"])["criteria"]]
            if protocols
            else []
        )
        sys.stdout.write(template(rows, criteria))
        return 0
    rows = screening_rows(export, args.stage, args.protocol)
    with args.labels.open(encoding="utf-8-sig", newline="") as handle:
        labels = list(csv.DictReader(handle))
    report = score(rows, labels, args.threshold)
    text = json.dumps(report, indent=2, ensure_ascii=False)
    if args.out:
        args.out.write_text(text, encoding="utf-8")
    summary = {k: v for k, v in report.items() if k != "papers"}
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
