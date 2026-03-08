# Tijolos - Protocolo de Execucao

## Objetivo

Padronizar entregas incrementais com estabilidade tecnica, clareza operacional e impacto real de produto.

Cada tijolo fecha com:
- software executavel
- documentacao atualizada
- validacao tecnica completa
- relatorio de Estado da Nacao

## Gate obrigatorio

```bash
npm run lint
npm run type-check
npm run build
npm run verify
```

## Gate recomendado

```bash
npm run test:unit
npm run test:e2e
```

## Criterio de pronto

- [ ] objetivo entregue com impacto real
- [ ] gate tecnico passou
- [ ] docs atualizadas (`README`, `roadmap`, `tijolos`, `runbook`)
- [ ] relatorio em `reports/YYYY-MM-DD-HHMM-tijolo-XX-estado-da-nacao.md`
- [ ] sem regressao nas engines reais

## Estado atual do protocolo

- Tijolo 06 ✅ diversidade de mecanicas (4 engines + onboarding + OG textual)
- Tijolo 07 ✅ blindagem tecnica (testes + OG image + lazy loading)
- Tijolo 08 ✅ consolidacao operacional (export share card + CI/CD + metricas)
- Tijolo 09 ✅ confiabilidade de producao (E2E no CI + Sentry + A11y + OG cache)
- Tijolo 10 ✅ distribuicao e engajamento (source tracking + beta banner + funil)
- Tijolo 11 ✅ beta como sistema de aprendizado (experimentos + coortes + feedback)
- Tijolo 12 ✅ consolidacao remota de aprendizado (views + snapshot/export remoto)
- Tijolo 13 ✅ operacao interna leve (triagem prioritaria + beta:ops + cockpit /estado)
- Tijolo 14 ✅ governanca operacional minima e auditabilidade (rota protegida + audit log)
- Tijolo 15 ✅ automacao operacional continua (cron + alertas leves + export audit)
- Tijolo 16 ✅ hardening operacional base
- Tijolo 17 ✅ leitura disciplinada (scorecards, thresholds, circulation)
- Tijolo 18 ✅ leitura de producao (janelas, staleness, ambiente)
- Tijolo 19 ✅ rotina temporal continua (staleness no cron + guias + runbook)
- Tijolo 20 ✅ cockpit temporal, clareza operacional e camada de game feel/replay
- Tijolo 21 ✅ identidade eleitoral + linha de jogos + escala RJ
- Tijolo 22 ✅ avatar oficial + card final universal + pipeline de assets
- Tijolo 23 ✅ avatar V2 + card com QR + minigame quick
- Tijolo 24 ✅ validacao disciplinada da linha quick
- Tijolo 25 ✅ motor ideologico + 3o quick + leitura por eixo politico
- Tijolo 26 ✅ scorecard de grude + comparacao quick por serie/territorio + priorizacao estrategica
- Tijolo 27 ✅ operacao disciplinada de distribuicao e coleta para linha quick
- Tijolo 28 ✅ operacao pratica de distribuicao e campanha
- Tijolo 29 ✅ linha arcade real + primeiro vertical slice jogavel
- Tijolo 30 ✅ consolidacao da linha arcade com 2 jogos reais e game feel aprimorado
- Tijolo 31 ✅ reposicionamento arcade-first e leitura front-stage da conversao
- Tijolo 32 ✅ superfície impulsiva, preview vivo e replay/reentrada fortalecidos
- Tijolo 33 ✅ run efetiva e distribuição guiada
- Tijolo 34 ✅ efetividade em operação de campanha
- Tijolo 35A ✅ fundação visual profissional do primeiro arcade
- Tijolo 35D ✅ produção visual de assets profissionais integrada ao Tarifa Zero RJ
- Tijolo 35E ✅ acabamento premium coeso com variantes dedicadas e smoke e2e do arcade
- Tijolo 36A ✅ pre-producao completa do proximo arcade forte (`Mutirao do Bairro`)
- Tijolo 36B ✅ vertical slice jogavel do Mutirao do Bairro com assets P0
- Tijolo 36C ✅ fechamento premium operacional do Mutirao com reports + testes + gates

## Tijolo 36B - Vertical slice jogavel do Mutirao do Bairro ✅

### Objetivo

Implementar o segundo arcade forte da campanha com mecânica de coordenação de hotspots, sem quebrar os arcades existentes e mantendo assets em nível P0 funcional.

### Entregues

