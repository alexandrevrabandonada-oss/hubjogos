# T73: Game Production System v1
## Vertical Slice Factory + Priority Matrix

**Data:** 24 de Março de 2026  
**Versão:** v1.0  
**Status:** ✅ Concluído

---

## 1. Diagnóstico: Do "Infra-Heavy" ao "Production-Light"

### O Problema

T69-T72 construíram uma plataforma técnica excepcional:
- Progressão e retorno (T69)
- Entry pages premium (T70)
- Result layer (T71)
- Runtime contract (T72)

**Mas o gargalo agora é produção.** O Hub precisa de um **sistema disciplinado para shippar jogos consistentemente** — com identidade forte, territorialidade clara e mensagem política afiada.

### O Risco

Sem um sistema de produção:
- Jogos demoram meses sem critério claro
- Prioridades são baseadas em "vontade" não em estratégia
- Qualidade varia drasticamente entre títulos
- Identidade política se dilui
- Territorialidade fica genérica

**Meta:** Transformar o Hub de "plataforma bem estruturada" em "portfólio real de jogos profissionais".

---

## 2. Game Production Blueprint

### Template Reutilizável

Cada novo jogo no Hub deve preencher um blueprint completo:

```typescript
interface GameProductionBlueprint {
  // Básico
  id: string;
  title: string;
  oneLinerPremise: string;
  
  // Técnico
  genre: GameGenre;
  targetPace: GamePace;
  runtimeType: RuntimeType;
  estimatedMinutes: number;
  
  // Político
  politicalThemes: PoliticalTheme[];
  primaryFantasy: string;
  corePoliticalMessage: string;
  
  // Territorial
  territoryScope: TerritoryScope;
  territorialSetting: string;
  localContext: string;
  
  // Gameplay
  coreLoop: string;
  winConditions: string[];
  failConditions: string[];
  difficulty: DifficultyLevel;
  replayability: 'none' | 'some' | 'high';
  
  // Integração Hub
  entryPageFraming: {
    whyItMattersStruggle: string;
    whyItMattersRelevance: string;
    whyItMattersInvitation: string;
  };
  resultModel: OutcomeType;
  shareabilityAngle: string;
  
  // Assets
  assetNeeds: {
    environments: AssetComplexity;
    characters: AssetComplexity;
    props: AssetComplexity;
    uiHuds: AssetComplexity;
    promoImages: AssetComplexity;
    heroMedia: AssetComplexity;
    sound: 'none' | 'sfx' | 'music' | 'full';
  };
  
  // Produção
  complexity: ProductionComplexity;
  strategicValue: StrategicValue;
  productionCost: ProductionCost;
  riskLevel: RiskLevel;
  suggestedTeam: { designers, developers, artists, sound? };
  estimatedWeeks: number;
  dependencies: string[];
  blockers: string[];
  status: ReleaseStatus;
  priorityScore: number;
}
```

### Principais Campos

| Campo | Propósito |
|-------|-----------|
| `oneLinerPremise` | Resumo de 1 linha para comunicação rápida |
| `primaryFantasy` | O que o jogador "se torna" |
| `corePoliticalMessage` | Mensagem política central |
| `territorialSetting` | Contexto específico de território |
| `entryPageFraming` | Conecta ao T70 |
| `resultModel` | Conecta ao T71 |
| `assetNeeds` | Planejamento de pipeline |

---

## 3. Matriz de Production Readiness

### Critérios de Score

Cada jogo é pontuado em:

| Critério | Peso | Descrição |
|----------|------|-----------|
| strategicValue | 2.0 | Valor para campanha/Hub |
| productionCost | -1.5 | Custo (invertido) |
| assetComplexity | -1.0 | Complexidade de assets (invertido) |
| gameplayDepth | 1.5 | Profundidade mecânica |
| shareability | 1.0 | Potencial de compartilhamento |
| politicalClarity | 1.5 | Clareza da mensagem |
| territoryStrength | 1.0 | Força territorial |

### Classificação de Prioridade

| Score | Recomendação |
|-------|-------------|
| ≥70 | `build_now` — Construir imediatamente |
| 50-69 | `build_soon` — Construir em breve |
| 30-49 | `build_later` — Planejar para depois |
| <30 | `hold` — Aguardar |

