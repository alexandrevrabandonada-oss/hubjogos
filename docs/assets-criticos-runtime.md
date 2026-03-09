# Politica de Assets Criticos de Runtime

Definicao oficial para acionamento de smoke seletivo no pipeline de assets.

## Objetivo

Proteger runtime de jogo e HUD principal sem transformar CI em fonte de ruido.

## O que e asset critico

Asset critico e qualquer arquivo cuja mudanca pode afetar jogabilidade basica, leitura da interface ou inicializacao segura da run.

Classes criticas:
- `public/arcade/<slug>/manifest.json`
- `public/arcade/<slug>/bg/**`
- `public/arcade/<slug>/player/**`
- `public/arcade/<slug>/obstacles/**`
- `public/arcade/<slug>/pickups/**`
- `public/arcade/<slug>/ui/**`
- `lib/games/arcade/*assets.ts`
- `lib/games/assets/**`

## O que nao entra como critico por padrao

Classes nao-criticas para o trigger seletivo:
- `public/arcade/<slug>/fx/**`
- `public/arcade/<slug>/audio/**`
- docs, templates, relatórios

Observacao:
- esses arquivos continuam auditados por `npm run assets:audit`;
- apenas o trigger automatico de smoke seletivo os trata como nao-criticos.

## Regra no CI

No workflow `.github/workflows/assets-audit.yml`:
- se diff toca asset critico: roda `npm run test:assets-smoke`;
- se diff nao toca asset critico: smoke adicional e pulado.

## Politica de bloqueio

- erro em `assets:audit`: bloqueia merge.
- warning em audit: nao bloqueia (informativo).
- alerta de allowlist review vencida/proxima: nao bloqueia por si so.
- falha no smoke seletivo quando executado: bloqueia merge.

## Evolucao para T49

- revisar lista critica por historico real de incidentes;
- avaliar segmentacao do smoke por pack afetado para reduzir tempo de CI sem perda de cobertura.
