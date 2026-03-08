# Relatório Tijolo 38: Duelo Justo por Exposição Arcade

**Data**: 08 de Março de 2026  
**Hora**: 14:50  
**Status**: ✅ **CONCLUÍDO COM SUCESSO**  
**Equipe**: Sistema Operacional  

---

## 1. Resumo Executivo

**Tijolo 38** implementa a camada de **duelo justo por exposição arcade**, validando se a comparação entre `tarifa-zero-corredor` e `mutirao-do-bairro` (T37) é imparcial sob perspectiva de vitrine (entrada real para cada arcade).

**Problema Resolvido**: T37 declarava vencedor oficial mas não surfava se um arcade recebia 3x mais cliques de entrada (virador de vitrine enviesado). T38 quantifica exposição real e bloqueia decisão prematura se o desequilíbrio for grave.

**Resultado**: Exposição justa agora mensurável e operacionalizada. Decisão T37 respaldada por validação de fairness T38. Sem quebrar stacks existentes.

---

## 2. Objetivos e Entregas

### 2.1 Objetivos Cumpridos
- ✅ Computar exposição real por arcade (entrada por home, explorar, quick->arcade, card)
- ✅ Separar liderança de volume (runs raw) de liderança de eficiência (exposição→start)
- ✅ Definir 4 estados de justiça: unbalanced → correcting → fair → ready
- ✅ Propagar T38 para 6 sistemas operacionais sem duplicação
- ✅ Validar com zero regressions em toda suite de testes

### 2.2 Entregas de Código

#### **Criado**
- `tools/arcade-exposure-utils.js` (240 linhas)
  - Função principal: `buildArcadeExposureDuelFromEvents(events, arcadeLineDecision)`
  - Helpers: `normalizeSlug()`, `getArcadeSlugFromEntryEvent()`, `getStatusFromExposure()`
  - Returns: `{ compared, scorecards[], totals, fairness{ status, summary, actions }, contextLeaders }`

#### **Atualizados**
| Arquivo | Mudanças |
|---------|----------|
| `lib/analytics/metrics.ts` | Tipos: `ArcadeSlug`, `ArcadeFairStatus`, `ArcadeExposureScorecard`, `ArcadeExposureDuel`; Função: `getArcadeExposureDuel()` |
| `app/estado/page.tsx` | Card T38 completo com métricas, tabela scorecard, warning box, ações corretivas |
| `tools/beta-export.js` | Import + compute local/remote + event filter estendido |
| `tools/beta-snapshot.js` | Compute + markdown "Linha Arcade - duelo justo por exposição (T38)" |
| `tools/beta-circulation-report.js` | Seção T38 fairness com status, gap, líderes, ações |
| `tools/beta-distribution-report.js` | Integração T38 em recomendações semanais + boost arcade subexposto |
| `tools/beta-campaign-brief.js` | Duelo justo incluído em brief semanal + corrective boost recs |
| `docs/roadmap.md` | Entrada formal T38 + T39 next-cycle focus |

---

## 3. Arquitetura e Design

### 3.1 Contrato de Dados

#### ArcadeExposureScorecard (por arcade)
```ts
{
  slug: string;                      // tarifa-zero-corredor | mutirao-do-bairro
  title: string;
  exposureSignals: number;           // home + explorar + card + quick->arcade clicks
  intentClicks: number;              // subset que deixa "intenção" clara (exclui preview)
  starts: number;                    // arcade_run_start events
  effectiveStarts: number;           // starts que duram >= threshold (de T33)
  exposureToIntentRate: number;      // % de cliques que deixam intenção
  intentToStartRate: number;         // % de cliques-intent que viram starts
  exposureToStartRate: number;       // % de signals que viram starts
  exposureToEffectiveRate: number;   // % que viram runs efetivos
  shareOfExposure: number;           // % do total de signals
  shareOfRuns: number;               // % do total de starts
}
```

#### ArcadeFairStatus (4 estados)
```ts
type ArcadeFairStatus = 
  | 'unbalanced_exposure'              // gap >= 35pp → NÃO COMPARAR
  | 'exposure_correction_in_progress'  // gap > 15pp → CORRIGIR, RECHECK 7 dias
  | 'fair_comparison_window'           // gap 0-15pp → JANELA JUSTA aberta
  | 'decision_ready';                  // gap <= 15pp + runs >= threshold → DECIDIR
```

#### ArcadeExposureDuel (agregado)
```ts
{
  compared: { tarifaSlug, mutiraoSlug };
  scorecards: [ ArcadeExposureScorecard[] ];
  totals: { exposureSignals, starts };
  fairness: {
    status: ArcadeFairStatus;
    exposureDeltaPct: number;          // | A - B | / max(A,B) * 100
    runsDeltaPct: number;              // idem para starts
    summary: string;                   // narrativa do estado
    recommendedExposureBoost: number;  // +N sinais para arcade subexposto
    actions: string[];                 // ações operacionais
  };
  contextLeaders: {
    volumeLeader: string;              // quem tem mais runs (raw)
    efficiencyLeader: string;          // quem converte exposure→start melhor
    campaignLeader: string;            // T37 official decision (liderança T37)
  };
}
```