---

## 4. 3 Tracks de Produção

### Track A — Quick / Shareable

**Características:**
- Duração: 30s - 3min
- Produção: 1-2 semanas
- Assets: Minimal
- Profundidade política: Surface
- Shareability: **High**
- Replayability: Some

**Meta:** 3 jogos/quarter

**Exemplos:** Quiz relâmpago, arcade de ação, desafio reflexivo

---

### Track B — Mid-depth / Systems

**Características:**
- Duração: 3-8 min
- Produção: 3-6 semanas
- Assets: Moderate
- Profundidade política: Moderate
- Shareability: Medium
- Replayability: **High**

**Meta:** 2 jogos/quarter

**Exemplos:** Simulação orçamentária, gestão de recursos, estratégia territorial

---

### Track C — Premium / Deep

**Características:**
- Duração: 8-20 min
- Produção: 6-12 semanas
- Assets: Rich
- Profundidade política: **Deep**
- Shareability: Medium
- Replayability: **High**

**Meta:** 1 jogo/quarter

**Exemplos:** Narrativa interativa, simulação complexa, RPG territorial

---

## 5. Próximos 3 Build Priorities

Baseado na matriz, selecionamos:

### Priority 1: "Escolha Rápida: Orçamento em Crise"

| Campo | Valor |
|-------|-------|
| **Track** | A (Quick) |
| **Gênero** | Quiz |
| **Duração** | 1 min |
| **Território** | Volta Redonda |
| **Tema** | Orçamento, serviços públicos |
| **Fantasia** | Gestor municipal sob pressão |
| **Mensagem** | Orçamento é escolha política, não matemática neutra |
| **Complexidade** | Low |
| **Custo** | Low |
| **Score** | 85 |
| **Recomendação** | **build_now** |

**Justificativa:** Alto valor estratégico (orçamento é tema central da campanha), baixo custo, alto potencial de compartilhamento.

---

### Priority 2: "Mutirão de Saneamento"

| Campo | Valor |
|-------|-------|
| **Track** | B (Systems) |
| **Gênero** | Simulação |
| **Duração** | 5 min |
| **Território** | Baixada |
| **Tema** | Organização popular, cuidado, moradia |
| **Fantasia** | Organizador comunitário |
| **Mensagem** | Saneamento é direito e conquista coletiva |
| **Complexidade** | Medium |
| **Custo** | Medium |
| **Score** | 92 |
| **Recomendação** | **build_now** |

**Justificativa:** Conecta tema crítico (saneamento na Baixada) com mecânicas sistêmicas. Excelente para demonstrar poder popular em ação.

---

### Priority 3: "Assembleia Territorial"

| Campo | Valor |
|-------|-------|
| **Track** | C (Premium) |
| **Gênero** | Narrativa |
| **Duração** | 12 min |
| **Território** | Volta Redonda |
| **Tema** | Organização popular, democracia direta |
| **Fantasia** | Participante em assembleia |
| **Mensagem** | Democracia direta é possível e necessária |
| **Complexidade** | High |
| **Custo** | High |
| **Score** | 88 |
| **Recomendação** | **build_now** |

**Justificativa:** VR tem tradição de assembleias. Jogo premium demonstra profundidade do Hub. Direto ao tema da campanha (participação popular).

---

## 6. Vertical Slice Definition of Done

### Checklist Completo (21 itens)

#### Core Gameplay (5)
- [ ] `coreLoopPlayable` — Loop principal jogável
- [ ] `coreLoopFun` — Loop é divertido/engajador
- [ ] `designClarityAchieved` — Design claro
- [ ] `controlsStable` — Controles estáveis
- [ ] `pacingAcceptable` — Ritmo aceitável

#### Art & Sound (5)
- [ ] `artDirectionBaseline` — Direção de arte definida
- [ ] `visualIdentityClear` — Identidade visual clara
- [ ] `territorialFeelPresent` — Sensação territorial presente
- [ ] `soundBaseline` — Áudio base definido
- [ ] `audioAppropriate` — Áudio apropriado

#### Hub Integration (4)
- [ ] `runtimeIntegrationComplete` — Integração T72
- [ ] `entryPageComplete` — Entry page T70
- [ ] `resultLayerComplete` — Result layer T71
- [ ] `progressionIntegrationComplete` — Progressão T69

