# Estado da Nacao - Tijolo 21

Data: 2026-03-06 21:55
Status: concluido

## Diagnostico do estado anterior

Estado de entrada:
- Produto tecnicamente estavel e operacionalmente maduro.
- 4 engines reais funcionando.
- Home e Explorar ainda com risco de parecer "colecao de modulos" sem narrativa forte de linha.
- Presenca da pre-campanha ja existente, mas ainda irregular entre superfices.
- Taxonomia editorial e territorial incompleta para escalar de Volta Redonda para o estado do RJ.

Risco central identificado:
- Se o produto ficar correto, mas pouco divertido e pouco reconhecivel como linha da campanha, perde circulacao e conversao eleitoral.

## Linha de jogos da campanha definida

Entregas:
- Documento mestre criado: `docs/linha-de-jogos-campanha.md`.
- Escada de complexidade formalizada:
  1. quick (30s-2min)
  2. session (2-6min)
  3. deep / future-flagship
- Criterios explicitos para selecao de proximos jogos.
- Volta Redonda definida como laboratorio e RJ como horizonte de escala.

## Presenca da pre-campanha reforcada

Entregas:
- Reforco de identidade textual e estrutural em home, explorar, play, outcome e share.
- Componente reutilizavel de assinatura em uso consistente (`CampaignMark`).
- Linguagem de campanha sem transformar o produto em panfleto duro.

Mensagem-chave aplicada:
- "Hub de Jogos da Pre-Campanha de Alexandre Fonseca para Deputado"
- "Jogue, compare, compartilhe"

## Series/colecoes implementadas

Entregas:
- Camada de colecoes adicionada em Home e Explorar.
- Series aplicadas ao dominio dos jogos no catalogo:
  - Serie Volta Redonda
  - Serie Trabalho e Sobrevivencia
  - Serie Cidade Abandonada
  - Serie Rio de Janeiro
  - Serie Campanha / Missoes do Estado
- CTA "proxima experiencia da serie" integrado no outcome quando existe continuidade.

Impacto esperado:
- Melhor navegacao por bloco editorial.
- Memoria de marca mais forte.
- Maior chance de replay dentro de colecao.

## Arquitetura territorial definida

Entregas no catalogo e na experiencia:
- Metadados territoriais oficiais:
  - volta-redonda
  - sul-fluminense
  - baixada
  - capital
  - estado-rj
- Exibicao de escopo territorial nas paginas e cards.
- Base pronta para crescimento local -> regional -> estadual.

## Blueprints de formatos futuros criados

Documentos criados (sem inflar escopo de implementacao):
- `docs/formato-plataforma.md`
- `docs/formato-rpg.md`
- `docs/formato-tycoon.md`

Cada blueprint cobre:
- fantasia
- loop
- papel politico
- papel eleitoral
- fator diversao
- escopo minimo futuro
- risco de producao

## Melhorias em home/explorar/estado

### Home
- Reposicionada como vitrine de linha de jogos da campanha.
- Sessao de series da campanha.
- Sessao de escala territorial RJ.
- Escada de produto visivel (quick/session/flagship).

### Explorar
- Reforco de narrativa de campanha.
- Colecoes/series navegaveis.
- Taxonomia visivel por tempo e linha editorial.
- Secao de formatos futuros (promessa de universo, sem venda de pronto).

### Estado
- Blocos editoriais leves adicionados:
  - desempenho por serie
  - conversao por escopo territorial
  - replay proxy por tipo de jogo
- Mantida abordagem simples e acionavel, sem BI enterprise.

## Instrumentacao e metadados

Entregas:
- Taxonomia adicionada ao dominio dos jogos:
  - `pace`
  - `line`
  - `series`
  - `territoryScope`
- Novos eventos:
  - `series_click`
  - `next_series_experience_click`
- Tracking aplicado em pontos de colecao e continuidade de serie.

## Resultado dos gates

Executado com sucesso:
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run build`
- `npm run verify`
- `npm run test:e2e` (opcional)

Resumo:
- lint: ok
- type-check: ok
- unit: 15/15
- build: ok (com warnings informativos de setup Sentry)
- verify: 52/52
- e2e: 15/15

## Riscos restantes

- Filtragem por serie em Explorar ainda e leve; pode evoluir para filtros compostos (serie + territorio + pace) com URL canonica.
- Leitura de replay por tipo em `/estado` ainda usa sinal proxy; pode evoluir para metrica temporal dedicada por engine/serie.
- Warnings de Sentry no build seguem presentes (nao bloqueantes), mas geram ruido operacional.

## Proximos passos recomendados (Tijolo 22)

1. Consolidar filtros de descoberta (serie, territorio, pace) com navegacao persistente.
2. Criar um novo minigame `quick` para validar throughput de producao da linha.
3. Refinar medicao de replay por serie com janela temporal no `/estado`.
4. Executar um spike tecnico controlado para um formato maior (sem comprometer roadmap atual).
