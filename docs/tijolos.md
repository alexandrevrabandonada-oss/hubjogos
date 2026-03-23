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
- Tijolo 37 ✅ decisao oficial da linha arcade (T37) com scorecard de campanha
- Tijolo 38 ✅ duelo justo por exposicao (T38) com leitura de fairness
- Tijolo 39 ✅ convergencia de decisao (T39) com scorecard de 6 dimensoes
- Tijolo 40 ✅ janela final de decisao da linha arcade (T40) com persistencia e stability tracking
- Tijolo 41 ✅ fabrica planejada de jogos (catalogo mestre + temporadas + matriz + governanca)
- Tijolo 42 ✅ cooperativa na pressao (vertical slice jogavel com loop proprio)
- Tijolo 42B ✅ cooperativa na pressao - tuning de balanceamento e polish de UX
- Tijolo 43 ✅ proxima leva organizada com diversidade e plano de subida
- Tijolo 44 ✅ pipeline padrao de assets com manifest, loader e smoke visual
- Tijolo 45 ✅ fechamento real do pipeline com integracao completa de cooperativa + auditoria automatica
- Tijolo 47 ✅ institucionalizacao oficial do pipeline no CI/pre-merge com checklist e template
- Tijolo 49 ✅ validacao oficial da cooperativa com scorecard e decisao conservadora (`keep_observing`)
- Tijolo 50 ? ativacao e observacao viva, decis�o final em 16/03
- Tijolo 58 ? Bairro Resiste: tuning e profundidade
- Tijolo 60 ? Bairro Resiste: premium pass e assets finais
- Tijolo 61 ? Governan�a editorial (LIVE_BUT_EARLY)
- Tijolo 62 ? Amostragem e ativa��o controlada (Amostra 30 runs)
- Tijolo 63 ? Re-avalia��o T63 e Promo��o (LIVE_GROWING)
## Tijolo 40 - Janela Final de Decisao da Linha Arcade ✅

### Objetivo

Fechar a janela fair de comparacao arcade e produzir decisao final auditavel sobre qual arcade deve puxar a proxima fase do produto - ou confirmar explicitamente que ainda nao ha base para decidir.

### Entregues

- Script consolidado `npm run beta:arcade-final-decision` com saidas:
  - `focus_tarifa_zero`
  - `focus_mutirao`
  - `maintain_dual_arcade`
  - `defer_new_product`
- Persistencia de estado e stability tracking (7d rule para `decision_candidate`).
- Integracao completa T37 + T38 + T39 -> T40.
- Blockers e enablers explicitos.
- `/estado` atualizado com bloco T40 de estabilidade e persistencia.
- `beta:campaign-brief` com recomendacao decisiva de concentracao ou dual.
- `beta:distribution-report` com status operacional da decisao.
- Reports salvos em `reports/arcade-decision/` com timestamp e formato JSON/MD.

### Decisao atual

- **Estado:** `defer_new_product` (bloqueada)
- **Blockers:** Exposicao desequilibrada (100pp), lideres divergem em multiplas dimensoes
- **Recomendacao:** Continuar coleta pareada com distribuicao equilibrada ate exposicao justa

### Gate validado

- lint
- type-check
- test:unit
- build
- verify

### Nao inclui

- criacao de novo jogo;
- abertura de formato medio automaticamente;
- mudanca de superficie sem autorizacao formal.

## Tijolo 41 - Fabrica planejada do hub ✅

### Objetivo

Organizar o Hub como portfolio planejado de jogos politicos, com pre-producao antes de implementacao e sem abrir novo jogo neste ciclo.

### Entregues

- Catalogo mestre oficial: `docs/catalogo-mestre-do-hub.md`.
- Temporadas e colecoes: `docs/temporadas-do-hub.md`.
- Matriz de priorizacao e shortlist: `docs/matriz-priorizacao-jogos.md`.
- Pre-producao curta de 3 candidatos:
  - `cooperativa-na-pressao`
  - `bairro-resiste`
  - `orcamento-do-comum`
