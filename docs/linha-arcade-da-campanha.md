# Linha Arcade da Campanha

## Por que esta linha existe

A linha arcade existe para abrir uma camada de jogos de verdade no hub sem abandonar a linha quick.
Ela resolve uma lacuna de produto: criar experiencias com game feel imediato, loop claro e replay forte em sessao curta (30s-3min), mantendo mensagem politica pela mecanica e nao por texto longo.

Objetivo politico-produto:
- aumentar diversao real em segundos;
- aumentar repeticao de run;
- elevar compartilhamento de resultado com card final;
- reforcar pauta coletiva (tarifa zero, ajuda mutua, comum).

## Quick line vs Arcade line

Quick line:
- formato principal: quiz/narrativa relampago;
- foco: entrada ultra-rapida e distribuicao em escala;
- duracao: 1-2 min;
- decisao principal por leitura de respostas;
- continua ativa como linha de throughput e comparacao.

Arcade line:
- formato principal: acao em tempo real (canvas/html5);
- foco: loop jogavel com habilidade, risco e recompensa;
- duracao: 30s-3min por run;
- decisao principal por mecanica (movimento, coleta, desvio, power-up);
- reforco ideologico pela estrategia vencedora da propria partida.

## Criterios de diversao

Uma experiencia arcade so entra em producao quando cumprir:
- primeira acao em ate 3s apos iniciar;
- loop principal legivel em ate 10s;
- risco/recompensa visivel em ate 1 run;
- vontade de replay imediata ao fim da rodada;
- resultado final com variacao real entre runs;
- sensacao de controle responsivo em touch e teclado.

## Criterios de controle mobile + PC

Obrigatorio:
- touch: jogavel com uma mao e botoes grandes;
- mouse: clique/toque em area de jogo sem exigir precisao extrema;
- teclado: setas e A/D para movimento, P para pause, R para restart;
- mesma regra de jogo nos 3 modos de input;
- hitboxes e velocidade ajustadas para tela pequena.

## Escopo minimo aceitavel (MVP arcade)

- runtime reutilizavel com canvas/html5;
- update/render loop com RAF;
- input unificado (touch/mouse/teclado);
- HUD minimo (score, estado de corrida, progresso);
- pause e restart;
- fim de run com resultado + score;
- replay em 1 clique;
- telemetria arcade dedicada;
- card final universal com QR e CTA de campanha.

## O que nao fazer ainda

Neste ciclo nao abrir:
- RPG grande;
- plataforma de precisao longa;
- tycoon grande;
- auth/CMS/admin;
- dependencia pesada de engine externa.

## Primeiro vertical slice

Jogo: `Tarifa Zero RJ - Corredor do Povo`

Decisao de produto:
- lane-based/top-down para facilitar mobile + PC;
- avatar oficial no centro da acao;
- mecânica de mutirao/poder coletivo como caminho otimo;
- run curta com replay imediato;
- fim com card final universal e chamada da pre-campanha.

## Blueprint dos proximos jogos de verdade (Tijolo 30+)

1. Cooperativa: Trabalho Sem Patrao (arcade de cadeia produtiva coletiva)
2. Mutirao do Bairro (defesa de territorio e infraestrutura comum)
3. Cidade do Comum: Orcamento Popular (simulacao/arcade hibrido)

Horizonte futuro (nao abrir agora):
- plataforma politico-territorial;
- tycoon de politicas publicas populares.
