# Política de Auditoria de Assets do Hub

Documento oficial que define regras claras de auditoria, severidades e ações para manter o pipeline de assets confiável e escalável.

**Status**: Aprovado (T46)  
**Scope**: Todos os asset packs do hub (`public/<line>/<slug>/`)  
**Owner**: Asset Pipeline Maintainer + Principal Engineer

---

## 1. Objetivo

Garantir que:
- Manifest sempre aponta para arquivos que existem
- Arquivos órfãos não se acumulem silenciosamente
- Auditoria seja útil (sem ruído excessivo)
- Pipeline permaneça sustentável ao crescer

---

## 2. Severidades Oficiais

### ✓ OK (Status Green)
**Definição**: Asset pack está limpo e operacional.

**Critérios**:
- ✅ Todos os assets no manifest existem em disco
- ✅ Todos os arquivos em disco estão referenciados no manifest OU são explicitamente permitidos
- ✅ Fallback chains completos
- ✅ Manifest bem-formado (JSON válido, campos obrigatórios presentes)

**Ação**: Nenhuma - pode fazer merge/deploy sem revisão adicional.

---

### ⚠️ WARNING (Status Yellow)
**Definição**: Asset pack funcional mas com issues não-críticos.

**Critérios (um ou mais)**:
- ⚠️ Arquivos órfãos detectados (não referenciados no manifest)
- ⚠️ Fallback opcional ausente (byKey)
- ⚠️ Variantes legacy pendentes de cleanup

**Ações**:
- **Não bloqueia merge/deploy** por padrão
- Revisar warnings em sprint planning
- Decidir: limpar, documentar como allowed, ou adicionar ao manifest
- Warnings acumulados (>10 por pack) devem ser endereçados em próximo tijolo

**Quando é aceitável**:
- Variantes v1/v2 de design iterations preservadas para rollback
- Assets de features experimentais ainda não ativas
- Fallbacks opcionais ainda não criados por produção externa

---

### ✗ ERROR (Status Red)
**Definição**: Asset pack quebrado ou com risco crítico.

**Critérios (um ou mais)**:
- ✗ Asset OBRIGATÓRIO no manifest NÃO existe em disco
- ✗ Fallback DEFAULT ausente ou inválido
- ✗ Manifest JSON malformado ou ilegível
- ✗ Campos obrigatórios do manifest faltando (`game.slug`, `version.manifestVersion`, `assets`)

**Ações**:
- **BLOQUEIA merge/deploy** (exit code 1)
- Deve ser corrigido ANTES de integrar
- Se encontrado em produção: hot fix imediato
- Smoke tests devem detectar mas error é primeira linha de defesa

**Nunca é aceitável**: Errors sempre indicam problema real que quebra ou pode quebrar runtime.

---

## 3. Categorias de Órfãos

### 3.1 Órfãos Esperados (Allowed)
**Definição**: Arquivos que não estão no manifest mas têm justificativa clara.

**Exemplos**:
- `.gitkeep` (preservar estrutura de diretórios vazios)
- `README.md` (documentação local do pack)
- `manifest.json` (próprio arquivo de manifest)
- `.DS_Store` (metadados MacOS - já ignorado)
- Arquivos em `fx/` ou `audio/` (placeholders ou WIP)

**Regra**: Esses nunca geram warning.

---

### 3.2 Órfãos Legados (Legacy Safe)
**Definição**: Variantes de iterations anteriores preservadas por segurança.

**Exemplos**:
- `ui-action-reparar-v1.svg` quando manifest usa `v2`
- `bg-skyline-variant-a.svg` quando manifest usa `variant-b`

**Regra**: Geram warning, podem ficar se houver justificativa documentada.

**Critérios para manter**:
- Produção externa ainda pode enviar variantes
- Possibilidade de rollback em experimento
- Custo de disco desprezível (<5MB total de órfãos por pack)

**Quando limpar**:
- Após 2+ sprints sem uso
- Quando pack passar por full refresh
- Se órfãos >10 arquivos ou >5MB

---

### 3.3 Órfãos Inesperados (Unexpected Debt)
**Definição**: Arquivos sem justificativa clara, provavelmente erro humano.

**Exemplos**:
- `temp-test-icon.svg`
- `asset-final-FINAL-v3.svg`
- Duplicatas com nomes divergentes
- Assets de features deletadas

**Regra**: Geram warning, devem ser revisados e limpos ou documentados.

**Ação**: Investigar em próximo cycle de higiene (T47, T48...).

---

## 4. Allowlist/Ignore List

### 4.1 Ignored Files (Nunca auditados)
Hard-coded na auditoria:
```javascript
const ignoredFiles = new Set([
  '.gitkeep',
  'manifest.json',
  'README.md',
  '.DS_Store'
]);
```

