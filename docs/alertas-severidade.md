# Alertas - Severidade e Regras Operacionais

**Versão**: Tijolo 19
**Status**: Definição formal

---

## Princípios Gerais

1. **Transparência**: Todo alerta tem motivo explícito, threshold documentado, ação clara
2. **Proporcionalidade**: Severidade deve corresponder a impacto real
3. **Ignorância justificada**: Alguns alertas podem ser naturalmente ignorados em contextos específicos
4. **Rastreabilidade**: Todas as decisões passam por `ops_audit_log`

---

## Níveis de Severidade

### 🟢 INFO
- **Significado**: Observação útil, sem ação necessária
- **Ação**: Informar, documentar, ignorar se apropriado
- **Failover**: Não, nunca falha workflow

**Exemplos**:
- "Snapshot rodou com sucesso"
- "Feedback positivo detectado"
- "Experimento novo começou receber tráfego"

---

### 🟡 WARNING
- **Significado**: Situação incomum, monitore, aja se padrão persistir
- **Ação**: Revisar no próximo check (6h), documentar, agir se necessário até 24h
- **Failover**: Não por default, `OPS_ALERT_STRICT=true` para falhar (opcional)

**Exemplos**:
- `prioritario_parado`: Feedback marcado como prioritario há >24h sem triagem
- `auditoria_inativa`: Última ação no audit log de >48h atrás
- `amostra_baixa`: Experimento rodando mas <40 sessões na janela
- `staleness_24h`: Nenhum evento registrado nos últimos 24h
- `feedback_backlog`: >10 items pendentes de triagem

---

### 🔴 CRITICAL
- **Significado**: Situação anormal que requer ação imediata
- **Ação**: Investigar dentro de 1-2h, tomar ação correctiva
- **Failover**: SIM, sempre falha workflow (força re-run manual)

**Exemplos**:
- `staleness_72h`: Nenhum evento registrado nos últimos 72h (Tijolo 18 threshold)
- `supabase_offline`: Conectividade Supabase falhou (não é config, é runtime)
- `snapshot_repeated_failure`: Script de snapshot falhou 2x seguidas
- `audit_log_anomaly`: Número de ações 10x acima da média

---

## Regras de Severidade por Categoria

### A. Staleness (Tecnico)

**Baseado em**: Wijole operacional do Tijolo 18

| Métrica | Threshold | Severidade | Ação |
|---------|-----------|-----------|------|
| `lastEventAt` (remoto) | < 1h | INFO | Operação normal |
| `lastEventAt` (remoto) | 1h - 24h | 🟡 WARNING | Monitor 24h, sem ação |
| `lastEventAt` (remoto) | 24h - 72h | 🟡 WARNING | Check manual, pode ser spike low |
| `lastEventAt` (remoto) | > 72h | 🔴 CRITICAL | Investigar: Supabase? BUG? Campaign pause? |
| `sessionAt` total | Nunca (0 events ever) | 🔴 CRITICAL | Bootstrap issue ou BUG |

**Ignorabilidade**: 
- ✅ Ignorar WARNING em staging/dev
- ✅ Ignorar CRÍTICAS se campanha foi pausada (documentar em GitHub)
- ❌ Nunca ignorar CRÍTICA em produção sem investigation

---

### B. Amostra (Estatístico)

**Baseado em**: Thresholds do Tijolo 17

| Métrica | Threshold | Severidade | Ação |
|---------|-----------|-----------|------|
| Sessions por variante | >= 40 | 🟢 INFO | Amostra suficiente |
| Sessions por variante | 20-39 | 🟡 WARNING | Amostra reduzida, leia com cuidado |
| Sessions por variante | 10-19 | 🟡 WARNING | Amostra pequena, resultados tentativos |
| Sessions por variante | < 10 | 🟡 WARNING | Muito pequeno, não use para decisões |
| Placement CTRs | >= 25 clicks | 🟢 INFO | Estatisticamente confiável |
| Placement CTRs | 10-24 clicks | 🟡 WARNING | Pequeno, observe tendência |
| Placement CTRs | < 10 clicks | 🟡 WARNING | Muito pequeno, alto erro amostral |

**Ignorabilidade**:
- ✅ Ignorar WARNING em low-traffic engines (simulator, tutorial)
- ✅ Ignorar WARNING se propositalmente testando variante (wait for sampling)
- ❌ Nunca usar variante com <10 samples para decisão em produção

---

### C. Audit Log e Operações

**Baseado em**: Governança do Tijolo 14

| Métrica | Threshold | Severidade | Ação |
|---------|-----------|-----------|------|
| Última ação audit log | < 6h | 🟢 INFO | Operação ativa |
| Última ação audit log | 6h - 24h | 🟡 WARNING | Sem ações recentes, check manual |
| Última ação audit log | 24h - 48h | 🟡 WARNING | Inatividade, but expected se workflow OK |
| Última ação audit log | > 48h | 🟡 WARNING | Inatividade anormal, check cron logs |

**Ignorabilidade**:
- ✅ Ignorar se último snapshot foi <6h (significa workflow OK)
- ✅ Ignorar em fin-de-semana ou off-hours planejados
- ❌ Nunca ignorar em business hours se campaign ativa

---

### D. Triagem de Feedback

**Baseado em**: Triagem do Tijolo 13

| Métrica | Threshold | Severidade | Ação |
|---------|-----------|-----------|------|
| Feedback `pending` | 0-2 itens | 🟢 INFO | Tudo em dia |
| Feedback `pending` | 3-10 itens | 🟡 WARNING | Backlog leve, triage esta semana |
| Feedback `pending` | > 10 itens | 🟡 WARNING | Backlog crescendo, priorize |
| Feedback `prioritario` | 0 itens | 🟢 INFO | Nenhum crítico |
| Feedback `prioritario` | 1-2 itens | 🟡 WARNING | Crítico pendente, triage hoje |
| Feedback `prioritario` > 24h | Sim | 🟡 WARNING | Crítico neglectado, AÇÃO |
| Feedback `prioritario` > 48h | Sim | 🔴 CRITICAL | Crítico não triado há dias |

