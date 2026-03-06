# Estado da Nacao - Tijolo 15

**Data:** 2026-03-06 21:30  
**Status:** Concluido

## Objetivo do Tijolo

Transformar a governanca operacional validada no Tijolo 14 em rotina continua e confiavel, com automacao recorrente, alertas leves, exportacao/auditoria e visibilidade operacional sem expandir escopo de produto.

## Diagnostico de Entrada

No inicio do ciclo, a base operacional funcionava, mas havia dependencias manuais:

- snapshots e exports exigiam execucao manual recorrente
- nao havia rotina automatizada periodica em workflow dedicado
- nao existia alerta operacional simples para:
  - feedback `prioritario` estagnado
  - ausencia de atividade de auditoria
- export de auditoria e visao de retencao ainda nao estavam materializados em artefatos proprios
- `/estado` e `beta:ops` tinham visibilidade parcial da saude operacional continua

## Entregas Implementadas

### 1. Automacao recorrente de operacao

**Arquivo:** `.github/workflows/ops-routine.yml`

- workflow novo com disparo por cron a cada 6 horas e `workflow_dispatch`
- executa sequencia operacional:
  - `npm run beta:snapshot`
  - `npm run beta:export`
  - `npm run ops:export-audit -- --days=7 --limit=100 --retention-days=90`
  - `npm run ops:check-alerts`
- publica artefatos de operacao (`snapshots`, `exports`, `ops-alerts`)
- usa variaveis/secrets de ambiente sem embutir credenciais no repositrio

### 2. Alertas operacionais leves (sem over-engineering)

**Arquivo:** `tools/ops-check-alerts.js`

- novo checker com foco em dois sinais reais:
  - `prioritario` parado acima de janela configuravel (`OPS_ALERT_PRIORITY_HOURS`, padrao 24h)
  - auditoria inativa acima de janela configuravel (`OPS_ALERT_AUDIT_MAX_AGE_HOURS`, padrao 48h)
- gera artefatos em `reports/ops-alerts/`:
  - snapshot timestampado (`ops-alerts-*.json` e `.md`)
  - ponteiros `latest.json` e `latest.md`
- suporta `--strict` / `OPS_ALERT_STRICT=true` para quebrar job quando houver alerta

### 3. Exportacao e retencao de auditoria

**Arquivo:** `tools/ops-export-audit.js`

- novo export dedicado para `ops_audit_log`
- gera JSON + Markdown em `reports/exports/`
- traz resumo por:
  - `action_type`
  - dia
- inclui estimativa de backlog acima da janela de retencao (`OPS_AUDIT_RETENTION_DAYS`, padrao 90)

### 4. Evolucao de scripts operacionais existentes

**Arquivos:**
- `tools/beta-snapshot.js`
- `tools/beta-export.js`
- `tools/beta-ops.js`

Melhorias:
- `beta-snapshot` agora registra `snapshot_generated` no `ops_audit_log` via RPC `log_ops_action`
- `beta-export` passou a incluir bloco `audit` com resumo e ultima acao
- `beta-ops` ganhou resumo operacional curto, status de snapshot auditado e leitura de alertas locais (`reports/ops-alerts/latest.json`)

### 5. Visibilidade operacional em `/estado`

**Arquivo:** `app/estado/page.tsx`

- bloco operacional leve adicionado com:
  - ultimo snapshot conhecido
  - estado de pendencias `prioritario`
  - status recente de auditoria
  - indicativo de automacao observada por fonte (`ops-cron` quando presente)
- mantida a filosofia de cockpit leve, sem virar painel administrativo enterprise

### 6. Runbook e documentacao operacional

**Arquivos:**
- `docs/runbook-operacional.md` (novo)
- `README.md` (revisado)
- `docs/tijolos.md` (revisado)
- `docs/roadmap.md` (revisado)
- `docs/GUIA-TIJOLO-14.md` (status ajustado)

Inclui:
- rotina diaria de operacao
- tratamento de alertas
- politica de export/retencao
- guia de seguranca para tokens/secrets

### 7. Higiene de seguranca

- sanitizacao de token exposto em relatorio antigo:
  - `reports/2026-03-06-2045-tijolo-14-validacao-final.md`
- reforco de uso de secrets/vars no workflow

## Evidencias de Execucao Real

Comandos executados no ciclo:

```bash
npm run beta:snapshot
npm run ops:check-alerts
npm run ops:export-audit -- --days=7 --limit=100 --retention-days=90
npm run beta:ops
npm run lint
npm run type-check
npm run test:unit
npm run build
node tools/verify.js
npm run test:e2e
```

Resultados observados:

- `ops:check-alerts`: `Prioritario parado: OK`, `Auditoria inativa: OK`, `Nivel geral: OK`
- `ops:export-audit`: export gerado com `totalRows: 2` e resumo por acao/dia
- `beta:ops`: exibiu resumo curto, ultima auditoria com `snapshot_generated`, fonte `ops-local`
- gate tecnico completo passou:
  - lint: ok
  - type-check: ok
  - unit: 15/15
  - build: ok
  - verify: 52/52
- validacao opcional e2e passou: 15/15

## Escopo Mantido (Conforme Restricoes)

Nao foi introduzido:

- nova engine de jogo
- auth obrigatoria para jogador
- admin panel enterprise

## Riscos Residuais

- job de automacao depende de secrets corretos no ambiente de CI
- alertas sao intencionalmente leves (sinalizam; nao substituem observabilidade full)
- retencao ainda depende de rotina operacional (nao ha purge automatizado no banco neste tijolo)

## O que foi entregue agora vs. o que fica para o Tijolo 16

### Entregue no Tijolo 15

1. Automacao real adicionada
- workflow cron + manual de operacao recorrente (`ops-routine.yml`)
- pipeline de snapshot/export/alerts com artefatos

2. Alertas reais adicionados
- stale `prioritario` e inatividade de auditoria com thresholds configuraveis
- saida em JSON/MD e modo estrito opcional

3. Export/retencao real adicionada
- export dedicado de audit log com consolidacao por tipo/dia
- estimativa de backlog acima da janela de retencao

### Fica para o Tijolo 16

4. Proximo nivel operacional (sem quebrar filosofia lean)
- acao de retencao automatizada (purge/controlada) no banco, com trilha de auditoria
- notificacao ativa de alertas (ex.: canal externo) sem inflar stack
- refinamento de SLO operacional e sinais de degradacao

## Conclusao

O Tijolo 15 cumpriu o objetivo de converter governanca operacional validada em rotina continua e confiavel, com automacao recorrente, alertas leves, exportacao auditavel e cockpit operacional mais util, mantendo escopo enxuto e sem regressao tecnica.