- Runtime arcade extendido com controle por ações (`controlScheme: 'hotspot'` além de `'lane'`).
- Inputs estendidos: `actionOnePressed`, `actionTwoPressed`, `actionThreePressed`, `specialPressed`.
- Eventos de runtime customizados: `action_used` com `actionId` e `hotspotId` opcional.
- Lógica completa do jogo em `lib/games/arcade/mutirao-do-bairro.ts` (549 linhas):
  - 3 hotspots (água, energia, mobilidade) com integrity/danger.
  - 4 ações: Reparar, Defender, Mobilizar, Mutirão (special).
  - Sistema de pressão progressiva com marcos (55%, 70%, 85%) e grace period.
  - 4 eventos especiais: chuva-forte, boato-de-pânico, onda-solidária, tranco-de-sabotagem.
  - 4 fases temporais: arranque → pressão → virada → fechamento.
  - Outcome: survival vs collapse.
- Componente UI completo: `MutiraoDoBairroArcadeGame` com intro/running/finished.
- 7 assets SVG P0 em `public/arcade/mutirao-do-bairro/` (bg, player, entities, ui).
- Tema premium no `FinalShareCard`: `mutirao-bairro-premium`.
- Telemetria dedicada: `mutirao_action_used`, `mutirao_event_triggered`, `mutirao_pressure_peak`.
- Integração em `/estado` com contadores de eventos mutirao.
- Smoke tests e2e (desktop + mobile) em `tests/e2e/mutirao-do-bairro-slice.spec.ts`.
- Catálogo atualizado: `mutirao-do-bairro` promovido de `coming/shell` para `live/real`.
- Zero regressões nos arcades anteriores (tarifa-zero, passe-livre).

### Nao inclui

- modo cooperativo ou narrativa procedural.

## Tijolo 36C - Fechamento premium operacional do Mutirao ✅

### Objetivo

Transformar o Mutirao em segundo arcade premium validado de forma objetiva, com camada operacional e verificação completa.

### Entregues

- Runtime Mutirao com pack premium ativo (HUD + overlays + final premium), fallback preservado.
- Card de efetividade no `/estado` com leitura de:
  - runs
  - collapse rate
  - score medio
  - pressao media
  - replay
  - diversidade de acao
  - comparacao com Tarifa Zero RJ
- Reports operacionais com bloco Mutirao:
  - `beta:snapshot`
  - `beta:export`
  - `beta:circulation-report`
- Testes unitarios dedicados: `tests/unit/mutirao-do-bairro.test.ts` (28 testes).
- E2E premium ampliado: `tests/e2e/mutirao-do-bairro-slice.spec.ts` (4 testes Mutirao; suite total 25/25).
- Gates finais validados:
  - lint
  - type-check
  - build
  - test:unit
  - test:e2e
- Zero regressao observada em Tarifa Zero RJ, Passe Livre Nacional e linha quick.

## Tijolo 36A - Pre-producao do proximo arcade forte ✅

### Objetivo

Abrir a nova fase da linha arcade com pre-producao organizada, contrastando com Tarifa Zero RJ e sem implementar ainda o jogo completo.

### Entregues

- Decisao explicita de rota: **A) novo arcade `mutirao-do-bairro`**.
- Documento de conceito: `docs/mutirao-do-bairro-game-concept.md`.
- Systems design completo: `docs/mutirao-do-bairro-systems-design.md`.
- Direcao de arte completa: `docs/mutirao-do-bairro-art-direction.md`.
- Pipeline de assets preparada: `public/arcade/mutirao-do-bairro/README.md` + estrutura `player/entities/ui/bg`.
- Planejamento formal de HUD, tela final, telemetria e vertical slice T36B.
- Integracao editorial leve no catalogo como `coming/shell` (sem publicar live).

### Nao inclui

- implementacao final do runtime do novo arcade;
- polimento premium completo de assets;
- abertura de formato medio;
- auth/CMS/admin.

## Tijolo 35D - Produção visual de assets profissionais ✅

### Objetivo

Transformar os concepts das linhas A-D do Tarifa Zero RJ em assets reais integráveis, mantendo estabilidade do runtime arcade e fallback seguro.

### Entregues

- Assetização real em `public/arcade/tarifa-zero/`:
  - `bg/` com skyline distante, camada urbana média e corredor/pista.
  - `player/` com ônibus-player estilizado.
  - `transport/` com ônibus principal, compacto e variante de evento.
  - `obstacles/` com catraca, barreira pesada e zona de pressão.
  - `pickups/` com apoio, apoio em cadeia, mutirão, individualismo, chance rara e chance-virada.
  - `ui/` com peças de HUD, badges, frame premium, QR frame e botões premium.