#### Quality & Release (5)
- [ ] `mobileViable` — Funciona em mobile
- [ ] `desktopViable` — Funciona em desktop
- [ ] `basicQAPass` — Passa em QA básico
- [ ] `performanceAcceptable` — Performance aceitável
- [ ] `shareFlowUsable` — Fluxo de share funciona

#### Political Framing (2)
- [ ] `framingPresent` — Framing político presente
- [ ] `noIdentityDrift` — Sem desvio de identidade

### Requisitos Obrigatórios (11)

Para considerar vertical slice completo, **todos** estes devem estar marcados:

1. `coreLoopPlayable`
2. `artDirectionBaseline`
3. `runtimeIntegrationComplete`
4. `entryPageComplete`
5. `resultLayerComplete`
6. `mobileViable`
7. `desktopViable`
8. `basicQAPass`
9. `designClarityAchieved`
10. `controlsStable`
11. `noMajorUIBreaks`

---

## 7. Asset Pipeline Stages

### 5 Estágios

| Estágio | Label | Descrição | Critérios de Saída |
|---------|-------|-----------|-------------------|
| placeholder | Placeholder | Temporário para teste | Funcional, claro o que substituir |
| blockout | Blockout | Formas básicas | Proporções corretas, silhueta legível |
| style_baseline | Style Baseline | Primeira versão no estilo | Paleta definida, estilo consistente |
| near_final | Near Final | Quase completo | 95% completo, pequenos ajustes |
| production_final | Production Final | Pronto para release | 100% completo, aprovado, otimizado |

### Tipos de Asset Suportados

- `environment` — Ambientes/cenários
- `character` — Personagens
- `prop` — Objetos/props
- `ui_hud` — UI/HUD
- `promo` — Imagens promocionais
- `hero` — Hero media (entry page)
- `result` — Result/share visuals
- `sound` — Áudio

### Progress Tracking

Cada asset tem:
- `currentStage` — Estágio atual
- `targetStage` — Estágio alvo
- `estimatedHours` — Horas estimadas
- `actualHours` — Horas reais
- `approved` — Aprovação

---

## 8. Game Scaffold Integration

### Template Reutilizável

Todo novo jogo deve usar o scaffold que já conecta:

```typescript
interface GameScaffoldConfig {
  // T70 Entry Page
  entryPage: {
    heroMediaType: 'image' | 'video';
    whyItMattersEnabled: boolean;
    genreCuesEnabled: boolean;
  };
  
  // T72 Play Shell
  playShell: {
    runtimeType: RuntimeType;
    hudZones: string[];
    inputHintsEnabled: boolean;
    autoPauseOnBlur: boolean;
  };
  
  // T71 Result Layer
  resultLayer: {
    outcomeType: OutcomeType;
    politicalFramingEnabled: boolean;
    sharePackEnabled: boolean;
    nextStepsEnabled: boolean;
  };
  
  // T69 Progression
  progression: {
    recordCompletion: boolean;
    updateAffinities: boolean;
    emitAnalytics: boolean;
  };
}
```

### Factory Function

```typescript
const template = createBlueprintTemplate('simulation', 'B_systems');
// Retorna blueprint pré-configurado para track B
```

---

## 9. Quality Gates

### 9 Gates de Qualidade

| Gate | Descrição | Requerido Para |
|------|-----------|----------------|
| design_clarity | Propósito claro e loop compreensível | prototype, vertical_slice, beta, live |
| stable_controls | Controles responsivos | vertical_slice, beta, live |
| acceptable_pacing | Ritmo adequado | vertical_slice, beta, live |
| political_framing | Framing territorial/político | vertical_slice, beta, live |
| runtime_respected | Segue contrato T72 | vertical_slice, beta, live |
| valid_result | Emite resultados T71 | vertical_slice, beta, live |
| responsive_pass | Mobile + desktop | beta, live |
| no_ui_breaks | UI estável | beta, live |
| identity_aligned | Sem desvio de identidade | vertical_slice, beta, live |

### Validação Automática

```typescript
const missing = getMissingQualityGates(blueprint, checklist);
// Retorna array de gates pendentes
```

---

## 10. Release Status Model

### 8 Status

