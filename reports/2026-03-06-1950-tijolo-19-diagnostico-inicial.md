# Diagnóstico Inicial - Tijolo 19: Rotina Operacional Temporal Contínua

**Data:** 2026-03-06 19:50
**Status:** DIAGNÓSTICO CONCLUÍDO

---

## Estado de Entrada

### 1. Tijolo 18 (Pré-requisito) ✅
- ✅ Janelas temporais implementadas (24h, 7d, 30d, all)
- ✅ Flags `--window` em scripts beta (snapshot, export, circulation-report)
- ✅ `beta:staleness-check` criado e funcional
- ✅ `/estado` com seletor de window
- ✅ Scorecards temporais
- ✅ Gate verificação: PASSOU (lint, type-check, test:unit, build, verify)

### 2. Infraestrutura de Automação ✅

**GitHub Actions Workflows**:
- `ci.yml`: Fast-checks + E2E (PR-triggered)
- `ops-routine.yml`: Cron a cada 6 horas (⏰ SCHEDULE-BASED)

**Pipeline ops-routine.yml Atual**:
1. ✅ `npm run beta:snapshot`
2. ✅ `npm run beta:snapshot -- --format=json`
3. ✅ `npm run beta:export`
4. ✅ `npm run ops:export-audit`
5. ✅ `npm run ops:check-alerts`
6. ⏳ `npm run beta:staleness-check` - **NÃO INTEGRADO**

**Artifacts e Retenção**:
- `reports/snapshots/` - JSON snapshots
- `reports/exports/` - Exports consolidados
- `reports/ops-alerts/` - Alertas leves
- Retention: 14 dias

### 3. Scripts Operacionais ✅

| Script | Status | Janela-aware | Export |
|--------|--------|-------------|--------|
| `beta:snapshot` | ✅ Funcionalidade | ✅ --window | Markdown + JSON |
| `beta:export` | ✅ Funcionalidade | ✅ --window | JSON |
| `beta:circulation-report` | ✅ Funcionalidade | ✅ --window | JSON/Markdown |
| `beta:readiness-report` | ✅ Funcionalidade | ✅ --window | Markdown |
| `beta:staleness-check` | ✅ Funcionalidade | N/A | JSON/Markdown |
| `beta:ops` | ✅ Funcionalidade | ❌ Não temporal | Markdown |
| `ops:check-alerts` | ✅ Funcionalidade | ❌ Não temporal | JSON/Markdown |

### 4. Dashboard `/estado` 📊

**Atualmente implementado**:
- ✅ Window selector dropdown (24h, 7d, 30d, all)
- ✅ Metrics carregadas por window (collectBestAvailableMetrics)
- ✅ Ops routine status embarcado
- ✅ Último evento display
- ✅ Freshness warnings

**Gaps identificados**:
- ❌ Scorecards não mostram janela usada
- ❌ Comparação entre janelas (24h vs 7d) não disponível
- ❌ Experimentos "ativos mas sem tráfego" não destacados por window
- ❌ Último evento staleness check não integrado visualmente
- ❌ Recomendação de qual janela usar não aparece

### 5. Severidade de Alertas ⚠️

**Estado atual**: Não formalmente definido

**Contexto do runbook**:
- `ops:check-alerts` tem `prioritario parado` (feedback stale)
- `ops:check-alerts` tem `auditoria inativa` (audit log stale)
- Default: warning (não fatal)
- Opcional: `OPS_ALERT_STRICT=true` para falhar

**Gaps identificados**:
- ❌ Regras de severidade não documentadas
- ❌ Quando warning é "ignorável" vs "ação necessária" - pouco claro
- ❌ Threshold de staleness (72h) não linkado aos alertas
- ❌ Diferença entre "baixa amostra" e "ausência de tráfego" não explícita
- ❌ Workflows não falham em alertas críticos (só warnings)

### 6. `beta:ops` Operacional 🔍

**Fornece atualmente**:
- ✅ Status Supabase (conectividade)
- ✅ Experimentos (ativo/inativo/override)
- ✅ Token de operações protegidas
- ✅ Audit log resumido (últimas ações)
- ✅ Feedback pendente
- ✅ Último snapshot auditado
- ✅ Alertas locais (se existirem)

**Gaps identificados**:
- ❌ Não mostra último staleness check
- ❌ Não mostra qual janela foi usada em último snapshot
- ❌ Não mostra último evento remoto visto
- ❌ Experimentos sem tráfego recente não destacados
- ❌ Alertas resumidos não têm contexto temporal

### 7. Documentação Operacional 📚

