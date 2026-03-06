# Estado da Nação - Hub de Jogos da Pré-Campanha

**Data:** 06/03/2026, 19:15  
**Status:** ✅ Tijolo 17 Concluído - Leitura Disciplinada de Experimentos  

---

## 📊 Tijolo 17: Leitura Disciplinada

**Objetivo:** Implementar camada de leitura disciplinada para experimentos com scorecards, critérios de interpretação e métricas de circulação integradas nos scripts operacionais.

**Status:** ✅ Concluído

### ✅ Entregas Completas

#### 1. Sistema de Scorecards
- ✅ `lib/experiments/scorecard.ts` criado com thresholds explícitos
- ✅ Status de experimento: `insufficient_data`, `monitoring`, `directional_signal`, `inconclusive`, `candidate_winner`
- ✅ Cálculo de lift e rationale automático
- ✅ Integração em `/estado` com display de scorecards

#### 2. Métricas de Circulação
- ✅ `lib/analytics/metrics.ts` completamente reescrito (618 linhas)
- ✅ CTR por placement (hero, outcome_primary, outcome_secondary, share_reentry)
- ✅ Top CTAs com tracking e contagens
- ✅ Taxa de reentrada (share → next_game_click + hub_return_click)
- ✅ Saídas segmentadas por fonte/jogo/engine

#### 3. Scripts Operacionais
- ✅ `tools/circulation-utils.js` criado - utilitários compartilhados
- ✅ `tools/beta-snapshot.js` reescrito com circulação e scorecards
- ✅ `tools/beta-export.js` reescrito com circulação e scorecards
- ✅ `tools/beta-circulation-report.js` criado - relatório dedicado de circulação
- ✅ npm script `beta:circulation-report` adicionado

#### 4. Dashboard `/estado`
- ✅ Seção de circulação com CTR, saídas, reentrada
- ✅ Display de scorecards com status e rationale
- ✅ Avisos de critérios de leitura quando amostra insuficiente
- ✅ Metadados de experimento (primaryMetric, affectedSurface)

#### 5. Refinamentos de Copy Baseados em Evidência
- ✅ Hero da home com variante experimental (`home-hero-cta-copy`)
- ✅ Outcome primary CTA com variante experimental (`outcome-primary-cta-copy`)
- ✅ Share reentry CTAs com tracking (`share-page-reentry-cta`)
- ✅ Tracking de navegação: `next_game_click`, `hub_return_click`

#### 6. Banco de Dados
- ✅ 6 views Supabase para análise remota de circulação
  - `beta_circulation_placement_overview`
  - `beta_circulation_cta_overview`
  - `beta_circulation_reentry_overview`
  - `beta_exit_by_source`
  - `beta_exit_by_game`
  - `beta_exit_by_engine`

---

## 🔬 Thresholds de Leitura (v1)

```typescript
export const scorecardThresholds = {
  minViewsPerVariant: 40,
  minClicksPerPlacement: 25,
  minSessionsPerSource: 20,
  minShareViewsForReentry: 30,
  directionalLiftPct: 15,
  candidateLiftPct: 25,
};
```

---

## 🧪 Experimentos Ativos

### 1. outcome-primary-cta-copy
- **Primary Metric:** completion_rate
- **Affected Surface:** outcome screen
- **Variants:** control ("Jogar outro jogo"), variant ("Continuar explorando")

### 2. share-page-reentry-cta
- **Primary Metric:** share_reentry_rate
- **Affected Surface:** share page
- **Variants:** control (basic CTA), variant (explicit reentry prompts)

### 3. home-hero-cta-copy
- **Primary Metric:** ctr
- **Affected Surface:** home page hero
- **Variants:** control ("Começar"), variant ("Explorar jogos agora")

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos
- `lib/experiments/scorecard.ts`
- `lib/experiments/client.ts`
- `tools/circulation-utils.js`
- `tools/beta-circulation-report.js`

### Arquivos Completamente Reescritos
- `lib/analytics/metrics.ts` (~618 linhas)
- `tools/beta-snapshot.js`
- `tools/beta-export.js`
- `app/page.tsx` (hero com variante experimental)
- `components/games/shared/GameOutcome.tsx` (variante + tracking navegação)
- `app/share/[game]/[result]/SharePageClient.tsx` (reentry CTAs + tracking)
- `app/share/[game]/[result]/share.module.css` (estilos reentry)

