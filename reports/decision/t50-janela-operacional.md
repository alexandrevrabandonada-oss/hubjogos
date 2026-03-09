# T50 - Janela Operacional da Cooperativa

**Arquivo:** Definição da janela de observação e critérios de decisão  
**Data criação:** 09/03/2026 23:30  
**Versão:** 1.0

---

## Período da Janela T50

| Aspecto | Valor |
|---------|-------|
| **Início** | 09/03/2026 23:30 (fim de T49) |
| **Checkpoint intermediário** | 12/03/2026 meio-dia (criação de mid-point report) |
| **Fechamento** | 16/03/2026 23:30 (fim de 7 dias) |
| **Duração** | 7 dias completos |
| **Fontes de dado** | Supabase + fallback local |

---

## Estado Inicial (Baseline T49)

| Métrica | T49 Baseline | Esperado T50 |
|---------|-------------|------------|
| Runs observadas | 0 | >0 |
| Runs efetivas | 0 | >0 |
| Survival rate | 0% | >20% |
| Collectivity rate | 0% | >30% (meta) |
| Mutirão usage | 0% | >10% |
| Replay rate | 0% | >5% |
| CTA pós-run | 0% | >5% |
| Card views | 22 | ? |
| Arcade starts totais | 25 | ? |
| Conclusões | 0 | >5 |

---

## Critérios de Vida (Sinais Mínimos)

Para jogo continuar em ciclo ativo, **pelo menos UM** destes sinais deve aparecer:

1. **Runs completadas:** ≥5 no período
2. **Replay espontâneo:** ≥1 evento `arcade_replay_click` para Cooperativa
3. **CTA pós-run:** ≥1 evento `campaign_cta_click_after_run` iniciado da Cooperativa
4. **Survival observável:** ≥1 run com >50% survival (não colapso cedo demais)
5. **Collectivity usado:** ≥1 run com mutirão ativado (>0% collectivity)

Se **NENHUM** sinal aparecer ao fim da janela → arquivo para backlog frio.

---

## Critérios de Decisão Final

### Canais de saída

#### 1. `promote_to_premium_pass` ✅ Premium
**Condições:**
- Runs completadas: ≥30 na janela
- Survival rate: ≥40%
- Collectivity rate: ≥60%
- Mutirão usage: ≥30%
- Replay rate: ≥15%
- Zero crashes de runtime
- Score médio: >500

**Implicação:** Liberar assets premium, audio base, final screen premium, add HUD polish.

#### 2. `run_short_tuning_cycle` 🔧 Tuning Curto
**Condições:**
- Runs completadas: 5-25 na janela
- Survival rate: 20-40%
- Replay rate: 5-10%
- Collectivity rate: 30-60%
- Gargalos óbvios identificados (ex: collapse cedo demais, HUD confusa)

**Implicação:** Ajustar 2-3 parâmetros de balanceamento (grace period, pressão base, action potency), re-observar por 7 dias antes de premium pass.

#### 3. `archive_to_cold_backlog` 🗃️ Arquivamento
**Condições:**
- Runs completadas: 0-4 na janela
- Nenhum replay espontâneo
- Nenhuma CTA pós-run ativada
- Nenhum mutirão usado
- Zero sinais de vida observáveis

**Implicação:** Mover para backlog frio, abrir `bairro-resiste` para implementação ativa no T51, manter Cooperativa no catálogo mas sem vitrine prioritária.

---

## Regras de Observação

### O que conta como "run observada"
- ✅ `arcade_run_start` registrado
- ✅ `arcade_run_end` registrado (completion or collapse)
- ✅ Qualquer evento intermediário (`cooperativa_station_selected`, `cooperativa_action_used`, etc.)

### O que conta como "run efetiva"
- ✅ `arcade_run_end` com `outcome: 'survival'` (não colapso)
- ✅ Ou qualquer run que atingiu ≥85% collectivity

### O que conta como "replay"
- ✅ `arcade_replay_click` registrado para `slug: cooperativa-na-pressao`
- ✅ Seguido por novo `arcade_run_start` (efetivo replay, não apenas clique)

### O que conta como "CTA pós-run"
- ✅ `campaign_cta_click_after_run` registrado após run Cooperativa completar

---

## Checkpoint Intermediário (3-4 dias)

**Data:** 12/03/2026 meio-dia

**Artefato:** `reports/decision/cooperativa-t50-midpoint.md`

**Deve responder:**
1. Houve qualquer run completa? (Sim/Não)
2. Qual é o status: vivo, crítico, ou morto?
3. Alguma ação corretiva leve é necessária?
4. A janela pode prosseguir sem ajustes?
5. Há sinais iniciais de qual direção (premium, tuning, arquivo)?

---

## Fechamento Final (7 dias)

**Data:** 16/03/2026 23:30

**Artefato:** `reports/YYYY-MM-DD-HHMM-t50-estado-da-nacao.md`

**Deve incluir:**
- Diagnóstico inicial (T49 baseline)
- Scorecard vivo da Cooperativa (7 dias consolidado)
- Checkpoint intermediário resumido
- Decisão explícita (premium / tuning / arquivo)
- Rationale da decisão baseado em dados
- O que fica para T51
- Impacto para campanha de Alexandre Fonseca

---

## Operação da Campanha Durante T50

### Vitrine de Cooperativa
- **Home:** Manter posição atual (3º arcade, após Tarifa em destaque)
- **Explorar:** Manter na lista de arcade live (sem promocão extra)
- **Quick → Arcade:** Não forçar para Cooperativa (depender de dados)

### Distribuição
- **Semana 1:** Manter nível leve (22 views → observar crescimento orgânico)
- **Mid-point:** Se há vida, avaliar pequeno boost de vitrine
- **Fechamento:** Sem mega-push, apenas leitura

### Copy/Messaging
- "Organiza a cooperativa sob pressão" - manter mensagem atual
- Não amplificar claims sobre premium/premium assets ainda
- Focar em "teste o novo jogo" e observar reação

---

## Guardrails T50

- ✅ Sem novo jogo aberto em paralelo
- ✅ Sem formato médio iniciado
- ✅ Sem auth/CMS/admin
- ✅ Sem premiumizar cedo demais (bloqueia até critério atingido)
- ✅ Sem remover Cooperativa do catálogo (manter viva, mesmo que fria)
- ✅ Sem quebrar quick line ou arcades Tarifa/Mutirão
- ✅ Sem inflar escopo com nova feature

---

## Próximos Passos (Implementação)

1. Melhorar `/estado` com bloco "Janela T50 - Cooperativa"
2. Melhorar `beta:circulation-report` com seção T50
3. Melhorar `beta:campaign-brief` com decisão T50 em progresso
4. Criar checkpoint intermediário em 3-4 dias
5. Permitir micro-ajustes se houver sinal real
6. Criar decisão final ao fim da janela
7. Atualizar documentação
8. Rodar gates e gerar relatório final

---

**Criado em:** 09/03/2026 23:30  
**Status versão:** Draft → Ready for Implementation
