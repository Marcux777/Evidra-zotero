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

## Contrato do handshake no Linux (engine verifica; escritor cumpre na F4)

Verificado pelo engine (`security/_platform_posix.py`, `tests/test_handshake_posix.py`):

- **Ancestrais até a raiz de dados do Evidra** (o primeiro componente chamado `Evidra`): cada componente tem dono root ou o uid efetivo, e o diretório que o contém não tem escrita para grupo/outros (diretório com sticky, como `/tmp`, é aceito). Um symlink do usuário acima da raiz (por exemplo `~/.local/share`) é aceito.
- **De `Evidra/` para baixo**: nenhum symlink, nem de root. Um symlink chamado `Evidra` é recusado. O componente final nunca é symlink e um arquivo regular tem exatamente 1 link.
- **Objetos privados**: diretório exatamente `0700`, arquivo exatamente `0600`, dono igual ao uid efetivo, sem ACL POSIX estendida. A checagem autoritativa é feita no descritor aberto com `O_NOFOLLOW` (`fstat`, `st_nlink`), separada da caminhada pelo caminho.
- **Claim e recibo**: `renameat2(RENAME_NOREPLACE)`, criação com `O_EXCL` e `fchmod 0600`. Sem suporte, erro explícito, sem rename comum.
- **Diagnóstico**: nomeia o componente recusado (`details.component`, `depth`, `reason`), nunca o caminho completo.

Contrato do **escritor** (plugin, F4), que o engine não pode impor por conta própria:

1. Criar o diretório de sessão com modo `0700` **antes** de escrever qualquer coisa nele (`mkdir` com modo e `chmod` conferido), e dentro da raiz `Evidra/` do usuário.
2. Escrever o `handshake.json` e **só depois** garantir `0600` (`chmod` após escrever). `IOUtils` aplica a umask do processo do Zotero: o arquivo pode nascer `0644`, e o engine o recusa e não o consome. Não confiar na umask.
3. Nenhum symlink, hardlink ou subdiretório compartilhado dentro de `Evidra/`.
4. Remover o `handshake.json` e o temporário em qualquer falha (o engine não apaga um handshake recusado).

## Limite de memória do worker do PDFium em Linux (F2, medido em 2026-10-10)

Host: Fedora 43, kernel 7.1.5, Python 3.12.12, PDFium 153.0.7999.0 (pypdfium2 5.13.0). Sonda: `scripts/spikes/worker_memory_probe.py`. Cada linha é uma execução do worker real (`worker_main`) em um filho com **um** limite aplicado antes de ler o documento, depois de importar o interpretador, pydantic e o módulo do worker. Células: desfecho e, entre parênteses, o pico de RSS do filho em MiB (`wait4` → `ru_maxrss`). `ok` = o worker imprimiu `done`; `MemoryError` = exceção Python capturada pelo worker; `SIGABRT` = morte do processo sem diagnóstico (stderr vazio). Bombas: um `content stream` Flate que expande para 256 MiB / 1 GiB / 4 GiB de espaços (poucos KiB comprimidos).

| fixture | tamanho | sem limite: RSS pico / VmPeak (MiB) | AS 64 | AS 128 | AS 256 | AS 512 | AS 1024 | DATA 64 | DATA 128 | DATA 256 | DATA 512 | DATA 1024 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| small-5p | 2 KiB | 70 / 282 | MemoryError | MemoryError | MemoryError | ok (70) | ok (70) | ok (70) | ok (70) | ok (70) | ok (70) | ok (70) |
| text-500p | 637 KiB | 70 / 284 | MemoryError | MemoryError | MemoryError | ok (70) | ok (70) | ok (70) | ok (70) | ok (70) | ok (70) | ok (70) |
| dense-100k-lines | 5.5 MiB | 108 / 352 | MemoryError | MemoryError | MemoryError | ok (108) | ok (108) | SIGABRT (82) | ok (108) | ok (108) | ok (108) | ok (108) |
| bomb-256MiB | 255 KiB | 551 / 795 | MemoryError | MemoryError | MemoryError | SIGABRT (267) | ok (551) | SIGABRT (81) | SIGABRT (145) | SIGABRT (273) | SIGABRT (295) | ok (551) |
| bomb-1GiB | 1020 KiB | 2089 / 2333 | MemoryError | MemoryError | MemoryError | SIGABRT (266) | SIGABRT (778) | SIGABRT (79) | SIGABRT (143) | SIGABRT (272) | SIGABRT (527) | SIGABRT (1039) |
| bomb-4GiB | 4.0 MiB | 5170 / 5415 | MemoryError | MemoryError | MemoryError | SIGABRT (260) | SIGABRT (778) | SIGABRT (77) | SIGABRT (141) | SIGABRT (268) | SIGABRT (523) | SIGABRT (1033) |

Leituras:

