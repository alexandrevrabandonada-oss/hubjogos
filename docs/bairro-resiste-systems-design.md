# Bairro Resiste - Systems Design (T51)

## Objetivo do sistema

Transformar defesa do comum em loop arcade curto, legivel e rejogavel, com decisao sob pressao e margem real para virada coletiva.

## Premissas de design

- duracao alvo da run: 90s;
- leitura do estado critico em menos de 1s;
- primeira decisao significativa em ate 8s;
- colapso precisa parecer sistêmico (bairro), nao erro isolado de input.

## Core loop de run (macro)

1. detectar hotspot em risco dominante.
2. escolher acao imediata (`defender`, `reparar`, `cuidar`, `mobilizar`).
3. absorver evento de crise da fase.
4. redistribuir brigadas e preservar rede solidaria.
5. fechar fase com ganho/perda de controle territorial.

## Progressao por fase (90s)

- `fase_1_arranque` (0-18s)
  - onboarding de leitura, 1 frente em risco por vez.
  - objetivo: ensinar prioridades sem punicao dura.

- `fase_2_pressao` (18-45s)
  - duas frentes alternando picos.
  - objetivo: obrigar troca de acoes e evitar spam de uma unica resposta.

- `fase_3_cerco` (45-75s)
  - encadeamento de eventos, propagacao mais rapida.
  - objetivo: testar gestao de exaustao e uso correto de mobilizacao.

- `fase_4_limite` (75-90s)
  - janela final com risco alto e pouca folga.
  - objetivo: sustentar bairro ate o fechamento, sem colapso em cascata.

## Recursos centrais

- `integridade_bairro` (0-100)
  - representa estado estrutural agregado do territorio.

- `rede_solidaria` (0-100)
  - representa capacidade coletiva de responder e recuperar.

- `pressao_externa` (0-100)
  - representa intensidade de ofensivas e choques territoriais.

- `brigadas` (0-100)
  - energia operacional das equipes no curto prazo.

- `carga_mutirao` (0-100)
  - acumulador para acao de virada coletiva.

## Hotspots e identidade local

Hotspots fixos do slice:
- `agua`
- `moradia`
- `mobilidade`
- `saude`

Estado local por hotspot:
- `dano` (0-100)
- `exaustao` (0-100)
- `ameaca_ativa` (tipo de crise atual)

## Tipos de ameaca

- `corte_fornecimento`
  - aumenta dano progressivo em agua/mobilidade.

- `despejo_relampago`
  - pico abrupto em moradia e pressao geral.

- `operacao_violenta`
  - choque curto de alto impacto em qualquer hotspot.

- `sabotagem_servico`
  - dreno de rede solidaria e aumento de exaustao.

- `desinformacao_territorial`
  - reduz eficacia de acao por janela curta.

- `virada_comunitaria` (positivo)
  - evento raro que reduz pressao e recupera rede.

## Acoes principais e risk/reward

| acao | efeito principal | custo | recompensa | risco |
| --- | --- | --- | --- | --- |
| defender | queda forte de dano no hotspot alvo | consome brigadas rapido | evita colapso imediato | aumenta exaustao local se repetida |
| reparar | recupera integridade do hotspot e pequena parcela global | custo moderado de tempo | estabiliza medio prazo | pode ser lenta sob pressao extrema |
| cuidar | reduz exaustao e recupera rede solidaria | baixo custo estrutural | prepara viradas e melhora eficiencia geral | nao segura pico de dano sozinha |
| mobilizar | buff curto de resposta coletiva + ganho de apoio | gasta `carga_mutirao` | permite virada em cadeia | janela curta; uso fora de timing desperdiça potencial |

## Coletividade no sistema

Coletividade nao e cosmetica, e multiplicador mecanico:

- `rede_solidaria` alta aumenta eficiencia de `reparar` e `cuidar`.
- `mobilizar` habilita bonus temporario em todos hotspots.
- sequencia bem feita (`cuidar` -> `mobilizar` -> `defender/reparar`) reduz risco de colapso em cadeia.
- rede baixa (<25) aplica penalidade global de recuperacao.

## Conditionais de colapso

A run encerra em derrota se ocorrer qualquer condicao:

- `integridade_bairro <= 0`
- `rede_solidaria <= 0`
- `pressao_externa >= 100`
- `hotspots_criticos_simultaneos >= 2` por mais de `3.5s`

Colapso parcial (nao encerra, mas penaliza):
- hotspot fica em `dano >= 90` por `2s` -> perda de brigadas + subida de pressao.

## Condicoes de sucesso da run

Sucesso basico:
- sobreviver ate 90s com `integridade_bairro > 0` e `rede_solidaria > 0`.

Sucesso forte:
- finalizar com `integridade_bairro >= 45` e `rede_solidaria >= 55`.

## Telemetria minima do slice

- `bairro_resiste_run_start`
- `bairro_resiste_run_end`
- `bairro_resiste_action_used`
- `bairro_resiste_phase_reached`
- `bairro_resiste_hotspot_overload`
- `bairro_resiste_collapse_reason`
- `bairro_resiste_mutirao_activated`
- `bairro_resiste_replay_click`
- `bairro_resiste_campaign_cta_click`

## Escopo do vertical slice (entra)

- 1 mapa unico com 4 hotspots;
- 4 acoes completas (teclado/mouse/touch);
- 6 eventos (5 negativos + 1 positivo);
- 4 fases em 90s;
- outcome com leitura territorial + CTA.

## Fora do slice (nao entra)

- variacao procedural de mapas;
- progressao persistente entre runs;
- modo cooperativo real/multiplayer;
- sistema de missoes longas;
- audio premium autoral.

## Riscos tecnicos e mitigacao

- risco: sobrecarga visual com 4 hotspots em alerta.
  mitigacao: prioridade visual unica por frame (um alerta dominante) e badges secundarias discretas.

- risco: tuning punitivo no fim da run.
  mitigacao: teto de escalada na `fase_4_limite` + grace window de 2s para transicao de colapso.

- risco: repeticao de eventos sem variedade.
  mitigacao: pool com pesos dinamicos por estado e bloqueio de repeticao imediata.

- risco: custo de update alto em mobile fraco.
  mitigacao: hotspots fixos, regras discretas e limite de efeitos simultaneos na renderizacao.
