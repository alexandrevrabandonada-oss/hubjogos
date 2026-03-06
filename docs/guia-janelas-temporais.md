# Guia: Quando Usar Cada Janela de Leitura

**Versão**: Tijolo 19
**Objetivo**: Decidir qual window (24h, 7d, 30d, all) usar para cada caso operacional

---

## Resumo Rápido

| Quando | Use | Por quê | Exemplo |
|--------|-----|---------|---------|
| **Agora** (monitoring) | **24h** | Detectar anomalia/bug rápido | Último event >4h? |
| **Hoje** (trending) | **7d** | Tendência semanal, decisão rápida | Qual experimento recomendo? |
| **Semana** (strategy) | **30d** | Amostra robusta, confiança estatística | Qual vencedor passar produção? |
| **Trimestre** (health) | **all** | Histórico, baseline, growth trajectory | Como foi a campanha inteira? |

---

## Guias por Cenário

### 1. Algo Parece Estranho (Monitoring 🔴)

**Situação**: Você acabou de entrar no `/estado` ou rodou `npm run beta:ops`

**Use**: **24h**

**Por quê**:
- Problemas recentes aparecem primeiro
- Staleness é óbvia: sem evento em 24h = problema
- Ações: verificar conectividade, checar logs, investigar

**O que procurar**:
```
✓ Última sessão: últimas 4 horas
✓ Último evento: últimas 2 horas
✓ Amostra: qualquer coisa > 0
✗ Amostra: < 5 é estranho em 24h
✗ Nenhum evento em 24h = CRÍTICO
```

**Ação típica**:
1. Abrir `/estado`, selecionar "Últimas 24 horas"
2. Olhar para "Último evento" ("agora", "1h atrás" ou "⚠️ 4h atrás"?)
3. Se > 2h: check conectividade `npm run beta:ops`
4. Se > 24h: refazer snapshot, check secrets, check workflow

---

### 2. Decidir em Iteração Rápida (Weekly Trends 📊)

**Situação**: Lançou novo experimento, mudou CTA, quer decisão rápida para sexta-feira

**Use**: **7d**

**Por quê**:
- Amostra grande o suficiente para tendência (não é fake)
- Cobre "última semana de trabalho" - contexto humano natural
- Scorecards válidos para decisão

**O que procurar**:
```
✓ Amostra por variante: >= 20 (pelo menos)
✓ Tendência emergindo (crescimento, novo padrão)
✓ Ranking de CTAs/engines estabilizando
✗ Amostra reduzida < 10: espere mais
✗ Flutuações aleatórias: normal em 7d
```

**Ação típica**:
1. Segunda: Rodei novo experimento
2. Quinta: `npm run beta:readiness-report -- --window=7d`
3. Verificar se tendência favorece viável ou A/B ainda indeciso
4. Sexta: Decisão de: expandir, pivotar, ou coletar mais 7 dias

---

### 3. Decisão Estratégica (Strategic 🎯)

**Situação**: Validar vencedor experimento, planejar roadmap, avaliar feature quanto durou

**Use**: **30d**

**Por quê**:
- Amostra suficiente para estatística robusta (30+ por variante em geral)
- Mês natural: alinhado com ciclos de sprint/OKR
- Muitas variações de dias da semana/timing

**O que procurar**:
```
✓ Amostra por variante: >= 40+ (confiança alta)
✓ Taxa de conclusão sem flutuações muito estranhas
✓ Sinais claros: vencedor tem lift 15%+
✗ Amostra border (20-40): menos confiável
✗ Conflito entre dias: pode indicar seasonality
```

**Ação típica**:
1. Fim de mês: `npm run beta:readiness-report -- --window=30d`
2. Validar scorecard de vencedor (confidence > candidate_winner)
3. Aprovar para produção, documentar em roadmap
4. Próximo mês: espiar para regressions em 24h/7d durante roll-out

---

### 4. Análise Histórica ou Verificação de Saúde Geral (Historical 📈)

**Situação**: Relatório trimestral, audit, migração de dados, "como foi nossa jornada?"

**Use**: **all**

**Por quê**:
- Histórico completo do experimento/feature
- Baseline absoluto
- Comparar fases (prototipo → iteração → produção)

**O que procurar**:
```
✓ Crescimento geral na jornada (mais sessões ao longo do tempo)
✓ Share rate crescendo (engajamento)
✓ Feedback ratio estável
✗ Picos estranhos: investigar (bug, campaign push?)
✗ Quedas drásticas: quando? investigar
```

