# EVIDRA — Prompt mestre de implementação

**Produto:** Evidra — cadernos de pesquisa com evidências verificáveis no Zotero.  
**Repositório sugerido:** `evidra-zotero`.  
**Especificação:** v1.0 — 5 de setembro de 2026.  
**Natureza deste documento:** instrução de implementação, não código já implementado.  
**Nome:** nome de trabalho; não representa verificação de disponibilidade de marca ou domínio.

---

## 0. Missão e autorização de execução

Você é o agente responsável por implementar o Evidra. Entregue software funcional, instalável e testado, e não apenas um plano, um protótipo visual ou uma estrutura de arquivos.

O Evidra será uma experiência semelhante a um caderno de fontes do NotebookLM, integrada ao Zotero, com modelos substituíveis, seleção estrita dos documentos consultados e uma matriz de evidências auditável. Não é uma incorporação do serviço NotebookLM nem uma aplicação oficial do Zotero, Google, OpenAI ou Anthropic.

Esta especificação autoriza a criação e alteração dos arquivos do projeto e a execução de testes e builds locais. O desenho está aprovado como ponto de partida. Não peça confirmação para escolhas já definidas; comece implementando. Decisões menores devem seguir a alternativa mais simples compatível com os requisitos e ser registradas em um ADR curto.

Não estão autorizados: compras, uso de APIs pagas sem consentimento, leitura de segredos não fornecidos, publicação de releases, push remoto, alteração da biblioteca pessoal real ou operações destrutivas fora do projeto. Use um perfil separado do Zotero para desenvolvimento e testes. Não copie a biblioteca real para fixtures.

Se existir um repositório no diretório de trabalho, inspecione-o e preserve mudanças do usuário. Se não existir, crie o projeto. Não force reset, não sobrescreva trabalho alheio e não introduza infraestrutura externa sem necessidade.

Implemente em fatias verticais testáveis. Um marco intermediário funcionando não significa que toda a v1 está concluída. Não pare no planejamento. Se houver um impedimento de ambiente, conclua o restante que for executável, registre o bloqueio e diferencie claramente implementação, simulação e validação real. Não anuncie trabalho em segundo plano que não esteja efetivamente sendo executado.

## 1. Definição do produto

O usuário deve conseguir:

1. Criar um caderno de pesquisa a partir de bibliotecas, coleções, subcoleções, buscas salvas ou artigos selecionados no Zotero.
2. Verificar quais documentos estão disponíveis e qual conteúdo foi realmente processado.
3. Fazer perguntas fundamentadas somente nas fontes autorizadas para aquela execução.
4. Escolher um modelo local ou configurar APIs de modelos em nuvem.
5. Usar um cliente externo oficial compatível com MCP para consultar o caderno, inclusive quando esse cliente oferece acesso por assinatura.
6. Extrair dados para uma matriz, conferir cada valor no documento e preservar decisões humanas.
7. Registrar triagem e critérios de revisão, comparar estudos, elaborar sínteses e auditar afirmações.
8. Exportar dados, referências, histórico e resultados sem ficar dependente de um fornecedor de LLM.

**Regra do produto:** os documentos e as evidências são os ativos persistentes; modelos são componentes substituíveis. O chat é uma interface de trabalho, não o banco de dados da pesquisa.

**Regra de honestidade:** existência de uma citação não prova sustentação; JSON válido não prova extração correta; texto indexado não significa documento integralmente compreendido; uma busca sem resultados não prova ausência de um fenômeno na literatura.

## 2. Escopo fechado da v1

### Obrigatório nesta entrega

- Plugin nativo instalável, com painel de leitura e espaço amplo de trabalho dentro do Zotero.
- Cadernos persistentes, seleção combinada de fontes, filtros, inclusões/exclusões e snapshots versionados.
- PDFs com camada de texto, metadados, anotações e notas autorizadas; tratamento explícito de falhas e documentos apenas com resumo.
- Busca lexical e busca semântica opcional, ambas com autorização antes da seleção de resultados.
- Conversas com evidências, referências clicáveis, cobertura e avisos de limitação.
- Extração estruturada em lote, matriz editável, comparação de propostas e aprovação humana.
- Protocolo de revisão, triagem assistida por critério e registro de decisão humana.
- Síntese baseada em dados aprovados e auditoria de afirmações do usuário.
- Integrações reais com Ollama, LM Studio, OpenAI API, Anthropic API e Gemini API, além de endpoint OpenAI-compatible configurável.
- Ponte MCP local, com ferramentas limitadas ao caderno autorizado e propostas de escrita sem aplicação automática.
- Fila persistente, cancelamento, retomada, cache, controle de chamadas e limites de custo.
- Exportação CSV, JSON, Markdown, referências via mecanismos do Zotero e pacote de backup do caderno.
- Testes, fixtures sintéticas, documentação, diagnóstico e pacotes de distribuição.

### Explicitamente fora da v1

Não implementar busca externa de artigos, conectores para bases científicas, scraping de editoras, download de PDFs fora do Zotero, gerenciador bibliográfico concorrente, sincronização própria em nuvem, colaboração em tempo real, aplicativo web separado, contas de usuário próprias, SaaS, cobrança, telemetria ou marketplace.

Não implementar OCR automático em lote, transcrição de áudio/vídeo, podcasts, geração de slides, grafos decorativos, treinamento ou fine-tuning, enxames de agentes, geração autônoma de uma revisão sistemática completa, classificação de qualidade por prestígio de periódico ou metanálise estatística automática.

Não implementar login de assinaturas por captura de cookies/tokens, automação de navegador, proxies de sessões ou contorno de quotas. Não embutir os clientes Codex/Claude/Gemini dentro do chat nesta v1. O acesso por assinatura será **via cliente externo oficial + MCP**, claramente identificado; o chat interno usará modelos locais ou APIs próprias.

Não deixar botões fictícios, telas vazias de funcionalidades futuras ou adaptadores que apenas retornam respostas simuladas em produção. Recursos fora do escopo não precisam de telas nem de stubs.

## 3. Plataforma e decisões técnicas fechadas

### Alvo

- Plataforma primária: Windows x64, usando Zotero Desktop nativo. Não exigir WSL, Docker ou privilégios de administrador.
- Alvo de compatibilidade inicial: Zotero 10.0.x, a partir de 10.0.1. Validar a versão estável e a documentação oficial novamente ao começar. O histórico consultado em 05/09/2026 registra 10.0.1.
- Manifesto: declarar somente o intervalo efetivamente validado. Para esse alvo, seguir a orientação oficial de `strict_max_version: "10.0.*"`; não anunciar compatibilidade com toda versão futura.
- Não gastar a primeira entrega com compatibilidade retroativa 7/8/9. Em versão incompatível, apresentar diagnóstico e não executar mutações.
- Linux e macOS: manter caminhos e abstrações portáveis, mas não declarar suporte testado sem execução nesses sistemas.
- Interface PT-BR por padrão, com catálogo en-US completo. Português não deve alterar o texto original das citações.

### Stack

- Extensão: TypeScript estrito; React e CSS local, empacotados para o ambiente Mozilla do Zotero; nenhuma dependência de Node.js em runtime dentro da extensão.
- Integração: APIs do Zotero encapsuladas em `ZoteroBridge`. Verificar menus, leitor, abas, seleção e ciclo de vida contra documentação/código da versão alvo. Não inventar APIs.
- Engine auxiliar: Python 3.12, FastAPI, Uvicorn, Pydantic v2 e httpx.
- Persistência: SQLite do próprio Evidra, migrations SQL, FTS5, WAL e chaves estrangeiras. Sem Postgres, Redis, Celery, Elasticsearch ou banco vetorial servidor.
- PDF: pypdfium2 para extração por página e renderização. Operações do parser isoladas em processos; não compartilhar estado PDFium concorrentemente entre threads.
- Vetores: NumPy, busca exata em blocos sobre os vetores permitidos. Sem PyTorch/Transformers embutidos no engine; embeddings vêm de um serviço local configurado.
- Modelos: adaptadores de protocolos por httpx, sem LangChain/LlamaIndex como dependências obrigatórias. Reutilizar cliente HTTP, controlar timeouts e validar respostas.
- MCP: SDK oficial Python compatível com a versão fixada; transporte stdio na v1.
- Renderização de texto: markdown-it com HTML desabilitado, seguido de DOMPurify configurado com allowlist; sem avaliação de HTML de modelo/documento e sem scripts de CDN. Validar o bundle no contexto real do Zotero.
- Segredos: cofre do sistema via keyring quando disponível; fallback somente em memória, nunca arquivo em texto puro.
- Tooling: npm com lockfile; uv com lockfile; Vitest; pytest; Ruff; verificação estática de tipos Python. Fixar dependências verificadas, sem inventar números de versões.
- Distribuição: XPI + engine Windows em pacote PyInstaller `onedir`, com manifesto e hashes SHA-256. Usuário final não deve instalar Python ou Node; Ollama/LM Studio e seus modelos são componentes externos opcionais.

