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

## Proximo

- Tijolo30 - Consolidacao da linha arcade com game feel melhorado e segundo jogo ✅

### Objetivo

Consolidar a linha arcade com dois jogos reais, melhorias de game feel baseadas em metricas e comparacao entre diferentes loops arcade.

### Entregues

- **Game feel melhorado no Tarifa Zero**:
  - Suavizacao do meter comum via interpolacao (visao continua, nao oscilante)
  - Indicador visual de combo ativo em tela (feedback de estado)
  - Novo tipo de entidade rara: "chance" nos ultimos 15s (recompensa tardia, +50 score)
  - HUD melhorado com mensagem de combo e feedback visual de sucesso
  - Resposta visual aprimorada em coleta/bloqueio
- **Segundo arcade real**: `Passe Livre Nacional - Sindicato em Movimento`
  - Loop diferente: positioning/coordination (90s) vs lane-based (55s)
  - Mecanica central: transportar passageiros entre paradas, defender contra privatizacao, organizar sindicato
  - Mecanica de coletividade: defesa sindicato + cobertura de rede vs ameaca de privatizacao
  - Telemetria integrada a pipeline arcade existente
- **Documentacao de Game Feel**:
  - `docs/game-feel-arcade.md` com framework de 8 dimensoes de qualidade ludica
  - Criterios de sucesso mensuráveis (time-to-fun, feedback latency, clareza risco/recompensa, etc)
  - Comparacao Tarifa Zero vs Passe Livre em termos de loop e mecanica politica
- **Comparacao entre arcades no `/estado`**:
  - Breakdown per-game (runs, replay rate, first input, score avg)
  - Sinalizacao de qual loop tem maior engajamento
  - Base de dados para decidir qual line cresce ou iteracoes futuras
- **Integracao completa**: ambos os arcades no catalogo com metadados, serie, eixo politico e CTA de campanha.
- **Validacao tecnica**: lint, type-check, test:unit, build, verify - todos passando sem regressoes.

### Nao inclui

- Terceiro arcade (fica para futuro)
- RPG/plataforma/tycoon grande
- Leaderboard global ou persistencia de score individual
- Animacoes sofisticadas ou engine de particula complexa
- Mobile app wrapper ou deep linking

## Proximo

- Tijolo 31: validacao por dados reais, iteracao de segunda rodada arcade se indicado, ou pivot para formato medio (2-6min).