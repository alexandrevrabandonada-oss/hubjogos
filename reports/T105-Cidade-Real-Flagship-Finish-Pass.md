# T105 — Cidade Real Flagship Finish Pass

## Diagnosis
Cidade Real já tinha saído do slider-first, mas ainda não operava como segundo showpiece público do Hub. O gap principal estava em cinco pontos:

1. Embalagem pública incompleta.
- Não havia entry page dedicada em `/games/cidade-real`.
- O catálogo ainda usava cover genérico e subtítulo abaixo do novo patamar visual.

2. Runtime ainda abaixo do nível showpiece.
- O mapa já era a superfície principal, mas faltava mais leitura de rede, foco distrital e vínculo direto entre ação do gabinete e reação visual do território.
- O jogo mostrava distritos, mas ainda não “vendia” intervenção urbana com força suficiente nos primeiros segundos.

3. Capture pack inexistente.
- Não havia still pack oficial.
- Não havia GIFs oficiais nem clip curto de gameplay.

4. Storefront treatment fraco frente ao Corredor Livre.
- Sem poster oficial.
- Sem rota pública de showcase.
- Sem mídia hierarchy de flagship na página de entrada.

5. Gate de resultado descalibrado para arco curto.
- No arco de 3 crises, a rota forte estava exigente demais para chegar ao resultado positivo.
- Isso diminuía a clareza entre “rodada boa” e “rodada apenas sobrevivente”.

## Files to create/change
Criados:
- `app/games/cidade-real/page.tsx`
- `public/showcase/cidade-real/flagship-poster.svg`
- `public/showcase/cidade-real/screenshot-01-opening-city.png`
- `public/showcase/cidade-real/screenshot-02-mid-crisis.png`
- `public/showcase/cidade-real/screenshot-03-near-collapse.png`
- `public/showcase/cidade-real/screenshot-04-intervention-recovery.png`
- `public/showcase/cidade-real/screenshot-05-final-result.png`
- `public/showcase/cidade-real/motion/gif-01-district-focus.gif`
- `public/showcase/cidade-real/motion/gif-02-crisis-escalation.gif`
- `public/showcase/cidade-real/motion/gif-03-intervention-impact.gif`
- `public/showcase/cidade-real/motion/cidade-real-official-clip-01.webm`
- `tools/t105-cidade-real-capture.mjs`
- `reports/showcase/cidade-real/official-capture-pack.md`
- `reports/T105-Cidade-Real-Flagship-Finish-Pass.md`

Alterados:
- `components/games/simulation/UrbanSimEngine.tsx`
- `components/games/simulation/UrbanSimEngine.module.css`
- `lib/games/simulation/types.ts`
- `lib/games/catalog.ts`
- `components/hub/GameCard.tsx`
- `app/page.tsx`
- `app/explorar/page.tsx`

## Visual/gamefeel pass
Pass aplicado sem abandonar o princípio de cidade como superfície principal.

### 1. Mapa com leitura sistêmica mais forte
- Adição de `civic core` central com leitura instantânea da integridade urbana média.
- Linhas de conexão entre distritos agora mostram tensão de rede e acendem mais forte quando áreas críticas entram em colapso.
- O mapa ganhou halo, scanlines e camada mais clara de “sala de comando urbana”.

### 2. Distrito como peça viva, não só card recortado
- Cada distrito agora possui skyline interno, glow próprio, sinal territorial e estágio legível (`Prosperando`, `Estável`, `Sob pressão`, `Crítico`, `Quase colapso`).
- Distritos podem ser colocados em foco pelo jogador, reforçando leitura de alvo e reduzindo sensação de painel solto.

### 3. Relação direta entre projeto e território
- Hover/seleção de projeto agora destaca distritos afetados.
- Focus em distrito prioriza visualmente projetos que de fato o atendem.
- Marcadores de projetos executados ficam visíveis no próprio distrito.

### 4. Crise e intervenção com mais espetáculo legível
- Estados críticos ganharam pulsação, flicker e presença mais dramática.
- Intervenções agora disparam `impact pulse` e sweep visível durante o ciclo de execução.
- O board inteiro entra em estado de stress e near-collapse quando a média urbana cai demais.

