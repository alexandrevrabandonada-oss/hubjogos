# Linha de Jogos da Campanha

## Norte

O Hub de Jogos da Pre-Campanha e uma frente de engajamento politico-eleitoral que combina diversao, descoberta e compartilhamento.

## Papel politico do hub

- Traduzir conflitos publicos em decisoes jogaveis.
- Tornar visiveis estruturas de poder, orcamento e territorio.
- Incentivar leitura critica por experiencia, nao por palestra.

## Papel eleitoral do hub

- Associar a pre-campanha a uma experiencia memoravel e participativa.
- Aumentar alcance por compartilhamento de resultados.
- Converter curiosidade em conversa politica local e mobilizacao.

## Papel de diversao e compartilhamento

- Entrar rapido, decidir rapido, sentir consequencias.
- Gerar vontade de replay e comparacao entre rotas.
- Produzir resultados compartilhaveis para circular em redes.

## Escada de complexidade

1. Jogos rapidos (`quick`, 30s-2min)
- Porta de entrada para grande volume e baixa friccao.

2. Jogos medios seriados (`session`, 2-6min)
- Nucleo da estrategia atual: colecoes com continuidade.

3. Flagship games (`deep` e `future-flagship`)
- Formatos maiores para consolidar universo e retencao de longo prazo.

## Volta Redonda como laboratorio

- Validar loops de jogo, copy, compartilhamento e series.
- Testar narrativa de campanha com risco controlado.
- Medir sinais de adocao antes de ampliar producao.

## Rio de Janeiro como horizonte

- Escalonar conteudo por camadas territoriais:
  - volta-redonda
  - sul-fluminense
  - baixada
  - capital
  - estado-rj
- Criar progressao editorial local -> regional -> estadual.

## Taxonomia oficial

- Tempo de jogo: `quick`, `session`, `deep`, `future-flagship`.
- Linha editorial: denuncia, orcamento/cuidado, memoria/territorio, trabalho, mobilidade, organizacao popular, estado do RJ.
- Series:
  - Serie Volta Redonda
  - Serie Trabalho e Sobrevivencia
  - Serie Cidade Abandonada
  - Serie Rio de Janeiro
  - Serie Campanha / Missoes do Estado

## Criterios para escolher o proximo jogo

- Clareza de fantasia: a pessoa entende em 5 segundos por que quer jogar.
- Tempo de entrada: primeira acao em ate 15 segundos.
- Potencial de serie: conecta com colecao existente ou abre nova colecao relevante.
- Potencial territorial: contribui para escala rumo ao estado do RJ.
- Potencial eleitoral: reforca associacao positiva com Alexandre Fonseca sem tom panfletario duro.
- Viabilidade: escopo compativel com ciclo curto e sem nova infra (auth/CMS/admin).

## Guardrails do ciclo

- Sem implementar RPG/plataforma/tycoon completos neste tijolo.
- Sem abrir auth/CMS/admin.
- Manter as 4 engines atuais estaveis.

## Motor ideologico (Tijolo 25)

Documento mestre: `docs/motor-ideologico-dos-jogos.md`

Taxonomia aplicada no dominio:
- `politicalAxis`: mercado | reforma-estatal | poder-popular
- `collectiveSolutionType`: tarifa-zero | cooperativismo | ajuda-mutua | autogestao | controle-popular
- `commonVsMarket`: mercado | misto | comum
- `campaignFrame`: projeto-coletivo | comunidade-em-luta | defesa-dos-comuns

## Estado atual da linha quick (Tijolo 26)

- Quick games ativos para comparacao real:
  - `custo-de-viver` (economia domestica e custo real)
  - `quem-paga-a-conta` (responsabilidade por servicos essenciais)
  - `cidade-em-comum` (solucoes coletivas e poder popular)
- Todos encerram com card final universal da campanha.
- Todos participam do experimento A/B `final-card-qr-code`.

Leituras que passam a orientar crescimento:
- quick vs quick (completion/share/replay/TFI)
- performance por serie e por territorio
- QR with-qr vs without-qr para reentrada

Camada de decisao adicionada:
- scorecard de grude com heuristica explicita
- ranking por quick, serie e territorio
- lider de eixo politico e territorio responsivo destacados no `/estado`
- aviso de insuficiencia de amostra para evitar conclusao forte cedo demais

