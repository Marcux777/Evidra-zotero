# ADR 0005 — Jev como provedor único de análise

Date: 2026-10-10. Status: accepted (decisão de desenho; **nenhum código foi alterado por esta decisão**). Supersedes, para a v1, a política multi-provedor do SPEC §§ de provedores (Ollama, LM Studio, OpenAI, Anthropic, Gemini e endpoint OpenAI-compatible) e o fluxo de geração livre (conversa, síntese, auditoria, busca semântica). Relacionado: [ADR 0003](0003-relevance-triage.md) (triagem de relevância), [ADR 0004](0004-linux-primary-platform.md) (Linux), spike [JEV_SPIKE.md](../evaluation/JEV_SPIKE.md).

## Contexto

O desenho anterior dependia de modelos locais (Ollama, `qwen3:4b`, `qwen3-embedding:0.6b`) e de uma família de provedores. Os resultados da J0 e da J1a mostram que o System One da TypeSafe (modelo Jev), que devolve respostas estruturadas com probabilidades, cobre o que o produto precisa decidir por critério, com custo e latência baixos:

| Medida (J0/J1a, `jev-1.13.0`) | Resultado |
|---|---|
| H1 âncora por ID opaco (72 chamadas) | 72/72 corretas, todas com confiança ≥ 0,7; texto na descrição da opção não foi necessário |
| H2 critério por Noul (J0, 12 casos) | casos claros separados; "sem informação" ficou em 0,10–0,26, **nunca** na faixa ambígua |
| J1a forma A (choice `MET/NOT_MET/NOT_REPORTED` + âncora com `NONE`; 84 chamadas, 30 casos) | 0 erros críticos; 37/37 sem sustentação com `NONE`; exclusão firme em 36/37 contradições; 1 veredito diferente do rótulo (s2, rótulo fraco do J0) |
| J1a forma B (dois nouls `addressed?`/`met?`; 84 chamadas) | 0 erros críticos, mas exclusão firme em 1/37: o Noul trata "contradiz" como "não diz" (`addressed` 0,08–0,44) |
| Custo medido | `input_tokens ≈ 178 + 0,278 × caracteres` (r = 0,9996, 4 pontos, até 16.574 caracteres); forma A ≈ 661 tokens (1 trecho) a ≈ 1.508 (5 trechos) |
| Modelo | a API aceita `model: "jev-1.13.0"` (HTTP 200, `req_01a1232e7fc2740f86798ed0a3931eb1`); `/v1/models` lista só `jev-latest` e `jev-preview` |

Limites dessas medidas: 30 casos curados de três artigos CC BY do mesmo domínio, parágrafos truncados em 1.500 caracteres, instruções em inglês, c_min = 0,70 provisório. As frequências de erro reais não estão medidas; 0 erros em 37 chamadas limita a taxa a cerca de 8% (95%).

## Decisão

1. **Provedor único: Jev (TypeSafe System One), modelo fixado em `jev-1.13.0`.** Nunca `jev-latest` nem `jev-preview` em runtime: a versão do modelo faz parte da versão do protocolo e do registro de cada chamada. Trocar de versão é decisão explícita, com nova medição.
2. **Ollama fora do fluxo.** Os adaptadores (Ollama, LM Studio, OpenAI-compatible e os demais) são **preservados no código**, sem perfil na UI, sem entrada no seletor e sem uso padrão. Nenhum deles é removido, e nenhum é acionado como alternativa ao Jev.
3. **Conversa, síntese, auditoria e busca semântica ficam desativadas na v1**, com o código preservado. A busca lexical (SQLite FTS) e a triagem permanecem.
4. **Sem provedor alternativo e sem outra credencial.** A falha do Jev nunca aciona outro provedor (reforço do A24).

## Desenho das perguntas (resultado da J1a)

1. **Por critério**: a forma vencedora da J1a, o choice `MET / NOT_MET / NOT_REPORTED` (opções com descrição em inglês), mais uma **âncora** `choice` sobre os IDs dos trechos preparados e `NONE`. Instruções e opções em inglês. Os trechos vão no state como `{"excerpts": {id: texto}}`; o ID é opaco.
2. **Regras de decisão por código**:
   - `NOT_REPORTED` ou âncora `NONE` → **UNCLEAR**, sempre.
   - Só `NOT_MET` com confiança ≥ c_min **e** âncora em um trecho preparado sustenta exclusão. Âncora fora dos IDs preparados, ausente ou `NONE` não sustenta nada.
   - `MET` com âncora válida é a única base de inclusão firme.
   - A resposta que não escolhe trecho não sustenta veredito firme (A13).