- Runtime do Tarifa Zero migrado para renderização asset-first com fallback canvas.
- Feedback lane-specific em colisões preparado para etapa seguinte de polish visual.
- Pós-run premium com score, fase, combo e CTA de próximo arcade.
- `/estado` com leitura de versão visual ativa por jogo arcade.

### Nao inclui

- reescrita da lógica do gameplay
- novo arcade
- abandono do fallback em canvas

## Tijolo 35E - Acabamento premium coeso ✅

### Objetivo

Fechar lacunas de acabamento visual do Tarifa Zero RJ, reforçando identidade premium sem abrir novo jogo e sem mexer pesado na lógica de gameplay.

### Entregues

- Variantes dedicadas integradas no runtime:
  - `public/arcade/tarifa-zero/obstacles/obstacle-bloqueio-sequencia.svg`
  - `public/arcade/tarifa-zero/pickups/pickup-individualismo-cluster.svg`
- Runtime atualizado para usar as variantes dedicadas com fallback preservado.
- Transição visual entre fases validada no canvas (overlay curto com badge/tema de fase).
- Final de run refinado no `TarifaZeroArcadeGame` com hierarquia premium e CTAs reforçados.
- CTAs finais reorganizados para fluxo de conversão:
  - replay
  - próximo jogo
  - compartilhar
  - participar da campanha
- Smoke e2e focado no arcade:
  - teste de carregamento e HUD
  - teste de estabilidade com variantes
  - teste de final premium
  - screenshots desktop/mobile em `reports/validation/`

### Guardrails mantidos

- sem novo jogo
- sem reescrita da lógica principal
- performance preservada
- fallback canvas preservado

## Tijolo 20 - Cockpit Temporal ✅

### Objetivo

Transformar a base temporal em rotina diaria acionavel para operacao humana.

### Entregues

- `/estado` com semaforizacao de severidade por sinais operacionais.
- Indicacao explicita de janela, amostra e ultimo evento remoto.
- Comparacao leve entre janelas (`24h vs 7d` ou `7d vs 30d`).
- Sinalizacao de experimento ativo sem trafego, engine com baixa atividade e CTA com exposicao sem clique relevante.
- `beta:ops` com resumo curto consolidado, staleness local, idade de snapshot e ultimo evento remoto.
- `docs/playbook-incidentes.md` com resposta pratica por sintoma.
- Intro de engine mais curta com inicio rapido.
- Outcome e share com foco em reentrada e replay.
- Novos eventos de fun/replay/campanha no analytics e leitura inicial no `/estado`.
- Componente reutilizavel de assinatura de campanha (`CampaignMark`).

### Nao inclui

- nova engine
- auth obrigatoria
- integracao Slack/email
- painel admin enterprise

## Tijolo 21 - Identidade eleitoral e escala RJ ✅

### Objetivo

Transformar o hub em linha reconhecivel de jogos da pre-campanha, com progressao de produto e base de escala territorial para o estado do Rio de Janeiro.

### Entregues

- Documento mestre `docs/linha-de-jogos-campanha.md`.
- Taxonomia oficial no catalogo: pace, line, series e territoryScope.
- Home e Explorar reorganizados por series, descoberta e horizonte de formatos.
- Presenca da pre-campanha reforcada em superfices-chave (sem panfleto duro).
- Tracking de cliques em series e "proxima experiencia da serie".
- `/estado` com leitura editorial por serie, territorio e tipo de jogo.
- Blueprints futuros:
	- `docs/formato-plataforma.md`
	- `docs/formato-rpg.md`
	- `docs/formato-tycoon.md`

### Nao inclui

- implementacao real de plataforma/RPG/tycoon
- auth/CMS/admin

## Tijolo 22 - Avatar oficial e card final universal ✅

### Objetivo

Criar base visual reutilizavel para crescimento organizado do hub: avatar oficial estilizado de Alexandre Fonseca, card final universal compartilhavel e pipeline de assets coerente.

### Entregues

- Avatar oficial de Alexandre Fonseca como personagem principal recorrente:
  - Documento mestre: `docs/avatar-oficial-alexandre-fonseca.md`
  - Asset base SVG placeholder: `public/campaign/avatar/base.svg`
  - Componente reutilizavel: `components/campaign/CampaignAvatar.tsx`
  - Tamanhos: small, medium, large, hero
  - Variantes: portrait, icon, busto

- Card final universal compartilhavel:
  - Componente: `components/campaign/FinalShareCard.tsx`
  - Frame base: `public/campaign/share/frame-base.svg`
  - Integracao em `ResultCard` para todas as share pages
  - Todos os jogos terminam com card consistente