**Ignorabilidade**:
- ✅ Ignorar if team está em sprint/blackout window planejado
- ❌ Nunca ignorar feedback prioritario >24h

---

### E. Experimentos do Registry

**Baseado em**: Config do Tijolo 11

| Métrica | Threshold | Severidade | Ação |
|---------|-----------|-----------|------|
| Experimento ativo com tráfego | Sessions > 0 | 🟢 INFO | Tudo bem |
| Experimento ativo sem tráfego | Sessions = 0 | 🟡 WARNING | Ativo mas invisível, check config |
| Experimento ativo SEM CODE | Disabled in registry | 🟡 WARNING | Disabled, verify is intentional |
| Override discrepancy | Env != registry | 🟡 WARNING | Override ativo, document rationale |

**Ignorabilidade**:
- ✅ Ignorar se experimento foi desligado hoje (expected lag)
- ✅ Ignorar override se em plano de rollout/emergency
- ❌ Nunca deixar override sem documentação

---

## Decision Tree: Que Ação Tomar?

```
1. Alerta é 🔴 CRITICAL?
   SIM → Investigar em até 1h, tomar ação
   NÃO → Continua

2. Alerta é 🟡 WARNING?
   NÃO → Documentar (INFO), fim
   SIM → Continua

3. Warning já visto antes?
   SIM → Se <24h desde último: ignore, monitor
   NÃO → Continua

4. É fim-de-semana ou blackout?
   SIM → Flag para segunda-feira, fim
   NÃO → Continua

5. Warning corresponde a algo planejado?
   (Baixa amostra por novo experimento, feedback não triado por sprint)
   SIM → Documentar no GitHub, marcação
   NÃO → Atuar em 24h

6. Warning falso (legítimo para contexto)?
   Exemplos: staleness 24h em low-traffic simulator, amostra baixa em test engine
   SIM → Documentar contexto, prosseguir
   NÃO → Registrar em `ops_audit_log` como action, OK
```

---

## Output de Alertas nos Scripts

### `beta:staleness-check` (Novo - Tijolo 19)

```json
{
  "checkedAt": "2026-03-06T19:50:00Z",
  "stalenessThreshold": "72h",
  "lastSessionAt": "2026-03-06T15:00:00Z",
  "lastEventAt": "2026-03-06T15:05:00Z",
  "hasStaleData": false,
  "alerts": [
    {
      "severity": "warning",
      "category": "traffic",
      "message": "Última sessão há 4h atrás"
    }
  ],
  "summary": {
    "critical": 0,
    "warnings": 1,
    "healthy": false
  }
}
```

- Exit code 0 = Tudo OK ou só WARNINGS
- Exit code 1 = CRITICAL alertas (forçará re-run ou investigação manual)

### `ops:check-alerts` (Existente - Tijolo 15)

```json
{
  "overallLevel": "warning",
  "priorityAlert": {
    "triggered": true,
    "staleCount": 2,
    "explanation": "2 items prioritario sem triagem >24h"
  },
  "auditAlert": {
    "triggered": false,
    "explanation": "Última auditoria <48h atrás"
  }
}
```

---

## Configuração no CI/CD

### Workflow: ops-routine.yml

```yaml
# Default: warnings não falham o job
jobs:
  routine:
    continue-on-error: true

# Optional: modo estrito
jobs:
  routine:
    if: github.event_name == 'workflow_dispatch'
    env:
      OPS_ALERT_STRICT: 'true'
    # Agora: CRITICAL falha o job
```

---

## Validação de Severidade

Sempre que adicionar novo alerta, documentar:

1. **Por que está alerta?** (problema real, não ruído)
2. **Qual é o threshold?** (número específico ou lógica)
3. **Qual severidade?** (🟢/🟡/🔴 + justificativa)
4. **Quando ignorar?** (contextos onde não é problema)
5. **Ação recomendada** (específica, verificável)

---

## Sinais Operacionais do Cockpit (Tijolo 20)

Regras simples e explicaveis usadas no `/estado` e no `beta:ops`:

- `experimento_ativo_sem_trafego`:
  - Condicao: experimento ativo no registry com sessoes `= 0` na leitura.
  - Severidade: `🟡 WARNING`.
  - Acao: validar override, superficie ativa e instrumentacao.

- `engine_baixa_atividade`:
  - Condicao: engine com sessoes baixas na janela operacional.
  - Severidade: `🟡 WARNING`.
  - Acao: comparar `24h vs 7d` antes de concluir regressao.

- `cta_exposicao_sem_clique`:
  - Condicao: placement com exposicao relevante e clique irrelevante/zero.
  - Severidade: `🟡 WARNING`.
  - Acao: revisar copy/ordem de CTA e validar em 7d.

- `amostra_baixa`:
  - Condicao: volume insuficiente para leitura forte de janela/comparacao.
  - Severidade: `🟡 WARNING` (ou `🔴` se virtualmente nula para operacao).
  - Acao: monitorar tendencia; evitar decisao estrutural.

## Próximas Evoluções

- Tijolo 21: reduzir ruido de warning recorrente sem perder rastreabilidade.
- Tijolo 21: calibrar thresholds por contexto de trafego mantendo explicabilidade.
- Tijolo 21: expandir cobertura de teste para sinais operacionais.

---

**Última atualização**: 2026-03-06 (Tijolo 20)
