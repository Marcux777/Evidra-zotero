# Acceptance matrix

Statuses require executed evidence. PARTIAL means only the named sub-boundary has evidence; it does not pass the complete acceptance criterion. Task 1 passed independent review after one fix round.

| ID | Requirement | Files | Check / receipt | Result |
|---|---|---|---|---|
| A01 | XPI carrega no Zotero-alvo, exibe telas/menus e é removido sem listeners/processos órfãos. | `apps/zotero/src/bootstrap`, bridge, UI, XPI | Reviewedb132506 passed native admission/menu/opaque UI/consent/engine/notebook create-close-reopen, host restart and two-main-window synchronization. task2-native-reader-receipt.json also proves the registered reader section displays the current notebook and main workspace survives reader close. Normal final-window close removed the exact owned engine. Disable/uninstall remains unverified. | PARTIAL |
| A02 | Selecionar múltiplas coleções usa APIs plurais e não confunde cabeçalhos da lista com itens. | `sources/resolver.ts`, Task3 source bridge | Controlled plural-selector cases pass; actual two-item native selection excludes other library items. Native plural collections remain unverified. | PARTIAL |
| A03 | Item em coleções sobrepostas entra uma vez; itens homônimos de bibliotecas diferentes não se fundem. | Task3 compound identities and snapshot membership | Resolver overlap fixtures and real SQLite/property identity cases pass. Native cross-library/overlap scenario remains unverified. | PARTIAL |
| A04 | Subcoleções/filtros/buscas salvas/exclusões produzem exatamente o snapshot esperado. | Task3 selection/staging/snapshots | Exact fixture membership/delta/filter cases pass; native basic preview/capture passes. Native filter/container permutations remain unverified. | PARTIAL |
| A05 | Fonte muito relevante fora do escopo nunca chega ao prompt, às evidências, exports ou MCP. | `scope/service.py` central server-issued scope | Real SQLite current-grant/content intersections and native removal/trash exclusion pass. Retrieval, prompts, exports and MCP are later consumers. | PARTIAL |
| A06 | Restrição ocorre antes do top-k: itens globais fora do escopo não escondem resultados válidos internos. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A07 | ID adivinhado de evidência/snapshot de outro caderno recebe recusa. | Task3 scope/principal guards | Real SQLite/HTTP foreign snapshot/source/principal refusal passes. Evidence IDs and MCP consumers remain unimplemented. | PARTIAL |
| A08 | Remoção de fonte durante geração impede commit no novo escopo; cache não ressuscita o conteúdo. | Task3 guarded commit/current grants | SQLite stale-commit and no-resurrection checks pass; native revoked source stays unavailable after restart. Generation/cache integration remains unimplemented. | PARTIAL |
| A09 | Revogação de biblioteca e fechamento do bridge bloqueiam novas leituras MCP. | Task1 heartbeat and Task3 library invalidation | Runtime heartbeat and SQLite library revocation/revalidation checks pass; MCP remains unimplemented. | PARTIAL |
| A10 | Fonte/metadado alterado fica stale; trocar modelo gerador não exige reindexar. | Task3 immutable versions/current observations | Native changed title is marked stale while snapshot retains the original; unchanged PDF-subset isolation passes focused checks. Generator/index independence awaits later tasks. | PARTIAL |
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
| A28 | HTML/PDF com prompt injection não expande fontes, executa scripts, lê arquivos nem aciona escrita. | `apps/zotero/src/security`, typed bridge | Controlled Markdown/message checks passed; real Gecko isolation, PDF/parser and model/tool scope pending. | PARTIAL |
| A29 | Host/Origin indevido, token ausente e symlink/path forjado são recusados. | `security/runtime.py`, `security/handshake.py` | Task 1 auth/ACL cases and `.local/task-1/path-security-receipt.json` pass for startup; future registered-source path boundary pending. | PARTIAL |
| A30 | Segredos não aparecem em logs, backup, argumentos de processo ou configurações exportadas. | Task 1 runtime/handshake/CLI | `.local/task-1/smoke-receipt.json`: token absent from command arguments/receipt/logs; provider secrets, exports and backup pending. | PARTIAL |
| A31 | CSV neutraliza fórmulas textuais; backup malicioso não escreve fora do destino. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A32 | Backup/restauração preserva decisões e versões; não presume que IDs de outro perfil são válidos. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A33 | Engine empacotado roda em Windows limpo sem Python/Node, com protocolo compatível. | Preliminary M0 PyInstaller onedir under `.local/native-smoke/` | `smoke-be843d60f511/smoke-receipt.json`: actual binary flow/cleanup passed with PATH only System32; final package and clean-Windows host pending. | PARTIAL |
| A34 | UI distingue fonte indisponível, falha, resultado parcial, rascunho e dado aprovado; teclado funciona. | Task2 App/style and native bridge; later source/result UI | Actual trusted Enter created a notebook across two mounted panels; both followed native light/dark themes. At fullZoom2, viewport450x264 stacked content with scrollWidth=clientWidth442. Receipt task2-native-multiwindow-receipt.json; complete keyboard/accessibility and all later result states remain unverified. | PARTIAL |
| A35 | Performance real medida com corpus e hardware declarados, sem números inventados. | Not yet implemented | Not yet executed | NOT_VERIFIED |
| A36 | Um fluxo real completo gera uma matriz, abre uma evidência e exporta resultado a partir de Zotero. | Not yet implemented | Not yet executed | NOT_VERIFIED |
