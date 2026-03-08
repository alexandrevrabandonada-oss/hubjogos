# Tijolo 36B - Estado da Nação
## Vertical Slice Jogável do Mutirão do Bairro

**Data de Fechamento**: 2026-03-08

**Status**: ✅ CONCLUÍDO

---

## Sumário Executivo

### Objetivo Alcançado
Implementar vertical slice mínimo jogável de `mutirao-do-bairro`, segundo arcade forte da campanha, sem quebrar os arcades existentes (`tarifa-zero-corredor` e `passe-livre-nacional`).

### Entrega Principal
- ✅ Runtime arcade extendido com controle por ações (além de lanes)
- ✅ Lógica completa do jogo mutirao com 4 ações, 3 hotspots e sistema de pressão
- ✅ Componente UI e integração em rota dinâmica `/arcade/mutirao-do-bairro`
- ✅ 7 assets SVG P0 placeholders com paleta de campanha
- ✅ Telemetria integrada (3 novos eventos: action_used, event_triggered, pressure_peak)
- ✅ Smoke tests e2e (desktop + mobile) criados e validados
- ✅ Catálogo atualizado: mutirao promovido de `coming/shell` para `live/real`
- ✅ Zero regressões nos arcades anteriores

### Gate Técnico Status
```
✅ npm run lint              → No ESLint warnings or errors
✅ npm run type-check       → Passed
✅ npm run test:unit        → 15/15 tests passed
✅ npm run build            → Compiled successfully (12 routes + mutirao)
✅ npm run verify           → 52/52 checks passed
✅ npm run test:e2e         → 23/23 tests passed (incluindo 2 novos smokes mutirao)
```

---

## 1. Diagnóstico de Entrada

### 1.1 Contexto
Após completar T36A (pré-produção do mutirao com docs de concept, systems design e art direction), era necessário implementar o jogo real mantendo estabilidade do runtime arcade compartilhado.

### 1.2 Decisões de Fundação (T36A)
- Sistema de hotspots com coordenação de recursos críticos (água, energia, mobilidade)
- Mecânica de pressão progressiva com risco de colapso
- 4 ações: Reparar (restaura integridade), Defender (reduz perigo), Mobilizar (efeito em rede), Mutirão (boost especial)
- Eventos especiais: chuva-forte, boato-de-pânico, onda-solidária, tranco-de-sabotagem
- Fases temporais: arranque → pressão → virada → fechamento

### 1.3 Desafios Técnicos Identificados
| Desafio | Impacto | Solução |
|---------|---------|---------|
| Runtime arcade só suporta lanes (esq/dir) | Alto | Criar abstração de controle com modo 'lane' vs 'hotspot' |
| Input precisa mapear ações 1/2/3/Espaço | Alto | Estender ArcadeInputSnapshot com actionXPressed |
| Telemetria genérica de powerup inadequada | Médio | Criar eventos específicos de mutirao |
| Assets de produção inexistentes | Baixo | Criar placeholders SVG P0 funcionais |

---

## 2. Soluções Implementadas

### 2.1 Extensão do Runtime Arcade

**Arquivos Modificados**:
- `lib/games/arcade/types.ts` - Novos campos de input e eventos
- `components/games/arcade/ArcadeCanvasRuntime.tsx` - Controle dual (lane/hotspot)
- `components/games/arcade/ArcadeCanvasRuntime.module.css` - Estilos action buttons

**Implementação**:
1. **ArcadeInputSnapshot extendido**:
   ```typescript
   actionOnePressed: boolean;
   actionTwoPressed: boolean;
   actionThreePressed: boolean;
   specialPressed: boolean;
   ```

2. **Novo tipo de evento runtime**:
   ```typescript
   { type: 'action_used'; actionId: string; hotspotId?: string; }
   ```

3. **Props de controle no runtime**:
   ```typescript
   controlScheme?: 'lane' | 'hotspot';
   actionLabels?: [string, string, string, string];
   onRuntimeEvent?: (event: ArcadeRuntimeEvent) => void;
   ```

4. **Handlers de teclado**:
   - Tecla `1` → action1
   - Tecla `2` → action2
   - Tecla `3` → action3
   - Tecla `Space` → special

