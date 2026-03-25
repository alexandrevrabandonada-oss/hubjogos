# T75: Beta Exit Criteria — Mutirão de Saneamento

## Definition of Beta Ready

> O jogo é estável, legível, justo, e gera os resultados emocionais e políticos pretendidos. Não há bloqueios críticos. Pronto para teste público controlado.

---

## Checklist de Saída

### 1. UX & Legibilidade

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| No major UX confusion | 0 bloqueios reportados em 5+ playtests | ⬜ | Aguardando playtests |
| Prioridades claras | 80% dos jogadores entendem o que fazer nos primeiros 3 turnos | ⬜ | Medir via telemetry |
| Feedback de ações | Toda ação mostra consequência visível imediatamente | ✅ | Implementado: log + audio |
| Urgência percebida | 70% notam quando risco de saúde está alto | ⬜ | Survey pós-jogo |

### 2. Balanceamento & Mecânicas

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| No dominant strategy | ≥2 estratégias viáveis em dados | ⬜ | Analisar `actions_per_run` |
| Dificuldade justa | 40-60% vitórias (success+) em 20+ runs | ⬜ | Distribuição de resultados |
| Crise compreensível | Jogadores entendem por que dengue aconteceu | ⬜ | Feedback qualitativo |
| Trade-offs claros | Cada ação tem custo/benefício distinto | ✅ | Balance tuning aplicado |

### 3. Mobile & Performance

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| Touch confortável | 90% ações sem erro acidental | ⬜ | Teste em dispositivos reais |
| Touch targets adequados | ≥48x48px em todos botões | ✅ | CSS implementado |
| Performance aceitável | 60fps em Moto G / iPhone SE | ⬜ | Teste de performance |
| Orientação estável | Landscape desativado ou suportado | ✅ | CSS: `orientation: portrait` |
| Texto legível | Fonte ≥14px, contraste adequado | ✅ | CSS verificado |

### 4. Áudio & Imerção

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| Audio baseline present | 5 sons implementados | ✅ | UI click, confirm, alert, crisis, result |
| Mute toggle funcional | Botão de mute presente e funcional | ⬜ | Adicionar ao PlayShell |
| Sons contextuais | Crise tem som de alerta | ✅ | `playCrisisAlert()` implementado |

### 5. Arte & Visual

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| HUD hierarquia clara | Métricas principais destacadas | ✅ | Status bar com cores diferenciadas |
| Actor icons | 4 atores com identidade visual | ✅ | Emojis estilizados (placeholder OK) |
| Result screen impacto | Cada resultado tem visual distinto | ✅ | Cores por severidade |
| Territorial atmosphere | Background sugere Vila Esperança | ⬜ | Gradient earth colors aplicado |

### 6. Resultados & Narrativa

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| Resultados distintos | 5 estados claramente diferentes | ✅ | Triumph → Collapse spectrum |
| Emocionalmente legíveis | Players sentem diferença entre resultados | ⬜ | Survey pós-jogo |
| Politicamente significativos | Framing ideológico presente | ✅ | Political framing em cada resultado |
| Fair feedback | Jogadores entendem por que ganharam/perderam | ⬜ | Métricas mostradas claramente |

### 7. Telemetria & Dados

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| Sinais capturados | 11 métricas sendo trackeadas | ✅ | Telemetry implementado |
| Dados acessíveis | Export funcional para análise | ✅ | `exportTelemetryData()` disponível |
| Feedback loop | Form pós-jogo capturando qualidade | ✅ | `FeedbackForm` implementado |

### 8. Replay & Compartilhamento

| Critério | Threshold | Status | Evidência |
|----------|-----------|--------|-----------|
| Replay rate | ≥30% replay após primeiro run | ⬜ | Medir via `replayed` flag |
| Share rate | ≥10% tentam compartilhar | ⬜ | Medir via `shared` flag |
| Share pack quality | OG tags e mensagens adequadas | ✅ | Configurado no entry page |

---

## Métricas de Sucesso (Targets)

### Engagement
- **Time to first interaction:** < 10 segundos
- **Avg actions per run:** 8-15 ações
- **Avg session duration:** 3-7 minutos
- **Completion rate:** > 60%

### Balance
- **Result distribution:**
  - Triumph: 10-15%
  - Success: 20-30%
  - Neutral: 20-30%
  - Struggle: 15-25%
  - Collapse: 10-15%
- **Avg turns reached:** 9-12

### Satisfaction
- **Exit before completion:** < 30%
- **Replay rate:** > 30%
- **Share rate:** > 10%
- **Would recommend:** > 70%

---

## Riscos de Beta

| Risco | Mitigação | Status |
|-------|-----------|--------|
| Assets finais não prontos | Placeholders aceitáveis para beta | Monitorar |
| Som básico demais | Não bloqueia beta, melhorar pós-launch | Aceitável |
| Balanceamento precisa iteração | Telemetry habilita ajustes rápidos | Mitigado |
| Performance ruim em devices antigos | Testar e otimizar se necessário | Pendente |

---

## Decisão de Go/No-Go para Beta

### Go (Liberar Beta) quando:
- [ ] 5+ playtests completos sem bloqueios críticos
- [ ] Mobile testado em pelo menos 2 dispositivos reais
- [ ] Result distribution dentro dos targets
- [ ] ≥60% completion rate
- [ ] No dominant strategy identificado

### No-Go (Precisa de mais trabalho) se:
- [ ] UX confusion em > 30% dos playtests
- [ ] Mobile performance < 30fps
- [ ] Completion rate < 40%
- [ ] Apenas 1 estratégia viável
- [ ] Bugs críticos de gameplay

---

## Processo de Beta

1. **Internal Playtest** (1-2 dias)
   - Equipe interna joga e reporta
   - Telemetry analisado
   - Ajustes rápidos aplicados

2. **Friends & Family** (3-5 dias)
   - 10-20 pessoas próximas
   - Form de feedback obrigatório
   - Análise de dados

3. **Closed Beta** (1-2 semanas)
   - Lista de espera / convidados
   - 50-100 jogadores
   - A/B testing de balance

4. **Open Beta** (opcional)
   - Público geral
   - Analytics contínuo

---

*Beta Exit Criteria — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