3. **Grau**: score na rubrica do protocolo (por critério ou por estudo). *Não medido na J0 nem na J1a*: a forma exata é decisão da J2/J3 e precisa de medição própria antes de qualquer limiar.
4. **Perguntas aproveitáveis por trecho**: choice com as opções `method`, `data`, `result`, `baseline`, `metric`, `code`, `NONE`. *Não medido na J0 nem na J1a*; entra no leque medido na J3.
5. **Decisão proposta** (incluir, excluir, incerto) é **derivada por código** dos vereditos e das âncoras. A justificativa exibida ao usuário é **composta pelo sistema** a partir dos vereditos e dos trechos escolhidos, e rotulada assim ("composta pelo sistema"); o modelo não escreve texto livre de justificativa.

## Limiares

- c_min e eventuais τ (graus, reconciliação entre critérios) **fazem parte da versão do protocolo**: mudar um valor muda a versão do protocolo e invalida decisões derivadas dele.
- Valores provisórios: **c_min = 0,70**, origem J0 (`LIMIAR` do `jev_decide.py`, "decisivo" = max(p, 1−p) ≥ 0,7) e J1a (pré-registrado no script; 0 erros críticos com esse valor). Nenhum outro limiar tem valor ainda.
- Os valores são **congelados antes do piloto**, em material de desenvolvimento (não no piloto nem no RL-20). Os casos da J0/J1a não fixam limiar final; só ajudam a escolher a forma.

## Orçamento de contexto

- Modelo de custo: `input_tokens ≈ 178 + 0,278 × caracteres` (J0, r = 0,9996).
- Limite de planejamento: **97 mil caracteres** para state + maior pergunta (equivale a ≈ 27.200 tokens, 15% de folga sobre 32k tokens de contexto).
- **Provisório**: a reta foi ajustada até 16,6 mil caracteres, e 97 mil é extrapolação; vale até a J3 medir o leque real de perguntas. Calibração contínua pelo `usage.input_tokens` de cada resposta, que é a medida de verdade.
- O controle de contexto é do engine (corta ou divide o state antes do envio), nunca do modelo.

## Dados e privacidade

- **Conteúdo enviado**: *excerpts* (trechos escolhidos por regra local) e *metadata* mínima do protocolo. Nada de biblioteca inteira, notas, anotações ou caminhos de arquivo.
- **Consentimento por caderno**: o envio ao Jev exige consentimento explícito do usuário em cada caderno, registrado e revogável.
- **Retenção/treino**: a TypeSafe declara não treinar com dados de clientes; retenção zero só no plano enterprise. Isso é declaração do provedor, **não verificada por este projeto**.
- **Em aberto (decisão do usuário)**: (a) plano contratado (e, portanto, retenção); (b) permissão institucional para enviar texto completo de artigos a um serviço externo. **Bloqueiam a J7 (execução com texto completo real), não a J2.**

## Erros e cancelamento

| Condição | Comportamento |
|---|---|
| 401, 422 | sem nova tentativa; falha identificada na unidade, sem fallback silencioso |
| 429, 529 | backoff com teto; o lote pausa e retoma por decisão do usuário ou ao fim do teto |
| Resposta malformada ou grande demais | recusada, sem nova tentativa automática *(proposta; confirmar na J2)* |
| Timeout | falha da unidade; custo tratado como incerto se a requisição foi enviada *(proposta; confirmar na J2)* |
| Cancelamento após envio | `BILLING_UNKNOWN` (custo/uso nulos), nunca estimado |
| Qualquer falha | **sem provedor alternativo** |

## Preço

Configurável, não embutido no código: **US$ 0,042 por milhão de tokens de entrada**; saída sem custo. O custo exibido é estimado a partir de `usage.input_tokens` e do preço configurado, e rotulado como estimativa.

## Consequências

- A matriz de aceitação é revisada (ver `ACCEPTANCE_MATRIX.md`): A15 (semântica), A21 (auditoria) e A25 (modo LOCAL) ficam `OUT_OF_SCOPE_V1` com justificativa deste ADR; A13, A24 e A26 são reescritos; A08, A10, A20, A22, A36 e outras linhas são auditadas. Os 36 IDs permanecem e **nenhum critério é marcado aprovado**.
- Pendências de código (não feitas aqui): perfil/UI do Jev, adaptador `jev` com `model` fixado, desativação das superfícies de conversa/síntese/auditoria/semântica, contratos regenerados.
- SPEC não é emendado por este ADR; a emenda é tarefa da J2. Até lá, onde o SPEC descreve multi-provedor, este ADR prevalece para a v1.
- `LINUX_DEV_ENVIRONMENT.md`: Ollama e modelos locais deixam de ser pendências do ambiente (obsoletos pelo ADR 0005). O Zotero pelo tarball continua pendente de autorização.
- A chave da API fica **somente** no Secret Service (`service=typesafe`), nunca em variável de ambiente persistente, arquivo de perfil ou repositório.
