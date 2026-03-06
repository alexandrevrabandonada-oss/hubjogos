-- Schema mínimo opcional para Tijolo 04
-- Objetivo: receber sessões, eventos e resultados sem auth obrigatória.

create table if not exists public.game_sessions (
  id bigserial primary key,
  session_id text unique not null,
  anonymous_id text not null,
  slug text not null,
  engine_kind text not null,
  engine_id text,
  status text not null default 'started',
  started_at timestamptz not null,
  completed_at timestamptz
);

create table if not exists public.game_events (
  id bigserial primary key,
  session_id text not null,
  anonymous_id text not null,
  event_name text not null,
  slug text not null,
  engine_kind text not null,
  engine_id text,
  step text,
  result_id text,
  cta_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null
);

create table if not exists public.game_results (
  id bigserial primary key,
  session_id text not null,
  anonymous_id text not null,
  slug text not null,
  engine_kind text not null,
  engine_id text,
  result_id text not null,
  result_title text not null,
  summary text not null,
  created_at timestamptz not null
);

-- Índices úteis
create index if not exists idx_game_sessions_slug on public.game_sessions(slug);
create index if not exists idx_game_events_slug on public.game_events(slug);
create index if not exists idx_game_events_name on public.game_events(event_name);
create index if not exists idx_game_results_slug on public.game_results(slug);

-- RLS opcional (libere insert para anon se quiser operar sem auth)
alter table public.game_sessions enable row level security;
alter table public.game_events enable row level security;
alter table public.game_results enable row level security;

-- Políticas mínimas (insere e leitura agregada)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'game_sessions' and policyname = 'Allow anon insert sessions'
  ) then
    create policy "Allow anon insert sessions" on public.game_sessions
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'game_events' and policyname = 'Allow anon insert events'
  ) then
    create policy "Allow anon insert events" on public.game_events
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'game_results' and policyname = 'Allow anon insert results'
  ) then
    create policy "Allow anon insert results" on public.game_results
      for insert
      to anon
      with check (true);
  end if;
end $$;
