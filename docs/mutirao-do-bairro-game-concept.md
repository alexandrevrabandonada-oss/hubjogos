# Mutirao do Bairro - Game Concept (T36A)

Status: pre-producao fechada (nao implementado ainda)
Decisao de rota: A) novo arcade `mutirao-do-bairro`
Referencia de qualidade: `tarifa-zero-corredor` premium (T35E/T35F)

## Estado de entrada (diagnostico)

`tarifa-zero-corredor` ja resolve com alta qualidade:
- loop curto e legivel em mobile/desktop;
- identidade visual profissional e asset pipeline real;
- HUD forte e feedback de fase/evento;
- pos-run premium com `FinalShareCard` tematico, QR e CTA;
- fixture de final rapido e baseline visual automatizada;
- audio/SFX base com controle de mute.

Gap para o proximo arcade:
- evitar repetir collect/avoid lane-based com skin nova;
- introduzir fantasia de coordenacao coletiva e reparo territorial;
- aumentar sensacao de montagem e defesa do comum em micro-sessao.

## Fantasia central

Voce lidera um mutirao de bairro em 90 segundos para manter o territorio funcionando sob pressao: reparar infraestrutura comunitaria, coordenar vizinhanca, defender pontos criticos e montar redes de apoio antes do colapso.

## Fantasy pillars

1. Coordenar, nao apenas desviar
- o jogador escolhe prioridades de area e equipe, nao so movimento de lane.

2. Reparar e montar em tempo real
- cada acao melhora o bairro: energia, agua, mobilidade local, cuidado.

3. Defender o comum sob ataque
- sabotagem e sobrecarga aparecem como pressao dinamica.

4. Ritmo de mutirao
- janela curta de sincronizacao gera pico de eficiencia coletiva.

5. Resultado territorial claro
- final mostra o que foi salvo, o que entrou em risco e qual modelo venceu.

## Papel politico

Politica por mecanica:
- ajuda mutua e autogestao rendem estabilidade de longo prazo;
- escolha individualista entrega alivio curto e cobra custo sistêmico;
- cooperacao distribuida supera solucao centralizada tardia.

Valores embutidos:
- ajuda mutua
- cooperativismo
- autogestao
- defesa do comum

## Papel eleitoral

Conecta diretamente com a pre-campanha:
- Alexandre Fonseca aparece como articulador de territorio e organizacao popular;
- reforca proposta de mandato ligado ao bairro e ao estado do RJ;
- CTA final convida para participar de mutiroes reais e circulacao da campanha.

## Por que e divertido

- pressao legivel + decisao rapida;
- sensacao de impacto imediato no mapa do bairro;
- picos de sincronizacao que viram "clutch moments";
- variacao alta entre runs por eventos e prioridades.

## Diferenca real vs Tarifa Zero RJ

Tarifa Zero RJ:
- fantasia de corrida coletiva em corredor;
- skill principal: leitura espacial de lane, coleta e desvio.

Mutirao do Bairro:
- fantasia de orquestracao territorial;
- skill principal: priorizacao de hotspots, alocacao de equipe e timing de mutirao.

Resumo do contraste:
- sai de "pilotar corredor" para "governar mutirao local".

## Duracao ideal da run

- alvo: 75-100s
- tolerancia: 60-120s
- replay imediato com variacao por eventos e mapa.

## Loop central (30s-3min por run)

1. Ler mapa de hotspots (2-4 pontos ativos).
2. Alocar acao rapida (reparar, defender, montar, mobilizar).
3. Resolver trade-off curto (apagar incendio local vs sustentar infraestrutura comum).
4. Ativar janela de mutirao para boost coletivo.
5. Fechar run com estado territorial + score politico-operacional.

## Fail state

Derrota quando dois limites estouram:
- colapso de servicos essenciais (energia/agua/mobilidade) abaixo do minimo;
- confianca comunitaria cai abaixo do piso por excesso de resposta individualista.

## Replay promise

"Cada run conta outra historia do bairro"
- eventos mudam o tipo de pressao;
- configuracao de hotspots varia;
- composicao de equipe muda o ritmo;
- final card mostra perfil politico da sua gestao.

## HUD e tela final (direcao de produto)

HUD minimo:
- tempo restante;
- estabilidade do bairro;
- barra de confianca comunitaria;
- status de 3 hotspots criticos;
- cooldown/janela de mutirao.

Tela final:
- resumo por territorio salvo/em risco;
- score, eficiencia coletiva, danos evitados;
- leitura ideologica da run;
- `FinalShareCard` com tema proprio + QR + CTA campanha.

## Telemetria (plano do conceito)

Eventos base planejados:
- `arcade_run_start`
- `arcade_run_end`
- `arcade_first_input_time`
- `arcade_main_action_count`
- `arcade_hotspot_saved`
- `arcade_mutirao_window_triggered`
- `arcade_replay_click`
- `arcade_campaign_cta_click`
- `arcade_depth_marker`

## Vertical slice (ponte para T36B)

Entra no T36B:
- runtime jogavel minimo de 1 mapa;
- 3 tipos de hotspot;
- 3 acoes centrais (reparar, defender, mobilizar);
- 2 eventos especiais;
- HUD minimo + tela final integrada ao `FinalShareCard`.

Nao entra no T36B:
- polimento premium completo de assets;
- trilha de audio extensa;
- multiplos mapas e balanceamento avancado;
- otimizações profundas de telemetria comparativa.