ZotSeek e Open Notebook podem ser consultados como referências. Não tornar nenhum deles dependência obrigatória e não copiar uma aplicação inteira. A autorização de fontes deve pertencer ao Evidra. Reaproveitamento de código exige revisão da licença e preservação dos avisos. Preferir dependências permissivas; não declarar que código copiado possui a mesma licença do nosso código original.

## 4. Arquitetura e direção dos dados

Arquitetura proposta:

```text
Zotero Desktop
  ├─ APIs Zotero: biblioteca, coleções, anexos, leitor e notas
  └─ Evidra XPI
       ├─ ZoteroBridge e SourceResolver
       ├─ painel no leitor + espaço de trabalho React
       ├─ aprovação humana / cofres / ciclo de vida
       └─ cliente do engine com autenticação local
                         │
                   HTTP em loopback
                         │
                 Evidra Engine
       ├─ ScopeService — autorização obrigatória
       ├─ NotebookService / ProtocolService
       ├─ Parser / Chunker / EvidenceStore
       ├─ SearchService — FTS5 + vetores autorizados
       ├─ Chat / Extraction / Screening / Audit
       ├─ JobQueue / Cache / Budget / ProviderAdapters
       ├─ SQLite próprio + artefatos locais derivados
       └─ gateway local para bridge MCP stdio
                         │
               cliente MCP externo autorizado
```

O engine **não** abre o `zotero.sqlite` nem usa o banco do Zotero como uma API. O plugin resolve os objetos pela API nativa e envia os metadados e referências de arquivos estritamente necessários. Escritas no Zotero acontecem somente no plugin, depois de aprovação humana e verificação das permissões da biblioteca.

A UI não chama provedores diretamente. O engine não altera itens bibliográficos diretamente. O cliente MCP não recebe o segredo administrativo do engine. A camada de autorização deve ser compartilhada por todas as rotas de leitura e ferramentas, não duplicada de forma divergente.

Código não relacionado a Zotero deve ser testável sem iniciar Zotero. Recursos privilegiados do plugin ficam isolados da renderização de conteúdo de documentos/modelos.

### Layout do repositório

```text
evidra-zotero/
  apps/zotero/
    src/bootstrap/
    src/bridge/
    src/sources/
    src/ui/
    src/security/
    locale/pt-BR/
    locale/en-US/
    manifest.json
  services/engine/
    src/evidra/
      api/
      domain/
      scope/
      notebooks/
      documents/
      evidence/
      retrieval/
      providers/
      extraction/
      screening/
      synthesis/
      audit/
      jobs/
      storage/
      exports/
      mcp/
      security/
    migrations/
    tests/
    pyproject.toml
  packages/contracts/
    generated/
    fixtures/
  tests/
    fixtures/
    integration/
    security/
    acceptance/
    benchmarks/
  scripts/
    dev.ps1
    check.ps1
    package.ps1
    check.sh
  docs/
    SPEC.md
    IMPLEMENTATION_PLAN.md
    ARCHITECTURE.md
    INSTALL_WINDOWS.md
    MODELS_AND_BILLING.md
    MCP_SETUP.md
    PRIVACY_AND_LIMITS.md
    TEST_REPORT.md
    ACCEPTANCE_MATRIX.md
    STATE.md
    adr/
  dist/
  README.md
  THIRD_PARTY_NOTICES.md
```

Adaptar nomes de arquivos à implementação, preservando as responsabilidades. Não criar uma abstração de um arquivo por operação trivial nem um módulo monolítico com toda a aplicação.

## 5. Experiência de uso e telas

### Primeiro uso

O assistente inicial deve detectar a versão do Zotero, localizar o engine configurado, testar compatibilidade de protocolo, permitir escolher LOCAL ou API e oferecer criar um caderno. Sem modelo, o usuário ainda consegue organizar fontes, ler evidências e trabalhar manualmente na matriz.

Não baixar engine ou modelos silenciosamente. Fornecer escolha de caminho para o engine do pacote distribuído. A execução do binário externo exige consentimento inicial e verificação do manifesto; alterações posteriores do binário devem ser sinalizadas.

### Interface principal

Disponibilizar um painel acoplado ao leitor e um espaço amplo dentro de uma aba/painel suportado do Zotero. Não lançar um site externo como interface principal. Se a API de aba precisar de adaptação, isolar no bridge e registrar a decisão; não substituir a integração nativa por um simples link.

Topo persistente: nome do caderno, revisão de fontes, número de documentos por estado, modo de acesso, modelo efetivo, chamadas/custo conhecido e estado do trabalho.

Áreas:

- **Fontes:** seleção, prévia do escopo, estados, filtros e histórico de mudanças.
- **Conversa:** chat, evidências, escopo da pergunta, indicação de rascunho durante streaming.
- **Matriz:** dados por estudo/campo, propostas, revisão e comparação.
- **Protocolo e triagem:** critérios, decisões, conflitos e motivos.
- **Sínteses e auditoria:** documentos derivados, versões e evidências por afirmação.
- **Execuções:** progresso, cobertura, falhas, cancelamento e retomada.
- **Configurações:** modelos, execução, privacidade, cache, exportação e MCP.

Virtualizar listas/tabelas extensas. Implementar teclado, foco visível, leitores de tela e tema claro/escuro. Estados de qualidade não podem depender apenas de cor. Sanear Markdown/HTML e bloquear execução de scripts, imagens remotas e links de execução arbitrária.

Menus mínimos: criar caderno da seleção; adicionar seleção a caderno; perguntar sobre artigo/trecho; extrair dados; abrir matriz. Antes de operar em seleções múltiplas, usar as APIs plurais do Zotero 10 e ignorar cabeçalhos/espaçadores da lista.

## 6. Seleção e identidade das fontes

### Seletores

Permitir combinação de bibliotecas pessoais e grupos acessíveis, coleções, subcoleções explicitamente selecionadas, buscas salvas e itens individuais. Mostrar `incluir descendentes` desmarcado por padrão, com prévia clara. Não presumir que uma busca salva retorna apenas itens bibliográficos: normalizar anexos/notas para seus pais quando necessário e manter a autorização do conteúdo selecionado.

Filtros da v1: ano mínimo/máximo, tipos de item, etiquetas com AND/OR, presença de PDF e exclusões de itens. Sem janela temporal implícita. Regras aplicam-se também a inclusões individuais; a interface deve mostrar quando um item explicitamente selecionado foi eliminado por um filtro.

Resolver o conjunto como: união dos seletores, aplicação dos filtros, remoção das exclusões, remoção de itens indisponíveis/não autorizados e deduplicação por identidade bibliográfica. Exclusão vence inclusão. Não escrever o estado de triagem em etiquetas existentes automaticamente.

### Identidades

- Chave local: `profile_instance_id + library_id + item_key`.
- Anexo: mesma identidade de biblioteca/perfil + `attachment_key`.
- Registrar separadamente identificadores remotos de biblioteca/grupo quando disponíveis. Não confundir `library_id` local com ID de grupo remoto.
- Nunca usar apenas título, DOI, caminho de arquivo ou `item_key` isolado como chave universal.
- Um item em três coleções da mesma biblioteca aparece uma vez no snapshot.
- Dois itens de bibliotecas diferentes com o mesmo DOI continuam identificáveis separadamente; oferecer aviso de possível duplicação, sem merge automático.
- Distinguir artigo, versão publicada, preprint e suplemento. Vários PDFs de um mesmo item não viram automaticamente estudos independentes.

