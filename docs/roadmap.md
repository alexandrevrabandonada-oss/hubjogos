# Roadmap - Hub de Jogos da Pre-Campanha

## Linha do tempo

- Tijolo 01 a 12 ✅ fundacao, engines, ciclo de aprendizado e consolidacao remota
- Tijolo 13 ✅ operacao interna leve (triagem prioritaria + cockpit)
- Tijolo 14 ✅ governanca minima e auditabilidade
- Tijolo 15 a 20 ✅ automacao e cockpit temporal operacional

## Tijolo 21 (concluido)

Objetivo:
- transformar a base temporal em cockpit diario realmente util

Entregas:
1. linha de jogos da campanha formalizada (doc mestre)
2. taxonomia oficial por tempo, linha editorial, serie e escopo territorial
3. home/explorar reposicionados como vitrine da campanha
4. camada de series/colecoes aplicada no produto
5. reforco de presenca da pre-campanha sem panfleto duro
6. leitura editorial em `/estado` por serie, territorio e tipo
7. blueprints de plataforma/RPG/tycoon publicados

## Riscos monitorados apos T20

- falsa leitura em janela com amostra muito baixa
- experimento ativo sem superficie com trafego
- backlog de feedback prioritario em ciclos de alta demanda
- dependencia de dados remotos para sinais de tempo real

## Guardrails

- sem nova engine
- sem auth obrigatoria para jogar
- sem integracao Slack/email neste ciclo
- sem painel admin enterprise

## Tijolo 22 (concluido)

Objetivo:
- criar base visual reutilizavel para crescimento organizado da campanha

Entregas:
1. avatar oficial de Alexandre Fonseca como personagem principal recorrente
2. card final universal compartilhavel em todos os jogos
3. pipeline de assets organizado (`public/campaign/`, `docs/assets/`)
4. componentes reutilizaveis (`CampaignAvatar`, `FinalShareCard`)
5. tracking de card final e avatar
6. leitura editorial em `/estado` para sinais de adocao

## Riscos monitorados apos T22

- asset V1 e placeholder tecnico, precisa refinamento profissional futuro
- card final universal precisa validacao de uso e compartilhamento real
- tracking de card/avatar ainda sem historico para tendencias
- dependencia de designer/ilustrador para evoluir asset V1 para V2

## Guardrails

- sem nova engine
- sem RPG/plataforma/tycoon completo implementado ainda
- sem auth obrigatoria para jogar
- sem integracao Slack/email neste ciclo
- sem painel admin enterprise

## Tijolo 23 (concluido)

Objetivo:
- evoluir avatar para V2 reconhecivel, fortalecer card final com QR e validar pipeline com novo minigame quick

Entregas:
1. avatar V2 com expressoes (`neutral`, `smile`, `determined`) e variante com oculos
2. `CampaignAvatar` evoluido com contrato de expressao/oculos/fullBody futuro
3. `FinalShareCard` com QR code dinamico de reentrada
4. tracking adicional para QR, avatar V2 e minigame quick
5. novo minigame quick `custo-de-viver` integrado ao catalogo real
6. `/estado` atualizado para leitura de QR + avatar V2 + quick completion/replay

## Tijolo 24 (concluido)

Objetivo:
- validar de forma disciplinada a linha quick da campanha com comparacao real e baixo risco

Entregas:
1. segundo quick game real `quem-paga-a-conta` integrado ao runtime de quiz
2. experimento A/B `final-card-qr-code` com variantes `with-qr`/`without-qr`
3. refinamento do `FinalShareCard` para funcionar com e sem QR
4. `/estado` com secao leve dedicada a quick line
5. snapshots/exports/circulation report com leitura quick vs quick, serie/territorio e QR summary
6. SQL operacional para views quick (`supabase/tijolo-24-quick-line-validation.sql`)

## Tijolo 25 (concluido)

