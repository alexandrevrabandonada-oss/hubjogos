# Arquitetura Técnica - Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado

## Status atual (Tijolo 12)

O projeto evoluiu de confiabilidade operacional para **sistema real de aprendizado**:

- Runtime multi-engine centralizado e blindado;
- 4 engines reais com suítes de teste unitário, E2E e A11y;
- **Sistema de experimentos A/B leve** para variações controladas;
- **Leitura por coortes** (origem, jogo, engine, variante);
- **Feedback qualitativo organizado** com comentários opcionais;
- **Persistência remota de feedback** com fallback local;
- **Views analíticas remotas** para funil, origem, jogo, engine e experimento;
- **Snapshots e export operacionais** com prioridade remota;
- **Observabilidade real** com Sentry (captura de erros client/server);
- **CI/CD completo** no GitHub Actions (lint, type-check, unit, build, E2E);
- **Testes automatizados de acessibilidade** (Playwright + Axe-core);
- Dashboard `/estado` expandido com segmentação avançada;
- App funcional e resiliente mesmo sem Supabase ou Sentry configurados.

Validação final do Tijolo 12 (2026-03-06):
- Dados reais inseridos em Supabase para validação operacional.
- Views analíticas verificadas com dados não vazios (`beta_funnel_overview`, `beta_sources_overview`, `beta_game_overview`, `beta_engine_overview`).
- `/estado` e `/estado/feedback` validados em browser com leitura remota ativa.
- Hardening mínimo de policy aplicado para triagem de feedback.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- CSS Modules + design tokens semânticos
- Supabase opcional (resultados/eventos/sessões)
- Vitest + Playwright
- Sentry (observabilidade)

## Estrutura de alto nível

```text
app/
  play/[slug]/page.tsx
  estado/
    page.tsx              # Dashboard principal de métricas
    feedback/page.tsx     # Inbox de feedback qualitativo

components/
  games/runtime/GameRuntime.tsx
  games/quiz/QuizEngine.tsx
  games/branching/BranchingStoryEngine.tsx
  games/simulation/SimulationEngine.tsx
  games/map/MapEngine.tsx
  games/shared/GameOutcome.tsx
  games/shared/EngineIntro.tsx
  games/share/ResultCard.tsx
  ui/MicroFeedback.tsx       # Feedback com comentário opcional

lib/
  games/catalog.ts
  games/ctas.ts              # CTAs expandidos com variantes
  games/runtime/{types,resolve-engine}.ts
  games/quiz/*
  games/branching/*
  games/simulation/*
  games/map/*
  experiments/              # Sistema A/B
    types.ts
    registry.ts            # Definição de experimentos
    resolve.ts             # Resolução de variantes
  analytics/
    events.ts
    session-store.ts       # Orquestração com experimentos
    track.ts
    metrics.ts             # Agregação com coortes
    feedback.ts            # Agregação local/remota + triagem leve
    source.ts
  storage/local-session.ts
  supabase/{client,results,feedback}.ts

tools/
  beta-snapshot.js         # Gerador de snapshots remoto/local
  beta-export.js           # Export estruturado de operação

app/
  estado/page.tsx
  share/[game]/[result]/page.tsx
```

## Runtime unificado

Entrada principal: `components/games/runtime/GameRuntime.tsx`

Resolução de engine: `lib/games/runtime/resolve-engine.ts`

Contrato:

- recebe item do catálogo;
- resolve engine por `kind + engineId`;
- carrega engine real sob demanda (`next/dynamic`) por tipo;
- exibe loading state consistente durante carregamento;
- protege falhas com error boundary local de runtime;
- cai em fallback shell estável quando não existe engine real.

Resultado: `/play/[slug]` mantém runtime desacoplado com menor peso inicial de bundle.

## Engines reais ativas

1. Quiz (`voto-consciente`)
   - dados tipados
   - cálculo por eixo dominante
   - tela final via `GameOutcome`

2. Branching story (`transporte-urgente`)
   - nós narrativos encadeados
   - escolhas com próximo passo
   - múltiplos desfechos
   - tela final via `GameOutcome`

3. Simulation (`cidade-real`)
   - alocação orçamentária com restrições
   - 5 categorias (saúde, educação, transporte, moradia, manutenção)
   - pressões políticas progressivas
   - resultados por eixo político (austeridade, colapso, tecnocracia, cuidado, contenção)
   - tela final via `GameOutcome`

