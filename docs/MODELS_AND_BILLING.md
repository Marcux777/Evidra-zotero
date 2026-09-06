# Modelos, consentimento e custos

O backend M3 seleciona um perfil explícito. Não escolhe outro provedor, chave ou modelo quando uma operação falha. Nenhum perfil nem preço é criado automaticamente. A interface de configuração e conversa pertence à Task6; a configuração abaixo ainda não constitui uma interface nativa Zotero concluída.

## Contratos verificados

Documentação oficial revalidada em 2026-09-06. Python3.12.11, httpx0.28.1, keyring25.7.0 e jsonschema4.26.0 foram inspecionados no ambiente já instalado. Não há SDK de geração com retries implícitos. O cliente HTTP compartilhado valida TLS, ignora proxies de ambiente, limita conexões e tempo, não segue redirects e realiza uma tentativa. Uma falha exige uma nova decisão explícita, registrada como outra chamada.

| Adaptador | Contrato implementado e referência oficial |
|---|---|
| Ollama | `POST /api/chat`, mensagens nativas e NDJSON, `done:true` terminal, `format` para schema; [chat](https://docs.ollama.com/api/chat), [catálogo](https://docs.ollama.com/api/tags), [embeddings](https://docs.ollama.com/api/embed). |
| LM Studio | `/v1/chat/completions` com SSE, `finish_reason:stop` e `[DONE]`; embeddings locais em `/v1/embeddings`; [chat](https://lmstudio.ai/docs/developer/openai-compat/chat-completions), [embeddings](https://lmstudio.ai/docs/developer/openai-compat/embeddings). |
| OpenAI | `POST /v1/responses`, `input`, `instructions`, `max_output_tokens`, `store:false`. Deltas de texto e `response.completed` validado; falha/incompletude/recusa não viram resposta final. [Geração](https://developers.openai.com/api/docs/guides/text), [streaming](https://developers.openai.com/api/docs/guides/streaming-responses), [schema em text.format](https://developers.openai.com/api/docs/guides/structured-outputs). |
| Anthropic | `POST /v1/messages`, `anthropic-version:2023-06-01`, sistema separado e `max_tokens`; terminal `message_stop` após motivo válido. `output_config.format` contém `type:json_schema` e `schema`. [Messages](https://platform.claude.com/docs/en/api/messages/create), [eventos](https://platform.claude.com/docs/en/build-with-claude/streaming), [schema](https://platform.claude.com/docs/en/build-with-claude/structured-outputs). |
| Gemini | `v1beta/models/{model}:streamGenerateContent?alt=sse`, `contents/parts`, `systemInstruction`, `generationConfig`, chave em header. `finishReason:STOP` é necessário. Usa `responseMimeType:application/json` e `responseJsonSchema`. [Geração/eventos](https://ai.google.dev/api/generate-content), [schema](https://ai.google.dev/gemini-api/docs/structured-output). |
| OpenAI-compatible | Endpoint HTTPS explicitamente configurado no modo API ou IP loopback no modo LOCAL; Chat Completions explícito, separado do adaptador OpenAI Responses. Capabilities declaradas não significam compatibilidade completa. Falha de campo/protocolo é apresentada, sem tentativa com outro payload. [Contrato de referência](https://developers.openai.com/api/reference/resources/chat/completions/methods/create). |

A página de referência extensa de criação de Responses excedeu o limite de leitura da ferramenta; a geração foi conferida no guia oficial acima. Uma tentativa de URL antiga `guides/text-generation.md` retornou404; a navegação oficial apontou para `guides/text`. Nenhuma dessas leituras fez chamadas de geração ou descobriu credenciais.

Catálogo é uma leitura explicitamente solicitada; criar/listar perfis e abrir configurações não faz HTTP, probe, download ou inicialização de modelo. O catálogo pode falhar sem invalidar a configuração manual. Modelos explicitamente cloud em nomes/metadados observados são recusados no modo LOCAL. Um runner loopback é uma fronteira de confiança: Evidra não controla o tráfego de outro processo.

## Capacidades e dados enviados

Geração, streaming, imagens, schema, embeddings, contagem de tokens, cancelamento e catálogo possuem origem `PROVIDER_REPORTED`, `PROBED`, `USER_DECLARED` ou `UNSUPPORTED`. Escritas da configuração só podem declarar `USER_DECLARED` ou `UNSUPPORTED`; não fabricam um probe. Esta tarefa não executa probes automaticamente. Um modelo sem visão bloqueia imagens com `VISION_UNSUPPORTED`.

Perfis API vêm bloqueados, inclusive free tiers. Desbloquear a opção global não concede consentimento: cada caderno e perfil exige autorização das categorias efetivamente enviadas — trechos, metadados, imagens e histórico. A versão do perfil vincula o consentimento ao endpoint/modelo/configuração exibidos. Imagens e histórico são acrescentados pelo backend quando presentes; o consumidor confiável deve classificar também trechos e metadados. Revisão do perfil ou revogação do caderno invalida a autorização antes de novos envios/resultados.

Schemas fora do subconjunto nativo conservador permanecem integrais em instrução explícita de formato e validação local Draft2020-12. O evento final informa `local_validation`; nenhuma restrição é silenciosamente removida. Referências externas de schema são recusadas. JSON inválido ou violação do schema original falha. Não existe reparo automático: um consumidor posterior pode oferecer uma única chamada adicional explícita, identificada por `repair_of`; ela tem outro call_id e passa pelos mesmos limites.

## Segredos

Segredos só entram por uma operação explícita, versionada, no perfil escolhido. Ficam no keyring do sistema ou em memória; SQLite, backups e contratos contêm apenas estado/revisão. O backend nunca lê cookies, autenticação dos CLIs, variáveis de credenciais ou chaves de outro provedor. Falha ao gravar keyring retorna `MEMORY_ONLY` com `KEYRING_UNAVAILABLE` e tipo causal sanitizado. Como uma gravação pode falhar parcialmente, a resposta informa quando uma entrada pode permanecer no keyring. Uma mudança explícita para memória remove a entrada anterior conhecida ou falha. Memória perdida no encerramento exige fornecer a chave novamente; não recupera outra chave como fallback.

## Contabilidade

Cada chamada persiste call_id, job_id, session_id, caderno, snapshot, perfil/revisão, preço usado, limite de entrada, máximo de saída e horários UTC. O consumidor de jobs atribui essas identidades; elas não vêm de conteúdo do modelo. Repetir call_id nunca reenvia a chamada. Uma resposta final só é emitida depois da reconciliação. Interrupções da aplicação conservam envios pendentes como `BILLING_UNKNOWN`; reservas comprovadamente não enviadas tornam-se `NOT_SENT`.

Preços são configuração imutável por versão com modelo, adaptador, moeda, data de vigência e fonte. Não há tabela com valores inventados. Os valores sintéticos dos testes não são preços do produto. Os rates de entrada/saída devem representar o contrato aplicável ao modelo selecionado; custo calculado não substitui a fatura do provedor.

Limites por chamada, job e sessão são reservados atomicamente no SQLite. A reserva cobre um limite de tokens de entrada verificado e o máximo de saída solicitado. Configuração sem preço ou sem limite defensável bloqueia uma operação com teto monetário (`PRICE_UNKNOWN`/`TOKEN_BOUND_REQUIRED`); estimativas de caracteres não são aceitas como tokens. `InputBound` é uma interface interna para um recibo do consumidor confiável, nunca parâmetro de uma rota HTTP pública. O consumidor deve vincular esse recibo ao modelo, payload completo e regra de tokenização efetivamente verificados. Esta tarefa não cria automaticamente recibos de contagem nem afirma suporte a contagem ao listar modelos. Contagem remota de conteúdo também exigiria consentimento prévio.

Contagens provisórias não comprovam cobrança final. Timeout, cancelamento, stream interrompido ou revogação após envio preservam `BILLING_UNKNOWN` e a reserva. Informação ausente continua nula. Se não há preço, até contagens confirmadas mantêm custo desconhecido. Limites futuros incluem reservas incertas e bloqueiam quando não existe valor seguro para uma chamada anterior.429 pausa o perfil; apenas uma retomada explícita com revisão permite novos envios. Nenhum endpoint compra créditos.

## Integração da Task6 e contexto local

`app.state.services.providers` compartilha o Database/ScopeService existentes. O consumidor usa `generate(context, profile_id, request, cancel_event, identity=..., input_bound=...) -> AsyncIterator[GenerationEvent]` com ScopeContext de commit criado no servidor. Use `contextlib.aclosing` ao interromper o iterador. Não mantenha um lock SQLite durante HTTP. O encerramento do registry recusa novas operações, cancela e aguarda geração, catálogo e embeddings antes de fechar HTTP, limpar segredos e permitir o fechamento do banco; uma falha de limpeza conserva sua causa e é reportada. Erros preservam a causa privada e logs com tipos/códigos/identificadores, sem corpos, headers ou credenciais. Deltas são rascunhos; só `final` autoriza a conclusão do resultado.

As rotas HTTP desta tarefa configuram perfis, consentimento, preços, orçamento, segredos e catálogo; não existe ponte de fetch arbitrário nem endpoint genérico de geração. A Task6 implementará a conversa/SSE e a allowlist tipada no `Engine.request` real. `GenerationEvent`, `GenerationRequest` e `EmbeddingBatch` são exportados para o contrato TypeScript a partir dos modelos Python.

Embeddings só aceitam perfis independentes locais de Ollama/LM Studio. O lote informa modelo/digest configurado, dimensão e normalização medida; quantidade, modelo divergente, dimensão inconsistente e valores não finitos falham. O índice da Task6 deve registrar uma geração própria e impedir mistura entre lotes/modelos/dimensões; trocar o gerador não escolhe nem reconstrói embeddings.

O smoke local autorizado usa os modelos/digests de [LOCAL_MODEL_TEST_ENVIRONMENT.md](LOCAL_MODEL_TEST_ENVIRONMENT.md), sob controle do root. Para geração Ollama, o backend admite explicitamente `num_ctx:4096`, máximo de saída128, temperatura0, seed7 e `think:false`, sem impor esses valores como defaults de produto. `num_ctx` configura capacidade do runner; a documentação de `/api/chat` não estabelece um campo `truncate:false` com garantia de rejeição de overflow. Portanto ele não é enviado nem apresentado como proteção comprovada. O consumidor deve implementar uma política de contexto baseada em contagem/limite defensável; não presumir ausência de truncação nem transformar caracteres em tokens. Já `/api/embed` recebe `truncate:false` segundo seu contrato documentado.

## Evidência e limites

A23–A26/A30: fixtures verificam os seis protocolos, schema/imagens, falhas terminais, consentimento, custos desconhecidos/reservas, segredos e embeddings locais. Há também HTTP loopback controlado e SQLite real para a fronteira de envio/conclusão e concorrência. Essas evidências não são smoke de provedores pagos nem Zotero nativo. Receipts locais completos e comandos: [relatório Task5](../.superpowers/sdd/IMPLEMENTATION_PLAN/task-5-report.md), [logs](../.local/task05/).

Live Ollama via adaptador: pendente de revisão/smoke do root. Live LM Studio, OpenAI, Anthropic, Gemini e hosts compatíveis: `NOT_VERIFIED`. Isolamento de rede externa do runner, verificação de tokenizer/contexto e interface nativa de consentimento/custos não são declarados aprovados por estes testes. O modo cliente externo/MCP e suas assinaturas permanecem no escopo posterior; este backend não copia logins de Codex, Claude Code ou Gemini CLI.
