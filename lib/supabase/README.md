# Supabase Configuration

## Required Environment Variables

Create a `.env.local` file in the project root with:

```env
# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Guide

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and public anon key
3. Paste them in `.env.local`
4. Run `npm run dev`

## Current Behavior

- **Without Supabase:** App works in local/mock mode. Games use catalog.ts
- **With Supabase:** Ready for future integrations (auth, persistence, analytics)

## Future Phases

- **Tijolo 03:** User authentication + persistence
- **Tijolo 04:** Game state storage + analytics
- **Tijolo 05+:** Real-time, multiplayer, advanced features

---

See [docs/arquitetura.md](../../docs/arquitetura.md) for technical details.