4. Map (`abandonado`)
   - exploração territorial de edifícios abandonados
   - 10 pontos por 4 regiões
   - descoberta progressiva de padrões espaciais
   - resultados por padrão (abandono de serviços, desindustrialização, território em disputa, memória apagada, abandono sistêmico)
   - tela final via `GameOutcome`

## Onboarding leve por engine

Componente comum: `components/games/shared/EngineIntro.tsx`

Exibido antes de cada engine, explica:

- tipo de engine (quiz, narrativa, simulação, mapa)
- como funciona
- duração estimada
- o que a pessoa vai descobrir

Aplicado nas 4 engines reais para reduzir fragmentação de UX.

Ajuste recente de game feel:

- bloco de inicio rapido para reduzir tempo ate a primeira acao;
- CTA de entrada padronizada em `Jogar agora`.

## Outcome, CTA e share avançado

Componente comum: `components/games/shared/GameOutcome.tsx`

Entrega padrão para engines:

- título do resultado
- leitura política curta
- próximo passo
- CTA principal e secundário

Share card visual: `components/games/share/ResultCard.tsx`

- resultado visual print-ready
- suporte a click para export automático (Tijolo 08)
- rota dedicada `/share/[game]/[result]`

**Export automático (Tijolo 08):**

- `lib/share/export-card.ts` – helper DOM→PNG (html-to-image)
- `components/games/share/DownloadCardButton.tsx` – botão com feedback de loading/sucesso/erro
- `components/games/share/SharePageClient.tsx` – client wrapper com ref do container

Dashboard de métricas: `app/estado/page.tsx`

- agregação local de sessões/eventos/resultados
- performance por jogo e engine
- taxas de conclusão e eventos
- reiniciar
- copiar resumo
- copiar link

Modelo de CTA: `lib/games/ctas.ts`

## Camada de replay e assinatura de campanha

- `components/campaign/CampaignMark.tsx`: assinatura reutilizavel da pre-campanha.
- `components/games/shared/GameOutcome.tsx`: incentivo explicito a replay e comparacao de rota.
- `app/share/[game]/[result]/SharePageClient.tsx`: reentrada de share para play instrumentada.

Eventos adicionais de produto:

- `first_interaction_time`
- `replay_click`
- `outcome_replay_intent`
- `share_page_play_click`
- `campaign_mark_click`
- `return_to_hub_after_outcome`

## Linha editorial e escala territorial (Tijolo 21)

O catalogo agora carrega metadados estruturais para suportar crescimento:

- `pace`: `quick`, `session`, `deep`, `future-flagship`
- `line`: denuncia, orcamento/cuidado, memoria/territorio, trabalho, mobilidade, organizacao popular, estado-rj
- `series`: colecoes oficiais da campanha
- `territoryScope`: volta-redonda, sul-fluminense, baixada, capital, estado-rj

Uso pratico:

- Home e Explorar exibem series e escada de formato.
- Game cards e play pages exibem taxonomia e escopo.
- `/estado` agrega leitura por serie, territorio e tipo de jogo.

## Avatar oficial e card final universal (Tijolo 22)

Sistema visual de campanha para crescimento organizado:

### Avatar oficial

- Documento mestre: `docs/avatar-oficial-alexandre-fonseca.md`
- Asset base: `public/campaign/avatar/base.svg`
- Componente: `components/campaign/CampaignAvatar.tsx`

O avatar representa Alexandre Fonseca em linguagem estilizada de jogo, não fotografia crua.

Tamanhos suportados:
- `small` (48px) - tokens, chips
- `medium` (80px) - cards
- `large` (120px) - outcomes, share
- `hero` (200px) - hero sections

Variantes:
- `portrait` - circular, padrão
- `icon` - quadrado arredondado
- `busto` - retangular arredondado

### Card final universal

- Componente: `components/campaign/FinalShareCard.tsx`
- Frame base: `public/campaign/share/frame-base.svg`

Todo jogo termina com card compartilhável consistente que inclui:
- Avatar oficial
- Título e descrição do jogo
- Resultado do jogador
- Taxonomia (série, território, pace)
- Marca da pré-campanha
- CTA de compartilhamento

Integração:
- `ResultCard` agora usa `FinalShareCard` internamente
- Share pages exibem o card universal
- Outcomes podem opcionalmente exibir preview do card

### Pipeline de assets

