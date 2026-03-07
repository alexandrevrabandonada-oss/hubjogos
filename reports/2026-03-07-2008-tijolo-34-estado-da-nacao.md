# Estado da Nação - Tijolo 34: Efetividade em Operação de Campanha

**Timestamp:** 2026-03-07T20:08  
**Fase:** Tijolo 34 concluído  
**Objetivo cumprido:** transformar efetividade em distribuição operacional acionável por jogo/canal/território sem abrir novo escopo de produto

---

## ✅ Resumo Executivo

O **Tijolo 34** consolida a camada de efetividade (Tijolo 33) em **operação prática de campanha**. Em vez de "cliques de vaidade", agora orientamos distribuição semanal com base em:

1. **Qual jogo empurrar primeiro?** → top de run efetiva  
2. **Qual canal usar?** → top de run efetiva por canal  
3. **Qual território priorizar?** → top de run efetiva por território  
4. **Quando pivotar formato quick vs arcade?** → apenas se scorecards atingirem `directional_signal` ou `useful_signal`

**Guardrail central do tijolo:** **sem abrir novo jogo/engine/CMS/auth/admin** antes de consolidar 7–14 dias de coleta com efetividade real.

---

## 🎯 Objetivo do Tijolo 34

Transformar sinais de run real em **decisões operacionais objetivas** de campanha sem expandir escopo de produto.

### O que o Tijolo 34 entrega

- Segmentação de efetividade por **canal** (`utm_source`) e **território** (derivado do slug).
- Recomendação semanal acionável em `tools/beta-distribution-report.js`:
  - Jogo de 1º push (maior run efetiva).
  - Jogo de 2º clique (maior replay efetivo).
  - Canal prioritário.
  - Território promissor.
  - Direção quick ↔ arcade **ou regra explícita de não-pivot** quando amostra é insuficiente.
- Brief operacional em `tools/beta-campaign-brief.js` com linguagem de campanha (sem jargão técnico).
- Dashboard `/estado` com blocos novos:
  - "Run efetiva por canal"
  - "Run efetiva por território"
- Novo plano: `docs/plano-distribuicao-por-efetividade.md`.
- Atualização completa de `README.md`, `docs/tijolos.md`, `docs/roadmap.md`.

---

## 📦 Entregas Técnicas

### 1. Segmentação de efetividade por canal e território

#### Arquivos modificados

**`lib/analytics/effective-runs.ts`:**  
- Interface `EffectiveSegmentRow` para representar segmentação genérica com `key`, `label`, métricas de run/replay/cross efetivo, e status de maturidade.
- Interface `EffectiveRunsAnalysisOptions` para contexto de sessão (`sessionId`, `slug`, `utmSource`).
- Ampliação de `EffectiveRunsSummary` com:
  - `topEffectiveRunsByGame`
  - `topEffectiveReplayByGame`
  - `crossGameBridges`
  - `byChannel` (segmentação por `utm_source`)
  - `byTerritory` (segmentação por territory scope do jogo)
  - `direction` (quick→arcade vs arcade→quick)
  - `directionWinner` (`quick_to_arcade` | `arcade_to_quick` | `balanced`)
- Helpers de normalização: `normalizeChannel(utmSource, referrer)` e `normalizeTerritory(territoryScope)`.
- Análise efetiva agora recebe `options` com sessões e mapeamento de território por slug.
- Incremento de métricas efetivas por canal/território durante a análise.

**`lib/analytics/metrics.ts`:**  
- Chamada de `analyzeEffectiveRuns` ajustada para passar contexto:
  - `sessions` (lista completa com `sessionId`, `slug`, `utm_source`)
  - `territoryBySlug` (mapa derivado do catálogo de jogos)
- Aplicado tanto no fluxo local (localStorage) quanto remoto (Supabase).

**`tools/effective-runs-utils.js`:**  
- Conversão de tipagem TypeScript para JavaScript reutilizável nos scripts operacionais.
- Normalização de canal e território importados de `effective-runs.ts`.
- Incremento de métricas efetivas segmentadas.
- Output ampliado com `byChannel` e `byTerritory` no retorno de `analyzeEffectiveRuns`.

**`tools/beta-export.js` e `tools/beta-snapshot.js`:**  
- Chamadas para análise efetiva agora passam:
  - `sessions` completas (com sessão/slug/UTM).
  - `territoryBySlug` derivado do catálogo.
