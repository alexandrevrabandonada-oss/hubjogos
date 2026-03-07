# Hub de Jogos da Pre-Campanha

Produto politico-jogavel para transformar pauta publica em decisao, consequencia e acao.

Status atual: Tijolo 22 concluido - avatar oficial de Alexandre Fonseca, card final universal compartilhavel e pipeline de assets organizado para crescimento da campanha.

## Estado do Produto

- 4 engines reais publicas em `/play/[slug]`.
- Avatar oficial de Alexandre Fonseca como personagem principal recorrente.
- Card final universal compartilhavel em todos os jogos.
- Pipeline de assets de campanha organizado (`public/campaign/`, `docs/assets/`).
- Operacao de feedback em `/estado/feedback` com rota protegida opcional.
- Audit log remoto ativo em `ops_audit_log`.
- Fallback local preservado quando Supabase nao esta disponivel.

## Cockpit Temporal

- `/estado` com leitura por janela (`24h`, `7d`, `30d`, `all`).
- Severidade visual (`🟢/🟡/🔴`) com sinais acionaveis.
- Comparacao leve de tendencia (`24h vs 7d` ou `7d vs 30d`).
- Alertas de "ativo sem trafego" para experimentos/engine/CTA.

## Game Feel e Replay

- Intro curta nas engines com foco em primeira decisao rapida.
- Outcome com convite explicito para jogar de novo.
- Share page com CTA de reentrada para nova rodada.
- Assinatura de campanha reutilizavel e discreta em pontos de descoberta.

Documento guia: `docs/game-feel-e-diversao.md`

## Linha de Jogos da Campanha

- Documento mestre: `docs/linha-de-jogos-campanha.md`.
- Avatar oficial: `docs/avatar-oficial-alexandre-fonseca.md`.
- Pipeline de assets: `docs/assets/README.md`.
- Taxonomia oficial por tempo (`quick`, `session`, `deep`, `future-flagship`).
- Linhas editoriais e series para navegacao de campanha.
- Escala territorial planejada: Volta Redonda -> Sul Fluminense -> Baixada -> Capital -> Estado do RJ.

Componentes visuais de campanha:
- `CampaignAvatar`: avatar oficial reutilizavel de Alexandre Fonseca
- `FinalShareCard`: sistema universal de card final compartilhavel
- `CampaignMark`: assinatura de campanha discreta

Blueprints futuros (sem implementacao neste ciclo):
- `docs/formato-plataforma.md`
- `docs/formato-rpg.md`
- `docs/formato-tycoon.md`

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
npRPG/plataforma/tycoon completo implementado
- auth obrigatoria para jogar
- integracao Slack/email
- painel admin enterprise

Foco: avatar oficial, card final universal, pipeline de assets e crescimento visual organizado da campanha
Este ciclo nao adiciona:
- nova engine
- auth obrigatoria para jogar
- integracao Slack/email
- painel admin enterprise

Foco: cockpit temporal, rotina diaria e clareza operacional.
