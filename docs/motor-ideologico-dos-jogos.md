# Motor Ideologico dos Jogos

## Objetivo

Definir como cada jogo traduz disputa politica em mecanica, resultado e chamada para organizacao coletiva.

## Principio central

A jogabilidade deve empurrar o usuario da leitura individual para a acao coletiva.

## Estrutura de desenho

1. Conflito concreto do territorio
- Exemplo: tarifa cara, aluguel alto, abandono de servico publico, desemprego.

2. Escolhas jogaveis com consequencia social
- Toda opcao precisa revelar custo politico, nao apenas preferencia pessoal.

3. Resultado legivel e acionavel
- O resultado deve explicar o eixo politico dominante e sugerir proxima acao coletiva.

4. CTA de organizacao
- Saida prioritaria: organizar no territorio, comparar rotas e puxar conversa local.

## Taxonomia oficial

- `politicalAxis`
- mercado: solucao individual e privatizacao.
- reforma-estatal: ampliacao de politicas publicas com disputa institucional.
- poder-popular: auto-organizacao, controle popular e defesa dos comuns.

- `collectiveSolutionType`
- tarifa-zero
- cooperativismo
- ajuda-mutua
- autogestao
- controle-popular

- `commonVsMarket`
- mercado
- misto
- comum

- `campaignFrame`
- projeto-coletivo
- comunidade-em-luta
- defesa-dos-comuns

## Serie ideologica

- Serie recomendada: `serie-solucoes-coletivas`.
- Funcao: agrupar jogos curtos com saida para organizacao de base.
- Entradas atuais: `cidade-em-comum` + conexoes com `voto-consciente` e `quem-paga-a-conta`.

## Instrumentacao minima

Todos os eventos carregam metadados ideologicos de catalogo:
- `politicalAxis`
- `collectiveSolutionType`
- `commonVsMarket`
- `campaignFrame`

Evento dedicado:
- `ideological_axis_signal`: emitido no resultado do quiz com eixo dominante e score.

## Criterios de qualidade

- Primeira interacao em ate 15s.
- Loop completo em ate 2min para jogos quick.
- Resultado compartilhavel sem personalismo.
- CTA final direcionando para acao coletiva local.

## Scorecard de grude (Tijolo 26)

Para priorizar linha quick sem achismo, usar score composto (0-100):

- completionRate: 30%
- replayRate: 20%
- shareRate: 20%
- CTA pos-jogo: 15%
- share page -> play click: 10%
- first interaction score (tempo menor = nota maior): 5%

Regras de leitura:

- nunca tratar ranking como verdade absoluta com amostra baixa
- exibir warning quando quick < 12 sessoes
- experimento QR so vira sinal direcional com amostra minima por variante

Saidas esperadas no `/estado` e nos relatórios operacionais:

- ranking por quick
- ranking por serie
- ranking por territorio
- eixo politico lider
- serie mais promissora para evolucao de formato medio

## Nao fazer

- Transformar o jogo em panfleto sem escolha real.
- Depender de figura individual para fechar narrativa.
- Esconder conflito de classe em copy neutra.
