# Acceptance matrix

Statuses require executed evidence. PARTIAL means only the named sub-boundary has evidence; it does not pass the complete acceptance criterion. Task 1 passed independent review after one fix round.

| ID | Requirement | Files | Check / receipt | Result |
|---|---|---|---|---|
| A01 | XPI carrega no Zotero-alvo, exibe telas/menus e é removido sem listeners/processos órfãos. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A02 | Selecionar múltiplas coleções usa APIs plurais e não confunde cabeçalhos da lista com itens. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A03 | Item em coleções sobrepostas entra uma vez; itens homônimos de bibliotecas diferentes não se fundem. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A04 | Subcoleções/filtros/buscas salvas/exclusões produzem exatamente o snapshot esperado. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A05 | Fonte muito relevante fora do escopo nunca chega ao prompt, às evidências, exports ou MCP. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A06 | Restrição ocorre antes do top-k: itens globais fora do escopo não escondem resultados válidos internos. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A07 | ID adivinhado de evidência/snapshot de outro caderno recebe recusa. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A08 | Remoção de fonte durante geração impede commit no novo escopo; cache não ressuscita o conteúdo. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A09 | Revogação de biblioteca e fechamento do bridge bloqueiam novas leituras MCP. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A10 | Fonte/metadado alterado fica stale; trocar modelo gerador não exige reindexar. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A11 | Parsing registra todas as páginas ou falhas explícitas; PDF sem texto não recebe falsa análise integral. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A12 | Citação abre anexo e página corretos, incluindo rotação/rótulos; ausência de bbox usa fallback rotulado. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A13 | Modelo que inventa evidência ou excerto recebe falha de validação, não selo de aprovação. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A14 | Busca lexical funciona sem internet, embeddings ou LLM. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A15 | Busca semântica rejeita dimensões/modelos incompatíveis; seu filtro de escopo passa nos mesmos testes. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A16 | Job sistemático enumera todos os estudos e discrimina leitura integral/parcial e arquivos ausentes. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A17 | Informação ausente produz null/estado correto, não zero, suposição ou resultado inventado. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A18 | Célula aprovada não é sobrescrita por reextração, race de job ou proposta MCP. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A19 | Resultados múltiplos preservam dataset, unidade, baseline e condição. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A20 | Triagem mantém parecer IA separado de decisão humana e critério versionado. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A21 | Auditoria distingue âncora válida de sustentação proposta; referência citada indiretamente não vira artigo lido. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A22 | Interrupção/reinício retoma unidades confirmadas sem duplicar extrações ou notas. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A23 | Cancelamento impede novas chamadas e mostra custo incerto quando a chamada já foi enviada. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A24 | Limite/erro de provider não ativa API paga, outro provedor ou outra credencial. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A25 | LOCAL rejeita endpoints/modelos explicitamente remotos e funciona em smoke com rede externa bloqueada. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A26 | Cada adaptador tem teste de protocolo correto, streaming, schema inválido, quota, timeout e cancelamento. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A27 | MCP só serve o caderno autorizado; sessão read-only não cria propostas; nenhuma ferramenta aplica notas. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A28 | HTML/PDF com prompt injection não expande fontes, executa scripts, lê arquivos nem aciona escrita. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A29 | Host/Origin indevido, token ausente e symlink/path forjado são recusados. | `security/runtime.py`, `security/handshake.py` | Task 1 auth/ACL cases and `.local/task-1/path-security-receipt.json` pass for startup; future registered-source path boundary pending. | PARTIAL |
| A30 | Segredos não aparecem em logs, backup, argumentos de processo ou configurações exportadas. | Task 1 runtime/handshake/CLI | `.local/task-1/smoke-receipt.json`: token absent from command arguments/receipt/logs; provider secrets, exports and backup pending. | PARTIAL |
| A31 | CSV neutraliza fórmulas textuais; backup malicioso não escreve fora do destino. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A32 | Backup/restauração preserva decisões e versões; não presume que IDs de outro perfil são válidos. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A33 | Engine empacotado roda em Windows limpo sem Python/Node, com protocolo compatível. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A34 | UI distingue fonte indisponível, falha, resultado parcial, rascunho e dado aprovado; teclado funciona. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A35 | Performance real medida com corpus e hardware declarados, sem números inventados. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A36 | Um fluxo real completo gera uma matriz, abre uma evidência e exporta resultado a partir de Zotero. | Not yet implemented | Not yet executed | NOT_VERIFIED |