Objetivo:
- formalizar o motor ideologico dos jogos e consolidar leitura da linha quick com foco em solucoes coletivas

Entregas:
1. documento mestre `docs/motor-ideologico-dos-jogos.md`
2. taxonomia ideologica no catalogo (`politicalAxis`, `collectiveSolutionType`, `commonVsMarket`, `campaignFrame`)
3. terceira experiencia quick `cidade-em-comum` integrada ao runtime real
4. outcomes/CTAs com linguagem de organizacao coletiva (menos personalismo)
5. tracking com metadata ideologica + evento `ideological_axis_signal`
6. `/estado` com leitura por eixo politico e solucao coletiva
7. snapshot/export/circulation com recortes ideologicos na linha quick

## Tijolo 26 (concluido)

Foco executado:
1. comparacao real entre `custo-de-viver`, `quem-paga-a-conta` e `cidade-em-comum`
2. scorecard de grude por quick, serie e territorio
3. leitura de eixo politico lider e territorio mais responsivo no `/estado`
4. readout de experimento QR com estado (`cedo-demais`, `monitorando`, `sinal-direcional`)
5. snapshots/exports/circulation report com ranking e avisos de baixa amostra

## Tijolo 27 (concluido)

Foco executado:
1. plano operacional de distribuicao com metas minimas por janela (7d, 30d, all)
2. status de coleta (`coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`)
3. report de distribuicao operacional (`npm run beta:distribution-report`)
4. `/estado` ampliado com barras de progresso e avisos de insuficiencia
5. criterio formal de "pronto para Tijolo 28" baseado em amostra honesta

## Tijolo 28 (concluido)

Foco executado:
1. sistema de links de campanha rastreaveis com UTMs (lib/campaign-links/)
2. pacotes de distribuicao por canal (Instagram, WhatsApp, TikTok)
3. pacotes por territorio (estado-rj, volta-redonda) com metas operacionais
4. operacao semanal documentada (roteiro de 14 dias)
5. script de brief semanal (`npm run campaign:brief`)
6. melhorias no `beta:distribution-report` (sugestoes acionaveis)
7. bloco "O que distribuir agora" em `/estado`
8. branding eleitoral reforçado em todos os materiais de distribuicao

## Tijolo 29 (concluido)

Foco executado:
1. abertura da linha arcade com runtime reutilizavel em canvas/html5
2. nova rota dedicada `/arcade/[slug]` sem quebrar a linha quick
3. primeiro vertical slice jogavel: `Tarifa Zero RJ - Corredor do Povo`
4. integracao de campanha no loop (avatar, marca, CTA, card final universal com QR)
5. telemetria dedicada da linha arcade + leitura em `/estado`
6. comparativo quick vs arcade para orientar priorizacao do proximo ciclo

## Tijolo 30 (concluido)

Foco executado:
1. consolidacao da linha arcade com 2 jogos reais diferenciados em loop:
	- `Tarifa Zero RJ` (lane-based 55s. collect/avoid)
	- `Passe Livre Nacional` (positioning 90s, coordination/defense)
2. melhorias de game feel em Tarifa Zero:
	- smooth meter transitions (visao continua vs oscilante)
	- combo indicator ativo em tela
	- nova entidade rara "chance" nos ultimos 15s
	- feedback visual aprimorado em coleta/bloqueio
3. segundo arcade completo com mecanica distinta e telemetria integrada
4. documentacao de game feel com 8 dimensoes mensuráveis (`docs/game-feel-arcade.md`)
5. comparacao per-arcade em `/estado` com breakdown de runs, replay rate, first input, score avg
6. validacao tecnica completa: lint, type-check, test:unit, build, verify - todos passando

## Tijolo 31 (concluido)

Objetivo:
- reposicionar a experiencia publica para parecer primeiro um portal de jogos de campanha: clicavel, imediato e com arcade em destaque.