### 3.2 Fluxos de Computação

**Buscas de Evento** (ambos local e remote):
- `home_arcade_click` → arcade slug em metadata
- `explorar_arcade_click` → arcade slug em metadata
- `quick_to_arcade_click` → arcade slug em metadata
- `home_primary_play_click` + targetType=arcade → targetSlug
- `above_fold_game_click` + gameType=arcade → gameSlug
- `card_preview_interaction` → slug arcade (intenção baixa)
- `card_full_click` → slug arcade

**Local (Node.js)**: Lê `.local-data/events.json`, processa em memória, retorna T38 objeto

**Remote (Supabase)**: Consulta `game_events` com filtros estendidos, processa rows, retorna T38 objeto

Ambos convertem para `ArcadeExposureDuel` compatível. Sem duplicação de lógica.

---

## 4. Validação e Testes

### 4.1 Gates Finais - Resultados

| Gate | Comando | Status | Detalhes |
|------|---------|--------|----------|
| Verify | `npm run verify` | ✅ PASS | 52/52 checks, 0 failures, 100% success |
| Linting | `npm run lint` | ✅ PASS | No ESLint warnings/errors |
| Types | `npm run type-check` | ✅ PASS | Sem erros TypeScript (fix: ArcadeSlug type + as casting) |
| Unit Tests | `npm run test:unit` | ✅ PASS | 43 testes passando |
| Build | `npm run build` | ✅ PASS | Next.js build completo, 12 páginas estáticas, 0 erros |

### 4.2 Correções de Compilação

**JSX Syntax Errors** (app/estado/page.tsx):
- `<=` →  `&le;` (HTML entity)
- `->` → `{'\u2192'}` (Unicode arrow U+2192)

**TypeScript Type Safety** (lib/analytics/metrics.ts):
- Adicionado `type ArcadeSlug = 'tarifa-zero-corredor' | 'mutirao-do-bairro'`
- Type assertion: `rows[arcadeSlug as ArcadeSlug]`
- Guard block: Check se slug é válido antes de indexar

---

## 5. Propagação Operacional

### 5.1 Painel `/estado` (estado/page.tsx)

**Novo Card: "Linha Arcade - Exposição Justa do Duelo (T38)"**

**Signal Grid (6 sinais)**:
- Status (badge com cor)
- Gap de exposição (pp)
- Gap de share de runs (pp)
- Líder por volume (runs raw)
- Líder por eficiência (exposição → start rate)
- Líder por força de campanha (T37 official)

**Scorecard Table** (2 linhas arcade):
- Arcade | Exposição | Cliques Intent | Starts | Starts Efetivos | Expo→Start | Share Exposição

**Warning Box** (se unbalanced):
- Status badge
- Recomendação de boost
- Ações corretivas

### 5.2 Reports Operacionais

#### beta-snapshot.js
- Seção markdown: "Linha Arcade - duelo justo por exposição (T38)"
- Renderiza status, scorecards, líderes, ações

#### beta-export.js
- Field JSON: `export.arcadeExposureDuel`
- Local e remote paths

#### beta-circulation-report.js
- Seção pós-T37: Fairness status, gap visual, contexto de líderes, tabela scorecards

#### beta-distribution-report.js
- Integração em weekly plan: Se unbalanced, adiciona ação "Boost +N sinais arcade subexposto"

#### beta-campaign-brief.js
- Subsection "Duelo Justo por Exposição (T38)" antes de ações prioritárias
- Include corrective boost recommendations em weekly brief

---

## 6. Liderança Desacoplada

T38 introduz **três perspectivas de liderança**, evitando confusão T37 vs T38:

| Perspectiva | Métrica | Significado | Origem |
|-------------|---------|------------|--------|
| **Volume Leader** | Quantidade de `starts` (raw) | Qual arcade foi mais jogado | T38 exposição |
| **Efficiency Leader** | Taxa `exposição → starts` | Qual arcade converte melhor | T38 métricas |
| **Campaign Leader** | T37 official decision | Qual arcade vence por força editorial | T37 + minhas regras |

**Uso Operacional**:
- Se volumeLeader ≠ campaignLeader → volume enviesado, revisar vitrine
- Se efficiencyLeader ≠ campaignLeader → qualidade de starts diferente, reavaliar copy/positioning
- Se todos iguais → alinhamento perfeito, confiança alta em T37

---

## 7. Estados de Operação (FSM)

```
┌─────────────────────────────────────────────────────────┐
│               ARCADE FAIRNESS FSM (T38)                 │
└─────────────────────────────────────────────────────────┘

UNBALANCED_EXPOSURE
├─ Condição: gap >= 35pp OU min signals < 12
├─ Ação: ❌ NÃO DECLARAR VENCEDOR
├─ Recomendação: Reforçar vitrine do arcade subexposto
└─ Next: → EXPOSURE_CORRECTION_IN_PROGRESS

EXPOSURE_CORRECTION_IN_PROGRESS
├─ Condição: gap > 15pp OU min signals < 30
├─ Ação: ⏳ AGUARDAR REBALANCEAMENTO
├─ Recomendação: +N sinais por semana até gap <= 15pp
└─ Next: → FAIR_COMPARISON_WINDOW (gap corrigido)

FAIR_COMPARISON_WINDOW
├─ Condição: gap 0-15pp AND min signals >= 30
├─ Ação: ✓ COMPARAÇÃO JUSTA ABERTA
├─ Recomendação: Monitorar runs efetivos
└─ Next: → DECISION_READY (runs >= threshold)

DECISION_READY
├─ Condição: gap <= 15pp AND runs >= threshold
├─ Ação: ✅ PODE DECLARAR VENCEDOR T37
├─ Recomendação: Implementar decisão
└─ Final: Arcade declarado vence ciclo
```

