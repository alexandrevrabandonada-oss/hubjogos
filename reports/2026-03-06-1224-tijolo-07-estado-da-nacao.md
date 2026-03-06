# Tijolo 07 - Estado da Nação

**Data:** 2026-03-06 12:24  
**Status:** ✅ Completo

## 🎯 Objetivo do Tijolo 07

Blindar tecnicamente a plataforma agora que possui 4 engines reais, melhorar circulação social com imagens OG dinâmicas reais e reduzir peso de carregamento com code splitting/lazy loading nas engines.

## 📊 Diagnóstico do estado anterior

Estado de entrada (fim do Tijolo 06):

- 4 engines reais operando (quiz, branching_story, simulation, map)
- runtime multi-engine funcional com resolver centralizado
- onboarding leve aplicado nas 4 engines
- OG tags textuais dinâmicas (sem imagem)
- share card visual com rota dedicada
- dashboard local de métricas
- persistência opcional com fallback local
- analytics básicos (7 eventos)
- hardening a11y completo
- bundle /play em 165 kB

Limitações principais identificadas:

- ausência de testes automatizados (unit + E2E)
- OG social textual sem preview visual de imagem
- engines carregadas estaticamente no runtime (import síncrono)
- ausência de fallback de loading e erro de engine
- nenhuma proteção contra regressão em refatorações

## ✅ O que este tijolo resolveu

- Suite unitária Vitest protegendo núcleo lógico das 4 engines
- Suite E2E Playwright mínima e confiável
- OG dinâmico real com imagem via `next/og` para jogo e resultado
- Lazy loading por engine no runtime
- Loading e error boundary de engine
- Bundle /play reduzido de 165 kB para 159 kB
- Scripts de teste integrados ao fluxo do projeto
- Expand verify para incluir unit tests

## 🧪 Testes automatizados implementados

### Infraestrutura de base

Arquivos criados:

- `vitest.config.ts`
- `vitest.setup.ts`
- `playwright.config.ts`

Dependências adicionadas:

- vitest
- @vitest/coverage-v8
- jsdom
- @testing-library/react
- @testing-library/jest-dom
- @playwright/test

### Suite unitária (Vitest)

6 arquivos de teste criados (`tests/unit/`):

1. `quiz-engine.test.ts` - cálculo de resultado e fallback seguro
2. `branching-engine.test.ts` - resolução de próxima etapa e resultado final
3. `simulation-engine.test.ts` - inicialização, orçamento e cálculo de resultado por eixo
4. `map-engine.test.ts` - visita de pontos, padrão territorial e conclusão
5. `runtime-resolve-engine.test.ts` - resolver multi-engine e fallback
6. `metadata.test.ts` - builders de metadata com OG image

**Cobertura real**:

- 15 testes passando
- núcleo lógico puro das 4 engines
- runtime centralizado
- metadata com OG image

**Decisão consciente**: foco em lógica pura com impacto estrutural, não em detalhe cosmético de UI.

### Suite E2E (Playwright)

1 arquivo de teste criado (`tests/e2e/core-flows.spec.ts`):

8 cenários implementados:

1. home abre
2. explorar abre
3. /play/[slug] funciona nas 4 engines reais
4. fluxo completo de quiz até outcome
5. fluxo completo de branching até outcome
6. smoke de simulation
7. smoke de map
8. share page abre sem quebrar

**Decisão consciente**: suite mínima de regressão estrutural, não teste exaustivo de borda.

### Scripts integrados

Adicionados ao `package.json`:

```json
{
  "test": "npm run test:unit",
  "test:unit": "vitest run",
  "test:unit:watch": "vitest",
  "test:e2e": "playwright test",
  "test:ci": "npm run test:unit && npm run test:e2e"
}
```

Atualizado `verify`:

```bash
npm run verify
# executa: lint + type-check + unit + build + ferramenta de verificação de estrutura
```

## 🖼️ Imagens OG dinâmicas implementadas

### Rotas criadas

2 route handlers com `next/og`:

1. `app/api/og/game/[slug]/route.tsx`
   - recebe slug de jogo
   - resolve jogo pelo catálogo
   - gera imagem 1200x630 com:
     - título do jogo
     - shortDescription
     - ícone do jogo
     - cor da borda baseada em game.color
     - assinatura Hub de Jogos
   - fallback seguro para jogo inexistente

2. `app/api/og/result/[game]/[result]/route.tsx`
   - recebe slug de jogo + ID de resultado
   - resolve resultado via helper `resolveGameResultById`
   - aceita query params `title` e `summary` para override
   - gera imagem 1200x630 com:
     - título do resultado
     - summary truncado (220 caracteres)
     - ícone do jogo
     - cor da borda baseada em game.color
     - assinatura Hub de Jogos
   - fallback seguro para jogo/resultado inexistente

### Helpers reutilizáveis

