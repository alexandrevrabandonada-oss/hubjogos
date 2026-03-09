# Tijolo 50 - Estado da Nação (Foundation)

**Data:** 09/03/2026, 23:45  
**Ciclo:** T50 - Ativação e Observação da Cooperativa (7 dias)  
**Status:** ✅ Foundation completada, observação iniciada  
**Período:** 09/03/2026 23:30 - 16/03/2026 23:30 (7 dias)

---

## Executive Summary

T50 é uma **janela de ativação e observação honesta** de 7 dias para `cooperativa-na-pressao`. Nesta execução, foi criada toda a **infraestrutura operacional** para:
1. Medir sinais reais de vida (runs, replay, CTA, coletividade, mutirão)
2. Acompanhar progresso via checkpoint intermediário
3. Tomar decisão final baseada em dados

**Três caminhos possíveis de saída:**
- ✅ `promote_to_premium_pass` (≥30 runs, >40% survival, >60% collectivity)
- 🔧 `run_short_tuning_cycle` (5-25 runs, gargalos claros)
- 🗃️ `archive_to_cold_backlog` (0-4 runs, nenhum sinal)

---

## Leitura Real da Cooperativa (Baseline T49)

### Estado inicial
- Runs observadas: **0**
- Runs efetivas: **0**
- Survival rate: **0%**
- Collectivity rate: **0%**
- Mutirão usage: **0%**
- Replay rate: **0%**
- CTA pós-run: **0%**
- Card views: **22** (vs Tarifa Zero 121, Mutirão 47)
- Arcade starts totais: **25**
- Conclusões: **0**

**Interpretação:** Tem clique inicial (25 starts), mas nenhuma conclusão. Sinal crucial de investigação: por que o jogo não é completado?

---

## Infraestrutura T50 Criada

### 1. Janela Operacional Formalizada
**Arquivo:** [`reports/decision/t50-janela-operacional.md`](reports/decision/t50-janela-operacional.md)

Define:
- Período: 09/03 23:30 - 16/03 23:30
- Checkpoint mid-point: 12/03 meio-dia
- **Critérios de vida** (mínimos observáveis):
  - ≥1 run completa, OU
  - ≥1 replay espontâneo, OU
  - ≥1 CTA pós-run ativado, OU
  - ≥1 mutirão usado
- **Canais de saída:**
  - Premium pass: ≥30 runs, >40% survival, >60% collectivity
  - Tuning curto: 5-25 runs, 20-40% survival, gargalos óbvios
  - Arquivo: 0-4 runs, zero sinais

### 2. Bloco No Dashboard `/estado`
**Localização:** `app/estado/page.tsx` nova Card "Janela T50 - Cooperativa em Observação"

Mostra:
- Status atual ("Ativo")
- Dias restantes (dinâmico)
- Sinais mínimos de vida (status: NENHUM, EM COLETA, OU VIVO)
- Runs observadas / meta (dinâmico)
- Survival rate / meta
- Collectivity rate / meta premium
- Mutirão ativado / meta
- Replay espontâneo / meta
- **Recomendação operacional** curta e acionável

### 3. Checkpoint Intermediário Template
**Arquivo:** [`reports/decision/cooperativa-t50-midpoint.md`](reports/decision/cooperativa-t50-midpoint.md)

Será preenchido em **12/03 meio-dia** com:
- Há sinais mínimos de vida? (Sim/Não)
- Qual é o status? (🟢 VIVO, 🟡 CRÍTICO, 🔴 MORTO)
- Alguma ação corretiva leve é necessária?
- A janela pode prosseguir sem ajustes?
- Há sinais iniciais de qual direção? (premium / tuning / arquivo)

### 4. Decisão Final Template
**Arquivo:** [`reports/decision/cooperativa-t50-final.md`](reports/decision/cooperativa-t50-final.md)

Será preenchido em **16/03 23:30** com:
- Scorecard consolidado T50 (7 dias completos)
- Decisão oficial: `promote_to_premium_pass` | `run_short_tuning_cycle` | `archive_to_cold_backlog`
- Rationale baseado em dados
- Impacto para campanha de Alexandre Fonseca
- O que fica para T51

### 5. Documentação Atualizada
- ✅ `docs/roadmap.md` - Seção T50 adicionada
- ✅ `docs/tijolos.md` - T50 em progresso marcado
- ✅ `docs/linha-arcade-da-campanha.md` - Três caminhos de saída documentados

---

## Operação da Campanha Durante T50

### Vitrine de Cooperativa
- **Home:** Manter posição atual (3º arcade, após Tarifa em destaque)
- **Explorar:** Manter na lista de arcade live (sem promocão extra)
- **Quick → Arcade:** Não forçar para Cooperativa (depender de dados)

### Distribuição
- Semana 1: Manter nível leve (22 views → observar crescimento orgânico)
- Mid-point (12/03): Se há vida, avaliar pequeno boost de vitrine
- Fechamento (16/03): Sem mega-push, apenas leitura + decisão

### Copy/Messaging
- "Organiza a cooperativa sob pressão" - manter mensagem atual
- Não amplificar claims sobre premium assets ainda
- Focar em "teste o novo arcade" e observar reação

---

## Gate Técnico T50

| Gate | Resultado | Status |
|------|-----------|--------|
| `npm run lint` | ✅ 0 warnings/errors | PASS |
| `npm run type-check` | ✅ sem erros TypeScript | PASS |
| `npm run test:unit` | ✅ 52/52 testes | PASS |
| `npm run build` | ✅ Next.js 14 compilação sucesso | PASS |
| `npm run verify` | ✅ 52/52 checks críticos | PASS |