Registrar os anexos e permitir selecionar qual é principal e quais são suplementos. Usar todos os anexos textuais autorizados quando o formulário requer texto completo; relatórios devem discriminar o que foi lido. Não escolher silenciosamente o primeiro PDF quando existem vários.

### Tipos de conteúdo

PDF original, resumo bibliográfico, anotação humana, nota humana, artefato gerado por IA e dado estruturado aprovado são tipos distintos.

PDFs/resumos entram conforme seleção. Notas/anotações são opt-in por caderno. Conteúdo gerado por IA é excluído como fonte primária por padrão, mesmo que esteja salvo como nota do Zotero. Evidências de uma nota humana continuam rotuladas como nota, não publicação científica.

Documentos externos ainda fora do Zotero não são indexados pela v1. Orientar o usuário a adicioná-los/vinculá-los pelo Zotero. Nunca varrer disco ou diretório de perfil para encontrar outros artigos.

## 7. Snapshots, atualização e isolamento obrigatório

Todo caderno possui especificação de seleção versionada. Cada execução usa um snapshot imutável com membros e versões explícitos.

**Dinâmico:** eventos do Zotero sinalizam mudanças; calcular delta e permitir incorporar. Nenhuma mudança entra em uma execução já iniciada. Oferecer atualização automática apenas por opção explícita, gerando nova revisão.

**Congelado:** preservar a composição e as referências às versões usadas. Congelamento não é uma cópia integral dos PDFs. Manter extrações e hashes permite auditar entradas, mas um PDF antigo não poderá ser reaberto se não existir mais; mostrar essa limitação, não afirmar reprodutibilidade integral.

### Invariantes de autorização

1. Toda operação recebe `ScopeContext` criado pelo servidor a partir de uma sessão autorizada; o modelo não fornece sua própria allowlist.
2. Resolver documentos/chunks permitidos **antes** de aplicar limites de busca e antes de acessar conteúdo para o LLM.
3. `read_evidence` valida pertencimento ao snapshot e permissão atual; conhecer um UUID não autoriza leitura.
4. Contexto do chat, cache, resultados de jobs, resumos de conversa, exports e MCP obedecem ao mesmo filtro.
5. Tokens MCP têm caderno/snapshot e permissões delimitados; não permitem enumerar outras bibliotecas.
6. Mudança de escopo impede que resposta atrasada seja anexada silenciosamente à nova revisão; usar verificação de versão no commit.
7. Retirada de permissão de biblioteca/documento revoga acesso ao conteúdo cacheado por essas rotas. Marcar resultados históricos como indisponíveis quando necessário.
8. Lixeira/deleção invalida disponibilização do conteúdo em execuções novas. Não ressuscitar documentos por cache.
9. Uma conversa fica vinculada a um snapshot. Alterar fontes cria nova conversa/revisão e não reaproveita automaticamente histórico que contém evidência removida.
10. Incluir notas novas com conteúdo de fontes removidas exige aviso de proveniência. Remoção local não recolhe dados já enviados a um provedor ou exportados pelo usuário.

Isolamento se aplica aos dados servidos pelo Evidra. Não afirmar que ele elimina conhecimento prévio do LLM nem que controla ferramentas de disco/shell que um cliente externo possua por fora do MCP.

## 8. Ingestão, parsing e localização de evidências

Processar só anexos autorizados. O bridge resolve caminhos válidos e registra uma referência opaca; rotas públicas/MCP nunca aceitam caminhos arbitrários. Verificar arquivo regular, tamanho, tipo, symlinks/reparse points e mudanças entre registro e abertura. Não confiar somente no prefixo textual do caminho.

Fluxo: obter metadados → verificar disponibilidade local → calcular SHA-256 em streaming → extrair páginas → armazenar texto original e mapas de normalização → produzir chunks → indexar → registrar cobertura.

Parsing em subprocesso, com limite de memória, timeout e cancelamento. Por padrão: até 200 MB e 1.000 páginas por PDF, limites ajustáveis por usuário; ultrapassagem pausa o documento e pede configuração, nunca trunca silenciosamente.

Para cada página guardar índice físico zero-based, rótulo exibido quando disponível, texto original, versão do parser, qualidade da extração e mapa de posições. Para cada evidência guardar offsets verificáveis e retângulos quando mapeáveis. Transformações devem considerar crop, rotação e sistema de coordenadas. Testar esses casos.

Uma citação abre o anexo e a página correta. Destacar a passagem somente quando o mapeamento for verificado; caso contrário abrir a página, mostrar o excerto no painel e indicar `precisão: página`. Nunca inventar uma localização exata para aparentar precisão.

Detectar ausência/corrupção da camada de texto e marcar `NEEDS_OCR` ou `UNREADABLE`. Não fazer OCR em lote nesta versão. Oferecer diagnóstico e reindexação após o usuário fornecer uma versão pesquisável. Essa limitação não deve bloquear outros artigos.

Para tabelas, gráficos e fórmulas: permitir renderizar uma página/região selecionada pelo usuário e enviá-la a modelo com visão habilitada. Mostrar prévia, hash e destino. Resultados visuais ficam como extrações propostas, com página/região e validação humana; não chamá-los de citação textual literal sem texto verificável.

Separar qualidade da extração de cobertura: `METADATA_ONLY`, `PARTIAL_TEXT`, `FULL_TEXT_PARSED`, `NEEDS_OCR`, `UNREADABLE`, `MISSING_FILE`, `STALE`. Cada artigo pode ter anexos com estados diferentes. Um parser que falhou em páginas não produz estado integral.

## 9. Chunking e recuperação eficiente

### Busca lexical sempre disponível

Implementar FTS5 no SQLite próprio. Usar normalização para busca sem alterar o texto original das evidências. Escapar a sintaxe de consulta; a entrada do usuário não deve ser interpolada em SQL.

Busca lexical deve funcionar sem LLM, sem embeddings e sem internet. O SQL deve restringir aos chunks permitidos antes de `ORDER BY/LIMIT`. Usar joins/tabelas temporárias indexadas para scopes grandes, não milhares de parâmetros sem limite.

### Semântica opcional e local por padrão

Implementar `EmbeddingProvider` separado de `GenerationProvider`. Ollama e LM Studio podem fornecer embeddings locais. Não enviar a biblioteca inteira para um serviço remoto de embeddings; embeddings remotos estão fora da v1.

Descobrir modelos instalados e deixar o usuário selecionar. Não baixar modelos automaticamente. Guardar dimensão, identificador, revisão/digest quando disponível e estratégia de normalização. Usar a mesma configuração para indexação e consulta; dimensões incompatíveis bloqueiam a busca semântica.

Guardar vetores como blocos compactos, com mapeamento estável de chunk/version; não como listas JSON gigantes. Calcular similaridade exata apenas para IDs autorizados, em blocos NumPy. Limitar cache de vetores e evitar carregar todas as bibliotecas em RAM. Rebuild deve ser atômico e manter geração anterior consistente até o commit.

### Política inicial

- Chunks por página, respeitando parágrafos sempre que possível; alvo inicial de 2.400 caracteres, overlap de até 320 caracteres. Guardar limites e versão da política. Tokens são orçamento separado, não equiparar caracteres a tokens.
- Cabeçalhos repetidos/referências podem receber rótulos e pesos; não descartá-los irreversivelmente. Citar uma referência mencionada no artigo não equivale a ter lido o trabalho citado.
- Top 40 lexical e top 40 vetorial dentro do escopo; combinar por Reciprocal Rank Fusion com `k=60`; ordenar desempates por identificador estável.
- Selecionar até 12 chunks para conversa, respeitando orçamento real/estimado do modelo, diversidade de documentos e deduplicação de overlaps. Esses números são defaults de engenharia, não resultados científicos.
- Expansão para trechos vizinhos precisa manter o mesmo documento e escopo.
- Sem reranker/reescrita multiagente obrigatórios. Avaliar antes de acrescentar chamadas.

A resposta informa quantos documentos foram recuperados e usados. Nunca sugerir que top-k examinou toda a coleção.

## 10. Dois modos de análise, sem mistura de cobertura

### Pergunta pontual

Recuperar trechos relevantes; elaborar resposta; vincular afirmações a evidências; mostrar cobertura e limitações. Quando o modelo extrapolar para conhecimento geral, rotular explicitamente e não inserir essas afirmações na matriz como dados extraídos.

