# Roadmap - Hub de Jogos da Pre-Campanha

## Linha do tempo

- Tijolo 01 a 12 ✅ fundacao, engines, ciclo de aprendizado e consolidacao remota
- Tijolo 13 ✅ operacao interna leve (triagem prioritaria + cockpit)
- Tijolo 14 ✅ governanca minima e auditabilidade
- Tijolo 15 a 20 ✅ automacao e cockpit temporal operacional

## Tijolo 21 (concluido)

Objetivo:
- transformar a base temporal em cockpit diario realmente util

Entregas:
1. linha de jogos da campanha formalizada (doc mestre)
2. taxonomia oficial por tempo, linha editorial, serie e escopo territorial
3. home/explorar reposicionados como vitrine da campanha
4. camada de series/colecoes aplicada no produto
5. reforco de presenca da pre-campanha sem panfleto duro
6. leitura editorial em `/estado` por serie, territorio e tipo
7. blueprints de plataforma/RPG/tycoon publicados

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

## Tijolo 22 (concluido)

Objetivo:
- criar base visual reutilizavel para crescimento organizado da campanha

Entregas:
1. avatar oficial de Alexandre Fonseca como personagem principal recorrente
2. card final universal compartilhavel em todos os jogos
3. pipeline de assets organizado (`public/campaign/`, `docs/assets/`)
4. componentes reutilizaveis (`CampaignAvatar`, `FinalShareCard`)
5. tracking de card final e avatar
6. leitura editorial em `/estado` para sinais de adocao

## Riscos monitorados apos T22

- asset V1 e placeholder tecnico, precisa refinamento profissional futuro
- card final universal precisa validacao de uso e compartilhamento real
- tracking de card/avatar ainda sem historico para tendencias
- dependencia de designer/ilustrador para evoluir asset V1 para V2

## Guardrails

- sem nova engine
- sem RPG/plataforma/tycoon completo implementado ainda
- sem auth obrigatoria para jogar
- sem integracao Slack/email neste ciclo
- sem painel admin enterprise

## Tijolo 23 (concluido)

Objetivo:
- evoluir avatar para V2 reconhecivel, fortalecer card final com QR e validar pipeline com novo minigame quick

Entregas:
1. avatar V2 com expressoes (`neutral`, `smile`, `determined`) e variante com oculos
2. `CampaignAvatar` evoluido com contrato de expressao/oculos/fullBody futuro
3. `FinalShareCard` com QR code dinamico de reentrada
4. tracking adicional para QR, avatar V2 e minigame quick
5. novo minigame quick `custo-de-viver` integrado ao catalogo real
6. `/estado` atualizado para leitura de QR + avatar V2 + quick completion/replay

## Tijolo 24 (concluido)

Objetivo:
- validar de forma disciplinada a linha quick da campanha com comparacao real e baixo risco

Entregas:
1. segundo quick game real `quem-paga-a-conta` integrado ao runtime de quiz
2. experimento A/B `final-card-qr-code` com variantes `with-qr`/`without-qr`
3. refinamento do `FinalShareCard` para funcionar com e sem QR
4. `/estado` com secao leve dedicada a quick line
5. snapshots/exports/circulation report com leitura quick vs quick, serie/territorio e QR summary
6. SQL operacional para views quick (`supabase/tijolo-24-quick-line-validation.sql`)

## Tijolo 25 (concluido)

Objetivo:
- formalizar o motor ideologico dos jogos e consolidar leitura da linha quick com foco em solucoes coletivas

Entregas:
1. documento mestre `docs/motor-ideologico-dos-jogos.md`
2. taxonomia ideologica no catalogo (`politicalAxis`, `collectiveSolutionType`, `commonVsMarket`, `campaignFrame`)
3. terceira experiencia quick `cidade-em-comum` integrada ao runtime real
4. outcomes/CTAs com linguagem de organizacao coletiva (menos personalismo)
5. tracking com metadata ideologica + evento `ideological_axis_signal`
6. `/estado` com leitura por eixo politico e solucao coletiva
7. snapshot/export/circulation com recortes ideologicos na linha quick

## Tijolo 26 (concluido)

Foco executado:
1. comparacao real entre `custo-de-viver`, `quem-paga-a-conta` e `cidade-em-comum`
2. scorecard de grude por quick, serie e territorio
3. leitura de eixo politico lider e territorio mais responsivo no `/estado`
4. readout de experimento QR com estado (`cedo-demais`, `monitorando`, `sinal-direcional`)
5. snapshots/exports/circulation report com ranking e avisos de baixa amostra

## Tijolo 27 (concluido)

Foco executado:
1. plano operacional de distribuicao com metas minimas por janela (7d, 30d, all)
2. status de coleta (`coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`)
3. report de distribuicao operacional (`npm run beta:distribution-report`)
4. `/estado` ampliado com barras de progresso e avisos de insuficiencia
5. criterio formal de "pronto para Tijolo 28" baseado em amostra honesta

## Tijolo 28 (concluido)

Foco executado:
1. sistema de links de campanha rastreaveis com UTMs (lib/campaign-links/)
2. pacotes de distribuicao por canal (Instagram, WhatsApp, TikTok)
3. pacotes por territorio (estado-rj, volta-redonda) com metas operacionais
4. operacao semanal documentada (roteiro de 14 dias)
5. script de brief semanal (`npm run campaign:brief`)
6. melhorias no `beta:distribution-report` (sugestoes acionaveis)
7. bloco "O que distribuir agora" em `/estado`
8. branding eleitoral reforçado em todos os materiais de distribuicao

## Proximo ciclo (Tijolo 29)

Foco sugerido:
1. executar distribuicao por 7-14 dias seguindo `docs/operacao-semanal-distribuicao.md`
2. consolidar amostra minima comparavel (80+ sessoes/territorio, 60+ sessoes/quick)
3. decidir de forma honesta qual serie deve virar prioridade (aguardando amostra real)
4. tensionar territorio lider com criativo dedicado
5. preparar blueprint de formato medio a partir da serie quick mais grudenta
6. manter disciplina de evidencias sem abrir auth/CMS/admin ainda

Ultima atualizacao: 2026-03-07 (Tijolo 28)
