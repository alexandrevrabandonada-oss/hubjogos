# Tijolo 14 - Guia de Operação

## Governança Operacional Mínima e Auditabilidade

**Status**: Concluído e validado remotamente  
**Objetivo**: Tornar operações internas de feedback minimamente governáveis e auditáveis, sem auth pesada.

**Nota operacional**: a rotina contínua (cron, alertas leves e export de auditoria) foi adicionada no Tijolo 15. Para operação diária, usar `docs/runbook-operacional.md`.

---

## 1. Ativar Operações Protegidas

### 1.1 Gerar Token de Operação

```bash
# Gere um token seguro (ex: usando openssl)
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 1.2 Configurar Variável de Ambiente

Edite `.env.local`:
```env
OPS_ADMIN_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 1.3 Aplicar Migração ao Supabase

```bash
# Definir credenciais Supabase
export SUPABASE_URL=https://xxx.supabase.co
export SUPABASE_SERVICE_KEY=eyJxxx...

# Executar migração
npm run ops:apply-migration
```

Saída esperada:
```
✅ Conectado com sucesso
✅ Migração aplicada com sucesso
✅ Tabela ops_audit_log verificada
✅ Função log_ops_action verificada
```

---

## 2. Usar Triagem de Feedback com Auditoria

### 2.1 Via Interface Web

1. Acesse `/estado/feedback`
2. Clique em **"🔐 Usar operação protegida (com auditoria)"**
3. Cole o token `OPS_ADMIN_TOKEN` no campo
4. Ao marcar feedback como triado, a ação será auditada

### 2.2 Via API (Curl/Postman)

```bash
curl -X POST http://localhost:3000/api/ops/feedback/triage \
  -H "Content-Type: application/json" \
  -H "x-ops-token: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" \
  -d '{
    "feedbackId": "fb_123abc",
    "status": "prioritario"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "feedbackId": "fb_123abc",
    "previousStatus": "pending",
    "newStatus": "prioritario",
    "triagedAt": "2026-03-06T20:00:00Z"
  },
  "audit": {
    "recorded": true,
    "action_type": "feedback_triage"
  }
}
```

---

## 3. Verificar Auditoria

### 3.1 Via `/estado`

Acesse `/estado` e role até a seção **"🔐 Operações Protegidas"** para ver status.

### 3.2 Via Script

```bash
npm run beta:ops
```

Saída incluirá:
```
## Audit Log Operacional (Últimas Ações)

✅ 5 ação(ões) nos últimos registros
   - feedback_triage: 5

   Última ação: feedback_triage em 06/03/2026, 20:15:45
   Ator: ops-admin (ops-api)
```

### 3.3 Via Supabase

SQL:
```sql
select * from ops_audit_log order by created_at desc limit 20;
```

---

## 4. Gerenciar Experimentos

### 4.1 Exportar Configuração

```bash
npm run ops:export-config
```

Gera `reports/experiments-config-YYYY-MM-DD.json`:
```json
{
  "generated_at": "2026-03-06T20:00:00Z",
  "config": {
    "base_registry": [...],
    "overrides": {
      "beta-banner-copy": false
    },
    "active": [2],
    "inactive": [1]
  }
}
```

### 4.2 Override via Env

```env
EXPERIMENTS_OVERRIDE=beta-banner-copy:false,outcome-cta-style:true
```

Verificar status:
```bash
npm run beta:ops
```

---

## 5. Snapshots Periódicos

### 5.1 Manual (Hoje)

```bash
npm run beta:snapshot
```

Salva em `reports/snapshots/beta-snapshot-YYYY-MM-DDTHH-MM-SS.md`

### 5.2 Automático (GitHub Actions)

[Planejado para Tijolo 15]

Adicione agendamento cron em `.github/workflows/beta-snapshot-cron.yml`:
```yaml
schedule:
  - cron: '0 */6 * * *'  # A cada 6 horas
```

---

## 6. Troubleshooting

### 6.1 "Token required" Error

```
❌ Token de operação inválido
```

**Solução**: Agora token do `.env.local` não é acessível no browser. Use:
- `/estado/feedback` → insira token manualmente no campo
- Ou faça requisição curl com header `x-ops-token`

### 6.2 "Supabase not configured" Error

Certifique-se de ter:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 6.3 RLS Policy Error

Se migração falhou, verifique RLS:
```sql
select * from pg_policies where tablename = 'ops_audit_log';
```

---

## 7. Conformidade e Segurança

### ✅ Implementado

- ✅ Token de operação (OPS_ADMIN_TOKEN) valida antes de mutação
- ✅ Auditoria registra quem mudou, o quê, e quando
- ✅ RLS protege acesso aos dados
- ✅ Fallback para mutação client-side se token ausente (compatibilidade)

### ❌ NÃO Implementado (Intencional)

- ❌ Auth obrigatória para jogar (mantém acesso público)
- ❌ Dashboard admin enterprise
- ❌ Rate limiting (beta, baixo tráfego)
- ❌ Webhook de auditoria em tempo real

### ⚠️ Riscos Conhecidos

1. **Token em `.env.local`** - Arquivo local, não exposto em produção
2. **Triagem client-side sem token** - Fallback com RLS protege
3. **Audit log sem limpeza** - Retenção de 300+ dias (OK para beta)

---

## 8. Próximos Passos (Tijolo 15)

- [ ] GitHub Actions cron para snapshots
- [ ] Auth opcional via Supabase Auth para `/estado`
- [ ] Dashboard de retenção de audit log
- [ ] Export de audit log para análise
- [ ] Webhook para alertas de feedback prioritário

---

## 9. Referência de Rotas

| Rota | Método | Proteção | Uso |
|------|--------|----------|-----|
| `/api/ops/feedback/triage` | POST | Token | Atualizar triagem com auditoria |
| `/api/ops/feedback/recent` | GET | RLS | Ler feedback recente (futuro) |
| `POST /api/ops/audit` | GET | Token | Ler audit log (futuro) |

---

## 10. Contato

Para dúvidas sobre operações protegidas, consulte:
- `lib/ops/protected.ts` - lógica de validação
- `app/api/ops/feedback/triage/route.ts` - implementação de rota
- `supabase/tijolo-14-ops-audit.sql` - schema
