# Plano de Distribuição por Efetividade (Tijolo 34)

**Propósito do documento:** orientar a distribuição semanal de campanha com base em sinais de **run real** (`effective_run_start`, `effective_replay`, e `effective_cross_game_start`), sem expandir escopo de produto antes de consolidar massa crítica de dados.

---

## Contexto e motivação

No **Tijolo 33**, implementamos a camada de efetividade para separar cliques de vaidade de comportamento real:
- **Clique de preview** não garante que o jogo rode.
- **Replay click** não garante que o replay de fato aconteça.
- **Next-game click** não garante que o próximo jogo comece.

Agora, no **Tijolo 34**, transformamos esses eventos em **orientação operacional de campanha** para responder de forma objetiva:
- **Qual jogo empurrar primeiro?**
- **Qual canal funciona melhor?**
- **Qual território gera mais run real?**
- **Quando é seguro interpretar sinal de direção quick vs arcade?**

---

## Princípios operacionais

1. **Guiado por efetividade real**, não por cliques de vaidade.
2. **Regra explícita de não-pivot** quando scorecards estão em `insufficient_data`.
3. **Priorizar consolidação de amostra 7–14 dias** antes de decisão de formato.
4. **Distribuição acionável por jogo/canal/território**, sem abrir novo escopo de produto.
5. **Observabilidade em tempo real** via `/estado` + reports de distribuição semanal.

---

## Scorecards de efetividade

Cada scorecard tem 4 estados de maturidade:

| Status                  | Comportamento esperado                                   |
|-------------------------|----------------------------------------------------------|
| `insufficient_data`     | Não interpretar ainda; continuar coleta sem pivot        |
| `monitoring`            | Sinal emergente; observar 7 dias adicionais              |
| `directional_signal`    | Tendência confirmada; usar para decisão leve (ex: canal) |
| `useful_signal`         | Massa crítica atingida; seguro pivotar formato/narrativa |

### Scorecards ativos (Tijolo 33 + 34)

1. **Preview → play efetivo** → conversão `card_preview_interaction` para `effective_run_start`  
2. **Card click → run efetivo** → conversão `card_full_click` para `effective_run_start`  
3. **Replay efetivo** → conversão `replay_after_run_click` para `effective_replay`  
4. **Next-game start efetivo** → conversão `next_game_after_run_click` para `effective_cross_game_start`  
5. **Quick → Arcade efetivo** → conversão `quick_to_arcade_click` para `effective_cross_game_start` (tipo quick→arcade)  
6. **Arcade → Quick efetivo** → conversão `arcade_to_quick_click` para `effective_cross_game_start` (tipo arcade→quick)

---

## Fluxo semanal operacional

### 1. Executar relatório de distribuição

```bash
npm run beta:distribution-report
```

Este comando gera:
- Status de coleta por quick/série/território  
- Scorecards de efetividade  
- **Recomendação semanal acionável:**
  - Jogo de 1º push (run efetiva mais alta)
  - Jogo de 2º clique (replay efetivo mais alto)
  - Canal prioritário
  - Território promissor  
  - Direção quick↔arcade ou regra de não-ação

**Saída:** `reports/distribution/beta-distribution-YYYY-MM-DDTHH-MM-SS.md`

### 2. Gerar brief de campanha

```bash
npm run campaign:brief
```

Este comando traduz a leitura técnica de efetividade em linguagem operacional:
- **Jogo 1º push:** qual quick empurrar primeiro  
- **Jogo 2º clique:** qual quick reforçar para replay  
- **Canal prioritário:** Instagram / WhatsApp / TikTok  
- **Território prioritário:** estado-rj / volta-redonda / outros  
- **Regra de não-pivot** se scorecards estão `insufficient_data`

**Saída:** `reports/distribution/briefs/campaign-brief-YYYY-MM-DDTHH-MM-SS.md`

### 3. Executar distribuição física

1. Abrir pacote correspondente ao território da semana (ex: `reports/distribution/packages/territorio-estado-rj.md`).  
2. Usar o jogo de 1º push recomendado no brief.  
3. Postar no canal prioritário (Instagram / WhatsApp / TikTok) nos primeiros 2–3 dias.  
4. Após consumo da primeira onda, empurrar o jogo de 2º clique.  
5. Monitorar `/estado` no meio e fim da semana.

### 4. Checar cockpit em tempo real

Abrir `https://hub-jogos-pre-campanha.vercel.app/estado` para validar:
- Se o scorecard **Preview → play** saiu de `insufficient_data`  
- Top jogos por run efetiva e replay efetivo  
- Segmentação por canal e território

Se scorecards efetivos permanecerem em `insufficient_data`, **não interpretar vencedor de formato** e manter coleta.

---

## Quando **não** pivotar formato

❌ **Evite decisão de formato quick vs arcade se:**
- `previewToPlay.status === 'insufficient_data'`  
- `replayEffectiveness.status === 'insufficient_data'`  
- `crossGameEffectiveness.status === 'insufficient_data'`

✅ **Mantenha o plano de coleta atual por mais 7 dias** sem abrir novo jogo/engine/admin.

---

## Quando **sim** interpretar direção