Entregas:
1. home arcade-first com CTA de jogo acima da dobra e bloco `Jogue agora` com metadata clara (tipo, duracao, serie, territorio, CTA).
2. quick-vs-arcade chooser com tracking de preferencia declarado.
3. explorar reposicionado como catalogo jogavel (spotlight arcade + quick strip + filtros por tipo/serie/territorio).
4. `GameCard` com leitura mais direta para clique e destaque visual para arcade.
5. tracking front-stage implementado (`home_*`, `above_fold_game_click`, `manifesto_expand_click`, `explorar_*`, `arcade_vs_quick_preference`).
6. `/estado` com bloco dedicado de leitura front-stage (CTR arcade vs quick, cliques above-fold, preferencia e uso de filtros).
7. validacao tecnica completa: lint, type-check, test:unit, build, verify, test:e2e - todos passando.

## Tijolo 32 (concluido)

Objetivo:
- transformar a home arcade-first em uma superficie mais impulsiva e jogavel, reduzindo friccao entre descoberta e jogo, aumentando replay e fortalecendo reentrada cross-game.

Entregas:
1. preview vivo nos cards com animacoes CSS leves (pulso badge arcade, glow arcade feature, bounce icon, slide quick):
   - minimiza latencia perceptiva entre clique no card e entrada no jogo
   - sem assets pesados (GIF/video), apenas CSS e z-indexes
   - mobile-compatible com suporte touch
2. reducao de friccao de launch:
   - card inteiro clicavel com zona expandida
   - CTAs diretos e acao-orientados ("Jogar agora", "Correr agora", "Organizar agora")
   - feedback visual progressivo no hover (transform, border, cor)
3. blocos visuais reforçados:
   - "Jogue agora": title e description mais impulsivos, menos explicativos
   - "Explorar": copy focado em acao, reducao de camadas editoriais na superficie
4. sistema de recomendacao de proximos jogos (`lib/games/recommendations.ts`):
   - prioriza mesma serie, formato distinto
   - fallback a territorio distinto ou formato oposto
   - 3 recomendacoes com explicacao clara ("Mesma serie, entrada rapida", etc)
5. replay reforçado:
   - botao de replay prominente no outcome com visual de CTA primario
   - 3 next-games sugeridos com card visual e CTA direto
   - ordem estrategica (replay primeiro, depois proximos games)
6. tracking de conversao completo:
   - `card_preview_interaction` (hover/focus)
   - `card_full_click` (clique na area expandida)
   - `click_to_play_time` (latencia percebida click → first input)
   - `replay_after_run_click` e `next_game_after_run_click` (pos-run behavior)
   - `quick_to_arcade_click` e `arcade_to_quick_click` (cross-game conversao)
7. `/estado` com bloco "Conversao e Replay (Tijolo 32)":
   - 11 sinais de conversao: preview CTR, click-to-play events, replay rate post-run, next game rate, cross-game conversao
   - sem inflar stack, apenas leitura direta dos eventos novos
8. documentacao atualizada em README, roadmap, tijolos, linha-arcade e linha-de-jogos.
9. validacao tecnica completa: lint, type-check, test:unit, build, verify - todos passando.

## Tijolo 35D (concluido)

Objetivo:
- transformar os concepts do Tarifa Zero RJ em assets reais integrados ao runtime, sem abrir novo jogo e sem reescrever a lógica central.

Entregas:
1. pipeline local consolidado em `public/arcade/tarifa-zero/` com pastas de `bg`, `player`, `transport`, `obstacles`, `pickups` e `ui`.
2. asset set `corredor-do-povo-v1` e versão visual `T35D-assets-v1` publicados e expostos no runtime.
3. background em camadas com skyline industrial/urbano e corredor vertical integrado ao canvas.
4. player/ônibus amarelo estilizado, pickups e obstáculos em SVG com fallback canvas preservado.
5. HUD principal e feedback de fase/evento reforçados com assets reais.
6. pós-run premium com score, fase, combo, frame final e CTA de replay/próximo jogo.
7. `/estado` ampliado com indicador simples de versão visual por arcade.
8. documentação operacional e artística atualizada para o pass de produção.

