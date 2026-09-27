"""Relevance pilot metrics: denominators keep failures and missed positives visible."""

import importlib.util
import json
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[3] / "scripts" / "relevance_metrics.py"
spec = importlib.util.spec_from_file_location("relevance_metrics", SCRIPT)
metrics = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(metrics)


def record(kind, data):
    return {"kind": kind, "id": data.get("id", data.get("run_id")), "origin": "LOCAL", "data": data}


def export():
    records = [record("protocol", {"id": "p" * 32, "revision": 1, "criteria": [{"id": "atari"}]})]
    papers = [
        ("A", "INCLUDE", 3, "COMPLETE"),
        ("B", "EXCLUDE", 0, "COMPLETE"),
        ("C", "EXCLUDE", 0, "COMPLETE"),  # a human positive the model excluded
        ("D", None, None, "FAILED"),  # no valid proposal: manual review
        ("E", "UNCERTAIN", None, "PARTIAL"),
    ]
    for i, (key, decision, grade, state) in enumerate(papers):
        source = {
            "id": key * 64,
            "identity": {"item_key": f"ITEM000{key}", "library_id": 1},
            "title": key,
        }
        run = {
            "id": f"{i}" * 32,
            "state": state,
            "reason": "INVALID_OUTPUT" if state == "FAILED" else None,
            "created_at": f"2026-09-27T00:00:0{i}Z",
        }
        records += [
            record("source", source),
            record("research_run", run),
            record(
                "research_preview",
                {
                    "run_id": run["id"],
                    "request": {
                        "kind": "SCREENING",
                        "stage": "TITLE_ABSTRACT",
                        "protocol_version_id": "p" * 32,
                        "source_id": source["id"],
                    },
                },
            ),
        ]
        if decision:
            records.append(
                record(
                    "artifact",
                    {
                        "id": f"{i}" * 31 + "a",
                        "artifact_id": f"{i}" * 31 + "b",
                        "revision": 1,
                        "run_id": run["id"],
                        "review_state": "UNREVIEWED",
                        "output": {
                            "decision": decision,
                            "relevance_grade": grade,
                            "verdicts": [
                                {"criterion_id": "atari", "verdict": "MET" if grade else "NOT_MET"}
                            ],
                        },
                    },
                )
            )
    return {"records": records}


def test_template_lists_every_study_for_blind_labelling():
    rows = metrics.screening_rows(export(), "TITLE_ABSTRACT")
    text = metrics.template(rows, ["atari"])
    lines = text.splitlines()
    assert lines[0] == "item_key,title,grade,decision,criterion:atari,reusable,notes"
    assert [line.split(",")[0] for line in lines[1:]] == [f"ITEM000{k}" for k in "ABCDE"]
    assert all(",," in line for line in lines[1:])  # no model output leaks into the sheet


def test_score_counts_failures_as_manual_work_and_reports_missed_positives():
    rows = metrics.screening_rows(export(), "TITLE_ABSTRACT")
    labels = [
        {"item_key": "ITEM000A", "grade": "3", "criterion:atari": "MET"},
        {"item_key": "ITEM000B", "grade": "0", "criterion:atari": "NOT_MET"},
        {"item_key": "ITEM000C", "grade": "2", "criterion:atari": "MET"},
        {"item_key": "ITEM000D", "grade": "3"},
        {"item_key": "ITEM000E", "grade": "1"},
        {"item_key": "ITEM000Z", "grade": "1"},  # label for a study not in the export
    ]
    report = metrics.score(rows, labels, threshold=2)
    assert report["evaluated"] == 5 and report["labels_without_study"] == ["ITEM000Z"]
    assert report["status"] == {"PROPOSED": 4, "NO_VALID_PROPOSAL": 1}
    assert report["failure_reasons"] == {"INVALID_OUTPUT": 1}
    assert report["human_positives"] == 3
    # A and D are forwarded (D because it has no valid proposal); C was wrongly excluded.
    assert report["recall_forwarded"] == 2 / 3
    assert report["recall_include"] == 1 / 3 and report["precision_include"] == 1.0
    assert [m["item_key"] for m in report["missed_positives"]] == ["ITEM000C"]
    assert report["criteria"]["atari"] == {
        "labelled": 3,
        "agree": 2,
        "no_model_verdict": 0,
        "agreement": 2 / 3,
    }
    assert report["grade_pairs"] == 3 and report["grade_exact"] == 2 / 3
    assert report["wss_at_95"] is not None and report["wss_at_95"] < 0.5
    json.dumps(report)  # serializable as a receipt
