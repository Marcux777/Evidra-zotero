# Corpus RL-20

**Aquisição concluída; referência humana e avaliação ainda não executadas.** São 20 PDFs públicos do arXiv, 351 páginas e 46.827.598 bytes. Os arquivos permanecem em `.local/quality-pilot/pdfs/`, fora do Git; o [inventário CSV](corpus.csv) contém autores, URL versionada, caminho local, hash SHA-256 e páginas de cada um.

A tabela usa o ano da primeira submissão ao arXiv, não o ano de publicação em conferência/periódico. As versões fixadas podem ter atualizações posteriores. Foram conferidos o cabeçalho PDF, a abertura, a contagem de páginas, o título e a marca da versão na primeira página de todos os documentos; as primeiras páginas também foram inspecionadas visualmente. Isso não é leitura científica integral nem anotação de referência.

| ID | Artigo | Ano | Família | Páginas |
|---|---|---:|---|---:|
| RL01 | [DQN — Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602v1) | 2013 | Valor | 9 |
| RL02 | [Double DQN — Deep Reinforcement Learning with Double Q-learning](https://arxiv.org/abs/1509.06461v3) | 2015 | Valor | 13 |
| RL03 | [Dueling DQN — Dueling Network Architectures for Deep Reinforcement Learning](https://arxiv.org/abs/1511.06581v3) | 2015 | Valor | 15 |
| RL04 | [Rainbow — Rainbow: Combining Improvements in Deep Reinforcement Learning](https://arxiv.org/abs/1710.02298v1) | 2017 | Valor | 14 |
| RL05 | [TRPO — Trust Region Policy Optimization](https://arxiv.org/abs/1502.05477v5) | 2015 | Política/controle | 16 |
| RL06 | [PPO — Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347v2) | 2017 | Política/controle | 12 |
| RL07 | [A3C — Asynchronous Methods for Deep Reinforcement Learning](https://arxiv.org/abs/1602.01783v2) | 2016 | Política/controle | 19 |
| RL08 | [DDPG — Continuous control with deep reinforcement learning](https://arxiv.org/abs/1509.02971v6) | 2015 | Política/controle | 14 |
| RL09 | [TD3 — Addressing Function Approximation Error in Actor-Critic Methods](https://arxiv.org/abs/1802.09477v3) | 2018 | Política/controle | 15 |
| RL10 | [SAC — Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor](https://arxiv.org/abs/1801.01290v2) | 2018 | Política/controle | 14 |
| RL11 | [IMPALA — IMPALA: Scalable Distributed Deep-RL with Importance Weighted Actor-Learner Architectures](https://arxiv.org/abs/1802.01561v3) | 2018 | Política/controle | 22 |
| RL12 | [C51 — A Distributional Perspective on Reinforcement Learning](https://arxiv.org/abs/1707.06887v1) | 2017 | Valor | 19 |
| RL13 | [Dreamer — Dream to Control: Learning Behaviors by Latent Imagination](https://arxiv.org/abs/1912.01603v3) | 2019 | Modelo do ambiente | 20 |
| RL14 | [DreamerV2 — Mastering Atari with Discrete World Models](https://arxiv.org/abs/2010.02193v4) | 2020 | Modelo do ambiente | 26 |
| RL15 | [PlaNet — Learning Latent Dynamics for Planning from Pixels](https://arxiv.org/abs/1811.04551v5) | 2018 | Modelo do ambiente | 20 |
| RL16 | [MuZero — Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model](https://arxiv.org/abs/1911.08265v2) | 2019 | Modelo do ambiente | 21 |
| RL17 | [CQL — Conservative Q-Learning for Offline Reinforcement Learning](https://arxiv.org/abs/2006.04779v3) | 2020 | Offline | 31 |
| RL18 | [IQL — Offline Reinforcement Learning with Implicit Q-Learning](https://arxiv.org/abs/2110.06169v1) | 2021 | Offline | 13 |
| RL19 | [Decision Transformer — Decision Transformer: Reinforcement Learning via Sequence Modeling](https://arxiv.org/abs/2106.01345v2) | 2021 | Offline | 21 |
| RL20 | [Trajectory Transformer — Offline Reinforcement Learning as One Big Sequence Modeling Problem](https://arxiv.org/abs/2106.02039v4) | 2021 | Offline | 17 |

## Seleção e limites

A amostra foi escolhida por diversidade de métodos e disponibilidade pública, antes de executar o modelo: cinco trabalhos de valor, sete de política/controle contínuo, quatro baseados em modelos do ambiente e quatro offline. Predominam benchmarks de deep RL e artigos clássicos de 2013–2021. Não é uma revisão sistemática, nem cobre de modo representativo RL tabular, bandits, multiagente, robótica real ou trabalhos recentes. A inclusão no treinamento dos modelos é desconhecida; não alegar ausência de contaminação.

Os 20 artigos são reservados à avaliação. Nenhum rótulo, valor de referência ou desempenho do modelo foi usado para escolhê-los. Dificuldades específicas de tabelas, contradições, dados ausentes e legibilidade precisam ser anotadas pela pessoa que construir a referência; não foram presumidas a partir dos metadados. O [protocolo](README.md) mantém os microcasos prévios e o ajuste de prompts fora deste corpus.

Fonte: arXiv, via CLI instalado `paper-search`. Foram pesquisados títulos previamente selecionados com consultas OR; nenhum filtro de ano foi aplicado. Uma primeira consulta retornou zero resultados e foi preservada; duas consultas com sintaxe corrigida recuperaram os 20 IDs, sem erros da fonte. As consultas literais, horários UTC, respostas, contagens e stderr estão em `.local/quality-pilot/searches/`; `manifest-receipt.json` e `candidates.json` vinculam cada artigo à sua consulta. Avisos sobre credenciais de outras fontes não utilizadas não foram tratados como falhas do arXiv.

O arXiv autoriza leitura e download públicos; isso não estabelece uma licença geral de redistribuição ou outros usos. As licenças específicas de reutilização não foram avaliadas. Os PDFs não estão incluídos no Git, em um pacote público ou em chamadas a provedores externos. [Política oficial de licenças](https://info.arxiv.org/help/license/index.html).

Aquisição: `.local/quality-pilot/downloads/rl20-downloads-49101df99ddf48baaee400b0394a2291/receipt.json`, 20/20 comandos concluídos. Resumo e hashes: `.local/quality-pilot/acquisition-summary.json`. Nenhum PDF original foi modificado. Não houve importação no Zotero, geração por modelo ou preenchimento automático da referência humana.
