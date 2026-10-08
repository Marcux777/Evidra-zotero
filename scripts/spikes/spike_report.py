"""Gera docs/evaluation/JEV_SPIKE.md e o ledger redigido a partir do ledger bruto do spike J0.

Os critérios de aceite abaixo foram fixados antes da primeira chamada e não dependem dos dados.
"""
from __future__ import annotations

import hashlib
import json
import statistics
from collections import defaultdict
from pathlib import Path

# ---- critérios pré-registrados
H1_PASS, H1_PARTIAL = 0.90, 0.75  # acerto top-1 da variante `opaque`
H1_CONF_MIN, H1_CONF_SHARE = 0.70, 0.80  # confiança do acerto >= 0.7 em >= 80% dos acertos
H2_MET_MIN, H2_NOTMET_MAX = 0.70, 0.30
H2_CLEAR_PASS = 7 / 8  # acertos entre os 8 casos claros (4 atendidos + 4 não atendidos) por condição
H2_AMBIG_PASS = 2 / 4  # casos sem informação com 0.3 < p < 0.7


def load(raw: Path) -> list[dict]:
    latest: dict[str, dict] = {}
    for line in raw.read_text().splitlines():
        entry = json.loads(line)
        if entry["status"] == 200:
            latest[entry["call_id"]] = entry
    return list(latest.values())


def failures(raw: Path) -> list[dict]:
    return [e for e in (json.loads(l) for l in raw.read_text().splitlines()) if e["status"] != 200]


def tok(e: dict) -> int:
    return e["response"]["usage"]["input_tokens"]


def pct(a: int, b: int) -> str:
    return f"{a}/{b} ({100 * a / b:.0f}%)" if b else "—"


def verdict_h1(entries: list[dict]) -> tuple[str, list[str]]:
    lines = ["| variante | k | chamadas | acerto top-1 | acertos com confiança ≥ 0,7 | p médio da opção correta | input_tokens médio |", "|---|---|---|---|---|---|---|"]
    stats: dict[tuple, list[dict]] = defaultdict(list)
    for e in entries:
        if e["hypothesis"] == "H1" and e["meta"]["rep"] != "det":
            stats[(e["meta"]["variant"], e["meta"]["k"])].append(e)
    summary: dict[str, tuple[int, int, int]] = defaultdict(lambda: (0, 0, 0))
    for (variant, k), es in sorted(stats.items()):
        hits = [e for e in es if e["response"]["answers"]["answer"]["choice"] == e["meta"]["correct_id"]]
        conf = [e for e in hits if e["response"]["answers"]["answer"]["confidence"] >= H1_CONF_MIN]
        pc = [e["response"]["answers"]["answer"]["probabilities"].get(e["meta"]["correct_id"], 0.0) for e in es]
        lines.append(f"| {variant} | {k} | {len(es)} | {pct(len(hits), len(es))} | {pct(len(conf), len(hits))} | {statistics.mean(pc):.3f} | {statistics.mean(tok(e) for e in es):.0f} |")
        h, c, n = summary[variant]
        summary[variant] = (h + len(hits), c + len(conf), n + len(es))
    lines += ["", "Total por variante:", "", "| variante | acerto top-1 | acertos com confiança ≥ 0,7 |", "|---|---|---|"]
    for variant, (h, c, n) in sorted(summary.items()):
        lines.append(f"| {variant} | {pct(h, n)} | {pct(c, h)} |")
    h, c, n = summary.get("opaque", (0, 0, 0))
    if not n:
        return "NÃO MEDIDO", lines
    acc, share = h / n, (c / h if h else 0.0)
    if acc >= H1_PASS and share >= H1_CONF_SHARE:
        v = "CONFIRMADA"
    elif acc >= H1_PARTIAL:
        v = "PARCIAL"
    else:
        v = "REFUTADA"
    dh, dc, dn = summary.get("desc", (0, 0, 0))
    lines += ["", f"Critério: acerto da variante `opaque` ≥ {H1_PASS:.0%} e ≥ {H1_CONF_SHARE:.0%} dos acertos com confiança ≥ {H1_CONF_MIN}; parcial se acerto ≥ {H1_PARTIAL:.0%}.",
              f"Medido: `opaque` {pct(h, n)}, confiança ≥ 0,7 em {pct(c, h)}." + (f" Alternativa `desc` (texto nos criteria): {pct(dh, dn)}." if dn else "")]
    return v, lines


