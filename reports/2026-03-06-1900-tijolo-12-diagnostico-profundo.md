# Diagnóstico Profundo: Tijolo 12 - Estado Antes da Validação Final

**Data:** 2026-03-06  
**Hora:** 19:00  
**Fase:** Diagnóstico pré-validação (Antes de gerar dados reais)

---

## 1. Resumo Executivo do Diagnóstico

| Componente | Status | Detalhes |
|-----------|--------|----------|
| Schema Supabase | ✅ Pronto | Tables criadas, RLS policies ativas |
| Views Analíticas | ✅ Pronto | 8 views criadas e funcionais |
| Scripts beta-export | ✅ Funcional | Retorna `"source": "supabase"` |
| Scripts beta-snapshot | ✅ Funcional | Retorna `"source": "supabase"` |
| /estado page | ✅ Funcional | Integrado com collectBestAvailableMetrics() |
| /estado/feedback | ✅ Funcional | Integrado com collectFeedback() |
| Fallback local | ✅ Preservado | Continua funcionando se Supabase indisponível |
| **Dados Remotos** | ❌ VAZIO | Zero sessions, zero events, zero feedback |
| Policies RLS | ⚠️ Genéricas | Muito permissivas; candidatas a hardening |

**Conclusão do Diagnóstico:** Sistema estruturalmente **100% pronto**, mas **0% validado com dados reais**.

---

## 2. Arqueologia da Implementação Atual

### 2.1 Pipeline de Leitura de Dados: `/estado`

```
┌─ /app/estado/page.tsx
│  └─ collectBestAvailableMetrics(gamesCatalog)
│     │
│     ├─ Tenta: collectRemoteMetrics() (Supabase)
│     │  ├─ Busca: beta_funnel_overview
│     │  ├─ Busca: beta_sources_overview
│     │  ├─ Busca: beta_game_overview
│     │  ├─ Busca: beta_engine_overview
│     │  ├─ Busca: beta_events_overview
│     │  └─ Busca: experiment_performance
│     │
│     └─ Fallback: collectLocalMetrics() (localStorage)
│        └─ Lê: sessions[], events[], results[] do localStorage
│
└─ Renderiza: source === 'supabase' | 'hybrid' | 'local'
```

**Atual:** Supabase chamado, retorna dados vazios → exibe 0 em tudo  
**Esperado após validação:** Supabase retorna dados reais

### 2.2 Pipeline de Leitura de Feedback: `/estado/feedback`

```
┌─ /app/estado/feedback/page.tsx
│  └─ collectFeedback()
│     │
│     ├─ Tenta: fetchFeedbackRecordsRemote()
│     │  ├─ Busca: feedback_records table
│     │  └─ Limite: 400 registros
│     │
│     ├─ Fallback: getLocalArray('feedback')
│     │
│     └─ Merge: Se ambas fontes presentes, faz merge por ID
│
└─ Renderiza: Feedback aggregation + comentários recentes
```

**Atual:** Supabase chamado, retorna vazio → exibe 0 feedback  
**Esperado após validação:** Supabase retorna feedback com ratings e comentários

### 2.3 Pipeline de Escrita de Dados: Engines (Quiz/Branching/Simulation/Map)

```
Quando usuário completa um jogo:

1. createSession() → salva em localStorage SEMPRE
   └─ Supabase atualizado async via script externo

2. recordEvent() → salva eventos locais SEMPRE
   └─ Supabase atualizado async via script externo

3. recordResult() → salva resultado SEMPRE
   └─ Supabase atualizado async via script externo

4. registerFeedback() → salva feedback local + tenta Supabase
   └─ Supabase: persistFeedbackRecordRemote()
```

**Problema:** Engines escrevem dados em localStorage, mas **não sincronizam em tempo real** com Supabase.  
**Solução:** Usaremos Playwright ou navegação manual para gerar dados, depois executarmos scripts de exportação.

### 2.4 Pipeline de Exportação/Snapshot: Scripts Operacionais

```
tools/beta-export.js
├─ Carrega .env.local ✅
├─ Conecta a Supabase.from().select()
├─ Retorna: { source: "supabase", outputPath: "...", rows: [...] }
└─ Escreve: reports/exports/beta-export-TIMESTAMP.json

tools/beta-snapshot.js
├─ Carrega .env.local ✅
├─ Conecta a Supabase.from().select() (8 views)
├─ Retorna: { source: "supabase", aggregations: {...}, overview: {...} }
└─ Escreve: reports/snapshots/beta-snapshot-TIMESTAMP.md ou .json
```

**Status:** ✅ Ambos funcionais e lendo de Supabase  
**Dados:** Todos os 10 snapshots/exports mostram `totalSessions: 0`

---

## 3. Análise de Policies RLS Atuais

### 3.1 game_sessions

