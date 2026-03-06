# Roadmap - Hub de Jogos da Pré-Campanha

## 📅 Visão de Longo Prazo

```
Tijolo 01 (Ago 2026)       Setup base + documentação
      ↓
Tijolo 02 (Set 2026)       Next.js scaffold completo
      ↓
Tijolo 03 (Out 2026)       Design system + identidade visual
      ↓
Tijolo 04 (Nov 2026)       Primeiro jogo (MVP)
      ↓
Tijolo 05 (Dez 2026)       Deploy e testes de produção
      ↓
Fase Beta (Jan 2027)       Lançamento limitado + feedback
      ↓
Fase 1.0 (Fev 2027)        Lançamento público
      ↓
Fase 2.0+ (2027+)          Novos módulos, escalabilidade
```

## 🧱 Definição de Tijolos

### **Tijolo 01 - Estrutura Base** ✅ [em progresso]

**Objetivo:** Fundação documental, estrutural e operacional do projeto

**Escopo:**
- [x] Diagnóstico do estado atual
- [x] Documentação (briefing, arquitetura, roadmap, tijolos, identidade)
- [x] Estrutura de pastas mínima
- [x] Convenções do projeto
- [x] Script verify
- [x] Relatório Estado da Nação
- [ ] Próximo passo: pronto para Tijolo 02

**Deliverables:**
- Documentação completa
- Estrutura idempotente
- Script de verificação funcional

**Duração Estimada:** 1 semana  
**Responsável:** Product Engineering Lead

---

### **Tijolo 02 - Next.js Setup**

**Objetivo:** Scaffold Next.js 14+ completo com tooling essencial

**Escopo:**
- Inicializar projeto Next.js (app router)
- Configuração TypeScript
- Setup ESLint + Prettier
- Configuração Supabase client
- Setup Vercel (preview & production)
- GitHub Actions básico
- Dev + build + deploy scripts
- Testes E2E scaffold (Playwright)

**Verificação:**
- `npm run dev` funciona
- `npm run build` sem erros
- `npm run lint` passa
- `npm run type-check` passa
- `npm run verify` completo

**Duração Estimada:** 2 semanas  
**Responsável:** Tech Lead

---

### **Tijolo 03 - Design System**

**Objetivo:** Identidade visual implementada + componentes base

**Escopo:**
- Paleta de cores (inspira VR Abandonada)
- Tipografia
- Componentes base (Button, Card, Input, Modal, etc.)
- Layout components (Header, Footer, Grid)
- CSS/Tailwind setup
- PWA manifest + mobile icons
- Storybook (opcional)

**Verificação:**
- Componentes renderizam corretamente
- Mobile-first responsive
- Acessibilidade WCAG AA baseline
- Lighthouse 90+

**Duração Estimada:** 2-3 semanas  
**Responsável:** Design Engineer

---

### **Tijolo 04 - Primeiro Jogo (MVP)**

**Objetivo:** Um módulo de jogo completo, testado, shareable

**Escopo Options:**
1. **Voto Consciente** - Quiz sobre propostas
2. **Cidade Real** - Puzzle sobre orçamento
3. **Decodificador** - Identificar linguagem política

**Para o Jogo Escolhido:**
- Game engine + mechanics
- User flow completo
- Persistência com Supabase
- Social share (preview image + URL)
- Básico de analytics
- Testes funcionais

**Verificação:**
- Jogo jogável fim-a-fim
- Share gerando preview correto
- Dados salvando em Supabase
- Performance <2s load

**Duração Estimada:** 3-4 semanas  
**Responsável:** Full-Stack Developer

---

### **Tijolo 05 - Beta & Deployment**

**Objetivo:** Produto em staging pronto para testes

**Escopo:**
- Deploy staging Vercel
- Supabase production setup
- Testes E2E completos
- Performance optimization
- SEO/Meta tags
- Analytics dashboard básico
- Bug fixes

**Verificação:**
- Análise Lighthouse 90+
- Core Web Vitals green
- Load test 100+ simultâneos
- Relatório de bugs resolvidos

**Duração Estimada:** 2 semanas  
**Responsável:** QA + DevOps

---

### **Fase Beta** (Subsequente)

**Objetivo:** Lançamento limite + feedback real

**Atividades:**
- Convite para beta testers
- Coleta de feedback
- Hotfixes baseado em uso real
- Refinamento de mechanics
- Preparação para 1.0

---

### **Fase 1.0** (Subsequente)

**Objetivo:** Lançamento público

**Atividades:**
- PR/Marketing
- Comunicação em redes sociais
- Integração com campanhas reais
- Monitoramento em produção

---

## 🎯 Critérios de Sucesso por Tijolo

Cada tijolo deve atender:

✅ **Todas as tarefas planejadas completadas**  
✅ **Verificação (`npm run verify`) passando 100%**  
✅ **Relatório atualizado em `reports/`**  
✅ **Nenhum breaking change**  
✅ **Código em estado pronto para deploy**  
✅ **Documentação atualizada**  

---

## 📊 Timeline Visual

| Período | Tijolo | Status | Saída |
|---------|--------|--------|-------|
| Mar 2026 | 01 | 🟡 Em progresso | Docs + Setup |
| Abr 2026 | 02 | ⭕ Planejado | Next.js + Tooling |
| Mai 2026 | 03 | ⭕ Planejado | Design System |
| Jun 2026 | 04 | ⭕ Planejado | Game MVP |
| Jul 2026 | 05 | ⭕ Planejado | Beta Ready |
| Ago+ 2026 | Beta | ⭕ Planejado | Feedback Loop |
| 2027 | 1.0 | ⭕ Futuro | Público |

---

## 🔄 Dependencies Entre Tijolos

```
Tijolo 01 (Docs/Setup)
     ↓
Tijolo 02 (Next.js) ← Requer 01
     ↓
Tijolo 03 (Design) ← Requer 02 (opcional paralelo)
     ↓
Tijolo 04 (Game) ← Requer 02 + 03
     ↓
Tijolo 05 (Deploy) ← Requer 04
```

---

## 🛠️ Ferramenta de Tracking

Cada tijolo deve manter:
- **Status:** ⭕ Not Started | 🟡 In Progress | ✅ Complete
- **Checklist:** tarefas e progresso
- **Bloqueadores:** riscos identificados
- **Próximos passos:** dependências e recomendações

Ver [tijolos.md](tijolos.md) para protocolo detalhado.

---

**Última atualização:** 2026-03-05  
**Próxima revisão:** Após Tijolo 01 completo