- Mudança aplicada tanto no fluxo remoto quanto local.

---

### 2. Reports operacionais acionáveis

#### `tools/beta-distribution-report.js`

**Mudanças principais:**

- Seção **"O que distribuir esta semana"** reescrita para:
  - Recomendar **jogo de 1º push** com base no top de `effectiveRunsByGame`.
  - Recomendar **jogo de 2º clique** com base no top de `topEffectiveReplayByGame`.
  - Recomendar **direção quick ↔ arcade** com base em bridges efetivos.
  - Detectar **canal prioritário** com base em `byChannel`.
  - Detectar **território prioritário** com base em `byTerritory`.
  - **Regra explícita de não-pivot:** se todos os scorecards (`previewToPlay`, `replayEffectiveness`, `crossGameEffectiveness`) estão em `insufficient_data`, exibe mensagem clara de "sem base para pivot de formato; manter coleta por mais 7 dias."

- Seção **"Recomendações operacionais"** reescrita:
  - Prioriza aumento de `effective_run_start` e `effective_replay`.
  - Recomenda distribuição concentrada (60% no top jogo, 40% no segundo).
  - Recomenda canal específico se houver sinal claro.
  - Recomenda território específico se houver sinal.
  - **Alertas de não-interpretação de vencedor formato** quando amostra é insuficiente.

- JSON de output ampliado com:
  - `topEffectiveReplayByGame`
  - `byChannel`
  - `byTerritory`

**Saída:** `reports/distribution/beta-distribution-YYYY-MM-DDTHH-MM-SS.md`

---

#### `tools/beta-campaign-brief.js`

**Mudanças principais:**

- Função `gerarRecomendacao` refatorada para priorizar **decisão operacional por efetividade**:
  - **Jogo de 1º push:** top de `topEffectiveRunsByGame[0]` ou fallback para regra de coleta.
  - **Jogo de 2º clique:** top de `topEffectiveReplayByGame[0]` ou fallback para reforçar 1º push.
  - **Canal prioritário:** top de `byChannel[0]` ou distribuição equilibrada.
  - **Território promissor:** top de `byTerritory[0]` se houver sinal.
  - **Direção promissora:** `directionWinner` apenas se scorecards >= `directional_signal`.
  - **Alertas de baixa amostra:** mensagens explícitas quando scorecards estão `insufficient_data`.

- Formato Markdown do brief agora inclui blocos:
  - "Sinais de Run Efetiva" com scorecards + top jogos + top canais + top territórios.
  - "Recomendação da Semana" com ações objetivas + alertas de amostra + próximos passos.

**Saída:** `reports/distribution/briefs/campaign-brief-YYYY-MM-DDTHH-MM-SS.md`

---

### 3. Dashboard `/estado` atualizado

**Arquivo:** `app/estado/page.tsx`

**Mudanças:**

- Extração de segmentação:
  ```tsx
  const effectiveByChannel = (effective?.byChannel || []).slice(0, 5);
  const effectiveByTerritory = (effective?.byTerritory || []).slice(0, 5);
  ```

- Blocos novos após as tabelas de run efetiva por jogo/replay/cross-game:
  - **"Run efetiva por canal":** exibe canal, card clicks, runs efetivas, taxa efetiva.
  - **"Run efetiva por território":** exibe território, card clicks, runs efetivas, taxa efetiva.

- Interface usada: `EffectiveSegmentRow` com propriedades `key`, `label`, `cardClicks`, `effectiveRuns`, `effectiveRunRate`.

**Resultado visual:** operador pode olhar `/estado` e saber de relance qual canal/território está gerando mais run real.

---

### 4. Documentação atualizada

#### Novo documento: `docs/plano-distribuicao-por-efetividade.md`

- Propósito: orientar distribuição semanal com base em run real.
- Princípios operacionais: guiado por efetividade, regra de não-pivot, consolidação de amostra 7–14 dias.
- Scorecards de efetividade com 4 estados de maturidade explicados.
- Fluxo semanal operacional passo a passo:
  1. Executar `npm run beta:distribution-report`.
  2. Gerar `npm run campaign:brief`.
  3. Distribuir fisicamente (postar no canal/território recomendado).
  4. Checar `/estado` no meio e fim da semana.
- Quando **não** pivotar formato (regra de `insufficient_data`).
- Quando **sim** interpretar direção (regra de `directional_signal`).
- Decisões por jogo/canal/território com lógica de fallback.
- Exemplo de decisão semanal em YAML.
- Checklist de validação antes de distribuir.