| Documento | Status | Gaps |
|-----------|--------|------|
| `docs/runbook-operacional.md` | ✅ Existe | ❌ Sem contexto temporal, regras de severidade informais |
| `docs/tijolos.md` | ✅ T17+T18 | ✅ Bom (Tijolo 18 documenta windows) |
| `docs/arquitetura.md` | ✅ Existe | ❌ Sem seção de operação temporal |
| `README.md` | ✅ Existe | ⏳ Pode listar T19 automation |
| `docs/roadmap.md` | ✅ Existe | ⏳ T19 não listado |

**Docs faltantes**:
- ❌ `docs/alertas-severidade.md` - Regras formais de severidade
- ❌ Guia visual de "quando usar qual janela"
- ❌ Checklist de "o que fazer se /estado parecer morto"

---

## Mapa de Tarefas Tijolo 19

### Fase 1: Integração de Staleness ao Cron
**Impacto**: Frescor entrar em automação contínua

- [ ] Adicionar `npm run beta:staleness-check` ao workflow ops-routine.yml
- [ ] Capturar risultati (JSON para parsing, upload como artifact)
- [ ] Registrar no GitHub Step Summary
- [ ] Documentar no runbook (quando é warning vs crítico)

### Fase 2: Definir Severidade Operacional
**Impacto**: Alertas com significado claro

- [ ] Criar `docs/alertas-severidade.md` com regras formais
- [ ] Classificar alertas: 🟢 info, 🟡 warning, 🔴 critical
- [ ] Linking com thresholds Tijolo 18 (72h, minSample, etc)
- [ ] Atualizar runbook com decision tree

### Fase 3: Window-Aware `/estado`
**Impacto**: Dashboard operacional verdadeiro

- [ ] Mostrar janela selecionada em cada seção
- [ ] Adicionar badges de amostra/staleness por window
- [ ] Comparação resumida entre windows (24h vs 7d)
- [ ] Highlighting de "ativo mas sem tráfego"
- [ ] Sugestão de qual janela usar para cada caso

### Fase 4: Reforçar Scorecards Operacionais
**Impacto**: Leitura mais honesta de experimentos

- [ ] Mostrar window em scorecard header
- [ ] Highlight de "ativo sem tráfego" (sessions=0 na janela)
- [ ] Warnings de amostra pequena
- [ ] Opcional: diferença 24h vs 7d

### Fase 5: Evoluir `beta:ops`
**Impacto**: Check diário mais útil

- [ ] Adicionar último staleness check result
- [ ] Adicionar janela usada em último snapshot
- [ ] Listar experimentos "ativos mas sem tráfego"
- [ ] Mostrar último evento remoto visto (com age)
- [ ] Alertas resumidos com contexto

### Fase 6: Export Operacional Resumido
**Impacto**: Rastreabilidade e histórico

- [ ] Gerar `reports/ops/last-staleness-summary.md` após staleness check
- [ ] Mini export de "estado da rotina temporal" em cada run
- [ ] Incluir em artifacts do workflow

### Fase 7: Runbook Real
**Impacto**: Documentação operacional prática

- [ ] Atualizar `docs/runbook-operacional.md` com seção temporal
- [ ] Criar `docs/alertas-severidade.md` (formalização)
- [ ] Criar guia: "quando usar 24h, 7d, 30d, all"
- [ ] Checklist: "o que fazer se /estado parece morto"
- [ ] Atualizar `README.md` com T19

### Fase 8: Verificação Final + Relatório
**Impacto**: Closure com garantias

- [ ] Terminal checks: lint, type-check, test, build, verify
- [ ] E2E se aplicável
- [ ] Gerar `reports/2026-03-06-XXXX-tijolo-19-estado-da-nacao.md`

---

## Critério de Sucesso Tijolo 19

- ✅ Staleness check automático no cron (a cada 6h)
- ✅ Severidade de alertas formalmente definida
- ✅ `/estado` mostra contexto temporal em cada seção
- ✅ `beta:ops` inclui staleness + último evento + context
- ✅ Runbook atualizado com cenários reais
- ✅ Lint/type-check/test/build/verify tudo PASSA
- ✅ Nenhum regress nas 4 engines
- ✅ Relatório Estado da Nação gerado

---

## Riscos Restantes

| Risco | Mitigação |
|-------|-----------|
| Staleness false positives em low-traffic | Threshold 72h bem documentado, manual override possível |
| Dashboard fica muito denso | Começar simples: janela em header, alertas resumidos |
| Workflow fica lento | Staleness check é rápido (~2s), snapshots já rodavam |
| Integração mal com window-aware | Testar cada script com --window antes de merge |

---

## Próximos Passos Imediatos

1. ✅ Diagnóstico concluído (este documento)
2. 🔄 Começar Fase 1: Integrar staleness ao cron
3. Continuar Fase 2-8 seguindo roadmap

---

**Status**: Ready to execute
**Estimado**: 6-8h de trabalho (modular, funcional por fase)
