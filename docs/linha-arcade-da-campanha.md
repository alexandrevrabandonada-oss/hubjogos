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

## Atualizacao Tijolo 31 - arcade-first na superficie publica

Mudanca de produto aplicada:
- arcade passou a ocupar a posicao de vitrine principal da home e da explorar.
- quick continua ativo como linha de throughput, mas sem esconder a proposta de jogo de verdade.

Impacto esperado:
- aumentar clique imediato para `arcade/[slug]` acima da dobra.
- elevar sinal de replay por run com menor friccao de entrada.
- reduzir dependencia de texto editorial no topo para iniciar sessao.

Eventos adicionados para validar o reposicionamento:
- `home_primary_play_click`
- `home_arcade_click`
- `home_play_now_block_click`
- `above_fold_game_click`
- `arcade_vs_quick_preference`
- `explorar_arcade_click`

Leitura no `/estado`:
- CTR arcade vs quick na home
- delta arcade-quick
- cliques em blocos above-the-fold
- comparativo de escolha declarada quick-vs-arcade

Guardrail mantido:
- sem inflar escopo para nova engine, auth/CMS/admin ou formato grande neste ciclo.

## Atualizacao Tijolo 35F - fechamento premium operacional

Escopo concluido para `tarifa-zero-corredor` sem abrir novo jogo:
- audio base com politica segura de interacao (som armado no primeiro input, toggle persistente no HUD);
- skin formal em `FinalShareCard` via `theme="tarifa-zero-premium"`;
- fixture de final premium rapido (`?preview=final`) para smoke de regressao sem esperar 55s;
- baseline visual formalizada em `reports/validation/baselines/` para run/final desktop+mobile;
- ajuste de observabilidade com `instrumentation.ts`, `instrumentation-client.ts` e `app/global-error.tsx`.

Leitura de produto:
- quick line preservada;
- arcade line reforcada com fechamento premium reutilizavel e validacao mais rapida.

## Atualizacao Tijolo 36A - abertura da proxima frente arcade

Decisao explicita do ciclo:
- rota A: novo arcade `mutirao-do-bairro` (pre-producao completa, sem publicar runtime final ainda).

Justificativa de produto:
- `tarifa-zero-corredor` ja cumpre papel de corrida coletiva premium;
- proximo arcade precisava mudar o verbo principal de jogo;
- `mutirao-do-bairro` entra com foco em coordenacao, reparo e defesa territorial.

Entregas de pre-producao:
- conceito mestre: `docs/mutirao-do-bairro-game-concept.md`
- systems design: `docs/mutirao-do-bairro-systems-design.md`
- art direction: `docs/mutirao-do-bairro-art-direction.md`
- pipeline de assets: `public/arcade/mutirao-do-bairro/README.md`

Direcao de loop (contraste obrigatorio):
- sai de lane collect/avoid;
- entra em coordenacao de hotspots com acoes curtas de reparar, defender e mobilizar;
- mantem run curta (30s-3min), replay imediato e politica por mecanica.

Ponte para T36B:
- implementar vertical slice jogavel minimo do `mutirao-do-bairro` mantendo guardrails de escopo.

## Atualizacao Tijolo 36C - fechamento premium do Mutirao

Escopo concluido para `mutirao-do-bairro` sem expandir para novos formatos:
- pass premium do runtime consolidado com assets dedicados, HUD e overlays de evento;
- leitura de efetividade integrada ao `/estado` e aos reports operacionais (`beta:snapshot`, `beta:export`, `beta:circulation-report`);
- testes unitarios dedicados de logica (28 casos) e e2e premium desktop/mobile;
- gates finais verdes (lint, type-check, build, test:unit, test:e2e).

Leitura de produto:
- `mutirao-do-bairro` passa de vertical slice para arcade premium em validacao seria;
- linha arcade mantem contraste de verbo de jogo (corrida coletiva vs coordenacao territorial);
- guardrails preservados: sem auth/CMS/admin, sem novo formato medio neste ciclo.

## Atualizacao Tijolo 33 - run efetiva como criterio de decisão

Leitura oficial para arcade line:
- clique em card e clique em replay so contam como sinal util quando viram novo start/input valido;
- recomendacao de próximo jogo so conta quando gera start efetivo no destino;
- direção quick -> arcade vs arcade -> quick passa a ser decidida por conversao efetiva, nao apenas por clique.

Implicacao para distribuicao arcade:
- priorizar em superficie e canais os arcades que puxam run efetiva e replay efetivo acima da media;
- reduzir peso de recomendações com clique alto, mas start efetivo baixo;
- adiar abertura de novo arcade ate consolidar 7-14 dias de amostra util.

## Atualizacao Tijolo 37 - duelo oficial Tarifa vs Mutirao

Objetivo aplicado:
- transformar a linha arcade em comparacao oficial entre `tarifa-zero-corredor` e `mutirao-do-bairro`;
- emitir estado de decisao explicito com guardrail de amostra;
- informar readiness para proximo passo sem abrir terceiro arcade.