```sql
-- INSERT
create policy "Allow anon insert sessions" on public.game_sessions
  for insert to anon with check (true);
  -- ⚠️ MUITO PERMISSIVO: qualquer JSON pode ser inserido

-- SELECT
create policy "Allow anon select sessions" on public.game_sessions
  for select to anon using (true);
  -- ⚠️ MUITO PERMISSIVO: lê todas as colunas incluindo UTM/referrer

-- UPDATE (não existente)
-- DELETE (não existente)
```

### 3.2 game_events

```sql
-- INSERT
create policy "Allow anon insert events" on public.game_events
  for insert to anon with check (true);
  -- ⚠️ MUITO PERMISSIVO

-- SELECT  
create policy "Allow anon select events" on public.game_events
  for select to anon using (true);
  -- ⚠️ MUITO PERMISSIVO
```

### 3.3 feedback_records

```sql
-- INSERT
create policy "Allow anon insert feedback" on public.feedback_records
  for insert to anon with check (true);
  -- ⚠️ MUITO PERMISSIVO

-- UPDATE (triage)
create policy "Allow anon update feedback triage" on public.feedback_records
  for update to anon using (true) with check (true);
  -- ⚠️ CRÍTICO: QUALQUER ANON PODE MARCAR COMO REVIEWED

-- SELECT
create policy "Allow anon select feedback" on public.feedback_records
  for select to anon using (true);
  -- ⚠️ MUITO PERMISSIVO
```

**Diagnóstico:** Policies estão totalmente abertas (design for beta público), mas triage_status pode ser abusado por bots.

---

## 4. Estrutura de Dados Remota: Estado Atual

### 4.1 game_sessions (vazia)

```
Esperado: ~10-20 filas com dados reais
Atual: 0 registros
Pronto para: Ser preenchida por navegações reais
```

### 4.2 game_events (vazia)

```
Esperado: ~100-200 eventos (10 starts, N events por sessão, etc)
Atual: 0 registros
Pronto para: Ser preenchida por navegações reais
```

### 4.3 game_results (vazia)

```
Esperado: ~2-8 resultados (1 por completed session)
Atual: 0 registros
Pronto para: Ser preenchida quando sessões completarem
```

### 4.4 feedback_records (vazia)

```
Esperado: ~3-7 feedbacks (alguns com comentários)
Atual: 0 registros
Pronto para: Ser preenchida quando usuários deixarem feedback
```

### 4.5 Views (8 agregações)

```
✅ beta_funnel_overview       → SELECT [{"total_sessions":0, "completions":0, ...}]
✅ beta_events_overview       → SELECT []  (empty, no events)
✅ beta_sources_overview      → SELECT []  (empty, no sessions)
✅ beta_game_overview         → SELECT []  (empty, no games attempted)
✅ beta_engine_overview       → SELECT []  (empty, no engines attempted)
✅ experiment_performance     → SELECT []  (empty, no experiments)
✅ feedback_summary_by_game   → SELECT []  (empty, no feedback)
✅ feedback_recent            → SELECT []  (empty, no feedback)
```

---

## 5. Testes Atuais: `npm run beta:export` e `npm run beta:snapshot`

### 5.1 Beta Export

```bash
$ npm run beta:export 2>&1

{
  "source": "supabase",
  "outputPath": "C:\\Projetos\\..."
}
```

**Conteúdo do arquivo JSON:** Vazio ou com array de 0 itens  
**Status:** ✅ Script funcional, ❌ dados vazios

### 5.2 Beta Snapshot JSON

```bash
$ npm run beta:snapshot -- --format=json

{
  "source": "supabase",
  "generatedAt": "2026-03-06T18:30:06.029Z",
  "overview": {
    "totalSessions": 0,
    "totalStarts": 0,
    "completedSessions": 0,
    "totalShares": 0,
    "completionRate": 0,
    "shareRate": 0
  },
  "feedback": {
    "total": 0,
    "positive": 0,
    "neutral": 0,
    "negative": 0,
    "withComments": 0
  },
  "topSources": [],
  "topGames": [],
  "experiments": []
}
```

**Status:** ✅ Script funcional, ❌ zero em tudo

---

## 6. Páginas Operacionais: `/estado` e `/estado/feedback`

### 6.1 /estado (Métricas)

```
Renderiza atualmente (com dados remotos vazios):

📊 Estado de Nação: Métricas
   🟡 remoto (Supabase)
   
├─ Total Sessions: 0
├─ Completions: 0  
├─ Starts: 0
├─ Shares: 0
├─ Completion Rate: 0%
└─ [Tab views com dados vazios por origem/jogo/engine]
```

**Status:** ✅ Página funcional e bem destrinchada, ❌ exibe zeros

### 6.2 /estado/feedback (Triagem)

