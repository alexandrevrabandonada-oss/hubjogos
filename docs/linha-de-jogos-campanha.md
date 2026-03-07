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