### Extração sistemática

Enumerar todos os estudos autorizados e processar cada um. Para cada campo, fazer busca dirigida no estudo; quando necessário e autorizado pelo orçamento, realizar varredura de todas as páginas/chunks. Guardar páginas processadas, falhas, anexos não lidos e método.

A enumeração de estudos não equivale a cobertura integral do conteúdo. Se uma varredura ficou incompleta, produzir estado parcial. Ausência em trechos recuperados é `NOT_FOUND_IN_SEARCH`; ausência após varredura é no máximo `NOT_REPORTED_CANDIDATE`, ainda sujeita a revisão humana. Não usar silêncio do modelo como prova.

Quando uma tarefa exigir comparar todos os estudos, não gerar a síntese final como se completa enquanto existirem trabalhos não processados. Oferecer síntese parcial explicitamente rotulada.

## 11. Conversas e contrato de evidência

Persistir mensagens, contexto autorizado, conjunto de evidências, configuração efetiva do modelo, versão do prompt, snapshot e run ID. Não armazenar raciocínio interno oculto nem pedir chain-of-thought ao provedor. Guardar justificativas curtas e verificáveis.

Tratar conteúdo em streaming como rascunho. Após terminar, validar a estrutura e as referências antes de convertê-lo em resultado utilizável. Citações fictícias ou fora do escopo bloqueiam a promoção do trecho. Permitir no máximo uma tentativa de reparo estrutural, contabilizada como nova chamada; após isso registrar erro.

Um `EvidenceRef` contém: ID opaco gerado pelo servidor, versão documental, página/região, excerto verificado, fonte/tipo e proveniência. O modelo pode escolher IDs existentes, mas não criar coordenadas, URLs Zotero ou versões por conta própria.

Verificar que o excerto corresponde ao texto original ou à normalização com mapa reversível. Separar:

- âncora válida: documento/página/trecho existem;
- suporte proposto: julgamento de que a evidência apoia a afirmação;
- aprovação humana: pesquisador confirmou o valor/afirmação.

Nenhuma âncora válida recebe automaticamente o selo de fato correto. Uma auditoria por segundo modelo também é proposta, não validação humana.

Troca de modelo mantém mensagens e evidências do Evidra, mas cria nova execução; ao mudar de provedor, mostrar o contexto que será enviado e exigir o consentimento de nuvem correspondente. Não transferir arquivos ou histórico ocultamente.

## 12. Matriz de extração e formulários

Criar formulários versionados com campos de texto, número, booleano, enum, lista e objeto de resultado experimental. Cada campo inclui pergunta de extração, definição, unidade quando pertinente, regras e obrigatoriedade. Validar esquema no servidor.

Template inicial de Computação: problema, método, contribuição alegada, dados, tamanho da amostra/instâncias, divisão de treino/validação/teste quando pertinente, comparadores, métricas, resultados com contexto, repetições/seeds, ablações, estatística reportada, limitações dos autores, limitações propostas pelo revisor e disponibilidade de código/dados. Nenhum template pode forçar campos não aplicáveis a todos os estudos.

A célula deve permitir vários resultados por estudo, preservando dataset, condição experimental, unidade, baseline e direção da métrica. Não reduzir três experimentos a um único número sem explicação.

Estados do valor: `FOUND`, `NOT_FOUND_IN_SEARCH`, `NOT_REPORTED_CANDIDATE`, `NOT_APPLICABLE`, `UNREADABLE`, `CONFLICTING`.

Estados de revisão independentes: `UNREVIEWED`, `APPROVED`, `CORRECTED`, `REJECTED`.

Valores ausentes são `null` acompanhados do estado; nunca zero ou string vazia usada ambiguamente. Números mantêm representação original e valor normalizado. Traduções ficam separadas do excerto original.

Cada proposta registra evidências, origem do modelo/cliente, run, formulário, coverage e justificativa curta. IA não sobrescreve célula aprovada; uma nova extração cria proposta concorrente. Aprovação/correção exige ação humana e gera evento. Ter controle de concorrência por revisão para não perder uma correção durante job em andamento.

UI: lista virtualizada, filtros por pendência/fonte/estado, seleção de células e painel de evidências lado a lado. Aprovação em lote mostra quantidades, mudanças e evidências; nunca aprovar tudo automaticamente apenas porque passou no JSON Schema.

Cálculos derivados só por funções determinísticas auditadas, com fórmula, entradas, unidades e rótulo `DERIVED`. Não pedir ao modelo para inventar ou completar números ausentes.

## 13. Protocolo e triagem

Protocolo: pergunta, objetivo, tipo de revisão exploratória/sistemática, critérios de inclusão/exclusão e formulário ativo. Cada critério tem ID, texto claro, aplicabilidade e versão. Alteração não apaga o protocolo anterior.

Triagem separada em título/resumo e texto completo. Saídas do assistente: `INCLUDE`, `EXCLUDE`, `UNCERTAIN`, com critério e evidências disponíveis. Falta de resumo/texto não autoriza exclusão por inferência.

Salvar pareceres da IA separados de decisões humanas. Permitir rótulos de revisores locais e conflito entre decisões, mas sem autenticação multiusuário ou colaboração síncrona na v1. Não apresentar duas respostas de LLM como dois revisores independentes.

Contadores derivam do registro de eventos e membros do snapshot. Importações de buscas históricas podem receber origem, data, consulta e contagem fornecidas pelo usuário; informação não registrada aparece como desconhecida. Não reconstruir por palpite etapas anteriores à biblioteca. Exportar contagens observadas, não um fluxograma PRISMA fictício.

## 14. Síntese, comparação e auditoria

Síntese usa preferencialmente células aprovadas e evidências originais. O usuário pode incluir propostas não aprovadas, mas a saída deve distingui-las. Organizar por pergunta, método, resultado ou limitação, evitando apenas concatenar resumos.

Comparações devem preservar contexto: datasets, métricas e condições diferentes não são automaticamente comparáveis. Não gerar ranking agregado sem uma regra explicitamente definida.

Auditoria recebe texto colado pelo usuário e decompõe afirmações. Retornar `SUPPORTED_PROPOSAL`, `PARTIALLY_SUPPORTED_PROPOSAL`, `CONTRADICTED_PROPOSAL` ou `INSUFFICIENT_EVIDENCE`, com fontes e explicação curta. UI em português deve deixar visível o caráter de proposta. A avaliação humana pode validar ou corrigir.

Detectar referências inexistentes no caderno e citações que apenas mencionam um trabalho não disponível. Sugestões de lacuna devem delimitar a coleção e a cobertura, sem afirmar novidade universal.

Salvar síntese como artefato versionado do Evidra. Publicar como nota nova do Zotero só após prévia/aprovação. Não editar manuscritos externos, documentos do Word ou notas originais do usuário automaticamente.

## 15. Modelos, capacidades e acesso por assinatura

### Perfis de execução

**LOCAL:** somente endpoints loopback explicitamente configurados. Nenhuma chamada direta do Evidra a APIs de nuvem. Busca lexical continua funcionando se o runner local estiver parado. Modelos locais precisam já estar instalados ou ser instalados pelo usuário.

**API:** chamadas a provedores autorizados com chave própria. Exigir consentimento por provedor e caderno antes do primeiro envio de conteúdo. Mostrar o que será enviado: trechos, metadados, imagens ou histórico. A opção global `bloquear APIs pagas` vem ativada; ativar um perfil API exige desativá-la explicitamente. Mesmo um free tier é tratado como rota API potencialmente faturável.

**CLIENTE EXTERNO:** um cliente MCP autorizado lê o caderno e apresenta a conversa em sua própria interface; pode devolver propostas à matriz. Sua assinatura/franquia pertence àquele produto. O Evidra não possui, copia nem gerencia o login do cliente. Não vender esse modo como assinatura universal dentro do painel interno.

Uma conexão loopback não prova que um runner terceiro não encaminha dados para nuvem. Recusar modelos explicitamente remotos/cloud no perfil LOCAL e informar essa fronteira de confiança. O teste offline deve ocorrer também com rede externa indisponível, não apenas com hostname `localhost`. Não prometer controlar o tráfego de processos externos.

### Adaptadores obrigatórios

