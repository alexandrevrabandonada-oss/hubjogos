# Plano Operacional de Distribuição - Linha Quick

## Objetivo

Consolidar amostra mínima comparável por quick/série/território para permitir decisão honesta sobre priorização estratégica da linha quick, sem abrir novo escopo de produto antes da hora.

## Princípios operacionais

1. **Comparabilidade antes de escala**: coletar amostra mínima de todos os quicks antes de empurrar só um.
2. **Honestidade sobre insuficiência**: não concluir antes de atingir meta mínima.
3. **Disciplina temporal**: usar janelas fixas de observação (24h, 7d, 30d).
4. **Rastreabilidade**: todo tráfego deve ter origem rastreável (utm_source ou referrer).
5. **Idempotência**: repetir coleta não pode quebrar comparação anterior.

## Metas mínimas de amostra

### Por quick game (individual)

Para declarar um quick "pronto para comparação":

- **Sessões mínimas**: 60 (janela 7d) ou 150 (janela 30d)
- **Starts mínimos**: 50 (janela 7d) ou 120 (janela 30d)
- **Completions mínimas**: 15 (janela 7d) ou 40 (janela 30d)
- **Shares mínimas**: 5 (janela 7d) ou 12 (janela 30d)
- **Replays mínimos**: 3 (janela 7d) ou 8 (janela 30d)

### Por série (agregado de quicks na série)

Para declarar uma série "pronta para priorização":

- **Sessões mínimas**: 100 (janela 7d) ou 250 (janela 30d)
- **Starts mínimos**: 80 (janela 7d) ou 200 (janela 30d)
- **Completions mínimas**: 25 (janela 7d) ou 60 (janela 30d)
- **Shares mínimas**: 8 (janela 7d) ou 20 (janela 30d)

### Por território (agregado de quicks no território)

Para declarar um território "responsivo à linha quick":

- **Sessões mínimas**: 80 (janela 7d) ou 200 (janela 30d)
- **Starts mínimos**: 60 (janela 7d) ou 150 (janela 30d)
- **Completions mínimas**: 20 (janela 7d) ou 50 (janela 30d)
- **Shares mínimas**: 6 (janela 7d) ou 15 (janela 30d)

### Por variante de experimento (QR A/B)

Para declarar variante "pronta para leitura":

- **Sessões mínimas por variante**: 60 (janela 7d) ou 150 (janela 30d)
- **QR views mínimas por variante**: 20 (janela 7d) ou 50 (janela 30d)
- **QR clicks mínimos por variante**: 8 (janela 7d) ou 20 (janela 30d)

## Status de coleta

Cada quick/série/território recebe um dos seguintes status:

### `coleta-insuficiente`

- Amostra atual abaixo de 50% da meta mínima.
- Não permite comparação nem priorização.
- Requer distribuição ativa.

### `coleta-em-andamento`

- Amostra entre 50% e 99% da meta mínima.
- Permite leitura preliminar, mas não decisão forte.
- Requer distribuição continuada.

### `coleta-minima-atingida`

- Amostra >= 100% da meta mínima.
- Permite comparação com outros quicks/séries/territórios no mesmo status.
- Não requer distribuição urgente.

### `pronto-para-priorizacao`

- Todos os quicks da série/território atingiram `coleta-minima-atingida`.
- Permite decisão estratégica honesta.
- Habilita Tijolo 28 (formato médio ou evolução de série).

## Janelas de observação

### Janela primária: 7 dias

- Usada para decisões operacionais rápidas.
- Permite ajustar distribuição semanalmente.
- Meta mínima: versão reduzida (60 sessões/quick, 100/série, 80/território).

### Janela secundária: 30 dias

- Usada para decisões estratégicas de médio prazo.
- Permite consolidar padrão de grude.
- Meta mínima: versão completa (150 sessões/quick, 250/série, 200/território).

### Janela de controle: 24 horas

- Usada apenas para monitoramento operacional (staleness, spike, queda).
- Não usada para decisão de priorização.

### Janela histórica: all

- Usada para análise de longo prazo.
- Não usada para decisão de priorização (pode ter bias temporal).

## Ordem de distribuição

### Por série (prioridade decrescente)

1. **serie-solucoes-coletivas** (alinhamento estratégico + necessidade de amostra)
2. **serie-trabalho-sobrevivencia** (volume esperado maior, mais fácil de coletar)
3. **serie-rio-de-janeiro** (escala territorial, mais fácil de coletar)
4. **serie-volta-redonda** (controle territorial, amostra local)
5. **serie-cidade-abandonada** (específico, pode ter volume menor)
6. **serie-campanha-missoes-estado** (depende de campanha ativa)

### Por território (prioridade decrescente)

1. **estado-rj** (escala de distribuição, volume maior)
2. **volta-redonda** (controle territorial, amostra local comparável)
3. **sul-fluminense** (intermediário, permite leitura regional)
4. **baixada** (quando houver jogo específico)
5. **capital** (quando houver jogo específico)

### Por quick game (ordem de empurrão)

Dentro da `serie-solucoes-coletivas` (prioridade 1):

1. **cidade-em-comum** (organização coletiva, alinhamento estratégico)
2. **quem-paga-a-conta** (governança pública, ponte com custo)
3. **custo-de-viver** (custo de vida, entrada mais direta)

## Critérios de comparação entre quicks

