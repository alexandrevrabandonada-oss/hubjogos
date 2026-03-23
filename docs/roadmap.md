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

## Tijolo 37 (concluido)

Objetivo:
- consolidar a linha arcade como duelo comparavel real entre `tarifa-zero-corredor` e `mutirao-do-bairro`, com decisao oficial guiada por amostra minima.

Entregas:
1. scorecard comparativo oficial da linha arcade com seis dimensoes (runs, run end, replay, CTA, first input e engajamento).
2. camada de estado de decisao (`insufficient_sample`, `early_signal`, `directional_lead`, `candidate_flagship`, `ready_for_next_step`).
3. recomendacao explicita por janela (`arcade_a_leads`, `arcade_b_leads`, `technical_tie`, `insufficient_sample`).
4. secao dedicada no `/estado` para leitura estrategica da linha arcade.
5. propagacao do readout T37 para `beta:snapshot`, `beta:export`, `beta:circulation-report` e `beta:campaign-brief`.
6. guardrail mantido: sem abrir terceiro arcade, sem nova engine, sem auth/CMS/admin.
3. background em camadas com skyline industrial/urbano e corredor vertical integrado ao canvas.
4. player/ônibus amarelo estilizado, pickups e obstáculos em SVG com fallback canvas preservado.
5. HUD principal e feedback de fase/evento reforçados com assets reais.
6. pós-run premium com score, fase, combo, frame final e CTA de replay/próximo jogo.
7. `/estado` ampliado com indicador simples de versão visual por arcade.
8. documentação operacional e artística atualizada para o pass de produção.

## Tijolo 35E (concluido)

Objetivo:
- elevar o acabamento visual do Tarifa Zero RJ sem abrir novo jogo e sem alterar pesado a lógica de gameplay.

Entregas:
1. variantes dedicadas integradas no runtime para entidades compostas:
   - `obstacle-bloqueio-sequencia.svg`
   - `pickup-individualismo-cluster.svg`
2. fallback seguro preservado para todas as entidades em caso de falha de asset.
3. transição de fase (overlay premium curto) validada e mantida no fluxo da run.
4. final de run refinado com hierarquia visual melhor (score, fase, combo, meta visual e final card).
5. CTAs finais reordenados e reforçados: replay → próximo jogo → compartilhar → campanha.
6. versão visual atualizada para `T35E-premium-v7` com exposição no runtime e `/estado`.
7. smoke e2e específico do arcade executado (desktop + mobile viewport) com capturas em `reports/validation/`.

## Tijolo 36A (concluido)

Objetivo:
- abrir a proxima fase da linha arcade com pre-producao completa e organizada do proximo arcade forte, sem implementar ainda o jogo final.

Entregas:
1. diagnostico formal do estado premium do `tarifa-zero-corredor` e definicao de contraste obrigatorio para o proximo loop.
2. decisao explicita de rota: **A) novo arcade `mutirao-do-bairro`**.
3. documento mestre de conceito:
   - `docs/mutirao-do-bairro-game-concept.md`
4. systems design completo:
   - `docs/mutirao-do-bairro-systems-design.md`
5. art direction completa:
   - `docs/mutirao-do-bairro-art-direction.md`
6. pipeline de assets preparada:
   - `public/arcade/mutirao-do-bairro/README.md`
   - estrutura de pastas `player/entities/ui/bg`
7. plano de HUD, tela final, telemetria e vertical slice T36B documentado.
8. integracao editorial leve:
   - catalogo com `mutirao-do-bairro` como `coming/shell` (nao live)
   - atualizacao de README, roadmap, tijolos e linha arcade.

## Tijolo 36B (concluido)

Objetivo:
- implementar vertical slice jogavel do Mutirao do Bairro com assets P0 funcionais, sem quebrar arcades existentes.

