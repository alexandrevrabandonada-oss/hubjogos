# Roadmap - Hub de Jogos da Pre-Campanha

## Linha do tempo

- Tijolo 01 a 12 ✅ fundacao, engines, ciclo de aprendizado e consolidacao remota
- Tijolo 13 ✅ operacao interna leve (triagem prioritaria + cockpit)
- Tijolo 14 ✅ governanca minima e auditabilidade
- Tijolo 15 a 20 ✅ automacao e cockpit temporal operacional

## Tijolo 20 (concluido)

Objetivo:
- transformar a base temporal em cockpit diario realmente util

Entregas:
1. `/estado` com severidade visual e sinais operacionais por janela
2. comparacao leve entre janelas para leitura de tendencia
3. `beta:ops` consolidado (staleness, snapshot age, ultimo evento remoto, prioritarios)
4. deteccao explicita de "ativo sem trafego"
5. playbook operacional de incidentes
6. resumo do cron mais legivel no GitHub Actions

## Riscos monitorados apos T20

- falsa leitura em janela com amostra muito baixa
- experimento ativo sem superficie com trafego
- backlog de feedback prioritario em ciclos de alta demanda
- dependencia de dados remotos para sinais de tempo real

## Guardrails

- sem nova engine
- sem auth obrigatoria para jogar
- sem integracao Slack/email neste ciclo
- sem painel admin enterprise

## Proximo ciclo (Tijolo 21)

Foco sugerido:
1. testes automatizados para sinais do cockpit temporal (`/estado` e `beta:ops`)
2. refinamento de thresholds por nivel de trafego (sem heuristica opaca)
3. reducao de ruido em warnings repetitivos
4. verificacao continua de confiabilidade entre janelas

Ultima atualizacao: 2026-03-06 (Tijolo 20)
