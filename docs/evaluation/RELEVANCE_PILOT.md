# Piloto de triagem de relevância

**Estado: instrumentos prontos; falta a pergunta de pesquisa real e os rótulos humanos.** Nenhum resultado deste piloto foi medido. A execução de desenvolvimento com seis artigos (ver [TEST_REPORT](../TEST_REPORT.md#relevance-triage-development-run)) é um teste do pipeline, não uma avaliação.

## O que o piloto responde

O uso-alvo é decidir, para um projeto concreto, quais estudos da biblioteca servem e o que dá para aproveitar deles. O piloto mede:

1. Se a triagem com rubrica encaminha para revisão (INCLUDE ou UNCERTAIN) os estudos que uma pessoa considera relevantes. Esta é a métrica principal: perder um estudo relevante é o erro mais caro.
2. Quanto trabalho de leitura ela poupa sem perder relevantes (WSS@95).
3. Se o grau proposto e os vereditos por critério concordam com a pessoa.
4. Se os itens "o que aproveitar" e a ficha do artigo são sustentados pela evidência citada e úteis para o projeto.

Ele não mede qualidade geral do modelo, não substitui o piloto de extração numérica [RL-20](README.md) e não autoriza conclusões fora do tema e do modelo testados.

## Conjunto

- A pergunta, o objetivo, os critérios, a descrição do projeto e a rubrica são os do trabalho real da pessoa, congelados numa versão de protocolo antes de qualquer chamada.
- De 60 a 100 estudos vindos de uma busca real, importados no Zotero. Devem incluir quase-acertos (mesmo tema, outro recorte) e negativos claros, e não apenas artigos já sabidamente relevantes.
- Resumos e PDFs indexados no caderno. Estudos sem resumo ou sem texto ficam no denominador e aparecem como `NO_CONTENT`, nunca como acerto.
- Os 20 artigos do RL-20 não entram, para não contaminar aquele piloto.

## Rótulos humanos, antes do modelo

1. Exportar o caderno em JSON antes de qualquer triagem e gerar a planilha:
   `uv run --project services/engine python scripts/relevance_metrics.py template notebook.json > rotulos.csv`
   A planilha só tem chave, título e colunas em branco; nenhuma saída de modelo.
2. A pessoa preenche, para cada estudo: `grade` (na rubrica congelada), `decision` (opcional), um veredito `MET`/`NOT_MET`/`UNCLEAR` por coluna `criterion:<id>` e até três itens aproveitáveis em `reusable`. Guardar a planilha fora do caderno e registrar data, versão e hash antes de rodar.
3. Com uma só pessoa, a referência é de um anotador. Registrar isso como limite; não apresentar como consenso.

Modelo de colunas: [templates/relevance_labels.csv](templates/relevance_labels.csv).

## Execução congelada

- Registrar perfil, modelo e digest, parâmetros (contexto, saída, temperatura, seed, `think`), versão do protocolo e revisão do Evidra. Não mudar nada disso no meio do lote.
- Rodar um lote de título/resumo com `ALL` e um lote de texto completo também com `ALL`, para medir as duas etapas separadamente. O fluxo de uso normal (`NOT_HUMAN_EXCLUDED`) fica para depois.
- Falhas (`INVALID_OUTPUT`, `BILLING_UNKNOWN`, cobrança incerta, contexto) ficam no denominador. Um estudo sem proposta válida conta como "encaminhado para revisão manual". Nada é reenviado automaticamente; uma nova tentativa é uma nova configuração registrada.
- Limiares de aceitação decididos antes do lote. Sugestão: `recall_forwarded` ≥ 0,95 no título/resumo e nenhum relevante de grau máximo perdido. Sem limiares fixados antes, o resultado é diagnóstico, não aprovação.

## Medidas

`uv run --project services/engine python scripts/relevance_metrics.py score notebook.json rotulos.csv --stage TITLE_ABSTRACT --threshold 2 --out relatorio.json`

| Medida | Definição |
|---|---|
| `recall_forwarded` | Relevantes (grau humano ≥ limiar) encaminhados (INCLUDE, UNCERTAIN ou sem proposta válida) / relevantes |
| `missed_positives` | Lista dos relevantes que o modelo excluiu: os erros a inspecionar primeiro |
| `recall_include`, `precision_include` | Considerando só INCLUDE como positivo |
| `forwarded_fraction` | Fração que ainda exige leitura humana |
| `wss_at_95` | Trabalho poupado ao ler em ordem de grau até achar 95% dos relevantes; estudos sem grau são lidos primeiro |
| `grade_exact`, `grade_within_one`, `grade_quadratic_kappa` | Concordância do grau, só onde há grau do modelo |
| `criteria` | Concordância por critério rotulado |
| `status`, `failure_reasons` | Estudos com proposta, sem proposta válida ou não executados |

Os itens aproveitáveis e a ficha são julgados à mão. Para cada item: sustentado, parcialmente sustentado ou sem suporte, abrindo a evidência citada; e útil ou não para o projeto. Reportar contagens absolutas por estudo; não somar julgamentos de estudos diferentes como se fossem independentes.

## Relato

Publicar contagens absolutas, a lista de relevantes perdidos, as falhas por motivo e a configuração congelada. Com poucas dezenas de estudos e um anotador, não declarar superioridade de modelo nem prontidão geral. A escolha de modelo (P4 do roadmap) compara configurações no mesmo conjunto e com os mesmos rótulos.
