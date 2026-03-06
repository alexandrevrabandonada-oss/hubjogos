# Tijolo 04 - Estado da Nação

**Data:** 2026-03-06 00:45  
**Status:** ✅ Completo

## 🎯 Objetivo do Tijolo 04

Transformar o Hub de "primeira mecânica real" em "produto operável", validando arquitetura multi-engine, persistência opcional, eventos mínimos, CTA político e compartilhamento básico.

## 📊 Diagnóstico do estado anterior

Estado de entrada (fim do Tijolo 03):

- runtime de `/play/[slug]` com acoplamento direto ao quiz;
- 1 engine real (quiz);
- persistência apenas local de respostas do quiz;
- integração Supabase existente, porém sem fluxo final de resultados;
- módulos restantes em shell/mock.

Limitações principais identificadas:

- ausência de adapter/runtime unificado para engines;
- falta de segunda engine para provar arquitetura;
- ausência de telemetria mínima de produto;
- ausência de camada comum de outcome e CTA.

## ✅ O que este tijolo resolveu

- Runtime multi-engine desacoplado de `/play/[slug]`
- Segunda engine real (branching story) navegável
- Outcome comum reutilizável para engines
- Modelo de CTA por jogo/resultado
- Persistência opcional com fallback local
- Analytics básicos com eventos-chave
- Share layer mínima funcional em engines reais

## 🧱 Adapter/runtime criado

Arquivos:

- `lib/games/runtime/types.ts`
- `lib/games/runtime/resolve-engine.ts`
- `components/games/runtime/GameRuntime.tsx`

Resultado:

- catálogo declara `kind`, `engineId`, `runtimeState`;
- runtime resolve engine em ponto único;
- fallback shell elegante e estável quando engine não existe.

## 🎮 Segunda engine implementada

Engine escolhida: **branching_story** para `transporte-urgente`.

Arquivos:

- `lib/games/branching/types.ts`
- `lib/games/branching/engine.ts`
- `lib/games/branching/data/transporte-urgente.ts`
- `lib/games/branching/registry.ts`
- `components/games/branching/BranchingStoryEngine.tsx`

Capacidades entregues:

- etapas encadeadas;
- escolhas com próximo passo;
- desfechos múltiplos;
- reinício;
- integração com CTA e share final.

## 🧭 Modelo de CTA político

Arquivo:

- `lib/games/ctas.ts`

Cada experiência real agora aponta para:

- CTA principal
- CTA secundário
- linha de compartilhamento

Aplicado no outcome de quiz e branching.

## 💾 Persistência opcional

Arquivos:

- `lib/storage/local-session.ts`
- `lib/analytics/session-store.ts`
- `lib/supabase/results.ts`

Comportamento:

- sem Supabase: salva localmente sessões/eventos/resultados;
- com Supabase: tenta persistir em tabelas remotas;
- erro remoto não interrompe UX.

Schema opcional documentado em:

- `supabase/tijolo-04-minimal-schema.sql`

## 📈 Analytics básicos

Arquivos:

- `lib/analytics/events.ts`
- `lib/analytics/track.ts`

Eventos instrumentados:

- `game_view`
- `game_start`
- `step_advance`
- `game_complete`
- `result_copy`
- `link_copy`
- `cta_click`

## 🔗 Share layer mínima funcional

Camada comum no outcome com:

- copiar resumo;
- copiar link;
- feedback visual de sucesso/erro.

Aplicação real:

- `QuizEngine`
- `BranchingStoryEngine`

## 🗂️ Catálogo e UX atualizados

- `lib/games/catalog.ts` agora explicita `runtimeState` e `estimatedMinutes`.
- `/explorar` passou a explicitar engines reais vs shells no bloco ao vivo.
- `/play/[slug]` usa runtime unificado e metadados operacionais.

## 🧪 Verificação final

### `npm run lint`

- ✅ sem warnings/errors

### `npm run type-check`

- ✅ sem erros de tipo

### `npm run build`

- ✅ build de produção concluído
- ✅ runtime multi-engine compilado

### `npm run verify`

- ✅ 41/41 checks pass

## ⚠️ Riscos restantes

- operações Supabase dependem de políticas/tabelas no projeto remoto;
- analytics ainda sem camada de visualização;
- share avançado (card dinâmico/OG) ainda pendente;
- ainda há módulos shell fora das 2 engines reais.

## 🎬 Próximos passos recomendados (Tijolo 05)

1. Adicionar terceira engine real (`simulation` ou `map`)
2. Melhorar performance e acessibilidade em telas de engine
3. Implementar share card avançado por resultado
4. Consolidar leitura agregada de métricas no Supabase

---

## Resumo executivo solicitado

1. **Engines reais**
   - `quiz` (`voto-consciente`)
   - `branching_story` (`transporte-urgente`)

2. **Persistência real**
   - local sempre ativa (sessões/eventos/resultados)
   - Supabase opcional e resiliente

3. **Analytics reais**
   - 7 eventos mínimos instrumentados e desacoplados da UI

4. **O que ainda é mock**
   - engines para módulos restantes
   - share avançado
   - dashboards analíticos