### 5. Resultado ajustado para o arco curto do jogo
- O threshold de resultado positivo foi recalibrado para o formato real de 3 crises.
- Isso não “facilita” artificialmente: apenas corrige um gate excessivamente alto para o tempo de rodada disponível.
- O jogo agora distingue melhor uma rota forte de uma rota apenas reativa.

## Capture pack
### Still pack oficial
1. `screenshot-01-opening-city.png`
- Estado inicial / leitura do tabuleiro e dos 4 distritos.

2. `screenshot-02-mid-crisis.png`
- Crise média já instalada, com escalada visível no board.

3. `screenshot-03-near-collapse.png`
- Pressão alta / banner crítico / sensação de cidade no limite.

4. `screenshot-04-intervention-recovery.png`
- Momento de impacto e recuperação de distrito após intervenção.

5. `screenshot-05-final-result.png`
- Estado final da rodada com resultado político explícito.

### Motion pack oficial
1. `gif-01-district-focus.gif`
- Mostra foco distrital e leitura de impacto no mapa.

2. `gif-02-crisis-escalation.gif`
- Mostra o salto para estado de crise e escalada de tensão.

3. `gif-03-intervention-impact.gif`
- Mostra a execução da intervenção com recuperação visível no distrito.

4. `cidade-real-official-clip-01.webm`
- Clip curto oficial com foco, crise, intervenção e fechamento de ciclo.

### Regra de verdade
- Todos os assets foram capturados do runtime real em `/play/cidade-real`.
- Nenhum still ou motion asset foi sintetizado fora do jogo.

## Storefront updates
### 1. Poster e cover
- Cidade Real agora usa poster oficial em `public/showcase/cidade-real/flagship-poster.svg`.

### 2. Catálogo
- Cover, descrição curta, CTA e prioridade foram atualizados para o novo nível de showcase.
- `publicVisibility` foi promovido para `flagship`.
- `status` permaneceu `beta`, preservando honestidade pública como `Flagship • Public Beta`.

### 3. Card routing
- Cards de Cidade Real agora levam para `/games/cidade-real`, não direto para o shell genérico `/play/cidade-real`.

### 4. Entry page
- Nova rota dedicada em `/games/cidade-real` com:
  - hero em vídeo oficial
  - still pack + GIFs no bloco de mídia
  - trust row
  - framing político e onboarding

### 5. Superfícies do hub
- A flagship lane da home foi neutralizada para comportar múltiplos showpieces.
- O explorar ganhou CTA explícita para Cidade Real como simulação flagship.

## Final status recommendation
### Recomendação final: `FLAGSHIP`

Justificativa clínica:
- O jogo já não depende de painel abstrato como superfície principal.
- O mapa vende o conceito em poucos segundos.
- A intervenção agora produz reação visível e capturável.
- O pacote público está completo: poster, stills, motion, entry, storefront routing e labeling honesto.
- O status continua publicamente honesto porque o jogo permanece marcado como `Public Beta` no badge operacional.

Não recomendo `FLAGSHIP_CANDIDATE` porque o principal gap remanescente não é de embalagem nem de superfície visual: o pack flagship está efetivamente entregue.

## Next production recommendation
Não voltar a redesenhar a base do jogo.

Próximo passo recomendado:
1. Ajustar áudio/sonificação da crise e da recuperação para elevar gamefeel sem mexer na estrutura visual.
2. Observar distribuição real e taxa de conclusão antes de expandir conteúdo ou adicionar novos distritos.
3. Se houver novo ciclo, focar em variedade de crises e persistência visual de obras, não em trocar a linguagem principal do mapa.

## Verification summary
- Arquivos de runtime alterados sem erros de IDE.
- Entry page dedicada criada e validada sem erros.
- Poster oficial criado e referenciado no catálogo.
- Still pack oficial gerado em `public/showcase/cidade-real/`.
- Motion pack oficial gerado em `public/showcase/cidade-real/motion/`.
- Raw capture preservado em `reports/showcase/cidade-real/raw/`.
- Storefront route de Cidade Real atualizado para entry page dedicada.
- Home/explorar ajustados para refletir o segundo showpiece público.