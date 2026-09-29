# Piloto de qualidade em aprendizado por reforço

**Estado: corpus adquirido; nenhuma avaliação de modelo executada.** Foram baixados e conferidos [20 artigos de aprendizado por reforço](CORPUS.md), somando 351 páginas. A referência humana, as configurações finais e os responsáveis ainda precisam ser definidos antes do lote. Os formulários vazios em [templates](templates/) são instrumentos de coleta, não resultados.

Este piloto mede extração e revisão de resultados científicos. O [benchmark de recuperação](../../scripts/benchmark.py) continua válido no seu cenário sintético: 1.000 fontes, 50.000 chunks e p95 aquecido de 1,265 s. Ele não estima a qualidade semântica dos embeddings, a correção da extração nem a economia de trabalho em PDFs reais. Nenhuma contagem de critérios é convertida em percentual de prontidão; A25, A29 e A33 permanecem parciais.

## Corpus e separação da referência

O corpus contém 20 artigos públicos, com versão e hash do PDF fixados, cobrindo métodos baseados em valor, política/controle contínuo, modelos do ambiente e aprendizado offline. É uma amostra intencional de deep RL, com primeiras submissões entre 2013 e 2021; não representa toda a literatura de RL, nem foi escolhida por resultados observados do modelo. Trabalhos clássicos podem ter participado do treinamento dos modelos: isso deve limitar qualquer alegação de generalização ou ausência de contaminação.

Todos os 20 artigos pertencem à avaliação. Os três microcasos prévios usam material de desenvolvimento separado, inclusive os documentos sintéticos já autorizados; não entram na estimativa de qualidade sobre artigos reais. Ajustar prompts apenas nesse material separado. Depois de observar respostas ou rótulos dos 20 artigos, qualquer ajuste inaugura outra versão exploratória; o mesmo corpus deixa de ser um teste intocado dessa versão.

Registrar em `corpus.csv` identificador, título, autores, data, arXiv versionado, URL, SHA-256, quantidade de páginas, família de método e grupo de versões/trabalhos relacionados. Marcar características efetivamente inspecionadas: tabelas densas, múltiplos ambientes/experimentos, apêndices, métricas normalizadas, resultados divergentes, dados ausentes e problemas de leitura. A seleção bibliográfica sozinha não comprova essas características. Duplicatas e versões do mesmo artigo são um único trabalho.

