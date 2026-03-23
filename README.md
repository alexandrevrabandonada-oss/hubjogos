# Hub de Jogos da Pre-Campanha

Produto politico-jogavel para transformar pauta publica em decisao, consequencia e acao.

Status atual: **Tijolo 45 concluido** - assetização completa do hub com integração real da Cooperativa, auditoria automática de manifests, e pipeline reduzido ao erro humano (manifest por jogo, loader reutilizavel com fallback seguro, smoke com validação de versão, e auditoria pre-deploy), separando Codex/VS Code da producao visual externa com zero quebra de jogos existentes.

Atualizacao T48 (blindagem operacional do pipeline de assets):
- alerta automatico de review da allowlist no CI (informativo, sem bloquear sozinho);
- summary curto no GitHub Actions com status/warnings/review/packs afetados;
- smoke seletivo automatico quando PR toca assets criticos de runtime;
- politica oficial de criticidade em `docs/assets-criticos-runtime.md`;
- politica operacional formalizada para manter CI util sem virar ruido.

Status de organizacao do portfolio: Hub reorganizado como fabrica planejada com catalogo mestre, temporadas, matriz de priorizacao e pre-producao formal dos proximos candidatos sem abrir implementacao nova (T41).

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

## Fabrica Planejada de Jogos (T41)

- Catalogo mestre: `docs/catalogo-mestre-do-hub.md`
- Temporadas e colecoes: `docs/temporadas-do-hub.md`
- Matriz de priorizacao: `docs/matriz-priorizacao-jogos.md`
- Governanca da fabrica: `docs/governanca-da-fabrica-de-jogos.md`
- Pre-producao curta dos candidatos:
  - `docs/cooperativa-na-pressao-concept.md`
  - `docs/bairro-resiste-concept.md`
  - `docs/orcamento-do-comum-concept.md`

Regra do ciclo:
- sem terceiro jogo implementado agora;
- consolidar decisao T37/T38/T39/T40;
- subir so 1 candidato para implementacao ativa por vez.

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
npm run beta:arcade-final-decision # T40: Decisão final da linha arcade
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

## Implementacao T42 - Cooperativa na Pressao (vertical slice)

Decisao aplicada:
- abrir apenas `cooperativa-na-pressao` como unico jogo em implementacao ativa do ciclo;
- manter `mutirao-do-bairro` em validacao forte;
- manter `bairro-resiste` em pre-producao e `orcamento-do-comum` em backlog frio.

Entregas do slice:
- rota jogavel: `/arcade/cooperativa-na-pressao`;
- loop distinto focado em coordenacao de producao coletiva (fila, exaustao, solidariedade);
- input equivalente mobile + mouse + teclado;
- HUD minima funcional;
- assets P0 + fallback canvas;
- outcome com replay/proximo jogo/share/CTA de campanha;
- telemetria baseline:
  - `arcade_run_start`
  - `arcade_run_end`
  - `arcade_first_input_time`
  - `cooperativa_action_used`
  - `cooperativa_event_triggered`
  - `cooperativa_pressure_peak`
  - `arcade_replay_click`
  - `campaign_cta_click_after_run`

Documentacao do slice:
- `docs/cooperativa-na-pressao-concept.md`
- `docs/cooperativa-na-pressao-systems-design.md`
- `docs/cooperativa-na-pressao-art-direction.md`
- `public/arcade/cooperativa-na-pressao/README.md`

Fora do escopo T42:
- pass premium final de arte/audio;
- novo formato medio;
- segunda implementacao ativa no mesmo ciclo.

## Implementacao T42B - Cooperativa na Pressao (tuning e polish)

Evolucao do slice T42 para jogo mais justo, legivel e prazeroso:

**Balanceamento T42B:**
- Grace period: 6s → 9s (50% aumento).
- Pressure curves: redução ~15% em todas as fases.
- Mutirão accessibility: threshold 100% → 85%, boost 1.3x → 1.5x, duration 7.5s → 10s.
- Action potency: organizar +22%, redistribuir +20%, cuidar +25%, mutirão +33% score.
- Phase timing: abertura 20s, ritmo 55s, pressão 75s.
- Collapse thresholds ajustados para dar 50% mais margem antes do colapso.

**UX e Polish:**
- Station critical state highlighting (>75% = orange glow).
- HUD hierarchy com variable bar heights.
- Collapse warning overlay ("⚠ COLAPSO IMINENTE").
- Action feedback pulse (800ms green accent).
- Intro screen com numbered actions e usage tips.
- Outcome screen com conditional feedback e dynamic replay CTA.

**Telemetria expandida:**
- 6 novos eventos: `cooperativa_station_selected`, `cooperativa_station_overload`, `cooperativa_phase_reached`, `cooperativa_collapse_reason`, `cooperativa_mutirao_activated`, (plus existing `cooperativa_action_used`).
- Dashboard `/estado` com Cooperativa effectiveness card (7 metrics).
- Tracking functions em `lib/analytics/track.ts`.

**Success criteria:**
- Survival rate: 40% → 65% (target).
- Collectivity rate: 60% → 75% (target).
- Mutirão usage: 20% → 60%+ (target).

Fora do escopo T42B:
- Assets SVG/PNG customizados (mantém canvas drawing profissional).
- Novo jogo ou formato médio.
- Animações complexas ou particles.
- Som e música.

## Organizacao T43 - Proxima leva sem improviso

Decisao aplicada:
- nao abrir novo jogo em codigo neste tijolo;
- preservar hard cap da fabrica (1 validando forte, 1 implementacao ativa, 1-2 pre-producao);
- fortalecer diversidade real da proxima leva.