Estrutura organizada:
```
public/campaign/
  avatar/
    base.svg          # Avatar base SVG editável
  share/
    frame-base.svg    # Moldura padrão de share card
```

Documentação: `docs/assets/README.md`

### Tracking

Novos eventos de produto:
- `final_card_view`
- `final_card_download`
- `final_card_share_click`
- `campaign_avatar_view`
- `campaign_cta_click_after_game`

Leitura no `/estado`:
- Seção dedicada "Card Final e Presença de Campanha"
- Acompanhamento de adoção e engajamento

### Limitações atuais

Versão V1 (Tijolo 22):
- Asset base é placeholder técnico estilizado
- Representa conceito e estrutura, ainda precisa refinamento profissional
- Componentes funcionais e prontos para substituição de asset final

- `pace`: `quick`, `session`, `deep`, `future-flagship`
- `line`: denuncia, orcamento/cuidado, memoria/territorio, trabalho, mobilidade, organizacao popular, estado-rj
- `series`: colecoes oficiais da campanha
- `territoryScope`: volta-redonda, sul-fluminense, baixada, capital, estado-rj

Uso pratico:

- Home e Explorar exibem series e escada de formato.
- Game cards e play pages exibem taxonomia e escopo.
- `/estado` agrega leitura por serie, territorio e tipo de jogo.

## OG dinâmico real (Tijolo 07)

Metadados por página usando `generateMetadata` + builder comum (`lib/games/metadata.ts`):

- `/play/[slug]`: título, descrição e `openGraph.images` por jogo
- `/share/[game]/[result]`: título, descrição e `openGraph.images` por resultado

Rotas de imagem OG via `next/og`:

- `app/api/og/game/[slug]/route.tsx`
- `app/api/og/result/[game]/[result]/route.tsx`

Requisitos atendidos:

- fallback seguro para jogo/resultado inexistente
- sem dependência de auth
- sem dependência obrigatória de Supabase
- preview visual consistente em WhatsApp, X, Facebook, Telegram

## Sistema de Experimentos A/B (Tijolo 11)

Sistema leve para testar variações sem complexidade enterprise.

Camada: `lib/experiments/`

Componentes:

- `types.ts`: Definições de experimentos e variantes
- `registry.ts`: Registro central de experimentos ativos
- `resolve.ts`: Resolução determinística de variantes por sessão

Funcionamento:

- Experimentos definidos com chave, nome, variantes e pesos
- Resolução estável por sessão via hash simples (DJB2)
- Variantes instrumentadas automaticamente em eventos analytics
- Suporte a experimentos em banner, CTAs, ordem de jogos

Experimentos ativos (exemplos):

- `beta-banner-copy`: Testar copy do banner de beta
- `outcome-cta-style`: Testar estilos de CTA (inline vs buttons)
- `home-games-order`: Testar ordenação de jogos

Análise:

- Métricas por variante em `/estado`
- Taxa de conclusão por variante
- Comparação direta entre variantes A/B/C

## Feedback Qualitativo (Tijolo 11)

Sistema para captura e organização de feedback dos usuários.

Componente: `components/ui/MicroFeedback.tsx`

Fluxo:

1. Usuário avalia experiência (😊 😐 🙁)
2. Sistema oferece campo opcional para comentário (500 chars)
3. Feedback persistido com contexto (jogo, engine, rating, timestamp)

Camada: `lib/analytics/feedback.ts`

- Agregação de feedback por jogo, engine e rating
- Coleta de comentários recentes
- Estatísticas de sentimento

Visualização:

- Dashboard em `/estado/feedback`
- Filtros por jogo e avaliação
- Últimos 50 comentários com contexto completo
- Distribuição de feedback positivo/neutro/negativo

## Leitura por Coortes (Tijolo 11)

Dashboard `/estado` expandido para análise segmentada.

Camadabase: `lib/analytics/metrics.ts`

Segmentações disponíveis:

- **Por Origem**: Sessões, starts, conclusões, shares e taxa por UTM/referrer
- **Por Jogo**: Performance completa + distribuição de feedback
- **Por Engine**: Performance agregada por tipo de mecânica
- **Por Variante**: Performance de experimentos A/B

Métricas calculadas:

- Taxa de conclusão segmentada
- Taxa de share por segmento
- Distribuição de feedback por jogo
- Performance comparativa de variantes

## Snapshot Operacional (Tijolo 11)

Script para retratos consolidados do estado do beta.

Ferramenta: `tools/beta-snapshot.js`