O que fica para o Tijolo 27:
- consolidar amostra minima por territorio para decisao de investimento
- transformar serie quick lider em blueprint de formato medio
- tensionar distribuicao no territorio lider sem abrir sistemas paralelos

## Atualizacao Tijolo 31 - front-stage arcade-first

Decisao aplicada na superficie publica:
- a home deve parecer primeiro um portal de jogos da campanha, e so depois uma camada editorial.
- ordem de descoberta prioriza clique imediato para jogar (arcade e quick) acima da dobra.
- a camada de campanha permanece explicita (Alexandre Fonseca para Deputado), mas sem abrir com parede de texto.

Criterios de front-stage adotados:
- CTA principal de jogo em destaque no hero.
- bloco `Jogue agora` com informacao minima de decisao (tipo, duracao, serie, territorio, CTA).
- separacao clara de duas portas de entrada:
  - quick para descoberta rapida
  - arcade para loop de acao e replay
- explorar operando como catalogo jogavel (spotlight + filtros acionaveis).

Leitura operacional associada:
- cliques above-the-fold
- CTR arcade vs quick na home
- delta de preferencia entre tipos
- sinais de uso de filtro no explorar
- sinal de interesse editorial (expansao de manifesto)

## Atualizacao Tijolo 33 - leitura de comportamento real

Regra de leitura da linha de jogos:
- metrica principal deixa de ser clique bruto e passa a ser run efetiva.

Definicoes operacionais:
- run efetiva: click de entrada seguido de start/input valido em janela curta;
- replay efetivo: clique de replay seguido de nova run;
- cross-game efetivo: clique no proximo jogo seguido de start no jogo de destino.

Como isso informa distribuicao:
- quicks e arcades com maior taxa de run efetiva sobem prioridade semanal;
- direcao quick -> arcade vs arcade -> quick passa a orientar ordem de CTA pós-run;
- sinais abaixo de amostra minima ficam em `monitoring` e nao justificam pivot estrutural.

## Atualizacao Tijolo 41 - fabrica planejada e catalogo mestre

Objetivo aplicado:
- sair de crescimento ad-hoc e operar o hub como linha editorial/produtiva.

Entregas de governanca:
- catalogo mestre consolidado em `docs/catalogo-mestre-do-hub.md`;
- temporadas e colecoes em `docs/temporadas-do-hub.md`;
- matriz de priorizacao em `docs/matriz-priorizacao-jogos.md`;
- regra de capacidade da fabrica em `docs/governanca-da-fabrica-de-jogos.md`.

Shortlist oficial para proxima leva (sem abrir implementacao neste tijolo):
1. `cooperativa-na-pressao` (candidato priorizado para T42);
2. `bairro-resiste` (pre-producao ativa);
3. `orcamento-do-comum` (backlog frio).

Guardrail reforcado:
- no maximo 1 jogo em validacao forte;
- no maximo 1 jogo em implementacao ativa;
- 1-2 em pre-producao;
- restante em backlog frio.

## Atualizacao Tijolo 43 - proxima leva organizada com diversidade

Direcao aplicada:
- crescer como portfolio vivo, nao como lista caotica;
- manter o foco no ciclo ativo (`cooperativa-na-pressao`) sem abrir nova implementacao;
- amadurecer a proxima leva com contraste real de fantasia/loop/territorio.

Pacote de pre-producao entregue:
1. `bairro-resiste` (territorial/defesa) em pre-producao forte com concept + systems + art.
2. `orcamento-do-comum` (gestao/coletivizacao) em backlog frio maduro com concept + systems + art.
3. `rj-do-comum` como terceiro conceito estadual para horizonte de medio prazo.

Governanca e subida:
- matriz de diversidade criada em `docs/matriz-diversidade-do-hub.md`.
- plano de subida da proxima leva definido em `docs/plano-de-subida-da-proxima-leva.md`.
- prioridade de subida apos T42B: `bairro-resiste`, condicionada a estabilidade e capacidade.

T43 nao inclui:
- novo jogo em codigo;
- abertura automatica de formato medio;
- premium pass de arte/audio para `cooperativa-na-pressao`.