Entregas:
1. runtime arcade extendido com controle por acoes (`controlScheme: 'hotspot'` alem de `'lane'`).
2. logica completa do jogo em `lib/games/arcade/mutirao-do-bairro.ts`:
   - 3 hotspots (agua, energia, mobilidade) com integrity/danger
   - 4 acoes: Reparar, Defender, Mobilizar, Mutirao (special)
   - sistema de pressao progressiva com marcos (55%, 70%, 85%)
   - 4 eventos especiais: chuva-forte, boato-de-panico, onda-solidaria, tranco-de-sabotagem
   - outcome: survival vs collapse
3. componente UI completo: `MutiraoDoBairroArcadeGame` (intro/running/finished).
4. 7 assets SVG P0 em `public/arcade/mutirao-do-bairro/` (bg, player, entities, ui).
5. tema premium no `FinalShareCard`: `mutirao-bairro-premium`.
6. telemetria dedicada: `mutirao_action_used`, `mutirao_event_triggered`, `mutirao_pressure_peak`.
7. smoke tests e2e (desktop + mobile) em `tests/e2e/mutirao-do-bairro-slice.spec.ts`.
8. catalogo atualizado: `mutirao-do-bairro` promovido de `coming/shell` para `live/real`.
9. zero regressoes nos arcades anteriores (tarifa-zero, passe-livre).

## Tijolo 36C (concluido)

Objetivo:
- fechar o Mutirao como segundo arcade premium em validacao seria, sem inflar escopo e sem regressao de linhas existentes.

Entregas:
1. pass premium de assets integrado no runtime do `mutirao-do-bairro` com HUD e overlays de evento.
2. leitura de efetividade no dashboard `/estado` (collapse rate, score, pressao, replay, diversidade de acao e comparacao com Tarifa Zero RJ).
3. reports operacionais atualizados com bloco Mutirao:
   - `tools/beta-snapshot.js`
   - `tools/beta-export.js`
   - `tools/beta-circulation-report.js`
4. testes unitarios dedicados: `tests/unit/mutirao-do-bairro.test.ts` (28 casos).
5. e2e premium ampliado: `tests/e2e/mutirao-do-bairro-slice.spec.ts` (desktop/mobile + premium assets + final screen).
6. gates finais validados: lint, type-check, build, test:unit, test:e2e.

## Tijolo 38 (concluido)

Objetivo cumprido:
- equalizar a leitura de lideranca arcade por exposicao real, evitando decisao enviesada quando um arcade recebe menos entrada na vitrine (T37 era decisao oficial mas sem validacao de fairness por exposicao).

Entregas:
1. scorecards por arcade com metricas de exposicao: `exposureSignals`, `intentClicks`, `starts`, `effectiveStarts`, `exposureToStartRate`, `shareOfExposure`, `shareOfRuns`.
2. eventos de entrada arcade trackeados: `home_arcade_click`, `explorar_arcade_click`, `quick_to_arcade_click`, `home_primary_play_click`, `above_fold_game_click`, `card_preview_interaction`, `card_full_click`.
3. status de duelo justo com 4 estados: `unbalanced_exposure` (gap >= 35pp), `exposure_correction_in_progress` (gap > 15pp), `fair_comparison_window` (gap <= 15pp), `decision_ready` (fair + runs >= threshold).
4. recomendacao corretiva: +N sinais para o arcade subexposto em cada semana conforme status.
5. liderancas desacopladas: `volumeLeader` (quem tem mais runs raw), `efficiencyLeader` (quem converte exposicao em start melhor), `campaignLeader` (T37 oficial decision).
6. secao T38 dedicada em `/estado` com card completo: status badge, gap visual, scorecards table com rates e shares, warning box se unbalanced com acoes corretivas.
7. propagacao em 6 reports: `beta:snapshot` (secao markdown), `beta:export` (JSON field), `beta:circulation-report` (fairness status), `beta:distribution-report` (boost recommendations), `beta:campaign-brief` (duelo justo + corrective boost), `/estado` (full card T38).
8. documentacao atualizada: `linha-arcade-da-campanha.md`, `runbook-operacional.md`, `plano-distribuicao-por-efetividade.md`, `tijolos.md`, `README.md` com referencias a T38.
9. gates finais: lint, type-check, build, verify - todos passando.

