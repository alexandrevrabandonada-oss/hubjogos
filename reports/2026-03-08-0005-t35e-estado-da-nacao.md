# T35E - Estado da Nacao

Data: 2026-03-08 00:05
Escopo: Tarifa Zero RJ - Corredor do Povo

## Diagnostico do estado anterior

Estado de entrada confirmado a partir do T35D:
- runtime principal em `lib/games/arcade/tarifa-zero-corredor.ts` com renderizacao asset-first + fallback canvas.
- fase e evento ja possuíam badge e transicao visual curta implementada.
- variantes de apoio/mutirao/chance ja existiam, mas ainda havia entidades compostas com visual improvisado.
- final card premium estava parcialmente integrado no shell externo, com espaço para melhorar coesao e CTA.
- smoke visual/e2e dedicado ao arcade ainda nao cobria fluxo premium T35E.

Lacunas mapeadas no inicio do T35E:
1. `bloqueio-sequencia` ainda composto de duas barreiras.
2. `individualismo-cluster` ainda composto de tres itens base.
3. ajuste de coesao e hierarquia dos CTAs no final de run.
4. necessidade de smoke e2e real para desktop e mobile viewport.

## Variantes dedicadas criadas

Novos assets adicionados:
- `public/arcade/tarifa-zero/obstacles/obstacle-bloqueio-sequencia.svg`
- `public/arcade/tarifa-zero/pickups/pickup-individualismo-cluster.svg`

Objetivo atendido:
- remover composicao improvisada para entidades compostas criticas.
- reforcar legibilidade em movimento.
- manter coesao visual com linguagem da Linha D.

## Variantes integradas no runtime

Atualizacoes em `lib/games/arcade/tarifa-zero-assets.ts`:
- novas keys de asset:
  - `obstacle-bloqueio-sequencia`
  - `pickup-individualismo-cluster`
- novos paths no mapa de assets.
- versao visual atualizada para `T35E-premium-v7`.

Atualizacoes em `lib/games/arcade/tarifa-zero-corredor.ts`:
- `bloqueio-sequencia` agora tenta asset dedicado primeiro e cai para fallback composto quando necessario.
- `individualismo-cluster` agora tenta asset dedicado primeiro e cai para fallback composto quando necessario.
- fallback canvas preservado em todos os cenarios.

## Transicao de fase implementada/validada

A transicao ja existia no T35D e foi validada no T35E como parte da entrega:
- overlay curto por fase com tema ativo.
- duracao de 1500ms.
- nao interrompe fluxo de gameplay.
- mantem clareza de progressao entre `abertura`, `escalada`, `pressao` e `final`.

Referencias:
- `lib/games/arcade/tarifa-zero-corredor.ts` (`drawPhaseTransitionOverlay`, estado `phaseTransition`).

## Final premium integrado

Melhorias aplicadas em `components/games/arcade/TarifaZeroArcadeGame.tsx`:
- hierarquia de resultado refinada:
  - score total
  - fase final
  - combo pico
  - metadados visuais (incluindo tag `Premium T35E`)
- copy e heading do bloco final premium ajustados para leitura mais coesa.
- frame premium mantido integrado no contexto do resultado.

## CTA final refinado

Ajustes de fluxo e copy:
- ordem final: replay -> proximo jogo -> compartilhar resultado -> participar da campanha.
- textos reforcados para acao imediata.
- destaque visual adicional para CTA de campanha (`campaignCta`).

Arquivos:
- `components/games/arcade/TarifaZeroArcadeGame.tsx`
- `components/games/arcade/TarifaZeroArcadeGame.module.css`

## HUD/contexto de fase

Status:
- HUD de fase/evento e transicao premium já estavam robustos e foram mantidos.
- transicao e badges validados no fluxo de run durante o smoke e2e.

## Smoke visual/e2e executado

Testes e2e executados:
- `tests/e2e/arcade-smoke.spec.ts`
- `tests/e2e/tarifa-zero-t35e-premium.spec.ts`

Cobertura validada:
- jogo carrega.
- canvas renderiza.
- HUD aparece.
- player aparece.
- estabilidade com novas variantes.
- final premium renderiza e nao quebra.
- CTAs finais presentes.

Viewport real:
- desktop (1440x900)
- mobile (390x844)

Screenshots registradas:
- `reports/validation/2026-03-07-t35e-arcade-desktop.png`
- `reports/validation/2026-03-07-t35e-arcade-mobile.png`

## Estado /estado

A visibilidade de versao visual ja existia.
Com o bump para `T35E-premium-v7`, a confirmacao de integracao premium passa a aparecer automaticamente onde `visualVersion` e exibida.

## Documentacao atualizada

Arquivos atualizados:
- `README.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
- `docs/tarifa-zero-rj-art-direction.md`
- `public/arcade/tarifa-zero/README.md`

Registro incluido:
- variantes dedicadas.
- transicao entre fases validada.
- final premium e CTA refinados.
- smoke visual/e2e executado.

## Verificacao final

Comandos executados e status:
- `npm run lint` -> passou
- `npm run type-check` -> passou
- `npm run test:unit` -> passou (6 arquivos, 15 testes)
- `npm run build` -> passou
- `npm run verify` -> passou (52/52 checks)
- `npx playwright test tests/e2e/arcade-smoke.spec.ts tests/e2e/tarifa-zero-t35e-premium.spec.ts --project=chromium` -> passou (6 testes)

Observacoes:
- warnings de instrumentacao do Sentry continuam preexistentes no build.
- warning `allowedDevOrigins` no Next dev server durante e2e (nao bloqueante).

## Riscos restantes

1. O `FinalShareCard` ainda e universal; uma internalizacao completa do frame premium dentro do componente base pode ser feita no T35F se virar padrao da linha arcade.
2. Ainda existem entidades com composicao/fallback por desenho para cenarios degradados, por decisao de robustez.
3. Suite e2e do final premium inclui espera de run completa (tempo maior de CI); pode ser otimizada no proximo ciclo.

## Proximos passos recomendados (T35F)

1. Encapsular skin premium do Tarifa Zero em variante formal do `FinalShareCard` (theme prop), sem acoplamento por tela.
2. Criar smoke e2e rapido para final de run via fixture de estado final (reduzir tempo de execucao).
3. Revisar warnings de Sentry/instrumentation para manter pipeline limpo.
4. Expandir screenshots automatizadas com baseline visual para regressao.