✅ **Permitido guiar distribuição futura por efetividade se:**
- `previewToPlay.status >= 'directional_signal'` **ou**  
- `replayEffectiveness.status >= 'directional_signal'` **ou**  
- `crossGameEffectiveness.status >= 'directional_signal'`

Mesmo assim, **sem pivot de narrativa/formato antes de 7–14 dias consolidados** e validação de que a janela de tempo contém pelo menos 2 ciclos semanais distintos de distribuição.

---

## Decisões por jogo / canal / território

### Jogo de 1º push

- Usar **top 1 de run efetiva** (`effectiveRunsByGame[0].slug`)  
- Se não houver sinal, usar o quick com menor progresso de coleta.

### Jogo de 2º clique

- Usar **top 1 de replay efetivo** (`effectiveReplayByGame[0].slug`)  
- Se não houver sinal, reforçar o mesmo jogo do 1º push até gerar replay mensurável.

### Canal prioritário

- Usar **top 1 de run efetiva por canal** (`byChannel[0].channel`)  
- Se não houver sinal, distribuir equilibrado entre Instagram, WhatsApp e TikTok.

### Território prioritário

- Usar **top 1 de run efetiva por território** (`byTerritory[0].territory`)  
- Se não houver sinal, manter cobertura multi-territorial conforme plano semanal base.

### Direção quick ↔ arcade

- Se `directionWinner === 'quick_to_arcade'` e scorecard `quickToArcadeEffective.status >= 'directional_signal'`:  
  → Priorizar CTAs de progressão quick → arcade no pós-run.

- Se `directionWinner === 'arcade_to_quick'` e scorecard `arcadeToQuickEffective.status >= 'directional_signal'`:  
  → Priorizar CTAs de progressão arcade → quick no pós-run.

- Se `directionWinner === 'balanced'` ou scorecards estão `insufficient_data`:  
  → Manter sequência equilibrada quick/arcade e observar próxima janela.

---

## Exemplo de decisão semanal

```yaml
semana: 1
objetivo: consolidar amostra de run real sem expandir produto

jogo_1o_push: cidade-em-comum
  motivo: effectiveRunsByGame[0] (12/45 card clicks, 27%)

jogo_2o_clique: quem-paga-a-conta
  motivo: effectiveReplayByGame[0] (5/8 replay clicks, 63%)

canal_prioritario: whatsapp
  motivo: byChannel[0] (18/60 card clicks, 30%)

territorio_prioritario: estado-rj
  motivo: byTerritory[0] (10/40 card clicks, 25%)

direcao_quick_arcade: balanced
  motivo: scorecards em insufficient_data; nao interpretar vencedor ainda

regra_de_decisao: manter coleta 7 dias; sem pivot de formato/narrativa
```

---

## Checklist de validação antes de distribuir

- [ ] Executei `npm run beta:distribution-report`?  
- [ ] Executei `npm run campaign:brief`?  
- [ ] Li a recomendação semanal completa em `reports/distribution/beta-distribution-...md`?  
- [ ] Validei que **não** há regra de não-pivot em vigor (scorecards `insufficient_data`)?  
- [ ] Selecionei pacote de distribuição correspondente ao território da semana?  
- [ ] Defini jogo de 1º push e 2º clique com base no brief?  
- [ ] Tenho plano de checagem em `/estado` no meio e fim da semana?

---

## Arquivos relacionados

- `docs/operacao-semanal-distribuicao.md` → runbook operacional  
- `docs/plano-distribuicao-quick.md` → plano original de coleta  
- `docs/tijolos.md` → lista de tijolos da campanha  
- `README.md` → visão geral do projeto  
- `lib/analytics/effective-runs.ts` → núcleo de análise de efetividade  
- `tools/beta-distribution-report.js` → script de recomendação semanal  
- `tools/beta-campaign-brief.js` → brief operacional por efetividade  
- `app/estado/page.tsx` → cockpit em tempo real de efetividade

---

## Comandos úteis

```bash
# Gerar snapshot completo (funnel + quick + território + QR)
npm run beta:snapshot

# Exportar dados consolidados com efetividade
npm run beta:export

# Gerar relatório de circulação (CTAs, replays, next-game)
npm run beta:circulation-report

# Gerar recomendação de distribuição semanal (acionável)
npm run beta:distribution-report

# Gerar brief de campanha (linguagem operacional)
npm run campaign:brief

# Abrir cockpit operacional interno
open https://hub-jogos-pre-campanha.vercel.app/estado
```

---

## Evolução futura (após coleta 7–14 dias)

Quando scorecards atingirem `directional_signal` ou `useful_signal` de forma consistente:

1. **Experimentar variações de copy/criativo** no canal/território de melhor sinal.  
2. **Priorizar jogo/série com maior run real** no ciclo seguinte.  
3. **Validar se a direção quick↔arcade é estável** em múltiplas janelas.  
4. **Considerar formato médio (Tijolo 29)** apenas se massa crítica confirmar narrativa central.

Até lá, **manter disciplina de não-pivot** e continuar coleta de sinais efetivos sem abrir novo escopo.

---

**Última atualização:** Tijolo 34  
**Status:** ativo  
**Responsável:** produto/campanha