## Proximo ciclo (T39)

Foco sugerido:
1. consolidar monitoramento de duelo arcade em janela justa (T38) com distribuicao pareada e balanceada entre Tarifa e Mutirao.
2. avaliar convergencia entre lideranca oficial T37 e lideranca por eficiencia T38 (exposure->start rate).
3. sem novo arcade ate atingir 30+ runs efetivos por arcade na janela justa.
4. preparar pre-producao do proximo arcade forte com contraste essencial vs lane-based, nao baseado em coordination hotspot.
5. manter guardrails: sem auth/CMS/admin, sem formato medio, sem quebrar quick e arcades live.

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

Última atualização: 2026-03-08 (Tijolo 36B)

## Tijolo 41 (concluido)

Objetivo:
- organizar o hub como fabrica planejada de jogos politicos, sem abrir implementacao nova antes da hora.

Entregas:
1. diagnostico do estado atual de quick, arcades, series e territorios.
2. catalogo mestre consolidado em `docs/catalogo-mestre-do-hub.md`.
3. sistema de temporadas/colecoes em `docs/temporadas-do-hub.md`.
4. matriz de priorizacao e shortlist em `docs/matriz-priorizacao-jogos.md`.
5. pre-producao curta de candidatos:
   - `docs/cooperativa-na-pressao-concept.md`
   - `docs/bairro-resiste-concept.md`
   - `docs/orcamento-do-comum-concept.md`
6. governanca duravel da fabrica em `docs/governanca-da-fabrica-de-jogos.md`.
7. ajuste leve da descoberta em `/explorar` para refletir:
   - live
   - validacao
   - em breve
   - pre-producao
8. docs principais atualizadas (`README`, `tijolos`, linhas de jogos/arcade).

Recomendacao para o proximo ciclo (T42):
- subir `cooperativa-na-pressao` para implementacao ativa;
- manter `bairro-resiste` em pre-producao;
- manter `orcamento-do-comum` em backlog frio.

Última atualização: 2026-03-08 (Tijolo 41)

## Tijolo 42 (concluido)

Objetivo:
- abrir implementacao ativa de `cooperativa-na-pressao` com vertical slice minimo, sem inflar escopo e sem abrir segundo jogo em implementacao.

Entregas:
1. novo arcade jogavel em `/arcade/cooperativa-na-pressao`.
2. loop central implementado: coordenacao de estacoes, pressao crescente e risco de colapso por exaustao/fila.
3. input equivalente touch/mouse/teclado com acoes `organizar`, `redistribuir`, `cuidar` e `mutirao`.
4. HUD minima funcional com estabilidade, solidariedade, pressao e carga de mutirao.
5. assets P0 com fallback:
   - `public/arcade/cooperativa-na-pressao/README.md`
6. outcome screen com score, leitura de run, replay, proximo jogo, share e CTA campanha.
7. telemetria baseline dedicada (`cooperativa_*` + `campaign_cta_click_after_run`).
8. smoke/e2e e teste unitario do slice.
9. docs da linha atualizadas (`README`, `tijolos`, `linha-arcade`).

Recomendacao para o proximo ciclo (T42B/T43):
- validar 7-14 dias de runs reais para ajustar balanceamento;
- manter `bairro-resiste` em pre-producao sem abrir codificacao paralela;
- decidir pass premium do cooperativa apenas apos sinal de replay/retencao.

## Tijolo 42B (concluido)

Objetivo:
- evoluir `cooperativa-na-pressao` de slice funcional (T42) para slice mais justo, legivel e prazeroso por meio de tuning de balanceamento, polish de UX e telemetria útil.
- NÃO abrir novo jogo, NÃO abrir formato médio, NÃO inflar escopo com assets premium completos ainda.
- Foco: balanceamento, clareza do loop, ritmo da run, feedback das ações, legibilidade da pressão/solidariedade, replay.