```
Renderiza atualmente (com feedback remoto vazio):

💬 Feedback Qualitativo
   🟡 remoto (Supabase)
   
├─ Total Feedbacks: 0
├─ Positivos: 0
├─ Neutros: 0
├─ Negativos: 0
├─ Com Comentários: 0
├─ Taxa Positiva: 0%
├─ Triagem Pendente: 0
└─ [Tabelas/filtros vazios]
```

**Status:** ✅ Página funcional com filtros e triagem UI, ❌ sem dados

---

## 7. Engines: Integridade Continuada

Verificado que nenhuma engine foi quebrada:

- ✅ Quiz engine (branching internal logic)
- ✅ Branching engine (decision tree navigation)
- ✅ Simulation engine (state transitions)
- ✅ Map engine (location-based progression)

Todas salvam dados localmente (localStorage) e continuam funcionando **sem dependência de Supabase**.

---

## 8. O Que Falta Para "Verdadeiramente Concluído"

### 8.1 Validação com Dados Reais

**Blocker:** Supabase pronto, mas sem dados para validar

**Ação:** Executar 6-10 navegações reais (manualmente ou via Playwright):
- Pelo menos 2 sessões completas
- Pelo menos 2 sessões incompletas
- Feedback com ratings mix (positive/neutral/negative)
- Alguns comentários qualitativos
- Se possível, 2+ UTM sources diferentes
- 1-2 experimentos/variantes se houver tracking

### 8.2 Validação de Output

**Blocker:** Scripts funcionam, mas sabemos que dados exportados serão vazios

**Ação:** Após seed de dados:
- Rodar `npm run beta:export` → verificar se totalSessions > 0
- Rodar `npm run beta:snapshot` → verificar se topGames[] preenchido
- Salvar outputs em `reports/exports/` e `reports/snapshots/`

### 8.3 Validação UI Remota

**Blocker:** /estado e /estado/feedback mostram 0 em tudo

**Ação:** Após seed:
- Navegar para `/estado` → verificar se dados aparecem
- Navegar para `/estado/feedback` → verificar se feedback aparece
- Confirmar que labels mostram "🟡 remoto"
- Testar filtros em /estado/feedback

### 8.4 Hardening Mínimo

**Blocker:** Policies estão muito abertas (qualquer anon pode fazer tudo)

**Ação:** Endurecer criticamente:
- `feedback_records`: remover `with check (true)` de UPDATE
- Substituir por: só `triaged_at` e `triage_status` podem mudar
- Documentar trade-off: menos seguro agora, mas iterável

### 8.5 Validação Gate Completo

**Blocker:** Nunca rodou com dados reais incorporados

**Ação:**
```bash
npm run lint          # ESLint
npm run type-check    # TypeScript full
npm run build         # Production build
npm run verify        # Custom script
```

---

## 9. Conclusão: O que já está validado vs. o que está "pronto para uso"

### ✅ Já Validado (Comprovado que funciona)

1. Schema SQL syntax (criação de tables/views sem erros)
2. RLS policies permitem anon insert/select
3. Scripts beta-export e beta-snapshot carregam .env.local
4. Scripts conectam a Supabase e recebem respostas HTTP 200
5. /estado page existe, carrega, e chama collectBestAvailableMetrics()
6. /estado/feedback page existe, carrega, e chama collectFeedback()
7. Fallback local continua funcionando (localStorage intacto)
8. 4 engines continuam salvando dados localmente

### ⚠️ Pronto para Uso, Não Validado (Estrutura feita, sem dados)

1. Views analíticas (criadas, mas nunca agregaram dados reais)
2. Triagem de feedback (triage UI existe, mas sem dados para triar)
3. Experimento tracking (estrutura presente, nunca foi testada com variantes)
4. Fallback híbrido (código exists, nunca testado com local+remote simultâneos)

### ❌ Ainda Incompleto

1. Dados remoto real (zero registros)
2. Evidência de que views agregam corretamente
3. Comprovação de que /estado exibe dados não-vazios
4. Comprovação de que triage UI é usável
5. Validação de fallback com Supabase indisponível
6. Policies endurecidas (atuais são beta-open)

---

## 10. Próximo Passo: Gerar Dados Reais

Plano de ação imediato:

1. **Criar seed script** (ou navegar manualmente)
2. **Gerar 6-10 sessões variadas** com:
   - Mix de completions/abandons
   - Feedback positivo/neutral/negative
   - 2+ UTM origins
   - 1-2 comentários qualitativos por feedback

3. **Rodar beta-export e beta-snapshot**
4. **Validar /estado e /estado/feedback**
5. **Endurecer policies**
6. **Rodar gate completo**
7. **Gerar relatório final**

---

**Assinado:** Diagnóstico Automático | 2026-03-06 19:00  
**Status Nível Executivo:** Estrutura 100% pronta, Validação 0% - Aguardando dados reais