Scorecard oficial T37 (dimensoes):
- runs totais;
- run end rate;
- replay rate;
- CTA pos-run rate;
- first input medio (menor e melhor);
- indice de engajamento (replay + CTA).

Estados de decisao da linha arcade:
- `insufficient_sample`;
- `early_signal`;
- `directional_lead`;
- `candidate_flagship`;
- `ready_for_next_step`.

Leituras derivadas:
- recomendacao canonica: `arcade_a_leads`, `arcade_b_leads`, `technical_tie` ou `insufficient_sample`;
- forca de campanha por arcade (score ponderado);
- avisos de cautela quando a amostra ainda nao cruza os limites minimos.

## Atualizacao Tijolo 38 - duelo justo por exposicao

Objetivo aplicado:
- equalizar a comparacao entre `tarifa-zero-corredor` e `mutirao-do-bairro` por exposicao real de vitrine;
- separar leitura de lideranca por volume, eficiencia e forca de campanha;
- evitar decisao enviesada quando um arcade recebe menos entrada na janela.

Camada nova T38:
- scorecards por arcade: `exposureSignals`, `intentClicks`, `starts`, `effectiveStarts`, `exposureToStartRate`;
- status de duelo justo:
  - `unbalanced_exposure`
  - `exposure_correction_in_progress`
  - `fair_comparison_window`
  - `decision_ready`
- recomendacao corretiva com boost de exposicao para o arcade subexposto.

Propagacao operacional:
- `/estado` com card dedicado de exposicao arcade;
- `beta:snapshot`, `beta:export`, `beta:circulation-report`, `beta:distribution-report` e `beta:campaign-brief` com leitura T38.

## Atualizacao Tijolo 41 - linha arcade dentro da fabrica

Decisao de portfolio:
- nao abrir terceiro arcade implementado neste tijolo;
- consolidar a janela de comparacao Tarifa vs Mutirao com regras T37/T38/T39/T40;
- preparar a proxima leva em pre-producao e nao em codificacao imediata.

Candidatos arcade em pre-producao:
1. `cooperativa-na-pressao` (prioritario para T42);
2. `bairro-resiste` (segunda opcao apos estabilizacao de escopo).

Governanca aplicada na linha arcade:
- maximo 1 arcade em validacao forte ao mesmo tempo;
- maximo 1 arcade em implementacao ativa;
- novas entradas arcade exigem concept + systems + art direction minimos antes de codigo.

## Atualizacao Tijolo 42 - cooperativa-na-pressao em implementacao ativa

Decisao aplicada:
- abrir somente `cooperativa-na-pressao` como implementacao ativa do ciclo;
- manter `mutirao-do-bairro` em validacao forte;
- nao abrir segundo jogo em codificacao.

Loop do slice (distinto dos anteriores):
- foco em coordenacao de producao coletiva (fila/backlog, exaustao e solidariedade);
- acao otima sempre coletiva (organizar turno, redistribuir esforco, cuidar equipe, mutirao cooperativo);
- colapso ocorre por desgaste continuo do coletivo, nao por erro individual pontual.

Escopo implementado no T42:
- rota `/arcade/cooperativa-na-pressao` jogavel;
- HUD minima e fases de pressao;
- outcome + replay + CTA campanha;
- telemetria baseline cooperativa.

Fora do escopo T42:
- pass premium final;
- modos extras;
- abertura de formato medio.

## Atualizacao Tijolo 42B - cooperativa-na-pressao com tuning e polish

Evolucao do slice T42 para jogo mais justo, legivel e prazeroso sem abrir novo escopo:

**Balanceamento T42B:**
- Grace period: 6s → 9s (50% mais margem antes do colapso).
- Pressure curves: redução ~15% em todas as fases (abertura, ritmo, pressão, colapso).
- Mutirão accessibility: threshold 100% → 85% (mais fácil ativar), boost 1.3x → 1.5x, duration 7.5s → 10s.
- Action potency: todas as ações buffadas 15-25% (organizar 18→22, redistribuir 10→12, cuidar 12→15).
- Phase timing ajustado: abertura 20s, ritmo 55s, pressão 75s.
- Collapse thresholds mais generosos: estabilidade <26→<22, solidariedade <24→<20, pressão >92→>94.

**UX e legibilidade:**
- Station critical state highlighting: >75% backlog/burnout = orange glow automático.
- HUD hierarchy: variable bar heights (estabilidade 12px, solidariedade 11px, pressão 10px) para priorização visual.
- Collapse warning: red overlay + "⚠ COLAPSO IMINENTE" quando burnout warning > 3s.
- Action feedback: 800ms pulse com green accent line quando ação é usada.
- Intro screen micro: ações numeradas (1-2-3-Espaço), objetivo claro, usage tips per action.
- Outcome screen: feedback condicional (≥75% collectivity = praise de coordenação, <60% = dicas de melhoria), dynamic replay button text.