- Pipeline de assets organizado:
  - Estrutura: `public/campaign/avatar/` e `public/campaign/share/`
  - Documentacao: `docs/assets/README.md`
  - Convencoes de nomenclatura e qualidade

- Tracking:
  - Novos eventos: `final_card_view`, `final_card_download`, `final_card_share_click`, `campaign_avatar_view`, `campaign_cta_click_after_game`
  - Funcoes de tracking no `lib/analytics/track.ts`
  - Secao dedicada no `/estado` para leitura de card final e avatar

- Share pages melhoradas:
  - Uso do card universal
  - Avatar oficial visivel
  - Presenca de campanha reforcada
  - Tracking de visualizacao do card final

### Limitacoes atuais

- Asset V1 e placeholder tecnico estilizado
- Representa conceito e estrutura, precisa refinamento profissional futuro
- Componentes funcionais e prontos para substituicao de asset final

### Nao inclui

- nova engine
- RPG/plataforma/tycoon completo
- auth/CMS/admin
- asset final profissional refinado (fica para V2)

## Tijolo 23 - Avatar V2, QR e throughput quick ✅

### Objetivo

Evoluir o avatar oficial de V1 placeholder para V2 reconhecivel, fortalecer conversao no card final com QR e validar o pipeline com um novo minigame quick.

### Entregues

- Avatar V2 com expressoes e variante de oculos:
  - `public/campaign/avatar/v2/portrait-neutral.svg`
  - `public/campaign/avatar/v2/portrait-smile.svg`
  - `public/campaign/avatar/v2/portrait-determined.svg`
  - `public/campaign/avatar/v2/portrait-glasses.svg`

- `CampaignAvatar` evoluido:
  - suporte a `expression` (`neutral|smile|determined`)
  - suporte a `glasses` (`auto|on|off`)
  - contrato `fullBody` preparado para etapa futura

- Card final universal fortalecido:
  - `FinalShareCard` com QR code dinamico
  - QR com destino de reentrada (`/share/...` ou `/play/...`)
  - tracking de `final_card_qr_view` e `final_card_qr_click`

- Novo minigame quick real:
  - slug: `custo-de-viver`
  - tempo: ~1-2 min
  - formato quiz relampago e rejogavel
  - integrado ao catalogo e runtime real

- Tracking ampliado:
  - `avatar_v2_rendered`
  - `avatar_expression_rendered`
  - `quick_minigame_completion`
  - `quick_minigame_replay`

- `/estado` com leitura dos novos sinais de avatar/QR/quick.

### Nao inclui

- RPG/plataforma/tycoon completo
- auth/CMS/admin
- pacote full-body final do avatar (fica para Tijolo 24)

## Tijolo 24 - Validacao disciplinada da linha quick ✅

### Objetivo

Validar se a linha quick da campanha diverte, circula e compartilha com comparacao real entre jogos curtos e experimento controlado no card final.

### Entregues

- Segundo minigame quick real:
  - slug: `quem-paga-a-conta`
  - perfil contrastante com `custo-de-viver`
  - tempo 1-2 min, rejogavel e compartilhavel

- Experimento A/B real no card final:
  - `final-card-qr-code`
  - variante A: `with-qr`
  - variante B: `without-qr`
  - aplicacao em share pages

- Refino operacional e leitura:
  - `/estado` com bloco da linha quick e comparacao entre quick games
  - snapshots/exports/circulation report com quick vs quick
  - resumo de experimento QR e cortes por serie/territorio
  - SQL de apoio em `supabase/tijolo-24-quick-line-validation.sql`

### Nao inclui

- auth/CMS/admin
- jogo grande novo
- full-body final do avatar

## Tijolo 25 - Motor ideologico e linha quick coletiva ✅

### Objetivo

Formalizar o motor ideologico dos jogos, integrar taxonomia politica ao catalogo e testar a linha quick com terceira experiencia de solucoes coletivas.

### Entregues

- Documento mestre: `docs/motor-ideologico-dos-jogos.md`.
- Taxonomia ideologica no dominio dos jogos:
  - `politicalAxis`
  - `collectiveSolutionType`
  - `commonVsMarket`
  - `campaignFrame`
- 3o quick game real: `cidade-em-comum`.
- Outcome/CTA com foco em organizacao coletiva e enquadramento nao personalista.
- Tracking com metadata ideologica em todos os eventos e sinal dedicado `ideological_axis_signal`.
- `/estado` com bloco ideologico (eixo, solucao coletiva, comum vs mercado).
- Snapshot/export/circulation com recorte ideologico da linha quick.

