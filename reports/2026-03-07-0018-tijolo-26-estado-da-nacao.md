# Estado da Nacao - Tijolo 26

Data: 2026-03-07 00:18
Status: concluido

## Diagnostico do estado anterior (entrada do Tijolo 26)

Estado de entrada (apos Tijolo 25):
- motor ideologico formalizado e catalogado
- 3 quick games ativos (`custo-de-viver`, `quem-paga-a-conta`, `cidade-em-comum`)
- leitura ideologica no `/estado`
- snapshot/export/circulation com recortes ideologicos

Fragilidades na entrada:
- comparacao quick ainda dispersa entre throughput, circulacao e eventos
- ausencia de scorecard unico de grude por quick/serie/territorio
- leitura territorial sem ranking operacional direto para priorizacao
- readout QR sem classificacao explicita de estado (`cedo-demais`/`monitorando`/`sinal-direcional`)

## Entregas do Tijolo 26

1. Consolidacao comparativa da linha quick
- `lib/analytics/metrics.ts`: novo bloco `quickInsights` no snapshot de metricas
- comparacao lado a lado com:
  - views
  - starts
  - completions
  - replay
  - share
  - CTA pos-jogo
  - interacoes de card final
  - share page -> play click
  - QR performance
  - tempo ate primeira interacao

2. Scorecard de grude (heuristica explicita)
- pesos aplicados:
  - completionRate 30%
  - replayRate 20%
  - shareRate 20%
  - CTA pos-jogo 15%
  - share->play 10%
  - first interaction score 5%
- ranking gerado por quick, serie e territorio
- warning automatico para baixa amostra

3. Leitura por serie, eixo e territorio no `/estado`
- cards novos com:
  - ranking quick
  - ranking por serie (quick)
  - ranking por territorio (quick)
  - serie lider
  - eixo politico lider
  - territorio mais responsivo
- aviso explicito quando amostra e insuficiente

4. Readout QR refinado
- resumo por variante com estado:
  - `cedo-demais`
  - `monitorando`
  - `sinal-direcional`
- delta entre variantes exposto

5. Evolucao de snapshot/export/report
- `tools/circulation-utils.js`: agregados de priorizacao (quickRanking, rankedSeries, rankedTerritory, rankedPoliticalAxis, qrReadout, warnings)
- `tools/beta-snapshot.js`: secoes de ranking e aviso de amostra
- `tools/beta-export.js`: export com scorecards/quick insights estendidos
- `tools/beta-circulation-report.js`: relatorio comparativo com score de grude

6. Pequeno aprofundamento visual territorial
- `components/hub/GameCard.tsx`: labels territoriais/serie/eixo legiveis + ponte territorial local -> estado
- `app/play/[slug]/page.tsx`: reforco de leitura territorial na narrativa da pagina

7. Documentacao atualizada
- `README.md`
- `docs/arquitetura.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
- `docs/motor-ideologico-dos-jogos.md`
- `docs/linha-de-jogos-campanha.md`

## Comparacao real da linha quick (dados atuais)

Fonte operacional final: snapshot/circulation/export gerados em 2026-03-07 00:13.

Leitura observada:
- quick comparison: sem sessoes quick suficientes no recorte remoto atual
- ranking de grude: indisponivel por ausencia de amostra quick
- QR experimento:
  - with-qr: 38 sessoes, 2 qr views, 0 qr clicks, status `monitorando`
  - without-qr: 38 sessoes, 2 qr views, 0 qr clicks, status `monitorando`
  - delta: 0pp

Conclusao: o sistema de priorizacao foi entregue e esta operacional, mas a evidencia de tracao quick ainda e insuficiente para decisao forte neste recorte.

## Serie mais promissora (real)

Status real nesta janela:
- sem ranking empirico de serie quick por falta de amostra quick registrada nos agregados remotos

Decisao recomendada (provisoria, explicita):
- priorizar `serie-solucoes-coletivas` como serie de coleta e iteracao no Tijolo 27
- justificativa: alinhamento estrategico com motor ideologico + necessidade de gerar amostra valida para destravar decisao forte

## Territorio mais responsivo (real)

Status real nesta janela:
- sem territorio lider estatisticamente legivel no recorte quick atual

Decisao recomendada (provisoria, explicita):
- tensionar primeiro `estado-rj` (onde os quicks ideologicos ja estao posicionados no catalogo) para aumentar volume comparavel
- em paralelo, manter trilha de coleta em Volta Redonda para leitura local -> estadual

## Melhorias em /estado e exports

`/estado` agora mostra:
- quick comparado lado a lado
- score de grude
- ranking de quick/serie/territorio
- serie/eixo/territorio lideres
- warning de baixa amostra
- readout QR por variante com estado de experimento

Ops (`beta:snapshot`, `beta:export`, `beta:circulation-report`) agora incluem:
- comparacao quick com score de grude
- ranking por serie e territorio
- eixo politico lider
- QR readout com estado e delta
- alerta explicito quando nao ha amostra quick suficiente

## Validacao tecnica final

Comandos executados:
- `npm run lint` -> OK
- `npm run type-check` -> OK
- `npm run test:unit` -> OK (6 arquivos, 15 testes)
- `npm run build` -> OK
- `npm run verify` -> OK (52/52 checks)
- `npm run test:e2e` -> OK (15 passed)
- `npm run beta:snapshot -- --format=md` -> OK
- `npm run beta:export` -> OK
- `npm run beta:circulation-report -- --format=md` -> OK

Observacao:
- warnings de Sentry/Next instrumentation permanecem nao bloqueantes.

## Riscos restantes

- baixa amostra quick na base remota para ranking confiavel
- risco de overfitting narrativo se houver decisao forte antes de consolidar janela minima
- experimento QR ainda sem sinal direcional (delta 0pp com cliques zerados)

## Recomendacao explicita de priorizacao

1. Qual serie deve virar prioridade
- prioridade provisoria: `serie-solucoes-coletivas`
- motivo: coerencia estrategica + necessidade de gerar amostra comparavel rapidamente

2. Qual quick line deve crescer primeiro
- crescer primeiro a linha quick de organizacao coletiva (`cidade-em-comum` + conexoes com quicks de governanca/custo)
- meta: elevar replay/share/CTA com volume minimo para validar scorecard

3. Qual territorio deve ser tensionado primeiro
- primeiro: `estado-rj` (escala de distribuicao para coletar amostra)
- segundo: `volta-redonda` (controle territorial para comparar resposta local)

4. O que fica para o Tijolo 27
- consolidar amostra minima por quick/serie/territorio antes de decisao definitiva
- operar plano de distribuicao para destravar leitura de grude real
- transformar a serie lider em blueprint de formato medio (sem construir formato medio ainda)
- manter foco em priorizacao estrategica sem abrir auth/CMS/admin