def h1_extras(entries: list[dict]) -> list[str]:
    out = []
    det = [e for e in entries if e["hypothesis"] == "H1" and e["meta"]["rep"] == "det"]
    if det:
        same_req = len({e["request_sha256"] for e in det}) == 1
        outs = {json.dumps(e["response"]["answers"], sort_keys=True) for e in det}
        out.append(f"Determinismo: {len(det)} pedidos {'idênticos' if same_req else 'NÃO idênticos'}; {len(outs)} resposta(s) distinta(s) em `answers`.")
    pairs: dict[tuple, dict] = defaultdict(dict)
    for e in entries:
        m = e["meta"]
        if e["hypothesis"] == "H1" and m["variant"] == "opaque" and m["rep"] in (0, 1):
            pairs[(m["qid"], m["k"])][m["rep"]] = e["response"]["answers"]["answer"]["choice"] == m["correct_id"]
    both = [v for v in pairs.values() if len(v) == 2]
    if both:
        out.append(f"Estabilidade entre repetições com distratores/posição diferentes (`opaque`): ambas certas {sum(all(v.values()) for v in both)}, ambas erradas {sum(not any(v.values()) for v in both)}, divergentes {sum(len(set(v.values())) == 2 for v in both)} de {len(both)} pares.")
    pos: dict[str, list[bool]] = defaultdict(list)
    for e in entries:
        m = e["meta"]
        if e["hypothesis"] == "H1" and m["variant"] == "opaque" and m["rep"] in (0, 1):
            pos[m["correct_id"]].append(e["response"]["answers"]["answer"]["choice"] == m["correct_id"])
    out.append("Acerto por posição da opção correta (`opaque`): " + ", ".join(f"{k}: {pct(sum(v), len(v))}" for k, v in sorted(pos.items(), key=lambda kv: int(kv[0][1:]))))
    return out


def verdict_h2(entries: list[dict]) -> tuple[str, list[str]]:
    cases: dict[str, dict] = defaultdict(dict)
    for e in entries:
        if e["hypothesis"] == "H2":
            m = e["meta"]
            cases[m["case"]][m["with_criteria"]] = (m["class"], e["response"]["answers"]["answer"]["noul"], m["statement"])
    lines = ["| caso | classe esperada | p (sem criteria) | p (com criteria.true/false) | afirmação |", "|---|---|---|---|---|"]
    for cid in sorted(cases):
        c = cases[cid]
        klass = (c.get(False) or c.get(True))[0]
        stmt = (c.get(False) or c.get(True))[2]
        f = lambda k: f"{c[k][1]:.3f}" if k in c else "—"  # noqa: E731
        lines.append(f"| {cid} | {klass} | {f(False)} | {f(True)} | {stmt} |")
    result: dict[bool, tuple[int, int, int, int, bool]] = {}
    for cond in (False, True):
        met = [c[cond][1] for c in cases.values() if cond in c and c[cond][0] == "met"]
        notmet = [c[cond][1] for c in cases.values() if cond in c and c[cond][0] == "not_met"]
        noinfo = [c[cond][1] for c in cases.values() if cond in c and c[cond][0] == "no_info"]
        clear_hits = sum(p >= H2_MET_MIN for p in met) + sum(p <= H2_NOTMET_MAX for p in notmet)
        ambig = sum(H2_NOTMET_MAX < p < H2_MET_MIN for p in noinfo)
        separated = bool(met and notmet) and min(met) > max(notmet)
        result[cond] = (clear_hits, len(met) + len(notmet), ambig, len(noinfo), separated)
    lines += ["", "| condição | casos claros dentro dos limiares | min(atendido) > max(não atendido) | sem informação em (0,3; 0,7) | sem informação ≤ 0,3 | sem informação ≥ 0,7 |", "|---|---|---|---|---|---|"]
    for cond, name in ((False, "sem criteria"), (True, "com criteria")):
        noinfo = [c[cond][1] for c in cases.values() if cond in c and c[cond][0] == "no_info"]
        ch, cn, am, an, sep = result[cond]
        lines.append(f"| {name} | {pct(ch, cn)} | {'sim' if sep else 'não'} | {pct(am, an)} | {pct(sum(p <= H2_NOTMET_MAX for p in noinfo), an)} | {pct(sum(p >= H2_MET_MIN for p in noinfo), an)} |")
    best = max(result.values(), key=lambda r: (r[0] / max(r[1], 1), r[2]))
    ch, cn, am, an, _ = best
    if cn and ch / cn >= H2_CLEAR_PASS and an and am / an >= H2_AMBIG_PASS:
        v = "CONFIRMADA"
    elif cn and ch / cn >= H2_CLEAR_PASS:
        v = "PARCIAL (separa casos claros; sem informação não cai na faixa ambígua)"
    else:
        v = "REFUTADA"
    lines += ["", f"Critério (pré-registrado): atendido p ≥ {H2_MET_MIN}, não atendido p ≤ {H2_NOTMET_MAX}, sem informação em ({H2_NOTMET_MAX}; {H2_MET_MIN}). Confirmada se ≥ 7/8 casos claros e ≥ 2/4 casos sem informação na faixa ambígua (melhor condição); parcial se só os claros passam."]
    return v, lines


