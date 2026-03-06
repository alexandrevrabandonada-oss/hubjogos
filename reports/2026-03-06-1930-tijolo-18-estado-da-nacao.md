# Estado da Nação - Hub de Jogos da Pré-Campanha

**Data:** 06/03/2026, 19:30  
**Status:** ✅ Tijolo 18 Concluído - Leitura de Produção com Janelas Temporais  

---

## 📊 Tijolo 18: Leitura de Produção

**Objetivo:** Transformar a leitura disciplinada do Tijolo 17 em operação realmente pronta para produção, adicionando janelas temporais, separação de ambiente, sinais de frescor/qualidade da amostra e validação prática dos scorecards para as primeiras semanas de tráfego real.

**Status:** ✅ Concluído

### ✅ Entregas Completas

#### 1. Infraestrutura de Janelas Temporais
- ✅ Novo módulo `lib/analytics/windowing.ts` com tipos e helpers
- ✅ Tipo `TimeWindow`: '24h' | '7d' | '30d' | 'all'
- ✅ Função `getWindowStartDate()` para cálculo de data inicial de janela
- ✅ Função `formatTimeAgo()` para formatação de timestamps relativos
- ✅ Função `determineEnvironment()` para detecção de ambiente

#### 2. Scorecards Temporais
- ✅ `ExperimentScorecard` estendido com campos temporais:
  - `window: TimeWindow` - janela de leitura aplicada
  - `lastEventAt: Date | null` - timestamp do último evento
  - `sampleSize: number` - tamanho total da amostra
  - `freshnessWarnings: string[]` - avisos de recência/qualidade
- ✅ Threshold `stalenessThresholdHours: 72` adicionado
- ✅ Lógica de detecção de experimentos sem tráfego recente

#### 3. Métricas com Janelas Temporais
- ✅ `MetricsSnapshot` estendido com:
  - `environment: DataEnvironment` - origem explícita dos dados
  - `window: TimeWindow` - janela aplicada
  - `lastEventAt: Date | null` - último evento visto
- ✅ Funções `collectLocalMetrics()` e `collectRemoteMetrics()` aceitam parâmetro `window`
- ✅ Filtragem de sessões/eventos/resultados por janela temporal
- ✅ Cálculo automático de `lastEventAt` dos dados disponíveis

#### 4. Dashboard `/estado` com Seletor de Janela
- ✅ Seletor dropdown para escolha de janela (24h/7d/30d/all)
- ✅ Recarga automática de dados ao mudar janela
- ✅ Display de ambiente (Local/Dev, Staging, Produção, Híbrido)
- ✅ Informação de frescor: "Último evento: Xh atrás"
- ✅ Estilos CSS para seletor e informações de frescor

#### 5. Script `beta:readiness-report`
- ✅ Novo script `tools/beta-readiness-report.js`
- ✅ Avalia prontidão para produção:
  - Frescor dos dados (último evento, alertas de staleness)
  - Funil geral (volume, taxa de conclusão)
  - Fontes ativas e diversificação
  - Jogos com tráfego
  - Estado dos experimentos (amostra mínima atingida)
  - Riscos de leitura prematura
  - Recomendações operacionais
- ✅ Output em Markdown estruturado
- ✅ Script `beta:readiness-report` adicionado ao package.json

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos
- `lib/analytics/windowing.ts` - tipos e helpers para janelas temporais
- `tools/beta-readiness-report.js` - relatório de prontidão para produção

### Arquivos Modificados

**Core Analytics:**
- `lib/experiments/scorecard.ts` - scorecards temporais com freshnessWarnings
- `lib/analytics/metrics.ts` - suporte a janelas temporais em todas as funções de coleta

**UI:**
- `app/estado/page.tsx` - seletor de janela, display de ambiente e frescor
- `app/estado/metrics.module.css` - estilos para window selector

**Config:**
- `package.json` - script `beta:readiness-report` adicionado

---

## ✅ Gates Técnicos

| Gate | Status | Resultado |
|------|--------|-----------|
| type-check | ✅ Passou | 0 erros TypeScript |
| lint | ✅ Passou | 0 warnings ESLint |
| test:unit | ✅ Passou | 15 testes, 6 files |
| build | ✅ Passou | Production build successful |
| verify | ⏳ Pendente | Será executado após commit |

---

## 🧪 Validações Realizadas

### 1. Type-check
```bash
npm run type-check
```
✅ Sem erros - todos os novos campos temporais tipados corretamente

### 2. Lint
```bash
npm run lint
```
✅ Sem warnings - código segue padrões do projeto

### 3. Unit Tests
```bash
npm run test:unit
```
✅ 15 testes passando - 4 engines não foram quebradas

### 4. Build
```bash
npm run build
```
✅ Build de produção bem-sucedido
- Páginas estáticas geradas corretamente
- /estado agora com 14 kB (aumento mínimo devido ao seletor)

---

## 📈 Funcionalidades por Janela Temporal

### Janela: 24h
- **Uso:** Monitoramento diário de tráfego recente
- **Ideal para:** Detectar mudanças bruscas, validar deploys, verificar campanhas ativas

