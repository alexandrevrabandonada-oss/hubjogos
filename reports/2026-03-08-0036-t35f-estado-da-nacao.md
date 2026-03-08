# T35F - Estado da Nacao

Data: 2026-03-08 00:36
Escopo: Tarifa Zero RJ - Corredor do Povo (fechamento premium)
Status: concluido com gates tecnicos verdes

## Entregas concluidas

1. Audio/SFX base com politica segura
- Camada de audio adicionada em `lib/games/arcade/audio/arcade-audio.ts`.
- Mapeamento de SFX por evento em `lib/games/arcade/audio/tarifa-zero-sfx.ts`.
- Runtime com toggle de som (`Som: on/off`) no HUD + atalho `M`.
- Som so toca apos interacao do usuario (`arm` no primeiro input).

2. Juice visual final
- CTA de replay com pulso premium no final (`replayPulse`).
- Ajuste de estabilidade visual para manter testabilidade do botao.
- Correcoes de fallback em runtime para `bloqueio-sequencia` e `individualismo-cluster`.

3. FinalShareCard formal premium
- Tema formal via `theme="tarifa-zero-premium"` em `FinalShareCard`.
- Suporte a metricas de resultado no card premium.
- CTA principal/secundaria configuravel por tema.
- Integracao no final de `TarifaZeroArcadeGame` com metadados premium.

4. Fixture final rapido + smoke
- Fixture de final premium adicionada em `app/arcade/[slug]/page.tsx`:
  - `?preview=final`
  - `?fixture=final-premium`
- `TarifaZeroArcadeGame` aceita `previewFinal` e renderiza final imediato com resultado de fixture.

5. Baseline visual automatizada
- Spec atualizado para gerar baselines formais em:
  - `reports/validation/baselines/t35f-tarifa-zero-run-desktop.png`
  - `reports/validation/baselines/t35f-tarifa-zero-final-desktop.png`
  - `reports/validation/baselines/t35f-tarifa-zero-run-mobile.png`
  - `reports/validation/baselines/t35f-tarifa-zero-final-mobile.png`

6. Sentry/instrumentacao
- Adicionado `instrumentation.ts` com registro server/edge.
- Adicionado `instrumentation-client.ts` com init e `onRouterTransitionStart`.
- Adicionado `app/global-error.tsx` para captura de erros de render.
- Removido `sentry.client.config.ts` legado.
- Atualizado `tools/verify.js` para aceitar setup moderno (instrumentation-client).

7. Estado e metadados
- Catalogo alinhado para Tarifa Zero:
  - `visualVersion: T35E-premium-v7`
  - `premiumTheme: tarifa-zero-premium`
  - `audioProfile: tarifa-zero-sfx-v1`
- `/estado` exibe theme/audio na coluna visual do arcade.

8. Documentacao
- `docs/linha-arcade-da-campanha.md` atualizado com fechamento T35F.
- `docs/tarifa-zero-rj-systems-design.md` atualizado com runtime events/audio/fixture.
- `docs/tarifa-zero-rj-art-direction.md` atualizado com card premium/HUD audio/baselines.

## Validacao executada

- `npm run lint` -> ok
- `npm run type-check` -> ok
- `npm run test:unit` -> ok (15/15)
- `npm run build` -> ok
- `npx playwright test tests/e2e/tarifa-zero-t35e-premium.spec.ts` -> ok (5/5)
- `npm run verify` -> ok (100%)

## Diagnostico final

- Requisito de audio base: atendido.
- Requisito de juice final: atendido com ganhos visuais e sem regressao de controle.
- Requisito de tema premium formal reutilizavel: atendido.
- Requisito de validacao visual automatizada desktop/mobile: atendido.
- Requisito de cleanup de instrumentacao Sentry: atendido no setup App Router.

## Recomendacao

Tarifa Zero RJ esta forte o suficiente para seguir como referencia da linha arcade (quick + arcade preservadas), com fechamento premium reutilizavel e ciclo de validacao mais rapido.
Prioridade seguinte recomendada: consolidar baseline visual com comparacao automatica em CI (diff tolerante) para evitar regressao estetica silenciosa.