def verdict_h3(entries: list[dict]) -> tuple[str, list[str]]:
    h3 = [e for e in entries if e["hypothesis"] == "H3"]
    lines = ["Perguntas Noul sobre n trechos do mesmo artigo (state = objeto JSON de trechos; sem criteria):", "", "| n trechos | caracteres | m=1 | m=5 | m=10 | Δ(m=10 − m=1) | tokens/caractere (m=1) |", "|---|---|---|---|---|---|---|"]
    grid: dict[tuple[int, int], tuple[int, int]] = {}
    for e in h3:
        m = e["meta"]
        if m["kind"] == "noul":
            grid[(m["n"], m["m"])] = (tok(e), m["chars"])
    for n in sorted({k[0] for k in grid}):
        row = [grid.get((n, m)) for m in (1, 5, 10)]
        delta = (row[2][0] - row[0][0]) if row[0] and row[2] else None
        lines.append(f"| {n} | {row[0][1] if row[0] else '—'} | " + " | ".join(str(r[0]) if r else "—" for r in row) + f" | {delta if delta is not None else '—'} | {row[0][0] / row[0][1]:.3f} |" if row[0] else f"| {n} | — | — | — | — | — | — |")
    fits = []
    for m in (1, 5, 10):
        pts = [(grid[(n, m)][1], grid[(n, m)][0]) for n in sorted({k[0] for k in grid}) if (n, m) in grid]
        if len(pts) >= 3:
            slope, intercept = statistics.linear_regression([p[0] for p in pts], [p[1] for p in pts])
            r = statistics.correlation([p[0] for p in pts], [p[1] for p in pts])
            fits.append(f"m={m}: input_tokens ≈ {intercept:.0f} + {slope:.4f} × caracteres (r = {r:.4f}; {len(pts)} pontos)")
    lines += ["", "Ajuste linear por número de perguntas:", ""] + [f"- {f}" for f in fits]
    ch = [e for e in h3 if e["meta"]["kind"].startswith("choice")]
    if ch:
        lines += ["", "Uma pergunta Choice sobre n opções (IDs opacos com trechos no state × texto nos criteria):", "", "| n opções | caracteres | IDs opacos (state) | texto nos criteria | diferença |", "|---|---|---|---|---|"]
        for n in sorted({e["meta"]["n"] for e in ch}):
            o = next((tok(e) for e in ch if e["meta"]["n"] == n and e["meta"]["kind"] == "choice-opaque"), None)
            d = next((tok(e) for e in ch if e["meta"]["n"] == n and e["meta"]["kind"] == "choice-desc"), None)
            chars = next(e["meta"]["chars"] for e in ch if e["meta"]["n"] == n)
            lines.append(f"| {n} | {chars} | {o} | {d} | {d - o if o is not None and d is not None else '—'} |")
    h1 = [e for e in entries if e["hypothesis"] == "H1" and e["meta"]["rep"] != "det"]
    if h1:
        lines += ["", "input_tokens médio nas chamadas da H1 (1 pergunta Choice):", "", "| variante | k=3 | k=5 | k=10 |", "|---|---|---|---|"]
        for variant in ("opaque", "marked", "desc"):
            cells = []
            for k in (3, 5, 10):
                v = [tok(e) for e in h1 if e["meta"]["variant"] == variant and e["meta"]["k"] == k]
                cells.append(f"{statistics.mean(v):.0f}" if v else "—")
            lines.append(f"| {variant} | " + " | ".join(cells) + " |")
    ok = bool(grid) and all(isinstance(t, int) for t, _ in grid.values())
    return ("MEDIDA" if ok else "NÃO MEDIDO"), lines