| Adaptador | Implementação da v1 |
|---|---|
| Ollama | Protocolo nativo para geração/streaming, catálogo, embeddings e schemas quando suportados. |
| LM Studio | Interface OpenAI-compatible, geração e embeddings locais, catálogo/capacidades disponíveis. |
| OpenAI API | API oficial de geração adequada à documentação atual, streaming e saídas estruturadas quando suportados; não presumir Chat Completions para todos os modelos. |
| Anthropic API | Messages API oficial, limites e eventos próprios; não fingir compatibilidade OpenAI. |
| Gemini API | API oficial de geração e streaming, formatos/imagens conforme modelo; não confundir com autenticação Gemini CLI. |
| OpenAI-compatible | Base URL autorizada, model ID manual, capabilities explícitas, sem suposições sobre cobertura completa do protocolo. |

Não hardcodar “o melhor modelo” ou nomes temporários como default obrigatório. Implementar catálogo quando disponível e model ID manual quando necessário. Persistir provedor/modelo/digest quando fornecido. Falha no catálogo não deve impedir configuração manual válida.

Capacidades: geração, streaming, imagem, schema estruturado, embeddings, contagem de tokens, cancelamento e listagem de modelos. Cada capacidade possui origem `PROVIDER_REPORTED`, `PROBED`, `USER_DECLARED` ou `UNSUPPORTED`. Probes usam conteúdo sintético, são opcionais e podem consumir quota; não enviar documentos para testar uma conexão.

Quando o modelo não suporta JSON Schema nativo, aplicar instrução de formato, parse e validação local, com um reparo no máximo. Isso não transforma o modelo em compatível com funções que ele não possui. Sem visão, desabilitar análise de região e explicar a razão.

Troca de gerador não reconstrói embeddings. Troca do modelo de embeddings cria nova geração do índice. Não misturar vetores de modelos/dimensões diferentes.

### Regras de custo

- Sem fallback automático entre local, assinatura e API.
- Pausar em quota esgotada; nunca comprar créditos nem trocar credenciais silenciosamente.
- Mostrar tokens e custos quando reportados/conhecidos; ausência de informação é `desconhecido`, não zero.
- Tabela de preços é configuração versionada, com moeda/data/origem. Não inventar preços na implementação.
- Para limite monetário, reservar orçamento antes do envio considerando input e output máximo, respeitando limites do provedor. Sem preço confiável, bloquear execução com teto monetário ou pedir aprovação explícita da incerteza.
- Limite por chamada, job e sessão; reconciliar consumo confirmado. Timeout depois de envio pode significar cobrança: marcar `BILLING_UNKNOWN` e não reenviar cegamente.
- Desabilitar retries internos ocultos de SDKs/clientes. Uma tentativa extra deve aparecer no registro e respeitar o orçamento.

### Assinaturas e documentação

Criar instruções MCP para clientes oficiais compatíveis, verificando as versões e configurações atuais de Codex, Claude Code e Gemini CLI. Configuração gerada não deve substituir arquivo existente: oferecer diff/mesclagem ou cópia manual.

Não coletar tokens Claude.ai, Google ou ChatGPT; não ler cookies do navegador ou copiar arquivos de autenticação dos CLIs. Não prometer que operações automatizadas têm a mesma franquia do chat interativo. Revalidar a documentação oficial ao implementar.

Codex App Server e Gemini ACP são possíveis expansões documentadas, mas ficam **fora da v1**: sem módulo vazio, sem login simulado e sem bloquear a entrega por essa integração futura. Suporte MCP utilizável é obrigatório; incorporação de clientes no chat é outro escopo.

## 16. MCP com permissões mínimas

Usar um comando do engine empacotado, por exemplo `evidra-engine mcp --connection-file <arquivo>`. Esse processo é uma ponte stdio autenticada para o engine já iniciado pelo plugin; não abre um segundo escritor SQLite nem ganha acesso irrestrito ao projeto.

O arquivo de conexão tem ACL do usuário e credencial própria, limitada a um caderno/snapshot. Nunca contém a chave administrativa do engine ou segredos de provedores. Em stdout só há mensagens do protocolo; logs sanitizados vão para stderr. Gerar credencial no plugin, permitir revogação e expiração. Configurações exportadas não revelam segredos no texto copiado para suporte.

Ferramentas obrigatórias, com schemas explícitos:

| Ferramenta | Contrato |
|---|---|
| `get_notebook_status` | Identidade do caderno autorizado, revisão, cobertura e limites; nenhum outro caderno. |
| `list_sources` | Metadados paginados das fontes autorizadas. |
| `search_evidence` | Busca no snapshot permitido; retorna IDs opacos, trechos e localizadores. |
| `read_evidence` | Lê trecho/página autorizados com teto de tamanho; não aceita path ou URL arbitrário. |
| `get_protocol` | Protocolo e formulário ativos autorizados. |
| `get_matrix` | Matriz paginada, com estados e evidências. |
| `propose_extractions` | Cria propostas validadas, sem aprovar ou sobrescrever células humanas. |
| `propose_note` | Cria artefato pendente de revisão, sem escrever automaticamente no Zotero. |

Não expor `run_javascript`, shell, download, leitura de arquivos arbitrários, credenciais, configuração de provedores, alteração de escopo, aplicação de propostas ou exclusão de itens.

O servidor atribui proveniência `EXTERNAL_CLIENT` às propostas; um campo de modelo declarado pelo cliente é apenas declaração, não metadado verificado. IDs de evidência e snapshots são validados no servidor. Capacidade de escrita é separada: sessões somente leitura não podem sequer criar propostas.

Manter Zotero aberto e fonte de autorização válida durante a sessão. Ao perder heartbeat/permissão ou revogar a conexão, bloquear novas leituras e propostas. Mostrar no painel quando clientes externos estão conectados. A aplicação não garante o que o cliente faz com trechos já recebidos.

## 17. Persistência e integridade

Banco em diretório de dados do Evidra por perfil do Zotero, fora de pastas de documentos compartilhadas/OneDrive por padrão. Windows: `%LOCALAPPDATA%/Evidra/profiles/<profile_instance_id>/`. Não colocar o banco no Git.

Entidades mínimas:

- `Notebook`, `SelectionRevision`, `Snapshot`, `SnapshotMember`.
- `SourceItem`, `Attachment`, `DocumentVersion`, `Page`, `Chunk`.
- `EmbeddingGeneration`, `ChunkEmbedding`.
- `ProtocolVersion`, `FormVersion`, `FieldDefinition`.
- `Run`, `Job`, `JobUnit`, `Conversation`, `Message`.
- `Evidence`, `ExtractionProposal`, `CellDecision`, `ScreeningDecision`.
- `ArtifactVersion`, `ApprovedWriteOutbox`, `AuditEvent`.
- `ProviderProfile`, `UsageLedger`, `McpConnection` sem segredos de provedor em texto puro.

Não é obrigatório uma tabela por entidade se composição preservar invariantes; chaves, relações e índices devem ser explícitos.

Usar revisões imutáveis para documentos/formulários/artefatos. Chaves únicas impedem duplicatas de jobs/células/notas. Guardar timestamps UTC e exibir no fuso local. Toda alteração humana tem autor local, timestamp, estado anterior e novo. O histórico não é uma garantia criptográfica contra um administrador malicioso; não fazer essa alegação.

Migrations transacionais com backup consistente pela API de backup SQLite, não cópia isolada do arquivo em WAL. Antes de downgrade incompatível, bloquear com diagnóstico. Cache descartável pode ser reconstruído; decisões humanas e evidências aprovadas não podem ser descartadas como cache.

A escrita de notas no Zotero utiliza outbox: aprovação cria intenção persistida com UUID, o bridge verifica permissões e publica, faz readback e grava o identificador final. Se houver interrupção, reconciliar uma marca de proveniência própria antes de repetir. Criação de nota não deve ser anunciada como coberta pelo undo nativo sem verificação; não apagar notas do usuário para “desfazer” automaticamente.

Remover o plugin não apaga PDFs nem notas originais. Apagar dados do Evidra é uma ação explícita e separada. O desinstalador não deve tomar decisões sobre a biblioteca.

## 18. Contratos internos e API