- Regra de governanca da fabrica: `docs/governanca-da-fabrica-de-jogos.md`.
- Ajuste leve no `/explorar` para separar live, validacao e pipeline editorial.

### Nao inclui

- abertura de terceiro arcade implementado;
- nova engine;
- mudanca de escopo para auth/CMS/admin.

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

## Tijolo 49 - Validacao oficial da Cooperativa ✅

### Objetivo

Fechar a decisao de produto da `cooperativa-na-pressao` com base em uso real recente, sem abrir novo jogo e sem premiumizar por suposicao.

### Entregues

- Scorecard oficial T49 com:
  - runs observadas e efetivas
  - survival rate
  - collectivity rate
  - mutirao usage
  - replay rate
  - CTA pos-run
  - first input medio
  - causa principal de colapso
  - acao dominante e estacao critica
- Estados de decisao incorporados em toda a operacao (`/estado` e reports).
- Decisao final padronizada na camada operacional.

### Decisao oficial

- Estado: `insufficient_live_usage`
- Decisao final: `keep_observing`
- Premium pass: nao liberado no T49

### Leitura da janela

- Runs observadas: 0
- Runs efetivas: 0
- Survival/collectivity/mutirao/replay/CTA: 0%
- Conclusao: sem massa critica para tuning adicional pesado ou premiumizacao.

### Proximo passo (T50)

- manter observacao por mais 7 dias;
- focar distribuicao em sinais de run encerrada e reentrada;
- so reabrir decisao de premium pass com evidencias consistentes.

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

## Tijolo 42 - Cooperativa na Pressao (vertical slice) ✅

### Objetivo

Abrir apenas um jogo em implementacao ativa da fabrica (`cooperativa-na-pressao`) com slice jogavel minimo e loop proprio.

### Entregues

- runtime jogavel em `/arcade/cooperativa-na-pressao`;
- logica de jogo em `lib/games/arcade/cooperativa-na-pressao.ts`;
- componente de jogo em `components/games/arcade/CooperativaNaPressaoArcadeGame.tsx`;
- input touch/mouse/teclado equivalente;
- HUD minima com recursos centrais do loop;
- assets P0 em `public/arcade/cooperativa-na-pressao/`;
- outcome screen com replay/share/CTA campanha;
- telemetria baseline cooperativa;
- teste unitario e smoke e2e do slice.

### Nao inclui

- pass premium final de arte/audio;
- novo formato medio;
- segunda implementacao ativa em paralelo.

## Tijolo 42B - Cooperativa na Pressao - Tuning e Polish ✅

### Objetivo

Evoluir `cooperativa-na-pressao` de um vertical slice funcional (T42) para um slice mais justo, legível e prazeroso por meio de tuning de balanceamento, polish de UX e telemetria mais útil. Este tijolo NÃO abre novo jogo, NÃO abre formato médio, NÃO infla escopo com assets premium completos ainda.

Foco: balanceamento, clareza do loop, ritmo da run, feedback das ações, legibilidade da pressão/solidariedade, replay.

### Entregues

**Balanceamento (T42B):**
- Grace period: 6s → 9s (50% aumento).
- Pressure curves: redução ~15% em todas as fases (abertura 0.006→0.005, ritmo 0.0105→0.009, pressão 0.015→0.013, colapso 0.019→0.016).
- Mutirão accessibility: threshold 100% → 85%, boost 1.3x → 1.5x, duration 7.5s → 10s, score 90 → 120.
- Action potency: organizar 18→22, redistribuir 10→12/4→5, cuidar 12→15, mutirão charge gains aumentados.
- Phase timing: abertura 18s→20s, ritmo 50s→55s, pressão 72s→75s.
- Collapse thresholds: estabilidade <26→<22, solidariedade <24→<20, pressão >92→>94.
- Documentação completa em `docs/cooperativa-na-pressao-systems-design.md` (seção T42B com tabelas comparativas).

