# Estado da Nacao - Tijolo 24

Data: 2026-03-06 23:28
Status: concluido

## Diagnostico do estado anterior

Entrada (apos Tijolo 23):
- Avatar V2 ja operacional e reconhecivel.
- Card final universal ja com QR, mas ainda sem experimento A/B formal.
- Apenas 1 quick game real (`custo-de-viver`), sem comparacao quick vs quick.
- Tracking de QR/avatar/quick ativo, mas leitura quick por serie e territorio ainda parcial.
- `/estado` com sinais gerais, sem secao dedicada para comparar linha quick.

Lacunas identificadas no inicio:
- Falta de segundo quick para validar se o throughput nao depende de um unico jogo.
- Falta de experimento controlado com/sem QR no card final.
- Falta de leitura operacional consolidada para quick line em snapshot/export/circulation report.

## Segundo quick game criado

Novo minigame quick real:
- slug: `quem-paga-a-conta`
- engine: quiz
- tempo: 1-2 min
- perfil: quick, rejogavel, compartilhavel
- contraste editorial com `custo-de-viver`:
  - `custo-de-viver`: custo real de sobreviver (economia domestica)
  - `quem-paga-a-conta`: responsabilidade por servicos essenciais (governanca/direitos)

Arquivos principais:
- `lib/games/quiz/data/quem-paga-a-conta.ts`
- `lib/games/quiz/registry.ts`
- `lib/games/quiz/types.ts`
- `lib/games/quiz/engine.ts`
- `lib/games/catalog.ts`

## Experimento A/B de QR ativado

Experimento implementado:
- chave: `final-card-qr-code`
- variante A: `with-qr`
- variante B: `without-qr`
- superficie: `share/final-card-qr`

Integracoes:
- Registro de experimento em `lib/experiments/registry.ts`.
- `SharePageClient` resolve variante e controla `showQR` no card final.
- `ResultCard` e `FinalShareCard` aceitam renderizacao com/sem QR.
- Copy do card final ajustada para manter clareza nas duas variantes.

Tracking coberto:
- `final_card_view`
- `final_card_download`
- `final_card_share_click`
- `final_card_qr_view` (somente quando QR visivel)
- `final_card_qr_click`
- variante servida via payload de `experiments` da sessao

## Melhorias em /estado

Evolucoes aplicadas:
- Secao dedicada de "Linha Quick: Throughput e Comparacao".
- Comparacao entre quick games ativos com:
  - acessos
  - conclusoes
  - taxa de conclusao
  - shares
  - share por conclusao
- Sinais globais da linha quick na janela:
  - replay events
  - QR views
  - QR clicks
  - QR CTR

Observacao de leitura:
- Mantido sinal global para replay/QR na secao quick para evitar falsa granularidade por slug dentro do cockpit atual.

## Leitura por serie e territorio adicionada

Camada SQL e operacional ampliada:
- `supabase/tijolo-24-quick-line-validation.sql` com views:
  - `beta_quick_games_overview`
  - `beta_quick_throughput`
  - `beta_qr_experiment_overview`
  - `beta_tijolo_23_24_events`

Automacao/snapshots/exports:
- `tools/circulation-utils.js`: parsing de metadata do catalogo + agregacao quick line.
- `tools/beta-snapshot.js`: resumo quick vs quick, QR A/B, serie/territorio quick.
- `tools/beta-export.js`: export estruturado com `quickInsights` e `qrExperimentSummary`.
- `tools/beta-circulation-report.js`: relatorio com bloco quick e resumo de QR experiment.

## Documentacao atualizada

Arquivos atualizados:
- `README.md`
- `docs/arquitetura.md`
- `docs/roadmap.md`
- `docs/tijolos.md`
- `docs/linha-de-jogos-campanha.md`
- `docs/avatar-oficial-alexandre-fonseca.md`

## Validacao tecnica

Comandos executados:
- `npm run lint` -> OK
- `npm run type-check` -> OK
- `npm run test:unit` -> OK (15/15)
- `npm run build` -> OK
- `npm run verify` -> OK (52/52)
- `npm run test:e2e` -> OK (15 passed)
- `npm run beta:snapshot -- --format=json` -> OK
- `npm run beta:export` -> OK
- `npm run beta:circulation-report -- --format=json` -> OK

Observacoes:
- Warnings de Sentry/Next ja existentes, sem bloquear build ou testes.

## Riscos restantes

- Amostra do experimento `final-card-qr-code` ainda baixa para decisao forte.
- Parte da leitura quick no cockpit continua com sinais globais (nao totalmente por slug para todos os eventos).
- Views SQL novas precisam aplicacao remota para leitura completa em producao.

## Proximos passos recomendados (Tijolo 25)

1. Consolidar amostra minima por variante do experimento QR.
2. Aumentar granularidade por slug para replay/QR no cockpit.
3. Incluir terceiro quick game para triangulacao de throughput.
4. Avancar pacote full-body do avatar V2 com poses reutilizaveis.

## Resumo explicito solicitado

1. segundo quick real criado:
- sim. `quem-paga-a-conta` criado, integrado e operacional.

2. experimento real com/sem QR ativado:
- sim. experimento `final-card-qr-code` ativo com `with-qr` e `without-qr`.

3. leitura real por serie/territorio melhorada:
- sim. ampliada em `/estado`, snapshot/export/report e SQL operacional quick.

4. o que ainda fica para o Tijolo 25:
- consolidar amostra de QR A/B, elevar granularidade por slug, adicionar 3o quick e avancar full-body do avatar.
