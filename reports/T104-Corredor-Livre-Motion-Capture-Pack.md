# T104 — Corredor Livre Motion Capture Pack (GIFs + Gameplay Clip)

## Diagnosis
A vitrine publica do Corredor Livre estava forte em stills e copy (T103), mas ainda incompleta para um flagship platformer: faltava prova de movimento. O gap principal era mostrar prazer de controle, verticalidade e ritmo em assets curtos, limpos e reais de runtime.

Este ciclo fechou esse gap sem tocar em mecanica, sem lore extra e sem captura fake.

## Files to create/change
Criados:
- `app/games/corredor-livre/play/page.tsx`
- `tools/t104-motion-capture.mjs`
- `public/showcase/corredor-livre/motion/gif-01-opening-run.gif`
- `public/showcase/corredor-livre/motion/gif-02-wall-kick-vertical.gif`
- `public/showcase/corredor-livre/motion/gif-03-fragile-hazard-pass.gif`
- `public/showcase/corredor-livre/motion/corredor-livre-official-clip-01.webm`
- `reports/T104-Corredor-Livre-Motion-Capture-Pack.md`

Alterados:
- `app/games/corredor-livre/page.tsx`

## Capture plan
Plano executado em runtime real:
1. Expor rota jogavel dedicada em `/games/corredor-livre/play` para captura publica consistente.
2. Rodar captura automatizada com Playwright sobre canvas do jogo (sem mock, sem footage sintetico).
3. Gerar 3 loops GIF por momentos-alvo:
   - Opening Run
   - Wall-kick / Vertical Climb
   - Fragile Hazard Passage
4. Gravar clip unico oficial (webm), curto, com melhores trechos de fluxo, verticalidade e risco.
5. Publicar em caminho estavel para entry/share/social.

## Accepted motion assets
1. GIF 01 — Opening momentum / running flow
- Arquivo: `public/showcase/corredor-livre/motion/gif-01-opening-run.gif`
- Aceite: aprovado
- Motivo: leitura instantanea de velocidade e controle horizontal.

2. GIF 02 — Wall-kick sequence
- Arquivo: `public/showcase/corredor-livre/motion/gif-02-wall-kick-vertical.gif`
- Aceite: aprovado
- Motivo: mostra verticalidade e habilidade central do slice.

3. GIF 03 — Hazard / fragile passage
- Arquivo: `public/showcase/corredor-livre/motion/gif-03-fragile-hazard-pass.gif`
- Aceite: aprovado
- Motivo: evidencia tensao de plataforma fragil e tomada de decisao em movimento.

4. Clip 01 — Official short gameplay clip
- Arquivo: `public/showcase/corredor-livre/motion/corredor-livre-official-clip-01.webm`
- Duracao alvo: curta (faixa de showcase)
- Aceite: aprovado
- Motivo: comunica velocidade, subida vertical, atmosfera territorial e legibilidade de acao sem dead air longo.

## Publication updates
Publicacao concluida em path limpo:
- `public/showcase/corredor-livre/motion/`

Wiring aplicado:
- Entry page do Corredor Livre agora usa clip oficial no hero (video autoplay/loop).
- Entry page inclui os 3 GIFs no bloco de midia de "Como funciona".
- Rota jogavel publica para captura e futuras iteracoes: `/games/corredor-livre/play`.

Uso futuro (social/share):
- GIF 01 para teaser rapido.
- GIF 02 para prova de skill e verticalidade.
- GIF 03 para prova de tensao e readability.
- Clip 01 para postagem principal curta.

## Verification summary
Checagens de qualidade aplicadas:
- Captura feita em runtime real do jogo.
- Loops curtos, sem docs de branding novas e sem fake footage.
- Cada asset prioriza clareza de movimento em leitura rapida.
- Motion assets publicados em caminho publico e integrados na entry page.

Status do pack flagship apos T104:
- Poster: completo
- Stills oficiais: completo
- Storefront/entry/copy: completo
- Motion pack (GIFs + clip): completo

Conclusao:
- O pacote publico flagship do Corredor Livre esta completo apos T104.