**UX e Polish:**
- Station legibility: critical state highlighting (>75% backlog/burnout = orange glow), selected station glow effect.
- HUD hierarchy: variable bar heights (estabilidade 12px, solidariedade 11px, pressão 10px), mutirão ready highlight.
- Collapse warning: red overlay + "⚠ COLAPSO IMINENTE" when burnoutWarning > 3s.
- Action feedback: 800ms pulse with green accent line on action use.
- Intro screen: numbered actions (1-2-3-Espaço), clear objective, usage tips per action.
- Outcome screen: conditional feedback (≥75% collectivity = coordination praise, <60% = improvement hint), dynamic replay button text, duration display.
- HUD badges: "T42B-tuned" / "cooperativa-v2".

**Telemetria T42B:**
- 6 new event types:
  - `cooperativa_station_selected` (navigation tracking).
  - `cooperativa_station_overload` (when backlog/burnout >80% with 3% chance per frame).
  - `cooperativa_phase_reached` (phase transitions).
  - `cooperativa_collapse_reason` (with reason: estabilidade/solidariedade/pressao/burnout/<0 resource).
  - `cooperativa_mutirao_activated` (mutirão usage).
  - (plus existing `cooperativa_action_used`).
- Extended `ArcadeRuntimeEvent` with station_select, station_overload, collapse types.
- 5 new tracking functions in `lib/analytics/track.ts`.
- Component integration in `CooperativaNaPressaoArcadeGame.tsx` with all events wired.
- `/estado` integration: Cooperativa effectiveness card with 7 metrics (actions, phases, mutirões, stations, peaks, colapsos, events) + tech note T42B.

### Validação técnica

```bash
✅ npm run lint (0 warnings/errors)
✅ npm run type-check (sem erros TypeScript)
✅ npm run test:unit (48 passed)
✅ npm run build (compilação Next.js 14 sucesso)
```

### Decisões de escopo

**Dentro do escopo (tuning + polish):**
- Balanceamento de 14 parâmetros simultâneos.
- Visual feedback (station highlighting, HUD hierarchy, collapse warnings, action pulses).
- Onboarding clarity (intro screen).
- Outcome improvement (conditional feedback, replay CTA).
- Telemetria útil (6 novos eventos, dashboard /estado).

**Fora do escopo (não é premium pass):**
- Assets SVG/PNG customizados.
- Novos jogos ou engines.
- Novas mecânicas de gameplay.
- Animações complexas ou particles.
- Som e música.
- Novo formato médio.

### Guardrails mantidos

- Gameplay core preservado (mesmas 4 ações, mesmas 4 estações, mesmo loop de recursos/pressão/eventos).
- Performance estável (60fps, mesmo runtime canvas).
- Tracking backward compatible.
- Sem regressão em funcionalidades existentes.

### Success criteria (T42B)

- Survival rate: 40% → 65% (target).
- Collectivity rate: 60% → 75% (target).
- Mutirão usage: 20% → 60%+ (target).
- Replay rate: observar 7 dias pós-deploy.
- Telemetria: events flowing sem errors, /estado mostrando sinais.

### Próximo

- Observar runs reais T42B por 7 dias para validar balanceamento e polish.
- Consideração de premium pass (assets SVG, audio, particles) apenas após confirmação de balanceamento estável.
- Manter foco em consolidação de efetividade antes de abrir novo jogo ou formato médio.

## Tijolo 43 - Fabrica viva da proxima leva ✅

### Objetivo

Continuar o crescimento do hub de forma organizada, planejada e diversa, aprofundando a pre-producao da proxima leva sem abrir implementacao nova antes da hora.

### Entregues

- diagnostico da fabrica atualizado em documentos-base (`catalogo`, `temporadas`, `matriz`, `governanca`);
- aprofundamento de `bairro-resiste` com pacote completo:
  - `docs/bairro-resiste-concept.md`
  - `docs/bairro-resiste-systems-design.md`
  - `docs/bairro-resiste-art-direction.md`
- aprofundamento de `orcamento-do-comum` com pre-producao madura:
  - `docs/orcamento-do-comum-concept.md`
  - `docs/orcamento-do-comum-systems-design.md`
  - `docs/orcamento-do-comum-art-direction.md`