- **`RLIMIT_AS` é inutilizável**: o interpretador mais o PDFium chegam a `VmPeak` ≈ 272–284 MiB antes de qualquer byte do documento. Um PDF de 5 páginas já falha com `MemoryError` em 64, 128 e 256 MiB e só roda a partir de 512 MiB. O contrato de `ParserLimits.memory_bytes` aceita 64 MiB a 4 GiB.
- **`RLIMIT_DATA` roda PDFs normais desde 64 MiB** (`VmData` ≈ 21–23 MiB) e contém as bombas: o filho morre com pico de RSS ≈ limite + 13–18 MiB (o RSS inclui ≈ 50 MiB de páginas de arquivo, que `RLIMIT_DATA` não conta). A bomba de 256 MiB roda com limite de 1 GiB (pico 551 MiB), como esperado.
- **O PDFium aborta (SIGABRT, stderr vazio) quando uma alocação falha.** Não há `MemoryError` Python nem mensagem. Uma alocação única maior que a folga (ex.: 256 MiB com limite de 512 MiB, pico de RSS 295 MiB) aborta sem que o consumo tenha se aproximado do limite.
- **Decisão**: `RLIMIT_DATA = memory_bytes` (soft = hard), mais um vigia no filho que lê `VmData` a cada 10 ms e, a 97% do limite, escreve um diagnóstico `MemoryError` e sai. O pai atribui `PARSER_MEMORY_LIMIT` somente com evidência positiva (`MemoryError` Python, relato do vigia). Um abort nativo sem diagnóstico é `PARSER_FAILED` com os fatos (`signal`, `peak_rss_mib`, `cpu_seconds`, limites armados), porque a causa não foi demonstrada. A RSS sozinha não é evidência: em limites pequenos o RSS de uma exaustão real e o de um crash qualquer se confundem (medido: 77–82 MiB contra 70 MiB de linha de base com limite de 64 MiB).
- **`ru_maxrss` do `wait4` não é o pico do filho**: ao `exec`, o kernel incorpora o pico do espaço de endereçamento anterior (o do engine) ao `ru_maxrss` do filho. Um teste dentro do pytest (engine de ~700 MiB) mediu 692 MiB para um worker de ≈ 130 MiB. A tabela acima vem de uma sonda com pai pequeno, por isso não sofre esse efeito. No engine, o pico do filho é a amostra de `VmHWM` lida em `/proc/<pid>/status` a cada 25 ms (limite inferior: a última leitura antes da morte). Os detalhes do erro trazem os dois: `peak_rss_mib` (amostrado) e `ru_maxrss_mib` (com a ressalva).
- **Contenção de descendentes e rede**: ver a seção seguinte (namespaces). Continua sem equivalente ao `ActiveProcessLimit = 1` do Windows: o worker ainda pode criar processos, mas todos morrem com o namespace de PID.

## Isolamento do worker em namespaces de usuário, PID e rede (F2, implementado em 2026-10-10)

**Decisão (usuário, 2026-10-10)**: o worker do PDFium roda em namespaces próprios de usuário, PID e rede, criados com `os.unshare` **antes** de carregar o PDFium ou ler qualquer byte do documento. Pré-requisito da F5.

- **Rede**: o worker não tem rede. A rede é um namespace novo, só com um `lo` desconfigurado; uma conexão ao loopback do engine, a um IP externo ou ao DNS falha com `ENETUNREACH` (errno 101), e o engine não vê nenhuma conexão.
- **Descendentes**: o worker é o PID 2 de um namespace de PID cujo PID 1 sai junto com ele; quando o PID 1 sai, o kernel mata todo processo do namespace. Um neto que fez `setsid` e escapa do `killpg` morre com o worker.
- **Capacidades**: o `unshare` de usuário concede um conjunto completo no namespace; o worker o esvazia (`capset`: efetivo, permitido e herdável) e mantém `NO_NEW_PRIVS`. `CapEff` e `CapPrm` ficam 0 (testado).
- **Estrutura**: engine → supervisor externo (namespace do engine, PID visível ao engine) → PID 1 do namespace → worker (PID 2). Os dois supervisores espelham o fim do worker: código de saída ou o mesmo sinal, de modo que a classificação do engine não muda (um `SIGABRT`/`SIGSEGV`/`SIGKILL` do worker chega ao engine como esse sinal). `PDEATHSIG` é armado em cada nível. `killpg` do engine mata os três; o namespace garante o resto.
- **Indisponível**: se `os.unshare` não existe ou o kernel o nega (por exemplo `kernel.unprivileged_userns_clone=0`, `user.max_user_namespaces=0` ou uma política de LSM), o worker falha com **`PARSER_SANDBOX_UNAVAILABLE`** e não roda. Não há degradação para um worker sem isolamento (testado: o corpo do worker não executa). O código é aceito como código de erro do filho e chega ao engine como motivo da operação.
- **`unshare` exige processo single-thread**: o isolamento é feito antes da thread do vigia de memória e do `alarm`, que são criados no worker final.
- **Amostragem de memória**: como o worker é neto do processo que o engine criou, o pico é o maior `VmHWM` da árvore (`/proc/<pid>/task/<tid>/children`, até 16 processos).
- **Fora da v1, registrado**: **seccomp** (filtro de syscalls) e namespace de montagem/sistema de arquivos. O worker ainda enxerga os arquivos do usuário com as permissões do usuário; o que o contém é a rede ausente, o conjunto de capacidades vazio, os limites de recursos e a árvore de processos morta com ele. O `ActiveProcessLimit` do Windows não tem equivalente por processo.
- **Implicação de instalação**: distribuições que restringem usuário namespaces sem privilégio exigem habilitá-los para o engine (Fedora 43 vem habilitado: `user.max_user_namespaces` = 45837). A mensagem `PARSER_SANDBOX_UNAVAILABLE` deve ser exibida ao usuário com essa causa (F5).

## Fora de escopo desta decisão

Não altera código, scripts nem contratos. `README.md` e `docs/INSTALL_WINDOWS.md` têm um aviso apontando para este ADR; o conteúdo de instalação Windows foi mantido como histórico, sem suporte, até as fases que implementarem o fluxo Linux.
