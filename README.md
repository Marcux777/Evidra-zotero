# Evidra-zotero

Evidra é um projeto de cadernos de pesquisa dentro do Zotero, com um engine local para organizar fontes, evidências e decisões humanas.

**Em desenvolvimento.** Este repositório ainda não contém uma versão completa pronta para uso. A implementação segue a [especificação aprovada](docs/SPEC.md) e o [plano M0–M7](docs/IMPLEMENTATION_PLAN.md). O [estado atual](docs/STATE.md), o [relatório de verificações](docs/TEST_REPORT.md) e a [matriz de aceitação](docs/ACCEPTANCE_MATRIX.md) distinguem código implementado, testes controlados e validação nativa.

O alvo é Windows x64 com Zotero10.0.x a partir de10.0.1. A interface usa TypeScript/React; o engine usa Python3.12, FastAPI e SQLite. A distribuição final deverá incluir o runtime necessário ao usuário. Modelos e arquivos da biblioteca não fazem parte do repositório.

O arquivo [updates.json](updates.json) é o manifesto HTTPS exigido pelo Zotero. Sua lista de atualizações está vazia; nenhum release ou download é oferecido por ele.

Não instale os artefatos de desenvolvimento em uma biblioteca pessoal. Os testes nativos deste projeto usam perfil e dados sintéticos separados.