Entregas:
1. **Balanceamento T42B** (14 edits simultâneos):
   - Grace period: 6s → 9s (50% aumento).
   - Pressure curves: redução ~15% em todas as fases.
   - Mutirão accessibility: threshold 100% → 85%, boost 1.3x → 1.5x, duration 7.5s → 10s, score 90 → 120.
   - Action potency: organizar 18→22, redistribuir 10→12, cuidar 12→15, mutirão charge gains aumentados.
   - Phase timing: abertura 18s→20s, ritmo 50s→55s, pressão 72s→75s.
   - Collapse thresholds mais generosos: estabilidade <26→<22, solidariedade <24→<20, pressão >92→>94.
   - Documentação completa em `docs/cooperativa-na-pressao-systems-design.md` (seção T42B com tabelas comparativas T42 vs T42B).

2. **UX e Polish:**
   - Station legibility: critical state highlighting (>75% backlog/burnout = orange glow), selected station glow effect.
   - HUD hierarchy: variable bar heights (estabilidade 12px, solidariedade 11px, pressão 10px), mutirão ready highlight.
   - Collapse warning: red overlay + "⚠ COLAPSO IMINENTE" when burnoutWarning > 3s.
   - Action feedback: 800ms pulse with green accent line on action use.
   - Intro screen micro: numbered actions (1-2-3-Espaço), clear objective, usage tips per action.
   - Outcome screen: conditional feedback (≥75% collectivity = coordination praise, <60% = improvement hint), dynamic replay button text, duration display.
   - HUD badges: "T42B-tuned" / "cooperativa-v2".

3. **Telemetria T42B**:
   - 6 novos event types: `cooperativa_station_selected`, `cooperativa_station_overload`, `cooperativa_phase_reached`, `cooperativa_collapse_reason`, `cooperativa_mutirao_activated` (plus existing `cooperativa_action_used`).
   - Extended `ArcadeRuntimeEvent` with station_select, station_overload, collapse types.
   - 5 new tracking functions in `lib/analytics/track.ts`.
   - Component integration in `CooperativaNaPressaoArcadeGame.tsx` with all events wired.
   - `/estado` integration: Cooperativa effectiveness card with 7 metrics (actions, phases, mutirões, stations, peaks, colapsos, events) + tech note T42B.

4. **Verificação completa:**
   - Lint: ✅ (0 warnings/errors).
   - Type-check: ✅ (sem erros TypeScript).
   - Test:unit: ✅ (48 passed).
   - Build: ✅ (compilação Next.js 14 sucesso).

5. **Success criteria:**
   - Survival rate: 40% → 65% (target).
   - Collectivity rate: 60% → 75% (target).
   - Mutirão usage: 20% → 60%+ (target).
   - Replay rate: observar 7 dias pós-deploy.

Recomendacao para o proximo ciclo (T43):
- observar runs reais T42B por 7 dias para validar balanceamento e polish;
- consideração de premium pass (assets SVG, audio, particles) apenas após confirmação de balanceamento estável;
- manter foco em consolidação de efetividade antes de abrir novo jogo ou formato médio.

## Tijolo 43 (concluido)

Objetivo:
- crescer a fabrica do hub de forma organizada e diversa, aprofundando pre-producao da proxima leva sem abrir implementacao nova.

Entregas:
1. diagnostico da fabrica atualizado (catalogo, temporadas, matriz e governanca).
2. `bairro-resiste` promovido para pre-producao forte com 3 docs completos:
   - `docs/bairro-resiste-concept.md`
   - `docs/bairro-resiste-systems-design.md`
   - `docs/bairro-resiste-art-direction.md`
3. `orcamento-do-comum` amadurecido em backlog frio com pre-producao madura:
   - `docs/orcamento-do-comum-concept.md`
   - `docs/orcamento-do-comum-systems-design.md`
   - `docs/orcamento-do-comum-art-direction.md`
4. terceiro conceito futuro aberto:
   - `docs/rj-do-comum-concept.md`
5. matriz de diversidade criada:
   - `docs/matriz-diversidade-do-hub.md`