### Nao inclui

- auth/CMS/admin
- nova engine alem das atuais
- pacote full-body final do avatar

## Tijolo 26 - Priorizacao estrategica da linha quick ✅

### Objetivo

Parar decisao por feeling e consolidar leitura comparativa por jogo, serie, eixo e territorio para decidir qual linha quick evolui primeiro para formato medio.

### Entregues

- Scorecard de grude com heuristica explicita (completion/replay/share/CTA/share-play/TFI).
- Ranking legivel por quick game, por serie e por territorio.
- Leitura de eixo politico mais vivo e territorio mais responsivo no `/estado`.
- Readout do experimento QR com estado de amostra (`cedo-demais`, `monitorando`, `sinal-direcional`).
- `beta:snapshot`, `beta:export` e `beta:circulation-report` com blocos de priorizacao e avisos de baixa amostra.
- Reforco visual territorial leve em card/play (ponte territorial local -> estado).

### Nao inclui

- formato medio novo (RPG/plataforma/tycoon)
- auth/CMS/admin
- novas engines alem das atuais

## Tijolo 27 - Operacao disciplinada de distribuicao e coleta ✅

### Objetivo

Transformar a linha quick em algo realmente decidivel, criando operacao disciplinada de distribuicao e coleta de amostra por serie, territorio e variante, sem abrir novo escopo de produto antes da hora.

### Entregues

- Plano operacional de distribuicao em `docs/plano-distribuicao-quick.md`.
- Metas minimas de amostra por janela (7d, 30d, all) para quick/serie/territorio/QR.
- Status de coleta (`coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`) aplicado em quick/serie/territorio/QR.
- Report de distribuicao operacional (`npm run beta:distribution-report`) com progresso por quick/serie/territorio e recomendacoes acionaveis.
- `/estado` ampliado com status de coleta, barra de progresso visual e avisos de insuficiencia.
- Criterio formal de "pronto para Tijolo 28" baseado em amostra minima por quick/serie/territorio.
- Documentacao atualizada com metas, status de coleta e criterios de decisao.

### Nao inclui

- formato medio novo (RPG/plataforma/tycoon)
- auth/CMS/admin
- novas engines alem das atuais
- inflacao operacional interna

## Tijolo 28 - Operacao pratica de distribuicao e campanha ✅

### Objetivo

Transformar o plano de distribuicao do Tijolo 27 em operacao pratica de campanha, criando ferramentas simples e rastreaveis para distribuir quick games por canal, territorio e serie sem abrir novo escopo de produto.

### Entregues

- Sistema de links de campanha com UTMs em `lib/campaign-links/` (types, builder, packages).
- Script `npm run campaign:links` para gerar links prontos de campanha em markdown/json.
- Pacotes de distribuicao por canal (`reports/distribution/packages/instagram-geral.md`, `whatsapp-geral.md`, `tiktok-geral.md`).
- Pacotes por territorio (`territorio-estado-rj.md`, `territorio-volta-redonda.md`) com metas operacionais e ordem de prioridade.
- Operacao semanal documentada em `docs/operacao-semanal-distribuicao.md` (roteiro de 14 dias).
- Script `npm run campaign:brief` para gerar resumo executivo semanal da campanha em `reports/distribution/briefs/`.
- Melhorias no `beta:distribution-report` com secao "O que distribuir esta semana" e recomendacoes operacionais especificas.
- Bloco "O que distribuir agora" em `/estado` com quick/territorio/serie prioritarios e alertas visuais.
- Documentacao de distribuicao em `docs/distribuicao-links.md`.
- Branding eleitoral "Pre-Campanha de Alexandre Fonseca para Deputado" reforçado em todos os materiais.

### Nao inclui

- nova engine
- formato medio
- auth/CMS/admin
- integracao Slack/email
- painel enterprise

### Guardrails respeitados

- 4 engines + 3 quick games continuam funcionando sem regressao
- sistema de rastreamento UTM/source funcional
- cockpit `/estado` acionavel e leve
- operacao de campanha clara, rastreavel e idiota-proof

## Tijolo 31 - Front-stage arcade-first e clique imediato ✅

### Objetivo

Reposicionar a superficie publica do hub para parecer primeiro um portal de jogos de campanha (divertido e clicavel), com campanha visivel sem friccao editorial no topo.

### Entregues

- Home arcade-first com CTA principal para jogar agora e bloco `Jogue agora` acima da dobra.
- Cards de destaque com metadata de decisao rapida (tipo, duracao, serie, territorio e CTA).
- Bloco quick-vs-arcade com captura de preferencia declarada.
- Explorar reorganizada como catalogo jogavel:
  - spotlight arcade
  - quick strip
  - filtros por tipo, serie e territorio