Os PDFs públicos ficam em pasta local ignorada pelo Git. O arXiv permite sua leitura e download; as licenças de reutilização variam por versão. Este preparo não autoriza redistribuir os PDFs nem enviá-los a uma API externa. [Política do arXiv](https://info.arxiv.org/help/license/index.html).

Uma pessoa com conhecimento de RL elabora a referência sem ver saídas do modelo. Para cada unidade, registra o valor original e normalizado, unidade, ambiente/dataset, condição experimental, método/baseline, estatística, número de repetições quando informado e evidência no PDF. A página física é contada desde 1; o `page_index` do produto começa em 0. Guardar também rótulo impresso, tabela/figura e trecho suficiente para conferir a interpretação. Não preencher a referência com extração deste agente ou de outro modelo e chamá-la de manual.

Fixar perguntas e tolerâncias antes de executar: por exemplo, retorno por episódio não é taxa de sucesso; score bruto não é score normalizado por humano; frames não são automaticamente passos do ambiente. Unidade, ambiente, versão da tarefa, orçamento de treino, agregação entre seeds e condição precisam corresponder. Quando houver vários resultados, usar `experimental_result` e uma referência por tupla, sem escolher retrospectivamente o número mais favorável. O campo já suporta métrica, número original/normalizado, dataset, condição, unidade, baseline e direção.

Separar `FOUND`, `NOT_REPORTED_CONFIRMED`, `NOT_APPLICABLE`, `CONFLICTING`, `UNREADABLE` e `UNRESOLVED_REFERENCE`. Confirmar ausência exige busca manual documentada no artigo e nos apêndices incluídos; não existe um trecho que por si só prove ausência. `NOT_FOUND_IN_SEARCH` e `NOT_REPORTED_CANDIDATE` são estados do sistema, não certificados humanos. Uma referência não resolvida permanece visível e impede uma conclusão para aquela unidade; sua quantidade deve ser reportada. Rever ambiguidades com outra pessoa antes do congelamento, quando disponível, registrando limitações da referência se houver apenas um anotador.

Guardar o arquivo preenchido de referência fora da pasta de prompts, do índice do engine e do contexto do modelo. Um custodiante registra seu hash, versão, data e autoria no arquivo de configuração; o executante não lê os rótulos durante ajustes. Congelamento lógico por hash não equivale a controle de acesso: registrar quem efetivamente teve acesso. Não incluir respostas ou localizadores de evidência da referência nas perguntas de avaliação.

## Unidades e teste prévio

Preencher `units.csv` antes da primeira chamada. Uma unidade de extração é um campo de um artigo, eventualmente contendo várias tuplas experimentais. Uma unidade de triagem é um artigo/estágio sob critérios congelados. Síntese e auditoria usam conjuntos de artigos e perguntas/afirmações previamente definidos, com listas de referências obrigatórias; não tratá-las como se fossem extração de uma célula.

O piloto prioriza extração. Triagem, síntese e auditoria mantêm resultados separados: uma amostra composta apenas por artigos selecionados para inclusão não estima a capacidade de excluir estudos. Se não houver casos negativos e conteúdo insuficiente na avaliação real, limitar a conclusão de triagem a essa cobertura. Para síntese, julgar cada afirmação e suas ressalvas; para auditoria, comparar a decisão com afirmações sustentadas, contraditas e insuficientemente documentadas preparadas por humanos. Não inventar contradições entre estudos incomparáveis.

Para cada configuração congelada, executar uma vez os três microcasos independentes, antes de liberar o lote:

| Caso | Critério de passagem |
|---|---|
| Valor conhecido | Objeto válido; valor, unidade, contexto e evidência corretos; proposta permanece sem aprovação automática. |
| Informação ausente | Valor `null`, estado compatível com a cobertura e nenhuma evidência inventada. Uma busca parcial não deve afirmar ausência no artigo inteiro. |
| Triagem com conteúdo insuficiente | Resposta válida `UNCERTAIN`, sem exclusão categórica sem suporte. Se o validador bloquear uma exclusão indevida, a barreira funcionou, mas a configuração falhou no teste prévio. |

Qualquer falha interrompe o lote daquela configuração. Guardar tentativa, causa e recursos consumidos; não trocar modelo, relaxar validador, aumentar orçamento ou reenviar automaticamente. Uma alteração explícita cria novo `config_id` e nova série de teste prévio, preservando a anterior. Falhas de configuração não desaparecem da tabela comparativa porque o lote não começou.

## Execução e rastreabilidade

Usar perfil Zotero e diretório Evidra dedicados a este piloto, com fontes autorizadas. O perfil sintético existente não é implicitamente convertido em corpus real. Registrar pacote/revisão, manifesto, parser, perfil, snapshot, formulário/protocolo, método `SEARCH` ou `FULL_SCAN`, cobertura, consultas de recuperação, modelo/digest, embeddings/digest, parâmetros, prompts, schemas, seeds e limites. `SEARCH` e `FULL_SCAN` são configurações distintas. Não mudar esses elementos no meio de um lote.

`configuration.json` começa em `DRAFT`, com campos indispensáveis nulos. Antes de marcar `FROZEN`, preencher todos os campos aplicáveis, justificando explicitamente os não aplicáveis; fixar máximos de chamadas, tokens, duração e custo, além da política de interrupção. Para jobs pagos, incluir autorização e teto conforme a política do projeto. Estimativas por bytes não substituem contagens de tokens. Conferir recursos e propriedade do hardware conforme a política local antes de inferência sustentada. Nenhum modelo é selecionado ou iniciado por estes templates.

Criar `attempt_id` antes de iniciar cada tentativa lógica. Registrar também falhas de preparação sem ID do produto, cancelamentos, cache, limites excedidos, respostas inválidas e resultados não revisados. Uma tentativa de unidade pode conter vários batches/chamadas: cada chamada real, reparo ou diagnóstico fica em `calls.csv`, inclusive as que ocorram fora do job principal. Tentativa repetida não substitui a primeira. Reconciliar todos os `call_id` com os recibos do provedor; uma contagem de propostas ou apenas o CSV da matriz perde falhas e competidores.

Usar os registros existentes do produto: `JobRecord` e `UnitRecord` para jobs de extração; `ResearchRun` para triagem/síntese/auditoria; propostas e evidências para resultados. Ligar unidade a proposta por `UnitRecord.proposal_id`. O `run_id` da proposta é um ID de resultado de extração, não o ID do job ou da unidade. Preservar IDs indisponíveis como vazios, com motivo, sem fabricar ligações.

Exportar JSON com histórico, verificando omissões de escopo, e guardar separadamente previews de batches, prompts/schemas e recibos de `/provider-calls`: esses registros não estão todos no exportador portátil. O código atual não garante persistência do texto bruto de respostas inválidas. Registrar `raw_output_status=UNAVAILABLE` quando for o caso; `INVALID_OUTPUT` sozinho não permite distinguir erro de schema, evidência inválida e regra de domínio. Usar `UNKNOWN` na dimensão sem diagnóstico suficiente, mantendo a tentativa no denominador.

As respostas originais permanecem imutáveis e sem aprovação automática. A avaliação humana externa não altera a matriz. Se uma correção for feita no produto, guardar a versão original, a corrigida e o ID da decisão. Avaliar o modelo pela original e o fluxo assistido pelo resultado final; não atribuir ao modelo a correção humana.

## Métricas e denominadores

Publicar contagens absolutas, proporções e resultados por artigo/tipo de dificuldade; evitar um escore único. O uso de métricas distintas e condições comparáveis segue a orientação geral de avaliação multidimensional do [HELM](https://arxiv.org/abs/2211.09110); as regras abaixo são propostas deste piloto, não limiares certificados por esse trabalho.

Definir por configuração e tarefa: `N` unidades planejadas; `A` tentativas lógicas iniciadas, incluindo falhas antes da chamada; `C` chamadas reais. Informar unidades não iniciadas e motivos. Não misturar os três microcasos prévios com os 20 artigos. Repetições entram em `A` e `C`, mas não aumentam `N`. Se o teste prévio impedir o início de todo o lote, registrar `BLOCKED / NOT_EVALUATED`, com `A=0`; não inventar uma acurácia de 0% para dados não avaliados.

| Dimensão | Medida e tratamento de falhas |
|---|---|
| Validade estrutural | Objetos comprovadamente válidos / `A`; sem saída, erro e validade desconhecida não entram no numerador. Reportar separadamente rejeições do validador de domínio. |
| Correção científica | Na primeira tentativa, unidades integralmente corretas / `N`; falhas, não iniciadas e não julgadas não contam como acerto. Reportar também corretas / `A` para todas as tentativas, sem selecionar a melhor repetição. |
| Sustentação | Unidades da primeira tentativa com todas as afirmações sustentadas / `N`; adicionalmente, precisão de tuplas/afirmações sustentadas e revocação das tuplas de referência. Saída vazia não recebe 100% de precisão: razão com denominador zero é `NA`. |
| Economia de trabalho | Tempo humano ativo e tempo de calendário até resultado conferido, por unidade e por artigo, comparando manual e assistido sob o mesmo critério de qualidade. Falhas incluem diagnóstico, correção e conclusão manual necessária. |

O acerto de uma tupla exige correspondência de valor, tolerância pré-fixada, unidade, ambiente/dataset, condição, estatística e sustentação. Casar listas de resultados um a um, sem reaproveitar uma referência para validar várias previsões. Omitidos são falsos negativos; acréscimos sem suporte são falsos positivos. Reportar à parte acertos em valores presentes, ausências confirmadas, abstinência indevida, respostas inventadas e confusão de contexto. Nunca usar similaridade lexical ou presença de um `evidence_id` como prova de sustentação.

Enquanto houver unidades sem julgamento, corretas/`N` é uma taxa de sucesso verificado que fornece um limite inferior de acertos; não atribuir erro científico às unidades ainda não julgadas. Mostrar simultaneamente cobertura de execução, cobertura de julgamento e contagens de falha/pendência. A análise secundária dos casos julgados deve declarar seu denominador e nunca substituir o resultado de todas as tentativas.

No julgamento, distinguir `SUPPORTED`, `PARTIAL`, `CONTRADICTED`, `INSUFFICIENT` e `UNJUDGED`, e marcar separadamente extrapolações de adequação da amostra, generalização e disponibilidade de texto completo. Em uma unidade com várias afirmações, qualquer afirmação material indevida impede acerto integral. A interpretação de ausência exige a referência humana e a cobertura reais. Referências não resolvidas e julgamentos pendentes devem ter contagem própria; não podem elevar a taxa de sucesso.

Para produtividade, quem revisa a saída assistida não deve já conhecer a referência ou ter extraído aquele artigo. Uma opção é contrabalançar artigos entre dois revisores: A extrai manualmente metade, B a outra; depois cada um revisa a saída assistida apenas da metade que não leu. Um custodiante confere e congela as referências antes das chamadas. Registrar ordem, experiência, exposição prévia e tempo de correções até o mesmo critério final de qualidade. A autoria da referência não deve contaminar a etapa assistida. Se só houver uma pessoa exposta aos mesmos artigos, guardar os tempos como descritivos e marcar economia causal de trabalho como `NOT_ASSESSED`.

Em `timing.csv`, `active_seconds` é o total de trabalho humano e já inclui diagnóstico, correção e conclusão manual. Esses três subcampos são desdobramentos; não somá-los novamente ao total. Espera pelo modelo e duração de calendário são medidas separadas.

Não tratar campos do mesmo artigo como observações independentes. Com 20 artigos, apresentar distribuições e resultados por artigo; qualquer intervalo exploratório deve reamostrar artigos inteiros, preservando todos os seus campos, tentativas e pares de tempo. Não declarar superioridade geral nem prontidão a partir desse piloto. Limiares de erro tolerável e ganho mínimo precisam ser decididos antes do lote; sem eles, o resultado é diagnóstico, não aprovação de produto.

## Instrumentos e início do lote

| Arquivo | Uso |
|---|---|
| [corpus.csv](corpus.csv) | Inventário conferido dos 20 PDFs, versões, hashes e páginas. |
| `templates/reference.csv` | Referência humana; copiar para local separado e restrito antes de preencher. Uma linha por tupla/afirmação esperada. |
| `templates/units.csv` | Todas as unidades previstas, perguntas e conjunto de fontes; sem respostas ou localizadores do gabarito. |
| `templates/configuration.json` | Configuração, orçamento, congelamento e responsáveis; nulos não são valores padrão válidos. |
| `templates/attempts.csv` | Tentativas de unidade, originais e repetições, inclusive falhas. |
| `templates/calls.csv` | Uma linha por chamada real, incluindo diagnósticos e reparos. |
| `templates/judgments.csv` | Julgamento humano de cada tupla/afirmação e omissão, ligado à tentativa e à referência. |
| `templates/timing.csv` | Tempo ativo/calendário, exposição anterior e correções nas duas modalidades. |

CSV em UTF-8, com campos que contêm vírgulas ou quebras de linha entre aspas. Célula vazia significa informação não coletada; valor científico ausente exige estado explícito. Datas em UTC ISO 8601; hashes SHA-256 completos. `paper_ids` e listas curtas de IDs usam `;`. Cada arquivo é cumulativo, com IDs estáveis; não apagar tentativas para melhorar métricas.

O lote permanece **não iniciado** até existirem: corpus conferido; referência humana congelada; responsáveis; formulário/protocolo e unidades; configuração completa e orçamento; perfil separado; três microcasos aprovados para essa configuração. Uma falha de qualidade do modelo permanece falha, mesmo quando o sistema a bloqueia corretamente. Estes materiais não fecham os critérios parciais do produto.