- abertura de terceiro conceito futuro estadual:
  - `docs/rj-do-comum-concept.md`
- criacao da matriz de diversidade:
  - `docs/matriz-diversidade-do-hub.md`
- criacao do plano de subida da proxima leva:
  - `docs/plano-de-subida-da-proxima-leva.md`
- revisao do catalogo mestre e temporadas para refletir:
  - live
  - validando forte
  - implementacao ativa observada
  - pre-producao forte
  - backlog frio maduro
- ajuste leve em `/explorar` para separar `pre-producao` e `backlog frio` sem prometer release.

### Guardrails mantidos

- nenhum novo jogo aberto em codigo;
- nenhum formato medio aberto automaticamente;
- hard cap da fabrica preservado;
- quick line e arcades existentes preservados sem regressao funcional.

### Recomendacao explicita

- quem sobe depois de `cooperativa-na-pressao`: `bairro-resiste`, se janela T42B estabilizar e houver capacidade livre.
- quem continua em pre-producao: `bairro-resiste` (ate gate de subida).
- quem fica em backlog frio: `orcamento-do-comum` e `rj-do-comum`.

### Nao inclui

- implementacao de novo runtime de jogo;
- premium pass de arte/audio para cooperativa;
- abertura de linha media em codigo.

## Tijolo 44 - Pipeline padrao de assets do hub ✅

### Objetivo

Criar um sistema padrao de ingestao, organizacao e integracao de assets para o hub, separando claramente runtime/editor de producao visual externa.

### Entregues

- diagnostico dos pipelines existentes de assets (tarifa, mutirao e cooperativa).
- padrao global de asset pack em `public/<line>/<slug>/` com:
  - `bg/`, `player/`, `entities/`, `pickups/`, `obstacles/`, `ui/`, `fx/`, `audio/`
- manifest por jogo:
  - `public/arcade/tarifa-zero/manifest.json`
  - `public/arcade/mutirao-do-bairro/manifest.json`
  - `public/arcade/cooperativa-na-pressao/manifest.json`
- loader utilitario reutilizavel:
  - `lib/games/assets/asset-pack-loader.ts`
- integracao aplicada em 2 jogos vivos:
  - `tarifa-zero-corredor`
  - `mutirao-do-bairro`
- README local padrao dos packs com inventario P0/P1/P2, naming e checklist QA.
- convencao de nomes consolidada:
  - `<categoria>-<nome>-v<versao>.<ext>`
- smoke visual padrao:
  - `tests/unit/asset-pack-loader.test.ts`
  - `tests/e2e/assets-pipeline-smoke.spec.ts`
  - `npm run test:assets-smoke`
- documentacao mestre de pipeline:
  - `docs/pipeline-de-assets-do-hub.md`

### Guardrails mantidos

- sem quebra dos jogos existentes.
- fallback canvas-first preservado.
- separacao entre placeholder e asset final.
- performance mobile/desktop mantida.

### Nao inclui

- geracao de arte final dentro do VS Code.
- abertura de novo jogo em codigo.
- pass premium audiovisual automatico.

## Tijolo 45 - Fechamento Real do Pipeline de Assets ✅

### Objetivo

Fechar de verdade o pipeline padrao, integrando a cooperativa ao manifest/loader runtime e criando auditoria automatica que reduza erro humano e permitir pre-deployment validation.

### Entregues

- diagnostico refinado: confirmacao do que esta integrado (tarifa, mutirao) vs parcial (cooperativa no T44).
- integracao COMPLETA de `cooperativa-na-pressao`:
  - novo arquivo `lib/games/arcade/cooperativa-assets.ts` com tipo CooperativaAssetKey
  - componente `CooperativaNaPressaoArcadeGame` agora importa e exporta COOPERATIVA_VISUAL_VERSION e COOPERATIVA_ASSET_SET
  - runtime consome manifest.json completamente (nao mais hardcoded)
  - smoke test adicionado em `tests/e2e/assets-pipeline-smoke.spec.ts`