## Próximo ciclo (Tijolo 34)

Foco sugerido:
1. transformar a camada de efetividade do Tijolo 33 em **operação prática de campanha** sem abrir novo escopo de produto.
2. segmentar efetividade por **canal** (`utm_source`) e **território** (derivado do slug) para priorizar distribuição semanal.
3. tornar reports operacionais (`beta:distribution-report`, `beta:campaign-brief`) **objetivamente acionáveis**: dizer qual jogo empurrar primeiro, qual canal funciona melhor, qual território tem melhor sinal de run real.
4. incluir **regra explícita de não-pivot** quando scorecards estão em `insufficient_data` (sem interpretar vencedor quick vs arcade com amostra insuficiente).
5. atualizar `/estado` para exibir efetividade segmentada por canal e território.
6. publicar `docs/plano-distribuicao-por-efetividade.md` com roteiro de decisão semanal guiado por run real.
7. manter guardrails: sem novo jogo, sem nova engine, sem auth/CMS/admin.

## Tijolo 33 (concluído)

Objetivo cumprido:
- transformar sinais de front-stage em leitura acionável de comportamento real para campanha e produto.

Entregas:
1. camada de run efetiva implementada (`lib/analytics/effective-runs.ts`) com:
   - `effective_run_start`
   - `effective_replay`
   - `effective_cross_game_start`
2. scorecards de conversão real com status de maturidade de amostra:
   - `insufficient_data`, `monitoring`, `directional_signal`, `useful_signal`
3. `/estado` ampliado com leitura de:
   - preview -> play efetivo
   - replay efetivo por jogo
   - cross-game efetivo por direção
   - pontes de jogo que realmente puxam novo start
   - warnings de baixa amostra
4. reports operacionais atualizados:
   - `beta:snapshot`
   - `beta:export`
   - `beta:circulation-report`
   - `beta:distribution-report`
   - `beta:campaign-brief`
5. recomendação pós-run refinada com ajuste por evidência leve de start efetivo histórico.

Recomendação para o próximo ciclo:
- manter coleta por 7-14 dias antes de qualquer decisão de abrir novo arcade ou formato médio.

## Tijolo 34 (concluído)

Objetivo cumprido:
- transformar efetividade em operação de campanha acionável por **jogo / canal / território** sem expandir escopo de produto.

Entregas:
1. segmentação de efetividade por **canal** e **território** em:
   - `lib/analytics/effective-runs.ts` (análise contextual com sessões/slug).
   - `lib/analytics/metrics.ts` (passa contexto de sessão e mapa de território).
   - `tools/effective-runs-utils.js` (segmentação operacional JS).
2. reports operacionais acionáveis:
   - `tools/beta-distribution-report.js`: recomendação semanal objetiva com jogo 1º push, jogo 2º clique, canal prioritário, território promissor, direção quick↔arcade **ou regra de não-pivot**.
   - `tools/beta-campaign-brief.js`: brief semanal com decisões por efetividade + alerta de baixa amostra.
3. dashboard `/estado` ampliado com blocos:
   - "Run efetiva por canal"
   - "Run efetiva por território"
4. novo plano operacional: `docs/plano-distribuicao-por-efetividade.md`.
5. atualização de `README.md`, `docs/tijolos.md`, `docs/roadmap.md`.

Recomendação para o próximo ciclo:
- executar rotina de distribuição semanal por 14 dias com plano de efetividade.
- validar se scorecards atingem `directional_signal` de forma consistente.
- retomar formato médio (Tijolo 29) apenas após confirmação de narrativa central com massa crítica de run real.

Última atualização: 2026-03-07 (Tijolo 34)