Pydantic no engine é fonte de verdade dos schemas. Gerar OpenAPI/JSON Schema e tipos TypeScript, com teste de drift. Não manter duas definições manuais divergentes.

Contratos obrigatórios:

```text
ScopeContext:
  principal_id, notebook_id, snapshot_id, scope_revision,
  capabilities, current_access_revision

DocumentIdentity:
  profile_instance_id, library_id, item_key, attachment_key

DocumentVersion:
  id, identity, sha256, parser_version, page_count,
  extraction_status, extraction_coverage

EvidenceRef:
  id, document_version_id, source_kind, page_index, page_label,
  excerpt, normalization_map_ref, optional_bbox, anchor_status

GenerationRequest:
  run_id, provider_profile_id, model_id, authorized_messages,
  output_schema, evidence_ids, output_limit, budget_reservation_id

GenerationResult:
  run_id, effective_model_id, content, parsed_output,
  usage, billing_status, finish_reason, validation_errors

ExtractionProposal:
  id, snapshot_id, study_id, form_version_id, field_id,
  value, value_status, evidence_ids, coverage, origin, run_id
```

Usar tipos reais/validação para nullability, limites e enums; o bloco acima define campos conceituais, não código pronto.

Rotas privadas mínimas `/v1`:

| Família | Operações |
|---|---|
| Health/protocolo | Estado mínimo não sensível; detalhes completos autenticados. |
| Fontes | Sincronizar lote autorizado do bridge, preview de seleção, invalidar permissões/versões. |
| Cadernos/snapshots | Criar/ler/editar seleção, calcular delta, congelar, listar revisões. |
| Documentos/indexação | Enfileirar ingestão, consultar estados e cobertura. |
| Search/evidence | Busca com ScopeContext e leitura de evidências. |
| Conversations/runs | Mensagens, stream, cancelamento, histórico autorizado. |
| Forms/extractions/matrix | Formulários, jobs, propostas e decisões humanas com revisão esperada. |
| Screening | Protocolo e decisões por estágio. |
| Synthesis/audit | Gerar/revisar artefatos e auditorias. |
| Jobs/events | Progresso paginado, stream, pausa/cancelamento/retomada. |
| Providers/usage | Configurar, validar capacidades e consultar uso; somente UI administrativa local. |
| MCP | Criar/revogar conexões e consultar propostas; nunca via ferramenta do modelo. |
| Export/backup | Preview e criação explícita de artefatos em destinos escolhidos pelo usuário. |

Autorização deve acontecer no serviço de domínio, não só no middleware HTTP, porque MCP também usa as operações.

Paginação obrigatória; limites de tamanho de payload; versionamento de protocolo; idempotency keys para comandos repetíveis. Use fetch streaming/SSE com Authorization em header e cursor de retomada; não colocar token em query string. Evento incompleto não deve corromper mensagens.

Erro padronizado: `code`, `message`, `retryable`, `run_id`, `details` sanitizados. Códigos mínimos: `SCOPE_DENIED`, `SCOPE_STALE`, `SOURCE_REVOKED`, `DOCUMENT_UNAVAILABLE`, `NEEDS_OCR`, `PROVIDER_UNAVAILABLE`, `MODEL_CAPABILITY_MISSING`, `RATE_LIMITED`, `BUDGET_EXCEEDED`, `BILLING_UNKNOWN`, `INVALID_MODEL_OUTPUT`, `CANCELLED`, `ENGINE_VERSION_MISMATCH`.

## 19. Fila, cache e retomada

Fila em SQLite com estados `QUEUED`, `RUNNING`, `PAUSED`, `WAITING_PROVIDER`, `PARTIAL`, `SUCCEEDED`, `FAILED`, `CANCELLED`. Unidade de progresso: documento/campo ou etapa de ingestão. Claim/lease transacional impede execução duplicada.

Defaults: um job gerador em execução; um worker de parsing, configurável até dois; concorrência separada para I/O; backpressure quando a fila/caches atingem limites. Não iniciar um processo por página sem limite. Não consumir GPU automaticamente enquanto o usuário só navega na biblioteca.

Guardar checkpoint após cada unidade confirmada. Ao reiniciar, leases expirados não significam automaticamente que uma chamada paga pode ser repetida: reconciliar estado de envio e marcar cobrança incerta quando necessário.

Cancelamento impede novas unidades e tenta interromper chamada/worker em andamento. Registrar que cancelamento não garante estorno de tokens já processados. Não marcar como concluído um job cancelado.

Cache de parsing: hash do arquivo + parser/política. Cache de embeddings: hash do chunk + modelo/revisão/dimensão. Cache de recuperação: snapshot + acesso atual + consulta + configuração de busca. Cache de geração: snapshot + acesso atual + prompt/formulário + modelo/configuração + evidências + mensagens autorizadas.

Cache físico pode compartilhar bytes de anexos idênticos, mas nunca permissões. Leitura exige um vínculo autorizado atual. Conteúdo gerado de outro caderno não entra por similaridade de hash de pergunta. Usuário pode exigir nova execução e limpar cache derivado sem apagar decisões.

Nenhum resultado deve ser reutilizado após revogação de fonte sem nova verificação. Mudança em formulário invalida apenas propostas/células afetadas, mantendo a versão antiga acessível com rótulo de histórico.

## 20. Segurança, execução local e privacidade

- Engine vinculado exclusivamente a `127.0.0.1` em porta disponível; não usar a porta 23119 do Zotero, nem `0.0.0.0`.
- Autenticação local obrigatória: segredo de 256 bits por sessão, entregue por canal protegido. Se for usado arquivo de handshake, ACL somente do usuário, path não previsível, escrita atômica, exclusão após leitura; nenhum segredo em argumentos de processo, logs ou URLs.
- Verificar Host/Origin, exigir header próprio/autorização para operações, negar wildcard CORS e requisições de origens web não autorizadas. Endpoint de saúde anônimo revela apenas estado mínimo.
- Credencial MCP separada, limitada e revogável. O cliente não recebe capacidade administrativa.
- Provedores remotos usam HTTPS com validação de certificado. Endpoint remoto personalizado exige autorização; redirecionamentos para destinos não autorizados são recusados. Recusar URLs com credenciais embutidas e schemes não suportados.
- Conteúdo de PDF/nota/modelo não pode disparar ferramentas privilegiadas, rede, expansão de escopo ou escrita. Todo retorno de modelo é dado não confiável.
- Sanear HTML/Markdown, proibir scripts/event handlers, impedir carregamento de imagens remotas, validar abertura de links por esquema e contexto. Usar CSP restritiva onde o host permitir e separar o renderer de conteúdo não confiável do bridge privilegiado; mensagens UI/bridge aceitam apenas operações tipadas autorizadas.
- Engine só abre anexos registrados pelo bridge; nenhum `read_file(path)` público. Revalidar symlinks/reparse points e arquivo entre registro e uso.
- Processos parser com timeouts/limites, sem shell interpolado. Não executar anexos, macros ou URLs de documentos.
- Logs padrão sem chaves, tokens, PDFs completos, prompts completos ou caminhos pessoais. Logging de conteúdo é opt-in temporário e deve exibir aviso. Dados necessários à auditoria da pesquisa ficam no banco local, não em telemetria.
- Credenciais nunca em export/backup. Memória é o único fallback quando o cofre falha. Não alegar criptografia integral do banco se ela não foi implementada.
- Helper iniciado sob demanda pelo plugin, sem autostart do sistema. Heartbeat a cada 10 segundos; após 30 segundos sem bridge válido, bloquear novas operações e pausar trabalho. Encerrar somente processos filhos próprios.
- Em shutdown/desativação do plugin, remover listeners, menus, recursos, streams e processos próprios, preservando estado consistente. Não encerrar Ollama, LM Studio ou um CLI que o usuário abriu independentemente.

Threat model mínimo: documento malicioso, resposta maliciosa, site tentando acessar localhost, cliente MCP tentando ampliar o escopo, proposta atrasada, arquivo substituído, import de backup malicioso e credencial exposta em logs. Não prometer isolamento contra malware com os mesmos privilégios do usuário.

## 21. Exportação, backup e proveniência

CSV: uma linha por estudo/resultado conforme modo escolhido, incluindo estados, unidades, condições, evidências e revisão. UTF-8 com opção adequada ao Excel; neutralizar fórmula injection em células textuais começando com `=`, `+`, `-` ou `@`, sem transformar números tipados em texto inadvertidamente. Documentar convenções.

