# J0 — Spike do Jev: resultados

Gerado por `scripts/spikes/jev_spike.py report` (módulo `spike_report.py`). Janela das chamadas: 2026-10-10T00:08:53+00:00 a 2026-10-10T00:09:53+00:00. 177 chamadas bem-sucedidas a `POST /v1/systemone`, 279590 `input_tokens` no total, modelo informado pela API: jev-1.13.0. Chamadas com erro: 0.

## Veredito

| hipótese | veredito |
|---|---|
| H1 — âncora por ID | **CONFIRMADA** |
| H2 — critério por Noul | **PARCIAL (separa casos claros; sem informação não cai na faixa ambígua)** |
| H3 — orçamento | **MEDIDA** |

## Material e ledger

Artigos open access (Europe PMC, `fullTextXML`), todos CC BY 4.0, de Alzheimer, fora do RL-20 e da busca real. Os textos não são redistribuídos aqui: o ledger versionado ([JEV_SPIKE_LEDGER.jsonl](JEV_SPIKE_LEDGER.jsonl)) troca cada trecho por `<excerpt ref=PMCID#pN sha256=… chars=…>`; perguntas, IDs, `criteria`, respostas, `usage` e `x-typesafe-request-id` ficam verbatim. O pedido completo é reproduzível pelo script (sementes fixas) e conferível por `request_sha256`. Parágrafos com menos de 200 caracteres foram descartados e os demais truncados em 1.500; a numeração `pN` é a do script (parágrafos do corpo do XML que passam nesse filtro).

| artigo | licença | SHA-256 do XML baixado |
|---|---|---|
| PMC11059071 | CC BY 4.0 | `164fe0c690d4448c5275b9c5c0f5acf254dee54449c56b3365fab25027fc0839` |
| PMC11074813 | CC BY 4.0 | `55dc3095eaece8b43d2712e5805a8a21a07b5e354d6abb410ae7ff1d8942c93d` |
| PMC11186782 | CC BY 4.0 | `e6cdd426c01a02ac3d198d5827e82c1a56f35568eebe5f33a2c1ac00305862a3` |

Os microcasos sintéticos são os três de `services/engine/tests/test_triage.py::PAPERS` (ATARIPAP, ROBOTPAP, NOABSTRA), usados verbatim como casos s1–s3 da H2. O repositório não tem arquivos de microcaso além desses; a frase sintética `87.5 / % / SYN-1` citada em `TEST_REPORT.md` não está versionada e não foi usada.

## H1 — âncora por ID

Veredito: **CONFIRMADA**.

Cada chamada é uma pergunta Choice com uma única resposta verificável (regex que casa exatamente um parágrafo do artigo, conferido antes de enviar), k ∈ {3, 5, 10} opções (a correta mais k−1 parágrafos do mesmo artigo, posição sorteada). Variantes: `opaque` = trechos no state (objeto JSON `{"excerpts": {id: texto}}`) e `criteria` = `{id: null}`; `marked` = state em texto com marcadores `[eN]`, `criteria` = `{id: null}`; `desc` = texto do trecho na descrição de cada opção e state mínimo (a alternativa do J0). `opaque` foi repetida com outra amostra de distratores e outra posição.

| variante | k | chamadas | acerto top-1 | acertos com confiança ≥ 0,7 | p médio da opção correta | input_tokens médio |
|---|---|---|---|---|---|---|
| desc | 3 | 12 | 12/12 (100%) | 12/12 (100%) | 1.000 | 907 |
| desc | 5 | 12 | 12/12 (100%) | 12/12 (100%) | 1.000 | 1427 |
| desc | 10 | 12 | 12/12 (100%) | 12/12 (100%) | 1.000 | 2418 |
| marked | 5 | 12 | 12/12 (100%) | 12/12 (100%) | 1.000 | 1380 |
| marked | 10 | 12 | 12/12 (100%) | 12/12 (100%) | 0.999 | 2367 |
| opaque | 3 | 24 | 24/24 (100%) | 24/24 (100%) | 1.000 | 878 |
| opaque | 5 | 24 | 24/24 (100%) | 24/24 (100%) | 1.000 | 1425 |
| opaque | 10 | 24 | 24/24 (100%) | 24/24 (100%) | 1.000 | 2403 |

Total por variante:

| variante | acerto top-1 | acertos com confiança ≥ 0,7 |
|---|---|---|
| desc | 36/36 (100%) | 36/36 (100%) |
| marked | 24/24 (100%) | 24/24 (100%) |
| opaque | 72/72 (100%) | 72/72 (100%) |

