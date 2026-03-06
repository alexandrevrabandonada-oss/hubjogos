# Tijolo 13 - Diagnóstico Inicial
## Operação Interna Leve e Sustentável

**Data**: 2026-03-06 20:00  
**Objetivo**: Transformar camada remota validada em operação interna mais usável, leve e segura.

---

## 1. Estado de Entrada

### 1.1 Tijolo 12C - Validação Remota Completa ✅
- ✅ Feedback remoto funcionando
- ✅ Snapshots/export remotos funcionando  
- ✅ `/estado` e `/estado/feedback` lendo dados reais
- ✅ `experiment_performance` view corrigida e validada
- ✅ 4 engines reais operando
- ✅ Analytics com source/referrer/utm
- ✅ Experimentos leves ativos
- ✅ CI/CD, observabilidade, a11y baseline

### 1.2 Estrutura Atual

**Views Remotas (Supabase)**:
- `beta_funnel_overview` - funil geral
- `beta_sources_overview` - coortes por origem
- `beta_game_overview` - métricas por jogo
- `beta_engine_overview` - métricas por engine
- `beta_events_overview` - agregação de eventos
- `experiment_performance` - performance A/B (corrigida)
- `feedback_summary_by_game` - resumo de feedback
- `feedback_recent` - feedback cronológico

**Páginas Operacionais**:
- `/estado` - Dashboard com métricas, coortes, experimentos
- `/estado/feedback` - Triagem de feedback qualitativo

**Scripts Existentes**:
- `npm run beta:export` - Exportação JSON estruturada
- `npm run beta:snapshot` - Snapshot markdown/JSON

**Experimentos**:
- Registry em `lib/experiments/registry.ts`
- 3 experimentos definidos: beta-banner-copy (enabled), outcome-cta-style (enabled), home-games-order (disabled)
- Resolução automática por sessão em `lib/experiments/resolve.ts`

---

## 2. Pontos de Atrito Operacional Identificados

### 2.1 Triagem de Feedback 🟡
**Situação Atual**:
- ✅ Filtros por jogo, rating, engine, triagem
- ✅ Resumos visuais (cards overview + tabela por jogo)
- ✅ Marcador de triagem (pending/reviewed)
- ⚠️ **Atrito**: Ordenação fixa (só cronológico descendente)
- ⚠️ **Atrito**: Sem priorização além de pending/reviewed
- ⚠️ **Atrito**: Resumo de pendentes está em card, não em destaque contextual
- ⚠️ **Atrito**: Mutação de triagem client-side (possível risco de segurança)

**Necessidades**:
- Ordenação configurável (recentes, pendentes primeiro, rating)
- Status de triagem mais granular (pending, reviewed, prioritario)
- Resumo contextual melhor posicionado
- Validação server-side ou proteção por token para mutação

### 2.2 Gestão de Experimentos 🟡
**Situação Atual**:
- ✅ Registry centralizado em código
- ✅ /estado mostra performance quando há dados
- ✅ Snapshot lista experimentos ativos
- ⚠️ **Atrito**: Toggle enabled/disabled hardcoded - precisa deploy para mudar
- ⚠️ **Atrito**: Sem override por env/config
- ⚠️ **Atrito**: /estado não mostra quais experimentos estão ativos no registry
- ⚠️ **Atrito**: Sem visibilidade de experimentos inativos

**Necessidades**:
- Override de enabled via env ou arquivo config
- /estado mostrar experimentos ativos/inativos do registry
- Snapshot diferenciar ativos vs inativos

### 2.3 Operação em /estado 🟢
**Situação Atual**:
- ✅ Source badge (local/remoto/híbrido)
- ✅ Cards overview bem estruturados
- ✅ Tabelas de coortes por origem/jogo/engine
- ✅ Experimentos quando há dados
- ⚠️ **Atrito**: Não mostra status do registry de experimentos
- ⚠️ **Atrito**: Não mostra última execução de snapshot/export
- ⚠️ **Atrito**: Conectividade Supabase não é testada explicitamente

**Necessidades**:
- Bloco com status de experimentos ativos/inativos
- Timestamp de última execução snapshot/export (se disponível)
- Indicador de conectividade Supabase mais claro

