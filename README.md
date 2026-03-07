# Hub de Jogos da Pre-Campanha

Produto politico-jogavel para transformar pauta publica em decisao, consequencia e acao.

Status atual: Tijolo 28 concluido - operacao pratica de distribuicao por canal/territorio, links rastreaveis, pacotes prontos, brief semanal, cockpit acionavel em `/estado`.

## Estado do Produto

- 4 engines reais publicas em `/play/[slug]`.
- Avatar oficial da campanha como personagem recorrente.
- Card final universal compartilhavel em todos os jogos.
- Card final com QR code dinamico para reentrada.
- Pipeline de assets de campanha organizado (`public/campaign/`, `docs/assets/`).
- Minigames quick ativos: `custo-de-viver`, `quem-paga-a-conta` e `cidade-em-comum` (1-2 min, rejogaveis, compartilhaveis).
- Experimento ativo `final-card-qr-code` com variantes `with-qr` e `without-qr`.
- Operacao de feedback em `/estado/feedback` com rota protegida opcional.
- Audit log remoto ativo em `ops_audit_log`.
- Fallback local preservado quando Supabase nao esta disponivel.

## Operacao de Distribuicao (Tijolo 28)

Sistema completo de distribuicao de campanha:

- **Links rastreaveis** com UTMs por canal/territorio/serie (lib/campaign-links/)
- **Pacotes por canal** prontos para Instagram, WhatsApp, TikTok (reports/distribution/packages/)
- **Pacotes por territorio** com metas e prioridades (estado-rj, volta-redonda)
- **Brief semanal** acionavel (`npm run campaign:brief`)
- **Cockpit operacional** em `/estado` com "O que distribuir agora"
- **Roteiro semanal** documentado em `docs/operacao-semanal-distribuicao.md`

Scripts de campanha:

```bash
npm run campaign:links          # Gerar links de campanha rastreáveis
npm run campaign:brief          # Gerar brief semanal de distribuição
```

Documentos:
- `docs/distribuicao-links.md` - Sistema de links
- `docs/operacao-semanal-distribuicao.md` - Roteiro de 14 dias
- `docs/plano-distribuicao-quick.md` - Plano mestre

## Cockpit Temporal e Status de Coleta

- `/estado` com leitura por janela (`24h`, `7d`, `30d`, `all`).
- Severidade visual (`🟢/🟡/🔴`) com sinais acionaveis.
- Comparacao leve de tendencia (`24h vs 7d` ou `7d vs 30d`).
- Alertas de "ativo sem trafego" para experimentos/engine/CTA.
- Status de coleta por quick/serie/territorio (`coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`).
- Metas minimas de amostra por janela temporal (7d, 30d, all).
- Barra de progresso visual e recomendacoes operacionais de distribuicao.
- **Bloco "O que distribuir agora"** com quick/territorio/serie prioritarios (Tijolo 28).

Documento operacional: `docs/plano-distribuicao-quick.md`

## Game Feel e Replay

- Intro curta nas engines com foco em primeira decisao rapida.
- Outcome com convite explicito para jogar de novo.
- Share page com CTA de reentrada para nova rodada.
- Assinatura de campanha reutilizavel e discreta em pontos de descoberta.

Documento guia: `docs/game-feel-e-diversao.md`

## Linha de Jogos da Campanha

- Documento mestre: `docs/linha-de-jogos-campanha.md`.
- Motor ideologico: `docs/motor-ideologico-dos-jogos.md`.
- Avatar oficial: `docs/avatar-oficial-alexandre-fonseca.md`.
- Pipeline de assets: `docs/assets/README.md`.
- Taxonomia oficial por tempo (`quick`, `session`, `deep`, `future-flagship`).
- Linhas editoriais e series para navegacao de campanha.
- Escala territorial planejada: Volta Redonda -> Sul Fluminense -> Baixada -> Capital -> Estado do RJ.

Componentes visuais de campanha:
- `CampaignAvatar`: avatar oficial reutilizavel da campanha
- `FinalShareCard`: sistema universal de card final compartilhavel
- `CampaignMark`: assinatura de campanha discreta

Blueprints futuros (sem implementacao neste ciclo):
- `docs/formato-plataforma.md`
- `docs/formato-rpg.md`
- `docs/formato-tycoon.md`

## Operacao Continua

Scripts principais:

```bash
# Distribuição e campanha
npm run campaign:links              # Gerar links rastreáveis
npm run campaign:brief              # Brief semanal de distribuição

# Operação contínua
npm run beta:ops
npm run beta:staleness-check
npm run beta:snapshot
npm run beta:export
npm run beta:circulation-report
npm run beta:distribution-report
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

Este ciclo nao adiciona:
- RPG/plataforma/tycoon completo
- auth obrigatoria para jogar
- integracao Slack/email
- painel admin enterprise

Foco: priorizacao estrategica da linha quick com evidencia comparavel (grude, serie lider, eixo lider, territorio responsivo) e sem inflar escopo para jogo medio ainda.