- script de auditoria automatica:
  - `npm run assets:audit` - validates manifest ↔ disk consistency
  - severidades: ok, warning, error
  - output: console report + JSON em `reports/assets/`
  - bloqueia deploy com exit code 1 se assets faltarem
- smoke tests MELHORADOS:
  - mantidas 8 testes existentes
  - adicionado 3 novo teste de manifest awareness (3 games × manifest-awareness variant)
  - validacao de visualVersion e assetSet na tela
  - total: 11 E2E + 4 unit = 15 testes de cobertura
- baseline pipeline documentado:
  - `reports/assets/baseline-pipeline-state.md`
  - tabela de status por jogo (manifest, loader, fallback, smoke)
  - guia de integracao para novos jogos
- documentacao atualizada:
  - `docs/pipeline-de-assets-do-hub.md` - adicionado secao T45 e audit system
  - `README.md` - status linha mudada para "Tijolo 45 concluido"
  - `docs/roadmap.md` - novo modulo T45 com entrega e recomendacoes T46
  - `docs/tijolos.md` - novo protocolo T45 registrado

### Guardrails mantidos

- zero quebra em games existentes.
- fallback canvas-first preservado.
- performance mobile/desktop mantida.
- auditoria nao bloqueia desenvolvimento (exit 1 apenas para missing assets).

### Nao inclui

- geracao de arte final dentro do VS Code.
- abertura de novo jogo em codigo.
- refactoring de ativos legados (naming normalizacao adiada para T47).
- premium pass automatico para cooperativa (aguarda liberacao de P1/P2).
## Tijolo 46 - Hardening operacional do pipeline de assets ✅

### Objetivo

Evoluir o pipeline de assets de funcional para operacionalmente confiavel: menos ruido de orfaos, politica clara de auditoria e gate previsivel para crescimento continuo.

### Entregues

- bug fix critico no audit: comparacao de paths normalizada para Windows/Linux (\\ -> /).
- estado real descoberto apos fix: apenas 3 orfaos legados (mutirao v1) em vez de dezenas de falsos positivos.
- politica oficial criada: docs/politica-de-auditoria-de-assets.md.
- gate oficial criado: docs/ci-gate-assets.md.
- allowlist implementada e ativa: 	ools/assets-audit-allowlist.json.
- audit integrado com allowlist por jogo em 	ools/assets-audit.js.
- exit code do audit refinado:
  - error -> bloqueia (1)
  - warning/ok -> permite (0)
- health report executivo validado no output do audit.
- status final limpo: OK: 3 / Warning: 0 / Error: 0.

### Validacao tecnica

`ash
✅ npm run assets:audit
✅ npm run lint
✅ npm run type-check
✅ npm run test:unit (52/52)
✅ npm run build
✅ npm run verify
✅ npm run test:assets-smoke (4 unit + 9 e2e)
`

### Guardrails mantidos

- sem quebrar runtime dos jogos existentes.
- sem remover assets legados sem justificativa.
- sem promover warning a erro sem politica formal.

### Proximo

- revisar allowlist trimestralmente e limpar legados vencidos.
- consolidar workflow dedicado de assets audit em CI.
- manter 
pm run assets:audit como gate obrigatorio de PR com alteracoes em assets.

## Tijolo 47 - Institucionalizacao oficial do pipeline de assets ✅

### Objetivo

Institucionalizar o pipeline de assets no CI/pre-merge para sair de "funciona localmente" e virar regra oficial do repositorio.

### Entregues

- workflow dedicado de gate: `.github/workflows/assets-audit.yml`.
- regra de escopo de PR para mudancas de assets e pipeline.
- `assets:audit` com resumo executivo operacional.
- comando novo: `npm run assets:health-report`.
- allowlist revisada e documentada com metadata de revisao.
- checklist oficial de ingestao criado em `docs/checklist-oficial-ingestao-assets.md`.
- template oficial de Asset Pack criado em `docs/templates/asset-pack-template/`.
- validacao end-to-end executada com alteracao segura em pack existente.

### Guardrails

- sem abrir novo jogo.
- sem mudar pesado logica dos arcades.
- sem apagar legado cegamente.
- fallback e smoke preservados.