- `GameCard` com leitura mais direta e destaque visual para arcade.
- Tracking front-stage implementado:
  - `home_primary_play_click`
  - `home_arcade_click`
  - `home_quick_click`
  - `home_play_now_block_click`
  - `home_quick_vs_arcade_choice`
  - `arcade_vs_quick_preference`
  - `above_fold_game_click`
  - `manifesto_expand_click`
  - `explorar_arcade_click`
  - `explorar_quick_click`
  - `explorar_filter_change`
- `/estado` com bloco "Front-stage da Home e Explorar" para leitura de CTR arcade vs quick, cliques above-fold, preferencia quick-vs-arcade, interesse editorial e uso de filtros.
- Validacao tecnica completa:
  - lint
  - type-check
  - test:unit
  - build
  - verify
  - test:e2e

### Nao inclui

- nova engine
- auth/CMS/admin
- formato medio novo (2-6 min)
- terceiro arcade

## Proximo

- Tijolo 32: otimizacao de conversao arcade por iteracoes de front-stage, distribuicao territorial orientada por dados e melhoria de replay nos arcades ativos.

## Tijolo 32 - Superfície impulsiva, replay e reentrada ✅

### Objetivo

Transformar a home arcade-first em uma superfície mais impulsiva e jogável, reduzindo a fricção entre descoberta e início de jogo, aumentando replay e fortalecendo a reentrada entre experiências sem abrir nova engine.

### Entregues

- **Preview vivo para jogos em destaque**:
  - Animações CSS leves nos cards (pulso, glow, hover bounce) para dar sensação de jogo real antes do clique
  - Badge arcade com animação de pulso
  - Ícones com animação de escala e rotação no hover
  - Efeito de glow rotativo nos cards arcade em destaque
  - Quick cards com animação de slide no hover
- **Redução de friction de launch**:
  - Card inteiro clicável com feedback visual melhorado
  - CTAs mais diretos e ação-orientados ("Jogar agora", "Correr agora")
  - Área de clique expandida com transições suaves
  - Seta de CTA com animação de translate no hover
- **Bloco "Jogue agora" reforçado**:
  - Copy mais impulsivo: "Missões jogáveis. Entre em segundos."
  - Descrição focada em ação: "Arcade de controle real ou quick de descoberta rápida. Escolha, jogue uma rodada, compartilhe o resultado."
- **Explorar melhorado para decisão rápida**:
  - Hero copy: "Escolha um, jogue agora"
  - Seção arcade: "Jogar de verdade. Replay imediato."
  - Filtros simplificados: "Encontre seu jogo rápido"
- **Replay e reentrada fortalecidos**:
  - Sistema de recomendação de próximos jogos (`lib/games/recommendations.ts`)
  - Botão de replay prominente no outcome
  - 3 recomendações de next-game baseadas em série/território/formato
  - Explicação clara do motivo da recomendação
  - Visual cards para os próximos jogos recomendados
- **Instrumentação de conversão**:
  - `card_preview_interaction`: hover/focus em preview
  - `card_full_click`: clique na área completa do card
  - `click_to_play_time`: tempo do clique até first input
  - `replay_after_run_click`: replay pós-jogo
  - `next_game_after_run_click`: próximo jogo recomendado
  - `quick_to_arcade_click`: conversão quick → arcade
  - `arcade_to_quick_click`: conversão arcade → quick
- **Dashboard /estado com métricas de conversão**:
  - Seção "Conversão e Replay (Tijolo 32)" com 11 indicadores
  - Preview CTR
  - Click-to-play metrics
  - Replay rate pós-run
  - Next game rate pós-run
  - Cross-game conversão (quick ↔ arcade)

### Documentação atualizada

- `README.md` com estado do Tijolo 32
- `docs/tijolos.md` com entry do Tijolo 32
- `docs/roadmap.md` com próximos ciclos
- `docs/linha-arcade-da-campanha.md` com estratégia de preview e replay

### Validação técnica

- Lint: passou
- Type-check: passou
- Test:unit: passou
- Build: passou
- Verify: passou

### Não inclui

- Nova engine ou novo jogo
- Assets de vídeo/GIF pesados
- Redesign completo da UI
- Auth ou admin
- Novos formatos de jogo

### Próximo ciclo recomendado (Tijolo 34)