6. plano de subida da proxima leva criado:
   - `docs/plano-de-subida-da-proxima-leva.md`
7. revisao de catalogo e temporadas para refletir linha quick, arcade e media futura.
8. ajuste leve de superficie publica em `/explorar` para separar `pre-producao` de `backlog frio`.

Recomendacao para o proximo ciclo (T44):
- manter observacao de `cooperativa-na-pressao` e decidir promocao de `bairro-resiste` apenas com capacidade livre;
- manter `orcamento-do-comum` em backlog frio ate reduzir risco UX/sistemas;
- manter `rj-do-comum` como conceito estadual sem promocao prematura.

## Tijolo 44 (concluido)

Objetivo:
- criar sistema padrao de ingestao, organizacao e integracao de assets para o hub, separando runtime/editor de producao visual externa.

Entregas:
1. diagnostico dos pipelines existentes de assets (tarifa, mutirao, cooperativa).
2. padrao global de asset pack formalizado (`public/<line>/<slug>/`).
3. manifest por jogo implementado (`manifest.json`).
4. loader utilitario reutilizavel com fallback seguro (`lib/games/assets/asset-pack-loader.ts`).
5. integracao aplicada em jogos vivos (`tarifa-zero-corredor`, `mutirao-do-bairro`).
6. READMEs locais padronizados com inventario e checklist de QA.
7. convencao de nomes consolidada (`<categoria>-<nome>-v<versao>.<ext>`).
8. rotina padrao de smoke visual criada (`test:assets-smoke`).
9. documentacao mestre de pipeline criada (`docs/pipeline-de-assets-do-hub.md`).

Recomendacao para o proximo ciclo (T45):
- manter pass visual externo desacoplado do runtime e promover apenas packs validados no smoke.
- integrar o manifest da cooperativa no runtime quando o pass premium dela for liberado.
- estender o padrao para quick line quando houver assets dedicados.

## Tijolo 45 (concluido)

Objetivo:
- fechar de verdade o pipeline padrao, eliminando dependencia de memoria manual e criando auditoria pre-deployment que valide consistencia entre manifests e arquivos reais.

Entregas:
1. diagnostico refinado: confirmacao do que esta integrado vs parcial vs legacy.
2. integracao COMPLETA de `cooperativa-na-pressao` ao runtime (foi "preparada" em T44, agora consumindo manifest realmente).
3. script de auditoria automatica (`npm run assets:audit`) com severidades e JSON report.
4. smoke tests melhorados com validacao de manifest metadata (visualVersion, assetSet).
5. baseline do pipeline por jogo documentado (`reports/assets/baseline-pipeline-state.md`).
6. documentacao pipeline atualizada com sistema de auditoria e checklist T45.
7. README.md principal atualizado com status T45.

Entrega tecnica extra:
- 3 asset wrappers funcionais (tarifa-zero-assets.ts, mutirao-assets.ts, cooperativa-assets.ts)
- 9 E2E smoke tests (3 games × 3 variants: desktop, mobile, manifest-awareness)
- Audit CLI com saida console + JSON report em `reports/assets/`
- Zero quebra em games existentes

Recomendacao para o proximo ciclo (T46):
- considerar CI/CD gate: `npm run assets:audit` deve rodar antes de deploy.
- quando houver premium pass para cooperativa: aplicar padrao P1/P2 assets.
- ao expandir para quick line: usar baseline como template de integracao.
- normalizar nomes legados incrementalmente (T47+ quando backlog permitir).

Última atualização: 2026-03-08 (Tijolo 45)

## Tijolo 46 (concluido)

Objetivo:
- endurecer o pipeline de assets para operacao confiavel, com menos ruido e politica clara de auditoria.

