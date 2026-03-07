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

## Proximo

- Tijolo 23: refinar asset do avatar com designer profissional, variacoes de expressao, primeiro minigame quick novo validando throughput com avatar, QR code no card final.
