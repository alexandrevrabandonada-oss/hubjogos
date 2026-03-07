# Estado da Nacao - Tijolo 27

Data: 2026-03-07 14:23
Status: concluido

## Diagnostico do estado anterior (entrada do Tijolo 27)

Estado de entrada (apos Tijolo 26):
- scorecard de grude implementado e operacional
- comparacao entre os 3 quick games (`custo-de-viver`, `quem-paga-a-conta`, `cidade-em-comum`)
- leitura por serie/eixo/territorio no `/estado`
- QR readout com estado (`cedo-demais`, `monitorando`, `sinal-direcional`)
- snapshot/export/circulation report com rankings e avisos de baixa amostra

Fragilidades na entrada:
- ainda sem amostra quick suficiente para ranking confiavel (conforme relatado no Tijolo 26)
- serie lider e territorio lider ainda provisorios, nao honestos
- experimento QR em monitoramento com delta 0pp e cliques zerados
- sem plano operacional claro de distribuicao e coleta
- sem criterio formal de "quando podemos decidir sobre formato medio"
- sem visibilidade de progresso em relacao a metas minimas

## Entregas do Tijolo 27

1. Plano operacional de distribuicao
Criado documento `docs/plano-distribuicao-quick.md` definindo:
- objetivo de amostra minima por janela (7d, 30d, all)
- metas minimas por quick: 60/150/200 sessoes dependendo da janela
- metas minimas por serie: 100/250/300 sessoes
- metas minimas por territorio: 80/200/250 sessoes
- metas minimas por variante QR: 60/150/200 sessoes
- ordem de distribuicao por serie (serie-solucoes-coletivas primeiro)
- ordem de distribuicao por territorio (estado-rj primeiro, depois volta-redonda)
- ordem de empurrao por quick dentro de serie-solucoes-coletivas
- regras para nao concluir cedo demais
- criterio formal de saida para Tijolo 28

2. Sistema de status de coleta
Implementado em `lib/analytics/metrics.ts` e `tools/circulation-utils.js`:
- 4 estados possiveis: `coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`
- calculo de progresso percentual por quick/serie/territorio/QR
- deteccao automatica de quando serie/territorio estao prontos para priorizacao
- targets dinamicos baseados na janela temporal (7d vs 30d vs all)

3. Report de distribuicao operacional
Criado script `tools/beta-distribution-report.js`:
- comando: `npm run beta:distribution-report --format=md`
- mostra status de coleta por quick/serie/territorio
- exibe barra de progresso visual com badges (🔴/🟡/🟢/✅)
- gera recomendacoes operacionais acionaveis: quais quicks empurrar, quais series tensionar, quais territorios precisam atencao
- indica explicitamente quando estiver "pronto para Tijolo 28"
- salvo em `reports/distribution/`

4. Melhorias no `/estado`
Novo bloco "Status de Coleta - Distribuicao Quick (Tijolo 27)" com:
- metas minimas de coleta para a janela atual
- tabela de status por quick (progresso, sessoes, starts, completions, shares, replays)
- tabela de status por serie (progresso, jogos na serie)
- tabela de status por territorio (progresso, jogos no territorio, jogo forte)
- status de experimento QR com progresso por variante
- avisos de insuficiencia sempre que aplicavel

5. Metas minimas formalizadas
Targets aplicados em 3 janelas:
- janela 7d: quick 60 sessoes, serie 100, territorio 80, QR 60/variante
- janela 30d: quick 150 sessoes, serie 250, territorio 200, QR 150/variante
- janela all: quick 200 sessoes, serie 300, territorio 250, QR 200/variante

Heuristica de status:
- < 50% da meta: `coleta-insuficiente`
- 50-99% da meta: `coleta-em-andamento`
- >= 100% da meta: `coleta-minima-atingida`
- todos os jogos da serie/territorio com meta atingida + meta agregada atingida: `pronto-para-priorizacao`

6. Integracao com infraestrutura existente
- `buildQuickLineInsights` ampliado com parametro `window` e calculo de targets dinamicos
- `collectionTargets` e `collectionStatus` adicionados ao tipo `MetricsSnapshot`
- status de coleta aplicado em quick/serie/territorio/QR
- warnings de amostra insuficiente atualizados

7. Documentacao atualizada
- `README.md`: status Tijolo 27, novo script `beta:distribution-report`
- `docs/roadmap.md`: entrada Tijolo 27, proximo ciclo Tijolo 28
- `docs/tijolos.md`: Tijolo 27 completo com objetivo, entregas e guardrails
- `docs/plano-distribuicao-quick.md`: novo documento operacional mestre

## Leitura operacional atual (dados reais)

Fonte: snapshot/distribution report gerados em 2026-03-07 17:22.

### Amostra quick (janela 7d)
- Sem sessoes quick suficientes na janela 7d para comparacao
- Status geral de quicks: sem dados

### Amostra serie (janela 7d)
- Sem dados de series quick na janela 7d

### Amostra territorio (janela 7d)
- Sem dados de territorios quick na janela 7d

### Experimento QR A/B (janela 7d)
- Status geral: `coleta-em-andamento` (🟡)
- with-qr: 47/60 sessoes (78%), 2/20 QR views (10%), 0/8 QR clicks (0%), progresso geral 29%
- without-qr: 52/60 sessoes (87%), 2/20 QR views (10%), 0/8 QR clicks (0%), progresso geral 32%

### Alertas de amostra
- "Sem sessoes quick na janela atual para comparacao entre jogos."