JSON: export completo e versionado de protocolo, membros, versões, evidências, propostas, decisões e artefatos. Schema validável. Markdown: sínteses e matrizes legíveis, com referências reais e localizadores. Exports ativos respeitam permissão atual; conteúdo revogado não pode vazar por histórico/backup. Preservar apenas tombstones/metadados mínimos permitidos para explicar uma lacuna de auditoria.

Bibliografia: usar tradutores/API de exportação do Zotero para BibTeX/RIS/CSL-JSON conforme suporte verificado. Não depender obrigatoriamente de Better BibTeX nem inventar citekeys. Exportar apenas os itens explicitamente selecionados/autorizados e identificar fontes sem registro bibliográfico completo.

Backup do caderno: arquivo com manifesto, checksums, schema_version e dados locais selecionados; sem credenciais e sem PDFs originais por padrão. Avisar que excertos/conteúdo extraído também podem ser sensíveis. Se o usuário escolher incluir PDFs, verificar disponibilidade e autorização de cada um e mostrar tamanho antes de copiar.

Importação valida hashes, versão, tamanho, paths e schema; impede zip-slip, zip bomb e execução de conteúdo. Não altera a biblioteca automaticamente. Referências a outro perfil exigem remapeamento confirmado; IDs locais não são portáveis. Importado de fora fica identificado como tal, não como decisão autenticada do usuário atual.

## 22. Eficiência e limites operacionais

Meta de projeto, a medir e não anunciar antecipadamente: uso confortável com até 1.000 artigos e 50.000 chunks por caderno em desktop com 16–24 GB de RAM. Essa é escala-alvo inicial; exceder gera aviso/execução limitada e nunca perda silenciosa de documentos.

Defaults: até 512 MB de cache vetorial; processamento por blocos; páginas renderizadas sob demanda; até 100 MB de cache de imagens; limite configurável de cache derivado em disco com limpeza LRU somente de material reconstruível. Não embutir pesos de LLM no pacote nem inicializar GPU no startup.

Benchmark deve medir separadamente:

- tempo de resolver seleção e construir snapshot;
- parsing e indexação, incluindo quantos bytes/páginas foram processados;
- recuperação lexical e fusão, sem tempo de inferência;
- embedding da consulta e busca vetorial;
- primeira resposta/fim de resposta do provedor;
- pico de RAM, tamanho de índice, cache hit e retomada.

Objetivos iniciais: interface com progresso/ação de cancelamento visível em até 300 ms após comando; recuperação local aquecida p95 abaixo de 2 s no corpus-alvo, excluindo embedding/generação; ausência de bloqueios longos da UI por parsing. Registrar equipamento, corpus, amostras e resultados. Se não alcançar, registrar e otimizar o gargalo medido; não fabricar benchmark nem confundir desempenho simulado com real.

Busca, ingestão e matriz devem funcionar em CPU. A velocidade de um LLM externo/local é medida separadamente e não é uma garantia do plugin.

## 23. Testes e critérios de aceitação

Criar fixtures sintéticas/autorizadas com valores conhecidos. Não redistribuir artigos fechados. Incluir: dois perfis, duas bibliotecas com `item_key` igual, coleções sobrepostas, descendentes, busca salva, PDF de duas colunas, tabela, rotação, rótulo de página diferente do índice, PDF sem texto, PDF quebrado, vários anexos, nota humana e nota IA.

Testes de providers usam fixtures de protocolo e servidor falso local claramente limitado a testes. Smoke real exige endpoint/modelo ou credenciais fornecidos explicitamente. Nenhuma chave deve ser obtida ou comprada pelo agente.

### Matriz obrigatória

| ID | Critério observável |
|---|---|
| A01 | XPI carrega no Zotero-alvo, exibe telas/menus e é removido sem listeners/processos órfãos. |
| A02 | Selecionar múltiplas coleções usa APIs plurais e não confunde cabeçalhos da lista com itens. |
| A03 | Item em coleções sobrepostas entra uma vez; itens homônimos de bibliotecas diferentes não se fundem. |
| A04 | Subcoleções/filtros/buscas salvas/exclusões produzem exatamente o snapshot esperado. |
| A05 | Fonte muito relevante fora do escopo nunca chega ao prompt, às evidências, exports ou MCP. |
| A06 | Restrição ocorre antes do top-k: itens globais fora do escopo não escondem resultados válidos internos. |
| A07 | ID adivinhado de evidência/snapshot de outro caderno recebe recusa. |
| A08 | Remoção de fonte durante geração impede commit no novo escopo; cache não ressuscita o conteúdo. |
| A09 | Revogação de biblioteca e fechamento do bridge bloqueiam novas leituras MCP. |
| A10 | Fonte/metadado alterado fica stale; trocar modelo gerador não exige reindexar. |
| A11 | Parsing registra todas as páginas ou falhas explícitas; PDF sem texto não recebe falsa análise integral. |
| A12 | Citação abre anexo e página corretos, incluindo rotação/rótulos; ausência de bbox usa fallback rotulado. |
| A13 | Modelo que inventa evidência ou excerto recebe falha de validação, não selo de aprovação. |
| A14 | Busca lexical funciona sem internet, embeddings ou LLM. |
| A15 | Busca semântica rejeita dimensões/modelos incompatíveis; seu filtro de escopo passa nos mesmos testes. |
| A16 | Job sistemático enumera todos os estudos e discrimina leitura integral/parcial e arquivos ausentes. |
| A17 | Informação ausente produz null/estado correto, não zero, suposição ou resultado inventado. |
| A18 | Célula aprovada não é sobrescrita por reextração, race de job ou proposta MCP. |
| A19 | Resultados múltiplos preservam dataset, unidade, baseline e condição. |
| A20 | Triagem mantém parecer IA separado de decisão humana e critério versionado. |
| A21 | Auditoria distingue âncora válida de sustentação proposta; referência citada indiretamente não vira artigo lido. |
| A22 | Interrupção/reinício retoma unidades confirmadas sem duplicar extrações ou notas. |
| A23 | Cancelamento impede novas chamadas e mostra custo incerto quando a chamada já foi enviada. |
| A24 | Limite/erro de provider não ativa API paga, outro provedor ou outra credencial. |
| A25 | LOCAL rejeita endpoints/modelos explicitamente remotos e funciona em smoke com rede externa bloqueada. |
| A26 | Cada adaptador tem teste de protocolo correto, streaming, schema inválido, quota, timeout e cancelamento. |
| A27 | MCP só serve o caderno autorizado; sessão read-only não cria propostas; nenhuma ferramenta aplica notas. |
| A28 | HTML/PDF com prompt injection não expande fontes, executa scripts, lê arquivos nem aciona escrita. |
| A29 | Host/Origin indevido, token ausente e symlink/path forjado são recusados. |
| A30 | Segredos não aparecem em logs, backup, argumentos de processo ou configurações exportadas. |
| A31 | CSV neutraliza fórmulas textuais; backup malicioso não escreve fora do destino. |
| A32 | Backup/restauração preserva decisões e versões; não presume que IDs de outro perfil são válidos. |
| A33 | Engine empacotado roda em Windows limpo sem Python/Node, com protocolo compatível. |
| A34 | UI distingue fonte indisponível, falha, resultado parcial, rascunho e dado aprovado; teclado funciona. |
| A35 | Performance real medida com corpus e hardware declarados, sem números inventados. |
| A36 | Um fluxo real completo gera uma matriz, abre uma evidência e exporta resultado a partir de Zotero. |

Adicionar testes unitários/property-based para autorização, revogação, concorrência e invariantes de identidade. Não aceitar apenas mocks nesses limites.

Testes visuais/componentes em navegador não provam que a extensão funciona no Zotero. Smoke nativo em perfil de testes é obrigatório para declarar integração validada. Capturas devem ser do plugin funcionando, não mockups.

## 24. Ordem de implementação

Criar `docs/ACCEPTANCE_MATRIX.md` com rastreio: requisito → arquivos → teste → resultado. Não usar checklists preenchidos sem evidência.

