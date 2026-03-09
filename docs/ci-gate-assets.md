# CI/Pre-Merge Gate: Assets Audit

Definição oficial do gate de auditoria de assets que roda em CI/Pull Requests.

**Status**: Ativo (T46)  
**Owner**: CI/CD + Asset Pipeline Maintainer  
**Integration**: GitHub Actions / Vercel Build

---

## 1. Gate Obrigatório

### Comando
```bash
npm run assets:audit
```

### Comportamento

| Severity Summary | Exit Code | CI Behavior | Action Required |
|------------------|-----------|-------------|-----------------|
| 0 errors, 0 warnings | 0 | ✅ **Pass** - Allow merge | None - safe to deploy |
| 0 errors, >0 warnings | 0 | ✅ **Pass** - Allow merge | Review warnings in next cleanup cycle |
| >0 errors | 1 | ❌ **FAIL** - Block merge | Fix errors before merge |

### Rationale
- **Errors block** because they indicate broken runtime (missing critical assets, malformed manifest)
- **Warnings allow** because they're informational (orphans, optional fallbacks) and can be addressed incrementally

---

## 2. Error Conditions (Blocking)

### Error Types
1. **asset_missing**: Arquivo obrigatório no manifest não existe em disco
2. **manifest_missing**: Arquivo `manifest.json` não encontrado
3. **manifest_invalid**: JSON malformado ou campos obrigatórios ausentes (`game.slug`, `version.manifestVersion`, `assets`)
4. **fallback_invalid**: Default fallback ausente ou path inválido

### Example Blocking Output
```
✗ Jogo Exemplo (jogo-exemplo)
  Status: ERROR
  Assets: 10/12 valid
  Missing: 2
  Issues:
    ✗ [ERROR] asset_missing: /arcade/jogo-exemplo/ui/icon-critical.svg

=== SUMMARY ===
OK:      0
Warning: 0
Error:   1

⚠️ Found 2 critical errors – deployment BLOCKED. Fix errors before merge.
```
**CI Result**: FAILED (exit code 1)

---

## 3. Warning Conditions (Non-Blocking)

### Warning Types
1. **orphan_file**: Arquivo em disco não referenciado no manifest (e não no allowlist)
2. **fallback_missing**: Fallback opcional (`byKey`) não implementado

### Example Warning Output
```
⚠ Mutirao do Bairro (mutirao-do-bairro)
  Status: WARNING
  Assets: 20/20 valid
  Orphaned: 3
  Issues:
    ⚠ [WARNING] orphan_file: arcade/mutirao-do-bairro/ui/ui-action-defender-v1.svg

=== SUMMARY ===
OK:      2
Warning: 1
Error:   0

✓ Audit passed with warnings. Review warnings in next cleanup cycle.
```
**CI Result**: PASSED (exit code 0)

---

## 4. Allowlist Integration

### Suppressing Expected Warnings

Se órfãos são intencionais (variantes legacy, rollback safety), adicionar ao allowlist:

**File**: `tools/assets-audit-allowlist.json`
```json
{
  "allowlist": {
    "game-slug": {
      "filename.svg": "Justification (review YYYY-MM-DD)"
    }
  }
}
```

**Effect**: Arquivo allowlisted NÃO gera warning (pack passa para status OK).

---

## 5. GitHub Actions Integration

### Workflow File
`.github/workflows/assets-audit.yml` (ativo no repositorio):

```yaml
name: Assets Audit

on:
  pull_request:
    paths:
      - 'public/arcade/**'
      - 'tools/assets-audit.js'
      - 'tools/assets-audit-allowlist.json'
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run assets:audit
```

### Trigger Conditions (regra oficial de escopo)
O workflow dedicado roda automaticamente em PR/push quando houver alteracoes em:
- `public/arcade/**`
- `lib/games/assets/**`
- `lib/games/arcade/*assets.ts`
- `tools/assets-audit.js`
- `tools/assets-audit-allowlist.json`
- `tools/assets-health-report.js`
- `package.json`

Contrato de pre-merge:
- se PR tocar o escopo acima, `Asset Pipeline Gate` deve passar.
- `error` bloqueia merge (exit 1).
- `warning` fica visivel no log, mas nao bloqueia.

### T48: Alerta automatico de review da allowlist

No workflow oficial, o step `Build CI summary and allowlist review alert` agora le `tools/assets-audit-allowlist.json` e calcula estado de revisao:
- `ON_TRACK`: data de review ainda confortavel.
- `DUE_SOON`: revisao vence em ate 14 dias.
- `OVERDUE`: data de review vencida.
- `MISSING`: metadata ausente/invalida.

Politica de bloqueio:
- **nao bloqueia merge** por review vencida/proxima;
- **sempre visivel** no log e no GitHub Step Summary;
- bloqueio continua reservado para `errors` de auditoria.

### T48: Summary operacional no GitHub Actions