---

#### Atualizações em `README.md`

- **Status atual** atualizado:
  > "Tijolo 34 concluído - operação de distribuição por efetividade real ativa, guiada por run real, replay efetivo e cross-game sem expandir escopo de produto."

- Novo link em "Documento operacional":
  > `docs/plano-distribuicao-quick.md`, `docs/plano-distribuicao-por-efetividade.md`

- Seção "Run Efetiva e Distribuição Guiada (Tijolo 33 + 34)" ampliada com:
  - Segmentação por canal/território.
  - Recomendação semanal acionável.
  - Blocagem operacional por amostra insuficiente.
  - Bloco dedicado em `/estado` por canal/território.

---

#### Atualizações em `docs/tijolos.md`

- Novo **Tijolo 34** completo com:
  - Objetivo: efetividade em operação sem expandir escopo.
  - Entregues: segmentação, reports acionáveis, dashboard, plano operacional, docs.
  - Decisões operacionais acionáveis (jogo/canal/território/direção/regra de não-pivot).
  - Guardrails mantidos: sem novo jogo/engine/CMS/auth.
  - Próximo: executar rotina semanal por 14 dias + validar scorecards + retomar formato médio (Tijolo 29) apenas com massa crítica.

---

#### Atualizações em `docs/roadmap.md`

- **Próximo ciclo (Tijolo 34)** movido para **concluído**.
- Novo **Tijolo 34 (concluído)** com:
  - Objetivo cumprido: efetividade em operação de campanha acionável.
  - Entregas: segmentação, reports operacionais, dashboard, plano operacional, docs.
  - Recomendação próximo ciclo: executar distribuição semanal por 14 dias e validar massa crítica.

---

## 🧪 Validação Técnica

Todos os gates obrigatórios passaram:

```bash
npm run lint          # ✅ No warnings or errors
npm run type-check    # ✅ TypeScript OK
npm run test:unit     # ✅ 15 passed (15)
npm run build         # ✅ Build de produção OK
npm run verify        # ✅ Lint + type-check + build completo
```

**Warnings conhecidos (não bloqueantes):**

- Sentry CLI deprecations sobre `sentry.*.config.ts` (instrumentation sugerido).
- Sentry global error handler recommendation (não impacta operação).

---

## 📊 Estado Operacional

### Camada de efetividade

✅ **Implementada e integrada em toda a stack:**
- Análise TypeScript em `lib/analytics/effective-runs.ts`.
- Análise JavaScript em `tools/effective-runs-utils.js`.
- Export/snapshot com contexto de sessão e território.
- Reports operacionais acionáveis por jogo/canal/território.
- Dashboard `/estado` com segmentação visual.

### Scorecards ativos

| Scorecard                       | Definição                                      | Próximo uso                            |
|---------------------------------|------------------------------------------------|----------------------------------------|
| Preview → play efetivo          | preview interaction + start efetivo            | Validar card preview real              |
| Card click → run efetivo        | card click + start efetivo                     | Priorizar jogo de 1º push              |
| Replay efetivo                  | replay click + start efetivo                   | Priorizar jogo de 2º clique            |
| Next-game start efetivo         | next-game click + start efetivo                | Validar cross-game flow                |
| Quick → Arcade efetivo          | quick→arcade click + start efetivo             | Validar direção dominante              |
| Arcade → Quick efetivo          | arcade→quick click + start efetivo             | Validar direção inversa                |

**Status atual de maturidade:** `insufficient_data` em todos os scorecards (esperado no início da rotina de coleta).

### Regra de não-pivot ativa

❌ **Evitar decisão de formato quick vs arcade enquanto:**
- `previewToPlay.status === 'insufficient_data'`
- `replayEffectiveness.status === 'insufficient_data'`
- `crossGameEffectiveness.status === 'insufficient_data'`

✅ **Manter coleta 7 dias sem abrir novo jogo/formato/engine/admin.**

---

## 🚀 Próximos Passos Operacionais

### Imediato (próximas 48h)

