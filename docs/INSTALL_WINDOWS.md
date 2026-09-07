# Instalação no Windows

Alvo: Windows x64 e Zotero 10.0.x, a partir de 10.0.1. O número 0.1.0 identifica o software; não significa que toda a especificação v1 esteja validada. Consulte STATE.md e ACCEPTANCE_MATRIX.md antes de usar os artefatos.

1. Obtenha `evidra-0.1.0.xpi`, `evidra-engine-0.1.0-windows-x64.zip`, `SHA256SUMS.txt` e `release-manifest.json` da mesma pasta de distribuição. Compare os hashes SHA-256. Estes hashes detectam inconsistência; os arquivos não têm assinatura digital do projeto.
2. No Zotero de teste, abra Ferramentas → Plugins, use a opção de instalar a partir de arquivo e escolha o XPI.
3. Extraia o ZIP do engine em uma pasta local da sua conta. Mantenha `evidra-engine.exe`, `_internal`, `THIRD_PARTY_NOTICES` e `engine-manifest.json` juntos. Evite pastas de rede, junctions e links simbólicos.
4. Abra Ferramentas → Evidra. Em “Escolher manifesto do engine”, selecione o `engine-manifest.json` da pasta extraída. O plugin verifica o conjunto completo de arquivos e seus hashes.
5. Revise a impressão SHA-256 e autorize a execução. Mudanças no pacote exigem uma nova conferência. O engine usa uma porta negociada em `127.0.0.1`; nunca usa a porta 23119 do Zotero.
6. Crie um caderno, selecione as fontes no Zotero, confira a prévia e capture um snapshot. Indexe os documentos para buscar e conferir excertos. A matriz manual e a busca lexical funcionam sem modelo.
7. Para funções de IA, configure explicitamente um serviço/modelo disponível. O pacote não baixa modelos. Provedores API exigem consentimento por caderno/provedor e podem gerar cobranças no serviço escolhido.

O usuário final não precisa instalar Python, Node, uv, Docker ou manter um terminal aberto. O engine leva seu runtime no ZIP. A validação em uma máquina Windows limpa é uma aceitação separada do teste com PATH restrito no computador de desenvolvimento; veja o relatório de testes.

Fechar a última superfície do plugin encerra o processo próprio. Se o bridge desaparecer, a sessão expira após 30 segundos sem heartbeat; o intervalo normal é 10 segundos. Não encerre um processo de outra tarefa para resolver um problema do Evidra.

## Diagnóstico

| Mensagem | Ação |
|---|---|
| `INVALID_ENGINE_MANIFEST`, `MISSING_ENTRYPOINT` | Extraia novamente o ZIP completo e selecione o manifesto correspondente. |
| `PAYLOAD_HASH_MISMATCH`, `PAYLOAD_FILE_SET_MISMATCH` | Confira os hashes e extraia numa pasta nova. Não misture versões ou acrescente arquivos à pasta do engine. |
| `PAYLOAD_CHANGED` | Confira a nova impressão antes de autorizar. |
| `PROTOCOL_MISMATCH`, `INVALID_CONNECTION_RECEIPT` | Use os dois artefatos da mesma distribuição. Não aponte para a API do Zotero. |
| `ACL_ERROR`, `NATIVE_COMMAND_FAILED`, `UNSAFE_NATIVE_PATH` | Use uma pasta local da sua conta e confira os diagnósticos nativos de permissões/caminho. Não altere permissões globais nem desative proteções. |
| `ENGINE_EXITED` | Leia a cadeia causal sanitizada no diagnóstico local e confira a integridade do pacote. |
| `MODEL_NOT_FOUND` | Confira serviço, nome e instalação do modelo selecionado. Nenhum outro provedor será usado automaticamente. |
| `PREVIEW_EVICTED` | Renderize a prévia novamente. O texto original e as decisões continuam armazenados. |
| `BRIDGE_TIMEOUT` durante um diálogo de salvar | O resultado pode ser incerto. Confira o destino e use “Repetir a mesma operação” para reconciliar o recibo; não crie outra exportação para contornar a trava. |

Dados próprios ficam em `%LOCALAPPDATA%\Evidra\profiles\<profile_instance_id>`. O engine nunca lê `zotero.sqlite`. Backups portáveis não restauram credenciais, sessões MCP ou autorização de execução.

## Desenvolvimento

Node >=22.12, Python >=3.12,<3.13 e uv são ferramentas de desenvolvimento. Na raiz:

```powershell
rtk proxy npm ci
rtk proxy uv sync --project services/engine --frozen
rtk proxy npm run typecheck
rtk proxy npm test
rtk proxy npm run build:plugin
rtk proxy uv run --project services/engine ruff check services/engine
rtk proxy uv run --project services/engine pytest services/engine/tests
rtk proxy uv run --project services/engine mypy --config-file services/engine/pyproject.toml services/engine/src/evidra
rtk proxy powershell -NoProfile -File scripts/check.ps1
rtk proxy powershell -NoProfile -File scripts/package.ps1
```

`scripts/check.sh` oferece o mesmo runner. A seleção Python usa o diretório real `services/engine/tests`; não existe uma pasta de testes Python na raiz e o pytest não varre testes TypeScript. O suporte de runtime/parser continua Windows: executar verificações em outro SO não valida esse alvo.

Os scripts imprimem a pasta exclusiva de saída em `.local/checks/` ou `.local/packages/`. Cada comando mantém stdout, stderr, retorno e duração. O pacote mantém os hashes dos bytes de entrada antes/depois, o commit e os metadados do build. `scripts/smoke-package.py <pasta-do-pacote>` executa um fluxo HTTP real do engine congelado com dados sintéticos, em diretórios descartáveis e PATH de filho restrito a System32. Ele não opera uma biblioteca Zotero.