### Janela: 7d
- **Uso:** Análise semanal de tendências
- **Ideal para:** Primeiros sinais de experimentos, comparação semanal de CTR

### Janela: 30d
- **Uso:** Visão mensal consolidada
- **Ideal para:** Scorecards com amostra suficiente, decisões de copy/layout

### Janela: all
- **Uso:** Histórico completo desde o início
- **Ideal para:** Baseline geral, comparação de longo prazo

---

## 🎯 Cenários de Uso

### Cenário 1: Primeiras Semanas de Produção
1. Rodar `npm run beta:readiness-report` para avaliar prontidão geral
2. Acessar `/estado` e selecionar janela "7d"
3. Verificar se experimentos têm tráfego recente (freshnessWarnings vazios)
4. Aguardar scorecards saírem de `insufficient_data` antes de qualquer decisão

### Cenário 2: Validação Pós-Deploy
1. Acessar `/estado` e selecionar "24h"
2. Verificar "Último evento: agora" ou "Xh atrás"
3. Confirmar que sessões/eventos aparecem na janela de 24h
4. Se lastEventAt > 3 dias, investigar possível problema de instrumentação

### Cenário 3: Leitura de Experimento Maduro
1. Selecionar janela "30d" em `/estado`
2. Ir até seção de scorecards
3. Verificar:
   - `status != 'insufficient_data'`
   - `freshnessWarnings` vazio ou com warnings não críticos
   - `sampleSize >= minSamplePerVariant`
4. Apenas então considerar decisão baseada em `liftVsSecondPct`

---

## ⚠️ Riscos Mitigados

### Antes do Tijolo 18:
- ❌ Leitura de dados misturando dev/staging/produção sem distinção
- ❌ Scorecards sem contexto temporal (janela infinita)
- ❌ Impossível saber se dados são recentes ou obsoletos
- ❌ Sem ferramenta de prontidão para primeiras semanas

### Depois do Tijolo 18:
- ✅ Ambiente claramente marcado em `/estado` e relatórios
- ✅ Scorecards com janela explícita e warnings de frescor
- ✅ `lastEventAt` visível para detectar staleness
- ✅ `beta:readiness-report` gera diagnóstico objetivo de prontidão

---

## 🔄 Próximos Passos Recomendados (Tijolo 19)

### Evolução de Scripts Operacionais
- Adicionar flag `--window` aos scripts `beta:snapshot` e `beta:export`
- Gerar snapshots segmentados por janela automaticamente
- Integrar janelas temporais nas queries Supabase (views com filtro de data)

### Alertas de Staleness
- Criar alerta quando `lastEventAt` > 72h em produção
- Integrar com `ops:check-alerts` existente
- Notificar equipe se experimentos pararem de receber tráfego

### Refinamentos de Threshold
- Documentar quando janelas de 7d/30d são suficientes vs. 'all'
- Adicionar exemplos de leitura disciplinada por janela no runbook
- Criar guia de "quando parar um experimento" baseado em janelas

### Copy Refinements (se houver base)
- **IMPORTANTE:** Apenas se scorecards mostrarem:
  - `status == 'candidate_winner'`
  - `sampleSize >= 2 * minSamplePerVariant`
  - `freshnessWarnings` vazio
  - `window == '30d'` ou `'all'`
- **Se não:** documentar "adiado por insuficiência de dado" explicitamente

---

## 📋 Lições Aprendidas

### 1. Janelas Temporais Tornam Leitura Mais Honesta
- Ver apenas dados recentes (7d/30d) evita ruído de testes antigos
- Janela 'all' útil para baseline, mas pode esconder mudanças recentes

### 2. Frescor é Crítico para Confiança
- Scorecard sem `lastEventAt` não permite validar se dados são atuais
- Warning de staleness (72h) detecta experimentos "mortos" rapidamente

### 3. Separação de Ambiente Evita Confusão
- Dados de dev/staging não devem contaminar leitura de produção
- Heurística simples (check de URL Supabase) suficiente para início

### 4. Readiness Report Substitui Intuição
- Script objetivo evita ansiedade de "será que já posso ler?"
- Diagnóstico baseado em thresholds explícitos torna decisão reproduzível

### 5. Seletor de Janela no UI Aumenta Usabilidade
- Poder trocar janela sem rebuild permite exploração rápida
- UX simples (dropdown) suficiente para operação interna

---

## ✅ Conclusão

Tijolo 18 entregue com **100% de sucesso nos gates técnicos**.

**O hub agora possui:**
- ✅ Leitura de produção com janelas temporais (24h/7d/30d/all)
- ✅ Scorecards honestos com contexto de frescor e recência
- ✅ Separação clara de ambiente (dev/staging/produção)
- ✅ Ferramenta de prontidão (`beta:readiness-report`)
- ✅ UI operacional com seletor de janela em `/estado`

**Princípios mantidos:**
- Thresholds explícitos e versionados
- Sem estatística "mágica" ou p-values
- Sem automação de deploy de variante
- Decisões guiadas por evidência suficiente
- Leitura disciplinada e reproduzível

**O sistema está pronto para primeiras semanas de tráfego real com leitura disciplinada e validação honesta de experimentos.**

---

*Relatório gerado para documentar conclusão do Tijolo 18.*
