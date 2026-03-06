# Tijolo 14 - Diagnóstico Inicial
## Governança Operacional Mínima e Auditabilidade

**Data**: 2026-03-06  
**Objetivo**: Evoluir operação de "usável" para "minimamente governável e auditável", sem auth pesada nem admin enterprise.

---

## 1. Estado de Entrada

### 1.1 Assets Já Operacionais (Tijolo 13)

✅ **Triagem de Feedback** (3 estados)
- Pending, Prioritário, Reviewed
- UI em `/estado/feedback` com dropdown inline
- Ordenação por: recente, prioritário-first, pending-first, negative-first

✅ **Experimentos com Override**
- `lib/experiments/config.ts` com parsing de `EXPERIMENTS_OVERRIDE` env
- `/estado` mostra registry com ativo/inativo/override

✅ **Scripts Operacionais**
- `beta:ops` - check rápido (conectividade, experimentos, feedback)
- `beta:snapshot` - snapshot com registry
- `beta:export` - export remoto

✅ **CI/CD e Verificação**
- Lint, type-check, test:unit (15 tests), build, verify (52 checks)
- E2E com Playwright
- A11y baseline

✅ **Database Remote (Supabase)**
- 4 tabelas: `game_sessions`, `game_events`, `game_results`, `feedback_records`
- 8 views analytics
- RLS policies aplicadas

---

## 2. Mapeamento de Mutações Sensíveis Client-Side

### 2.1 **Triagem de Feedback** ⚠️ CRÍTICA

**Arquivo**: `app/estado/feedback/page.tsx`
**Função**: `handleTriageChange(id, newStatus)`

```typescript
async function handleTriageChange(id: string, newStatus: 'pending' | 'reviewed' | 'prioritario') {
  setBusyId(id);
  await markFeedbackTriage(id, newStatus);  // ← CHAMADA DIRETA
  const reloaded = await collectFeedback();
  setFeedback(reloaded);
  setBusyId(null);
}
```

**Fluxo Inseguro**:
1. Usuário clica dropdown em `/estado/feedback` (página 'use client')
2. Chama `markFeedbackTriage(id, status)` diretamente do client
3. Internamente:
   - Atualiza localStorage localmente
   - Chama `updateFeedbackTriageRemote(id, status, triagedAt)`
4. `updateFeedbackTriageRemote` faz UPDATE diretamente Supabase com anon key:
   ```typescript
   await supabase.from('feedback_records')
     .update({ triage_status: status, triaged_at })
     .eq('feedback_id', feedbackId);
   ```

**Proteção Atual**: RLS policy
```sql
create policy "Allow anon update feedback triage" on public.feedback_records
  for update
  to anon
  using (id is not null)
  with check (
    triage_status in ('pending', 'reviewed', 'prioritario') and 
    (triaged_at is null or triaged_at > now() - interval '24 hours')
  );
```

**Problemas**:
- ❌ Qualquer pessoa com acesso ao app pode mudar triagem de QUALQUER feedback
- ❌ Sem auditoria: não registra QUEM mudou, QUANDO, e o QUÊ mudou
- ❌ Sem rate limiting ou throttling
- ❌ Client-side é fonte única da verdade (UX responsável por triaged_at)
- ⚠️ 24h window permite re-triagem sem limite

### 2.2 **Feedback Registration** 🟡 SENSÍVEL

**Arquivo**: `lib/analytics/feedback.ts`
**Função**: `registerFeedback(input)`

```typescript
export async function registerFeedback(input: RegisterFeedbackInput): Promise<FeedbackRecord> {
  const record: FeedbackRecord = {
    id: generateId('feedback'),
    sessionId: input.sessionId,
    triageStatus: 'pending',
    source: 'local',
  };

  appendLocalItem('feedback', record);
  const persisted = await persistFeedbackRecordRemote(record);  // ← MUTAÇÃO DIRETA
  // ...
}
```

**Problemas**:
- ⚠️ Registro é client-side, pode ser injetado com dados falsos
- Menos crítico pois é PII mínimo (sem usuário identificado, apenas anon_id)

### 2.3 **Experimentos** 🟢 SEGURO
- Override via env (`EXPERIMENTS_OVERRIDE`)
- Não há UI editável de toggle (evita problema)
- Read-only no client

### 2.4 **Snapshots e Exports** 🟢 SEGURO
- Scripts server-side
- Nenhuma UI operacional editável

---

## 3. Avaliação de Segurança Operacional

| Ação | Hoje | Risco | Auditar? | Proteger? |
|------|------|-------|----------|-----------|
| Triagem de Feedback | Client direto + RLS | Alto | ✅ SIM | ✅ SIM |
| Registrar Feedback | Client direto | Médio | ⚠️ Parcial | ⏸️ Depois |
| Toggle Experimento | Env var | Baixo | ❌ Não | ✅ Sim (env) |
| Export/Snapshot | Script | Baixo | ⚠️ Implícito | ✅ Log |
| Leitura de estado | API read-only | Baixo | ❌ Não | ✅ Sim (token) |

---

## 4. Vulnerabilidades e Gaps

### 4.1 **Sem Auditoria**
- Mudança em triagem não deixa trilha
- Impossível saber: quem mudou, quando, de qual para qual status
- Apenas possível de saber via Supabase webhook (não implementado)

### 4.2 **Parsing Registry via Regex**
- `tools/beta-snapshot.js` e `tools/beta-ops.js` usam regex para ler registry.ts
- Frágil: quebra se estrutura mudar
- Não há schema/export estruturado do registry