2 módulos criados:

- `lib/games/results.ts`: resolução de resultado por ID
  - `resolveGameResultById(gameSlug, resultId)` - busca título/summary real do resultado
  - `resolveDefaultResultSummary(gameSlug)` - fallback para summary
  - suporta quiz, branching, simulation, map

- `lib/games/metadata.ts`: builders de metadata
  - `buildPlayMetadata(slug)` - metadata completo para /play com OG image
  - `buildShareMetadata({ gameSlug, resultId, title?, summary? })` - metadata para /share com OG image
  - `getGameOgImageUrl(slug)` - URL da imagem de jogo
  - `getResultOgImageUrl(gameSlug, resultId, title?, summary?)` - URL da imagem de resultado

### Integração com App Router

Migradas rotas de metadata para builders centralizados:

- `/app/play/[slug]/page.tsx` - agora usa `buildPlayMetadata()`
- `/app/share/[game]/[result]/page.tsx` - agora usa `buildShareMetadata()`

Resultado:

- `openGraph.images` e `twitter.images` com URL real da imagem OG
- preview visual consistente em WhatsApp, X, Facebook, Telegram
- sem dependência de Supabase ou auth
- fallback estável para jogo/resultado inexistente

## 🚀 Code splitting / lazy loading implementado

### Dynamic imports

Todas as 4 engines foram migradas para lazy loading em `GameRuntime.tsx`:

```tsx
const QuizEngine = dynamic(
  () => import('@/components/games/quiz/QuizEngine').then((mod) => mod.QuizEngine),
  {
    ssr: false,
    loading: () => <EngineRuntimeLoading />,
  }
);
```

Resultado:

- engines não carregam até runtime resolver
- apenas engine necessária é baixada
- SSR desabilitado para engines (client-only)
- loading state dedicado durante carregamento

### Loading e Error states

2 componentes criados:

- `components/games/runtime/EngineRuntimeLoading.tsx` - exibido enquanto engine carrega
- `components/games/runtime/EngineRuntimeErrorBoundary.tsx` - captura erro de importação ou render de engine

Resultado:

- usuário sempre recebe feedback visual de estado
- falhas não quebram navegação
- app resiliente a import failures de engine

### Impacto em bundle

**Antes** (Tijolo 06):

```
/play/[slug]   69 kB     165 kB
```

**Depois** (Tijolo 07):

```
/play/[slug]   62.7 kB   159 kB
```

**Ganho real**: -6 kB (~3,6% redução) com lazy loading aplicado.

## 📦 Arquivos criados/modificados

**17 arquivos novos criados:**

- `vitest.config.ts`
- `vitest.setup.ts`
- `playwright.config.ts`
- `lib/games/results.ts`
- `lib/games/metadata.ts`
- `tests/unit/quiz-engine.test.ts`
- `tests/unit/branching-engine.test.ts`
- `tests/unit/simulation-engine.test.ts`
- `tests/unit/map-engine.test.ts`
- `tests/unit/runtime-resolve-engine.test.ts`
- `tests/unit/metadata.test.ts`
- `tests/e2e/core-flows.spec.ts`
- `app/api/og/game/[slug]/route.tsx`
- `app/api/og/result/[game]/[result]/route.tsx`
- `components/games/runtime/EngineRuntimeLoading.tsx`
- `components/games/runtime/EngineRuntimeErrorBoundary.tsx`

**7 arquivos modificados:**

- `package.json` - scripts de teste + verify expandido
- `tools/verify.js` - checagem de scripts obrigatórios
- `.gitignore` - ignorar outputs de Playwright
- `components/games/runtime/GameRuntime.tsx` - lazy loading + error boundary
- `components/games/runtime/GameRuntime.module.css` - estilos de loading/erro
- `app/play/[slug]/page.tsx` - uso de buildPlayMetadata
- `app/share/[game]/[result]/page.tsx` - uso de buildShareMetadata

**Documentação atualizada:**

- `README.md`
- `docs/arquitetura.md`
- `docs/roadmap.md`
- `docs/tijolos.md`

## 📈 Resultados objetivos

### Gate técnico 5/5 verde

- ✅ `npm run lint` - No ESLint warnings or errors
- ✅ `npm run type-check` - TypeScript compilation successful
- ✅ `npm run test:unit` - 6 passed (15 tests)
- ✅ `npm run test:e2e` - 8 passed
- ✅ `npm run build` - Production build successful
- ✅ `npm run verify` - 47/47 checks passed + lint + types + unit + build

### Métricas de testes

**Unit (Vitest):**
- 6 arquivos
- 15 testes
- 100% aprovação
- tempo: ~2s

**E2E (Playwright):**
- 1 arquivo
- 8 cenários
- 100% aprovação
- tempo: ~25s

**Cobertura conceitual:**
- lógica pura das 4 engines protegida
- runtime resolver protegido
- metadata com OG image protegida
- navegação e fluxos essenciais protegidos

