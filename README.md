# Evidra-zotero

Evidra organiza cadernos de pesquisa dentro do Zotero: seleção de fontes, busca local, evidências com texto original, matriz de extração revisada por pessoas, triagem, síntese, auditoria e exportação portátil.

**Em desenvolvimento.** Este repositório ainda não contém uma versão completa pronta para uso. A implementação segue a [especificação aprovada](docs/SPEC.md) e o [plano M0–M7](docs/IMPLEMENTATION_PLAN.md). O [estado atual](docs/STATE.md), o [relatório de verificações](docs/TEST_REPORT.md) e a [matriz de aceitação](docs/ACCEPTANCE_MATRIX.md) distinguem código implementado, testes controlados e validação nativa.

O alvo é Windows x64 com Zotero 10.0.x a partir de 10.0.1. A interface usa TypeScript/React; o engine usa Python 3.12, FastAPI e SQLite. O pacote Windows inclui seu runtime: o usuário final não precisa instalar Python, Node, Docker ou manter um terminal aberto. Modelos e arquivos da biblioteca não fazem parte da distribuição.

Consulte [instalação Windows](docs/INSTALL_WINDOWS.md), [privacidade e limites](docs/PRIVACY_AND_LIMITS.md) e [licenças](docs/THIRD_PARTY_NOTICES.md). Instale o XPI, extraia o ZIP completo e selecione `engine-manifest.json` na integração. A conferência dos arquivos precede a autorização do executável; hashes não equivalem a assinatura digital.

Para desenvolver, use Node/npm e uv com Python 3.12. Execute na raiz:

```powershell
npm ci
uv sync --project services/engine --frozen
npm run typecheck
npm test
uv run --project services/engine ruff check services/engine
uv run --project services/engine pytest services/engine/tests
uv run --project services/engine mypy --config-file services/engine/pyproject.toml services/engine/src/evidra
npm run generate:contracts
npm run build:plugin
```

`scripts/check.ps1` executa essa sequência e grava relatórios JSON e logs completos em `.local/checks/`. `scripts/check.sh` oferece a mesma seleção; testes Python residem em `services/engine/tests`, separados dos testes TypeScript. `scripts/dev.ps1` prepara dependências declaradas e monta o XPI. `scripts/package.ps1` produz uma pasta nova em `.local/packages/` contendo XPI, ZIP Windows, manifestos, `SHA256SUMS.txt`, notices e documentação, com captura dos bytes usados antes e depois do build. Nenhum comando publica uma release.

O smoke do pacote é executado com `uv run --project services/engine python scripts/smoke-package.py <pasta-do-pacote>` em dados descartáveis. O processo testado recebe `PATH` restrito ao System32. Isso verifica o runtime congelado neste computador e não substitui um teste em Windows limpo nem o fluxo nativo dentro do Zotero.

O benchmark reproduzível usa `scripts/benchmark.py --hardware <recibo-json>`. São 1.000 fontes e 50.000 páginas curtas sintéticas, indexadas pela implementação real; vetores aleatórios com seed 7 medem a busca em CPU sem alegar qualidade semântica. Os resultados e as lacunas de aceitação ficam no relatório de testes.

O arquivo [updates.json](updates.json) é o manifesto HTTPS exigido pelo Zotero. Sua lista de atualizações está vazia; nenhum release ou download é oferecido por ele.

Não instale os artefatos de desenvolvimento em uma biblioteca pessoal. Os testes nativos deste projeto usam perfil e dados sintéticos separados.
