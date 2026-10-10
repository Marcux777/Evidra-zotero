# /// script
# requires-python = ">=3.12"
# dependencies = ["httpx"]
# ///
"""J1a — spike de forma de pergunta e âncora com NONE (Jev / TypeSafe System One).

Compara, para a mesma entrada (state com trechos), duas formas de veredito por critério:
  (a) um choice  MET / NOT_MET / NOT_REPORTED;
  (b) dois nouls "addressed?" e "met?" (veredito derivado por código);
e, em ambas, a âncora: choice sobre os IDs dos trechos mais NONE.

Casos: os 12 do J0 (a1..c3, s1..s3), 9 contradições explícitas (k1..k9), 6 sem informação próximos
do tema (n1..n6) e 3 em que a informação existe no artigo mas o trecho não foi preparado (w1..w3).
Instruções e opções em inglês. Material: os mesmos 3 artigos CC BY do J0 (fora do piloto e do RL-20).

Critérios PRÉ-REGISTRADOS (fixados antes da primeira chamada; não são limiares finais do produto):
  C_MIN = 0.70 (provisório, o LIMIAR do jev_decide.py);
  erro crítico = caso sem informação (ou sem trecho preparado) com veredito NOT_MET e confiança >= C_MIN;
  aceite da forma = 0 erros críticos em todas as chamadas E, nos casos sem sustentação, NONE como âncora
  de maior probabilidade em todos eles; a forma vencedora é a que passa o aceite e tem maior
  recall de exclusão firme (NOT_MET, confiança >= C_MIN, âncora = trecho contraditório); empate: menos tokens.

Uso (raiz do repositório):
    uv run scripts/spikes/jev_j1a.py dry            # 0 tokens: monta todos os pedidos e confere as âncoras
    uv run scripts/spikes/jev_j1a.py run [--only PILOT] [--budget N]
    uv run scripts/spikes/jev_j1a.py report         # regenera JEV_SPIKE.md (J0 + seção J1a) e o ledger redigido

A chave vem do Secret Service (service=typesafe), como no J0. Ledger bruto: .local/spike/ledger_j1a_raw.jsonl
(ignorado pelo Git); versão redigida: docs/evaluation/JEV_SPIKE_J1A_LEDGER.jsonl. Retomável por call_id.
"""
from __future__ import annotations

import argparse
import json
import random
import re
import statistics
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev_spike as j  # noqa: E402

RAW = j.WORK / "ledger_j1a_raw.jsonl"
PUBLIC = j.ROOT / "docs" / "evaluation" / "JEV_SPIKE_J1A_LEDGER.jsonl"
BUDGET = 400_000
C_MIN = 0.70
CTX_BIG = 5
REPS = (0, 1)
NONE_ID = "NONE"

VERDICT_CRITERIA = {
    "MET": "The excerpts explicitly support the statement.",
    "NOT_MET": "An excerpt explicitly contradicts the statement or states the opposite.",
    "NOT_REPORTED": "No excerpt addresses the statement.",
}