**Ação típica**:
1. Trimestre: `npm run beta:export -- --window=all > relatorio-trimestre.json`
2. Analisar em BI/Google Sheets
3. Escrever retrospectiva
4. Usar como baseline para próximo trimestre

---

## Matriz: Qual Window para Cada Alerta?

| Alerta | Mais relevante em... | Menos relevante em... |
|--------|----------------------|------------------------|
| Staleness 24h | 24h | all |
| Amostra baixa | 24h, 7d | 30d (amostra não é problema) |
| Sem evento recente | 24h | 7d+ (normal em low-traffic) |
| Experimento vencedor | 30d | 24h (flutuação normal) |
| Shutdown/anomalia | 24h | 30d+ (já passou) |
| Baseline/growth | all | 24h (ruído) |

---

## Checklist: Como Interpretar Cada Window

### 24h Check
```
□ Supabase conectado?            → npm run beta:ops
□ Último evento < 2h?            → Bom sinal
□ Amostra sessões > 10?          → Normal para jogo ativo
□ Alert/warning?                 → Investigar antes de fechar dia
```

### 7d Decision
```
□ Amostra >= 20 por variante?    → Válido para decisão
□ Score de experimento?          → directional_signal+? OK
□ Feedback padrão?               → Convergindo ou flutuando?
□ Pronto para produção?          → Sim se candidate_winner+
```

### 30d Strategic
```
□ Amostra >= 40 (robust)?        → Estatisticamente confiável
□ Lift do vencedor > 15%?        → Significativo
□ Taxa de conclusão estável?     → Bom (sem quedas inexplicadas)
□ Histórico de feedback?         → Positivo dominante?
```

### all Baseline
```
□ Crescimento geral visível?     → Feature > prototipo?
□ Anomalias / picos?             → Documentadas/explicadas?
□ Share rate overall?            → Engajamento boa reputação?
□ Pronto para auditar?           → Relatório bem-formado
```

---

## Red Flags por Window

### 24h 🚨
- [ ] Nenhum evento em últimas 4h
- [ ] Amostra = 0
- [ ] Snapshots repetidamente falhando
- [ ] Staleness check = CRÍTICO

### 7d ⚠️
- [ ] Amostra < 5 por variante (muito pequeno)
- [ ] Feedback prioritario acumulando
- [ ] Tendência oposta ao esperado (plateau vs crescimento)
- [ ] Scorecard status = "insufficient_sample"

### 30d ⚠️
- [ ] Amostra < 20 em qualquer variante (border case)
- [ ] Quebra de tendência sem explicação clara
- [ ] Conflito entre dias (seg vs sábado muito diferente)

### all ⚠️
- [ ] Nenhuma mudança (plateaued sem razão)
- [ ] Quedas históricas sem recovery
- [ ] Feature não foi integrada no histórico esperado

---

## Quick Reference: Interpretação por Icon

Ao olhar `/estado` ou `npm run beta:ops`, look for:

```
✅ Verde = Tudo OK nesta janela
⚠️  Amarelo = Monitor, decidir em 24h
🚨 Vermelho = Ação necessária agora
⚪ Cinza = Indisponível (data not yet ou config issue)
```

---

## Integração com `/estado`

**No dropdown de janela, dica contextual**:

```
24h: Use para monitoring rápido (bug? Deploy OK?)
7d:  Use para decisão de iteração (qual varia vence?)
30d: Use para decisão estratégica (produção pronto?)
all: Use para análise histórica (tendência global)
```

**Com cada seção de data**:

```
Scorecards:
  [24h] Símbolo 🟢 = dados frescos
  [7d]  Símbolo 🟡 = amostra reduzida? Sim? Marcar
  [30d] Símbolo ✅ = pronto para produção
  [all] Símbolo 📊 = trending (mostra slope)
```

---

## Checklist de Decisão: Devo Confiar Nesse Dado?

Responda SIM a todos:

- [ ] Janela apropriada para meu caso (24h/7d/30d/all)?
- [ ] Amostra >= threshold (10/20/40 depende window)?
- [ ] Último evento < threshold de staleness (24h/72h)?
- [ ] Sem alerta crítico levantado?
- [ ] Resultado alinha com expectativa (ou discrepância explicada)?

Se não: **use a próxima janela maior** (24h → 7d → 30d → all)

---

**Última atualização**: Tijolo 19
**Próximo**: Integrar essa matriz no `/estado` como helper dropdown
