# Estado da Nacao - Tijolo 31

Data: 2026-03-07 17:24
Status: concluido

## 1) Diagnostico do estado anterior (fim do Tijolo 30)

- A linha arcade ja estava consolidada com 2 jogos reais e game feel melhorado.
- O hub ainda comunicava, na primeira dobra, mais como vitrine editorial do que como portal de jogo imediato.
- Havia espaco para aumentar cliques de entrada instantanea (home -> play/arcade), especialmente em mobile.
- A leitura em `/estado` ainda nao separava de forma explicita os sinais de front-stage da home/explorar.

## 2) Objetivo do Tijolo 31

Reposicionar a experiencia publica para parecer primeiro um portal de jogos da campanha (divertido, clicavel e imediato), mantendo presenca da campanha sem tom de panfleto duro.

## 3) Entregas de produto e UX

### Home (`/`)

- Hero refeito com CTA primaria de jogo imediato e foco arcade.
- Novo bloco `Jogue agora` acima da dobra com prioridade visual para arcades.
- Cards com metadata de decisao rapida:
  - tipo
  - duracao
  - serie
  - territorio
  - CTA
- Bloco comparativo `Quick ou Arcade?` para reduzir indecisao e capturar preferencia declarada.
- Bloco de campanha preservado com manifesto expansivel (presenca politica sem abrir com parede textual).

Arquivos principais:
- `app/page.tsx`
- `app/page.module.css`

### Explorar (`/explorar`)

- Reposicionado para catalogo jogavel:
  - spotlight arcade
  - quick strip
  - filtros por tipo/serie/territorio
  - lista filtrada de catalogo
- Reducao de friccao de descoberta para entrada de jogo em poucos cliques.

Arquivos principais:
- `app/explorar/page.tsx`
- `app/explorar/page.module.css`

### Cartoes de jogo

- `GameCard` com leitura mais direta e destaque visual de arcade.
- Metadata simplificada para escaneabilidade e decisao rapida.

Arquivos:
- `components/hub/GameCard.tsx`
- `components/hub/GameCard.module.css`

## 4) Analytics e instrumentacao front-stage

### Novos eventos adicionados

- `home_primary_play_click`
- `home_arcade_click`
- `home_quick_click`
- `home_play_now_block_click`
- `home_quick_vs_arcade_choice`
- `arcade_vs_quick_preference`
- `above_fold_game_click`
- `manifesto_expand_click`
- `explorar_arcade_click`
- `explorar_quick_click`
- `explorar_filter_change`

Arquivos:
- `lib/analytics/events.ts`
- `lib/analytics/track.ts`

## 5) Evolucao do `/estado`

Adicionado bloco dedicado `Front-stage da Home e Explorar` com leitura operacional dos sinais de descoberta/conversao:

- cliques above-the-fold
- cliques primarios da home
- cliques do bloco `Jogue agora`
- CTR arcade na home
- CTR quick na home
- delta arcade - quick
- preferencia quick-vs-arcade
- manifesto expand clicks
- series clicks
- cliques arcade/quick no explorar
- uso de filtros no explorar (proxy de exploracao)

Arquivo:
- `app/estado/page.tsx`

## 6) Documentacao atualizada

Atualizados conforme solicitado:

- `README.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
- `docs/linha-de-jogos-campanha.md`
- `docs/linha-arcade-da-campanha.md`

Resumo da atualizacao documental:
- Tijolo 31 formalizado como concluido.
- Decisao arcade-first registrada como direcao de front-stage.
- Criterios de descoberta e sinais de leitura operacional documentados.
- Proximo ciclo ajustado para Tijolo 32 com foco em otimizar conversao/replay sem inflar escopo.

## 7) Validacao tecnica executada

Resultados obtidos no ciclo:

1. `npm run lint` -> passou (sem warnings/erros).
2. `npm run type-check` -> passou.
3. `npm run test:unit` -> passou (15/15 testes).
4. `npm run build` -> passou.
5. `npm run verify` -> passou (52 checks, 52 passed).
6. `npm run test:e2e` -> passou (15 testes).

## 8) Riscos residuais

- Ainda e necessario consolidar historico de dados dos novos eventos para leitura de tendencia robusta (nao so sinal inicial).
- O ganho visual arcade-first precisa ser confirmado com serie temporal por territorio e origem.
- `manifesto_expand_click` pode variar com copy; nao usar isoladamente como metrica de interesse politico.

## 9) Decisoes de escopo mantidas

- Sem nova engine neste ciclo.
- Sem auth/CMS/admin.
- Sem abrir formato grande (RPG/plataforma/tycoon).
- Foco em conversao para jogo e leitura de evidencia front-stage.

## 10) Recomendacao para Tijolo 32

1. Iterar copy/ordem dos cards acima da dobra para aumentar CTR arcade sem matar entrada quick.
2. Refinar medicao de profundidade de exploracao (proxy adicional de scroll/engagement sem inflar stack).
3. Tensionar distribuicao por territorio/serie e verificar se os ganhos de clique viram runs/replay reais.
4. Seguir disciplina operacional com gates tecnicos e relatorio de fechamento.