Cada run publica um resumo curto com:
- status geral do gate (`PASS` ou `ERROR (blocking)`);
- quantidade de warnings;
- status da revisao de allowlist e proxima data;
- packs afetados pelo diff da PR/push;
- caminho do report de auditoria usado na avaliacao.

Isso reduz dependencia de leitura longa de logs e melhora previsibilidade operacional.

### T48: Smoke seletivo por assets criticos

O step `Detect critical asset changes` detecta mudancas criticas com base em padroes de runtime:
- `public/arcade/<slug>/manifest.json`
- `public/arcade/<slug>/bg/**`
- `public/arcade/<slug>/player/**`
- `public/arcade/<slug>/obstacles/**`
- `public/arcade/<slug>/pickups/**`
- `public/arcade/<slug>/ui/**`
- `lib/games/arcade/*assets.ts`
- `lib/games/assets/**`

Se houver match, o workflow roda `npm run test:assets-smoke` automaticamente.
Se nao houver match, smoke adicional e pulado para evitar ruido/custo desnecessario.

Politica detalhada de classificacao:
- `docs/assets-criticos-runtime.md`

---

## 6. Local Development Flow

### Before Opening PR
```bash
# 1. Modificar assets em public/arcade/<game>/
# 2. Atualizar manifest.json
# 3. Rodar auditoria local
npm run assets:audit

# 4. Se WARNING: decidir se adicionar ao allowlist ou limpar órfãos
# 5. Se ERROR: corrigir antes de commit
# 6. Commit + push
```

### Resolving Errors Locally
```bash
# Ver detalhes do erro
npm run assets:audit

# Opções:
# A) Adicionar arquivo ausente ao disco
# B) Corrigir path no manifest
# C) Remover asset do manifest se não é mais necessário

# Re-validar
npm run assets:audit
# Deve mostrar: ✓ All asset packs OK – safe to deploy
```

---

## 7. Vercel/Netlify Integration

### Build Command
```json
// package.json
{
  "scripts": {
    "build": "npm run assets:audit && next build"
  }
}
```

**Behavior**: Deploy falha se auditoria retorna errors (exit code 1).

### Pre-Build Hook (Alternativa)
```json
{
  "scripts": {
    "prebuild": "npm run assets:audit"
  }
}
```

---

## 8. Escalation Policy

### If Gate Fails in Production
1. **Immediate**: Revert commit que introduziu erro
2. **Short-term**: Hot fix com correção de asset + re-deploy
3. **Post-mortem**: Investigar por que erro não foi detectado antes de merge

### If Gate has False Positives
1. Reportar issue com output completo
2. Investigar se é problema de cross-platform paths (Windows/Linux)
3. Se necessário, adicionar ao allowlist temporariamente
4. Fixar audit script em próximo tijolo

---

## 9. Maintenance

### Quarterly Review
- Revisar allowlist: arquivos com datas de review passadas devem ser removidos ou re-justificados
- Verificar que gate continua rodando em CI (não foi desabilitado acidentalmente)
- Analisar histórico de warnings: se warnings >10 total, agendar cleanup cycle

### Updating Gate Logic
Se modificar `tools/assets-audit.js`:
- Rodar tests localmente em todos os packs
- Validar exit codes (0 para ok/warning, 1 para error)
- Documentar mudanças neste arquivo

---

## 10. FAQ

**Q: Posso fazer merge se tenho warnings?**  
A: Sim. Warnings não bloqueiam pela política oficial. Revise em próximo cleanup cycle.

**Q: Como testar o gate localmente antes de fazer PR?**  
A: `npm run assets:audit` - se exit code 0, seu PR passará no CI.

**Q: O que fazer se CI bloqueia mas localmente passa?**  
A: Provavelmente cross-platform path issue. Verifique se audit script normaliza paths (função `normalizePath()`).

**Q: Posso desabilitar o gate temporariamente?**  
A: Não recomendado. Se absolutamente necessário: modificar workflow YAML para permitir failure (`continue-on-error: true`), mas reverter imediatamente após merge emergencial.

**Q: Warnings crescendo - quando devo limpar?**  
A: Quando >10 warnings acumulados OU durante quarterly review. Não é urgente mas deve ser endereçado incrementalmente.

---

## 11. Health Report Operacional

Comando:
```bash
npm run assets:health-report
```

Uso:
- sumarizar estado dos packs (ok/warning/error);
- tornar visivel debt conhecida;
- mostrar proxima data de review da allowlist.

Observacao:
- esse relatorio e complementar; o gate bloqueante continua sendo `npm run assets:audit`.

---

## Changelog

| Data | Versão | Mudança |
|------|--------|---------|
| 2026-03-09 | 1.0.0 | Gate inicial ativo (T46) |
| 2026-03-08 | 1.1.0 | Workflow dedicado oficializado (T47), com regra de escopo para PRs de assets |
| 2026-03-09 | 1.2.0 | T48: alerta automatico de review da allowlist, summary operacional no Actions e smoke seletivo para assets criticos |
