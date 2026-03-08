# T36C-B - Fechamento Final

Data: 2026-03-08 13:25
Status: concluido

## Resumo executivo

T36C foi encerrado com fechamento operacional completo do `mutirao-do-bairro` como segundo arcade premium em validacao seria.

Resultados-chave:
- camada de leitura Mutirao integrada em dashboard e reports operacionais;
- suite de testes reforcada e verde;
- gates de qualidade final passando sem regressao observada nas linhas existentes.

## Entregas por fase

## Fase 7b - Integracao de reports

Implementado bloco Mutirao em:
- `tools/beta-export.js`
- `tools/beta-snapshot.js`
- `tools/beta-circulation-report.js`
- `tools/mutirao-report-utils.js` (novo util de agregacao)

Metricas exportadas:
- runs
- collapse rate
- avg score
- avg pressure peak
- avg duration
- replay rate
- post-run CTA clicks
- action breakdown/diversity
- event breakdown
- pressure milestones
- comparacao com Tarifa Zero RJ

Validacao operacional:
- `npm run beta:export` -> gerado `reports/exports/beta-export-2026-03-08T16-16-44.json`
- `npm run beta:snapshot` -> gerado `reports/snapshots/beta-snapshot-2026-03-08T16-16-45.md` com secao Mutirao
- `npm run beta:circulation-report` -> gerado `reports/circulation/beta-circulation-2026-03-08T16-16-47.md` com secao Mutirao

## Fase 8 - Unit tests

Arquivo:
- `tests/unit/mutirao-do-bairro.test.ts`

Cobertura:
- inicializacao
- transicoes de fase
- pressao/milestones
- eventos
- colapso
- acoes reparar/defender/mobilizar/mutirao
- robustez

Resultado:
- suite total `test:unit` = 43/43 passando

## Fase 9 - E2E premium

Arquivo:
- `tests/e2e/mutirao-do-bairro-slice.spec.ts`

Validacoes:
- smoke desktop
- smoke mobile
- premium assets
- outcome premium

Resultado:
- suite total `test:e2e` = 25/25 passando

## Fase 11 - Documentacao

Atualizados:
- `README.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
- `docs/linha-arcade-da-campanha.md`
- `public/arcade/mutirao-do-bairro/README.md`

Pontos documentados:
- status T36C concluido
- camada operacional Mutirao em reports
- inventario local premium (14 assets do pack principal)
- fallback, HUD, overlays, smoke/e2e e proximos passos

## Fase 12 - Gates finais

Executados com sucesso:
- `npm run lint` -> sem warnings/erros
- `npm run type-check` -> sem erros
- `npm run build` -> build ok
- `npm run verify` -> ok
- `npm run test:unit` -> 43/43
- `npm run test:e2e` -> 25/25

## Riscos residuais

- amostra de telemetria de Mutirao ainda em maturacao para leitura de produto forte em 7-14 dias;
- score medio pode aparecer baixo/zero em contextos onde metadados historicos estao incompletos (legado), sem comprometer integridade do pipeline.

## Recomendacao final

T36C-B encerrado.

`mutirao-do-bairro` esta pronto como arcade premium em validacao seria, com observabilidade operacional, testes robustos e gates verdes.

Proximo passo recomendado: T37 focado em coleta/maturacao e decisoes com amostra minima.