### 4.3 **Sem Rota de Operação Protegida**
- Triagem é única ação operacional sensível
- Sem token simples de operação
- /estado/feedback é público (qualquer um acessa)

### 4.4 **Snapshots Manuais**
- Sem automação periódica
- Replicação beta:snapshot é manual
- Não há histórico versioned de snapshots

### 4.5 **Sem Versionamento de Config**
- Experimentos hardcoded em registry.ts
- Override via env é string frágil
- Sem como saber histórico de mudanças de config

---

## 5. Objetivos do Tijolo 14

### 5.1 **Proteção Operacional**
- ✅ Criar camada mínima de rotas server-side protegidas por token
- ✅ Mover triagem para usar rota protegida (fallback client se token ausente)
- ✅ Evitar exposição de tokens ao cliente público

### 5.2 **Auditabilidade**
- ✅ Criar tabela `ops_audit_log`
- ✅ Registrar cada ação operacional sensível
- ✅ Rastrear: action_type, target, antes/depois, ator, timestamp

### 5.3 **Governança de Experimentos**
- ✅ Tornar config mais robusto (menos regex)
- ✅ Opcionalmente gerar export JSON do registry
- ✅ Visibilidade clara em `/estado` do que está override

### 5.4 **Automação Leve**
- ✅ Script cron (ou GitHub Actions) para snapshots periódicos
- ✅ Documentar como rodar manualmente se cron falhar
- ✅ Versionamento de snapshots

### 5.5 **Melhor /estado**
- ✅ Mostrar status de audit log
- ✅ Mostrar últimos snapshots conhecidos
- ✅ Status da proteção operacional (ativa/inativa)
- ✅ Better feedback pending/prioritário summary

### 5.6 **Melhor beta:ops**
- ✅ Incluir status de audit log
- ✅ Incluir status de proteção operacional
- ✅ Últimos snapshots
- ✅ Contagem de feedback não triado

---

## 6. Design de Soluções Propostas

### 6.1 **Rotas Protegidas de Operação**

**Rota**: `POST /api/ops/feedback/triage`
**Token**: `OPS_ADMIN_TOKEN` (env)

```json
{
  "feedbackId": "fb_xxx",
  "status": "prioritario",
  "token": "secret_token_from_env"
}
```

**Proteção**:
- Token simples via env (não é auth completa)
- Server-side valida token
- Não expor token ao cliente público
- `/estado` pode usar token via prompt ou session simples dentro de app private

**Fallback**:
- Se token não configurado ou rota falhar, fallback para mutação client-side (compatibilidade)
- Log de fallback no audit

### 6.2 **Audit Log Schema**

```sql
create table ops_audit_log (
  id bigserial primary key,
  action_type text not null,  -- 'feedback_triage', 'experiment_toggle', 'snapshot_run', etc
  target_type text not null,  -- 'feedback', 'experiment', 'snapshot', etc
  target_id text not null,
  previous_value text,         -- JSON se for estruturado
  next_value text,             -- JSON se for estruturado
  actor_label text,            -- 'ops-admin', 'automated', 'client-fallback', etc
  actor_source text,           -- token label, script name, etc
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
```

### 6.3 **Experiments Config Export**

Criar `lib/experiments/export.ts`:
```typescript
export function exportExperimentsConfig() {
  return {
    generated_at: new Date().toISOString(),
    base_registry: baseRegistry,
    overrides: parseExperimentOverrides(),
    active: getActiveExperiments(),
  };
}
```

Usar em scripts em vez de regex.

### 6.4 **Snapshots Periódicos**

Adicionar GitHub Actions workflow (cron `0 */6 * * *`):
- Rodar `npm run beta:snapshot`
- Gerar arquivo timestamped em reports/snapshots/
- Commit e push com mensagem automática

Fallback: documentar como rodar manualmente se Actions falhar.

---

## 7. Não Fazer (Conscientemente)

❌ Auth obrigatória para jogar
❌ Sistema completo de login/sessão
❌ CMS/admin enterprise com interface pesada
❌ Whitelist de usuários operadores
❌ Criptografia pesada de tokens (simples string env é suficiente para beta)
❌ Verificação de IP ou rate limiting complexa
❌ Webhook para auditoria em tempo real

---

## 8. Próximos Passos

1. **Criar camada protegida de operações** - rotas + token
2. **Implementar audit log** - tabela + RLS + insert functions
3. **Refatorar triagem** - usar rota protegida com fallback
4. **Melhorar experimentos config** - export + menos regex
5. **Automatizar snapshots** - GitHub Actions
6. **Melhorar beta:ops** - incluir audit/snapshots
7. **Melhorar /estado** - dashboard operacional completo
8. **Documentação** - guia de operação
9. **Gate completo** - lint, type-check, test, build, verify
10. **Relatório final** - registrar tudo

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| Token vazado em env | Baixa | Alto | Token simples, rotação fácil, apenas beta |
| Triagem por actor ruim | Médio | Médio | Audit log permite rastrear, RLS persiste |
| Config experimentos fica complexa | Médio | Baixo | Export JSON simplifica, documentação clara |
| Snapshot automation quebra silenciosamente | Baixo | Médio | Manual fallback documentado, beta:ops alerta |
| Auditoria cresce muito (storage) | Baixo | Baixo | 300 dias de retenção é suficiente para beta |

---

**Status**: ✅ Diagnóstico completo
**Próximo**: Implementar rotas protegidas de operação