Uso: `npm run beta:snapshot`

Saída:

- Markdown formatado em `reports/snapshots/`
- Timestamp automático
- Overview geral (sessões, conclusões, shares, taxas)
- Feedback consolidado
- Top 5 origens e jogos
- Experimentos ativos com performance por variante

Utilidade:

- Revisões semanais de progresso
- Tomada de decisão sobre experimentos
- Documentação do estado do beta ao longo do tempo

## Consolidação Remota (Tijolo 12)

Migração SQL: `supabase/tijolo-12-remote-learning.sql`

Evoluções:

- tabela `feedback_records` para persistência remota de feedback
- views operacionais: `beta_funnel_overview`, `beta_sources_overview`, `beta_game_overview`, `beta_engine_overview`, `beta_events_overview`
- view `experiment_performance` atualizada para consumo do dashboard
- `/estado/feedback` com triagem leve (`pending` / `reviewed`)
- fallback local mantido quando Supabase não estiver configurado

## Persistência opcional

Camadas:

- local: `lib/storage/local-session.ts`
- orquestração: `lib/analytics/session-store.ts`
- remoto opcional: `lib/supabase/results.ts`

Sem Supabase:

- sessões, eventos e resultados em localStorage
- UX continua normal

Com Supabase:

- tentativa de persistir em `game_sessions`, `game_events`, `game_results`
- erro remoto não quebra a experiência

## Analytics mínimos

Eventos implementados:

- `game_view`
- `game_start`
- `step_advance`
- `game_complete`
- `result_copy`
- `link_copy`
- `cta_click`

Camada: `lib/analytics/track.ts`

## Testes automatizados (Tijolo 07)

### Unit (Vitest)

Cobertura principal:

- cálculo do quiz (`calculateQuizResult`)
- resolução de branching (`resolveNextStep`, `computeBranchingResult`)
- lógica principal da simulation (`createInitialSimulationState`, `updateBudgetCategory`, `calculateSimulationResult`)
- cálculo do map (`calculateMapResult`, fluxo mínimo de exploração)
- resolver multi-engine (`resolveGameEngine`)
- builders de metadata (`buildPlayMetadata`, `buildShareMetadata`)

### E2E (Playwright)

Suíte mínima de regressão estrutural:

- home abre
- explorar abre
- `/play/[slug]` abre para 4 engines reais
- fluxo completo de quiz até outcome
- fluxo completo de branching até outcome
- smoke de simulation
- smoke de map
- share page abre sem quebrar

## CI/CD (Tijolo 09)

Workflow: `.github/workflows/ci.yml`

- trigger: `push` e `pull_request` em qualquer branch
- job `fast-checks`: lint → type-check → test:unit
- job `e2e`: depende de `fast-checks`, roda `npm run build` e em seguida Playwright (Chromium)
- artefatos: reports de Playwright preservados por 7 dias em caso de falha

## Observabilidade (Tijolo 09)

- **Sentry**: Integrado via `@sentry/nextjs`
- Escopo: Erros capturados em Client, Server e Edge Runtime
- Configuração: Opcional via `SENTRY_DSN`
- Rota de Túnel: `/monitoring` (evita bloqueio de adblockers)

## Acessibilidade (Tijolo 09)

- Baseline automatizada com `@axe-core/playwright`
- Frequência: Roda no CI junto com o job de E2E
- Cobertura: Home, Explorar, Engines e Share Page

## Limites atuais

- sem auth e sem autoria de usuário
- sem dashboards analíticos no Supabase (métrica é técnica/agregada)
- sem monitoramento de performance (Web Vitals customizados)

## Hardening realizado

### Acessibilidade

- ARIA roles e labels em todas as engines
- progressbar com aria-valuenow/min/max
- radiogroup com aria-checked
- aria-live para feedback dinâmico
- aria-labelledby para semântica estrutural

### Performance

- Bundle `/play/[slug]` reduzido para 159 kB com lazy loading por engine (antes: 165 kB)
- CSS Modules mobile-first
- Zero dependências pesadas de UI

## Próximo passo arquitetural (Tijolo 12+)

- Auth minimalista opcional (identificação persistente leve)
- Admin leve para consulta rápida de métricas
- Estratégias avançadas de SEO (rich snippets, structured data)
- Consolidação remota aprimorada de métricas
- Analytics avançado (decodificação de respostas no backend)

Última atualização: 2026-03-06 (Tijolo 11)
