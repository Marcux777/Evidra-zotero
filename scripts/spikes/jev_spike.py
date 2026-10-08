# /// script
# requires-python = ">=3.12"
# dependencies = ["httpx"]
# ///
"""J0 — spike do Jev (TypeSafe System One): três hipóteses contra a API real.

H1 âncora por ID (Choice cujas opções são IDs opacos que apontam para campos do state);
H2 critério por Noul (probabilidades separam atendido / não atendido / sem informação);
H3 orçamento (input_tokens de um state com trechos dirigidos e várias perguntas).

Uso (a partir da raiz do repositório):
    uv run scripts/spikes/jev_spike.py fetch            # baixa os artigos CC-BY do Europe PMC
    uv run scripts/spikes/jev_spike.py models           # GET /v1/models (0 tokens)
    uv run scripts/spikes/jev_spike.py run [--only H1|H2|H3|PILOT] [--budget N]
    uv run scripts/spikes/jev_spike.py report           # gera docs/evaluation/JEV_SPIKE.md

A chave vem do Secret Service (`secret-tool lookup service typesafe`); não há fallback para
variável de ambiente e a chave nunca é impressa nem gravada. Cada chamada é gravada num ledger
bruto (.local/spike/ledger_raw.jsonl, ignorado pelo Git) e numa versão redigida, em que o texto
dos artigos é trocado por referência+hash (docs/evaluation/JEV_SPIKE_LEDGER.jsonl). A execução é
retomável: uma chamada com o mesmo call_id já gravada não é enviada de novo.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import re
import statistics
import subprocess
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / ".local" / "spike"
RAW = WORK / "ledger_raw.jsonl"
PUBLIC = ROOT / "docs" / "evaluation" / "JEV_SPIKE_LEDGER.jsonl"
REPORT = ROOT / "docs" / "evaluation" / "JEV_SPIKE.md"
BASE_URL = "https://api.typesafe.ai"
MODEL = "jev-latest"
EXCERPT_CAP = 1500  # caracteres por trecho
MIN_PARAGRAPH = 200
DEFAULT_BUDGET = 600_000  # teto de input_tokens do spike inteiro

# Artigos open access, licença CC BY 4.0 confirmada no XML; nenhum é do RL-20 nem da busca real.
ARTICLES = {
    "PMC11074813": "Effectiveness of Personalized Hippocampal Network–Targeted Stimulation in Alzheimer Disease (JAMA Netw Open 2024)",
    "PMC11186782": "p75 neurotrophin receptor modulation in mild to moderate Alzheimer disease: a randomized, placebo-controlled phase 2a trial (Nat Med 2024)",
    "PMC11059071": "Downstream Biomarker Effects of Gantenerumab or Solanezumab in Dominantly Inherited Alzheimer Disease (JAMA Neurol 2024)",
}

# Microcasos sintéticos já existentes no repositório: services/engine/tests/test_triage.py::PAPERS
SYNTHETIC = {
    "ATARIPAP": "Deep Q-networks reach human level on Atari games with a replay buffer.",
    "ROBOTPAP": "A legged robot learns to walk on real hardware with model predictive control.",
    "NOABSTRA": "",
}

# ---------------------------------------------------------------- H1: perguntas com resposta única
# (id, artigo, pergunta, regex que identifica o único parágrafo correto)
H1_QUESTIONS = [
    ("q01", "PMC11074813", "reports how many participants were screened and how many were randomly assigned", r"41 were randomly assigned"),
    ("q02", "PMC11074813", "defines the primary outcome measure of the trial", r"The primary outcome measure was"),
    ("q03", "PMC11074813", "gives the clinical trial registration number", r"NCT04260724"),
    ("q04", "PMC11074813", "describes the stimulation protocol, including the number of pulses per day", r"1600 pulses"),
    ("q05", "PMC11074813", "lists the limitations of the study", r"several limitations in our study"),
    ("q06", "PMC11186782", "reports how many participants were screened for inclusion", r"316 participants were screened"),
    ("q07", "PMC11186782", "reports how many participants developed eosinophilia", r"Eosinophilia occurred in ten participants"),
    ("q08", "PMC11186782", "gives the clinical trial registration numbers", r"NCT03069014"),
    ("q09", "PMC11186782", "reports the conclusion of the Data Safety Monitoring Board", r"Data Safety Monitoring Board concluded"),
    ("q10", "PMC11059071", "names the software used for the statistical analysis", r"SAS, version 9\.4"),
    ("q11", "PMC11059071", "reports the mean age of the participants analyzed", r"mean \[SD\] age, 44"),
    ("q12", "PMC11059071", "reports the effect of gantenerumab on CSF neurogranin at year 4", r"242\.43"),
]
H1_KS = (3, 5, 10)

# ---------------------------------------------------------------- H2: casos conhecidos
# (id, classe, fonte, regex do parágrafo (artigo) ou chave sintética, critério, termos proibidos no trecho)
H2_CASES = [
    ("a1", "met", "PMC11074813", r"single-centered, randomized, controlled study", "The study is a randomized controlled trial.", ()),
    ("a2", "not_met", "PMC11074813", r"Eligible participants were aged between 55 and 90", "The study enrolled participants younger than 18 years.", ()),
    ("a3", "no_info", "PMC11074813", r"The sample size was estimated based on a previous study", "The study reports the proportion of female participants.", ("women", "female", "sex ")),
    ("b1", "met", "PMC11186782", r"All secondary endpoints were prespecified in the registrations", "The trial was registered in a public trial registry.", ()),
    ("b2", "not_met", "PMC11186782", r"All trial participants had a biologically confirmed AD diagnosis", "Participants were enrolled without biological confirmation of Alzheimer disease.", ()),
    ("b3", "no_info", "PMC11186782", r"Prespecified exploratory CSF biomarkers collected in the trial", "The study reports its funding source.", ("fund", "grant", "sponsor", "supported by")),
    ("c1", "met", "PMC11059071", r"double-blind, placebo-controlled, phase 3 randomized clinical trial", "The trial used a double-blind design.", ()),
    ("c2", "not_met", "PMC11059071", r"double-blind, placebo-controlled, phase 3 randomized clinical trial", "The trial lasted less than six months.", ()),
    ("c3", "no_info", "PMC11059071", r"All analyses were conducted with SAS", "The study reports the mean MMSE score of the participants.", ("MMSE", "mini-mental")),
    ("s1", "met", "SYN:ATARIPAP", "", "The study applies deep reinforcement learning to Atari games.", ()),
    ("s2", "not_met", "SYN:ROBOTPAP", "", "The study applies deep reinforcement learning to Atari games.", ()),
    ("s3", "no_info", "SYN:NOABSTRA", "", "The study applies deep reinforcement learning to Atari games.", ()),
]
H2_NOUL_CRITERIA = {
    "true": "The excerpt explicitly supports the statement.",
    "false": "The excerpt explicitly contradicts the statement or states the opposite.",
}
H2_MET_MIN, H2_NOTMET_MAX, H2_AMBIG = 0.7, 0.3, (0.3, 0.7)  # pré-registrados (LIMIAR do jev_decide.py)

# ---------------------------------------------------------------- H3: leque substituto de perguntas
H3_QUESTIONS = [
    "The excerpts describe a randomized design.",
    "The excerpts report a sample size.",
    "The excerpts report a placebo or sham control.",
    "The excerpts report a primary outcome.",
    "The excerpts report adverse events.",
    "The excerpts report a statistically significant result.",
    "The excerpts report a limitation of the study.",
    "The excerpts report biomarker measurements.",
    "The excerpts report the age of the participants.",
    "The excerpts name a trial registry identifier.",
]


# ================================================================= infraestrutura
def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def sha(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def api_key() -> str:
    try:
        out = subprocess.run(["secret-tool", "lookup", "service", "typesafe"], capture_output=True, text=True, timeout=30)
    except FileNotFoundError as error:
        raise SystemExit("erro: secret-tool não encontrado; a chave deve estar no Secret Service") from error
    key = out.stdout.strip()
    if out.returncode != 0 or not key:
        raise SystemExit(
            "erro: chave ausente no Secret Service (service=typesafe). Cadastre uma vez com:\n"
            "  printf %s \"$TYPESAFE_API_KEY\" | secret-tool store --label='TypeSafe API' service typesafe"
        )
    return key


def fetch_articles() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    for pmcid in ARTICLES:
        url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/{pmcid}/fullTextXML"
        data = urllib.request.urlopen(url, timeout=60).read()  # noqa: S310 - URL fixa, https
        if b"creativecommons.org/licenses/by/4.0" not in data:
            raise SystemExit(f"erro: {pmcid} sem licença CC BY 4.0 no XML; não usar")
        (WORK / f"{pmcid}.xml").write_bytes(data)
        print(pmcid, len(data), sha(data.decode("utf-8", "replace"))[:16])


def paragraphs(pmcid: str) -> list[dict]:
    path = WORK / f"{pmcid}.xml"
    if not path.exists():
        raise SystemExit(f"erro: {path} ausente; rode `fetch`")
    body = ET.parse(path).getroot().find(".//body")
    out: list[dict] = []
    for sec in body.iter("sec"):
        title = sec.find("title")
        for p in sec.findall("p"):
            text = " ".join("".join(p.itertext()).split())
            if len(text) >= MIN_PARAGRAPH:
                out.append({"ref": f"{pmcid}#p{len(out) + 1}", "section": "".join(title.itertext()).strip() if title is not None else "", "text": text[:EXCERPT_CAP]})
    return out


def find_unique(paras: list[dict], regex: str) -> dict:
    hits = [p for p in paras if re.search(regex, p["text"])]
    if len(hits) != 1:
        raise SystemExit(f"erro: regex {regex!r} casou {len(hits)} parágrafos (esperado 1)")
    return hits[0]


class Ledger:
    def __init__(self) -> None:
        WORK.mkdir(parents=True, exist_ok=True)
        self.done: dict[str, dict] = {}
        if RAW.exists():
            for line in RAW.read_text().splitlines():
                entry = json.loads(line)
                if entry["status"] == 200:
                    self.done[entry["call_id"]] = entry
        self.input_tokens = sum(e["response"]["usage"]["input_tokens"] for e in self.done.values())

    def append(self, entry: dict) -> None:
        with RAW.open("a") as fh:
            fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
        if entry["status"] == 200:
            self.done[entry["call_id"]] = entry
            self.input_tokens += entry["response"]["usage"]["input_tokens"]


class Client:
    def __init__(self, ledger: Ledger, budget: int) -> None:
        self.http = httpx.Client(base_url=BASE_URL, timeout=120.0)
        self.key = api_key()
        self.ledger = ledger
        self.budget = budget

    def call(self, call_id: str, hypothesis: str, state, questions: dict, refs: dict[str, dict], meta: dict) -> dict:
        if call_id in self.ledger.done:
            return self.ledger.done[call_id]
        if self.ledger.input_tokens >= self.budget:
            raise SystemExit(f"erro: orçamento de {self.budget} input_tokens esgotado antes de {call_id}")
        body = {"state": state, "model": MODEL, "questions": questions}
        payload = json.dumps(body, ensure_ascii=False).encode()
        started = time.monotonic()
        resp = self.http.post("/v1/systemone", content=payload, headers={"Authorization": f"Bearer {self.key}", "Content-Type": "application/json", "Accept": "application/json"})
        entry = {
            "call_id": call_id, "hypothesis": hypothesis, "ts": now(), "status": resp.status_code,
            "latency_ms": round((time.monotonic() - started) * 1000), "request_id": resp.headers.get("x-typesafe-request-id"),
            "request_sha256": hashlib.sha256(payload).hexdigest(), "request_bytes": len(payload),
            "meta": meta, "refs": refs, "request": body,
        }
        try:
            entry["response"] = resp.json()
        except ValueError:
            entry["response"] = {"raw": resp.text[:500]}
        self.ledger.append(entry)
        if resp.status_code != 200:
            raise SystemExit(f"erro: {call_id} devolveu HTTP {resp.status_code}: {json.dumps(entry['response'])[:300]}")
        usage = entry["response"].get("usage", {})
        if not isinstance(usage.get("input_tokens"), int):
            raise SystemExit(f"erro: {call_id} sem usage.input_tokens inteiro: {usage!r}")
        return entry


def choice_question(instruction: str, criteria: dict) -> dict:
    return {"type": "choice", "instructions": instruction, "criteria": criteria}


def noul_question(instruction: str, criteria: dict | None) -> dict:
    q: dict = {"type": "noul", "instructions": instruction}
    if criteria is not None:
        q["criteria"] = criteria
    return q


# ================================================================= H1
def h1_variant(variant: str, title: str, excerpts: list[tuple[str, dict]], instruction: str) -> tuple[object, dict]:
    ids = [i for i, _ in excerpts]
    if variant == "opaque":
        return {"excerpts": {i: p["text"] for i, p in excerpts}}, choice_question(instruction, {i: None for i in ids})
    if variant == "marked":
        text = "Excerpts from the article:\n\n" + "\n\n".join(f"[{i}] {p['text']}" for i, p in excerpts)
        return text, choice_question(instruction, {i: None for i in ids})
    if variant == "desc":
        return {"article": title}, choice_question(instruction, {i: p["text"] for i, p in excerpts})
    raise ValueError(variant)


def h1_plan() -> list[tuple[str, str, int, int]]:
    plan = []
    for q in H1_QUESTIONS:
        for k in H1_KS:
            for rep in (0, 1):
                plan.append((q[0], "opaque", k, rep))
            plan.append((q[0], "desc", k, 0))
            if k >= 5:
                plan.append((q[0], "marked", k, 0))
    return plan


def run_h1(client: Client, only_pilot: bool = False) -> None:
    cache: dict[str, list[dict]] = {}
    plan = h1_plan()
    if only_pilot:
        plan = [p for p in plan if p[0] == "q03" and p[2] == 3 and p[3] == 0][:3]
    for qid, variant, k, rep in plan:
        _, pmcid, what, regex = next(q for q in H1_QUESTIONS if q[0] == qid)
        paras = cache.setdefault(pmcid, paragraphs(pmcid))
        correct = find_unique(paras, regex)
        rng = random.Random(f"h1|{qid}|{k}|{rep}")
        pool = [p for p in paras if p is not correct]
        picks = rng.sample(pool, k - 1) + [correct]
        rng.shuffle(picks)
        excerpts = [(f"e{n + 1}", p) for n, p in enumerate(picks)]
        correct_id = next(i for i, p in excerpts if p is correct)
        instruction = f"Which excerpt {what}? Answer with the excerpt ID."
        state, question = h1_variant(variant, ARTICLES[pmcid], excerpts, instruction)
        refs = {i: {"ref": p["ref"], "sha256": sha(p["text"]), "chars": len(p["text"])} for i, p in excerpts}
        refs["_texts"] = {sha(p["text"]): p["text"] for _, p in excerpts}  # só no ledger bruto
        client.call(f"H1|{qid}|{variant}|k{k}|r{rep}", "H1", state, {"answer": question}, refs,
                    {"qid": qid, "variant": variant, "k": k, "rep": rep, "correct_id": correct_id, "correct_ref": correct["ref"]})
    if not only_pilot:
        # determinismo: o mesmo pedido idêntico enviado 3 vezes
        qid, pmcid = "q03", "PMC11074813"
        paras = cache.setdefault(pmcid, paragraphs(pmcid))
        q = next(q for q in H1_QUESTIONS if q[0] == qid)
        correct = find_unique(paras, q[3])
        rng = random.Random("h1|determinism")
        picks = rng.sample([p for p in paras if p is not correct], 4) + [correct]
        rng.shuffle(picks)
        excerpts = [(f"e{n + 1}", p) for n, p in enumerate(picks)]
        correct_id = next(i for i, p in excerpts if p is correct)
        state, question = h1_variant("opaque", ARTICLES[pmcid], excerpts, f"Which excerpt {q[2]}? Answer with the excerpt ID.")
        refs = {i: {"ref": p["ref"], "sha256": sha(p["text"]), "chars": len(p["text"])} for i, p in excerpts}
        refs["_texts"] = {sha(p["text"]): p["text"] for _, p in excerpts}
        for n in range(3):
            client.call(f"H1|determinism|n{n}", "H1", state, {"answer": question}, refs,
                        {"qid": qid, "variant": "opaque", "k": 5, "rep": "det", "correct_id": correct_id, "correct_ref": correct["ref"]})


# ================================================================= H2
def run_h2(client: Client) -> None:
    cache: dict[str, list[dict]] = {}
    for cid, klass, source, regex, criterion, forbidden in H2_CASES:
        if source.startswith("SYN:"):
            ref, text = source, SYNTHETIC[source[4:]]
            excerpt_text = text if text else "(no abstract available)"
            ref_meta = {"ref": source, "sha256": sha(text), "chars": len(text)}
        else:
            paras = cache.setdefault(source, paragraphs(source))
            para = find_unique(paras, regex)
            low = para["text"].lower()
            bad = [t for t in forbidden if t.lower() in low]
            if bad:
                raise SystemExit(f"erro: caso {cid} é 'sem informação' mas o trecho contém {bad}")
            excerpt_text, ref_meta = para["text"], {"ref": para["ref"], "sha256": sha(para["text"]), "chars": len(para["text"])}
        for with_criteria in (False, True):
            question = noul_question(f"Is the following statement true? Statement: {criterion}", H2_NOUL_CRITERIA if with_criteria else None)
            client.call(f"H2|{cid}|{'crit' if with_criteria else 'plain'}", "H2", {"excerpts": {"e1": excerpt_text}}, {"answer": question},
                        {"e1": ref_meta, "_texts": {ref_meta["sha256"]: excerpt_text}},
                        {"case": cid, "class": klass, "with_criteria": with_criteria, "statement": criterion})


# ================================================================= H3
def run_h3(client: Client) -> None:
    pmcid = "PMC11186782"
    paras = paragraphs(pmcid)
    for n in (1, 5, 10, 20):
        chosen = paras[:n]
        excerpts = [(f"e{i + 1}", p) for i, p in enumerate(chosen)]
        refs = {i: {"ref": p["ref"], "sha256": sha(p["text"]), "chars": len(p["text"])} for i, p in excerpts}
        refs["_texts"] = {sha(p["text"]): p["text"] for _, p in excerpts}
        chars = sum(len(p["text"]) for _, p in excerpts)
        state = {"excerpts": {i: p["text"] for i, p in excerpts}}
        for m in (1, 5, 10):
            questions = {f"n{j + 1}": noul_question(H3_QUESTIONS[j], None) for j in range(m)}
            client.call(f"H3|noul|n{n}|m{m}", "H3", state, questions, refs, {"kind": "noul", "n": n, "m": m, "chars": chars})
        if n >= 5:
            instruction = "Which excerpt reports adverse events? Answer with the excerpt ID."
            client.call(f"H3|choice-opaque|n{n}", "H3", state, {"answer": choice_question(instruction, {i: None for i, _ in excerpts})}, refs,
                        {"kind": "choice-opaque", "n": n, "m": 1, "chars": chars})
            client.call(f"H3|choice-desc|n{n}", "H3", {"article": ARTICLES[pmcid]},
                        {"answer": choice_question(instruction, {i: p["text"] for i, p in excerpts})}, refs,
                        {"kind": "choice-desc", "n": n, "m": 1, "chars": chars})


# ================================================================= comandos
def cmd_models() -> None:
    http = httpx.Client(base_url=BASE_URL, timeout=30.0)
    resp = http.get("/v1/models", headers={"Authorization": f"Bearer {api_key()}", "Accept": "application/json"})
    print(resp.status_code, resp.headers.get("x-typesafe-request-id"))
    print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
    WORK.mkdir(parents=True, exist_ok=True)
    (WORK / "models.json").write_text(json.dumps({"ts": now(), "status": resp.status_code, "request_id": resp.headers.get("x-typesafe-request-id"), "body": resp.json()}, indent=2, ensure_ascii=False))


def redact(entry: dict) -> dict:
    """Troca o texto dos artigos por referência+hash; mantém perguntas, IDs e respostas verbatim."""
    texts: dict[str, str] = entry["refs"].get("_texts", {})
    refs = {k: v for k, v in entry["refs"].items() if k != "_texts"}

    def walk(node):
        if isinstance(node, str):
            for digest, text in texts.items():
                ref = next((v["ref"] for v in refs.values() if v["sha256"] == digest), "?")
                node = node.replace(text, f"<excerpt ref={ref} sha256={digest[:12]} chars={len(text)}>")
            return node
        if isinstance(node, list):
            return [walk(x) for x in node]
        if isinstance(node, dict):
            return {walk(k): walk(v) for k, v in node.items()}
        return node

    out = {k: v for k, v in entry.items() if k not in ("refs", "request")}
    out["refs"] = refs
    out["request"] = walk(entry["request"])
    return out


def cmd_report() -> None:
    import spike_report  # noqa: PLC0415 - módulo irmão, só usado aqui

    spike_report.build(RAW, PUBLIC, REPORT, redact)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("fetch")
    sub.add_parser("models")
    run = sub.add_parser("run")
    run.add_argument("--only", choices=("H1", "H2", "H3", "PILOT"))
    run.add_argument("--budget", type=int, default=DEFAULT_BUDGET, help="teto de input_tokens acumulados no ledger")
    sub.add_parser("report")
    args = parser.parse_args()
    if args.cmd == "fetch":
        fetch_articles()
    elif args.cmd == "models":
        cmd_models()
    elif args.cmd == "run":
        client = Client(Ledger(), args.budget)
        if args.only == "PILOT":
            run_h1(client, only_pilot=True)
        for name, fn in (("H1", run_h1), ("H2", run_h2), ("H3", run_h3)):
            if args.only in (None, name):
                fn(client)
        print(f"ok: {len(client.ledger.done)} chamadas no ledger, {client.ledger.input_tokens} input_tokens acumulados")
    else:
        cmd_report()


if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    main()