**Telemetria expandida:**
- 6 novos eventos: `cooperativa_station_selected`, `cooperativa_station_overload`, `cooperativa_phase_reached`, `cooperativa_collapse_reason`, `cooperativa_mutirao_activated`.
- Dashboard `/estado` com Cooperativa effectiveness card (7 metrics: actions, phases, mutirões, stations, peaks, colapsos, events).
- Tracking completo wired no component.

**Success criteria T42B:**
- Survival rate: 40% → 65% (target).
- Collectivity rate: 60% → 75% (target).
- Mutirão usage: 20% → 60%+ (target).
- Replay rate: observar 7 dias pós-deploy.

Fora do escopo T42B:
- Assets SVG/PNG customizados (mantém canvas drawing profissional).
- Novo jogo ou formato médio.
- Animações complexas, particles, audio.

## Atualizacao Tijolo 43 - linha arcade com crescimento consciente

Direcao aplicada:
- manter `cooperativa-na-pressao` como implementacao ativa em observacao de 7 dias;
- nao abrir novo arcade em codigo neste ciclo;
- aprofundar pre-producao da proxima leva com diversidade territorial.

Estado da fila arcade apos T43:
1. `cooperativa-na-pressao` (implementacao ativa observada, sem premium pass liberado).
2. `bairro-resiste` (pre-producao forte, candidato real para subida).
3. `rj-do-comum` (conceito futuro estadual, ainda fora da fila de implementacao).

Condicao para `bairro-resiste` subir:
- estabilidade minima de `cooperativa-na-pressao` na janela pos-T42B;
- hard cap preservado (sem 2 jogos em implementacao simultanea);
- risco de producao >= 3 com escopo de slice cortado para 90s.

Guardrail mantido:
- maximo 1 arcade em validacao forte;
- maximo 1 jogo em implementacao ativa;
- sem vender conceito como release.

## Atualizacao Tijolo 50 - Ativacão e Decisão Operacional da Cooperativa

Objetivo aplicado:
- ativar uso real de `cooperativa-na-pressao` durante 7 dias (09/03-16/03);
- medir sinais mínimos de vida (runs completas, replay, CTA pós-run, mutirão, collectivity);
- tomar decisão final honesta ao fim da janela.

Caminhos possíveis de saída (T50 final):
1. **`promote_to_premium_pass`** (≥30 runs, >40% survival, >60% collectivity)
   - Liberar assets premium, audio base, HUD polish finais
   - Aumentar distribuição e vitrine
   - Prosseguir para premium em T51
2. **`run_short_tuning_cycle`** (5-25 runs, 20-40% survival, gargalos claros)
   - Ajustar 2-3 parâmetros de balanceamento
   - Re-observar por 7 dias (T51 será "T50 com ajustes")
   - Diferir premium pass até próximo checkpoint
3. **`archive_to_cold_backlog`** (0-4 runs, nenhum sinal)
   - Mover para vitrine mínima
   - Abrir `bairro-resiste` para implementação ativa em T51
   - Preservar código para possível retorno futuro

Guardrail mantido:
- Manter observação ativa, sem premiumizar por antecipação
- Sem novo jogo aberto em paralelo
- Decisão baseada em dados honestamente interpretados
## Atualizacao Tijolo 49 - decisao oficial da Cooperativa

Objetivo aplicado:
- decidir com dado vivo se `cooperativa-na-pressao` deveria entrar em premium pass no fim da janela de validacao.

Scorecard oficial T49 (operacao):
- runs observadas e efetivas;
- survival, collectivity, mutirao usage, replay e CTA pos-run;
- first input medio;
- causa principal de colapso;
- acao dominante e estacao critica.

Decisao emitida:
- status: `insufficient_live_usage`;
- decisao formal: `keep_observing`;
- premium pass: adiado para T50.

Implicacao para linha arcade:
- manter Cooperativa em observacao controlada, sem inflar escopo;
- nao abrir novo arcade em paralelo;
- manter o duelo Tarifa vs Mutirao com correcoes de exposicao em andamento.

## Atualizacao Tijolo 51 - Bairro Resiste pronto para subida condicional

Objetivo aplicado:
- elevar `bairro-resiste` para pre-producao forte com contrato operacional de slice, sem abrir implementacao durante T50.

Maturidade fechada:
- concept consolidado com fantasy pillars, promessa de replay, fail state e papel no funil;
- systems consolidado com fases, ameaças, risk/reward, colapso condicional e coletividade mecanica;
- art direction consolidada com paleta oficial, shape language, HUD minima e contraste claro vs outros arcades.

Contrato e readiness:
- `docs/bairro-resiste-vertical-slice-contract.md`
- `docs/bairro-resiste-go-live-checklist.md`
- pipeline pronto em `public/arcade/bairro-resiste/` com `manifest.json` inicial.

Regra de subida:
- `bairro-resiste` sobe para implementacao apenas apos encerramento oficial do T50 e liberacao de capacidade.

Leitura de portfolio:
- fila arcade mantida com governanca:
   1. cooperativa em observacao T50;
   2. bairro-resiste pronto para abrir slice no pos-T50;
   3. sem terceiro jogo em codificacao simultanea.