### 4.2 Ignored Directories (Nunca auditados)
- `fx/` - placeholder para efeitos sonoros/visuais
- `audio/` - placeholder para trilha/sfx
- Qualquer diretório que comece com `.` (ocultos)

### 4.3 Allowlist de Órfãos Conhecidos

**Localização**: `tools/assets-audit-allowlist.json` (opcional, criado sob demanda)

**Estrutura**:
```json
{
  "mutirao-do-bairro": {
    "ui-action-reparar-v1.svg": "legacy variant - kept for rollback",
    "ui-action-defender-v1.svg": "legacy variant - kept for rollback",
    "ui-action-mobilizar-v1.svg": "legacy variant - kept for rollback"
  }
}
```

**Regras**:
- Se arquivo está na allowlist: não gera warning
- Allowlist deve ser explícita (não usar wildcards)
- Cada entrada precisa de justificativa em string
- Revisar allowlist a cada 3 meses

**Metadata obrigatória da allowlist**:
- `review.lastReviewedAt`
- `review.nextReviewAt`
- `review.reviewedBy`
- `review.notes`

Essa metadata deve ser atualizada a cada revisão operacional.

---

## 5. Fluxo de Trabalho Oficial

### 5.1 Adicionando Novo Asset

1. **Produção externa** gera SVG/PNG/audio fora do VS Code
2. **Colocar** arquivo em `public/<line>/<slug>/<categoria>/`
3. **Nomear** seguindo convenção: `<categoria>-<nome>-v<versao>.<ext>`
4. **Atualizar** `manifest.json`:
   ```json
   "assets": {
     "nova-key": "/path/to/novo-asset-v1.svg"
   }
   ```
5. **Rodar** `npm run assets:audit`
6. **Verificar** output: deve ser OK ou WARNING explicado
7. **Rodar** `npm run test:assets-smoke` (se aplicável)
8. **Commit** e abrir PR

---

### 5.2 Substituindo Asset Existente

**Opção A: Atualizar versão (recomendado)**
1. Criar novo arquivo: `icon-score-v2.svg`
2. Atualizar manifest: `"ui-icon-score": "/path/icon-score-v2.svg"`
3. Manter v1 como órfão temporário (rollback seguro)
4. Após validação (2+ sprints): deletar v1

**Opção B: Overwrite direto**
1. Substituir arquivo existente mantendo nome
2. Manifest não precisa mudar
3. Requer validação visual rigorosa

---

### 5.3 Removendo Asset

1. **Remover** do manifest primeiro
2. **Rodar** `npm run assets:audit` → deve gerar warning de órfão
3. **Verificar** que nenhum código depende do asset removido
4. **Deletar** arquivo físico
5. **Re-rodar** audit → warning de órfão deve sumir

---

## 6. Gates de CI/Pre-Merge

### 6.1 Gate Obrigatório
```bash
npm run assets:audit
```

**Regra**:
- Exit code 0 (ok ou warning): allow merge
- Exit code 1 (error): block merge

**Rationale**: Warnings não bloqueiam pois podem ser legados aceitáveis.

**Workflow oficial (T47)**:
- `.github/workflows/assets-audit.yml`
- escopo obrigatório de execução para PRs que alterem:
  - `public/arcade/**`
  - `lib/games/assets/**`
  - `lib/games/arcade/*assets.ts`
  - `tools/assets-audit.js`
  - `tools/assets-audit-allowlist.json`

### 6.2 Gate Recomendado (Opcional)
```bash
npm run test:assets-smoke
```

**Regra**: Falha bloqueia merge (smoke é gate crítico).

### 6.3 Alerta de review da allowlist (T48)

Fonte oficial: `review.nextReviewAt` em `tools/assets-audit-allowlist.json`.

Classificacao operacional:
- `ON_TRACK`: revisao ainda dentro da janela segura.
- `DUE_SOON`: revisao em ate 14 dias.
- `OVERDUE`: revisao vencida.
- `MISSING`: metadata invalida/ausente.

Politica oficial:
- alerta **nao bloqueia merge** por si so;
- alerta deve aparecer no log e no GitHub Step Summary;
- owner do pipeline agenda revisao de higiene no ciclo seguinte quando `DUE_SOON` ou `OVERDUE`.

### 6.4 Assets criticos de runtime

Definicao: qualquer asset cuja ausencia/mudanca possa degradar jogabilidade basica, HUD principal ou legibilidade da run.

Classes criticas:
- assets referenciados diretamente no runtime principal (`lib/games/assets/**`, `lib/games/arcade/*assets.ts`);
- manifest do pack (`public/arcade/<slug>/manifest.json`);
- `bg/`, `player/`, `obstacles/`, `pickups/`, `ui/` de cada pack.

