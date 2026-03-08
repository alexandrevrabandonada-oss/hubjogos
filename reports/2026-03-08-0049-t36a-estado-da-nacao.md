# T36A - Estado da Nacao (Preproducao Organizada)

Data: 2026-03-08 00:49
Escopo: Pre-producao completa do proximo arcade forte, sem implementacao full do runtime novo.

## 1) Diagnostico do Momento

- `tarifa-zero-corredor` esta em estado premium estavel e validado.
- `passe-livre-nacional` segue como arcade live de linha rapida.
- O risco principal identificado era ficar em ciclo infinito de polimento do mesmo jogo, sem abrir nova frente forte de arcade.
- Para evitar regressao de navegacao/publicacao, foi validado o comportamento de listagem: o explorar prioriza itens `status: 'live'`, permitindo registrar novo jogo em modo editorial sem expor runtime incompleto.

## 2) Decisao Explicita de Rota

Rota escolhida: **A) novo arcade forte `mutirao-do-bairro`**.

Justificativa sintetica:
- Diferencia fantasia e tensao de `tarifa-zero-corredor` (que e corrida/tempo/pressao de corredor).
- Permite mecanicas politicas de cooperacao, mutuo apoio e disputa territorial com leitura rapida para mobile.
- Cria espaco para vertical slice objetivo no T36B sem inflar escopo para sistemas de medio formato.

## 3) Conceito de Jogo Entregue

Arquivo criado: `docs/mutirao-do-bairro-game-concept.md`

Conteudo principal entregue:
- Fantasia central: construir e proteger rede coletiva de bairro sob pressao adversaria.
- Pilares de gameplay: cooperacao emergente, priorizacao sob escassez, defesa do comum.
- Loop macro/micro definido, com condicao de falha e promessa de replay.
- Papel eleitoral e de campanha conectado a experiencia ludica (politica por mecanica, nao por sermao).
- Planejamento de HUD, tela final e telemetria ja apontado para implementacao posterior.

## 4) Systems Design Entregue

Arquivo criado: `docs/mutirao-do-bairro-systems-design.md`

Conteudo principal entregue:
- Objetivo de run e metrica de sucesso/derrota.
- Recursos e estados de jogo (ex.: mutirao, energia comunitaria, pressao/oposicao).
- Tipologia de entidades e eventos (bairro, demandas, sabotagens, reforcos populares).
- Acoes do jogador e trade-offs de risco/recompensa.
- Fases e progressao da partida.
- Modelo de input mobile + PC/teclado com equivalencia funcional.
- Plano de HUD e outcome screen ligado aos estados de run.
- Esquema inicial de eventos de telemetria para instrumentacao no T36B.

## 5) Art Direction Entregue

Arquivo criado: `docs/mutirao-do-bairro-art-direction.md`

Conteudo principal entregue:
- Direcao visual coerente com campanha e linguagem arcade.
- Paleta, hierarquia cromatica e semantica de feedback.
- Shape language para personagens, entidades e elementos de mapa.
- Diretrizes de HUD/FX para leitura rapida em tela pequena.
- Principios de movimento e fallback visual para manter performance/percepcao.

## 6) Pipeline de Assets Preparada (Real)

Estrutura criada:
- `public/arcade/mutirao-do-bairro/bg/`
- `public/arcade/mutirao-do-bairro/player/`
- `public/arcade/mutirao-do-bairro/entities/`
- `public/arcade/mutirao-do-bairro/ui/`

Guia criado:
- `public/arcade/mutirao-do-bairro/README.md`

Conteudo do guia:
- Convencao de nomes e versao de arquivos.
- Prioridade de producao (P0/P1/P2).
- Regras de fallback, pesos e formatos de entrega.
- Checklist de QA visual para integrar sem quebrar runtime.

## 7) Integracao Editorial / Catalogo (Sem Publicar Runtime)

Arquivo atualizado: `lib/games/catalog.ts`

- Novo item `mutirao-do-bairro` registrado como:
  - `status: 'coming'`
  - `runtimeState: 'shell'`
- Objetivo: permitir preparacao editorial e de discoverability sem anunciar como jogavel completo.

## 8) Atualizacoes de Documentacao Estrutural

Arquivos atualizados:
- `README.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
- `docs/linha-arcade-da-campanha.md`

Resultado:
- T36A fica registrado como concluido no plano macro.
- T36B fica enquadrado como vertical slice de implementacao focada.

## 9) Verificacao Tecnica

Gates obrigatorios executados e aprovados:
- `npm run lint` -> PASS
- `npm run type-check` -> PASS
- `npm run test:unit` -> PASS (`6` files, `15` tests)
- `npm run build` -> PASS
- `npm run verify` -> PASS (`52/52` checks)

Gate opcional executado e aprovado:
- `npm run test:e2e` -> PASS (`21/21`)

Conclusao tecnica: nenhuma regressao funcional detectada no estado atual do projeto.

## 10) O que Entra no T36B (Vertical Slice)

Entra:
- Runtime jogavel minimo de `mutirao-do-bairro` com 1 loop completo de partida.
- Cena principal com mapa-base, spawn de eventos essenciais e condicao de vitoria/derrota.
- Input mobile + teclado funcionando no mesmo design de acao.
- HUD funcional minima (recursos, risco, progresso da run).
- Tela final com outcome e CTA de continuidade.
- Telemetria baseline dos eventos criticos da run.
- Integracao de assets P0 usando pipeline ja preparado.

Nao entra:
- Sistema de meta-progresso profundo.
- Multiplicidade de mapas/biomas.
- Modo historia extenso.
- Ferramentas de admin/CMS/autoria de conteudo.
- Refactor amplo fora do necessario para o slice.

## 11) Riscos e Mitigacoes

- Risco: crescimento de escopo por tentar "fechar jogo inteiro" no T36B.
  - Mitigacao: travar backlog do T36B em slice unico com criterios objetivos de pronto.
- Risco: desalinhamento de arte e legibilidade mobile.
  - Mitigacao: validar assets P0 no device real com checklist do pipeline.
- Risco: baixa signalizacao de impacto politico no gameplay.
  - Mitigacao: garantir que recompensa/punicao reflita cooperacao coletiva em cada loop.

## 12) Estado Final do T36A

T36A concluido com pre-producao organizada, integracao editorial segura, pipeline pronta e base tecnica verde.

A frente `mutirao-do-bairro` esta oficialmente pronta para entrar em implementacao vertical no T36B.
