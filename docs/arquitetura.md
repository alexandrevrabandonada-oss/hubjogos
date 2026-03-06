# Arquitetura Técnica - Hub de Jogos da Pré-Campanha

## 🏗️ Visão Macro

```
┌─────────────────────────────────────────────────────────────┐
│                        USER (Mobile/Web)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    VERCEL (Hosting)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Next.js 14+ App Router                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  app/              - Server Components (RSC)     │ │ │
│  │  │  components/       - Client Components          │ │ │
│  │  │  lib/              - Utilities & Hooks          │ │ │
│  │  │  styles/           - CSS & Design System        │ │ │
│  │  │  public/           - Static Assets              │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  API Routes (/app/api)                          │ │ │
│  │  │  - Game State Management                        │ │ │
│  │  │  - User Analytics                              │ │ │
│  │  │  - Supabase Integration                         │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              SUPABASE (Backend & Database)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                         │  │
│  │  - users, sessions                                   │  │
│  │  - game_states, scores                              │  │
│  │  - social_shares, analytics                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth (JWT)                                         │  │
│  │  - Email/Social logins                              │  │
│  │  - Session management                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage (CDN)                                      │  │
│  │  - Game assets, images                              │  │
│  │  - Shareable preview images                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Real-time (WebSocket)                              │  │
│  │  - Multiplayer mechanics (future)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
hub-jogos-pre-campanha/
├── app/
│   ├── (auth)/              # Auth routes group
│   │   ├── login/
│   │   └── signup/
│   ├── (hub)/               # Hub routes group
│   │   ├── page.tsx         # Hub homepage
│   │   └── [gameSlug]/      # Dynamic game routes
│   ├── api/
│   │   ├── auth/
│   │   ├── games/
│   │   └── analytics/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing/redirect
│
├── components/
│   ├── games/               # Game-specific components
│   ├── ui/                  # Design system components
│   ├── layout/              # Layout components
│   └── shared/              # Shared utilities
│
├── lib/
│   ├── supabase/            # Supabase client & queries
│   ├── games/               # Game logic & engines
│   ├── hooks/               # React hooks
│   ├── utils/               # Utility functions
│   └── types.ts             # TypeScript types
│
├── styles/
│   ├── globals.css          # Global styles
│   ├── variables.css        # CSS variables
│   └── modules/             # CSS modules by feature
│
├── public/
│   ├── assets/              # Brand assets
│   ├── games/               # Game-specific assets
│   └── icons/               # App icons, favicons
│
├── docs/                    # Product & technical docs
├── reports/                 # Progress reports per tijolo
├── tools/                   # Automation scripts
├── .github/workflows/       # CI/CD pipelines
│
├── .env.local               # Local environment (git ignored)
├── package.json
├── tsconfig.json            # TypeScript config (future)
├── next.config.js           # Next.js config (future)
└── README.md
```

## 🎮 Arquitetura de Módulos de Jogo

Cada jogo é um **módulo independente** com:

```typescript
// lib/games/[gameName]/
├── index.ts              # Exports públicas
├── engine.ts             # Game logic
├── types.ts              # Game-specific types
├── hooks.ts              # Game hooks
└── utils.ts              # Game utilities
```

**Contract de um Módulo:**
```typescript
interface GameModule {
  id: string;              // ex: "voto-consciente"
  title: string;           // Nome público
  icon: string;            // Asset path
  description: string;     // Descrição curta
  initialState: GameState; // Estado inicial
  reducer: (state, action) => state;  // State management
  shareableData: (state) => ShareData; // Data for social share
}
```

## 🔄 Fluxo de Dados

### 1. User Interaction (Client)
```
User Click → Component Event → Game Reducer → State Update → UI Re-render
```

### 2. State Persistence
```
Game State Change → API Call → Supabase Insert/Update → Optimistic Update UI
```

### 3. Social Sharing
```
Game Completion → Generate Share Data → Create Preview Image → Share URL + Metadata
```

### 4. Analytics
```
Game Event → Log to API → Supabase → Dashboard (future)
```

## 🔐 Padrões de Segurança

- **API Routes:** Verificar token JWT via Supabase client
- **Database:** Row-level security (RLS) policies
- **Assets:** CDN com cache headers otimizados
- **CORS:** Same-origin ou whitelisted domains

## ⚡ Performance

- **Code Splitting:** Lazy load game modules via dynamic imports
- **PWA:** Service Workers para offline capability
- **Caching:** Supabase SDK + Next.js Image Optimization
- **Metrics:** Core Web Vitals target: LCP <2.5s, FID <100ms, CLS <0.1

## 🚀 Deployment Pipeline

```
GitHub Push → Vercel Build → Preview Deploy → Production Deploy
     ↓               ↓              ↓
   Webhook      TypeScript       E2E Tests
                ESLint           Lighthouse
```

## 📊 Escalabilidade

- **Database:** Supabase managed PostgreSQL, auto-scaling
- **CDN:** Vercel Edge Network
- **Real-time:** Supabase Realtime para multiplayer (futuro)
- **Functions:** Edge Functions se necessário (futuro)

## 🔮 Extensibilidade

Cada novo jogo:
1. Cria pasta em `lib/games/[newGame]`
2. Implementa interface `GameModule`
3. Registra em `lib/games/index.ts`
4. Components em `components/games/[newGame]`
5. Route em `app/(hub)/[gameSlug]`

---

**Última atualização:** 2026-03-05  
**Versão:** 0.1 (Foundational)