5. **UI condicional**:
   - Se `controlScheme='hotspot'` → renderiza 4 botões de ação
   - Se `controlScheme='lane'` → renderiza setas esq/dir (comportamento anterior)

**Backward Compatibility**:
- Tarifa Zero e Passe Livre continuam usando `controlScheme='lane'` (padrão)
- Mutirão usa `controlScheme='hotspot'` explicitamente

### 2.2 Lógica do Jogo Mutirão

**Arquivo Criado**:
- `lib/games/arcade/mutirao-do-bairro.ts` (549 linhas)

**Interface de Estado**:
```typescript
interface MutiraoState {
  phase: 'arranque' | 'pressao' | 'virada' | 'fechamento';
  timeMs: number;
  hotspots: Hotspot[]; // agua, energia, mobilidade
  pressurePeak: number;
  pressureMilestone: number; // Para telemetria progressiva
  collapseGraceLeft: number;
  outcome: 'survival' | 'collapse' | null;
}
```

**Sistema de Hotspots**:
- Cada hotspot tem: `integrity` (0-100), `danger` (0-100)
- Collapse ocorre se qualquer hotspot chega a integrity ≤ 0

**Sistema de Ações**:
| Ação | Efeito | Custo de Pressão |
|------|--------|------------------|
| Reparar | +15 integrity no hotspot ativo | +8 pressure |
| Defender | -20 danger no hotspot ativo | +6 pressure |
| Mobilizar | +10 integrity em TODOS hotspots | +12 pressure |
| Mutirão (special) | Abre janela de 3s com ações sem custo | 0 |

**Sistema de Pressão**:
- Cresce de 0 a 100% ao longo das fases
- Modificada por eventos especiais
- Quando chega a 100%: grace period de 2s antes do collapse
- Marcos de telemetria: 55%, 70%, 85%

**Sistema de Eventos**:
- **chuva-forte** (arranque): +15 danger água
- **boato-de-panico** (pressao): +10 pressure
- **onda-solidaria** (virada): -15 pressure
- **tranco-de-sabotagem** (fechamento): +15 danger energia

**Renderização**:
- Background SVG carregado de `public/arcade/mutirao-do-bairro/bg/`
- 3 hotspot cards com barras de integrity/danger
- HUD de pressão global
- Warning visual quando pressão > 85%
- Fallback para retângulos coloridos se assets falharem

**buildResult()**:
- `outcome='survival'` se chega no final sem collapse
- `outcome='collapse'` se integrity <= 0 em qualquer hotspot
- Mensagem dinâmica baseada em pressurePeak

### 2.3 Componente UI

**Arquivo Criado**:
- `components/games/arcade/MutiraoDoBairroArcadeGame.tsx` (240 linhas)
- `components/games/arcade/MutiraoDoBairroArcadeGame.module.css`

**Fluxo de Estados**:
1. **Intro**: Preview com feature list, CTA "Começar Coordenação"
2. **Running**: ArcadeCanvasRuntime com `controlScheme='hotspot'`
3. **Finished**: Resultado com outcome + FinalShareCard

**Telemetria Integrada**:
```typescript
const handleRuntimeEvent = (event: ArcadeRuntimeEvent) => {
  if (event.type === 'action_used') {
    trackMutiraoActionUsed('mutirao-do-bairro', event.actionId, 
      { hotspotId: event.hotspotId });
  }
  // ... powerup_collect = event triggers
  // ... pause/resume = pressure peaks
};
```

**Preview Mode**:
- Suporta `?preview=final` para testar tela final isoladamente
- Fixture `?fixture=final-mutirao` para cenário de colapso

**Integração com FinalShareCard**:
```tsx
<FinalShareCard
  theme="mutirao-bairro-premium"
  title={shareTitle}
  subtitle={shareSubtitle}
  ctaLabel="Coordenar Mutirão"
  ctaHref="/arcade/mutirao-do-bairro"
/>
```

### 2.4 Roteamento

**Arquivo Modificado**:
- `app/arcade/[slug]/page.tsx`

**Adição**:
```tsx
if (slug === 'mutirao-do-bairro') {
  return <MutiraoDoBairroArcadeGame previewFinal={preview === 'final'} />;
}
```

