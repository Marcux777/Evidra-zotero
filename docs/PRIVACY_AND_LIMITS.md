# Privacidade e limites

O engine se vincula exclusivamente a `127.0.0.1`, exige um segredo de sessão aleatório de 256 bits e usa handshake privado de uso único. O segredo não vai para argumentos do processo, recibos públicos, exportações ou backups. Segredos de provedores ficam no keyring do sistema operacional ou apenas na memória. Nenhuma credencial é descoberta automaticamente.

O Zotero fornece os itens e anexos explicitamente autorizados. O engine nunca abre `zotero.sqlite` e não procura artigos pelo disco. Identidades incluem perfil, biblioteca e chave do item. Cada leitura, busca, cache, exportação e operação MCP verifica o escopo atual; snapshots antigos não recuperam acesso a fontes removidas. Revogar acesso impede novos usos, mas não recolhe arquivos já exportados nem textos já enviados a um provedor.

LOCAL aceita apenas endpoints loopback e recusa modelos explicitamente cloud. Chamadas API precisam de consentimento específico por caderno/provedor; custo desconhecido continua `null`. Erros não acionam outro modelo, outra credencial, downloads ou retries ocultos. A disponibilidade do código de um adaptador não comprova seu funcionamento real com cada serviço.

Originais, versões, decisões humanas e propostas são registros diferentes. Uma âncora de citação válida comprova o vínculo com o excerto, não a veracidade científica nem que o excerto sustenta a conclusão. Texto sem informação relevante continua com estado explícito e valor `null`. PDFs sem texto pesquisável precisam de OCR externo; este pacote não executa OCR. Citações preservam o idioma original.

## Armazenamento reconstruível

Prévias de imagem são renderizadas sob demanda. O orçamento padrão de imagens é 100 MiB (104857600 bytes); o orçamento padrão de imagens e referências de cache em disco é 512 MiB (536870912 bytes). A limpeza LRU remove somente PNGs reconstruíveis de operações e referências de resultados já preservados. Nunca apaga texto original, versões, evidência, propostas, resultados históricos ou decisões. Um recibo de renderização pode continuar completo após a remoção do seu PNG; a leitura então retorna `PREVIEW_EVICTED` e permite uma nova renderização.

O limite é aplicado ao gravar/consultar o material de cache. Para ajustá-lo, feche o plugin e crie `cache-settings.json` na pasta de dados do perfil Evidra, por exemplo:

```json
{"derived_cache_bytes":536870912,"image_cache_bytes":104857600}
```

Ambos exigem pelo menos 1 MiB; imagens não podem exceder 100 MiB nem o orçamento total. Configurações inválidas bloqueiam a inicialização com `INVALID_CACHE_SETTINGS`, sem usar valores alternativos silenciosos. Arquivos vinculados são recusados.

A busca vetorial processa blocos compactos em CPU, sem cache persistente de vetores em RAM. O padrão de até 512 MiB para cache vetorial não implica pré-alocação; o cache de RAM persistente atual é zero. Índices e registros duráveis não pertencem ao orçamento de cache reconstruível. O tamanho total de SQLite e seus backups pode crescer; páginas liberadas são reutilizadas pelo SQLite e não garantem redução imediata do arquivo físico.

## Evidência de desempenho e integração

A escala-alvo é 1000 artigos/50000 chunks por caderno em desktop com 16–24 GB de RAM. Esse alvo é uma hipótese de engenharia a medir, não promessa sobre toda biblioteca ou PDF. Busca, ingestão e matriz usam CPU. Embedding e geração dependem do serviço escolhido e suas latências são medidas separadamente. Não há garantia de velocidade de LLM.

O benchmark sintético, as verificações de componentes, o smoke do processo empacotado e o smoke nativo do Zotero são categorias distintas. Não demonstram integração com uma biblioteca pessoal. A matriz de aceitação e STATE.md preservam falhas conhecidas, serviços sem smoke real e limitações de Windows limpo/rede externa bloqueada. Não há afirmação de “zero alucinação” ou de v1 completa.
