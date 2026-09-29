# Referência preparada por IA — versão RL20-AI-v1

O usuário atribuiu ao assistente a elaboração da referência. As anotações são feitas diretamente nos PDFs fixados em `corpus.csv`, sem consultar respostas do produto avaliado. Isso produz uma **referência de trabalho preparada por IA, sem revisão humana**, não um gabarito humano independente. Não mede tempo humano nem comprova qualidade do modelo. Os arquivos com respostas ficam em `.local/quality-pilot/reference/`, fora dos prompts e do índice do engine.

## Seleção anterior às anotações

São planejadas três unidades por artigo, totalizando 60. Aplicar a mesma regra em todos os 20 documentos, inclusive quando não for possível resolver uma unidade:

1. `RESULT`: primeiro resultado quantitativo de avaliação do método principal em tabela de resultados do corpo principal, em ordem de leitura (primeira linha de ambiente e coluna do método principal). Excluir tabelas de hiperparâmetros, custo e ablação. Se não houver tabela elegível, usar o primeiro resultado numérico de desempenho do método principal explicitamente escrito na seção de resultados ou legenda correspondente. Se o resultado existir apenas como curva sem valor explícito, registrar `UNRESOLVED_REFERENCE`; não estimar pixels. Quando o primeiro resultado for uma agregação entre ambientes, manter essa agregação.
2. `BUDGET`: orçamento de treinamento associado ao experimento selecionado em `RESULT`, incluindo unidade exata e distinção entre treino e avaliação. Quando `RESULT` só existir em curva, usar o primeiro experimento principal identificável. Não converter frames em passos nem tamanho de dataset em transições processadas. Registrar incerteza ou ausência quando não houver ligação inequívoca.
3. `CI95`: intervalo de confiança de 95% para esse resultado. Desvio padrão, erro padrão, min–max e quantis não são um IC de 95%. Não calcular um intervalo novo. Se a estatística não se aplicar, justificar `NOT_APPLICABLE`; se não puder identificar o resultado-alvo, usar `UNRESOLVED_REFERENCE`.

Cada unidade tem um ID estável `RLxx-RESULT`, `RLxx-BUDGET` ou `RLxx-CI95`. Perguntas de avaliação não contêm os valores nem páginas da referência. Selecionar um alvo conforme esta regra não representa cobertura de todos os experimentos do artigo. O piloto deverá ampliar a cobertura em outra versão se a finalidade exigir extração exaustiva.

## Evidência e ausência

Registrar valor original, valor numérico preservado (sem normalização inventada), unidade, método, ambiente/dataset, condição, estatística, seeds e orçamento quando informados. Usar página física desde 1, rótulo impresso e tabela/figura/seção. Conferir visualmente páginas com números/tabelas antes de aceitar a associação entre linha e coluna. Um valor já normalizado pelos autores mantém a escala publicada e a fórmula/descrição relevante.

O estado de conteúdo é separado da autoria: `FOUND`, `NOT_FOUND_AFTER_DOCUMENTED_SEARCH`, `NOT_APPLICABLE`, `CONFLICTING`, `UNREADABLE` ou `UNRESOLVED_REFERENCE`. Não usar `NOT_REPORTED_CONFIRMED` para uma busca feita só por IA. Para ausência candidata, registrar páginas pesquisadas, termos, leitura de métodos/resultados/apêndices pertinentes, limitações e qualquer estatística alternativa encontrada. Busca textual sem leitura contextual não comprova ausência; a avaliação humana permanece pendente.

Tolerância para números explicitamente publicados: igualdade após normalizar apenas separador decimal/milhar e notação científica; nenhuma aproximação de gráfico. Intervalos exigem ambos os extremos e nível de confiança. Correção requer também unidade e contexto. Campos não informados permanecem vazios e recebem explicação; não assumir seeds, budgets, versões de ambiente ou confiança.

Trechos literais totalizam no máximo 25 palavras por artigo; preferir descrição parafraseada de células e localizadores. Registrar metadados, acesso, direção do suporte, entailment, estado da citação e versão editorial separadamente. A versão arXiv e o conteúdo são conferidos; correções/retrações e versão final publicada não são auditadas neste preparo.

## Custódia e congelamento

Anotadores assistentes e o agente integrador acessam PDFs e referência. Nenhuma saída do produto é consultada. Não afirmar independência estatística entre agentes ou ausência de memorização dos artigos pelos modelos. O arquivo consolidado recebe hash e data como snapshot de preparação, com `human_review_status=PENDING` e `benchmark_eligibility=AI_REFERENCE_EXPLORATORY_ONLY`. Esse snapshot não libera sozinho o lote confirmatório exigido no protocolo principal.

Os 20 artigos permanecem fora do ajuste de prompts. Registrar toda revisão posterior com novo hash/versão; nunca substituir silenciosamente rótulos depois de observar respostas. O lote de modelos e a comparação de trabalho humano permanecem não executados neste estágio.