### 2.4 Views e Agregações Remotas 🟢
**Situação Atual**:  
- ✅ 8 views funcionais
- ✅ Índices básicos criados
- ✅ experiment_performance corrigida com jsonb_typeof guard
- ✅ RLS policies aplicadas
- ⚠️ **Atrito**: Sem materialized views - consultas sempre ao vivo
- ⚠️ **Atrito**: Sem estratégia de refresh documentada

**Necessidades**:
- Avaliar se materialized views são necessárias
- Documentar estratégia de refresh se implementar
- Revisar índices para queries mais frequentes

### 2.5 Scripts Operacionais 🟡
**Situação Atual**:
- ✅ beta:export funcional
- ✅ beta:snapshot funcional (md + json)
- ⚠️ **Atrito**: Sem script de verificação rápida
- ⚠️ **Atrito**: Sem teste de conectividade Supabase standalone
- ⚠️ **Atrito**: Sem resumo operacional rápido

**Necessidades**:
- Script beta:ops ou beta:check
- Teste de conectividade
- Status de experimentos
- Status de feedback pendente
- Saída estruturada (console ou markdown)

### 2.6 Segurança Operacional 🟢
**Situação Atual**:
- ✅ RLS policies em todas as tabelas
- ✅ Feedback triage com check (pending/reviewed, 24h window)
- ✅ Experiments são código (sem mutação não autorizada)
- ⚠️ **Atrito**: Triagem de feedback mutável por cliente direto
- ⚠️ **Atrito**: Sem token/auth para operações sensíveis

**Necessidades**:
- Rota server-side para triagem com validação
- Documentar proteção mínima sem auth pesada

---

## 3. Decisões de Design

### 3.1 Princípios
- ✅ Operação leve, não admin enterprise
- ✅ Não quebrar engines existentes
- ✅ Manter fallback local quando fizer sentido
- ✅ Idempotência em scripts
- ✅ Segurança mínima documentada

### 3.2 Não-Escopo
- ❌ Nova engine
- ❌ Auth obrigatória para jogar
- ❌ CMS/admin complexo
- ❌ Sistema de usuários

---

## 4. Plano de Implementação

### Fase 1: Triagem de Feedback Melhorada
1. Adicionar ordenação configurável
2. Expandir triagem para pending/reviewed/prioritario
3. Melhorar resumo contextual
4. Criar rota server-side para mutação (opcional se RLS forte)

### Fase 2: Toggles de Experimentos
1. Adicionar override via env `EXPERIMENTS_OVERRIDE`
2. Função para merge registry + override
3. /estado mostrar experimentos ativos/inativos
4. Snapshot diferenciar status

### Fase 3: /estado como Cockpit Leve
1. Bloco de status de experimentos (registry)
2. Indicador de última execução snapshot/export
3. Conectividade Supabase explícita

### Fase 4: Views e Índices
1. Revisar queries frequentes
2. Avaliar necessidade de materialized views
3. Documentar estratégia de refresh

### Fase 5: Script Operacional
1. Criar tools/beta-ops.js
2. Teste de conectividade Supabase
3. Listar experimentos ativos
4. Contar feedback pendente
5. Saída markdown estruturada

### Fase 6: Segurança Operacional
1. Revisar RLS policies
2. Documentar proteção mínima
3. Criar rota server-side para triagem se necessário

### Fase 7: Documentação e Verificação
1. Atualizar README.md
2. Atualizar docs/arquitetura.md
3. Atualizar docs/roadmap.md
4. Atualizar docs/tijolos.md
5. Rodar gate completo

### Fase 8: Relatório Final
1. Gerar Estado da Nação

---

## 5. Métricas de Sucesso

- ✅ 4 engines continuam funcionando
- ✅ /estado/feedback melhor para triagem real
- ✅ Experimentos mais fáceis de operar
- ✅ /estado vira cockpit leve mais útil
- ✅ Views/agregações estáveis ou documentadas
- ✅ Script operacional útil criado
- ✅ lint, type-check, build, verify passam
- ✅ Relatório Estado da Nação gerado

---

**Próximo passo**: Implementação da Fase 1 - Triagem de Feedback Melhorada