Critério: acerto da variante `opaque` ≥ 90% e ≥ 80% dos acertos com confiança ≥ 0.7; parcial se acerto ≥ 75%.
Medido: `opaque` 72/72 (100%), confiança ≥ 0,7 em 72/72 (100%). Alternativa `desc` (texto nos criteria): 36/36 (100%).

- Determinismo: 3 pedidos idênticos; 1 resposta(s) distinta(s) em `answers`.
- Estabilidade entre repetições com distratores/posição diferentes (`opaque`): ambas certas 36, ambas erradas 0, divergentes 0 de 36 pares.
- Acerto por posição da opção correta (`opaque`): e1: 17/17 (100%), e2: 16/16 (100%), e3: 15/15 (100%), e4: 10/10 (100%), e5: 5/5 (100%), e6: 1/1 (100%), e8: 2/2 (100%), e9: 2/2 (100%), e10: 4/4 (100%)

## H2 — critério por Noul

Veredito: **PARCIAL (separa casos claros; sem informação não cai na faixa ambígua)**.

Cada caso envia um único trecho (state `{"excerpts": {"e1": …}}`) e uma pergunta Noul `Is the following statement true? Statement: …`, com e sem `criteria.true/false`. Os 12 casos são 4 atendidos, 4 não atendidos e 4 sem informação (trecho que não toca o critério; o script confere a ausência de termos relacionados). Os casos a/b/c vêm dos artigos; s1–s3 são os microcasos sintéticos.

| caso | classe esperada | p (sem criteria) | p (com criteria.true/false) | afirmação |
|---|---|---|---|---|
| a1 | met | 0.990 | 0.990 | The study is a randomized controlled trial. |
| a2 | not_met | 0.010 | 0.010 | The study enrolled participants younger than 18 years. |
| a3 | no_info | 0.120 | 0.100 | The study reports the proportion of female participants. |
| b1 | met | 0.980 | 0.980 | The trial was registered in a public trial registry. |
| b2 | not_met | 0.020 | 0.010 | Participants were enrolled without biological confirmation of Alzheimer disease. |
| b3 | no_info | 0.240 | 0.100 | The study reports its funding source. |
| c1 | met | 0.990 | 0.990 | The trial used a double-blind design. |
| c2 | not_met | 0.010 | 0.010 | The trial lasted less than six months. |
| c3 | no_info | 0.240 | 0.120 | The study reports the mean MMSE score of the participants. |
| s1 | met | 0.970 | 0.970 | The study applies deep reinforcement learning to Atari games. |
| s2 | not_met | 0.020 | 0.020 | The study applies deep reinforcement learning to Atari games. |
| s3 | no_info | 0.260 | 0.190 | The study applies deep reinforcement learning to Atari games. |

| condição | casos claros dentro dos limiares | min(atendido) > max(não atendido) | sem informação em (0,3; 0,7) | sem informação ≤ 0,3 | sem informação ≥ 0,7 |
|---|---|---|---|---|---|
| sem criteria | 8/8 (100%) | sim | 0/4 (0%) | 4/4 (100%) | 0/4 (0%) |
| com criteria | 8/8 (100%) | sim | 0/4 (0%) | 4/4 (100%) | 0/4 (0%) |

Critério (pré-registrado): atendido p ≥ 0.7, não atendido p ≤ 0.3, sem informação em (0.3; 0.7). Confirmada se ≥ 7/8 casos claros e ≥ 2/4 casos sem informação na faixa ambígua (melhor condição); parcial se só os claros passam.

## H3 — orçamento

Veredito: **MEDIDA**. O leque de perguntas do desenho não está no repositório: foram usadas 10 perguntas Noul genéricas como substituto declarado (ver `H3_QUESTIONS` no script). Calibração com o leque real exige repetir a varredura com ele.

Perguntas Noul sobre n trechos do mesmo artigo (state = objeto JSON de trechos; sem criteria):

| n trechos | caracteres | m=1 | m=5 | m=10 | Δ(m=10 − m=1) | tokens/caractere (m=1) |
|---|---|---|---|---|---|---|
| 1 | 804 | 454 | 511 | 588 | 134 | 0.565 |
| 5 | 5965 | 1783 | 1840 | 1917 | 134 | 0.299 |
| 10 | 9416 | 2752 | 2809 | 2886 | 134 | 0.292 |
| 20 | 16574 | 4820 | 4877 | 4954 | 134 | 0.291 |

