# Mutirao do Bairro - Systems Design (T36A)

Status: pre-producao fechada
Escopo: arquitetura de gameplay para vertical slice T36B

## Objetivo da run

Manter o bairro funcional ate o fim da janela da rodada, equilibrando:
- servicos essenciais ativos;
- confianca comunitaria alta;
- danos estruturais sob controle.

Vitoria: bairro fecha a rodada com estabilidade >= 60 e confianca >= 55.
Derrota: estabilidade < 30 ou confianca < 25 por tempo continuo de 6s.

## Modelo de jogo

Formato escolhido: coordenacao de hotspots em tempo real (micro-management casual).

Visao:
- mapa unico de bairro com 5 zonas fixas;
- 2 a 4 hotspots ativos simultaneos;
- player aloca equipe e aciona habilidades curtas.

## Recursos principais

1. Estabilidade do bairro (0-100)
- representa funcionamento geral da vida local.

2. Confianca comunitaria (0-100)
- sobe com resposta coletiva eficaz;
- cai com abandono de zona e decisoes individualistas.

3. Folego do mutirao (0-100)
- enche com reparos e defesas bem-sucedidas;
- quando cheio, libera janela de mutirao.

4. Carga de equipe
- limite de tarefas simultaneas;
- define trade-offs e prioridade.

## Tipos de entidades

Hotspots (alvos principais):
- `infra-agua` (vazamento/pressao)
- `infra-energia` (queda/sobrecarga)
- `mobilidade-local` (bloqueio de rota)
- `equipamento-comunitario` (escola/posto/centro)
- `cuidado-rede` (fila de cuidado e suporte)

Ameacas:
- `sobrecarga`
- `sabotagem`
- `desinformacao`
- `intimidacao`

Suportes coletivos:
- `brigada-voluntaria`
- `cozinha-solidaria`
- `ferramenta-compartilhada`
- `rede-vizinhanca`

## Acoes do jogador

1. Reparar
- reduz dano estrutural de um hotspot;
- custo medio de carga;
- ganho alto de estabilidade.

2. Defender
- reduz impacto de ameacas ativas;
- custo baixo;
- ganho de confianca por resposta rapida.

3. Mobilizar
- redistribui equipe e acelera proxima acao;
- custo baixo;
- ganho de folego de mutirao.

4. Ativar Janela de Mutirao (habilidade)
- disponivel com folego cheio;
- dura 6-8s;
- aumenta eficacia coletiva e reduz custo das acoes.

## Progressao da run (90s)

Fase 1 - Arranque (0-20s)
- 2 hotspots ativos;
- baixa pressao;
- objetivo: ensinar leitura e selecao.

Fase 2 - Pressao de bairro (20-55s)
- 3 hotspots ativos;
- surgem ameacas combinadas;
- objetivo: priorizar sem colapsar confianca.

Fase 3 - Ponto de virada (55-78s)
- 4 hotspots ativos;
- eventos raros e janela de mutirao decisiva;
- objetivo: encaixar o boost coletivo.

Fase 4 - Fechamento (78-90s)
- dano acumulado acelera;
- ultima decisao de alocacao;
- objetivo: segurar limiares de vitoria.

## Eventos especiais

1. `chuva-forte`
- multiplica falhas em energia/mobilidade por 7s.

2. `onda-solidaria`
- surge suporte extra por 6s.

3. `boato-de-panico`
- drena confianca ate acao de defesa ser aplicada.

4. `tranco-de-sabotagem`
- dano explosivo em um hotspot aleatorio.

## Risco / recompensa

Rota individualista (atalho):
- resolve 1 hotspot muito rapido;
- reduz confianca comunitaria e aumenta risco de cascata.

Rota coletiva (mutirao):
- demanda coordenação e timing;
- estabiliza 2-3 hotspots com custo menor total.

## Politica na mecanica

- comum e cooperacao aumentam resiliência sistêmica;
- individualismo gera alivio local com custo social acumulado;
- autogestao aparece como vantagem tática real, nao discurso.

## Input mobile + PC (formato escolhido)

Mobile-first:
- toque em hotspot para selecionar;
- botoes grandes de acao no rodape (`Reparar`, `Defender`, `Mobilizar`);
- gesto de arraste opcional para realocar equipe entre zonas.

PC:
- mouse click para selecionar hotspot;
- atalhos `1/2/3` para acoes;
- `Space` para ativar janela de mutirao quando disponivel.

Acessibilidade de controle:
- sem plataforma de precisão;
- sem combos complexos;
- janela de erro tolerante em touch.

## HUD minimo planejado

Barra superior:
- tempo;
- estabilidade;
- confianca.

Painel central:
- hotspots ativos com severidade.

Barra inferior:
- acoes + cooldown;
- indicador de folego mutirao.

## Tela final e card

Resumo da run:
- hotspots salvos / perdidos;
- dano evitado;
- eficiencia coletiva;
- perfil da estrategia (coletiva x individualista).

Integracao:
- `FinalShareCard` com tema `mutirao-bairro-premium` (planejado);
- QR de reentrada;
- CTA campanha: participar do mutirao real / organizar no territorio.

## Telemetria planejada

Core:
- `arcade_run_start`
- `arcade_run_end`
- `arcade_first_input_time`
- `arcade_main_action_count`
- `arcade_event_triggered`
- `arcade_replay_click`
- `arcade_campaign_cta_click`

Especifica do loop:
- `arcade_hotspot_state_change`
- `arcade_mutirao_window_triggered`
- `arcade_collective_efficiency_peak`
- `arcade_collapse_warning`

Depth markers:
- tempo medio de resposta por hotspot;
- taxa de sucesso em eventos;
- proporcao de acoes coletivas vs individualistas.

## Escopo minimo de vertical slice (T36B)

Inclui:
- 1 mapa de bairro;
- 3 hotspots simultaneos maximos;
- 3 acoes principais;
- 2 eventos especiais;
- condicao clara de vitoria/derrota;
- HUD minimo + tela final integrada.

Exclui:
- multiplayer;
- sistema de missao longa;
- metagame persistente;
- assetização premium completa.

## Criterio de sucesso do primeiro build jogavel

- primeira acao em <= 3s;
- loop compreendido em <= 12s;
- run concluida em <= 100s;
- pelo menos 1 momento de "virada" com janela de mutirao;
- replay voluntario em sessao de teste >= 30%.
