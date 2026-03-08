# Hub de Jogos da Pre-Campanha

Produto politico-jogavel para transformar pauta publica em decisao, consequencia e acao.

Status atual: Tijolo 38 concluido - duelo arcade `tarifa-zero-corredor` vs `mutirao-do-bairro` agora usa leitura de exposicao justa, com status de viés/correcao (`unbalanced_exposure`, `exposure_correction_in_progress`, `fair_comparison_window`, `decision_ready`) e recomendacoes corretivas propagadas para `/estado` e reports operacionais.

## Estado do Produto

- 4 engines reais publicas em `/play/[slug]` (quiz, branching, simulation, map).
- 3 runtimes arcade reais em `/arcade/[slug]` com canvas loop reutilizavel:
  - `tarifa-zero-corredor` (55s, lane-based collect/avoid, tarifa zero + apoio coletivo) - **fundação visual profissional** com direção de arte campanha, HUD forte e feedback claro
  - `passe-livre-nacional` (90s, positioning/coordination, sindicato + transporte público)
  - `mutirao-do-bairro` (90s, coordenacao de hotspots, reparo/defesa/mobilizacao, foco em ajuda mutua)
- Fundação visual arcade estabelecida e colocada em produção: paleta oficial (#f9cf4a, #123d59, #7ce0ae, #f45f5f), shape language, pipeline de assets e asset set `corredor-do-povo-v1` ativo no Tarifa Zero RJ.
- Tarifa Zero RJ com pass de assetização T35D + acabamento premium T35E:
  - background em layers (`bg-skyline-far`, `bg-skyline-mid`, `bg-corredor-road`)
  - player/ônibus amarelo estilizado integrado ao canvas
  - pickups e obstáculos reais em SVG com fallback seguro
  - HUD principal, badges de fase/evento e pós-run premium
  - variantes dedicadas para `bloqueio-sequencia` e `individualismo-cluster`
  - CTAs finais refinados e versão visual `T35E-premium-v7`
- Trilha arcade expandida com novo slice em producao:
  - `mutirao-do-bairro` no catalogo como `live/real`
  - docs de conceito/systems/art mantidas como contrato da implementacao
  - pipeline premium ativa em `public/arcade/mutirao-do-bairro/` com fallback de runtime preservado
  - bloco de efetividade do Mutirao integrado em `/estado`, `beta:snapshot`, `beta:export` e `beta:circulation-report`
- Avatar oficial da campanha como personagem recorrente.
- Card final universal compartilhavel em todos os jogos.
- Card final com QR code dinamico para reentrada.
- Pipeline de assets de campanha organizado (`public/campaign/`, `docs/assets/`) e pipeline local do Tarifa Zero formalizado em `public/arcade/tarifa-zero/README.md`.
- Minigames quick ativos: `custo-de-viver`, `quem-paga-a-conta` e `cidade-em-comum` (1-2 min, rejogaveis, compartilhaveis).
- Home reposicionada para entrada imediata com bloco `Jogue agora` acima da dobra, prioridade visual de arcades e entrada quick em paralelo.
- Preview vivo nos cards: animações CSS de pulso, glow, bounce para sensação de jogo real antes do clique.
- Card inteiro clicável com CTAs mais diretos e ação-orientados.
- Sistema de recomendações de próximos jogos baseado em série/território/formato.
- Replay fortalecido pós-run com botão prominente e 3 next-games sugeridos.
- Explorar reposicionada como catalogo jogavel: spotlight arcade, quick strip e filtros praticos por tipo/serie/territorio.
- Experimento ativo `final-card-qr-code` com variantes `with-qr` e `without-qr`.
- Operacao de feedback em `/estado/feedback` com rota protegida opcional.
- Audit log remoto ativo em `ops_audit_log`.
- Fallback local preservado quando Supabase nao esta disponivel.

## Operacao de Distribuicao (Tijolo 28)

Sistema completo de distribuicao de campanha:

- **Links rastreaveis** com UTMs por canal/territorio/serie (lib/campaign-links/)
- **Pacotes por canal** prontos para Instagram, WhatsApp, TikTok (reports/distribution/packages/)
- **Pacotes por territorio** com metas e prioridades (estado-rj, volta-redonda)
- **Brief semanal** acionavel (`npm run campaign:brief`)
- **Cockpit operacional** em `/estado` com "O que distribuir agora"
- **Roteiro semanal** documentado em `docs/operacao-semanal-distribuicao.md`

Scripts de campanha:

```bash
npm run campaign:links          # Gerar links de campanha rastreáveis
npm run campaign:brief          # Gerar brief semanal de distribuição
npm run beta:campaign-brief     # Alias operacional para campaign:brief
```

Documentos:
- `docs/distribuicao-links.md` - Sistema de links
- `docs/operacao-semanal-distribuicao.md` - Roteiro de 14 dias
- `docs/plano-distribuicao-quick.md` - Plano mestre

## Cockpit Temporal e Status de Coleta

- `/estado` com leitura por janela (`24h`, `7d`, `30d`, `all`).
- Severidade visual (`🟢/🟡/🔴`) com sinais acionaveis.
- Comparacao leve de tendencia (`24h vs 7d` ou `7d vs 30d`).
- Alertas de "ativo sem trafego" para experimentos/engine/CTA.
- Status de coleta por quick/serie/territorio (`coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`).
- Metas minimas de amostra por janela temporal (7d, 30d, all).
- Barra de progresso visual e recomendacoes operacionais de distribuicao.
- **Bloco "O que distribuir agora"** com quick/territorio/serie prioritarios (Tijolo 28).

Documento operacional: `docs/plano-distribuicao-quick.md`, `docs/plano-distribuicao-por-efetividade.md`

## Game Feel e Replay

- Intro curta nas engines com foco em primeira decisao rapida.
- Outcome com convite explicito para jogar de novo.
- Share page com CTA de reentrada para nova rodada.
- Assinatura de campanha reutilizavel e discreta em pontos de descoberta.

DocumentoArcade (Tijolo 29)

- Documento mestre: `docs/linha-arcade-da-campanha.md`.
- Runtime arcade reutilizavel em `components/games/arcade/ArcadeCanvasRuntime.tsx`.
- Vertical slice `Tarifa Zero RJ - Corredor do Povo` em `components/games/arcade/TarifaZeroArcadeGame.tsx`.
- Nova rota dedicada `/arcade/[slug]` para separar quick line e arcade line sem quebrar o hub.
- Telemetria dedicada:
  - `arcade_run_start`
  - `arcade_run_end`
  - `arcade_score`
  - `arcade_first_input_time`
  - `arcade_replay_click`
  - `arcade_powerup_collect`
  - `arcade_campaign_cta_click`
- Blocos novos em `/estado`:
  - linha arcade
  - runs
  - score medio
  - replay
  - first input time
  - CTA pos-run
  - comparacao quick vs arcade

  Front-stage (Tijolo 31)

  - Novos eventos de conversao na superficie publica:
    - `home_primary_play_click`
    - `home_arcade_click`
    - `above_fold_game_click`
    - `manifesto_expand_click`
    - `explorar_arcade_click`
    - `explorar_quick_click`
    - `explorar_filter_change`
  - Bloco dedicado em `/estado` com leitura de CTR arcade vs quick, cliques above-fold e uso de filtros.

  Conversão e Replay (Tijolo 32)

  - Preview vivo nos cards com animações CSS leves (pulso, glow, hover bounce).
  - Sistema de recomendações de próximos jogos (`lib/games/recommendations.ts`).
  - Replay fortalecido no outcome com botão prominente e 3 next-games sugeridos.
  - Novos eventos de conversão:
    - `card_preview_interaction`
    - `card_full_click`
    - `click_to_play_time`
    - `replay_after_run_click`
    - `next_game_after_run_click`
    - `quick_to_arcade_click`
    - `arcade_to_quick_click`
  - Bloco dedicado em `/estado` com métricas de preview CTR, replay rate pós-run, next game rate e cross-game conversão.

  Run Efetiva e Distribuição Guiada (Tijolo 33 + 34)

  - Camada de leitura de comportamento real em `lib/analytics/effective-runs.ts`.
  - Definições instrumentadas:
    - `effective_run_start`: card click + start/input válido em janela curta.
    - `effective_replay`: replay click + novo start em janela curta.
    - `effective_cross_game_start`: next-game click + start do próximo jogo em janela curta.
  - Scorecards de maturidade: `insufficient_data`, `monitoring`, `directional_signal`, `useful_signal`.
  - **Novidade Tijolo 34:**
    - Segmentação de efetividade por **canal** (`utm_source`) e **território** (derivado do slug).
    - Recomendação semanal acionável:
      - Jogo de 1º push (maior run efetiva).
      - Jogo de 2º clique (maior replay efetivo).
      - Canal prioritário.
      - Território promissor.
      - Direção quick ↔ arcade ou **regra explícita de não-pivot** quando amostra insuficiente.
    - Bloco dedicado em `/estado` com top run efetiva por canal e por território.
  - Reports beta incluem run efetiva, replay efetivo, cross-game efetivo, segmentação canal/território e direção quick → arcade vs arcade → quick.
  - Plano operacional: `docs/plano-distribuicao-por-efetividade.md`.
    - `home_quick_click`
    - `home_play_now_block_click`
    - `home_quick_vs_arcade_choice`
    - `arcade_vs_quick_preference`
    - `above_fold_game_click`
    - `manifesto_expand_click`
    - `explorar_arcade_click`
    - `explorar_quick_click`
    - `explorar_filter_change`
  - `/estado` com bloco "Front-stage da Home e Explorar" para leitura de:
    - cliques above-the-fold
    - CTR arcade vs quick na home
    - delta arcade-quick
    - preferencia quick-vs-arcade
    - sinal de interesse editorial (`manifesto_expand_click`)
    - uso de filtros no explorar como proxy de exploracao

## Linha  guia: `docs/game-feel-e-diversao.md`

## Linha de Jogos da Campanha

- Documento mestre: `docs/linha-de-jogos-campanha.md`.
- Motor ideologico: `docs/motor-ideologico-dos-jogos.md`.
- Avatar oficial: `docs/avatar-oficial-alexandre-fonseca.md`.
- Pipeline de assets: `docs/assets/README.md`.
- Taxonomia oficial por tempo (`quick`, `session`, `deep`, `future-flagship`).
- Linhas editoriais e series para navegacao de campanha.
- Escala territorial planejada: Volta Redonda -> Sul Fluminense -> Baixada -> Capital -> Estado do RJ.

Componentes visuais de campanha:
- `CampaignAvatar`: avatar oficial reutilizavel da campanha
- `FinalShareCard`: sistema universal de card final compartilhavel
- `CampaignMark`: assinatura de campanha discreta

Blueprints futuros (sem implementacao neste ciclo):
- `docs/formato-plataforma.md`
- `docs/formato-rpg.md`
- `docs/formato-tycoon.md`

## Operacao Continua

Scripts principais:

```bash
# Distribuição e campanha
npm run campaign:links              # Gerar links rastreáveis
npm run campaign:brief              # Brief semanal de distribuição

# Operação contínua
npm run beta:ops
npm run beta:staleness-check
npm run beta:snapshot
npm run beta:export
npm run beta:circulation-report
npm run beta:distribution-report
npm run ops:check-alerts
npm run ops:export-audit
```

Automacao (cron):
- Workflow: `.github/workflows/ops-routine.yml`
- Frequencia: a cada 6 horas
- Artefatos:
  - `reports/snapshots/`
  - `reports/exports/`
  - `reports/ops-alerts/`
  - `reports/ops/`

## Playbooks e Runbooks

- `docs/runbook-operacional.md`
- `docs/playbook-incidentes.md`
- `docs/alertas-severidade.md`
- `docs/guia-janelas-temporais.md`

## Gate Tecnico

```bash
npm run lint
npm run type-check
npm run test:unit
npm run build
npm run verify
```

Opcional quando estavel:

```bash
npm run test:e2e
```

Este ciclo nao adiciona:
- RPG/plataforma/tycoon completo
- auth obrigatoria para jogar
- integracao Slack/email
- painel admin enterprise

Foco: portal de jogos de campanha primeiro (arcade + quick com clique imediato), com leitura disciplinada de front-stage e sem inflar escopo para auth/CMS/admin.

## Pre-producao T36A - Mutirao do Bairro

Decisao do ciclo:
- rota A: novo arcade `Mutirao do Bairro`.

Entregas de pre-producao:
- conceito mestre: `docs/mutirao-do-bairro-game-concept.md`
- systems design: `docs/mutirao-do-bairro-systems-design.md`

## Implementacao T36B - Vertical Slice Mutirao do Bairro

Entregas de implementacao:
- runtime real em `/arcade/mutirao-do-bairro` com loop proprio (coordenacao territorial, nao lane-based).
- input mobile + mouse + teclado com equivalencia funcional (`1/2/3`, `Espaco`, `A/D`/setas e toque nos hotspots).
- HUD minima funcional (tempo, estabilidade, confianca, folego de mutirao, pressao).
- phases/eventos minimos (arranque, pressao, virada, fechamento + chuva/boato/onda/tranco).
- outcome screen com score, leitura da run, replay, proximo jogo, share e CTA de campanha.
- telemetria baseline ampliada com eventos do slice (`mutirao_action_used`, `mutirao_event_triggered`, `mutirao_pressure_peak`).
- bloco leve no `/estado` para eventos dedicados do mutirao.
- suite de testes consolidada:
  - `tests/unit/mutirao-do-bairro.test.ts` com 28 testes de logica critica
  - `tests/e2e/mutirao-do-bairro-slice.spec.ts` com smoke desktop/mobile + validacao premium de assets e tela final
- direcao de arte: `docs/mutirao-do-bairro-art-direction.md`
- pipeline de assets: `public/arcade/mutirao-do-bairro/README.md`

## Fechamento T36C

Entregas operacionais consolidadas:
- reports com leitura Mutirao (runs, collapse rate, score, pressao, replay, diversidade de acao, CTA pos-run e comparacao com Tarifa Zero RJ):
  - `tools/beta-snapshot.js`
  - `tools/beta-export.js`
  - `tools/beta-circulation-report.js`
- dashboard `/estado` com card dedicado de efetividade do Mutirao.
- validacao tecnica final:
  - `npm run lint` sem warnings
  - `npm run type-check` limpo
  - `npm run build` ok
  - `npm run test:unit` 43/43
  - `npm run test:e2e` 25/25

Escopo de implementacao fica para T36B (vertical slice jogavel).