Ajuste linear por número de perguntas:

- m=1: input_tokens ≈ 178 + 0.2777 × caracteres (r = 0.9996; 4 pontos)
- m=5: input_tokens ≈ 235 + 0.2777 × caracteres (r = 0.9996; 4 pontos)
- m=10: input_tokens ≈ 312 + 0.2777 × caracteres (r = 0.9996; 4 pontos)

Uma pergunta Choice sobre n opções (IDs opacos com trechos no state × texto nos criteria):

| n opções | caracteres | IDs opacos (state) | texto nos criteria | diferença |
|---|---|---|---|---|
| 5 | 5965 | 1827 | 1852 | 25 |
| 10 | 9416 | 2832 | 2841 | 9 |
| 20 | 16574 | 4980 | 4949 | -31 |

input_tokens médio nas chamadas da H1 (1 pergunta Choice):

| variante | k=3 | k=5 | k=10 |
|---|---|---|---|
| opaque | 878 | 1425 | 2403 |
| marked | — | 1380 | 2367 |
| desc | 907 | 1427 | 2418 |

## Apêndice — chamadas

| call_id | HTTP | latência (ms) | input_tokens | output_tokens | request-id |
|---|---|---|---|---|---|
| H1|q03|opaque|k3|r0 | 200 | 326 | 960 | 42 | req_01a12324217a7587aa743d1891020d20 |
| H1|q03|desc|k3|r0 | 200 | 291 | 991 | 42 | req_01a123242284708083504da12bc97d50 |
| H1|q01|opaque|k3|r0 | 200 | 346 | 651 | 42 | req_01a123242e037867bd09e9bd929e0770 |
| H1|q01|opaque|k3|r1 | 200 | 269 | 799 | 42 | req_01a123242f2373199ee18fba4fd67b04 |
| H1|q01|desc|k3|r0 | 200 | 258 | 682 | 42 | req_01a123243031794e93916b50c9c1dbcf |
| H1|q01|opaque|k5|r0 | 200 | 254 | 1304 | 58 | req_01a1232431347c5d8c36fb6992cbe5fe |
| H1|q01|opaque|k5|r1 | 200 | 276 | 1588 | 58 | req_01a1232432407c19b4b8c1d2eee60fd8 |
| H1|q01|desc|k5|r0 | 200 | 275 | 1329 | 58 | req_01a12324334f7cb49f058d1722dc0ae3 |
| H1|q01|marked|k5|r0 | 200 | 568 | 1284 | 58 | req_01a1232435707aaa857fd60ec549f69e |
| H1|q01|opaque|k10|r0 | 200 | 463 | 2442 | 99 | req_01a12324374f7ef2a54eff75deb28bd2 |
| H1|q01|opaque|k10|r1 | 200 | 381 | 2233 | 99 | req_01a1232438897b31a57cdd7d951eea1c |
| H1|q01|desc|k10|r0 | 200 | 1278 | 2451 | 99 | req_01a123243b2a71c681e477dad5e42d9d |
| H1|q01|marked|k10|r0 | 200 | 1902 | 2398 | 99 | req_01a1232440507198919077095edfdd8c |
| H1|q02|opaque|k3|r0 | 200 | 308 | 1000 | 42 | req_01a1232446b07a48afaf6654fd6eabcd |
| H1|q02|opaque|k3|r1 | 200 | 273 | 968 | 42 | req_01a1232447e977b783982fdb1ae840b0 |
| H1|q02|desc|k3|r0 | 200 | 283 | 1031 | 42 | req_01a12324493a77e7b64f1803c20501f3 |
| H1|q02|opaque|k5|r0 | 200 | 321 | 1385 | 58 | req_01a123244add75f29273bfa1b258d950 |
| H1|q02|opaque|k5|r1 | 200 | 306 | 1350 | 58 | req_01a123244c2877f884b1a0c54386ca7d |
| H1|q02|desc|k5|r0 | 200 | 342 | 1410 | 58 | req_01a123244d9775c2b80def610015c4d1 |
| H1|q02|marked|k5|r0 | 200 | 452 | 1365 | 58 | req_01a123244ffd791d8af2717c0762883e |
| H1|q02|opaque|k10|r0 | 200 | 401 | 2491 | 99 | req_01a1232451bf78fabed4e390e30372de |
| H1|q02|opaque|k10|r1 | 200 | 367 | 2460 | 99 | req_01a1232453357106b9dca8ec4cbe72e1 |
| H1|q02|desc|k10|r0 | 200 | 324 | 2500 | 99 | req_01a1232454d6700b92a6155378246dff |
| H1|q02|marked|k10|r0 | 200 | 670 | 2447 | 99 | req_01a1232457a972cb8d67abd9abf16f83 |
| H1|q03|opaque|k3|r1 | 200 | 316 | 815 | 42 | req_01a1232458e872d4b0ec68e1eb80c82f |
| H1|q03|opaque|k5|r0 | 200 | 261 | 1336 | 58 | req_01a123245a58780c810e63e2b8cb41a3 |
| H1|q03|opaque|k5|r1 | 200 | 293 | 1552 | 58 | req_01a123245b7776e3b10b80f544648c2d |
| H1|q03|desc|k5|r0 | 200 | 333 | 1361 | 58 | req_01a123245cbf7af9afe41a59ad33b997 |
| H1|q03|marked|k5|r0 | 200 | 276 | 1316 | 58 | req_01a123245e1075fea143995b0ba05bf1 |
| H1|q03|opaque|k10|r0 | 200 | 291 | 2630 | 99 | req_01a123245f3578ec8b5d39119ac76c54 |
| H1|q03|opaque|k10|r1 | 200 | 299 | 2418 | 99 | req_01a12324607f7a20ba70d2493b34351c |
| H1|q03|desc|k10|r0 | 200 | 292 | 2639 | 99 | req_01a1232461a571368e2004e10758e16e |
| H1|q03|marked|k10|r0 | 200 | 517 | 2590 | 99 | req_01a123246397754396138a493ad66767 |
| H1|q04|opaque|k3|r0 | 200 | 285 | 1024 | 42 | req_01a1232464eb704088e4cdb23c2cad78 |
| H1|q04|opaque|k3|r1 | 200 | 278 | 825 | 42 | req_01a12324661376b4a907148379aeadcb |
| H1|q04|desc|k3|r0 | 200 | 264 | 1055 | 42 | req_01a123246738711fb295019423313b71 |
| H1|q04|opaque|k5|r0 | 200 | 265 | 1456 | 58 | req_01a123246850718abf7b22e8b737a5ea |
| H1|q04|opaque|k5|r1 | 200 | 253 | 1510 | 58 | req_01a1232469557abb9d05dc62b5d34315 |
| H1|q04|desc|k5|r0 | 200 | 254 | 1481 | 58 | req_01a123246a5d7103aa5e03d636643b10 |
| H1|q04|marked|k5|r0 | 200 | 301 | 1436 | 58 | req_01a123246b687dd1be756b6ba3ff0fa0 |
| H1|q04|opaque|k10|r0 | 200 | 265 | 2665 | 100 | req_01a123246c9f7ba88c1f8c0a049067eb |
| H1|q04|opaque|k10|r1 | 200 | 266 | 2366 | 99 | req_01a123246da27a78ac3cd974174e813d |
| H1|q04|desc|k10|r0 | 200 | 321 | 2674 | 100 | req_01a123246eb77663bc089e1f7cd2b576 |
| H1|q04|marked|k10|r0 | 200 | 272 | 2625 | 100 | req_01a12324700772598d5eb979e7470a42 |
| H1|q05|opaque|k3|r0 | 200 | 268 | 859 | 42 | req_01a12324711e7397bb7f37bfeec11788 |
| H1|q05|opaque|k3|r1 | 200 | 342 | 793 | 42 | req_01a1232472367b99b71e36e03629534e |
| H1|q05|desc|k3|r0 | 200 | 302 | 890 | 42 | req_01a1232473ba7a5aaf5eb23a01689704 |
| H1|q05|opaque|k5|r0 | 200 | 260 | 1580 | 58 | req_01a1232474d8744485d7533c11d4d445 |
| H1|q05|opaque|k5|r1 | 200 | 290 | 1292 | 58 | req_01a1232475ec744fbfea98d7f8669317 |
| H1|q05|desc|k5|r0 | 200 | 316 | 1605 | 58 | req_01a123247734733caf222558d39060a2 |
| H1|q05|marked|k5|r0 | 200 | 257 | 1560 | 58 | req_01a12324785e779c8d5197bbc21a6966 |
| H1|q05|opaque|k10|r0 | 200 | 374 | 2558 | 99 | req_01a12324796e7037b48eaef7d8507b47 |
| H1|q05|opaque|k10|r1 | 200 | 274 | 2582 | 99 | req_01a123247ae8786c9be2e8e63a16b060 |
| H1|q05|desc|k10|r0 | 200 | 346 | 2567 | 99 | req_01a123247bfe7884a39209f22932d366 |
| H1|q05|marked|k10|r0 | 200 | 294 | 2515 | 99 | req_01a123247d6f799da4f6274300f9806c |
| H1|q06|opaque|k3|r0 | 200 | 271 | 735 | 42 | req_01a123247ea275028cf8718531912953 |
| H1|q06|opaque|k3|r1 | 200 | 317 | 753 | 42 | req_01a123247fbe7aa8b711de6b0f150963 |
| H1|q06|desc|k3|r0 | 200 | 318 | 766 | 42 | req_01a12324811d758bbcfc927454dea87f |
| H1|q06|opaque|k5|r0 | 200 | 379 | 1548 | 58 | req_01a1232482b577c8b2f671797f619e6f |
| H1|q06|opaque|k5|r1 | 200 | 310 | 1395 | 58 | req_01a1232483e872e29b5f1b135e641c8e |
| H1|q06|desc|k5|r0 | 200 | 338 | 1573 | 58 | req_01a12324853a756eaa792979de90d205 |
| H1|q06|marked|k5|r0 | 200 | 350 | 1527 | 58 | req_01a1232486a27b96b94f25af48bd5609 |
| H1|q06|opaque|k10|r0 | 200 | 391 | 2670 | 99 | req_01a1232488027bff807b4e1c8cc9919b |
| H1|q06|opaque|k10|r1 | 200 | 301 | 2028 | 99 | req_01a12324899477daa6dbd050331508e9 |
| H1|q06|desc|k10|r0 | 200 | 290 | 2679 | 99 | req_01a123248acd7f9f9ce121c302bc465e |
| H1|q06|marked|k10|r0 | 200 | 293 | 2628 | 99 | req_01a123248bf87469bfd1f055cfcf723a |
| H1|q07|opaque|k3|r0 | 200 | 273 | 1056 | 42 | req_01a123248d2b7a16a8712833cc7a1554 |
| H1|q07|opaque|k3|r1 | 200 | 268 | 1280 | 42 | req_01a123248e4c75afa09753e0a12fb801 |
| H1|q07|desc|k3|r0 | 200 | 286 | 1087 | 42 | req_01a123248f6b79538e7ca8d0e6705022 |
| H1|q07|opaque|k5|r0 | 200 | 250 | 1399 | 58 | req_01a1232490927f1a85ab348690a4fc6d |
| H1|q07|opaque|k5|r1 | 200 | 299 | 1395 | 58 | req_01a1232491a679099a8a1e06814774cd |
| H1|q07|desc|k5|r0 | 200 | 323 | 1424 | 58 | req_01a1232493157b43a6384d0e793b8c31 |
| H1|q07|marked|k5|r0 | 200 | 328 | 1379 | 58 | req_01a12324943870bba83962652edae96f |
| H1|q07|opaque|k10|r0 | 200 | 271 | 2070 | 100 | req_01a1232495787856af7d135dcfdf93b6 |
| H1|q07|opaque|k10|r1 | 200 | 337 | 2348 | 100 | req_01a1232496c17c2180048ba57965cdc0 |
| H1|q07|desc|k10|r0 | 200 | 310 | 2079 | 100 | req_01a1232497f47670883eb7bf2c917289 |
| H1|q07|marked|k10|r0 | 200 | 436 | 2030 | 100 | req_01a1232499ee77a8a32bf9246929fe51 |
| H1|q08|opaque|k3|r0 | 200 | 251 | 1008 | 42 | req_01a123249b037c23b857b4d3410fb301 |
| H1|q08|opaque|k3|r1 | 200 | 324 | 966 | 42 | req_01a123249c087a9dad9ce1b7d6c5beb3 |
| H1|q08|desc|k3|r0 | 200 | 250 | 1039 | 42 | req_01a123249d55777d8426932169f50ca2 |
| H1|q08|opaque|k5|r0 | 200 | 324 | 1335 | 58 | req_01a123249e5a78999ffbf6ba92290ed7 |
| H1|q08|opaque|k5|r1 | 200 | 265 | 1897 | 58 | req_01a123249fb377ffa0bb454f5ad45c91 |
| H1|q08|desc|k5|r0 | 200 | 297 | 1360 | 58 | req_01a12324a0c574aeb7ca3c758b2d0057 |
| H1|q08|marked|k5|r0 | 200 | 270 | 1315 | 58 | req_01a12324a1fc75189af3277f6570b19f |
| H1|q08|opaque|k10|r0 | 200 | 294 | 2448 | 99 | req_01a12324a319709c9849782783dc8f93 |
| H1|q08|opaque|k10|r1 | 200 | 278 | 2364 | 99 | req_01a12324a44f7365819edc33ad4c44a4 |
| H1|q08|desc|k10|r0 | 200 | 331 | 2457 | 99 | req_01a12324a5747c75bc3da0b1efcd6fca |
| H1|q08|marked|k10|r0 | 200 | 279 | 2407 | 99 | req_01a12324a6ca759381d4b0eb280dea16 |
| H1|q09|opaque|k3|r0 | 200 | 281 | 649 | 42 | req_01a12324a7ea7676a2d72b15512fff5f |
| H1|q09|opaque|k3|r1 | 200 | 286 | 858 | 42 | req_01a12324a90b72e895d8af2275f3e39e |
| H1|q09|desc|k3|r0 | 200 | 368 | 680 | 42 | req_01a12324aa3e7650911a4f7a7bafd209 |
| H1|q09|opaque|k5|r0 | 200 | 272 | 1414 | 58 | req_01a12324aba773bd80e4866574100860 |
| H1|q09|opaque|k5|r1 | 200 | 292 | 1411 | 58 | req_01a12324accc7b52ae93139453fcaa98 |
| H1|q09|desc|k5|r0 | 200 | 280 | 1439 | 58 | req_01a12324adf57f1c9eeb3914389c0d06 |
| H1|q09|marked|k5|r0 | 200 | 327 | 1394 | 58 | req_01a12324af2b7f69a664c951ea51ec9c |
| H1|q09|opaque|k10|r0 | 200 | 299 | 2157 | 99 | req_01a12324b0757234a9ea784f07d0ee73 |
| H1|q09|opaque|k10|r1 | 200 | 281 | 2453 | 99 | req_01a12324b19d7efbb14a0cfc432adf62 |
| H1|q09|desc|k10|r0 | 200 | 502 | 2166 | 99 | req_01a12324b3ac7315a816d0d13dec2999 |
| H1|q09|marked|k10|r0 | 200 | 282 | 2116 | 99 | req_01a12324b4cf7619b57be671444604c5 |
| H1|q10|opaque|k3|r0 | 200 | 257 | 799 | 42 | req_01a12324b5eb74529f80a584a4227c62 |
| H1|q10|opaque|k3|r1 | 200 | 252 | 939 | 42 | req_01a12324b6ee7f9aa377a6f8a0c7d8a9 |
| H1|q10|desc|k3|r0 | 200 | 326 | 834 | 42 | req_01a12324b80178a9bbce70f9a2f12f20 |
| H1|q10|opaque|k5|r0 | 200 | 250 | 1113 | 58 | req_01a12324b93f7e1aafff8cc514a74f8f |
| H1|q10|opaque|k5|r1 | 200 | 303 | 1116 | 58 | req_01a12324ba4e746c86884216da11c8d0 |
| H1|q10|desc|k5|r0 | 200 | 265 | 1142 | 58 | req_01a12324bb8f7631ad2359962c4fe3f9 |
| H1|q10|marked|k5|r0 | 200 | 289 | 1094 | 58 | req_01a12324bca27e5ba5ec602d773dbc3b |
| H1|q10|opaque|k10|r0 | 200 | 550 | 2081 | 99 | req_01a12324be1f728ca3740e8fd2ee9b31 |
| H1|q10|opaque|k10|r1 | 200 | 309 | 2109 | 99 | req_01a12324bffd79b9bbb3e84a86a0f785 |
| H1|q10|desc|k10|r0 | 200 | 403 | 2094 | 99 | req_01a12324c1947e89abe8a970f2b9249b |
| H1|q10|marked|k10|r0 | 200 | 285 | 2040 | 99 | req_01a12324c2e076d3b6122631939bc7a1 |
| H1|q11|opaque|k3|r0 | 200 | 308 | 813 | 42 | req_01a12324c40a72c5953872fca5ecdc12 |
| H1|q11|opaque|k3|r1 | 200 | 279 | 880 | 42 | req_01a12324c53d7e8d971d1a9c83af663d |
| H1|q11|desc|k3|r0 | 200 | 266 | 848 | 42 | req_01a12324c66171118ccaafc8b13ddb39 |
| H1|q11|opaque|k5|r0 | 200 | 287 | 1513 | 58 | req_01a12324c77f7900a098e48abf2e2ad1 |
| H1|q11|opaque|k5|r1 | 200 | 249 | 1344 | 58 | req_01a12324c8a171a0bccb678c33f57dd5 |
| H1|q11|desc|k5|r0 | 200 | 271 | 1542 | 58 | req_01a12324c9a572c8b8da9638a31cb228 |
| H1|q11|marked|k5|r0 | 200 | 297 | 1493 | 58 | req_01a12324cabc782f8b4eefae0e6aa92e |
| H1|q11|opaque|k10|r0 | 200 | 248 | 2280 | 100 | req_01a12324cbeb70ec9adf08a6767a4eaa |
| H1|q11|opaque|k10|r1 | 200 | 271 | 2615 | 99 | req_01a12324ccf67826b55ce20733d56dd7 |
| H1|q11|desc|k10|r0 | 200 | 274 | 2293 | 100 | req_01a12324ce0478e2832e25b7a0b7bcb6 |
| H1|q11|marked|k10|r0 | 200 | 251 | 2238 | 100 | req_01a12324cf21739ea3824f13cb0fe757 |
| H1|q12|opaque|k3|r0 | 200 | 305 | 941 | 42 | req_01a12324d0467045b5bfe17397b49f69 |
| H1|q12|opaque|k3|r1 | 200 | 290 | 700 | 42 | req_01a12324d1587417b40a02d2a4c0a02e |
| H1|q12|desc|k3|r0 | 200 | 245 | 976 | 42 | req_01a12324d2837ff7abed042155c81320 |
| H1|q12|opaque|k5|r0 | 200 | 250 | 1424 | 58 | req_01a12324d38c73ec9f24aad9cb798890 |
| H1|q12|opaque|k5|r1 | 200 | 287 | 1539 | 58 | req_01a12324d48d7d6e810b65f7885503a7 |
| H1|q12|desc|k5|r0 | 200 | 316 | 1453 | 58 | req_01a12324d5d1743caf017cde82b9d227 |
| H1|q12|marked|k5|r0 | 200 | 253 | 1401 | 58 | req_01a12324d6ff77cb8b7fa2e3f20faa60 |
| H1|q12|opaque|k10|r0 | 200 | 286 | 2408 | 99 | req_01a12324d80474d8bf47c39f4d4d785e |
| H1|q12|opaque|k10|r1 | 200 | 318 | 2793 | 99 | req_01a12324d92877f5bf86edbf27a6135c |
| H1|q12|desc|k10|r0 | 200 | 324 | 2421 | 99 | req_01a12324da8379b8b24e992fdae7927b |
| H1|q12|marked|k10|r0 | 200 | 325 | 2365 | 99 | req_01a12324dbd375e9a23c38ca58acaaa9 |
| H1|determinism|n0 | 200 | 249 | 1297 | 58 | req_01a12324dd107dd08b5dcf1fc1d646d3 |
| H1|determinism|n1 | 200 | 256 | 1297 | 58 | req_01a12324de0972a4a2fa6ea33d9f3aec |
| H1|determinism|n2 | 200 | 274 | 1297 | 58 | req_01a12324df147b31964b0d4668d301da |
| H2|a1|plain | 200 | 283 | 521 | 20 | req_01a12324e0347822812153a9e80c40fb |
| H2|a1|crit | 200 | 257 | 557 | 20 | req_01a12324e13b77a09e85b1ed174c7017 |
| H2|a2|plain | 200 | 349 | 452 | 20 | req_01a12324e24e789e8437b7297d4d5cd3 |
| H2|a2|crit | 200 | 291 | 488 | 20 | req_01a12324e3a670f292d7040eefa58b89 |
| H2|a3|plain | 200 | 281 | 509 | 20 | req_01a12324e4ce708d86a24482bc4d611f |
| H2|a3|crit | 200 | 262 | 545 | 20 | req_01a12324e5eb763bbae01c002cbd2485 |
| H2|b1|plain | 200 | 263 | 492 | 20 | req_01a12324e6fb7c8aa780ef6958bb4d27 |
| H2|b1|crit | 200 | 263 | 528 | 20 | req_01a12324e80574cdaa45a5e9c8418639 |
| H2|b2|plain | 200 | 262 | 518 | 20 | req_01a12324e91a70fc9dc458e4a7a56697 |
| H2|b2|crit | 200 | 288 | 554 | 20 | req_01a12324ea1e74b3b6754b47a0e58f56 |
| H2|b3|plain | 200 | 512 | 436 | 20 | req_01a12324ec0d758090ea797baf7423ec |
| H2|b3|crit | 200 | 275 | 472 | 20 | req_01a12324ed517f3e9dbb50e42105e87e |
| H2|c1|plain | 200 | 319 | 594 | 20 | req_01a12324ee63770d8cf492fd2b27d5c4 |
| H2|c1|crit | 200 | 281 | 630 | 20 | req_01a12324efaa7612b5dbe9a822776fc8 |
| H2|c2|plain | 200 | 306 | 593 | 20 | req_01a12324f0e67413834923c8b88816c1 |
| H2|c2|crit | 200 | 279 | 629 | 20 | req_01a12324f1fc7964a4e7c480ea13ca16 |
| H2|c3|plain | 200 | 340 | 393 | 20 | req_01a12324f31e73429778eb00d22a95ee |
| H2|c3|crit | 200 | 299 | 429 | 20 | req_01a12324f46870b2bea4631d844b5f5b |
| H2|s1|plain | 200 | 270 | 314 | 20 | req_01a12324f5957908b710739e0904d855 |
| H2|s1|crit | 200 | 267 | 350 | 20 | req_01a12324f6aa766da9e32f8f5c6f32ea |
| H2|s2|plain | 200 | 268 | 314 | 20 | req_01a12324f7b37cf391b2d0c1ad971ffb |
| H2|s2|crit | 200 | 302 | 350 | 20 | req_01a12324f8d371a0a9a47fa06352a330 |
| H2|s3|plain | 200 | 257 | 303 | 20 | req_01a12324f9ed728baa19739af098b88d |
| H2|s3|crit | 200 | 250 | 339 | 20 | req_01a12324faeb733597945de90105d605 |
| H3|noul|n1|m1 | 200 | 322 | 454 | 21 | req_01a12324fbf57862990e0a5af15884b6 |
| H3|noul|n1|m5 | 200 | 281 | 511 | 89 | req_01a12324fd3372fa892c12e01b03be97 |
| H3|noul|n1|m10 | 200 | 288 | 588 | 175 | req_01a12324fe507a34b7506d3ae9b753fb |
| H3|noul|n5|m1 | 200 | 334 | 1783 | 21 | req_01a12324ffa47cf088d405d8faaab440 |
| H3|noul|n5|m5 | 200 | 298 | 1840 | 89 | req_01a1232500b7776a8c2fe9dc7699413c |
| H3|noul|n5|m10 | 200 | 274 | 1917 | 175 | req_01a1232501e875e38193bfb1ae00b9cc |
| H3|choice-opaque|n5 | 200 | 256 | 1827 | 58 | req_01a1232502f57085a6bbcd164526cc4e |
| H3|choice-desc|n5 | 200 | 258 | 1852 | 58 | req_01a1232503fa7587b30b4736a7e05c54 |
| H3|noul|n10|m1 | 200 | 275 | 2752 | 21 | req_01a1232505107cf4b2e95e55c7496091 |
| H3|noul|n10|m5 | 200 | 263 | 2809 | 89 | req_01a12325061171a9b3cf95209b0500f6 |
| H3|noul|n10|m10 | 200 | 255 | 2886 | 175 | req_01a12325071774d7ab9789c1f5028c00 |
| H3|choice-opaque|n10 | 200 | 276 | 2832 | 99 | req_01a1232508217336a61c442896acc7cc |
| H3|choice-desc|n10 | 200 | 250 | 2841 | 99 | req_01a12325092d71f8a8459673d1f56b41 |
| H3|noul|n20|m1 | 200 | 290 | 4820 | 21 | req_01a123250a447e7e989b984c7b1f3a43 |
| H3|noul|n20|m5 | 200 | 318 | 4877 | 89 | req_01a123250b6c72c1adbce707bda9521d |
| H3|noul|n20|m10 | 200 | 379 | 4954 | 175 | req_01a123250cde74d4a5d5f6372909feb0 |
| H3|choice-opaque|n20 | 200 | 298 | 4980 | 189 | req_01a123250e1870989968a5dab7627144 |
| H3|choice-desc|n20 | 200 | 317 | 4949 | 189 | req_01a123250f657552b23eeeab6ec89847 |