# (id, classe, artigo, regex do trecho (None = nenhum), afirmação, regex proibido nos trechos)
J0_FORBID = {
    "a1": r"randomi[sz]|randomly|controlled|sham",
    "a2": r"\bage[sd]?\b|years old|older|younger",
    "a3": r"women|female|\bmen\b|\bsex\b|gender",
    "b1": r"NCT\d|registr|EudraCT|EU Clinical Trials|ClinicalTrials",
    "b2": r"biolog|confirm|eligib|diagnos|Aβ42 <",
    "b3": r"fund|grant|sponsor|supported by|PharmatrophiX",
    "c1": r"blind",
    "c2": r"duration|follow-up|until|months|weeks|\d{4}",
    "c3": r"MMSE|mini-mental",
}
NEW_CASES = [
    # contradições explícitas
    ("k1", "not_met", "PMC11186782", r"multicenter, randomized, placebo-controlled", "The trial was conducted at a single center.", r"multicent|single-cent|\bsites?\b|centers?\b"),
    ("k2", "not_met", "PMC11074813", r"single-centered, randomized", "The trial was conducted at multiple centers.", r"cent(?:er|re)|\bsites?\b"),
    ("k3", "not_met", "PMC11059071", r"spanning 25 sites in 7 countries", "The trial was conducted at a single site.", r"\bsites?\b|countries|centers?\b"),
    ("k4", "not_met", "PMC11059071", r"spanning 25 sites in 7 countries", "The trial was an open-label study.", r"blind|open-label|placebo"),
    ("k5", "not_met", "PMC11186782", r"no financial incentive to participate", "Participants received a financial incentive for taking part in the trial.", r"incentive|reimburs|compensat|financ"),
    ("k6", "not_met", "PMC11186782", r"Data Safety Monitoring Board concluded", "The Data Safety Monitoring Board raised safety concerns about the study drug.", r"Safety Monitoring|safety concerns|DSMB"),
    ("k7", "not_met", "PMC11074813", r"could not prove the effect of rTMS on MMSE", "The study found a significant effect of rTMS on MMSE scores.", r"MMSE|MOCA"),
    ("k8", "not_met", "PMC11059071", r"solanezumab exhibited no effect on CSF neurogranin", "Solanezumab significantly decreased CSF neurogranin levels compared with placebo.", r"neurogranin"),
    ("k9", "not_met", "PMC11186782", r"316 participants were screened", "More than 500 participants were screened for inclusion.", r"screened"),
    # sem informação, tema próximo; nenhum trecho preparado toca o assunto
    ("n1", "no_info", "PMC11074813", None, "The study reports the number of participants who experienced adverse events.", r"adverse|side effect|tolerab|safety"),
    ("n2", "no_info", "PMC11186782", None, "The study reports results stratified by APOE ε4 carrier status.", r"APOE|ε4|e4 carrier"),
    ("n3", "no_info", "PMC11059071", None, "The study reports how many participants withdrew because of adverse events.", r"adverse|withdr|discontinu|dropout|drop-out"),
    ("n4", "no_info", "PMC11059071", None, "The study reports an economic evaluation or cost-effectiveness analysis.", r"cost|econom"),
    ("n5", "no_info", "PMC11074813", None, "The study reports that outcome assessors were blinded to group allocation.", r"blind|mask"),
    ("n6", "no_info", "PMC11186782", None, "The study reports the mean body mass index of the participants.", r"body mass|BMI"),
    # a informação existe no artigo mas o trecho não foi preparado (restrição aos IDs preparados)
    ("w1", "no_info", "PMC11074813", None, "The study is a randomized controlled trial.", r"randomi[sz]|randomly|controlled|sham"),
    ("w2", "no_info", "PMC11186782", None, "The trial was registered in a public trial registry.", r"NCT\d|registr|EudraCT|EU Clinical Trials|ClinicalTrials"),
    ("w3", "no_info", "PMC11059071", None, "The trial used a double-blind design.", r"blind"),
]


def all_cases() -> list[dict]:
    cases = []
    for cid, klass, source, regex, statement, forbidden in j.H2_CASES:
        origin = "J0"
        if source.startswith("SYN:"):
            cases.append({"id": cid, "cls": {"met": "met", "not_met": "not_met", "no_info": "no_info"}[klass], "src": source, "regex": None, "statement": statement, "forbid": None, "origin": origin})
        else:
            cases.append({"id": cid, "cls": klass, "src": source, "regex": regex, "statement": statement, "forbid": J0_FORBID[cid], "origin": origin,
                          "near": klass == "no_info", "near_forbid": forbidden})
    for cid, klass, source, regex, statement, forbid in NEW_CASES:
        origin = "withheld" if cid.startswith("w") else ("contradiction" if klass == "not_met" else "no_info")
        cases.append({"id": cid, "cls": klass, "src": source, "regex": regex, "statement": statement, "forbid": forbid, "origin": origin, "near": False})
    return cases


