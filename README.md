# Hub de Jogos da Pré-Campanha

Produto político-jogável para transformar pauta pública em decisão, consequência e ação.

Status atual: **Tijolo 04 concluído** (produto operável).

## O que é real agora

### Engines reais

1. **Voto Consciente** (`quiz`)
2. **Transporte Urgente** (`branching_story`)

As duas já rodam em `/play/[slug]` com runtime unificado.

### Persistência real

- localStorage: sempre ativo (fallback padrão)
- Supabase: opcional e resiliente (não quebra sem env)
- registros: sessão, eventos e resultado

### Analytics reais

Eventos disponíveis:

- `game_view`
- `game_start`
- `step_advance`
- `game_complete`
- `result_copy`
- `link_copy`
- `cta_click`

### Share mínimo real

- copiar resumo
- copiar link
- feedback visual de sucesso/erro

## O que ainda é mock/shell

- engines para parte dos módulos (`simulation`, `map`, etc.)
- compartilhamento avançado com card dinâmico
- dashboards de analytics

## Stack

- Next.js 14 + App Router
- React 18 + TypeScript
- CSS Modules + design tokens
- Supabase opcional

## Rodar localmente

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha se quiser Supabase.

Sem envs, o app continua funcional com persistência local.

## Validação

```bash
npm run lint
npm run type-check
npm run build
npm run verify
```

## Documentação

- [docs/arquitetura.md](docs/arquitetura.md)
- [docs/roadmap.md](docs/roadmap.md)
- [docs/tijolos.md](docs/tijolos.md)
- [docs/identidade-visual.md](docs/identidade-visual.md)
- [supabase/tijolo-04-minimal-schema.sql](supabase/tijolo-04-minimal-schema.sql)

Última atualização: 2026-03-06
