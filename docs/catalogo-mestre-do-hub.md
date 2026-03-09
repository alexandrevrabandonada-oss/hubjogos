# Catalogo Mestre do Hub (T51)

## Objetivo

Consolidar o portfolio do Hub como sistema vivo, com status de producao explicito, diversidade planejada e governanca de capacidade respeitada.

## Diagnostico atual da fabrica

### Estado atual

- quick line ativa e estavel para entrada de campanha.
- arcades reais em operacao (`tarifa-zero-corredor`, `passe-livre-nacional`) e validacao forte (`mutirao-do-bairro`).
- `cooperativa-na-pressao` em observacao ativa do T50 (ate 16/03/2026).
- `bairro-resiste` maturado para pre-producao forte pronta para subida condicional.
- `orcamento-do-comum` segue em backlog frio maduro.
- `rj-do-comum` permanece como conceito futuro.

### Gargalos de organizacao

- risco de repeticao de fantasia arcade se subida nao considerar diversidade territorial.
- linha media/session ainda sem slot operacional claro de capacidade.
- parte do portfolio legado usa status tecnico antigo e precisa leitura de portfolio para decisao.

### Lacunas de pre-producao (status T51)

- concept/systems/art de `bairro-resiste`: fechados.
- contract de vertical slice de `bairro-resiste`: criado.
- pipeline de assets e manifest inicial de `bairro-resiste`: criados.
- checklist de promocao pre-producao -> implementacao: criado.

## Catalogo mestre

| slug | nome | tipo | status portfolio | territorio | serie | eixo politico | papel na campanha | papel no funil |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tarifa-zero-corredor | Tarifa Zero RJ - Corredor do Povo | arcade | live | estado-rj | serie-solucoes-coletivas | poder-popular | flagship de mobilidade coletiva | retencao |
| passe-livre-nacional | Passe Livre Nacional - Sindicato em Movimento | arcade | live | estado-rj | serie-solucoes-coletivas | poder-popular | reforco sindical e defesa do transporte | retencao |
| mutirao-do-bairro | Mutirao do Bairro - Defesa do Comum | arcade | validando forte | estado-rj | serie-solucoes-coletivas | poder-popular | prova de ajuda mutua sob crise | retencao |
| cooperativa-na-pressao | Cooperativa na Pressao | arcade | implementacao ativa observada | estado-rj | serie-trabalho-sobrevivencia | poder-popular | demonstrar producao sem patrao sob ataque | retencao |
| custo-de-viver | Custo de Viver | quick | validando | volta-redonda | serie-trabalho-sobrevivencia | reforma-estatal | entrada rapida por economia cotidiana | entrada |
| quem-paga-a-conta | Quem Paga a Conta? | quick | validando | estado-rj | serie-campanha-missoes-estado | reforma-estatal | framing de responsabilidade por servicos | entrada |
| cidade-em-comum | Cidade em Comum | quick | validando | estado-rj | serie-solucoes-coletivas | poder-popular | introducao de solucoes anarco-comunistas | entrada |
| cidade-real | Cidade Real | medio (simulation) | live | volta-redonda | serie-volta-redonda | reforma-estatal | debate de orcamento com friccao baixa | aprofundamento |
| abandonado | Abandonado | medio (map) | live | volta-redonda | serie-cidade-abandonada | poder-popular | memoria territorial e abandono estrutural | aprofundamento |
| voto-consciente | Voto Consciente | medio (quiz) | live | estado-rj | serie-campanha-missoes-estado | reforma-estatal | ponte explicita entre pauta e voto | aprofundamento |
| transporte-urgente | Transporte Urgente | medio (branching_story) | live | volta-redonda | serie-volta-redonda | reforma-estatal | narrativa de custo da mobilidade | aprofundamento |
| bairro-resiste | Bairro Resiste | arcade | pre-producao forte pronta para subida condicional | baixada | serie-rio-de-janeiro | poder-popular | defesa territorial/cuidado comunitario em crise | retencao |
| orcamento-do-comum | Orcamento do Comum | medio futuro | backlog frio maduro | estado-rj | serie-campanha-missoes-estado | poder-popular | disputa do fundo publico pelo comum | aprofundamento |
| rj-do-comum | RJ do Comum | session/deep futuro | conceito futuro | estado-rj | serie-rio-de-janeiro | poder-popular | horizonte estadual de governanca do comum | aprofundamento |
| trabalho-impossivel | Escolhas Impossiveis | medio (narrative) | backlog frio | sul-fluminense | serie-trabalho-sobrevivencia | mercado | contraste de precarizacao do trabalho | aprofundamento |
| memoria-coletiva | Memoria Coletiva | medio (narrative) | backlog frio | volta-redonda | serie-cidade-abandonada | poder-popular | memoria historica como disputa politica | aprofundamento |

## Regras de uso deste catalogo

- `status portfolio` e a coluna oficial para planejamento e subida.
- `status tecnico` (live/beta/coming) permanece no codigo como detalhe de runtime.
- nenhum jogo sobe para implementacao sem concept + systems + art direction minimos.
- nenhuma promocao pode quebrar o hard cap de capacidade da fabrica.

## Atualizacao T51 - rationale de subida futura (`bairro-resiste`)

`bairro-resiste` fica formalmente pronto para subir quando o T50 fechar, por quatro motivos:

1. contraste de portfolio resolvido
- o jogo nao repete o verbo central dos arcades ativos; entra com defesa territorial e cuidado comunitario sob crise.

2. escopo de slice travado
- run de 90s, 1 mapa, 4 hotspots, 4 acoes, outcome territorial e telemetria baseline.

3. pipeline pronto
- estrutura em `public/arcade/bairro-resiste/` criada com manifest inicial e fallback definido.

4. governanca preservada
- subida condicionada ao encerramento do T50 e liberacao de capacidade.