def build(raw: Path, public: Path, report: Path, redact) -> None:
    entries = load(raw)
    public.write_text("".join(json.dumps(redact(e), ensure_ascii=False) + "\n" for e in entries))
    work = raw.parent
    models = json.loads((work / "models.json").read_text()) if (work / "models.json").exists() else None
    v1, l1 = verdict_h1(entries)
    v2, l2 = verdict_h2(entries)
    v3, l3 = verdict_h3(entries)
    total = sum(tok(e) for e in entries)
    resolved = sorted({e["response"].get("model", "?") for e in entries})
    arts = []
    for pmcid in sorted({"PMC11074813", "PMC11186782", "PMC11059071"}):
        data = (work / f"{pmcid}.xml").read_bytes()
        arts.append(f"| {pmcid} | CC BY 4.0 | `{hashlib.sha256(data).hexdigest()}` |")
    fails = failures(raw)
    md = [
        "# J0 — Spike do Jev: resultados",
        "",
        f"Gerado por `scripts/spikes/jev_spike.py report` (módulo `spike_report.py`). Janela das chamadas: {min(e['ts'] for e in entries)} a {max(e['ts'] for e in entries)}. "
        f"{len(entries)} chamadas bem-sucedidas a `POST /v1/systemone`, {total} `input_tokens` no total, modelo informado pela API: {', '.join(resolved)}. "
        f"Chamadas com erro: {len(fails)}.",
        "",
        "## Veredito",
        "",
        "| hipótese | veredito |",
        "|---|---|",
        f"| H1 — âncora por ID | **{v1}** |",
        f"| H2 — critério por Noul | **{v2}** |",
        f"| H3 — orçamento | **{v3}** |",
        "",
        "## Material e ledger",
        "",
        "Artigos open access (Europe PMC, `fullTextXML`), todos CC BY 4.0, de Alzheimer, fora do RL-20 e da busca real. Os textos não são redistribuídos aqui: o ledger versionado "
        "([JEV_SPIKE_LEDGER.jsonl](JEV_SPIKE_LEDGER.jsonl)) troca cada trecho por `<excerpt ref=PMCID#pN sha256=… chars=…>`; perguntas, IDs, `criteria`, respostas, `usage` e `x-typesafe-request-id` ficam verbatim. "
        "O pedido completo é reproduzível pelo script (sementes fixas) e conferível por `request_sha256`. Parágrafos com menos de 200 caracteres foram descartados e os demais truncados em 1.500; "
        "a numeração `pN` é a do script (parágrafos do corpo do XML que passam nesse filtro).",
        "",
        "| artigo | licença | SHA-256 do XML baixado |",
        "|---|---|---|",
        *arts,
        "",
        "Os microcasos sintéticos são os três de `services/engine/tests/test_triage.py::PAPERS` (ATARIPAP, ROBOTPAP, NOABSTRA), usados verbatim como casos s1–s3 da H2. "
        "O repositório não tem arquivos de microcaso além desses; a frase sintética `87.5 / % / SYN-1` citada em `TEST_REPORT.md` não está versionada e não foi usada.",
        "",
        "## H1 — âncora por ID",
        "",
        f"Veredito: **{v1}**.",
        "",
        "Cada chamada é uma pergunta Choice com uma única resposta verificável (regex que casa exatamente um parágrafo do artigo, conferido antes de enviar), "
        "k ∈ {3, 5, 10} opções (a correta mais k−1 parágrafos do mesmo artigo, posição sorteada). Variantes: `opaque` = trechos no state (objeto JSON `{\"excerpts\": {id: texto}}`) e `criteria` = `{id: null}`; "
        "`marked` = state em texto com marcadores `[eN]`, `criteria` = `{id: null}`; `desc` = texto do trecho na descrição de cada opção e state mínimo (a alternativa do J0). "
        "`opaque` foi repetida com outra amostra de distratores e outra posição.",
        "",
        *l1,
        "",
        *[f"- {x}" for x in h1_extras(entries)],
        "",
        "## H2 — critério por Noul",
        "",
        f"Veredito: **{v2}**.",
        "",
        "Cada caso envia um único trecho (state `{\"excerpts\": {\"e1\": …}}`) e uma pergunta Noul `Is the following statement true? Statement: …`, com e sem `criteria.true/false`. "
        "Os 12 casos são 4 atendidos, 4 não atendidos e 4 sem informação (trecho que não toca o critério; o script confere a ausência de termos relacionados). Os casos a/b/c vêm dos artigos; s1–s3 são os microcasos sintéticos.",
        "",
        *l2,
        "",
        "## H3 — orçamento",
        "",
        f"Veredito: **{v3}**. O leque de perguntas do desenho não está no repositório: foram usadas 10 perguntas Noul genéricas como substituto declarado "
        "(ver `H3_QUESTIONS` no script). Calibração com o leque real exige repetir a varredura com ele.",
        "",
        *l3,
        "",
        "## Apêndice — chamadas",
        "",
        "| call_id | HTTP | latência (ms) | input_tokens | output_tokens | request-id |",
        "|---|---|---|---|---|---|",
        *[f"| {e['call_id']} | {e['status']} | {e['latency_ms']} | {tok(e)} | {e['response']['usage'].get('output_tokens')} | {e['request_id']} |" for e in sorted(entries, key=lambda e: e["ts"])],
        "",
    ]
    report.write_text("\n".join(md))
    print(f"relatório: {report}\nledger público: {public} ({len(entries)} linhas)")