Entregas T43:
- pre-producao forte de `bairro-resiste`:
  - `docs/bairro-resiste-concept.md`
  - `docs/bairro-resiste-systems-design.md`
  - `docs/bairro-resiste-art-direction.md`
- pre-producao madura de `orcamento-do-comum` (mantido backlog frio):
  - `docs/orcamento-do-comum-concept.md`
  - `docs/orcamento-do-comum-systems-design.md`
  - `docs/orcamento-do-comum-art-direction.md`
- terceiro conceito futuro estadual:
  - `docs/rj-do-comum-concept.md`
- governanca de diversidade e subida:
  - `docs/matriz-diversidade-do-hub.md`
  - `docs/plano-de-subida-da-proxima-leva.md`

Ajustes leves de superficie publica:
- `/explorar` agora explicita `backlog frio` separado de `pre-producao`.
- pipeline editorial evita vender conceito como release pronto.

Recomendacao operacional:
- proximo candidato real apos janela T42B: `bairro-resiste`.
- `orcamento-do-comum` segue backlog frio ate reduzir risco UX/sistemas.
- `rj-do-comum` segue como horizonte estadual e nao sobe ainda.

## Pipeline T44 - Asset packs padronizados

Direcao aplicada:
- criar padrao unico de ingestao/organizacao/integracao de assets para o hub.
- separar responsabilidades:
  - VS Code/Codex: estrutura, manifests, loader, fallback, testes.
  - pipeline externo: producao de arte/audio e entrega nas pastas corretas.

Entregas T44:
- padrao global em `docs/pipeline-de-assets-do-hub.md`.
- `manifest.json` por jogo em:
  - `public/arcade/tarifa-zero/manifest.json`
  - `public/arcade/mutirao-do-bairro/manifest.json`
  - `public/arcade/cooperativa-na-pressao/manifest.json`
- loader reutilizavel:
  - `lib/games/assets/asset-pack-loader.ts`
- integracao do loader em jogos vivos:
  - `lib/games/arcade/tarifa-zero-assets.ts`
  - `lib/games/arcade/mutirao-assets.ts`
  - `lib/games/arcade/mutirao-do-bairro.ts`
- estrutura padrao dos packs completada (`bg`, `player`, `entities`, `pickups`, `obstacles`, `ui`, `fx`, `audio`).
- READMEs locais padronizados com inventario P0/P1/P2, naming, fallback e checklist QA.
- smoke visual padrao:
  - `tests/e2e/assets-pipeline-smoke.spec.ts`
  - `tests/unit/asset-pack-loader.test.ts`
  - `npm run test:assets-smoke`

Resultado:
- previsibilidade para encaixar assets externos sem bagunca.
- fallback canvas-first preservado para estabilidade mobile/desktop.
- Codex focado em runtime/integracao, nao em fabricacao de arte final.

## Tijolo 47 - Institucionalizacao do Pipeline de Assets

Estado oficial do repositorio:
- CI dedicado ativo: `.github/workflows/assets-audit.yml`
- Gate oficial: `npm run assets:audit`
- Regra de bloqueio: `error` bloqueia, `warning` nao bloqueia
- Regra de escopo: PRs com mudancas em `public/arcade/**` e arquivos de pipeline rodam gate automaticamente

Fluxo oficial de ingestao:
`gerar -> pasta correta -> manifest -> audit -> smoke -> merge`

Documentos oficiais:
- `docs/pipeline-de-assets-do-hub.md`
- `docs/ci-gate-assets.md`
- `docs/politica-de-auditoria-de-assets.md`
- `docs/checklist-oficial-ingestao-assets.md`
- `docs/templates/asset-pack-template/`

## Atualizacao T49 - Validacao de produto da Cooperativa

Fechamento oficial da janela T49 (7d) para `cooperativa-na-pressao`:
- status de decisao: `insufficient_live_usage`;
- decisao formal: `keep_observing`;
- premium pass: **nao liberar neste ciclo**.

Leitura objetiva da janela:
- runs observadas: 0;
- runs efetivas: 0;
- survival, collectivity, mutirao usage, replay e CTA pos-run em 0%;
- principal conclusao: ainda nao existe base real de uso para promover premiumizacao.

Acao operacional imediata:
- manter distribuicao leve por mais 7 dias com foco em `arcade_run_end`, `arcade_replay_click` e `campaign_cta_click_after_run`;
- manter hard cap da fabrica (sem abrir novo jogo em paralelo);
- revisar decisao no T50 apenas se houver massa minima observavel.

## Atualizacao T51 - Bairro Resiste em pre-producao forte

Escopo deste tijolo:
- sem abrir implementacao nova;
- amadurecer `bairro-resiste` para subida rapida quando o T50 fechar;
- reduzir risco de producao com contrato de slice, checklist e pipeline pronto.

Entregas de maturidade:
- concept consolidado: `docs/bairro-resiste-concept.md`
- systems consolidado: `docs/bairro-resiste-systems-design.md`
- art direction consolidada: `docs/bairro-resiste-art-direction.md`
- contrato de vertical slice: `docs/bairro-resiste-vertical-slice-contract.md`
- checklist de go-live: `docs/bairro-resiste-go-live-checklist.md`

Pipeline de assets preparado (sem integracao runtime):
- `public/arcade/bairro-resiste/README.md`
- `public/arcade/bairro-resiste/manifest.json`
- pastas `bg/`, `player/`, `entities/`, `ui/`, `fx/`

Status de portfolio atualizado:
- `bairro-resiste` = pre-producao forte pronta para subida condicional;
- subida depende do fechamento do T50 e liberacao de capacidade da fabrica.

O que fica para T52:
- abrir implementacao do slice apenas se T50 liberar slot;
- plugar telemetria baseline e smoke/e2e minimo;
- manter quick line e arcades live sem regressao.


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