- Transformar leitura de efetividade em recomendação de distribuição operacional acionável.
- Segmentar efetividade por canal (`utm_source`) e território (slug-based).
- Adicionar regra explícita de não-pivot com baixa amostra.
- Atualizar `/estado`, reports e brief com distribuição por efetividade real.

## Tijolo 33 - Run efetiva e distribuição guiada ✅

### Objetivo

Separar clique superficial de comportamento real de jogo para orientar campanha com base em run efetiva, replay efetivo e cross-game efetivo.

### Entregues

- Camada de run efetiva em `lib/analytics/effective-runs.ts`.
- Ampliação de `MetricsSnapshot` com bloco `effectiveRuns`.
- `/estado` atualizado com scorecards reais e alertas de amostra.
- Atualização de scripts beta para carregar leitura de efetividade:
  - `beta:snapshot`
  - `beta:export`
  - `beta:circulation-report`
  - `beta:distribution-report`
  - `beta:campaign-brief`
- Recomendação pós-run refinada (`lib/games/recommendations.ts`) com peso por histórico local de clique -> start efetivo.

### Definições adotadas

- `effective_run_start`: card click seguido de `game_start`/`first_interaction_time` em janela curta.
- `effective_replay`: replay click seguido de novo start em janela curta.
- `effective_cross_game_start`: next-game click seguido de start do jogo de destino em janela curta.

### Guardrails mantidos

- Sem nova engine.
- Sem novo formato médio.
- Sem auth/CMS/admin.

### Próximo

- Consolidar 7-14 dias para confirmar sinais úteis antes de abrir novo arcade ou formato médio.

## Tijolo 34 - Efetividade em operação de campanha ✅

### Objetivo

Transformar efetividade em orientação operacional semanal de distribuição sem abrir novo escopo de produto: responder objetivamente "qual jogo empurrar?", "qual canal?", "qual território?" e "quando pivotar?".

### Entregues

- Segmentação de efetividade por **canal** (`utm_source` normalizado) e **território** (slug-based mapping).
- Ampliação de `lib/analytics/effective-runs.ts` com:
  - `EffectiveSegmentRow` para segmentar efetividade.
  - `EffectiveRunsAnalysisOptions` para contexto de sessão (UTM/slug).
  - Rankings: `topEffectiveRunsByGame`, `topEffectiveReplayByGame`, `crossGameBridges`, `byChannel`, `byTerritory`.
  - Scorecards consolidados com status de maturidade.
  - Direção dominante (`quick_to_arcade` / `arcade_to_quick` / `balanced`).
- Atualização de `lib/analytics/metrics.ts` para passar contexto de sessão e mapa de território.
- Atualização de scripts operacionais:
  - `tools/effective-runs-utils.js`: segmentação canal/território.
  - `tools/beta-export.js`, `tools/beta-snapshot.js`: passa contexto completo de sessões.
  - `tools/beta-distribution-report.js`: recomendação semanal acionável com:
    - Jogo de 1º push (maior run efetiva).
    - Jogo de 2º clique (maior replay efetivo).
    - Canal prioritário.
    - Território promissor.
    - Direção quick ↔ arcade.
    - **Regra explícita de não-pivot** quando scorecards em `insufficient_data`.
  - `tools/beta-campaign-brief.js`: brief operacional por efetividade (jogo/canal/território/regra de baixa amostra).
- Dashboard `/estado` atualizado com blocos de "Run efetiva por canal" e "Run efetiva por território".
- Novo plano de distribuição: `docs/plano-distribuicao-por-efetividade.md`.
- Atualização de `README.md`, `docs/roadmap.md`, `docs/tijolos.md`.

### Decisões operacionais acionáveis

- **Jogo 1º push:** top de run efetiva; fallback para menor progresso de coleta.
- **Jogo 2º clique:** top de replay efetivo; fallback para reforçar 1º push.
- **Canal prioritário:** top de run efetiva por canal; fallback para distribuição equilibrada.
- **Território prioritário:** top de run efetiva por território; fallback para cobertura multi-territorial.
- **Direção quick ↔ arcade:** interpretação de `directionWinner` apenas se scorecards >= `directional_signal`; caso contrário, `balanced` e observação adicional.
- **Regra de não-pivot:** se `previewToPlay`, `replayEffectiveness` e `crossGameEffectiveness` estão `insufficient_data`, manter coleta 7 dias sem mudar formato/narrativa.

### Guardrails mantidos

- Sem novo jogo/formato/engine/CMS/auth/admin.
- Sem pivot de narrativa antes de massa crítica por efetividade.
- Coleta de sinais 7–14 dias sem expandir escopo de produto.

### Próximo