1. Executar `npm run beta:distribution-report` e `npm run campaign:brief` pela primeira vez na nova janela de coleta.
2. Abrir `reports/distribution/beta-distribution-*.md` e `reports/distribution/briefs/campaign-brief-*.md`.
3. Validar que a recomendação semanal está em linguagem objetiva e acionável.
4. Distribuir fisicamente:
   - Usar jogo de 1º push recomendado.
   - Postar no canal recomendado (Instagram / WhatsApp / TikTok).
   - Focar no território recomendado nos primeiros 2–3 dias.

### Curto prazo (7 dias)

1. Checar `/estado` no meio da semana para validar sinais emergentes de run efetiva por canal/território.
2. No fim da semana, reexecutar `npm run beta:distribution-report`.
3. Validar se scorecards saíram de `insufficient_data` para `monitoring` ou `directional_signal`.
4. Ajustar distribuição da semana 2 com base nos novos sinais.

### Médio prazo (14 dias)

1. Consolidar duas janelas semanais completas de distribuição guiada por efetividade.
2. Validar massa crítica:
   - Scorecards em `directional_signal` ou `useful_signal` de forma consistente?
   - Direção quick ↔ arcade emergente confirmada em múltiplas janelas?
   - Território/canal/jogo com sinal estável?
3. Se **sim**, considerar:
   - Experimentar variação de copy/criativo no canal/território de melhor sinal.
   - Priorizar jogo/série com maior run real no ciclo seguinte.
   - Retomar formato médio (Tijolo 29) se narrativa central estiver validada.
4. Se **não**, manter coleta por mais 7 dias sem expandir escopo.

---

## 🛡️ Guardrails Mantidos

- ✅ Sem novo jogo/formato/engine/auth/CMS/admin antes de massa crítica de run real.
- ✅ Sem pivot de narrativa com scorecards em `insufficient_data`.
- ✅ Consolidação de 7–14 dias antes de decisão de formato médio.
- ✅ Operação guiada por efetividade (run real, não cliques de vaidade).
- ✅ Decisão acionável em cada ciclo semanal (jogo/canal/território).

---

## 📝 Arquivos Criados / Modificados

### Criados

- `docs/plano-distribuicao-por-efetividade.md` → plano operacional de distribuição semanal

### Modificados

- `lib/analytics/effective-runs.ts` → segmentação por canal/território, scorecards consolidados, direção dominante
- `lib/analytics/metrics.ts` → contexto de sessão e território
- `tools/effective-runs-utils.js` → segmentação operacional JS
- `tools/beta-export.js` → passa sessões e território para análise
- `tools/beta-snapshot.js` → passa sessões e território para análise
- `tools/beta-distribution-report.js` → recomendação semanal acionável por efetividade
- `tools/beta-campaign-brief.js` → brief operacional por efetividade com regra de baixa amostra
- `app/estado/page.tsx` → blocos de run efetiva por canal/território
- `README.md` → status atualizado, novos links, seção Tijolo 34
- `docs/tijolos.md` → Tijolo 34 completo com entregues e próximos passos
- `docs/roadmap.md` → Tijolo 34 concluído, recomendação de rotina semanal

---

## 🎯 Impacto do Tijolo 34

### Para a operação de campanha

✅ **Objetividade operacional:** em vez de guesswork, agora há resposta clara para "qual jogo empurrar primeiro", "qual canal usar", "qual território priorizar".

✅ **Linguagem acionável:** brief semanal em português objetivo, sem jargão técnico de analytics.

✅ **Regra de proteção:** operação não toma decisão prematura de formato enquanto scorecards estão em `insufficient_data`.

✅ **Visibilidade em tempo real:** `/estado` mostra efetividade segmentada por canal/território, permitindo ajuste fino durante a semana.

### Para a evolução do produto

✅ **Coleta guiada por comportamento real:** distribuição agora foca em aumentar `effective_run_start` e `effective_replay`, não em inflacionar cliques sem consequência.

✅ **Decisão baseada em evidência:** direção quick ↔ arcade só será interpretada quando scorecards tiverem massa crítica.

✅ **Preparação para formato médio:** apenas quando run real confirmar narrativa central de forma consistente, será seguro abrir formato médio (Tijolo 29).

✅ **Sem desperdício de escopo:** Tijolo 34 não abriu novo jogo/engine/admin/CMS; transformou efetividade em operação sem expandir produto.

---

## 📈 Métricas de Sucesso do Tijolo 34

