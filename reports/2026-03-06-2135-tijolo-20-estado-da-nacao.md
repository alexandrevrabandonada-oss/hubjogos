# Estado da Nacao - Tijolo 20

Data: 2026-03-06 21:35
Status: concluido com gate tecnico validado

## 1) Diversao real melhorada

- Intros das 4 engines encurtadas com foco em decisao inicial rapida.
- Novo bloco de "Comeco rapido" em `EngineIntro` para reduzir friccao antes da primeira acao.
- CTA de entrada padronizada para `Jogar agora`.
- Home, Explorar e Play com copy mais orientada a jogo e menos institucional.
- Outcome reforcado com convite claro para testar outra estrategia.

Arquivos-chave:
- `components/games/shared/EngineIntro.tsx`
- `components/games/shared/EngineIntro.module.css`
- `app/page.tsx`
- `app/explorar/page.tsx`
- `app/play/[slug]/page.tsx`

## 2) Replay real melhorado

- Outcome passou a incentivar replay de forma explicita (`Jogar de novo` + bloco de variacao de rota).
- Share page foi ajustada para reentrada ativa (`Testar outra rodada`, `Comparar com outro jogo`).
- Instrumentacao de replay adicionada:
  - `replay_click`
  - `outcome_replay_intent`
  - `share_page_play_click`
  - `return_to_hub_after_outcome`
- `/estado` agora exibe KPIs e sinais dedicados de diversao/replay.

Arquivos-chave:
- `components/games/shared/GameOutcome.tsx`
- `app/share/[game]/[result]/SharePageClient.tsx`
- `app/estado/page.tsx`
- `lib/analytics/events.ts`
- `lib/analytics/track.ts`

## 3) Presenca real da pre-campanha adicionada

- Criado componente reutilizavel `CampaignMark` para assinatura de campanha discreta e consistente.
- Integrado no header e nas superficies de descoberta (home/explorar) sem quebrar fluxo de jogo.
- Evento `campaign_mark_click` adicionado para medir engajamento com assinatura.

Arquivos-chave:
- `components/campaign/CampaignMark.tsx`
- `components/campaign/CampaignMark.module.css`
- `components/layout/Header.tsx`
- `components/layout/Header.module.css`
- `app/page.tsx`
- `app/explorar/page.tsx`

## 4) Pendencias para Tijolo 21

- Definir metas numericas por engine para `first_interaction_time` (P50/P75).
- Criar painel comparativo de replay por engine e por jogo no `/estado`.
- Evoluir leitura de fun/replay para series temporais por janela sem perder simplicidade.
- Revisar warnings de Sentry/Next (instrumentation file e global error boundary) para reduzir ruido de build.
- Consolidar testes E2E com perfil de copy menos rigido para reduzir quebras por microajuste textual.

## Validacao tecnica

Executado com sucesso:
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run build`
- `npm run verify`
- `npm run test:e2e`

Resultados:
- lint: sem erros
- type-check: sem erros
- unit: 15/15 testes passando
- build: sucesso (com warnings informativos de configuracao Sentry)
- verify: 52/52 checks
- e2e: 15/15 testes passando

## Documentacao atualizada

- `docs/game-feel-e-diversao.md` (novo)
- `README.md`
- `docs/arquitetura.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
