# Estado da Nacao - Tijolo 25

Data: 2026-03-06 23:55
Status: concluido

## Objetivo do ciclo

Implementar o primeiro motor ideologico dos jogos com foco em leitura coletiva, integrar taxonomia politica no dominio, adicionar o 3o quick game e atualizar instrumentacao/ops para leitura por eixo politico.

## Entregas principais

1. Motor ideologico formalizado
- Novo documento: `docs/motor-ideologico-dos-jogos.md`.
- Regras de desenho: conflito concreto -> escolha jogavel -> resultado acionavel -> CTA de organizacao.

2. Taxonomia ideologica integrada no catalogo
- `lib/games/catalog.ts` agora inclui:
- `politicalAxis`
- `collectiveSolutionType`
- `commonVsMarket`
- `campaignFrame`
- Nova serie: `serie-solucoes-coletivas`.

3. Novo quick game (3o da linha)
- `cidade-em-comum` integrado ao runtime real de quiz.
- Arquivo: `lib/games/quiz/data/cidade-em-comum.ts`.
- Registro: `lib/games/quiz/registry.ts`.
- Ajuste de engine: selecao de perfil por faixa de score para quizzes de eixo unico.

4. Outcomes e narrativa sem personalismo
- `lib/games/ctas.ts` com copy orientada a organizacao coletiva.
- CTAs de saida reforcam acao territorial e comparacao de rotas.

5. Instrumentacao ideologica
- `lib/analytics/track.ts` passou a anexar metadata ideologica base em todos os eventos.
- Novo evento: `ideological_axis_signal`.
- Evento disparado no quiz outcome: `components/games/quiz/QuizEngine.tsx`.

6. Leitura em /estado
- `app/estado/page.tsx` ganhou bloco ideologico com:
- conversao por eixo politico
- sinais por solucao coletiva
- leitura comum vs mercado
- contagem de `ideological_axis_signal`

7. Snapshot/export/report com recorte ideologico
- `tools/circulation-utils.js`: parser de taxonomia e agregacoes `byPoliticalAxis`/`byCommonVsMarket`.
- `tools/beta-snapshot.js` e `tools/beta-circulation-report.js`: secoes ideologicas da linha quick.
- SQL de apoio: `supabase/tijolo-25-motor-ideologico.sql`.

8. Home/Explorar/Play refinados
- `app/page.tsx`, `app/explorar/page.tsx`, `app/play/[slug]/page.tsx` exibem recortes ideologicos e linguagem de projeto coletivo.

## Validacao tecnica

Comandos executados:
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- `npm run build`
- `npm run verify`
- `npm run beta:snapshot`
- `npm run beta:export`
- `npm run beta:circulation-report`

Resultado:
- Lint: OK
- Type-check: OK
- Unit tests: 6 arquivos, 15 testes, todos OK
- Build: OK
- Verify: 52 checks, 100% OK
- Snapshot/export/report: gerados com as novas secoes ideologicas

Observacao:
- Persistem avisos conhecidos do Sentry/Next instrumentation no build (nao bloqueantes deste tijolo).

## Riscos e proximos passos

1. Amostra quick ainda baixa em dados remotos para leitura forte de lift.
2. Experimento QR segue em fase de coleta, sem amostra minima por variante.
3. Tijolo 26 recomendado:
- consolidar amostra por eixo/territorio
- priorizar serie mais grudenta (replay/share)
- aprofundar camada visual territorial
