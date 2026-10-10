# Ambiente de desenvolvimento Linux — recibo da Fase 1

Medido em 2026-10-08, no branch `linux-port` (base `29bf3ab9feb96e7d0fda432d4dc63d773bb3c1b7`, ver ADR 0004). Somente leitura: nada foi instalado, nenhum perfil ou instalação existente foi alterado. Todo item marcado **PENDENTE** exige autorização antes de ser executado; o Zotero 10.0.6 foi autorizado e instalado em 2026-10-10.

## Recibo (medido)

| Item | Valor |
|---|---|
| SO / kernel | Fedora Linux 43 (Workstation), 7.1.5-101.fc43.x86_64 |
| CPU virtualização / KVM | 16 threads com `vmx`/`svm`; `/dev/kvm` presente |
| Memória / disco | 11 GiB de RAM; `/` com 122 GiB livres de 476 GiB |
| node / npm | v22.22.2 / 10.9.7 (`engines` exige node >= 22.12.0: atendido) |
| uv / git | 0.9.5 / 2.55.0 |
| Pythons (uv, instalados) | 3.12.12 (`~/.local/share/uv/python/…3.12.12…`), 3.13.9, 3.14.6 (sistema, `/usr/bin/python3.14`). `.python-version` do projeto pede 3.12: **atendido, não há o que instalar** |
| Dependências do projeto | `npm ci` e `uv sync --frozen` executados (62 pacotes Python, 130 pacotes Node) |
| Secret Service | serviço `org.freedesktop.secrets` ativo (gnome-keyring-daemon, sessão do usuário). No venv do projeto: `keyring.get_keyring()` → `keyring.backends.SecretService.Keyring (priority: 5)`. `secret-tool` presente (não aceita `--version`; imprime o uso). Leitura/escrita real de um segredo **não** foi testada |
| GPU | NVIDIA GeForce MX350, driver 580.173.02, 2048 MiB de VRAM (`nvidia-smi`); Intel Iris Plus G1 integrada. GPU não é pré-requisito |
| Ollama | **ausente** (`command -v ollama` vazio; serviço `ollama` inativo; nada escutando em 11434). Logo `qwen3:4b` e `qwen3-embedding:0.6b` também ausentes |
| Zotero (Flatpak) | `org.zotero.Zotero` **10.0.6**, origem flathub, instalação `system`, commit `f4533e2c0b2d0859a6cf1fb93ccc701818d005636832b1ca75197ca3099dab39`. Dentro do alvo 10.0.x |
| Zotero (`/opt`) | `/usr/local/bin/zotero` → `/opt/zotero/zotero`, **Version=9.0.6**, BuildID 20260707150941. **Fora do alvo** 10.0.x; não deve ser usado nos testes |
| Perfil pessoal | `~/.zotero/` existe. **Não foi aberto nem alterado.** Nunca usar a biblioteca pessoal |
| Processos Zotero ativos | nenhum no momento da medição |
| Dados do Evidra | `XDG_DATA_HOME` vazio; `~/.local/share/Evidra` não existe (fallback do SPEC §3: `~/.local/share/Evidra/profiles/<id>`) |
| Harness nativo antigo | **ausente**: não existem `.local/native-smoke`, `task12` nem `http-bounds` (Fase 0 já havia buscado em `~`, `/run/media`, `/mnt`). O `.local/` do checkout contém só um `task11/` vazio criado pelo teste `exports-bridge` |

### Modelos locais
Obsoleto pelo [ADR 0005](adr/0005-jev-sole-analysis-provider.md): o Jev (TypeSafe) é o provedor único de análise e `qwen3:4b`/`qwen3-embedding:0.6b` não fazem mais parte do ambiente. As linhas medidas de Ollama e GPU acima ficam como registro do host, sem pendência associada. A chave do Jev fica só no Secret Service (`service=typesafe`).

### Comandos executados (todos de leitura, exceto os do projeto)
`node --version`, `npm --version`, `uv --version`, `git --version`, `uv python list --only-installed`, `flatpak list | grep -i zotero`, `flatpak info org.zotero.Zotero`, `which zotero`, `ls -l /usr/local/bin/zotero`, `grep Version /opt/zotero/app/application.ini`, `pgrep -a zotero`, `secret-tool --version`, `busctl --user list | grep secrets`, `uv run python -c "import keyring; print(keyring.get_keyring())"`, `nvidia-smi --query-gpu=…`, `command -v ollama`, `systemctl is-active ollama`, `ss -ltn | grep 11434`, `df`, `free`. Antes, para as medições da Fase 0: `npm ci`, `uv sync --frozen`, `tsc`, `vitest`, `pytest`, `ruff`, `mypy`.

## Zotero 10.0.6 instalado pelo tarball oficial (2026-10-10)

Autorizado pelo usuário. Instalado em `~/opt/zotero-10`; `/opt/zotero` (9.0.6) e o Flatpak (10.0.6) não foram tocados. O Zotero **não foi executado** e nenhum perfil foi criado.

| Item | Valor |
|---|---|
| URL | `https://download.zotero.org/client/release/10.0.6/Zotero-10.0.6_linux-x86_64.tar.xz` (HTTP 200; `.tar.bz2` responde 403) |
| Tamanho | 118.303.588 bytes (113 MiB) |
| SHA-256 | `246c2574a9ac526abeaf3027ffd22fc45536a5ab25f227bb1df932fca9cedd63` (calculado localmente; o Zotero não publica checksum no mesmo caminho) |
| `application.ini` | `Version=10.0.6`, `BuildID=20261007153824` |
| Conteúdo | 102 entradas, todas sob `Zotero_linux-x86_64/`, sem caminho absoluto nem `..` (conferido antes de extrair) |
| Executável | `~/opt/zotero-10/Zotero_linux-x86_64/zotero` |
| Tarball | mantido em `~/opt/zotero-10/Zotero-10.0.6_linux-x86_64.tar.xz` |

## PENDENTE de autorização

1. **Perfil de teste isolado do Zotero**: não criado. Procedimento proposto, a executar só após autorização: diretório novo e vazio fora de `~/.zotero`, iniciar com `-no-remote -profile <novo>` e `-datadir <novo>` (flags a confirmar na ajuda do Zotero instalado), conferir `ProfD` e o diretório de dados reais **antes** de qualquer escrita e abortar se algum apontar para `~/.zotero` ou `~/Zotero`. Biblioteca sintética apenas.
2. `uv python install 3.12`: **dispensado**, o Python 3.12.12 já está instalado.

## Aceite da Fase 1

- Recibo com versões, caminhos, estado do Secret Service e da GPU: acima. Tarball do Zotero 10.0.6: baixado e verificado (seção acima). Modelos locais: obsoletos pelo ADR 0005.
- Harness nativo antigo: registrado como ausente.