```
concept → pre_production → prototype → vertical_slice → beta → release_candidate → live → maintenance
```

| Status | Descrição | Transições Permitidas |
|--------|-----------|----------------------|
| concept | Ideia inicial | → pre_production, prototype |
| pre_production | Blueprint completo | → prototype, concept |
| prototype | Core loop jogável | → vertical_slice, pre_production |
| vertical_slice | Slice completo | → beta, prototype |
| beta | Feature complete | → release_candidate, vertical_slice |
| release_candidate | Pronto para lançamento | → live, beta |
| live | Publicado | → maintenance |
| maintenance | Atualizações pontuais | → live |

### Transições Bloqueadas

Transições inválidas geram warning e são bloqueadas:
- `concept → live` ❌
- `beta → concept` ❌

---

## 11. Arquivos Criados

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `lib/production/types.ts` | ~600 | Blueprint, tracks, checklist, gates |
| `lib/production/hooks.ts` | ~300 | useProductionTracker, useVerticalSliceTracker |
| `components/production/ProductionTracker.tsx` | ~200 | UI de checklist |
| `components/production/ProductionTracker.module.css` | ~300 | Estilos |

**Total T73:** ~1.400 linhas

---

## 12. Hooks Exportados

```typescript
// Production tracking
const { blueprints, addBlueprint, prioritize } = useProductionTracker([]);

// Vertical slice
const { checklist, updateCheck, progress, isComplete } = useVerticalSliceTracker();

// Asset pipeline
const { assets, addAsset, getOverallProgress } = useAssetPipeline([]);

// Release status
const { currentStatus, transitionTo, canTransitionTo } = useReleaseStatusManager('concept');
```

---

## 13. Próximos Passos Recomendados

### Imediato (Semana 1)
1. **Iniciar "Escolha Rápida: Orçamento em Crise"**
   - Criar blueprint completo
   - Definir assets necessários
   - Alocar 1 designer + 1 dev
   - Meta: Prototype em 3 dias

### Curto Prazo (Semanas 2-3)
2. **Iniciar "Mutirão de Saneamento"**
   - Criar blueprint completo
   - Iniciar asset pipeline
   - Alocar time: 1 designer, 1 dev, 1 artista
   - Meta: Vertical slice em 4 semanas

### Médio Prazo (Semanas 4-8)
3. **Iniciar "Assembleia Territorial"**
   - Criar blueprint completo
   - Contratar/assign writer
   - Iniciar concept art
   - Alocar time: 2 designers, 1 dev, 1 artista, 1 sound
   - Meta: Vertical slice em 8 semanas

---

## 14. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Time sobrecarregado | Tracks alternam complexidade |
| Assets atrasam | Pipeline com stages claros |
| Qualidade inconsistente | Quality gates obrigatórios |
| Desvio político | Blueprint exige framing explícito |
| Escopo creep | Vertical slice definition clara |

---

## 15. Métricas de Sucesso

| Métrica | Target Q1 |
|---------|-----------|
| Jogos shipped | 6 (3A + 2B + 1C) |
| Média de semanas por jogo A | 1.5 |
| Média de semanas por jogo B | 4 |
| Média de semanas por jogo C | 8 |
| Jogos atingindo vertical slice | 100% |
| Aprovação de quality gates | 100% |

---

## 16. Conclusão

T73 entrega um **sistema de produção completo** que:

1. ✅ **Blueprint estruturado** — Todo jogo precisa preencher critérios claros
2. ✅ **Matriz de priorização** — Scoring objetivo baseado em valor/custo
3. ✅ **3 tracks definidos** — Quick, Systems, Premium
4. ✅ **Próximos 3 jogos selecionados** — Prioridades baseadas em estratégia
5. ✅ **Vertical slice definition** — 21 checkpoints, 11 obrigatórios
6. ✅ **Asset pipeline** — 5 stages de produção
7. ✅ **Quality gates** — 9 validações obrigatórias
8. ✅ **Release status** — 8 estágios claros
9. ✅ **Scaffold reutilizável** — Integra T69-T72 automaticamente

**O Hub agora tem capacidade de produzir jogos de forma disciplinada, escalável e alinhada com valores políticos.**

---

*Relatório T73 — Game Production System v1*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Desenvolvedor: Cascade AI*
