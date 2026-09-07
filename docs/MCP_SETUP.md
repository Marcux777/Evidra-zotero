# MCP local: clientes externos no Evidra

O gateway usa o SDK oficial Python `mcp==2.1.1` por stdio e encaminha chamadas ao engine já aberto pelo plugin. Ele não inicia outro banco SQLite. O usuário final usa o executável empacotado; não precisa instalar Python ou Node para o Evidra. O próprio cliente externo deve estar instalado separadamente.

## Criar e revisar a conexão

1. Abra o Zotero e o Evidra, inicie o engine verificado, abra o caderno e selecione o snapshot autorizado.
2. Abra **Clientes externos**. Dê um nome, escolha a expiração (15 minutos, 1 hora ou 24 horas) e mantenha **Permitir propostas de extração e notas** desmarcado para somente leitura.
3. Clique **Criar conexão**. O bridge privilegiado gera uma credencial aleatória de 256 bits própria dessa conexão. O painel recebe somente os caminhos do executável e do arquivo privado, nunca a credencial.
4. Revise **Configuração manual do cliente**, selecione o texto e adicione somente a entrada desejada à configuração do cliente. O Evidra não executa os comandos nem sobrescreve configurações existentes. Use uma conexão diferente para cada cliente.

Se a criação tiver resultado incerto, use **Repetir a mesma operação**. O bridge retém a credencial e a chave de idempotência daquela tentativa. Uma reinicialização do engine encerra as conexões anteriores; crie uma nova conexão para a nova sessão.

O painel mostra expiração, revogação, última solicitação e atividade recente. **Credencial ativa** significa que a autorização ainda é válida; **atividade recente** significa solicitação observada nos últimos 30 segundos, não uma garantia de que o processo do cliente continua aberto. Atualize o painel ou aguarde sua atualização a cada 10 segundos enquanto aberto.

O arquivo de conexão usa ACL exclusiva do usuário, contém somente versão do protocolo, host `127.0.0.1`, porta e credencial MCP, e não contém a credencial administrativa ou segredos de provedores. Não compartilhe o conteúdo do arquivo. Os exemplos copiados contêm caminhos locais, que também podem revelar nomes pessoais e devem ser revisados antes de compartilhar com suporte.

## Configuração dos clientes

As formas abaixo foram conferidas em 2026-09-07 nas fontes oficiais. São exemplos manuais para substituir pelos caminhos reais retornados pelo painel. Nenhuma configuração, autenticação ou sessão de Codex, Claude Code ou Gemini CLI foi executada nesta implementação.

### Codex