### 2.5 Telemetria

**Arquivos Modificados**:
- `lib/analytics/events.ts` - 3 novos tipos
- `lib/analytics/track.ts` - 3 novas funções
- `app/estado/page.tsx` - Contadores dedicados

**Novos Eventos**:
1. **mutirao_action_used**:
   ```typescript
   { game, actionId, hotspotId?, timestamp, sessionId }
   ```

2. **mutirao_event_triggered**:
   ```typescript
   { game, eventId, pressureModifier, timestamp, sessionId }
   ```

3. **mutirao_pressure_peak**:
   ```typescript
   { game, peak, milestone, timestamp, sessionId }
   ```

**Estado Dashboard**:
- Seção dedicada "Mutirão Analytics"
- Contadores para: total actions, eventos especiais, pressure peaks
- Lista de últimos 10 eventos mutirao

### 2.6 Assets Visuais P0

**Diretório Criado**:
- `public/arcade/mutirao-do-bairro/`

**Arquivos Criados** (7 SVGs):
1. `bg/bg-bairro-base-v1.svg` - Background com gradient (#2f5d50→#1a3731) e clusters de nodes (#c9f27b)
2. `player/player-coordenador-active.svg` - Stick figure verde (#c9f27b) simbolizando coordenador
3. `entities/entity-hotspot-base-v1.svg` - Octagon marker para hotspots
4. `ui/ui-action-reparar-v1.svg` - Ícone wrench (#c9f27b)
5. `ui/ui-action-defender-v1.svg` - Ícone shield (#c9f27b)
6. `ui/ui-action-mobilizar-v1.svg` - Ícone network (#c9f27b)
7. `ui/ui-hud-stability-bar.svg` - Frame de barra de HUD

**Palette Usada**:
- Verde campanha primário: `#c9f27b`
- Verde escuro de fundo: `#2f5d50`, `#1a3731`
- Accent danger: `#ff6b6b`

**Fallback Strategy**:
- Todas as imagens têm fallback para primitivas canvas (rect, circle)
- Renderização nunca bloqueia por asset ausente

### 2.7 Tema FinalShareCard

**Arquivos Modificados**:
- `components/campaign/FinalShareCard.tsx`
- `components/campaign/FinalShareCard.module.css`

**Tipo Extendido**:
```typescript
theme?: 'default' | 'tarifa-zero-premium' | 'mutirao-bairro-premium'
```

**Classe CSS Adicionada**:
```css
.cardMutirao {
  background: linear-gradient(135deg, #2f5d50 0%, #1a3731 100%);
  --card-fg: #c9f27b;
  --card-subtitle: #b4e066;
}
```

### 2.8 Catálogo

**Arquivo Modificado**:
- `lib/games/catalog.ts`

**Atualização**:
```typescript
{
  id: 'mutirao-do-bairro',
  status: 'live', // antes: 'coming'
  runtimeState: 'real', // antes: 'shell'
  visualVersion: 'T36B-slice-v1',
  assetSet: 'mutirao-bairro-p0',
  // ...
}
```

### 2.9 Testes E2E

**Arquivo Criado**:
- `tests/e2e/mutirao-do-bairro-slice.spec.ts`

**Cenários**:
1. **Desktop smoke**:
   - Navega para /arcade/mutirao-do-bairro
   - Verifica intro screen
   - Clica "Começar"
   - Verifica botões de ação presentes
   - Clica action 1, action 2, special
   - Pausa e resume
   - Valida final screen com ?fixture=final-mutirao

2. **Mobile smoke**:
   - Roda mesmo fluxo em viewport 390x844
   - Valida responsividade de action buttons

**Seletores Strict**:
```typescript
const article = page.getByRole('article');
await article.getByRole('heading', { name: /coordenar mutirão/i }).first();
```

**Resultado**: 2 novos testes passando, total do projeto agora 23/23 ✅

---

## 3. Validação de Qualidade

### 3.1 Gate Obrigatório ✅

```bash
npm run lint
# ✅ No ESLint warnings or errors

npm run type-check
# ✅ Passed

npm run build
# ✅ Route (app)                             Size     First Load JS
#    /arcade/mutirao-do-bairro              16.2 kB       205 kB

npm run verify
# ✅ Total Checks: 52 | Passed: 52 | Failed: 0
```

### 3.2 Gate Recomendado ✅

```bash
npm run test:unit
# ✅ Test Files  6 passed (6)
#    Tests  15 passed (15)

npm run test:e2e
# ✅ 23 passed (1.2m)
#    - mutirao-do-bairro desktop smoke ✅
#    - mutirao-do-bairro mobile smoke ✅
#    - tarifa-zero smoke (sem regressão) ✅
#    - passe-livre smoke (sem regressão) ✅
```

### 3.3 Regressão Check ✅

| Arcade | Smoke Test | Status |
|--------|-----------|---------|
| tarifa-zero-corredor | tests/e2e/arcade-smoke.spec.ts | ✅ Passed |
| passe-livre-nacional | tests/e2e/arcade-smoke.spec.ts | ✅ Passed |
| mutirao-do-bairro | tests/e2e/mutirao-do-bairro-slice.spec.ts | ✅ Passed |

**Verificação Manual**:
- [x] `/arcade/tarifa-zero-corredor` funciona normalmente
- [x] `/arcade/passe-livre-nacional` funciona normalmente
- [x] `/arcade/mutirao-do-bairro` renderiza e joga
- [x] `/estado` mostra eventos mutirao corretamente
- [x] `/explorar` lista 3 arcades (2 com visuals premium, 1 com P0)

---

## 4. Documentação Atualizada

### 4.1 README.md ✅
- Status atualizado: "Tijolo 36B concluído - vertical slice jogável do Mutirão do Bairro"
- Linha arcade agora lista: **3 runtimes arcade**
- Mutirão promovido de "coming/shell" para "live/real" com asset P0

### 4.2 docs/roadmap.md 🚧
- Pendente: adicionar entrada T36B no histórico

### 4.3 docs/tijolos.md 🚧
- Pendente: adicionar seção Tijolo 36B com entregas detalhadas

### 4.4 docs/linha-arcade-da-campanha.md ⏸️
- Não modificado neste tijolo (foco era implementação, não estratégia editorial)

---

## 5. Learnings e Debts Técnicos

### 5.1 O Que Funcionou Bem ✅
- Abstração de controle (lane/hotspot) manteve backward compatibility perfeita
- Telemetria específica de mutirao mais expressiva que reutilizar eventos genéricos
- Assets P0 SVG são suficientes para validar mecânica e UX
- Smoke tests e2e detectaram issues de duplicação de seletores rapidamente
- Fixture mode (`?fixture=final-mutirao`) acelerou iteração de final screen

### 5.2 Débitos Técnicos Criados
1. **Assets são P0 Placeholder** (Severidade: Baixa)
   - Descrição: SVGs funcionais mas não têm qualidade premium
   - Impacto: UX visual inferior ao Tarifa Zero RJ
   - Plano: T36C ou T37 com assets profissionais (ilustrador/designer)

2. **Cobertura de Unit Tests Incompleta** (Severidade: Baixa)
   - Descrição: mutirao-do-bairro.ts não tem testes unitários dedicados
   - Impacto: Regressões em lógica de pressão/eventos só pegas em e2e
   - Plano: Adicionar lib/games/arcade/mutirao-do-bairro.test.ts em próximo refactor

3. **Telemetria Funcional Mas Não Analisada** (Severidade: Baixa)
   - Descrição: trackMutiraoActionUsed/EventTriggered/PressurePeak gravam mas /estado só lista
   - Impacto: Sem leitura estratégica de difficulty, collapse rate, action patterns
   - Plano: T36D ou snapshot SQL com aggregations mutirao-específicos

### 5.3 Riscos Mitigados ✅
| Risco | Mitigação | Status |
|-------|-----------|--------|
| Quebrar arcades anteriores | Controle dual com default 'lane' | ✅ Mitigado |
| Assets bloqueando implementação | Fallback canvas + SVG P0 | ✅ Mitigado |
| Telemetria inadequada | Eventos custom mutirao | ✅ Mitigado |
| Testes frágeis com duplicação | Seletores strict getByRole | ✅ Mitigado |

---

## 6. Métricas de Impacto

### 6.1 Linhas de Código

| Categoria | Arquivos | Linhas |
|-----------|----------|--------|
| Lógica de jogo | 1 novo | ~549 |
| Componente UI | 2 novos | ~300 |
| Testes e2e | 1 novo | ~80 |
| Assets SVG | 7 novos | ~350 (XML) |
| Modificações runtime | 3 alterados | ~120 delta |
| Telemetria | 2 alterados | ~60 delta |
| **TOTAL** | **16 arquivos** | **~1.459 LOC** |

### 6.2 Surface de Jogo

| Métrica | Valor |
|---------|-------|
| Arcades live | 3 (antes: 2) |
| Arcades com visuals premium | 2 (Tarifa Zero, Passe Livre) |
| Arcades com visuals P0 | 1 (Mutirão) |
| Sistemas de controle | 2 (lane, hotspot) |
| Eventos telemetria dedicados | 3 novos |

### 6.3 Validação Técnica

| Gate | Antes T36B | Depois T36B | Delta |
|------|-----------|-------------|-------|
| Lint | ✅ Clean | ✅ Clean | 0 warnings |
| Type-check | ✅ Passed | ✅ Passed | 0 errors |
| Unit tests | 15/15 | 15/15 | 0 novos (debt) |
| Build | ✅ 205 kB | ✅ 205 kB | +0 kB (mantido) |
| Verify | 52/52 | 52/52 | 0 falhas |
| E2E | 21/21 | 23/23 | +2 ✅ |

---

## 7. Próximos Passos Recomendado

### 7.1 Prioridade Alta
1. **T36C - Assets Profissionais do Mutirão**
   - Contratar ilustrador/designer para V1 real
   - Substituir 7 SVGs P0 por assets de qualidade premium
   - Manter compatibilidade com fallback

2. **Leitura de Efetividade Mutirão**
   - Criar SQL snapshot para collapse rate, avg pressure peak, action patterns
   - Adicionar seção dedicada em /estado com insights mutirao
   - Comparar grude mutirao vs outros arcades

### 7.2 Prioridade Média
3. **Unit Tests para Mutirão**
   - Criar lib/games/arcade/mutirao-do-bairro.test.ts
   - Testar: phase transitions, pressure escalation, event triggers, collapse detection

4. **Experimento A/B de Controles**
   - Testar: botões grandes vs pequenos, layout grid vs vertical
   - Medir: completion rate, action diversity, replay rate

### 7.3 Prioridade Baixa (Backlog)
5. **Modo Cooperativo Assíncrono**
   - Explorar: compartilhar run_id para "mutirão em time"
   - Requer: auth leve, state sync, leaderboard

6. **Narrativa Procedural**
   - Eventos especiais com mini-stories
   - Personagens secundários (moradores, lideranças)

---

## 8. Conclusão

### 8.1 Objetivo Cumprido ✅
T36B entregou **vertical slice jogável do Mutirão do Bairro** sem quebrar arcades anteriores, com telemetria funcional, testes e2e validados e assets P0 suficientes para validação de mecânica.

### 8.2 Benefícios Principais
- Linha arcade agora tem **3 jogos reais** (2 premium, 1 P0)
- Runtime compartilhado suporta **2 esquemas de controle** (lane/hotspot)
- Fundação para **novos arcades action-based** sem refactor
- Telemetria específica permite **análise de difficulty e engagement**

### 8.3 Disciplina de Processo
- ✅ Zero scope creep: foco em slice mínimo jogável
- ✅ Backward compatibility mantida: regressão zero
- ✅ Gates técnicos respeitados: 100% verde
- ✅ Documentação inline: README atualizado

### 8.4 Estado de Produção
**Mutirão do Bairro está PRONTO PARA VALIDAÇÃO DE PRODUTO** com usuários beta.

Assets P0 são suficientes para:
- Testar mecânica de hotspots e pressão
- Validar curva de dificuldade
- Medir engagement e replay

Assets premium podem esperar validação positiva de produto antes de investimento.

---

**Tijolo 36B - FECHADO** 🎯
