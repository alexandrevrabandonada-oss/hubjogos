# Bairro Resiste - Concept (T51)

## Status

- etapa: pre-producao forte pronta para subida condicional
- tipo alvo: arcade tatico territorial (run curta, alta pressao)
- territorio base: baixada fluminense
- linha editorial: serie-rio-de-janeiro
- dependencia de subida: decisao final do T50 sobre `cooperativa-na-pressao`

## Posicionamento no portfolio

`bairro-resiste` precisa ser nitidamente diferente dos arcades atuais:

- vs `tarifa-zero-corredor`: sai da fantasia de corrida/acesso e entra em defesa de infraestrutura local sob ataque.
- vs `mutirao-do-bairro`: sai da coordenacao ampla de hotspots e entra em triagem de crise territorial com risco de colapso em cadeia.
- vs `cooperativa-na-pressao`: sai da gestao de producao e entra em cuidado comunitario de bairro em emergencia.

## Fantasia emocional central

"Quando tudo aperta, o bairro nao se rende".

O jogador vive a fantasia de ser parte de uma rede territorial que evita o colapso do comum: cada acao bem temporizada segura agua, moradia, mobilidade e saude em pe durante uma janela critica.

## Fantasy pillars

1. defesa territorial viva
- o mapa parece um bairro real em risco, nao um tabuleiro abstrato.

2. cuidado comunitario sob pressao
- o verbo principal e proteger, cuidar e reorganizar, nao atacar.

3. virada coletiva como recompensa
- momentos de ajuda mutua mudam o rumo da run e geram sensacao de "virada do bairro".

4. escolhas duras em tempo curto
- nao existe acao perfeita: toda decisao resolve um ponto e abre fragilidade em outro.

## Promessa de replay

- cada run muda a ordem e intensidade das crises;
- combinacoes de acoes geram finais distintos (sobrevive, sobrevive no limite, colapsa);
- outcome final mostra "como o bairro resistiu" com CTA de reentrada em 1 clique.

## Loop principal (5 passos)

1. ler o risco territorial e identificar o hotspot mais urgente.
2. escolher a acao de resposta (`defender`, `reparar`, `cuidar`, `mobilizar`).
3. absorver a onda de crise ativa e conter propagacao.
4. redistribuir brigadas e energia comunitaria para o proximo pico.
5. fechar a run por `resistencia_territorial` e `forca_da_rede`, com CTA da campanha.

## Fail state e tensao central

O jogador perde quando o bairro entra em colapso sistemico: nao e "falha individual", e quebra da rede comunitaria.

Razoes de derrota esperadas:
- integridade territorial zera;
- rede solidaria quebra;
- duas frentes entram em dano critico e nao sao estabilizadas a tempo.

## Papel na campanha

- transformar defesa do comum em experiencia concreta e compartilhave;
- reforcar a ideia de que seguranca real nasce de organizacao comunitaria, nao de militarizacao;
- manter presenca da campanha de Alexandre Fonseca por assinatura e CTA contextual, sem panfleto duro.

## Papel no funil

- entrada: destaque arcade para publico que ja clica em jogos de acao curta;
- retencao: replay imediato para aprofundar mensagem por mecanica;
- circulacao: final de run com frame territorial compartilhaveL (bairro segurou/colapsou por X motivo);
- ponte: pode puxar o jogador para quicks de pauta local e para `participar`.

## Territorio e narrativa eleitoral

- foco primario: baixada fluminense;
- espelho metropolitano: capital periferica e cidades da regiao metropolitana;
- framing eleitoral: "governo para o comum territorial" em vez de "cidade para especulacao".

## Escopo minimo do slice alvo (T52/T52A)

- 1 mapa de bairro unico com 4 hotspots fixos;
- 4 acoes base com cooldown curto;
- run de 90s com 4 fases de pressao;
- outcome com leitura de resistencia e apoio comunitario;
- telemetria minima de run, acao, fase, colapso e replay.

## Fora de escopo neste tijolo

- implementacao jogavel do runtime;
- assets premium finais e audio autoral;
- novos modos, meta-progresso ou multiplayer.

## Riscos que ainda travam subida

- risco de legibilidade: muitos alertas simultaneos podem virar ruido.
- risco de tuning: run pode ficar punitiva cedo demais sem janela de recuperacao.
- risco de identidade: sobrepor linguagem do Mutirao sem reforcar defesa territorial propria.
- risco de producao: escopo do slice crescer alem de 90s e perder velocidade de entrega.

## Condicao de promocao (pre-producao -> implementacao)

## Histórico de Rebalanceamento

### T64 (Pós-Amostragem T63)
- **Hotspot Saúde**: Pressão inicial reduzida de 10 para 0. Fator de crescimento reduzido em 10% (0.9x) para evitar colapsos precoces injustos identificados em amostragem real.
- **UX/Intro**: Sincronizado texto de cooldown (2s -> 1.5s) para transparência com o motor real.

### T65 (Validação Pós-T64)
- **Amostragem**: 105 runs.
- **Veredito**: Saúde validado como não-bloqueador (20% de falhas). Jogo agora é HERO_TEST_CANDIDATE.