def build_excerpts(case: dict, ctx: int, rep: int, cache: dict[str, list[dict]]) -> tuple[list[tuple[str, dict]], str | None, dict]:
    """Devolve ([(id, parágrafo)], id correto ou None para NONE, texto de origem)."""
    if case["src"].startswith("SYN:"):
        text = j.SYNTHETIC[case["src"][4:]] or "(no abstract available)"
        para = {"ref": case["src"], "section": "", "text": text}
        gold = "e1" if case["cls"] != "no_info" else None
        return [("e1", para)], gold, {}
    paras = cache.setdefault(case["src"], j.paragraphs(case["src"]))
    forbid = re.compile(case["forbid"], re.I)
    anchor_para = None  # o trecho que entra sempre (contraditório/atendido, ou o "próximo" do J0)
    if case["regex"] is not None:
        anchor_para = j.find_unique(paras, case["regex"])
        low = anchor_para["text"].lower()
        if case["cls"] == "no_info" and any(t.lower() in low for t in case.get("near_forbid", ())):
            raise SystemExit(f"erro: caso {case['id']}: o trecho 'próximo' contém termo proibido do J0")
    pool = [p for p in paras if p is not anchor_para and not forbid.search(p["text"])]
    need = ctx - (1 if anchor_para is not None else 0)
    if len(pool) < need:
        raise SystemExit(f"erro: caso {case['id']}: pool de distratores com {len(pool)} < {need}")
    rng = random.Random(f"j1a|{case['id']}|{ctx}|{rep}")
    if ctx == 1:
        picks = [anchor_para] if anchor_para is not None else rng.sample(pool, 1)
    else:
        picks = rng.sample(pool, need) + ([anchor_para] if anchor_para is not None else [])
        rng.shuffle(picks)
    excerpts = [(f"e{n + 1}", p) for n, p in enumerate(picks)]
    gold = None
    if case["cls"] != "no_info":
        gold = next(i for i, p in excerpts if p is anchor_para)
    return excerpts, gold, {"pool": len(pool)}


def questions_for(form: str, statement: str, ids: list[str]) -> dict:
    anchor_criteria: dict = {i: None for i in ids}
    anchor_criteria[NONE_ID] = "No excerpt addresses the statement."
    anchor = j.choice_question(
        f"Which excerpt states whether the following statement holds? Statement: {statement} "
        f"Answer with the excerpt ID, or NONE if no excerpt addresses the statement.", anchor_criteria)
    if form == "A":
        verdict = j.choice_question(
            f"Based only on the excerpts, is the following statement met (MET), contradicted (NOT_MET) "
            f"or not addressed (NOT_REPORTED)? Statement: {statement}", VERDICT_CRITERIA)
        return {"verdict": verdict, "anchor": anchor}
    return {
        "addressed": j.noul_question(f"Do the excerpts explicitly say something that supports or contradicts the following statement? Statement: {statement}", None),
        "met": j.noul_question(f"Do the excerpts explicitly support the following statement? Statement: {statement}", None),
        "anchor": anchor,
    }


def plan(cases: list[dict]) -> list[dict]:
    out = []
    cache: dict[str, list[dict]] = {}
    for case in cases:
        ctxs = [(1, 0)] if case["src"].startswith("SYN:") else [(1, 0)] + [(CTX_BIG, r) for r in REPS]
        for ctx, rep in ctxs:
            excerpts, gold, extra = build_excerpts(case, ctx, rep, cache)
            ids = [i for i, _ in excerpts]
            state = {"excerpts": {i: p["text"] for i, p in excerpts}}
            refs = {i: {"ref": p["ref"], "sha256": j.sha(p["text"]), "chars": len(p["text"])} for i, p in excerpts}
            refs["_texts"] = {j.sha(p["text"]): p["text"] for _, p in excerpts}
            for form in ("A", "B"):
                out.append({
                    "call_id": f"J1A|{case['id']}|ctx{ctx}|r{rep}|{form}", "state": state, "questions": questions_for(form, case["statement"], ids),
                    "refs": refs,
                    "meta": {"case": case["id"], "cls": case["cls"], "origin": case["origin"], "ctx": ctx, "rep": rep, "form": form,
                             "gold": gold or NONE_ID, "statement": case["statement"], "ids": ids, **extra},
                })
    return out


