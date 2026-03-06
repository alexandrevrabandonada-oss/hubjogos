# Tijolos - Protocolo de Execução

## 📜 O Que é um "Tijolo"?

Um **tijolo** é uma iteração bem-definida e entregável de desenvolvimento. Cada tijolo:

1. **Começa com diagnóstico** do estado anterior
2. **Implementa features/infrastructure** específicas
3. **Valida com `npm run verify`**
4. **Gera relatório** detalhado
5. **Deixa projeto em estado pronto** para próximo tijolo

A metáfora: tijolos são a **fundação construída incrementalmente**. Cada um é **sólido**, **documentado** e **não quebra o anterior**.

---

## 🎯 Protocolo por Tijolo

### **Fase 1: Planejamento**

Antes de começar:

```markdown
Tijolo XX - [Nome]

**Objetivo:** [sentence única]

**Escopo:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task N

**Entrada:** [Estado esperado do projeto]
**Saída Esperada:** [O que será entregue]
**Duração Estimada:** X semanas
```

### **Fase 2: Execução**

Durante o desenvolvimento:

1. **Diagnóstico inicial** - Verificar estado anterior, checklist de pré-requisitos
2. **Implementação** - Adicionar features/infra
3. **Testes** - `npm run verify` com 100% de sucesso
4. **Documentação** - Atualizar docs/ conforme necessário
5. **Code Review** - Peer review (quando aplicável)

### **Fase 3: Validação**

Antes de encerrar:

```bash
# Rodar verificação completa
npm run verify

# Se tiver testes
npm run test

# Se tiver lint
npm run lint

# Se tiver build
npm run build
```

Se tudo passar → Próxima fase. Caso contrário → voltar para Execução.

### **Fase 4: Documentação & Relatório**

**Relatório obrigatório** em `reports/YYYY-MM-DD-HHMM-tijolo-XX-[nome].md`

**Conteúdo mínimo:**

```markdown
# Tijolo XX - [Nome]

**Data:** 2026-03-05
**Responsável:** [Nome]
**Status:** ✅ Completo / 🟡 Parcial / ❌ Cancelado

## 🎯 Objetivo

[Reiteir objetivo único]

## 📊 Diagnóstico Anterior

- Estado do repo no início
- Lacunas identificadas
- Pré-requisitos cumpridos?

## ✅ O Que Foi Feito

- [x] Task 1 - descritivo
- [x] Task 2
- [x] Task N

## 📝 O Que Foi Alterado

### Arquivos Criados
- `path/file.ext` - descrição

### Arquivos Modificados
- `path/file.ext` - o que mudou

### Arquivos Deletados
- Nenhum (ou listar se houver)

## 🔧 Decisões Técnicas

**Decisão 1: [Tema]**
- Opção A vs Opção B
- **Escolhida:** Opção B
- **Justificativa:** Porque...

**Decisão 2: [Tema]**
- ...

## 📋 Scripts Disponíveis

```bash
npm run verify    # Estado do projeto
npm run dev       # Descrição
npm run build     # Descrição
```

(Listar scripts adicionados/alterados neste tijolo)

## 🚨 Problemas Encontrados

- **Problema 1:** Descrição. Solução: Como se resolveu.
- **Problema 2:** ...

(Se nenhum, escrever "Nenhum bloqueador identificado")

## ⚠️ Riscos & Lacunas

- **Risco 1:** Descrição. Mitigação: Como se mitiga.
- **Lacuna 1:** O que ainda não existe / não foi feito.

## 📊 Resultado do `npm run verify`

\`\`\`
[Cole saída completa do verify]
\`\`\`

**Status:** ✅ PASSOU / ❌ FALHOU

## 🎬 Próximos Passos

1. Descrição do Tijolo XX+1
2. Pré-requisitos para próximo
3. Estimativa de tempo

## 📌 Observações

[Qualquer contexto adicional útil]

---

**Relatório gerado:** [timestamp]
```

---

## 🔄 Convenções de Codificação

### Estrutura de Pastas

```
- Criar em `docs/` para documentação
- Salvar assets em `public/` (organizados por feature)
- Componentes React em `components/` (organizados por feature)
- Lógica em `lib/` (utilities, hooks, helpers)
- Testes ao lado dos arquivos: `file.test.ts`
```

### Nomes de Arquivos

```
- camelCase para JS/TS: myComponent.ts
- kebab-case para CSS: my-styles.css
- PascalCase para componentes React: MyComponent.tsx
- SCREAMING_SNAKE_CASE para constantes: API_KEY
```

### Nomes de Branches (Git)

```
feature/tijolo-XX-nome-descritivo
fix/issue-description
docs/update-readme
```

### Commits

```
[Tijolo XX] Feature description (atomic commits)
[Tijolo XX] Fix: description
[Tijolo XX] Docs: update file.md
```

---

## 📊 Matriz de Verificação

Cada tijolo deve validar:

| Item | Verificação |
|------|-------------|
| Planejamento | Escopo e objective claros? |
| Código | Lint pass? Type check pass? Build pass? |
| Testes | Testes novos/alterados? Coverage OK? |
| Docs | README, docs/ e código documentados? |
| Relatório | Relatório gerado conforme template? |
| Safe | Nenhum breaking change? |
| Ready | Pronto para deploy? |

---

## 🚀 Exemplo de Fluxo Completo

```bash
# 1. Criar branch
git checkout -b feature/tijolo-02-nextjs-setup

# 2. Implementar
[... fazer o trabalho ...]

# 3. Verificar
npm run verify

# 4. Commit
git add .
git commit -m "[Tijolo 02] Next.js setup com TypeScript"

# 5. Push
git push origin feature/tijolo-02-nextjs-setup

# 6. PR + Review
[... criar PR, review, merge ...]

# 7. Relatório
npm run report  # Gera relatório em reports/

# 8. Tag (opcional, para milestones)
git tag tijolo-02 -m "Next.js setup complete"
git push origin tijolo-02
```

---

## ✅ Checklist Final por Tijolo

Antes de considerar um **tijolo** completo:

- [ ] Todas as tarefas concluídas
- [ ] `npm run verify` 100% passando
- [ ] Nenhum breaking change introduzido
- [ ] Documentação atualizada (docs/ + inline comments)
- [ ] Relatório gerado em `reports/`
- [ ] Code committed e pushed
- [ ] Próximo tijolo pode começar sem bloqueadores
- [ ] README reflete estado actual

---

## 🎭 Roles por Tijolo

| Role | Responsabilidade |
|------|-----------------|
| **Product Lead** | Escopo, prioridades, decisões |
| **Tech Lead** | Arquitetura, review técnico |
| **Developer(s)** | Implementação |
| **QA** | Testes, verificação |
| **DevOps** (futuro) | Deploy, infra |

---

## 📞 Comunicação

- **Estado:** Relatório em `reports/`
- **Bloqueadores:** Issue no GitHub com tag `impediment`
- **Próximos:** Roadmap em `docs/roadmap.md`
- **Standup:** Breve resumo ao final do tijolo

---

**Última atualização:** 2026-03-05  
**Versão:** 1.0 Protocolo de Tijolos