Classes nao-criticas para smoke seletivo (por padrao):
- `fx/` e `audio/` placeholders/WIP;
- docs e templates sem impacto runtime.

Acionamento seletivo no CI:
- mudou asset critico -> executa `npm run test:assets-smoke`;
- sem mudanca critica -> smoke adicional e pulado para reduzir ruido/custo.

Referencia operacional:
- `docs/assets-criticos-runtime.md`

---

## 7. Health Report do Pipeline

### 7.1 Comando
```bash
npm run assets:audit
```

Resumo operacional complementar:
```bash
npm run assets:health-report
```

Já gera resumo executivo:
```
=== SUMMARY ===
OK:      2
Warning: 1
Error:   0
```

### 7.2 Interpretação

| Summary | Situação | Ação |
|---------|----------|------|
| Errors = 0, Warnings = 0 | 🟢 Excelente | Continue assim |
| Errors = 0, Warnings < 5 | 🟡 Bom | Considerar limpeza incremental |
| Errors = 0, Warnings >= 5 | 🟠 Atenção | Priorizar higiene próximo cycle |
| Errors > 0 | 🔴 Crítico | Corrigir imediatamente |

---

## 8. Normas de Higiene

### 8.1 Frequência de Review
- **Diária**: Rodar audit em cada PR
- **Semanal**: Revisar JSON reports acumulados
- **Mensal**: Avaliar allowlist e decidir limpezas
- **Trimestral**: Full cleanup cycle se warnings > 10 total

### 8.2 Limpeza Incremental Permitida

**Segura (pode fazer em qualquer tijolo)**:
- Deletar órfãos com justificativa clara
- Adicionar órfãos conhecidos à allowlist
- Atualizar manifest para absorver variante útil

**Requer planejamento (tijolo dedicado)**:
- Renomear múltiplos assets
- Migrar estrutura de pastas
- Refactor de naming convention

---

## 9. Casos Especiais

### 9.1 Experimental Features
Assets de features ainda não ativas:
- Podem ficar como órfãos temporários
- Devem ter comentário no README local do pack
- Após feature ativar: adicionar ao manifest
- Se feature cancelar após 2 sprints: deletar

### 9.2 A/B Test Variants
Assets para experimentos:
- Ambas variantes no manifest sob keys diferentes:
  ```json
  "ui-button-variant-a": "/path/button-a.svg",
  "ui-button-variant-b": "/path/button-b.svg"
  ```
- Após decisão: mover variante perdedora para órfão ou deletar

### 9.3 Rollback Safety
Manter v1 quando v2 está ativa:
- Aceitável por 2-4 sprints
- Adicionar à allowlist se ultrapassar esse período
- Documentar razão: "rollback safety - delete after 2026-06-01"

---

## 10. Responsabilidades

| Papel | Responsabilidade |
|-------|------------------|
| **Asset Pipeline Maintainer** | Rodar audit semanalmente, revisar warnings, propor limpezas |
| **Principal Engineer** | Aprovar allowlist changes, decidir entre limpar vs documentar |
| **Produção Externa (Art/Audio)** | Seguir naming convention, colocar em pasta correta |
| **Game Developer** | Atualizar manifest ao integrar novo asset |
| **CI/CD** | Bloquear merge se errors > 0 |

---

## 11. Changelog da Política

| Data | Versão | Mudança |
|------|--------|---------|
| 2026-03-09 | 1.0.0 | Política inicial (T46) |
| 2026-03-08 | 1.1.0 | CI dedicado oficializado + metadata obrigatória de revisão da allowlist (T47) |

---

## Anexo: Exemplos de Output

### Exemplo 1: Status OK
```
✓ Cooperativa na Pressao (cooperativa-na-pressao)
  Status: OK
  Assets: 5/5 valid
```
**Ação**: Nenhuma.

### Exemplo 2: Warning Aceitável
```
⚠ Mutirao do Bairro (mutirao-do-bairro)
  Status: WARNING
  Assets: 20/20 valid
  Orphaned: 3
  Issues:
    ⚠ [WARNING] orphan_file: ui-action-defender-v1.svg
```
**Ação**: Revisar se v1 ainda é necessária, adicionar à allowlist ou deletar em próximo cycle.

### Exemplo 3: Error Bloqueante
```
✗ Jogo Exemplo (jogo-exemplo)
  Status: ERROR
  Assets: 10/12 valid
  Missing: 2
  Issues:
    ✗ [ERROR] asset_missing: /path/obrigatório.svg
```
**Ação**: BLOQUEIA merge. Adicionar arquivo ou corrigir manifest antes de integrar.