- Executar rotina semanal de distribuição por 14 dias completos com plano de efetividade.
- Validar se scorecards atingem `directional_signal` ou `useful_signal` de forma consistente.
- Consideração de formato médio (Tijolo 29 retomado) apenas após confirmação de narrativa central com massa crítica de run real.

## Tijolo 35A - Fundação visual profissional do primeiro arcade ✅

### Objetivo

Transformar "Tarifa Zero RJ — Corredor do Povo" de vertical slice funcional em fundação profissional de jogo: direção de arte coerente com a campanha, visual forte e legível, HUD recompensador, feedback visual claro e experiência sólida em mobile e desktop — sem expandir escopo de gameplay.

### Entregues

**Direção de arte e pipeline:**
- Documento completo de direção de arte (`docs/tarifa-zero-rj-art-direction.md`):
  - Paleta de cores oficial alinhada com identidade da campanha (#f9cf4a amarelo, #123d59 azul, #7ce0ae verde, #f45f5f vermelho).
  - Shape language definido: círculos para positivos, quadrado para bloqueio, estrela para chance rara.
  - Especificações de escala e tamanho (mobile-first, 360px mínimo).
  - Guidelines de feedback visual e integração com campanha.
- Pipeline de assets estruturado (`public/arcade/tarifa-zero/`):
  - Diretórios organizados (player/, pickups/, obstacles/, ui/, bg/).
  - README.md com convenções de nomenclatura, workflow de criação, prioridades (SVG > PNG > canvas).

**Refatoração visual do jogo:**
- Canvas com proporções melhores (9:16 mobile feel, adaptável a desktop, máx 640px largura).
- Background com gradiente profissional (azul profundo campanha).
- Lanes com highlight visual da lane do player (amarelo 15% alpha).
- Entidades renderizadas com:
  - Gradientes radiais para profundidade.
  - Bordas e sombras para melhor legibilidade.
  - Tamanhos aumentados e otimizados para mobile.
  - Cores da paleta oficial aplicadas.
- Player destacado: amarelo campanha (#f9cf4a), tamanho maior (18px raio), glow sutil, borda branca.
- Feedback visual aprimorado:
  - Flash de dano com vermelho translúcido.
  - Indicador "CHANCE!" com shadow/glow.
  - Combo ativo com banner destacado.

**HUD profissional:**
- HUD externo (fora do canvas):
  - Score destacado com label/valor separados.
  - Status do jogo (pausado/em jogo).
  - Layout em card com background sutil e bordas.
- HUD interno (dentro do canvas):
  - Barra de progresso no topo com gradiente verde.
  - Meter coletivo lateral vertical com gradiente amarelo.
  - Stats box no canto inferior esquerdo (apoios, mutirões, bloqueios).
  - Combo indicator central quando ativo.
- Controles touch melhorados:
  - Botões maiores com gradientes e sombras.
  - Ícones + labels claros.
  - Feedback hover/active.
  - Layout responsivo.

**Telas de entrada/saída melhoradas:**
- Intro screen:
  - Brief mais claro e direto.
  - Features visuais com ícones e descrições.
  - Layout profissional com cards de features.
- Result screen:
  - Score final destacado com amarelo campanha.
  - Stats em card com background sutil.
  - Botões e links com estilo consistente.

### Validação técnica

```bash
✅ npm run lint (0 warnings/errors)
✅ npm run type-check (sem erros TypeScript)
✅ npm run build (compilação Next.js 14 sucesso)
```

### Decisões de escopo

**Dentro do escopo (fundação profissional):**
- Direção de arte completa e alinhada com campanha.
- Refatoração visual do canvas (escala, cores, formas, feedback).
- HUD profissional interno e externo.
- Controles touch aprimorados.
- Telas de entrada/saída mais claras.

**Fora do escopo (não é polimento final):**
- Assets SVG/PNG customizados (ficam com canvas drawing profissional).
- Novos jogos ou engines.
- Novas mecânicas de gameplay.
- Animações complexas ou particles.
- Som e música.
- Novas features de tracking.

### Guardrails mantidos

- Gameplay funcional preservado 100% (mesma lógica de colisão, scoring, combo).
- Performance estável (60fps, mesmas otimizações).
- Tracking e analytics inalterados.
- Sem regressão em funcionalidades existentes.

### Próximo

- Observar runs reais para validar clareza visual em mobile/desktop.
- Considerar assets SVG customizados apenas após validação de fundação.
- Tijolo 35B (opcional): instrumentation arcade estendido se necessário.
- Manter foco em consolidação de efetividade (Tijolo 34) como prioridade operacional.