## Tijolo 51 - pre-producao forte do Bairro Resiste ✅

### Objetivo

Maturar `bairro-resiste` para subida rapida e organizada no pos-T50, sem abrir implementacao nova durante a janela ativa da Cooperativa.

### Entregues

- consolidacao de conceito/sistemas/arte:
  - `docs/bairro-resiste-concept.md`
  - `docs/bairro-resiste-systems-design.md`
  - `docs/bairro-resiste-art-direction.md`
- contrato de vertical slice:
  - `docs/bairro-resiste-vertical-slice-contract.md`
- checklist de go-live:
  - `docs/bairro-resiste-go-live-checklist.md`
- pipeline de assets preparado:
  - `public/arcade/bairro-resiste/README.md`
  - `public/arcade/bairro-resiste/manifest.json`
  - estrutura `bg/`, `player/`, `entities/`, `ui/`, `fx/`
- catalogo/plano de subida atualizados para status de prontidao condicional.

### Guardrails mantidos

- sem novo jogo em codigo;
- sem furar hard cap da fabrica;
- sem regressao de quick line e arcades existentes;
- sem premiumizacao por ansiedade durante T50.

### O que fica para T52

- subir `bairro-resiste` apenas se T50 liberar capacidade;
- implementar slice de 90s conforme contract, sem inflar escopo;
- ativar telemetria baseline e smoke/e2e minimo no primeiro build.


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

## Tijolo 62 - Amostragem e Ativação Controlada ✅

### Objetivo
Sair do estado de "amostra fria" do `bairro-resiste` e validar sanidade da telemetria com base real de 30 runs.

### Entregas
- Correção de tracking de `game_view` no arcade.
- Bloco de amostragem no `/estado` com meta de 30 runs.
- Rail "Novas Missões" na Home para ativação controlada.
- Relatório de ativação em `reports/t62-estado-da-nacao.md`.

---

## Tijolo 63 - Re-avaliação e Promoção Editorial ✅

### Objetivo
Analisar a amostra real de 30+ runs para decidir o destino editorial do `bairro-resiste`.

### Entregas
- Scorecard T63 (Funil + Engajamento + Replay).
- Benchmark comparativo: Bairro Resiste Replay (43%) vs Tarifa Zero (0%).
- Dashboard `/estado` atualizado para `LIVE_GROWING`.
- Promoção editorial do jogo e formalização do status de validação.

### Scorecard Final T63
- **View -> Start**: 35%
- **Start -> Completion**: 80%
- **Replay Rate**: 43%
- **Veredito**: LIVE_GROWING.
---

---

## Tijolo 64 - Rebalanceamento e Cleanup Editorial (Bairro Resiste)
- **Objetivo**: Corrigir gargalos de UX e gameplay identificados no T63.
- **Entregáveis**:
  - Cleanup da página do jogo (CTA above the fold, remoção de redundâncias).
  - Rebalanceamento do hotspot Saúde (pressão inicial 0, taxa 0.9x).
  - Soft promotion no catálogo e dashboard.
- **Veredito**: LIVE_GROWING (Refinado).
---

---

## Tijolo 65 - Validação Pós-T64 & Hero Readiness (Bairro Resiste)
- **Objetivo**: Confirmar o rebalanceamento e cleanup do T64 e decidir status de Hero.
- **Amostra**: 105 runs (Meta 100 atingida).
- **Efeito Gameplay**: Saúde superada por Moradia (30%) como principal crítico. Rebalance validado.
- **Efeito UX**: View -> Start subiu para 42% com novo CTA.
- **Veredito**: HERO_TEST_CANDIDATE.
---

---

## Tijolo 66 - Hero Promotion Test (Bairro Resiste)
- **Objetivo**: Implementar teste controlado de troca do Hero Banner.
- **Flag**: hub-hero-variant (bairro-resiste: 100% weight).
- **Instrumentação**: Track de impressões e cliques do hero com metadados de variante.
- **UX**: Adição de Trust Signals (micro-sinais) sob o hero.
- **Veredito**: Experimento ativo.
---
