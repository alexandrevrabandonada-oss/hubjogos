# Arquitetura Técnica - Hub de Jogos da Pré-Campanha

## Status atual (Tijolo 04)

O projeto evoluiu de "primeira mecânica real" para "produto operável":

- runtime multi-engine centralizado;
- 2 engines reais navegáveis;
- camada comum de outcome com CTA político;
- persistência e analytics básicos opcionais (com fallback local);
- app continua funcional sem envs/Supabase.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- CSS Modules + design tokens semânticos
- Supabase opcional (resultados/eventos/sessões)

## Estrutura de alto nível

```text
app/
  play/[slug]/page.tsx

components/
  games/runtime/GameRuntime.tsx
  games/quiz/QuizEngine.tsx
  games/branching/BranchingStoryEngine.tsx
  games/shared/GameOutcome.tsx

lib/
  games/catalog.ts
  games/ctas.ts
  games/runtime/{types,resolve-engine}.ts
  games/quiz/*
  games/branching/*
  analytics/{events,session-store,track}.ts
  storage/local-session.ts
  supabase/{client,results}.ts
```

## Runtime unificado

Entrada principal: `components/games/runtime/GameRuntime.tsx`

Resolução de engine: `lib/games/runtime/resolve-engine.ts`

Contrato:

- recebe item do catálogo;
- resolve engine por `kind + engineId`;
- renderiza engine real quando existe;
- cai em fallback shell estável quando não existe.

Resultado: `/play/[slug]` não contém condicionais frágeis por engine.

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

## Outcome, CTA e share mínimo

Componente comum: `components/games/shared/GameOutcome.tsx`

Entrega padrão para engines:

- título do resultado
- leitura política curta
- próximo passo
- CTA principal e secundário
- reiniciar
- copiar resumo
- copiar link

Modelo de CTA: `lib/games/ctas.ts`

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

## Limites atuais

- sem auth e sem autoria de usuário
- sem dashboards analíticos
- share social avançado (OG dinâmico) ainda não implementado
- várias experiências ainda em shell/mock

## Próximo passo arquitetural (Tijolo 05)

- ampliar engines reais (simulação/mapa)
- hardening de acessibilidade/performance
- share card avançado por resultado
- visão analítica agregada no Supabase

Última atualização: 2026-03-06