---

## 8. Exemplos de Saída

### 8.1 Snapshot Markdown (beta-snapshot.js)
```markdown
## Linha Arcade - duelo justo por exposição (T38)

**Status**: fair_comparison_window (gap: 12pp)

**Scorecards**:
| Arcade | Exposição | Intent | Starts | Starts Efet. | Expo→Start | Share |
|--------|-----------|--------|--------|--------------|------------|-------|
| Tarifa Zero | 242 | 198 | 47 | 31 | 19.4% | 52% |
| Mutirão | 215 | 176 | 42 | 28 | 19.5% | 48% |

**Contexto de Líderes**:
- Volume: Tarifa Zero (47 starts vs 42)
- Eficiência: Mutirão (19.5% vs 19.4%) — tie dentro de noise
- Campanha (T37): Tarifa Zero (força editorial maior)

**Ação**: Monitorar próximos 7 dias. Fairness confirmada.
```

### 8.2 Estado Card (app/estado/page.tsx)
```
┌─────────────────────────────────────────────────────────┐
│ Linha Arcade - Exposição Justa do Duelo (T38)           │
├─────────────────────────────────────────────────────────┤
│ Status: [fair_comparison_window]                         │
│ Gap Exposição: 12pp (Meta: ≤ 15pp)                      │
│ Gap Runs: 5pp                                            │
│ Líder Volume: Tarifa Zero (47)                           │
│ Líder Eficiência: Mutirão (19.5%)                        │
│ Líder Campanha (T37): Tarifa Zero                        │
│ Arcade Subexposto: nenhum                                │
├─────────────────────────────────────────────────────────┤
│ Scorecard Table:                                         │
│ [table with exposição, intentClicks, starts, rates...]  │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Arquivo Proje Estrutura

```
tools/
├── arcade-exposure-utils.js     ← NEW (T38 util)
├── beta-export.js               ← UPDATED (T38 compute + event filter)
├── beta-snapshot.js             ← UPDATED (T38 markdown + compute)
├── beta-circulation-report.js   ← UPDATED (T38 section)
├── beta-distribution-report.js  ← UPDATED (T38 weekly actions)
└── beta-campaign-brief.js       ← UPDATED (T38 brief + boost recs)

lib/analytics/
└── metrics.ts                   ← UPDATED (T38 types + functions)

app/estado/
└── page.tsx                     ← UPDATED (T38 card full)

docs/
├── roadmap.md                   ← UPDATED (T38 formal entry + T39 focus)
├── linha-arcade-da-campanha.md  ← UPDATED (T38 context)
├── runbook-operacional.md       ← UPDATED (T38 checklist)
└── plano-distribuicao-por-efetividade.md ← UPDATED (T38 subsection)

public/
└── (no arcade assets changed)
```

---

## 10. Impacto Zero Regressions

✅ **T37 Intacto**: Lógica de decisão T37 não tocada. Apenas validação de fairness adicionada.

✅ **T33 Compatível**: Effective runs analysis (T33) reutilizado em T38 sem mudanças.

✅ **UI/UX**: Card novo adicionado, sem quebrar cards existentes.

✅ **Event Tracking**: 4 eventos novos adicionados ao filter, sem remover existentes.

✅ **Reports**: Seções T38 adicionadas após T37, não sobrescrevem.

✅ **Tests**: 43 unit tests rodando, 0 novas falhas.

---

## 11. Próximo Ciclo (T39)

**Foco Sugerido**:
1. Consolidar monitoramento de duelo arcade em janela justa (T38) com distribuição pareada
2. Avaliar convergência: liderança oficial T37 vs liderança eficiência T38
3. Sem novo arcade até atingir 30+ runs efetivos por arcade na janela justa
4. Preparar pré-produção de próximo arcade com contraste essencial (novo verbo, não lane-based)
5. Manter guardrails: sem auth/CMS/admin, sem formato médio, sem quebrar quick e arcades live

---

## 12. Conclusão

**Tijolo 38 concluído com sucesso pleno**. 

Duelo arcade agora é **justo, transparente e operacionalizado**. Exposição real de cada arcade é mensurável e guia decisão semanal. Sem regressões, com zero breaking changes.

Próxima validação: Monitorar T38 fairness window nos próximos 7-14 dias durante operação semanal.

---

**Report Date**: 2026-03-08 14:50  
**System**: Hub Jogos Pré-Campanha  
**Tijolo**: 38  
**Status**: ✅ Concluído e Validado