### Recomendacoes operacionais geradas
1. Distribuir trafego para quicks insuficientes (todos os 3)
2. Focar distribuicao na serie-solucoes-coletivas
3. Garantir exposicao balanceada do experimento QR
4. Repetir relatorio apos 7 dias para verificar progresso

## Validacao tecnica final

Comandos executados:
- `npm run lint` -> OK
- `npm run type-check` -> OK
- `npm run test:unit` -> OK (6 arquivos, 15 testes)
- `npm run build` -> OK (warnings de Sentry nao bloqueantes persistem)
- `npm run verify` -> OK (52/52 checks)
- `npm run beta:snapshot -- --format=md` -> OK
- `npm run beta:distribution-report -- --format=md` -> OK

Observacao:
- warnings de Sentry instrumentation permanecem nao bloqueantes
- todos os gates tecnicos passaram
- artefatos operacionais gerados com sucesso

## Riscos restantes

- amostra quick atual abaixo da meta minima para qualquer janela
- sem trafego organico ainda para validar plano de distribuicao
- QR experiment ainda sem cliques (CTR 0%) apesar de 78-87% da meta de sessoes na janela 7d
- decisao sobre serie lider fica condicionada a consolidar amostra na janela 7d ou 30d
- risco de overfitting se houver decisao forte antes de atingir meta minima

## Recomendacao explicita de priorizacao para Tijolo 28

### 1. Quando abrir Tijolo 28?

Criterio formal:
- aguardar pelo menos 1 quick atingir `coleta-minima-atingida` na janela 7d (60 sessoes)
- ou aguardar pelo menos 1 serie atingir `coleta-minima-atingida` na janela 7d (100 sessoes)
- ou aguardar janela 30d com pelo menos 1 quick acima de 50% da meta (75 sessoes)

Criterio atual (2026-03-07):
- nenhum quick atingiu meta minima
- nenhuma serie atingiu meta minima
- QR em `coleta-em-andamento` (47-52 sessoes na 7d, faltam 8-13 para meta)
- **Status: aguardar distribuicao ativa por 7-14 dias antes de abrir Tijolo 28**

### 2. Qual serie deve virar prioridade?

Decisao provisoria (mantida do Tijolo 26, aguardando amostra):
- priorizar `serie-solucoes-coletivas` como serie de coleta e iteracao no Tijolo 28
- justificativa: alinhamento estrategico com motor ideologico + necessidade de gerar amostra valida

Criterio de confirmacao:
- `serie-solucoes-coletivas` atingir `pronto-para-priorizacao` na janela 30d
- ou `serie-solucoes-coletivas` atingir `coleta-minima-atingida` na janela 7d com superioridade clara de grude (>10 pontos vs 2ª)

### 3. Qual quick line deve crescer primeiro?

Decisao provisoria (mantida do Tijolo 26, aguardando amostra):
- crescer primeiro linha quick de organizacao coletiva (`cidade-em-comum` + conexoes com quicks de governanca/custo)
- meta: elevar replay/share/CTA com volume minimo para validar scorecard

Criterio de confirmacao:
- `cidade-em-comum` atingir `coleta-minima-atingida` na janela 7d (60 sessoes)
- ou `cidade-em-comum` liderar grude na janela 30d com amostra >= 75 sessoes

### 4. Qual territorio deve ser tensionado primeiro?

Decisao provisoria (mantida do Tijolo 26, aguardando amostra):
- tensionar primeiro `estado-rj` (escala de distribuicao para coletar amostra)
- em paralelo, manter trilha de coleta em `volta-redonda` (controle territorial para comparar resposta local)

Criterio de confirmacao:
- `estado-rj` atingir `coleta-minima-atingida` na janela 7d (80 sessoes agregadas de quicks)
- ou `volta-redonda` atingir `coleta-minima-atingida` na janela 7d para comparacao territorial honesta

### 5. O que fica para o Tijolo 28?

Tarefas principais:
1. Executar plano de distribuicao criado no Tijolo 27:
   - semana 1-2: distribuir os 3 quicks de forma equilibrada (33% cada)
   - semana 3-4: focar 50% em serie-solucoes-coletivas, 30% em serie-trabalho-sobrevivencia, 20% restante distribuido
   - semana 5-6: equilibrar territorios (60% estado-rj, 40% volta-redonda)
   - semana 7-8: fechar QR A/B com exposicao balanceada
2. Rodar `npm run beta:distribution-report` semanalmente para verificar progresso
3. Aguardar pelo menos 1 quick/serie atingir `coleta-minima-atingida` antes de decisao de formato medio
4. Transformar serie lider em blueprint de formato medio (quando pronta)
5. Manter foco em priorizacao estrategica sem abrir auth/CMS/admin ainda

### 6. O que NÃO fazer no Tijolo 28?

- nao criar formato medio (RPG/plataforma/tycoon) antes de atingir meta minima de amostra
- nao abrir auth/CMS/admin antes de consolidar linha quick
- nao criar nova engine alem das 4 atuais
- nao concluir sobre serie/territorio lider antes de atingir meta minima
- nao interpretar QR A/B antes de atingir meta minima de sessoes/views/clicks

## Conclusao

O Tijolo 27 entregou toda a infraestrutura operacional necessaria para coletar amostra de forma disciplinada e decidir honestamente sobre a linha quick. A decisao estrategica de qual serie/quick/territorio evoluir para formato medio fica agora condicionada a:

1. Executar o plano de distribuicao criado
2. Monitorar progresso semanalmente com `beta:distribution-report`
3. Aguardar pelo menos 1 quick/serie atingir `coleta-minima-atingida` na janela adequada
4. Validar scorecard de grude com amostra minima antes de decisao final

O sistema esta pronto. Falta trafego comparavel.