Usa heurística de grude (Tijolo 26):

- **completionRate**: 30%
- **replayRate**: 20%
- **shareRate**: 20%
- **postGameCtaRate**: 15%
- **sharePagePlayClicks** (reentry): 10%
- **firstInteractionScore**: 5%

### Critério de desempate

1. `stickyScore` (soma ponderada acima)
2. `completionRate`
3. `shareRate`
4. `sessions` (volume absoluto)

## Regras para não concluir cedo demais

### Regra 1: Meta mínima não atingida

- Se algum quick da comparação está em `coleta-insuficiente` ou `coleta-em-andamento`, não concluir.
- Marcar status como "aguardando amostra mínima".

### Regra 2: Assimetria de amostra

- Se o quick líder tem >= 3x mais sessões que o 2º colocado, marcar alerta "assimetria de amostra".
- Não concluir até equilibrar.

### Regra 3: Janela temporal insuficiente

- Janela 7d: não concluir se menos de 5 dias completos desde primeira sessão do quick mais novo.
- Janela 30d: não concluir se menos de 21 dias completos desde primeira sessão do quick mais novo.

### Regra 4: Variância alta

- Se os 3 quicks têm `stickyScore` com diferença < 10 pontos entre 1º e 3º, marcar "empate técnico".
- Aguardar mais amostra ou janela maior.

### Regra 5: Experimento QR não legível

- Se variante QR não atingiu meta mínima (60 sessões/variante na 7d ou 150 na 30d), não concluir sobre QR.
- Marcar status QR como "insuficiente para leitura".

## Plano de distribuição operacional

### Semana 1-2 (coleta inicial equilibrada)

- Empurrar os 3 quicks de forma equilibrada (33% cada).
- Meta: atingir `coleta-em-andamento` nos 3.
- Origem: `utm_source=campanha&utm_medium=teste-interno&utm_campaign=tijolo-27-coleta-inicial`.

### Semana 3-4 (foco em série líder)

- 50% série-solucoes-coletivas.
- 30% série-trabalho-sobrevivencia.
- 20% restante distribuído.
- Meta: atingir `coleta-minima-atingida` na série líder.
- Origem: `utm_source=campanha&utm_medium=distribuicao-organica&utm_campaign=tijolo-27-serie-coletiva`.

### Semana 5-6 (equilibrar territórios)

- 60% estado-rj.
- 40% volta-redonda.
- Meta: atingir `coleta-minima-atingida` em ambos os territórios.
- Origem: `utm_source=territorio&utm_medium=distribuicao-local&utm_campaign=tijolo-27-territorio`.

### Semana 7-8 (fechar QR A/B)

- Distribuir com atenção ao QR A/B (garantir exposição balanceada de variantes).
- Meta: atingir 150 sessões/variante na janela 30d.
- Origem: `utm_source=experimento&utm_medium=qr-test&utm_campaign=tijolo-27-qr-coleta`.

### Critério de saída

Quando todos os 3 quicks atingirem `coleta-minima-atingida` na janela 30d, e QR A/B tiver amostra mínima, declarar "pronto para Tijolo 28".

## Outputs esperados

### Report semanal de distribuição

- Amostra atual por quick/série/território.
- Status de coleta por quick/série/território.
- Metas atingidas / faltantes.
- Recomendação operacional para próxima semana.

### Dashboard `/estado` atualizado

- Barra de progresso de coleta por quick.
- Status de coleta por série.
- Status de coleta por território.
- Alerta quando quick está sem amostra mínima.
- Alerta quando QR A/B ainda não pode ser lido.

### Relatório de prontidão (Tijolo 28)

- Critério formal de "pronto para priorização".
- Lista de quicks/séries/territórios que atingiram meta.
- Recomendação explícita: qual série evoluir para formato médio.

## Riscos e mitigações

### Risco 1: Volume de tráfego insuficiente

- **Mitigação**: ajustar meta mínima para 50% da original se após 4 semanas não atingir.
- **Critério de ajuste**: se melhor quick tiver < 30 sessões na janela 7d após 4 semanas.

### Risco 2: Assimetria de distribuição

- **Mitigação**: track explícito de origem e balancear distribuição ativa.
- **Critério de intervenção**: se 1 quick tiver >= 5x mais sessões que outro.

### Risco 3: Overfitting narrativo

- **Mitigação**: não criar narrativa forte antes de `pronto-para-priorizacao`.
- **Critério de bloqueio**: se status != `pronto-para-priorizacao`, marcar "provisório e condicionado".

### Risco 4: Experimento QR sem sinal

- **Mitigação**: aceitar "sem sinal" como resultado válido se meta mínima atingida.
- **Critério de fechamento**: se CTR ~0% em ambas variantes com 150+ sessões/variante, concluir "QR não gera engagement no contexto atual".

## Próximos passos imediatos

1. Implementar status de coleta em `lib/analytics/metrics.ts`.
2. Adicionar metas mínimas em `tools/circulation-utils.js`.
3. Criar script `tools/beta-distribution-report.js`.
4. Atualizar `/estado` com barras de progresso e status.
5. Rodar coleta inicial equilibrada (semana 1-2 do plano).
6. Gerar primeiro report de distribuição.
7. Ajustar produto para empurrar `serie-solucoes-coletivas`.
8. Monitorar semanalmente e ajustar distribuição conforme plano.
