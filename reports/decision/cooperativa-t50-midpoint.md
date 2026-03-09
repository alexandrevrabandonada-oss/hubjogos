# T50 Midpoint - Checkpoint Intermediário

**Data:** 12/03/2026 meio-dia (TEMPLATE - será preenchido no meio da semana)  
**Período avaliado:** Dias 1-3.5 de T50 (09/03 23:30 - 12/03 12:00)  
**Propósito:** Avaliar sinais iniciais e decidir se ajustes leves são necessários

---

## 1. Há sinais mínimos de vida?

### Runs completadas
- [ ] Sim, **≥1 conclusão observada**
- [ ] Não

**Evidência:**
- Runs observadas até agora: `[TBD]`
- Runs efetivas: `[TBD]`
- Colapsos observados: `[TBD]`

### Replay espontâneo
- [ ] Sim, **≥1 evento `arcade_replay_click`**
- [ ] Não

**Evidência:** `[TBD]`

### CTA pós-run
- [ ] Sim, **≥1 evento `campaign_cta_click_after_run`**
- [ ] Não

**Evidência:** `[TBD]`

### Mutirão ativado
- [ ] Sim, **≥1 run com ação mutirão**
- [ ] Não

**Evidência:** `[TBD]`

---

## 2. Qual é o status?

| Status | Significa |
|--------|----------|
| 🟢 **VIVO** | Pelo menos UM sinal apareceu (replay, CTA, run completa, mutirão) |
| 🟡 **CRÍTICO** | Cliques iniciais registrados (25+ starts) mas nenhuma conclusão ainda |
| 🔴 **MORTO** | Nenhuma atividade observada, nenhum click sequer |

**Status observado:** `[TBD]`

---

## 3. Alguma ação corretiva leve é necessária?

### Possíveis gargalos identificados

#### A. Jogo muito difícil cedo demais
- Starts (cliques): `[TBD]`
- Completions (conclusões): `[TBD]`
- Dropout rate: `[TBD]%`

**Se >95% dropout:** Considerar ajustar grace period (6s → 9s já foi feito; considerar 12s?) ou pressure base.

#### B. Loop não está claro
- Qual ação é mais usada: `[TBD]`
- Qual estação é problema: `[TBD]`
- Fase média atingida: `[TBD]%`

**Se fase média <70%:** Considerar clareza da intro ou HUD.

#### C. Não há recompensa clara
- Survival rate observada: `[TBD]%`
- Collectivity rate observada: `[TBD]%`

**Se survival <10% e collectivity <5%:** Jogo pode estar desbalanceado ou punitivo demais.

#### D. Sem diversão (replay)
- Replay rate: `[TBD]%`
- CTA pós-run rate: `[TBD]%`

**Se ambos 0%:** Jogo não convida reentrada, pode precisar feedback visual ou copy do botão replay.

---

## 4. A janela pode prosseguir sem ajustes?

### Checklist de prosseguimento

- [ ] **Sem bloqueadores críticos:** Jogo não quebrou, sem erros de runtime
- [ ] **Pelo menos ALGUM sinal:** Já há pelo menos 1 replay ou 1 conclusão ou mutirão
- [ ] **Campanha consegue agir:** Distribuição pode prosseguir normalmente

**Resultado:** Sim/Não

---

## 5. Há sinais iniciais de qual direção?

### Se VIVO (qualquer sinal positivo):
```
→ Prosseguir observação por mais 3-4 dias
→ Permitir micro-boost de vitrine se sinal é replay/CTA
→ Não inflar escopo, manter foco observacional
→ Decisão final ao fim de 7 dias baseada em volume consolidado
```

### Se CRÍTICO (starts mas nenhuma conclusão):
```
→ Autorizar 1-2 ajustes leves de balanceamento:
   - Aumentar grace period (9s → 12s)
   - Reduzir pressão base 15% em todas as fases
   → Re-testar por 24-48h
   → Se ainda 0% completions: arquivo para backlog frio
```

### Se MORTO (nenhuma atividade):
```
→ Decisão imediata: arquivo para backlog frio
→ Mover Cooperativa para vitrine mínima (só no catálogo, sem home/explorar spotlight)
→ Abrir bairro-resiste para implementação ativa no T51
```

---

## 6. Recomendação operacional

### Para Campanha de Alexandre Fonseca

**Status:** `[TBD]` (Vivo / Crítico / Morto)

**Ação recomendada:**
```
[TBD - será preenchido no checkpoint]
```

**Distribuição para próximas 3-4 dias:**
```
[TBD - continuar leve, sem mega-push até checkpoint]
```

---

## Dados para Preencher (Template)

```
- runs_observadas: [número]
- runs_completas: [número]
- replays: [número]
- cta_pos_run: [número]
- mutiroes_ativados: [número]
- survival_rate: [%]
- collectivity_rate: [%]
- collapse_reasons: [lista]
- most_used_action: [ação]
- most_critical_station: [estação]
- average_survival_time: [segundos]
```

---

## Próximo Passo

**Data:** 16/03/2026 23:30 (fim de T50)

Consolidar dados completos e tomar decisão final:
- `promote_to_premium_pass` (≥30 runs, >40% survival, >60% collectivity)
- `run_short_tuning_cycle` (5-25 runs, 20-40% survival, gargalos óbvios)
- `archive_to_cold_backlog` (0-4 runs, nenhum sinal, sem vida observável)

---

**Criado em:** 09/03/2026 23:30  
**Status:** Template - será preenchido no mid-point de T50 (12/03 meio-dia)