def cmd_dry() -> None:
    items = plan(all_cases())
    by_form = defaultdict(int)
    for it in items:
        by_form[it["meta"]["form"]] += 1
    chars = sum(len(json.dumps(it["state"])) for it in items)
    print(f"{len(items)} chamadas planejadas ({dict(by_form)}); ~{int(chars * 0.28 + 250 * len(items))} input_tokens estimados (J0: 178 + 0,278/char)")
    cls = defaultdict(int)
    for c in all_cases():
        cls[c["cls"]] += 1
    print("casos por classe:", dict(cls))
    for it in items[:0]:
        print(it["call_id"])


def cmd_run(only_pilot: bool, budget: int) -> None:
    j.RAW = RAW
    client = j.Client(j.Ledger(), budget)
    items = plan(all_cases())
    if only_pilot:
        items = [it for it in items if it["meta"]["case"] in ("k1", "n1") and it["meta"]["ctx"] == CTX_BIG and it["meta"]["rep"] == 0]
    for it in items:
        client.call(it["call_id"], "J1a", it["state"], it["questions"], it["refs"], it["meta"])
    print(f"ok: {len(client.ledger.done)} chamadas no ledger, {client.ledger.input_tokens} input_tokens acumulados")


# ================================================================= relatório
EXPECT = {"met": "MET", "not_met": "NOT_MET", "no_info": "NOT_REPORTED"}


def derive(entry: dict) -> dict:
    ans = entry["response"]["answers"]
    anchor = ans["anchor"]
    out = {"anchor": anchor["choice"], "anchor_p": anchor["confidence"], "anchor_probs": anchor.get("probabilities", {})}
    if entry["meta"]["form"] == "A":
        v = ans["verdict"]
        out.update(verdict=v["choice"], conf=v["confidence"], detail=f"{v['choice']} {v['confidence']:.2f}")
    else:
        pa, pm = ans["addressed"]["noul"], ans["met"]["noul"]
        if pm >= C_MIN:
            verdict, conf = "MET", pm
        elif pa >= C_MIN and pm <= 1 - C_MIN:
            verdict, conf = "NOT_MET", min(pa, 1 - pm)
        elif pa <= 1 - C_MIN:
            verdict, conf = "NOT_REPORTED", 1 - pa
        else:
            verdict, conf = "UNCLEAR", max(pa, 1 - pa)
        out.update(verdict=verdict, conf=conf, detail=f"a={pa:.2f} m={pm:.2f}", pa=pa, pm=pm)
    return out


def load_entries(raw: Path) -> list[dict]:
    latest: dict[str, dict] = {}
    for line in raw.read_text().splitlines():
        e = json.loads(line)
        if e["status"] == 200:
            latest[e["call_id"]] = e
    return list(latest.values())


def pct(a: int, b: int) -> str:
    return f"{a}/{b} ({100 * a / b:.0f}%)" if b else "—"