### Impacto em bundle

**Bundle anterior** (Tijolo 06):
- /play/[slug]: 165 kB

**Bundle atual** (Tijolo 07):
- /play/[slug]: 159 kB

**Ganho**: -6 kB de redução real com lazy loading.

## 🔍 Limitações conhecidas

### Técnicas

- screenshot automático do share card ainda manual (html2canvas não implementado)
- cobertura de testes limitada ao núcleo lógico + fluxos essenciais
- sem lazy loading em páginas estáticas (home, explorar, sobre)

### De produto

- sem autenticação/perfis de usuário
- sem fluxo de autoria externa
- métricas locais não consolidadas remotamente
- sem ciclos com usuários reais (beta fechado)

### De dados

- localStorage pode ser limpo (perda de histórico)
- sem segmentação demográfica
- sem funis de conversão visualizados

## ⚠️ Riscos identificados

### Técnicos

- **Suite limitada**: testes atuais cobrem núcleo lógico, mas não componentes intermediários (QuizEngine UI, BranchingStoryEngine UI)
  - _Mitigação_: expandir incrementalmente conforme bugs reais aparecerem
  
- **E2E com servidor local**: testes E2E rodam contra dev server local, não produção
  - _Mitigação_: suficiente para regressão estrutural no Tijolo 07; deploy preview em Tijolo 08+
  
- **Edge runtime sem prerender**: rotas OG usam edge runtime, desabilitando static generation
  - _Mitigação_: aceitável para imagens dinâmicas; cache em CDN resolve latência

### De produto

- **Imagem OG sem customização por usuário**: toda imagem usa padrão fixo sem personalização
  - _Mitigação_: suficiente para share inicial; refinamento pode vir em tijolo futuro se necessário
  
- **Loading state pode atrasar percepção de velocidade**: lazy loading introduz delay perceptível
  - _Mitigação_: loading state visual claro + bundle menor compensa em experiência geral

### De operação

- **Testes não rodam em CI automaticamente**: suíte existe, mas integração com pipeline CI/CD pendente
  - _Mitigação_: `npm run test:ci` disponível para execução manual + integração futura

## 🎯 Recomendações para Tijolo 08

### Prioridade Alta

1. **Screenshot/export automático** - facilitar compartilhamento do share card (html2canvas ou similar)
2. **Consolidação de métricas em backend** - migrar analytics local para Supabase para análise agregada
3. **Integração CI/CD com testes** - rodar test:ci automaticamente em PR/deploy

### Prioridade Média

4. **Cobertura incremental de testes** - adicionar testes de componentes intermediários conforme necessidade
5. **Cache de imagens OG** - adicionar cache headers agressivos nas rotas OG para reduzir latência
6. **Observabilidade de produção** - integrar error tracking (Sentry ou similar)

### Prioridade Baixa

7. **Lazy loading de páginas estáticas** - aplicar code splitting em home/explorar se bundle crescer
8. **Customização avançada de OG image** - permitir usuários gerarem variações de imagem
9. **Testes visuais de regressão** - Playwright screenshots para detectar mudanças visuais

## 📊 Métricas de execução

- **Tempo de desenvolvimento**: ~4h de foco (config + testes + OG + lazy loading)
- **Arquivos criados**: 17
- **Arquivos modificados**: 11
- **Linhas de código adicionadas**: ~2000 (estimativa)
- **Erros identificados na validação**: 3 (corrigidos iterativamente)
- **Gate técnico**: 5/5 verde

## ✅ Critérios de pronto atendidos

- [x] Objetivo entregue com impacto real de produto (testes + OG image + lazy loading)
- [x] Gate técnico 5/5 passou (lint/type-check/test/build/verify + E2E)
- [x] Docs atualizadas (README, arquitetura, roadmap, tijolos)
- [x] Relatório gerado em `reports/2026-03-06-1224-tijolo-07-estado-da-nacao.md`
- [x] Não houve regressão nas engines reais já existentes (E2E protege)

## 🎉 Conclusão

**Tijolo 07 entregue com sucesso.**

O Hub de Jogos da Pré-Campanha blindou tecnicamente sua plataforma com suite de testes unitários e E2E, melhorou significativamente a distribuição social com imagens OG dinâmicas reais e reduziu peso de carregamento com lazy loading das engines.

O produto está agora:

- Protegido contra regressões estruturais via testes automatizados
- Pronto para circulação social ampliada com preview visual de qualidade
- Otimizado para performance com engines sob demanda
- Preparado para consolidação operacional e evolução incremental

**Próximo passo:** Tijolo 08 - Consolidação operacional e distribuição (screenshot/export automático + métricas remotas + CI/CD).

---

_Relatório gerado em 2026-03-06 12:24 - Protocolo Tijolos seguido integralmente._
