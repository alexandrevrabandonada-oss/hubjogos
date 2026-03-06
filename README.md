# Hub de Jogos da Pré-Campanha

## 📋 Overview

PWA modular de jogos e experiências interativas para pré-campanha política. Transforma pautas reais em experiências jogáveis, compartilháveis e orientadas para consciência e ação.

**Status:** Tijolo 02 - Scaffold Next.js Completo ✅

## 🚀 Start Rápido

```bash
# Instalar dependências (já feito)
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar verificação
npm run verify
```

Acesse [http://localhost:3000](http://localhost:3000) após `npm run dev`

## 🏗️ Estrutura Atual (Completa)

```
app/                  # ✅ Next.js App Router (pronto)
├── page.tsx         # ✅ Home intuitiva
├── explorar/        # ✅ Browse experiences
├── play/[slug]/     # ✅ Dynamic game page
├── sobre/           # ✅ About project
├── participar/      # ✅ Get involved / contribute
└── layout.tsx       # ✅ Root layout com Header

components/          # ✅ React components
├── layout/         # Header, Navigation
═── hub/            # GameCard e componentes de jogos
└── ui/             # Componentes reutilizáveis

lib/                 # ✅ Business logic
├── design/         # Design tokens (cores, spacing, tipografia)
├── games/          # Catalog de 6 experiências mockadas
├── supabase/       # DB client integrado, funciona sem env
└── hooks/          # React hooks (futuros)

styles/              # ✅ CSS global com design system
public/              # ✅ Assets (manifest.json, placeholders)
docs/                # ✅ Documentação (blueprint + roadmap)
reports/             # ✅ Progress reports
tools/               # ✅ Scripts (verify, report generation)
```

## 📚 Documentação Principal

- [Briefing](docs/briefing.md) - Visão, público, objetivos
- [Arquitetura](docs/arquitetura.md) - Tech stack, fluxo de dados
- [Roadmap](docs/roadmap.md) - Fases (tijolos), timeline
- [Tijolos Protocol](docs/tijolos.md) - Execução incremental
- [Identidade Visual](docs/identidade-visual.md) - Design guidelines

## 🎮 O Que Está Pronto (Tijolo 02)

✅ **Aplicação executável** - Next.js 14, TypeScript, pronto para produção  
✅ **Home intuitiva** - Apresenta conceito, hero section, CTA  
✅ **Página /explorar** - Catálogo de 6 experiências (mockadas localmente)  
✅ **Páginas dinâmicas** - /play/[slug] com estrutura real de jogo  
✅ **Design System** - Tokens de cores, spacing, tipografia  
✅ **Componentes-base** - Header navegável, GameCard responsivo  
✅ **Estilos globais** - CSS limpo, dark mode, mobile-first  
✅ **PWA pronto** - manifest.json, metadados, ícones placeholder  
✅ **TypeScript** - Type safety completo  
✅ **Supabase client** - Integração segura (funciona sem DB)  
✅ **Build validado** - `npm run build` passa 100%  
✅ **Verify 100%** - 41/41 checks passando  

## 🔧 Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| Framework | **Next.js 14** |
| Language | **TypeScript** |
| Styling | **CSS Modules** |
| UI Base | **React 18** |
| Database | **Supabase** (optional) |
| Hosting | **Vercel** (ready) |
| Linting | **ESLint** |
| Formatting | **Prettier** |

## 📱 Design & UX

🎨 **Identidade:** Urbano/Industrial, inspirado em VR Abandonada  
🎨 **Cores:** Dark base (#0a0e27), accent pink (#ff1493), cyan (#00d9ff), yellow (#ffb81c)  
🎨 **Typography:** Inter + JetBrains Mono  
🎨 **Mobile-first:** Responsivo de 320px+  
🎨 **Acessibilidade:** WCAG AA target, sem placeholder genérico  

## 📊 Scripts Disponíveis

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build (validado ✅)
npm run start        # Run production build
npm run lint         # ESLint check
npm run type-check   # TypeScript validation
npm run verify       # Full project verification
npm run report       # Generate status report
```

## 🌐 Rotas Implementadas

| Rota | Status | Descrição |
|------|--------|-----------|
| `/` | ✅ Live | Home intuitiva com hero + featured |
| `/explorar` | ✅ Live | Grid de 6 experiências |
| `/play/[slug]` | ✅ Framework | Página dinâmica (engine placeholder) |
| `/sobre` | ✅ Live | About project, stack, team |
| `/participar` | ✅ Live | Get involved, contribute info |
| `/404` | ✅ Custom | 404 page on non-existent game |

## 🔌 Supabase Integration

Integração segura - **app funciona sem Supabase conectado**.

Para conectar opcionalmente, crie `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Ver [lib/supabase/README.md](lib/supabase/README.md) para detalhes.

## 🎮 Experiências (Mockadas)

1. **Voto Consciente** 🗳️ - Quiz sobre pautas (🔴 Ao Vivo)
2. **Cidade Real** 🏙️ - Simulador orçamentário (🟡 Beta)
3. **Abandonado** 🏚️ - Mapeamento de memória urbana (⭕ Em Breve)
4. **Escolhas Impossíveis** ⚖️ - Dilemas do trabalho (⭕ Em Breve)
5. **Memória Coletiva** 🧩 - Jogo de associação (⭕ Em Breve)
6. **Transporte Urgente** 🏃 - Narrativa interativa (⭕ Em Breve)

Todas em `/lib/games/catalog.ts` pronto para future game engines.

## 🎯 O Que Está Mockado/Pendente

⭕ **Game Engines** - Placeholders em /play/[slug], pronto p/ Tijolo 03  
⭕ **User Auth** - Planejado Tijolo 03  
⭕ **Persistência** - Planejado Tijolo 03  
⭕ **Analytics** - Planejado Tijolo 04  
⭕ **Real-time multiplayer** - Futuro  
⭕ **Assets finais** - Usando placeholders (emojis, cores)  

## 📈 Próximar Passos (Tijolo 03)

**Design System Refinado**
- Storybook para componentes
- Reutilização em todas as páginas
- Refinamento de tokens

**Primeira Game Engine Real**
- Provavelmente "Voto Consciente"
- Mechanics funcional, score system
- Persistência com Supabase

**User Flow & Feedback**
- Ciclos rápidos de teste
- Refinamento de UX
- Mobile testing real

## 📋 Verificação Final

```
✓ Structure:        41/41 passed
✓ Build:            SUCCESS
✓ TypeScript:       strict mode enabled
✓ ESLint:           0 errors
✓ PWA:              manifest configured
✓ Supabase:         client ready
```

Ver [`npm run verify`](#-scripts-disponíveis) para detalhes completos.

## 🚀 Deploy

Pronto para Vercel. Simplesmente:
```bash
git push origin main
```

Vercel detecta, built, e deploya automaticamente.

## 📖 Mais Informações

- Documentação anterior: [docs/](docs/)
- Relatórios de progresso: [reports/](reports/)
- Issues & PRs: [GitHub](https://github.com/alexandrevrabandonada-oss/hubjogos)

---

**Espinha executável de um ecossistema jogável de pré-campanha.**  
Última atualização: 2026-03-05 | Versão: 0.2.0 (Tijolo 02)

## 📱 Princípios de Design

- **Mobile-first:** Experiência otimizada para dispositivos móveis
- **Compartilhável:** Designs shareable em redes sociais
- **Rápido:** Performance e PWA essenciais
- **Modular:** Arquitetura de plugins/módulos de jogos
- **Identidade Visual:** Inspirada em universo urbano/industrial (VR Abandonada)

## 🎮 Roadmap - Em Desenvolvimento

### Tijolo 01: ✅ Estrutura Base (em progresso)
- Diagnóstico e configuração inicial
- Documentação de produto e técnica
- Estrutura de pastas
- Convenções do projeto

### Tijolo 02: Next.js Setup
- Scaffold completo Next.js
- Configuração Supabase
- Setup de deploy Vercel
- TypeScript + ESLint

### Tijolo 03: Design System
- Componentes base (botões, cards, layouts)
- Identidade visual implementada
- PWA manifest

### Tijolo 04: First Game Module
- Módulo de jogo inaugural
- Mechanics e user flow
- Persistência com Supabase

## 🔄 Fluxo de Desenvolvimento

Cada "tijolo" segue:
1. **Diagnóstico** antes de alterações
2. **Implementação** idempotente
3. **Verificação** com `npm run verify`
4. **Relatório** em `reports/`

## ✅ Verificação

```bash
npm run verify
```

Executa checagens do estado atual do projeto.

## 📖 Mais Informações

Consulte a documentação em `docs/` para detalhes sobre:
- Especificação técnica
- Padrões de código
- Fluxo de feature branches
- Política de patches

## 📄 Status & Relatórios

Relatórios de cada fase: [`reports/`](reports/)

---

**Fundação de um ecossistema jogável de pré-campanha.**
