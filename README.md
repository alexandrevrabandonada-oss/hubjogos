# Hub de Jogos da Pre-Campanha

Produto politico-jogavel para transformar pauta publica em decisao, consequencia e acao.

Status atual: Tijolo 20 concluido - cockpit temporal operacional, comparacao leve de janelas, beta:ops consolidado e playbook de incidentes.

## Estado do Produto

- 4 engines reais publicas em `/play/[slug]`.
- Operacao de feedback em `/estado/feedback` com rota protegida opcional.
- Audit log remoto ativo em `ops_audit_log`.
- Fallback local preservado quando Supabase nao esta disponivel.

## Cockpit Temporal

- `/estado` com leitura por janela (`24h`, `7d`, `30d`, `all`).
- Severidade visual (`🟢/🟡/🔴`) com sinais acionaveis.
- Comparacao leve de tendencia (`24h vs 7d` ou `7d vs 30d`).
- Alertas de "ativo sem trafego" para experimentos/engine/CTA.

## Operacao Continua

Scripts principais:

```bash
npm run beta:ops
npm run beta:staleness-check
npm run beta:snapshot
npm run beta:export
npm run beta:circulation-report
npm run ops:check-alerts
npm run ops:export-audit
```

Automacao (cron):
- Workflow: `.github/workflows/ops-routine.yml`
- Frequencia: a cada 6 horas
- Artefatos:
  - `reports/snapshots/`
  - `reports/exports/`
  - `reports/ops-alerts/`
  - `reports/ops/`

## Playbooks e Runbooks

- `docs/runbook-operacional.md`
- `docs/playbook-incidentes.md`
- `docs/alertas-severidade.md`
- `docs/guia-janelas-temporais.md`

## Gate Tecnico

```bash
npm run lint
npm run type-check
npm run test:unit
npm run build
npm run verify
```

Opcional quando estavel:

```bash
npm run test:e2e
```

## Limites de Escopo

Este ciclo nao adiciona:
- nova engine
- auth obrigatoria para jogar
- integracao Slack/email
- painel admin enterprise

Foco: cockpit temporal, rotina diaria e clareza operacional.
