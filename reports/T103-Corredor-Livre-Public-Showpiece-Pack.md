# T103 — Corredor Livre Public Showpiece Pack + Hub Front-Door Promotion

## Diagnosis
Corredor Livre saiu do estado de candidato interno e passou para apresentacao publica de vitrine. O principal gap nao estava em mecanica: estava em embalagem publica, hierarquia de entrada, copy curta e consistencia de status.

Direcao aplicada neste ciclo:
- promover o jogo como primeiro flagship visual-first do Hub sem exagero de promessa;
- criar front-door real (entry page publica) antes do gameplay bruto;
- dar tratamento forte de card e poster no storefront;
- consolidar stills oficiais disponiveis e explicitar, com transparencia, a lacuna de GIF/clip.

## Files to create/change
Criados:
- `public/showcase/corredor-livre/flagship-poster.svg`
- `public/showcase/corredor-livre/screenshot-01-final-desktop.png`
- `public/showcase/corredor-livre/screenshot-02-final-mobile.png`
- `public/showcase/corredor-livre/screenshot-03-run-desktop.png`
- `public/showcase/corredor-livre/screenshot-04-run-mobile.png`
- `public/showcase/corredor-livre/screenshot-05-spike-gameplay.webp`
- `reports/showcase/corredor-livre/official-capture-pack.md`

Alterados:
- `lib/games/catalog.ts`
- `app/page.tsx`
- `components/hub/GameCard.tsx`
- `components/hub/GameCard.module.css`
- `app/explorar/page.tsx`
- `app/games/corredor-livre/page.tsx`
- `components/entry/GameEntryPage.tsx`
- `components/entry/GameEntryPage.module.css`

## Showcase pack
Pacote oficial atual:
- 5 screenshots publicos publicados em `public/showcase/corredor-livre/`.
- poster flagship oficial publicado em `public/showcase/corredor-livre/flagship-poster.svg`.

Estado de motion assets:
- GIFs curtos (2-3): pendente.
- clip curto de gameplay (1): pendente.

Motivo e criterio de verdade:
- o repositorio nao contem GIF/clip validos para Corredor Livre hoje;
- o pack oficial foi entregue com os melhores stills reais disponiveis;
- motion assets foram mantidos como pendencia explicita para nao fabricar material inexistente.

## Storefront updates
1. Flagship rail e home
- rail principal da home renomeado para enfatizar flagship.
- Corredor Livre mantido como flagship por visibilidade publica e prioridade.

2. Card treatment
- card ganhou thumbnail visual para jogos flagship (poster oficial).
- badge flagship permanece visivel.
- subtitulo curto foi reforcado para leitura de 1 frase.

3. Front-door promotion
- Corredor Livre agora abre por front-door em `/games/corredor-livre` a partir de card e CTA de explorar.
- fluxo "entry page primeiro, gameplay depois" consolidado.

4. Entry page upgrade
- hero com poster oficial.
- trust row + badges honestos (Flagship + Live/Public Beta).
- secao "por que importa" em toque leve.
- grid de screenshots oficiais visivel.
- CTA primario de jogo + CTA secundario para acesso direto ao arcade.

## Copy pack
Card subtitle:
- "Platformer arcade de speedrun territorial em corrida curta."

Entry-page description:
- "Um platformer arcade de speedrun territorial: cada run e curta, intensa e feita para rejogo imediato."

Share text:
- "Corredor Livre e o flagship do Hub: speedrun territorial em corrida curta. Joguei e recomendo."

Social blurb:
- "Corredor Livre abre a vitrine publica do Hub com runs curtas, forte legibilidade visual e resultado compartilhavel."

What this game is:
- "Arcade platformer de corrida territorial com foco em leitura instantanea e screenshot power."

## Status recommendation
Status publico recomendado:
- Flagship
- Tipo: Platformer / territorial speedrun
- Estado: Live (ou Public Beta quando o estado tecnico mudar)

Racional:
- o jogo sustenta vitrine visual e leitura rapida de proposta;
- o posicionamento foi mantido dentro do que ja existe hoje, sem promessa de sistema novo;
- motion pack permanece pendencia de producao para completar kit de divulgacao.

Proxima recomendacao de producao:
- executar uma sessao unica de captura runtime para fechar 2-3 GIFs + 1 clip curto e concluir o pacote showpiece 100%.

## Verification summary
Checagens realizadas:
- homepage com linguagem de flagship no rail principal;
- card de Corredor Livre com badge + thumbnail oficial;
- rota explorar com CTA para front-door;
- entry page com hook, premise, why-it-matters, trust row, media hierarchy e CTAs;
- screenshots oficiais publicados em caminho publico;
- validacao de erros TypeScript/IDE nos arquivos alterados: sem erros.

Risco residual:
- ainda faltam assets em movimento (GIF/clip) para fechar o pacote publico completo de showcase.