def section(entries: list[dict]) -> str:
    rows = []
    for e in entries:
        d = derive(e)
        rows.append({**e["meta"], **d, "tok": e["response"]["usage"]["input_tokens"], "otok": e["response"]["usage"].get("output_tokens", 0)})
    L: list[str] = []
    total = sum(r["tok"] for r in rows)
    L += ["## J1a — forma da pergunta e âncora com NONE", "",
          f"{len(rows)} chamadas bem-sucedidas, {total} `input_tokens`, {len({r['case'] for r in rows})} casos. Gerado por `scripts/spikes/jev_j1a.py report`. "
          "Ledger redigido: [JEV_SPIKE_J1A_LEDGER.jsonl](JEV_SPIKE_J1A_LEDGER.jsonl).", "",
          "Casos: 12 do J0 (a1–c3 dos artigos, s1–s3 sintéticos), 9 contradições explícitas (k1–k9), 6 sem informação próximos do tema (n1–n6) e 3 'informação existe no artigo mas o trecho não foi preparado' (w1–w3). "
          "Cada caso roda com 1 trecho (ctx1) e com 5 trechos (ctx5, duas amostras de distratores; os distratores são filtrados por termos que tornariam o trecho também relevante). "
          "Os artigos CC BY e os parágrafos são os do J0; as instruções e as opções estão em inglês.", "",
          "Formas comparadas, sempre com a mesma âncora (`choice` sobre os IDs dos trechos mais `NONE`): "
          "**A** = um choice `MET / NOT_MET / NOT_REPORTED`; **B** = dois nouls (`addressed?`, `met?`) com veredito derivado por código: "
          f"MET se p(met) ≥ {C_MIN}; NOT_MET se p(addressed) ≥ {C_MIN} e p(met) ≤ {1 - C_MIN:.1f}; NOT_REPORTED se p(addressed) ≤ {1 - C_MIN:.1f}; senão UNCLEAR.", "",
          f"Critérios pré-registrados no script antes da primeira chamada: c_min = {C_MIN} (provisório, **não** é limiar final); erro crítico = caso sem informação (ou sem trecho preparado) julgado NOT_MET com confiança ≥ c_min; "
          "aceite = 0 erros críticos e NONE como âncora de maior probabilidade em todos os casos sem sustentação; vence a forma aceita com maior recall de exclusão firme (NOT_MET, confiança ≥ c_min, âncora = trecho contraditório); empate: menos tokens.", ""]

    def stats(sub: list[dict]) -> dict:
        n = len(sub)
        hit = sum(r["verdict"] == EXPECT[r["cls"]] for r in sub)
        noinfo = [r for r in sub if r["cls"] == "no_info"]
        notmet = [r for r in sub if r["cls"] == "not_met"]
        crit = [r for r in noinfo if r["verdict"] == "NOT_MET" and r["conf"] >= C_MIN]
        none_ok = [r for r in noinfo if r["anchor"] == NONE_ID]
        firm = [r for r in notmet if r["verdict"] == "NOT_MET" and r["conf"] >= C_MIN and r["anchor"] == r["gold"]]
        anchor_gold = [r for r in sub if r["cls"] != "no_info"]
        anchor_hit = [r for r in anchor_gold if r["anchor"] == r["gold"]]
        wrong_firm_anchor = [r for r in sub if r["anchor"] != r["gold"] and r["anchor_p"] >= C_MIN]
        return {"n": n, "hit": hit, "crit": crit, "noinfo": noinfo, "none_ok": none_ok, "notmet": notmet, "firm": firm,
                "anchor_gold": anchor_gold, "anchor_hit": anchor_hit, "wrong": wrong_firm_anchor,
                "met": [r for r in sub if r["cls"] == "met"], "tok": statistics.mean(r["tok"] for r in sub) if sub else 0,
                "unclear": sum(r["verdict"] == "UNCLEAR" for r in sub)}

    L += ["### Resultado por forma", "",
          "| forma | ctx | chamadas | acerto 3 classes | erros críticos (sem info → NOT_MET firme) | sem info → NONE | recall de exclusão firme | MET atendido | âncora correta (com trecho) | âncora errada com p ≥ c_min | UNCLEAR | input_tokens médio |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    summary: dict[str, dict] = {}
    for form in ("A", "B"):
        for ctx in ("1", "5", "todos"):
            sub = [r for r in rows if r["form"] == form and (ctx == "todos" or r["ctx"] == int(ctx))]
            if not sub:
                continue
            s = stats(sub)
            if ctx == "todos":
                summary[form] = s
            met_hit = sum(r["verdict"] == "MET" for r in s["met"])
            L.append(f"| {form} | {ctx} | {s['n']} | {pct(s['hit'], s['n'])} | {len(s['crit'])} | {pct(len(s['none_ok']), len(s['noinfo']))} | {pct(len(s['firm']), len(s['notmet']))} | "
                     f"{pct(met_hit, len(s['met']))} | {pct(len(s['anchor_hit']), len(s['anchor_gold']))} | {len(s['wrong'])} | {s['unclear']} | {s['tok']:.0f} |")
    L.append("")

    # veredito por forma segundo o critério pré-registrado
    accepted = {}
    for form, s in summary.items():
        accepted[form] = (len(s["crit"]) == 0) and len(s["none_ok"]) == len(s["noinfo"])
    ranked = sorted(summary, key=lambda f: (-int(accepted[f]), -(len(summary[f]["firm"]) / max(len(summary[f]["notmet"]), 1)), summary[f]["tok"]))
    winner = ranked[0] if accepted.get(ranked[0]) else None
    L += ["### Veredito", "", "| forma | aceite (0 erros críticos e NONE em todos os sem sustentação) | erros críticos | NONE nos sem sustentação | recall de exclusão firme |", "|---|---|---|---|---|"]
    for form, s in summary.items():
        L.append(f"| {form} | {'SIM' if accepted[form] else 'NÃO'} | {len(s['crit'])} | {pct(len(s['none_ok']), len(s['noinfo']))} | {pct(len(s['firm']), len(s['notmet']))} |")
    if winner:
        L += ["", f"Forma vencedora pelo critério pré-registrado: **{winner}**."]
    else:
        L += ["", "**Nenhuma forma passou no aceite pré-registrado.** O desenho volta para discussão."]
    L.append("")

    # falhas (detalhe)
    def fail_lines(title: str, sel) -> None:
        bad = [r for r in rows if sel(r)]
        L.append(f"**{title}**: {len(bad)}")
        for r in sorted(bad, key=lambda r: (r["case"], r["ctx"], r["rep"], r["form"])):
            L.append(f"- {r['case']} ctx{r['ctx']} r{r['rep']} forma {r['form']} ({r['cls']}): veredito {r['detail']}, âncora {r['anchor']} (p={r['anchor_p']:.2f}; correta {r['gold']})")
        L.append("")
    L += ["### Falhas", ""]
    fail_lines("Erros críticos (sem sustentação julgado NOT_MET com confiança ≥ c_min)", lambda r: r["cls"] == "no_info" and r["verdict"] == "NOT_MET" and r["conf"] >= C_MIN)
    fail_lines("Sem sustentação em que a âncora não foi NONE", lambda r: r["cls"] == "no_info" and r["anchor"] != NONE_ID)
    fail_lines("Contradição explícita sem exclusão firme (não é erro crítico: vira UNCLEAR)", lambda r: r["cls"] == "not_met" and not (r["verdict"] == "NOT_MET" and r["conf"] >= C_MIN and r["anchor"] == r["gold"]))
    fail_lines("Atendido com veredito diferente de MET", lambda r: r["cls"] == "met" and r["verdict"] != "MET")
    fail_lines("Âncora errada com p ≥ c_min (todas as classes)", lambda r: r["anchor"] != r["gold"] and r["anchor_p"] >= C_MIN)

    # por origem
    L += ["### Por origem do caso", "", "| origem | forma | chamadas | acerto 3 classes | erros críticos | NONE nos sem info |", "|---|---|---|---|---|---|"]
    for origin in ("J0", "contradiction", "no_info", "withheld"):
        for form in ("A", "B"):
            sub = [r for r in rows if r["origin"] == origin and r["form"] == form]
            if sub:
                s = stats(sub)
                L.append(f"| {origin} | {form} | {s['n']} | {pct(s['hit'], s['n'])} | {len(s['crit'])} | {pct(len(s['none_ok']), len(s['noinfo']))} |")
    L.append("")

    # por caso (ctx5 r0 e ctx1)
    L += ["### Por caso", "", "`A` = choice (veredito confiança); `B` = noul addressed (a) e met (m). Âncora: ID escolhido (p).", "",
          "| caso | classe | ctx | A veredito | B (a / m) → derivado | âncora A | âncora B | correta |", "|---|---|---|---|---|---|---|---|"]
    by_key: dict[tuple, dict] = defaultdict(dict)
    for r in rows:
        by_key[(r["case"], r["ctx"], r["rep"])][r["form"]] = r
    order = {c["id"]: n for n, c in enumerate(all_cases())}
    for key in sorted(by_key, key=lambda k: (order[k[0]], k[1], k[2])):
        a, b = by_key[key].get("A"), by_key[key].get("B")
        if not a or not b:
            continue
        L.append(f"| {key[0]} | {a['cls']} | {key[1]}{'/r' + str(key[2]) if key[1] != 1 else ''} | {a['detail']} | {b['detail']} → {b['verdict']} {b['conf']:.2f} | {a['anchor']} ({a['anchor_p']:.2f}) | {b['anchor']} ({b['anchor_p']:.2f}) | {a['gold']} |")
    L.append("")

    # tokens
    L += ["### Custo", "", "| forma | ctx | input_tokens médio | output_tokens médio |", "|---|---|---|---|"]
    for form in ("A", "B"):
        for ctx in (1, CTX_BIG):
            sub = [r for r in rows if r["form"] == form and r["ctx"] == ctx]
            if sub:
                L.append(f"| {form} | {ctx} | {statistics.mean(r['tok'] for r in sub):.0f} | {statistics.mean(r['otok'] for r in sub):.0f} |")
    L += ["", "Ressalvas: (1) s2 é o único caso em que a forma A erra o veredito (NOT_REPORTED 0,76, âncora NONE); o rótulo `not_met` herdado do J0 não é uma contradição explícita (o resumo fala de um robô com pernas, não nega Atari), então a resposta do Jev é defensável e o caso não conta como 'sem informação' no aceite. "
          "(2) 0 erros críticos em 37 chamadas sem sustentação limita a taxa verdadeira a cerca de 8% (regra dos três, 95%), e as 37 chamadas são 13 casos com no máximo 3 variantes de contexto, não 37 amostras independentes. "
          "(3) A forma B perde por causa da redação de `addressed?`: o Noul trata 'contradiz' como 'não diz', e `addressed` fica em 0,08–0,44 nas contradições; outra redação não foi testada e não está descartada."]
    L += ["", "Limites do que este spike sustenta: 30 casos curados, três artigos de um mesmo domínio, parágrafos truncados em 1.500 caracteres, instruções em inglês; "
          "as probabilidades são as da API, sem calibração própria. Nada aqui fixa limiares finais do produto; c_min = 0,70 é provisório."]
    return "\n".join(L)


MARK_B, MARK_E = "<!-- J1A:BEGIN -->", "<!-- J1A:END -->"


def cmd_report() -> None:
    import spike_report  # noqa: PLC0415

    spike_report.build(j.RAW, j.PUBLIC, j.REPORT, j.redact)  # regenera a parte J0 (mesmo ledger)
    entries = load_entries(RAW)
    PUBLIC.write_text("".join(json.dumps(j.redact(e), ensure_ascii=False) + "\n" for e in entries))
    body = section(entries)
    text = j.REPORT.read_text()
    j.REPORT.write_text(text.rstrip("\n") + f"\n\n{MARK_B}\n{body}\n{MARK_E}\n")
    print(f"seção J1a anexada a {j.REPORT}; ledger redigido: {PUBLIC} ({len(entries)} linhas)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("dry")
    run = sub.add_parser("run")
    run.add_argument("--only", choices=("PILOT",))
    run.add_argument("--budget", type=int, default=BUDGET)
    sub.add_parser("report")
    args = parser.parse_args()
    if args.cmd == "dry":
        cmd_dry()
    elif args.cmd == "run":
        cmd_run(args.only == "PILOT", args.budget)
    else:
        cmd_report()


if __name__ == "__main__":
    main()
