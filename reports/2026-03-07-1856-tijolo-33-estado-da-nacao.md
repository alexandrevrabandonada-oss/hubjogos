# Estado da Nacao - Tijolo 33

Data: 2026-03-07 18:56
Status: concluido

## 1) Diagnóstico do estado anterior

Estado de entrada (apos Tijolo 32):
- Front-stage com preview vivo, card inteiro clicavel, replay prominente e recomendacoes cross-game.
- Instrumentacao de cliques e intents estava forte, mas com leitura ainda superficial para decisao de produto/campanha.
- `/estado` mostrava sinais de conversao e replay, sem separacao clara entre clique bonito e jogo real.
- Comandos beta (`beta:snapshot`, `beta:export`, `beta:circulation-report`, `beta:distribution-report`) ainda sem camada formal de efetividade.

Risco identificado:
- Concluir cedo demais com base em CTR/click sem confirmar start efetivo.

## 2) Definicao de run efetiva (Tijolo 33)

Conceitos aplicados:
- `effective_run_start`: click de entrada (`card_full_click`) seguido por start/input valido (`game_start`, `arcade_run_start`, `first_interaction_time`, `arcade_first_input_time`) em janela curta.
- `effective_replay`: `replay_after_run_click`/`replay_click` seguido por novo start no mesmo jogo em janela curta.
- `effective_cross_game_start`: `next_game_after_run_click`/`next_game_click` seguido de start do jogo de destino em janela curta.

Janelas aplicadas:
- Run efetiva: 60s
- Replay efetivo: 60s
- Cross-game efetivo: 90s

## 3) Implementacao principal

Arquivos chave:
- `lib/analytics/effective-runs.ts`: nova camada de analise de efetividade com scorecards e warnings de amostra.
- `lib/analytics/events.ts`: uniao de tipos atualizada com eventos de conversao do Tijolo 32.
- `lib/analytics/metrics.ts`: `MetricsSnapshot` ampliado com `effectiveRuns` para local e supabase.
- `app/estado/page.tsx`: novos blocos de leitura de conversao real, replay efetivo, cross-game efetivo, top jogos e warnings de baixa amostra.
- `tools/effective-runs-utils.js`: util compartilhado para scripts operacionais.
- `tools/beta-export.js`: inclui `effectiveRuns` no export e passa a expor `buildExport` para reuso.
- `tools/beta-snapshot.js`: inclui run efetiva no snapshot (json/md).
- `tools/beta-circulation-report.js`: inclui scorecards e pontes de cross-game efetivo.
- `tools/beta-distribution-report.js`: inclui secao de distribuicao guiada por run real e resumo no JSON.
- `tools/beta-campaign-brief.js`: passa a usar `buildExport('7d')` e inclui leitura de run/replay/cross-game efetivo e direcao quick->arcade vs arcade->quick.
- `lib/games/recommendations.ts`: recomendacoes pós-run refinadas com peso por evidencia leve local de clique->start efetivo.

## 4) Scorecards novos de conversao real

Scorecards implantados (com status):
- Preview -> Play efetivo
- Card click -> Run efetivo
- Replay efetivo
- Next-game click -> Cross-game efetivo
- Quick -> Arcade efetivo
- Arcade -> Quick efetivo

Estados utilizados:
- `insufficient_data`
- `monitoring`
- `directional_signal`
- `useful_signal`

## 5) Melhorias em /estado

Adicoes no cockpit:
- Preview vs play efetivo com status de amostra.
- Replay efetivo por jogo (tabela top).
- Cross-game efetivo por direcao e pontes mais fortes (de -> para).
- Jogos que mais puxam run real.
- Warnings de baixa amostra explicitos.

Resultado operacional observado na janela atual (7d):
- Camada funcionando corretamente.
- Amostra ainda insuficiente para sinais fortes de efetividade no recorte atual.

## 6) Melhorias em reports/export/brief

Atualizados:
- `beta:snapshot`
- `beta:export`
- `beta:circulation-report`
- `beta:distribution-report`
- `beta:campaign-brief`

Todos agora incluem:
- run efetiva
- replay efetivo
- cross-game efetivo
- quick -> arcade vs arcade -> quick
- recomendacoes orientadas por run real (quando houver amostra)

## 7) Ajustes de recomendacao e UX

Recomendacao pós-run (sem redesign):
- Mantem serie/territorio/formato como base.
- Adiciona ajuste por historico local de clique->start efetivo por rota sugerida.
- Reduz peso de recomendacoes com clique sem start efetivo.

Ajustes de UX orientados por dados:
- Nenhuma reordenacao estrutural forcada neste ciclo por falta de amostra robusta.
- Decisao: adiar ajustes fortes de ordem de cards/CTAs ate consolidar 7-14 dias.

## 8) Validacao tecnica

Executado:
- `npm run lint` -> PASSOU
- `npm run type-check` -> PASSOU
- `npm run test:unit` -> PASSOU (15/15)
- `npm run build` -> PASSOU
- `npm run verify` -> PASSOU
- `npm run test:e2e` -> PASSOU (15/15) apos ajuste do assert de heading em `tests/e2e/core-flows.spec.ts`

Observacoes de build:
- Warnings de setup Sentry/instrumentation preexistentes permaneceram.
- Sem regressao funcional nas 5 experiencias jogaveis.

## 9) Riscos restantes

- Amostra de efetividade ainda baixa na janela atual para concluir vencedor de direcao cross-game.
- Risco de overfitting de distribuicao se houver mudanca de ordem antes de consolidar 7-14 dias.
- Dependencia de qualidade de timestamps/eventos para leitura de janela curta.

## 10) Recomendacao explicita

Decisao de produto para agora:
- Abrir novo arcade: NAO.
- Abrir formato medio: NAO.
- Acao recomendada: manter coleta por mais 7-14 dias com distribuicao guiada por run real e monitoramento dos scorecards de efetividade.

Justificativa:
- A infraestrutura de leitura real foi concluida e validada tecnicamente.
- O recorte atual ainda aponta `insufficient_data` na camada de efetividade em pontos criticos.
- Avanco de escopo agora aumentaria risco de decisao superficial e diluicao de sinal.

## 11) Critérios de sucesso do tijolo

- 5 jogos continuam funcionando: atingido.
- Leitura clara de run efetiva: atingido.
- Replay efetivo mensuravel: atingido.
- Cross-game efetivo mensuravel: atingido.
- `/estado` e briefs mais uteis para campanha: atingido.
- Decisao de distribuicao menos superficial: atingido.
- Lint/type-check/build/verify passando: atingido.

Ultima atualizacao: 2026-03-07 18:56 (Tijolo 33)