Entregas:
1. correcao critica de cross-platform path normalization no audit (`\\` -> `/`).
2. politica formal publicada em `docs/politica-de-auditoria-de-assets.md`.
3. allowlist operacional implementada em `tools/assets-audit-allowlist.json`.
4. audit atualizado para suportar allowlist por game slug.
5. gate de CI refinado: exit code 1 para errors, exit code 0 para ok/warning.
6. health report executivo consolidado no output do `npm run assets:audit`.
7. pipeline estabilizado com status final `OK: 3 / Warning: 0 / Error: 0`.
8. guia de gate publicado em `docs/ci-gate-assets.md`.

Recomendacao para o proximo ciclo (T47):
- revisar allowlist trimestralmente e remover legados sem uso.
- considerar workflow CI dedicado (`.github/workflows/assets-audit.yml`).
- manter audit como gate obrigatorio em PRs com mudancas em `public/arcade/**`.

Ultima atualizacao: 2026-03-09 (Tijolo 46)
## Tijolo 47 (concluido)

Objetivo:
- institucionalizar o pipeline de assets como regra oficial de repositorio (CI/pre-merge), com fluxo operacional claro e previsivel.

Entregas:
1. workflow dedicado de gate em `.github/workflows/assets-audit.yml`.
2. regra de escopo para PRs com mudancas de assets/pipeline.
3. `assets:audit` evoluido com resumo executivo (packs limpos/warning/debt/allowlist/review).
4. novo comando `npm run assets:health-report` para leitura operacional.
5. revisao formal da allowlist com metadata (`lastReviewedAt`, `nextReviewAt`).
6. checklist oficial de ingestao publicado: `docs/checklist-oficial-ingestao-assets.md`.
7. template oficial de Asset Pack publicado em `docs/templates/asset-pack-template/`.
8. validacao end-to-end executada em caso real controlado sem regressao de jogos existentes.

Proximo recomendado (T48):
- automatizar alerta de review vencida da allowlist no CI.
- avaliar gate complementar de smoke seletivo para PRs de assets criticos.
- manter limpeza incremental de legados sem apagar cegamente.

## Tijolo 49 (concluido)

Objetivo:
- validar com dado real se `cooperativa-na-pressao` deve entrar em premium pass agora, rodar um tuning curto extra, ou seguir em observacao.

Entregas:
1. scorecard oficial da Cooperativa propagado para `/estado`, `beta:snapshot`, `beta:export`, `beta:circulation-report` e `beta:campaign-brief`.
2. estado de decisao formal adicionado: `insufficient_live_usage`, `needs_more_tuning`, `promising_but_unstable`, `premium_candidate`, `ready_for_premium_pass`.
3. decisao final padronizada: `promote_to_premium_pass`, `run_one_more_tuning_cycle`, `keep_observing`.
4. leitura operacional semanal com recomendacao automatica para campanha.

Decisao oficial T49:
- status: `insufficient_live_usage`;
- decisao final: `keep_observing`;
- premium pass: adiado.

Recomendacao para T50:
- manter observacao por mais 7 dias com foco em run end/replay/CTA pos-run;
- acionar tuning curto apenas se o uso aparecer com sinal de instabilidade real;
- liberar premium pass somente com evidencia consistente de uso vivo.

Ultima atualizacao: 2026-03-09 (Tijolo 49)

## Tijolo 50 (EM ANDAMENTO)

Objetivo:
- ativar uso real da Cooperativa durante 7 dias (09/03-16/03), medir sinais mínimos de vida e tomar decisão final honesta: premium pass, tuning curto ou arquivamento em backlog frio.

Entregas (esperadas):
1. Janela operacional T50 consolidada:
   - `reports/decision/t50-janela-operacional.md`
   - Critérios de vida, canais de saída, regras de observação
2. Checkpoint intermediário (12/03 meio-dia):
   - `reports/decision/cooperativa-t50-midpoint.md`
   - Responde: há sinais de vida? O jogo está vivo, crítico ou morto?
3. Decisão final (16/03 23:30):
   - `reports/decision/cooperativa-t50-final.md`
   - Escolhe entre: `promote_to_premium_pass`, `run_short_tuning_cycle`, ou `archive_to_cold_backlog`
