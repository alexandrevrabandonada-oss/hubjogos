# T50 Final Decision - Decisão Oficial da Cooperativa

**Data:** 16/03/2026 23:30 (fim de 7 dias)  
**Período:** 09/03 23:30 - 16/03 23:30 (T50 completo)  
**Propósito:** Decisão honesta e final sobre o futuro de `cooperativa-na-pressao`

---

## Scorecard Consolidado T50 (7 dias)

| Métrica | T49 Baseline | T50 Observado | Meta | Status |
|---------|------------|---------------|------|--------|
| Runs observadas | 0 | `[TBD]` | >0 | `[🔴/🟡/🟢]` |
| Runs efetivas | 0 | `[TBD]` | >0 | `[🔴/🟡/🟢]` |
| Survival rate | 0% | `[TBD]%` | >20% | `[🔴/🟡/🟢]` |
| Collectivity rate | 0% | `[TBD]%` | >30% (tuning) / >60% (premium) | `[🔴/🟡/🟢]` |
| Mutirão usage | 0% | `[TBD]%` | >10% | `[🔴/🟡/🟢]` |
| Replay rate | 0% | `[TBD]%` | >5% | `[🔴/🟡/🟢]` |
| CTA pós-run | 0% | `[TBD]%` | >5% | `[🔴/🟡/🟢]` |
| Collapse reasons | N/A | `[TBD lista]` | Identificados, não punitivos | `[TBD]` |
| Card views | 22 | `[TBD]` | Crescimento orgânico | `[TBD]` |
| Arcade starts totais | 25 | `[TBD]` | Crescimento + replay | `[TBD]` |

---

## Decisão Final

### Três caminhos possíveis

#### 1. ✅ `promote_to_premium_pass`

**Critérios:**
- Runs completadas: ≥30 na janela
- Survival rate: ≥40%
- Collectivity rate: ≥60%
- Mutirão usage: ≥30%
- Replay rate: ≥15%
- Zero crashes de runtime
- Score médio: >500

**Se esta é a decisão:**
```
Implicação:
- Liberar assets premium (SVG profissional, HUD polish, final screen premium)
- Adicionar audio base com política de ativação no primeiro input
- Promover em vitrine: home highlight + explorar spotlight
- Aumentar distribuição: +3 sinais de exposição semanal
- Prosseguir para T51 com premium finalizado
```

**Justificativa:** `[TBD - explicar baseado em dados]`

---

#### 2. 🔧 `run_short_tuning_cycle`

**Critérios:**
- Runs completadas: 5-25 na janela
- Survival rate: 20-40%
- Replay rate: 5-10%
- Collectivity rate: 30-60%
- Gargalos óbvios identificados (ex: collapse cedo, HUD confusa, ação dominante clara)

**Se esta é a decisão:**
```
Implicação:
- Identificar 2-3 parâmetros específicos para ajustar:
  1. [TBD gargalo]
  2. [TBD gargalo]
  3. [TBD gargalo]
- Aplicar micro-tuning leve (não reescrita)
- Re-observar por 7 dias (T51 será "T50 com ajustes")
- Diferir premium pass até próximo checkpoint
- Manter vitrine atual
```

**Gargalos identificados:**
```
[TBD lista de gargalos com métrica evidente]
```

**Justificativa:** `[TBD - explicar por que ajustes podem resolver]`

---

#### 3. 🗃️ `archive_to_cold_backlog`

**Critérios:**
- Runs completadas: 0-4 na janela
- Nenhum replay espontâneo
- Nenhuma CTA pós-run ativada
- Nenhum mutirão usado
- Zero sinais de vida observáveis

**Se esta é a decisão:**
```
Implicação:
- Mover Cooperativa para backlog frio (vitrine mínima)
- Home: remover do spotlight arcade, manter apenas no "Ver mais" explorar
- Explorar: listar em "Em avaliação" ou "Backlog", sem distribuição ativa
- Abrir bairro-resiste para implementação ativa no T51
- Preservar código da Cooperativa (pode retornar após T52)
- Documentar lições do loop para futuro
```

**Lições documentadas:**
```
[TBD - o que aprendemos que pode ajudar bairro-resiste ou outros]
```

**Justificativa:** `[TBD - explicar que não houve sinal suficiente para continuar]`

---

## Decisão Oficial

**Escolhida:** `[ promote_to_premium_pass | run_short_tuning_cycle | archive_to_cold_backlog ]`

**Aprovação:** Ciclo T50 finalizado com decisão honesta baseada em dados

---

## Impacto Para a Campanha de Alexandre Fonseca

### Status da linha arcade (consolidado T50)

Após decisão T50:
- **Tarifa Zero RJ:** Continua como arcade líder (confirmado em T37-T40)
- **Mutirão do Bairro:** Continua em validação forte (T38 fairness correction em andamento)
- **Cooperativa na Pressão:** `[TBD resultado]` (premium / tuning / arquivo)
- **Próximo:** `[bairro-resiste em T51 se c ooperativa for arquivo; senão manter em pré-produção]`

### Prioridades de distribuição (próximas semanas)

```
[TBD - baseado em decisão T50]
```

### Timeline de produto (T51+)

```
[TBD - roadmap afetado pela decisão de T50]
```

---

## Gate Técnico T50

| Gate | Resultado |
|------|-----------|
| `npm run lint` | `[PASS/FAIL]` |
| `npm run type-check` | `[PASS/FAIL]` |
| `npm run test:unit` | `[PASS/FAIL]` |
| `npm run build` | `[PASS/FAIL]` |
| `npm run verify` | `[PASS/FAIL]` |

---

## Relatório Final

Documentação consolidada em:
```
reports/YYYY-MM-DD-HHMM-t50-estado-da-nacao.md
```

Contém:
1. Diagnóstico inicial
2. Definição da janela T50
3. Scorecard vivo da Cooperativa (checkpoint mid-point)
4. Melhorias em `/estado`, `beta:circulation-report`, `beta:campaign-brief`
5. Ajustes feitos ou adiados
6. Resultado de gates técnicos
7. Decisão final oficial com rationale
8. O que fica para T51

---

## Próximos Passos (T51)

### Se `promote_to_premium_pass`:
- Assets premium finalizados (SVG, audio)
- Final screen premium integrado
- Início de campanha "Novo arcade premium: Cooperativa"
- Distribuição ampliada

### Se `run_short_tuning_cycle`:
- T51 será re-observação de tuning
- Mesmo jogo, parâmetros ajustados
- Checkpoint similar em 12/03 + decisão em 23/03

### Se `archive_to_cold_backlog`:
- Abrir `bairro-resiste` para implementação (T51)
- Cooperativa em catálogo mas sem vitrine primária
- Potencial retorno futuro (T52+) se contexto muda

---

**Criado em:** 09/03/2026 23:30  
**Status:** Template - será preenchido ao fim de T50 (16/03 23:30)  
**Assinado:** Ciclo T50 Cooperativa Decision