A documentação oficial descreve `codex mcp add <nome> -- <comando>` e entradas `command`/`args` sob `mcp_servers`. [MCP no Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

```powershell
codex mcp add evidra -- 'C:\Evidra\evidra-engine.exe' mcp --connection-file 'C:\EvidraPrivate\connection.json'
```

Ou adicione a entrada ao `config.toml` existente, sem substituir outras entradas:

```toml
[mcp_servers.evidra]
command = 'C:\Evidra\evidra-engine.exe'
args = ['mcp', '--connection-file', 'C:\EvidraPrivate\connection.json']
```

### Claude Code

Use stdio e escopo local. O separador `--` mantém os argumentos do servidor separados dos argumentos do cliente. [Documentação oficial do Claude Code](https://code.claude.com/docs/en/mcp#option-3-add-a-local-stdio-server).

```powershell
claude mcp add --transport stdio --scope local evidra -- 'C:\Evidra\evidra-engine.exe' mcp --connection-file 'C:\EvidraPrivate\connection.json'
```

Não adicione uma configuração de projeto compartilhada sem revisar a exposição do caminho privado. O gateway não depende de OAuth ou de credenciais de assinatura do cliente.

### Gemini CLI

Adicione manualmente a entrada a `mcpServers` no `settings.json` do escopo escolhido. A forma de CLI documentada é `gemini mcp add [options] <name> <commandOrUrl> [args...]`; o padrão é stdio e escopo de projeto. O exemplo JSON evita ambiguidade entre argumentos do cliente e do engine. [Documentação oficial do Gemini CLI](https://geminicli.com/docs/tools/mcp-server/#adding-a-server-gemini-mcp-add).

```json
{
  "mcpServers": {
    "evidra": {
      "command": "C:\\Evidra\\evidra-engine.exe",
      "args": ["mcp", "--connection-file", "C:\\EvidraPrivate\\connection.json"]
    }
  }
}
```

O Evidra não altera a confiança do workspace, adiciona `trust: true` ou remove confirmações do cliente.

## Ferramentas e propostas

| Ferramenta | Resultado e limites |
| --- | --- |
| `get_notebook_status` | Identidade, revisão, limites e cobertura paginada dos documentos autorizados; `offset`/`limit`, no máximo 20 por página. |
| `list_sources` | Fontes autorizadas paginadas; avance por `offset + limit` retornados até `total`. |
| `search_evidence` | Busca lexical local no snapshot permitido, com IDs de evidência, trechos e localizadores. |
| `read_evidence` | Um trecho original de até 2400 caracteres, com versão imutável e localizador; somente ID opaco. |
| `get_protocol` | Protocolo e formulário ativos do caderno; ausências são `null`. |
| `get_matrix` | Matriz paginada por formulário autorizado, preservando decisões humanas. |
| `propose_extractions` | Uma proposta de extração por chamada, validada por campo e fonte; não aprova células. |
| `propose_note` | Nota externa pendente com 1–12 IDs de evidência e texto de até 12000 caracteres; não escreve no Zotero. |

Todos os argumentos são validados contra schemas explícitos. O servidor deriva caderno, snapshot, identidade e capacidades da conexão. Não existem ferramentas de shell, JavaScript, leitura por caminho/URL, configuração de provedores, expansão de escopo, aprovação ou aplicação de notas. Requisições HTTP têm teto de 64 KiB; respostas do gateway são limitadas a 1 MB. Um cliente deve manter a mesma `idempotency_key` ao repetir uma proposta de resultado incerto. O gateway não repete chamadas automaticamente.

As propostas recebem `EXTERNAL_CLIENT`. `declared_model` é declaração não verificada; nunca vira metadado de execução de modelo. Extrações aparecem na matriz e preservam o valor humano até uma decisão explícita. Notas aparecem em **Propostas de notas externas**, com o texto literal e os trechos originais. Após revisão humana, gere o preview concreto, aprove a intenção e só então use a publicação nativa existente. A publicação mantém os marcadores `evidra:ai`, `data-evidra-origin="ai"` e UUID de outbox para não transformar artefatos de IA em evidência primária.

## Encerramento e diagnóstico

Revogue a conexão no painel para bloquear imediatamente novas leituras e propostas. A expiração é verificada no serviço de domínio a cada operação, inclusive antes/depois de transações. Perder o heartbeat do bridge por mais de 30 segundos, revogar uma fonte ou encerrar a sessão do engine também impede acesso. O que o cliente já recebeu não pode ser recuperado pelo Evidra.

Em falhas, confira os códigos sanitizados no cliente: `FORBIDDEN` para capacidade/conexão expirada ou revogada, `BRIDGE_EXPIRED` para heartbeat encerrado, `SOURCE_REVOKED`/`SCOPE_STALE` para acesso alterado, `INVALID_REQUEST` para schema e `ENGINE_UNAVAILABLE` quando o gateway não consegue concluir HTTP. O stdout é reservado ao protocolo; não envie conteúdo de arquivos privados para diagnóstico.

## Evidência e limites desta implementação

O teste `services/engine/tests/test_mcp.py` usa um subprocesso stdio real do SDK oficial, engine HTTP em loopback e SQLite com dados sintéticos. Verifica o conjunto de oito ferramentas, todos os caminhos de chamada, somente leitura, evidência inválida/fora de escopo, expiração, revogação e heartbeat; inspeciona as linhas reais de stdout. O teste de notas percorre revisão humana e criação do outbox sem criar uma execução de pesquisa fictícia.

Isso não é aceite nativo do Zotero nem sessão real de Codex/Claude Code/Gemini CLI. Não houve chamada de provedor, autenticação, configuração remota ou publicação. O executável congelado com esta alteração e a UI no iframe opaco ainda precisam do aceite nativo coordenado. Relatório e recibos: [Task10](../.superpowers/sdd/IMPLEMENTATION_PLAN/task-10-report.md), `.local/task10/runs/`.