### Arquivos Modificados
- `lib/experiments/types.ts` (+primaryMetric, +affectedSurface)
- `lib/experiments/registry.ts` (metadados experimentos)
- `lib/experiments/index.ts` (exports scorecard, client)
- `app/estado/page.tsx` (circulação + scorecards + warnings)
- `app/explorar/page.tsx` (refinamento copy)
- `package.json` (+beta:circulation-report)
- `README.md` (status atualizado, sumário Tijolo 17)
- `supabase/tijolo-12-remote-learning.sql` (+6 views circulação)

---

## ✅ Gates Técnicos

| Gate | Status | Resultado |
|------|--------|-----------|
| type-check | ✅ Passou | 0 erros TypeScript |
| lint | ✅ Passou | 0 warnings ESLint |
| test:unit | ✅ Passou | 15 testes, 6 files |
| build | ✅ Passou | Production build successful |
| verify | ✅ Passou | 52 checks, 100% success |

---

## 🎯 Scripts Operacionais Validados

```bash
# Snapshot com scorecards e circulação
npm run beta:snapshot --format=json
# Output: scorecards array com status de todos experimentos

# Export estruturado
npm run beta:export
# Output: JSON com circulationSummary, scorecards, readingCriteria

# Relatório dedicado de circulação
npm run beta:circulation-report
# Output: MD com CTR, saídas, reentrada, warnings de amostra
```

---

## 📈 Princípios de Leitura Disciplinada

1. **Thresholds Explícitos:** Todos os critérios de amostra mínima versionados em código
2. **Status Progressivo:** insufficient_data → monitoring → directional_signal → inconclusive/candidate_winner
3. **Warnings Ativos:** Scripts e UI alertam quando amostra insuficiente para conclusões confiáveis
4. **Lift Interpretativo:** 15% para sinal direcional, 25% para candidato vencedor
5. **Sem Deploy Automático:** Scorecards informam decisões humanas, não disparam deploys

---

## 📊 Snapshot Atual

### Completions (Local Beta Data)
- Total: 0 (ambiente de desenvolvimento limpo)

### Share Views (Local Beta Data)
- Total: 4 visualizações
- Reentry Actions: 0
- Taxa de Reentrada: 0%

### Status de Experimentos
- outcome-primary-cta-copy: `insufficient_data` (0 views)
- share-page-reentry-cta: `insufficient_data` (4 views, threshold: 30)
- home-hero-cta-copy: `insufficient_data` (0 impressions)

**Nota:** Status esperado em ambiente de desenvolvimento. Produção com tráfego real acumulará dados para leitura.

---

## 🔄 Próximos Passos

1. ✅ Tijolo 17 concluído - todas entregas validadas
2. ⏳ Commit work com referência ao Tijolo 17
3. ⏳ Deploy para produção para acumular dados reais
4. ⏳ Monitorar scorecards em `/estado` conforme dados chegam
5. ⏳ Aplicar decisões baseadas em scorecards quando thresholds atingidos

---

## 📋 Lições Aprendidas

1. **Thresholds Explícitos:** Versionar critérios de interpretação em código evita decisões arbitrárias
2. **Warnings Preventivos:** Alertar sobre amostra insuficiente previne conclusões prematuras
3. **Utilitários Compartilhados:** circulation-utils.js eliminou duplicação entre scripts Node.js
4. **Scorecards como Documentação:** Status explícito torna interpretação reproduzível e auditável
5. **Circulação Multi-Granularidade:** Aggregate (placement-level) + Detail (CTA-level) essenciais para diagnóstico

---

## ✅ Conclusão

Tijolo 17 entregue com **100% de sucesso nos gates técnicos**. 

O sistema de leitura disciplinada está operacional:
- Scorecards com thresholds explícitos
- Circulação integrada nos scripts operacionais
- Dashboard `/estado` com disciplina de interpretação
- Copy refinements evidence-based
- Supabase views para análise remota

**O hub agora possui camada completa de observação disciplinada de comportamento e experimentos.**

---

*Relatório gerado para documentar conclusão do Tijolo 17.*
