# ADR 0004 — Linux como plataforma primária

Date: 2026-10-08. Status: accepted. Supersedes the platform decision in SPEC §3 ("Alvo") and the Windows-specific parts of ADR 0002 (protected-file handshake with DACL).

## Contexto

O Evidra foi implementado e validado em um host Windows x64. Esse host não existe mais: o ambiente de desenvolvimento atual é Fedora Linux 43 x64 (kernel 7.1.5), com KVM, QEMU e libvirt disponíveis, mas sem VM nem instalação Windows, e sem os artefatos locais do host anterior (`.local/native-smoke`, pacotes 5 e 6, recibos). Medido em 2026-10-08, no Fedora acima, na revisão **`29bf3ab9feb96e7d0fda432d4dc63d773bb3c1b7`** ("chore: salva trabalho local antes da migração para Linux", 13 commits após `afda022`; branch `linux-port` criada nela):

| Medida | Resultado em 29bf3ab |
|---|---|
| `vitest run` | 111 de 111 passam (23 arquivos) |
| `tsc --noEmit` | passa |
| `pytest` do engine | 328 testes coletados: **130 passam, 198 falham**, mais **2 erros de coleta** (`tests/test_relevance.py`, `tests/test_triage.py`). Sem `--continue-on-collection-errors` a coleta aborta antes de executar qualquer teste |
| Causa das falhas | `ModuleNotFoundError: No module named '_winapi'`, `msvcrt` e `win32*` (e `st_file_attributes` inexistente em Linux) |
| `ruff check` | passa |
| `mypy --platform win32` | sem erros (105 arquivos) |
| `mypy` nativo (Linux) | 37 erros em 4 arquivos: `documents/parser_worker.py` (30), `documents/registry.py` (4), `security/handshake.py` (2), `__main__.py` (1) |

Os módulos que prendem o engine ao Windows: `documents/registry.py` (abertura verificada de arquivo), `documents/parser_worker.py` (Job Objects, handles herdados), `security/handshake.py` (DACL, `st_file_attributes`), `distribution.py` (`platform: Literal["win32"]`). A parte TypeScript já roda em Linux. Estas medidas valem para essa revisão; outro commit exige nova medição.

## Decisão

1. **Plataforma primária: Linux x64 (Fedora).** Zotero Desktop instalado pelo tarball oficial. Alvo de compatibilidade do Zotero inalterado (10.0.x a partir de 10.0.1).
2. **O código Windows é mantido, mas declarado sem suporte e não testado.** Ele deve ficar atrás de uma camada de plataforma (abertura segura de arquivo, isolamento do parser, handshake, diretório de dados, cofre de segredos), com uma implementação Linux e outra Windows escolhidas por plataforma. **Esta camada ainda não existe**: hoje os imports de `win32`/`msvcrt`/`_winapi` estão no topo dos módulos citados. Criá-la é trabalho das fases seguintes, e esta decisão não afirma que já foi feito.
3. Nenhum comportamento Windows é removido por esta decisão. Nenhum comportamento Linux é considerado funcional até ser executado em Linux.

## Consequências

- SPEC §3 é emendado (ver o bloco "Emenda ADR 0004" naquela seção): dados em `$XDG_DATA_HOME/Evidra/profiles/<id>` com fallback para `~/.local/share`; pacote `evidra-engine-<versão>-linux-x64.tar.gz`.
- A matriz de aceitação é reescrita: A25, A29 e A33 mudam de enunciado e **os 36 critérios estão `NOT_VERIFIED_ON_LINUX`**. As evidências do Windows ficam como histórico e **não** contam como aprovação em Linux. Nenhum critério é marcado aprovado sem execução em Linux.
- Os resultados de fixtures registrados no Windows (antes `VERIFIED_WITH_FIXTURES`) só voltam a valer depois que `scripts/check.sh` for aprovado em Linux; os seis verificados ao vivo dependem de execução nativa no Zotero em Linux.

## O que precisa ser revalidado em Linux

| Área | Windows (histórico) | Linux (a implementar e validar) |
|---|---|---|
| Handshake de sessão | diretório com DACL do usuário atual | diretório `0700` e arquivo `0600`, dono e `st_uid` verificados pelo engine, identidade do arquivo consumido uma vez |
| Abertura verificada de arquivo | `CreateFile` com `FILE_FLAG_OPEN_REPARSE_POINT`, `GetFinalPathNameByHandle` | `openat2`/`O_NOFOLLOW`, `fstat` (dev, inode, `st_nlink`) para recusar symlink, hardlink e troca de arquivo (A29) |
| Isolamento do parser PDF | Job Object com limite de memória e kill-on-close | processo filho com `setrlimit`, grupo de processos e encerramento garantido; sandbox adicional a decidir e medir |
| Cofre de segredos | Windows Credential Locker via keyring | Secret Service via keyring; fallback somente em memória mantido |
| Rede em modo LOCAL | firewall/bloqueio de rede no host | verificação em namespace de rede sem saída externa (A25) |
| Dados e caminhos | `%LOCALAPPDATA%` | `$XDG_DATA_HOME/Evidra/profiles/<id>`, fallback `~/.local/share` |
| Distribuição | PyInstaller onedir, ZIP | PyInstaller onedir, `evidra-engine-<versão>-linux-x64.tar.gz`, engine rodando em Linux limpo sem Python ou Node (A33) |
| Manifesto do engine | `platform: "win32"` | `platform` Linux x64; contratos regenerados |
| Fontes da UI | Segoe UI | `system-ui` do host |
| Suíte de testes | `check.ps1` | `scripts/check.sh` completo (pytest do engine incluso) |
| Aceite nativo | 6 critérios ao vivo | A01, A12, A23, A27, A34, A36 reexecutados em Zotero no Linux |

## Fora de escopo desta decisão

Não altera código, scripts nem contratos. `README.md` e `docs/INSTALL_WINDOWS.md` têm um aviso apontando para este ADR; o conteúdo de instalação Windows foi mantido como histórico, sem suporte, até as fases que implementarem o fluxo Linux.