**M0 — vertical instalável.** Inspecionar ambiente e documentação; scaffold plugin; engine mínimo; protocolo autenticado; carregar no perfil de teste; criar/exibir um caderno persistido. Validar processo de build cedo.

**M1 — fontes e autorização.** Bridge nativo, multi-seleção, identidades, seleção/snapshot, escopo aplicado a leitura, revogação. Escrever antes os testes que tentam vazar dados entre bibliotecas/cadernos.

**M2 — documentos e busca.** Parser, páginas/chunks/evidências, indexação incremental, FTS5, abrir página, falhas e coverage. Entregar navegação útil sem modelo.

**M3 — modelos e conversa.** ProviderAdapter, Ollama/LM Studio, demais APIs reais, capability checks, streaming/validação, orçamento e embeddings opcionais. Fixture tests para todos; smoke real quando autorizado.

**M4 — matriz e jobs.** Formulários, varredura sistemática, fila persistente, células, propostas, revisão humana, retomada, cancelamento e exportação inicial.

**M5 — pesquisa.** Protocolo, triagem, comparação, síntese, auditoria e artefatos versionados; notas aprovadas via outbox.

**M6 — cliente externo.** MCP limitado por sessão, configuração assistida para clientes oficiais, testes de escopo e propostas no painel. Não ampliar ferramentas além do contrato.

**M7 — distribuição e auditoria final.** Backup/import seguro, diagnóstico, acessibilidade, documentação completa, benchmark, smoke nativo, pacotes e matriz final.

Em cada marco: escrever teste de comportamento/erro, implementar, executar, inspecionar resultado e registrar evidência. Corrigir defeitos antes de acrescentar recursos fora do marco. Os marcos são ordem de trabalho, não permissão para entregar só M0/M1 como “completo”.

Subagentes, se disponíveis, só para tarefas independentes com contratos e integração explícitos; não é requisito usar vários agentes. Não gastar o projeto montando um sistema de agentes.

## 25. Build, instalação e entrega

Comandos documentados e executáveis na raiz:

- `npm ci`, `npm run typecheck`, `npm test`, `npm run build:plugin`.
- `uv sync --project services/engine --frozen`.
- `uv run --project services/engine ruff check services/engine`.
- `uv run --project services/engine pytest services/engine/tests tests` — manter seleção/configuração de testes coerente; não varrer arquivos TS como testes Python.
- `scripts/check.ps1`: executar verificações locais e produzir relatório, sem depender de CI remoto.
- `scripts/package.ps1`: montar XPI e pacote do engine com manifesto/hashes.

Se ajustar comandos ao layout, entregar a versão realmente executável e registrar no README. Node/npm/uv são ferramentas de desenvolvimento; não dependências do usuário final.

Artefatos esperados: `evidra-0.1.0.xpi`, `evidra-engine-0.1.0-windows-x64.zip`, `SHA256SUMS.txt`, `release-manifest.json`, documentação e relatório de testes. O número 0.1.0 é a primeira versão do software; v1.0 é a versão desta especificação.

PyInstaller gera distribuição específica do sistema operacional onde o build é realizado. Não renomear binário Linux para `.exe`, não prometer build Windows validado a partir de um ambiente Linux sem cadeia apropriada. Se Windows não estiver disponível, entregar código/build scripts e relatar `WINDOWS_BUILD_NOT_RUN`; isso bloqueia a declaração de pacote Windows validado, não todo trabalho restante.

Instalação final: instalar XPI, extrair engine, selecionar executável no onboarding, escolher fontes e configurar modelo. Sem terminal permanente, sem admin, sem Docker. A aplicação deve diagnosticar engine ausente, porta/protocolo incompatível, modelo indisponível e permissões inválidas.

Não publicar releases ou registrar atualizador remoto sem autorização. Hashes permitem detectar inconsistência do pacote, mas não equivalem a assinatura de um fornecedor confiável. Não afirmar assinatura digital se não foi feita.

## 26. Definição de pronto e limites da declaração final

A v1 só é declarada completa quando todas as funcionalidades obrigatórias estão implementadas e os critérios pertinentes passam com evidência. Uma integração de API sem chave pode estar implementada e testada por contrato, mas seu smoke real continua não executado.

Relatório precisa separar quatro categorias: `IMPLEMENTED`, `VERIFIED_WITH_FIXTURES`, `VERIFIED_LIVE`, `NOT_VERIFIED/BLOCKED`. Ausência de ambiente/credenciais não autoriza fabricar a validação. Falha conhecida não vira “passou com ressalvas” sem descrever a falha.

Não aceitar como pronto: apenas frontend; apenas backend; XPI sem engine utilizável; chat sem restrição de fontes; matriz sem evidências; providers simulados; testes que só verificam status 200; documentação que promete mais do que o código; garantias de “zero alucinação”; nem resumo dizendo “basta integrar depois”.

Se a sessão terminar antes de completar tudo, salvar em `docs/STATE.md`: estado real, último comando/teste, arquivos modificados, marcos concluídos, requisitos pendentes e próximo passo concreto. Não escrever “completo” nesse caso.

## 27. Formato da resposta final do agente implementador

Entregar:

1. Estado real da implementação e marcos concluídos.
2. Caminhos exatos dos artefatos existentes e hashes.
3. Instruções curtas para instalar e testar no Windows/Zotero alvo.
4. Modelos/adaptadores implementados, quais tiveram smoke real e quais não.
5. Resultados de testes com comandos, contagens e falhas/bloqueios.
6. Requisitos não atendidos e riscos observados, sem esconder limitações.
7. Link/caminho para `ACCEPTANCE_MATRIX.md`, `TEST_REPORT.md` e `STATE.md`.

**Execute agora. Não responda apenas explicando como faria.**

## 28. Referências técnicas para revalidação

Fontes oficiais/de projetos consultadas na preparação em 05/09/2026. Elas orientam compatibilidade e protocolos; o restante deste documento são decisões de desenho, não capacidades já implementadas. Verifique alterações ao executar. Não leia snippets antigos como especificação atual e não invente endpoints.

```text
Zotero — histórico de versões:
https://www.zotero.org/support/changelog

Zotero 10 — desenvolvimento, multi-seleção, compatibilidade e APIs:
https://www.zotero.org/support/dev/zotero_10_for_developers

Zotero — desenvolvimento de plugins:
https://www.zotero.org/support/dev/client_coding/plugin_development

SQLite — FTS5:
https://sqlite.org/fts5.html

pypdfium2 — extração, renderização e APIs:
https://pypdfium2.readthedocs.io/en/stable/python_api.html

Ollama — saídas estruturadas:
https://docs.ollama.com/capabilities/structured-outputs

Ollama — embeddings:
https://docs.ollama.com/capabilities/embeddings

LM Studio — interfaces OpenAI-compatible:
https://lmstudio.ai/docs/developer/openai-compat

Anthropic — Messages API:
https://platform.claude.com/docs/en/api/messages/create

Google — generateContent e streamGenerateContent:
https://ai.google.dev/api/generate-content

OpenAI — Codex App Server, referência para eventual expansão, fora da v1:
https://learn.chatgpt.com/docs/app-server

Claude Code — autenticação, credenciais e limites de integração:
https://code.claude.com/docs/en/legal-and-compliance

Gemini CLI — autenticação:
https://geminicli.com/docs/get-started/authentication/

Gemini CLI — MCP:
https://geminicli.com/docs/tools/mcp-server/

Gemini CLI — ACP, referência para eventual expansão, fora da v1:
https://geminicli.com/docs/cli/acp-mode/

MCP — arquitetura e acesso aos SDKs/especificação atual:
https://modelcontextprotocol.io/docs/learn/architecture

PyInstaller — distribuição e requisitos de plataforma:
https://pyinstaller.org/en/stable/operating-mode.html

ZotSeek — referência, não dependência obrigatória:
https://github.com/introfini/ZotSeek

Open Notebook — referência, não dependência obrigatória:
https://github.com/lfnovo/open-notebook
```

Para os adaptadores OpenAI, Anthropic e Gemini de API direta, localizar a documentação oficial atual de geração/streaming/structured output do provedor no início do marco M3, registrar URLs e versões em `docs/MODELS_AND_BILLING.md` e implementar contra contratos efetivamente documentados. Uma API “compatível com OpenAI” não substitui a documentação nativa dos outros provedores.
