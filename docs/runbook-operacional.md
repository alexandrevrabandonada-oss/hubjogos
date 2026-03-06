# Runbook Operacional do Beta

## Objetivo

Manter o Hub operando com rotina temporal clara, leve e acionavel.

## 1. Rotina automatizada (GitHub Actions)

Workflow: `.github/workflows/ops-routine.yml`

Frequencia:
- Cron: a cada 6 horas (`0 */6 * * *`)
- Execucao manual: `workflow_dispatch`

Pipeline base:
1. `npm run beta:snapshot`
2. `npm run beta:snapshot -- --format=json`
3. `npm run beta:export`
4. `npm run ops:export-audit -- --days=7 --limit=300 --retention-days=90`
5. `npm run ops:check-alerts -- --priority-hours=24 --audit-hours=48`
6. `npm run beta:staleness-check` (artefato em `reports/ops/`)

Artefatos:
- `reports/snapshots/`
- `reports/exports/`
- `reports/ops-alerts/`
- `reports/ops/`

## 2. Leitura diaria (cockpit temporal)

Ponto de entrada:
- `/estado` para leitura visual por janela
- `npm run beta:ops` para check textual consolidado

Checklist rapido (menos de 3 minutos):
1. Abrir `/estado` e selecionar janela adequada:
  - `24h`: monitoramento rapido
  - `7d`: tendencia semanal
  - `30d`: decisao com mais estabilidade
  - `all`: historico
2. Ler badge de severidade do cockpit (`🟢/🟡/🔴`).
3. Conferir sinais-chave:
  - ultimo evento remoto visto
  - amostra da janela
  - experimentos ativos sem trafego
  - pendencias prioritarias
4. Rodar `npm run beta:ops` e confirmar o mesmo panorama no terminal.

## 3. Interpretacao de severidade

Referencia oficial: `docs/alertas-severidade.md`

Regra operacional:
- `🟢 INFO`: seguir rotina.
- `🟡 WARNING`: atuar no mesmo dia util e reavaliar no proximo ciclo.
- `🔴 CRITICO`: agir em 1-2h e confirmar recuperacao.

## 4. Incidentes e resposta

Playbook dedicado: `docs/playbook-incidentes.md`

Coberturas principais:
- staleness > 72h
- `/estado` sem evento recente
- experimento ativo sem trafego
- feedback prioritario parado
- divergencia 24h vs 7d
- CTA com exposicao sem clique relevante

## 5. Script diario beta:ops

Comando:
```bash
npm run beta:ops
```

O que deve aparecer no topo:
- status geral consolidado (`🟢/🟡/🔴`)
- ultimo staleness check (quando arquivo existir)
- idade do ultimo snapshot
- ultimo evento remoto visto
- total de prioritarios

Comportamento de degradacao:
- Se `reports/ops/staleness-check-latest.json` nao existir, o script nao falha: informa indisponibilidade e orienta geracao.

## 6. Segredos e seguranca

Nunca registrar valores de segredo em logs/relatorios.

Segredos/variaveis:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPS_ADMIN_TOKEN`
- `OPS_ALERT_PRIORITY_HOURS`
- `OPS_ALERT_AUDIT_MAX_AGE_HOURS`
- `OPS_AUDIT_EXPORT_DAYS`
- `OPS_AUDIT_RETENTION_DAYS`

## 7. Comandos de referencia

```bash
npm run beta:ops
npm run beta:staleness-check
npm run beta:snapshot
npm run beta:export
npm run ops:check-alerts
npm run ops:export-audit
npm run verify
```

## 8. Limites de escopo

Este ciclo nao adiciona:
- nova engine
- auth obrigatoria
- integracao Slack/email
- painel admin enterprise

Foco: cockpit temporal, rotina diaria e clareza operacional.