**Conclusão:** Infraestrutura T50 validada, sem regressões.

---

## Guardrails Mantidos ✅

- ✅ Sem novo jogo aberto em paralelo
- ✅ Sem formato médio iniciado
- ✅ Sem auth/CMS/admin
- ✅ Sem premiumizar cedo demais (bloqueia até critério atingido)
- ✅ Sem remover Cooperativa do catálogo (manter viva, mesmo que fria)
- ✅ Sem quebrar quick line ou arcades Tarifa/Mutirão
- ✅ Sem inflar escopo com nova feature grande
- ✅ Manter honestidade: decisão final baseada em dados reais

---

## Zero Regressões

- ✅ Quick line operacional (Tarifa Zero, Mutirão, Passe Livre)
- ✅ Experimento QR em progresso
- ✅ Pipeline de assets auditado
- ✅ Gatekeeping técnico verde (lint, type-check, build, verify)

---

## O Que Fica Para Próximas Fases

### 12/03 Meio-dia (Checkpoint)
- [ ] Executar checkpoint intermediário
- [ ] Responder: há sinais de vida?
- [ ] Autorizar ajustes leves se necessário
- [ ] Recomendação: prosseguir, ajustar, ou arquivar já?

### 16/03 23:30 (Decisão Final)
- [ ] Consolidar scorecard T50 (7 dias)
- [ ] Escolher: `promote_to_premium_pass` | `run_short_tuning_cycle` | `archive_to_cold_backlog`
- [ ] Gerar relatório final T50 com rationale
- [ ] Comunicar decisão para campanha de Alexandre Fonseca
- [ ] Iniciar T51 com novo roadmap baseado em T50 outcome

### Próximos Passos (T51)
**Se `promote_to_premium_pass`:**
- Liberar assets premium (SVG, audio, polish final)
- Aumentar distribuição e vitrine
- Prosseguir para premium phase

**Se `run_short_tuning_cycle`:**
- T51 será re-observação de tuning
- Mesmo jogo, 2-3 parâmetros ajustados
- Novo checkpoint em 3-4 dias

**Se `archive_to_cold_backlog`:**
- Abrir `bairro-resiste` para implementação (T51)
- Cooperativa em catálogo mas sem vitrine primária
- Preservar código para potencial retorno futuro (T52+)

---

## Impacto Para a Campanha

### Status da Linha Arcade (após T50 decision)
- **Tarifa Zero RJ:** Continua como arcade líder (confirmado T37-T40)
- **Mutirão do Bairro:** Continua em validação forte (T38 fairness correction em andamento)
- **Cooperativa na Pressão:** `[TBD - será decidido em 16/03]` (premium / tuning / arquivo)
- **Próximo arcade:** `[dependerá de T50 outcome]`

### Prioridades de Distribuição (T51+)
Serão definidas baseadas na decisão final de T50.

---

## Relatório Final T50

Será criado em **16/03/2026 23:30** em:
```
reports/YYYY-MM-DD-HHMM-t50-estado-da-nacao.md
```

Consolidará:
1. Diagnóstico inicial (T49 baseline)
2. Scorecard vivo da Cooperativa (7 dias completos)
3. Checkpoint intermediário resumido
4. Melhorias em `/estado`, reports, brief
5. Ajustes feitos ou adiados
6. Resultado de gates técnicos
7. **Decisão final oficial com rationale**
8. Impacto para campanha de Alexandre
9. O que fica para T51

---

## Sumário

### Estabelecido
✅ Janela operacional T50 com período claro, critérios, canais de saída  
✅ Bloco em `/estado` com status dinamicamente atualizado  
✅ Checkpoint intermediário para mid-point (12/03)  
✅ Decisão final template com três caminhos  
✅ Documentação centralizada e atualizada  
✅ Gates técnicos todos verdes  

### Em Observação (09/03 - 16/03)
⏳ Sinais mínimos de vida (runs, replay, CTA, coletividade, mutirão)  
⏳ Padrão de colapsos e ações dominantes  
⏳ Comparação com Tarifa Zero e Mutirão  
⏳ Feedback de campanha (distribuição, copy reaction)  

### A Ser Decidido (16/03 23:30)
❓ Premium pass: `promote_to_premium_pass` | `run_short_tuning_cycle` | `archive_to_cold_backlog`  
❓ Impacto para T51 roadmap  
❓ Próximo candidato arcade (bairro-resiste ou outro)  

---

**Criado em:** 09/03/2026 23:45  
**Status:** ✅ Infraestrutura T50 Completa, Observação Ativa  
**Próxima atualização:** 12/03/2026 meio-dia (checkpoint mid-point)  
**Fechamento esperado:** 16/03/2026 23:30 (decisão final)

---

## Notas Finais

T50 é definido pelo **princípio de honestidade**: não queremos premiumizar por ansiedade ou manter um jogo "vivo" sem sinais reais. Se a Cooperativa não gerou uma única conclusão real em 7 dias com distribuição orgânica, a resposta correta pode ser **arquivar** e abrir espaço para `bairro-resiste` em T51.

Alternativamente, se os sinais iniciais forem promissores mas com gargalos claros, **tuning curto** pode ser a resposta certa antes de premium pass.

E se houver massa crítica de runs, collectivity e replay, **premium pass** é o caminho natural.

**Decisão final em 16/03. Sem antecipação. Baseada em dados.**