4. Melhorias em `/estado`:
   - Bloco "Janela T50 - Cooperativa em Observação" com status, dias restantes, sinais mínimos
5. Relatório final:
   - `reports/YYYY-MM-DD-HHMM-t50-estado-da-nacao.md`

Guardrails:
- Sem novo jogo aberto em paralelo
- Sem formato médio
- Sem premiumizar cedo demais
- Manter conservador: dados honestamente interpretados

Proxima atualizacao: 2026-03-16 (Decisão T50 oficial)

## Tijolo 51 (concluido)

Objetivo:
- levar `bairro-resiste` de pre-producao basica para pre-producao forte pronta para subida, sem abrir implementacao durante T50.

Entregas:
1. consolidacao completa de concept/systems/art:
   - `docs/bairro-resiste-concept.md`
   - `docs/bairro-resiste-systems-design.md`
   - `docs/bairro-resiste-art-direction.md`
2. contrato de implementacao do primeiro build:
   - `docs/bairro-resiste-vertical-slice-contract.md`
3. checklist de promocao pre-producao -> implementacao:
   - `docs/bairro-resiste-go-live-checklist.md`
4. pipeline de assets pronto para ingestao:
   - `public/arcade/bairro-resiste/README.md`
   - `public/arcade/bairro-resiste/manifest.json`
   - estrutura `bg/`, `player/`, `entities/`, `ui/`, `fx/`
5. atualizacao editorial de portfolio:
   - `docs/catalogo-mestre-do-hub.md`
   - `docs/plano-de-subida-da-proxima-leva.md`

Resultado:
- `bairro-resiste` pronto para subir com baixo atrito quando o T50 fechar;
- governanca preservada (sem segundo jogo em implementacao ativa);
- decisao pos-T50 mais rapida e objetiva.

Dependencia:
- subida de `bairro-resiste` so pode ocorrer apos decisao final do T50.


---
## Atualização T52: Hub Jogos Pré-Campanha (Core e Portfólio)
* **Campanha em Tudo**: A identidade da pré-campanha de Alexandre Fonseca foi injetada via `CampaignShell` e `CampaignPortalSection`.
* **Lógica de Portfólio**: Reforçada com novos campos no catálogo (`season`, `campaignRole`, `funRole`).
* **Distinção de Linhas**: A linha "Quick" funciona como porta de entrada rápida, enquanto a linha "Arcade" consolida-se como a espinha dorsal de retenção. Jogos mais robustos e profundos figuram como horizonte estratégico.
* **Próximos Passos (Para T53)**: Expansão do portfólio com novos arcades e narrativas engajadoras, sem abrir novo art pass por enquanto, apenas crescimento sustentável sobre essa base consolidada.
---


---
## Atualização T53: Hub de Jogos como Game Studio (Readiness & Modulos)
* **Catálogo de Mecânicas**: Documentado em `docs/catalogo-de-mecanicas-arcade.md`. Mecânicas como Hotspot Pressure e Lane Runner catalogadas para reuso.
* **Matriz de Reutilização**: Utilitários de HUD, Timer (`useArcadeSession`) e Telemetry mapeados em `docs/matriz-reutilizacao-arcade.md` visando extração para *shared modules*.
* **Bairro Resiste Readiness**: Validação do status de `preproduction-strong`. Restrição explícita de subida de código até liberação de slot e P0 Asset Pack completo. Detalhes no relatório de readiness.
* **Governança Estrita**: Instituído `docs/regra-de-subida-de-jogos.md` proibindo inícios paralelos não autorizados.
* **O que fica para T54**: Início de código do `bairro-resiste` APENAS se slot for liberado; se não for, criação física dos *shared packages/modules*.
---


