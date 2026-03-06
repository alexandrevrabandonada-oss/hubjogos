# Hub de Jogos da Pré-Campanha

## 📋 Overview

PWA modular de jogos e experiências interativas para pré-campanha política. Transforma pautas reais em experiências jogáveis, compartilháveis e orientadas para consciência e ação.

**Status:** Foundational Phase (Tijolo 01 - Estrutura Base)

## 🏗️ Estrutura do Projeto

```
├── app/              # Next.js app directory (será implementado no Tijolo 02)
├── components/       # Componentes React reutilizáveis
├── lib/             # Utilities, hooks, helpers
├── public/          # Assets estáticos
├── styles/          # CSS/SCSS globais e module styles
├── docs/            # Documentação técnica e de produto
├── reports/         # Relatórios de progresso por tijolo
├── tools/           # Scripts de automação
└── .github/         # GitHub workflows e configurações
```

## 📚 Documentação

- [briefing.md](docs/briefing.md) - Visão geral e objetivos do produto
- [arquitetura.md](docs/arquitetura.md) - Arquitetura técnica macro
- [roadmap.md](docs/roadmap.md) - Plano de desenvolvimento por fases
- [tijolos.md](docs/tijolos.md) - Protocolo de execução por tijolos
- [identidade-visual.md](docs/identidade-visual.md) - Diretrizes visuais

## 🚀 Quick Start

```bash
# Install dependencies (when available)
npm install

# Run verification
npm run verify

# Development (to be configured in Tijolo 02)
npm run dev
```

## 🔧 Stack

- **Framework:** Next.js 14+ (framework)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Version Control:** GitHub
- **Language:** TypeScript (future)

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