| Métrica                                      | Status           | Observação                                     |
|----------------------------------------------|------------------|------------------------------------------------|
| Segmentação por canal implementada           | ✅ Concluído     | `byChannel` ativo                              |
| Segmentação por território implementada      | ✅ Concluído     | `byTerritory` ativo                            |
| Recomendação semanal acionável               | ✅ Concluído     | Jogo/canal/território/direção em MD objetivo   |
| Brief operacional atualizado                 | ✅ Concluído     | Linguagem de campanha, sem jargão técnico     |
| Dashboard `/estado` com blocos canal/território | ✅ Concluído  | Tabelas visuais de efetividade segmentada      |
| Plano operacional publicado                  | ✅ Concluído     | `plano-distribuicao-por-efetividade.md`        |
| Docs atualizados (README/tijolos/roadmap)    | ✅ Concluído     | Tijolo 34 documentado em todos os 3 arquivos   |
| Gate técnico completo                        | ✅ Aprovado      | lint + type-check + test:unit + build          |
| Novo jogo/engine/admin aberto?               | ✅ Não           | Guardrail mantido                              |
| Pivot de narrativa com baixa amostra?        | ✅ Não           | Regra de não-pivot implementada                |

---

## 🗂️ Estrutura de Reports Operacionais

```
reports/
├── distribution/
│   ├── beta-distribution-2026-03-07T22-07-43.md
│   ├── briefs/
│   │   └── campaign-brief-2026-03-07T22-07-44.md
│   └── packages/
│       ├── instagram-geral.md
│       ├── whatsapp-geral.md
│       ├── tiktok-geral.md
│       ├── territorio-estado-rj.md
│       └── territorio-volta-redonda.md
├── circulation/
│   └── beta-circulation-2026-03-07T22-07-41.md
├── snapshots/
│   └── beta-snapshot-2026-03-07T22-07-38.md
└── exports/
    └── beta-export-2026-03-07T22-07-40.json
```

---

## 💡 Lições do Tijolo 34

1. **Operação sem expansão de produto é possível:** segmentação de canal/território podia ser feita sem abrir novo jogo/formato/admin.
2. **Regra explícita de não-pivot é crítica:** sem ela, operação pode pivotar narrativa com 2 sessões, gerando ruído falso.
3. **Linguagem acionável > jargão técnico:** brief operacional precisa dizer "empurre X, use canal Y" em vez de "scorecard Z com status W".
4. **Dashboard em tempo real + reports semanais:** combinação ideal para operação reativa (checar `/estado` no meio da semana) e planejamento (executar reports no fim).
5. **Efetividade real é proxy de conversão de campanha:** um clique sem start efetivo não constrói engajamento real.

---

## ✅ Checklist de Entrega do Tijolo 34

- [x] Camada de efetividade segmentada por canal e território em TS/JS
- [x] Scripts operacionais atualizados (export/snapshot/distribution-report/campaign-brief)
- [x] Dashboard `/estado` com blocos de canal/território
- [x] Plano operacional `plano-distribuicao-por-efetividade.md`
- [x] Atualização de `README.md`, `docs/tijolos.md`, `docs/roadmap.md`
- [x] Gate técnico completo aprovado (lint + type-check + test:unit + build + verify)
- [x] Relatório de "Estado da Nação" gerado (`reports/YYYY-MM-DD-HHMM-tijolo-34-estado-da-nacao.md`)
- [x] Guardrails mantidos: sem novo jogo/engine/admin/CMS
- [x] Regra de não-pivot implementada e documentada
- [x] Decisões operacionais acionáveis por jogo/canal/território/direção em lugar

---

## 🔮 Fechamento

O **Tijolo 34** transforma a leitura de efetividade (Tijolo 33) em **operação real de campanha** sem expandir escopo de produto.

Agora, a rotina semanal responde de forma objetiva:
- **"Qual jogo distribuir?"** → top de run efetiva.
- **"Qual canal usar?"** → top de run efetiva por canal.
- **"Qual território priorizar?"** → top de run efetiva por território.
- **"Quando pivotar formato?"** → apenas quando scorecards atingirem massa crítica (`directional_signal` ou `useful_signal`).

**Próxima milestone:** executar 14 dias de distribuição guiada por efetividade e validar se a narrativa central se confirma com run real antes de considerar novo formato médio (retomar Tijolo 29).

**Status final do Tijolo 34:** ✅ **Concluído com sucesso.**

---

**Gerado em:** 2026-03-07T20:08  
**Assinado por:** principal engineer de produto do Hub de Jogos da Pré-Campanha
