# Tijolos - Protocolo de Execucao

## Objetivo

Padronizar entregas incrementais com estabilidade tecnica, clareza operacional e impacto real de produto.

Cada tijolo fecha com:
- software executavel
- documentacao atualizada
- validacao tecnica completa
- relatorio de Estado da Nacao

## Gate obrigatorio

```bash
npm run lint
npm run type-check
npm run build
npm run verify
```

## Gate recomendado

```bash
npm run test:unit
npm run test:e2e
```

## Criterio de pronto

- [ ] objetivo entregue com impacto real
- [ ] gate tecnico passou
- [ ] docs atualizadas (`README`, `roadmap`, `tijolos`, `runbook`)
- [ ] relatorio em `reports/YYYY-MM-DD-HHMM-tijolo-XX-estado-da-nacao.md`
- [ ] sem regressao nas engines reais

## Estado atual do protocolo

- Tijolo 06 ✅ diversidade de mecanicas (4 engines + onboarding + OG textual)
- Tijolo 07 ✅ blindagem tecnica (testes + OG image + lazy loading)
- Tijolo 08 ✅ consolidacao operacional (export share card + CI/CD + metricas)
- Tijolo 09 ✅ confiabilidade de producao (E2E no CI + Sentry + A11y + OG cache)
- Tijolo 10 ✅ distribuicao e engajamento (source tracking + beta banner + funil)
- Tijolo 11 ✅ beta como sistema de aprendizado (experimentos + coortes + feedback)
- Tijolo 12 ✅ consolidacao remota de aprendizado (views + snapshot/export remoto)
- Tijolo 13 ✅ operacao interna leve (triagem prioritaria + beta:ops + cockpit /estado)
- Tijolo 14 ✅ governanca operacional minima e auditabilidade (rota protegida + audit log)
- Tijolo 15 ✅ automacao operacional continua (cron + alertas leves + export audit)
- Tijolo 16 ✅ hardening operacional base
- Tijolo 17 ✅ leitura disciplinada (scorecards, thresholds, circulation)
- Tijolo 18 ✅ leitura de producao (janelas, staleness, ambiente)
- Tijolo 19 ✅ rotina temporal continua (staleness no cron + guias + runbook)
- Tijolo 20 ✅ cockpit temporal e clareza operacional (estado + beta:ops + playbook)

## Tijolo 20 - Cockpit Temporal ✅

### Objetivo

Transformar a base temporal em rotina diaria acionavel para operacao humana.

### Entregues

- `/estado` com semaforizacao de severidade por sinais operacionais.
- Indicacao explicita de janela, amostra e ultimo evento remoto.
- Comparacao leve entre janelas (`24h vs 7d` ou `7d vs 30d`).
- Sinalizacao de experimento ativo sem trafego, engine com baixa atividade e CTA com exposicao sem clique relevante.
- `beta:ops` com resumo curto consolidado, staleness local, idade de snapshot e ultimo evento remoto.
- `docs/playbook-incidentes.md` com resposta pratica por sintoma.

### Nao inclui

- nova engine
- auth obrigatoria
- integracao Slack/email
- painel admin enterprise

## Proximo

- Tijolo 21: refinamento de confiabilidade temporal (teste automatizado de sinais do cockpit + ajustes de threshold por contexto de trafego).