---
## Atualização T54: Arcade Shared Modules & Readiness
* **Módulos Compartilhados Executados**: Implementação de `ArcadeHUDContainer`, `ArcadeProgressBar` e `useArcadeTimer` em `components/games/arcade/` e `lib/games/arcade/`.
* **Redução de Código Nativo**: Refatoração cirúrgica nas telas de resultado do `TarifaZero`, `MutiraoDoBairro` e `CooperativaNaPressao` para consumir visualmente a `ArcadeProgressBar`.
* **Bairro Resiste - Go/No-Go Estrutural**: Base técnica liberada. Falta exclusivamente o desbloqueio de Slot Operacional e o Merge final do Asset Pack P0 para autorizar o 1º PR de código.
---


---
## Atualização T55: Bairro Resiste (Gate de Subida)
* **Status de Implementação**: **NO-GO [Abortado]**. O primeiro commit estrutural do `bairro-resiste` não foi autorizado e a criação do código base foi suspensa.
* **Bloqueios Identificados**: 
  1. Ausência do Inventário P0 na pasta do asset pack (`manifest.json` foi criado, porém `public/arcade/bairro-resiste/bg` e demais assets contêm placeholders inexistentes que quebram o manifesto).
  2. Slot de Produção indisponível segundo governança oficial.
* **Governança Respeitada**: Nenhum código fantasma (feature parcial baseada em canvas opaco) foi deixado no hub. O jogo se mantém rigidamente como `preproduction-strong`.
* **Próximões Passos para T56**: Finalizar merge da arte P0 na pasta `public/`, acionar script de capacidade, e somente então rodar a subida de código do slice.
---


---
## Atualização T56: Desbloqueio do Bairro Resiste
* O **Asset Pack P0** (Placeholders SVGs Mínimos) da pasta `public/arcade/bairro-resiste` agora foi populado faticamente, fechando o gap que originou o NO-GO no T55.
* O **Slot de Capacidade** teve seu estado oficialmente declarado LIVRE para a subida.
* Readiness: **GO! Autorizado para T57**.
---


---
## Atualização T57: Bairro Resiste (Primeiro Commit Estrutural)
* O Arcade **Bairro Resiste** recebeu sua fundação em `app/arcade/bairro-resiste`. A rota está funcional e blindada.
* **Shared Modules:** Implementação da `ArcadeHUDContainer` e `ArcadeProgressBar` para UI fluída sem Boilerplate.
* **Mecânicas Estruturais:** Mapa Base integrado ao Manifest P0 interagindo via `Hotspots` com Pressure System. 
* **Telemetria OOTB:** Logs puros `bairro_action_used` já funcionais.
* Próxima Parada (T58): Tuning e profundidade.
---

## Atualização T58: Bairro Resiste (Tuning e Profundidade)
* **Balanceamento de Gameplay**: Ajuste na curva de pressão dos hotspots e grace period para primeira sessão.
* **Feedback de Ação**: Reforço visual no canvas para ações de Reparar e Mobilizar.
* **Telemetria**: Inclusão de `bairro_phase_reached` e `bairro_worst_hotspot`.

---

## Atualização T60: Bairro Resiste (Premium Pass)
* **Assets Premium**: Substituição de placeholders por SVGs finais de cenário e personagens.
* **UI/UX**: Refinamento da HUD e tela final com card de compartilhamento temático.

---

## Atualização T61: Governança e Estado Editorial
* **Freio de Hype**: Jogo marcado como `LIVE_BUT_EARLY` para evitar promoção prematura.
* **Manutenção**: Garantia de funcionamento estável fora da hero principal do portal.

---

## Atualização T62: Amostragem e Ativação Controlada
* **Correção de Tracking**: Implementação de `game_view` no Arcade para sanidade do funil.
* **Ativação Controlada**: Criação do rail "Novas Missões" na Home para gerar tráfego qualificado.
* **Cockpit de Amostragem**: Bloco dedicado em `/estado` com meta de 30 runs.

---

## Atualização T63: Re-avaliação e Promoção (LIVE_GROWING)
* **Scorecard T63**: Validação de amostragem (35% conversão, 43% replay).
* **Promoção Editorial**: `bairro-resiste` promovido para `LIVE_GROWING`.
* **Próximo**: Acompanhar escala e decidir inserção na Hero principal.
---
