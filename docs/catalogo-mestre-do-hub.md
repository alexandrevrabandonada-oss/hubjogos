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


---
## Atualização T52: Hub Jogos Pré-Campanha (Core e Portfólio)
* **Campanha em Tudo**: A identidade da pré-campanha de Alexandre Fonseca foi injetada via `CampaignShell` e `CampaignPortalSection`.
* **Lógica de Portfólio**: Reforçada com novos campos no catálogo (`season`, `campaignRole`, `funRole`).
* **Distinção de Linhas**: A linha "Quick" funciona como porta de entrada rápida, enquanto a linha "Arcade" consolida-se como a espinha dorsal de retenção. Jogos mais robustos e profundos figuram como horizonte estratégico.
* **Próximos Passos (Para T53)**: Expansão do portfólio com novos arcades e narrativas engajadoras, sem abrir novo art pass por enquanto, apenas crescimento sustentável sobre essa base consolidada.
---


---
## Atualização T53: Hub de Jogos como Game Studio (Readiness & Modulos)
* **Catálogo de Mecânicas**: Documentado em `docs/catalogo-de-mecanicas-arcade.md`. Mecânicas como Hotspot Pressure e Lane Runner catalogadas para reuso.
* **Matriz de Reutilização**: Utilitários de HUD, Timer (`useArcadeSession`) e Telemetry mapeados em `docs/matriz-reutilizacao-arcade.md` visando extração para *shared modules*.
* **Bairro Resiste Readiness**: Validação do status de `preproduction-strong`. Restrição explícita de subida de código até liberação de slot e P0 Asset Pack completo. Detalhes no relatório de readiness.
* **Governança Estrita**: Instituído `docs/regra-de-subida-de-jogos.md` proibindo inícios paralelos não autorizados.
* **O que fica para T54**: Início de código do `bairro-resiste` APENAS se slot for liberado; se não for, criação física dos *shared packages/modules*.
---


---
## Atualização T55: Bairro Resiste (Gate de Subida)
* **Status de Implementação**: **NO-GO [Abortado]**. O primeiro commit estrutural do `bairro-resiste` não foi autorizado e a criação do código base foi suspensa.
* **Bloqueios Identificados**: 
  1. Ausência do Inventário P0 na pasta do asset pack (`manifest.json` foi criado, porém `public/arcade/bairro-resiste/bg` e demais assets contêm placeholders inexistentes que quebram o manifesto).
  2. Slot de Produção indisponível segundo governança oficial.
* **Governança Respeitada**: Nenhum código fantasma (feature parcial baseada em canvas opaco) foi deixado no hub. O jogo se mantém rigidamente como `preproduction-strong`.
* **Próximões Passos para T56**: Finalizar merge da arte P0 na pasta `public/`, acionar script de capacidade, e somente então rodar a subida de código do slice.
---


---
## Atualização T56: Desbloqueio do Bairro Resiste
* O **Asset Pack P0** (Placeholders SVGs Mínimos) da pasta `public/arcade/bairro-resiste` agora foi populado faticamente, fechando o gap que originou o NO-GO no T55.
* O **Slot de Capacidade** teve seu estado oficialmente declarado LIVRE para a subida.
* Readiness: **GO! Autorizado para T57**.
---


---
## Atualização T57: Bairro Resiste (Primeiro Commit Estrutural)
* O Arcade **Bairro Resiste** recebeu sua fundação em `app/arcade/bairro-resiste`. A rota está funcional e blindada.
* **Shared Modules:** Implementação da `ArcadeHUDContainer` e `ArcadeProgressBar` para UI fluída sem Boilerplate.
* **Mecânicas Estruturais:** Mapa Base integrado ao Manifest P0 interagindo via `Hotspots` com Pressure System. 
* **Telemetria OOTB:** Logs puros `bairro_action_used` já funcionais.
* Próxima Parada (T58): Tuning e profundidade.
---
