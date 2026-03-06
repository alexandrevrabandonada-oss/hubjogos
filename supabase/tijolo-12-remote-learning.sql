-- Tijolo 12 - Consolidação remota de aprendizado
-- Objetivo: feedback remoto, views analíticas e operação leve de triagem.

-- Bootstrap mínimo para projetos que ainda não aplicaram tijolos anteriores.
create table if not exists public.game_sessions (
  id bigserial primary key,
  session_id text unique not null,
  anonymous_id text not null,
  slug text not null,
  engine_kind text not null,
  engine_id text,
  status text not null default 'started',
  started_at timestamptz not null,
  completed_at timestamptz,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  initial_path text,
  experiments jsonb
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
  experiments jsonb,
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

alter table public.game_sessions add column if not exists utm_source text;
alter table public.game_sessions add column if not exists utm_medium text;
alter table public.game_sessions add column if not exists utm_campaign text;
alter table public.game_sessions add column if not exists utm_content text;
alter table public.game_sessions add column if not exists referrer text;
alter table public.game_sessions add column if not exists initial_path text;
alter table public.game_sessions add column if not exists experiments jsonb;
alter table public.game_events add column if not exists experiments jsonb;

create index if not exists idx_game_sessions_slug on public.game_sessions(slug);
create index if not exists idx_game_events_slug on public.game_events(slug);
create index if not exists idx_game_events_name on public.game_events(event_name);
create index if not exists idx_game_results_slug on public.game_results(slug);
create index if not exists idx_game_sessions_utm_source on public.game_sessions(utm_source);
create index if not exists idx_game_sessions_referrer on public.game_sessions(referrer);
create index if not exists idx_game_sessions_experiments on public.game_sessions using gin(experiments);

alter table public.game_sessions enable row level security;
alter table public.game_events enable row level security;
alter table public.game_results enable row level security;

create table if not exists public.feedback_records (
  id bigserial primary key,
  feedback_id text unique not null,
  session_id text not null,
  anonymous_id text not null,
  slug text not null,
  engine_kind text not null,
  rating text not null check (rating in ('positive', 'neutral', 'negative')),
  comment text,
  triage_status text not null default 'pending' check (triage_status in ('pending', 'reviewed', 'prioritario')),
  triaged_at timestamptz,
  created_at timestamptz not null
);

create index if not exists idx_feedback_slug on public.feedback_records(slug);
create index if not exists idx_feedback_engine on public.feedback_records(engine_kind);
create index if not exists idx_feedback_created_at on public.feedback_records(created_at desc);
create index if not exists idx_feedback_triage_status on public.feedback_records(triage_status);

alter table public.feedback_records enable row level security;

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

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'game_sessions' and policyname = 'Allow anon select sessions'
  ) then
    create policy "Allow anon select sessions" on public.game_sessions
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'game_events' and policyname = 'Allow anon select events'
  ) then
    create policy "Allow anon select events" on public.game_events
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'game_results' and policyname = 'Allow anon select results'
  ) then
    create policy "Allow anon select results" on public.game_results
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'feedback_records' and policyname = 'Allow anon insert feedback'
  ) then
    create policy "Allow anon insert feedback" on public.feedback_records
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'feedback_records' and policyname = 'Allow anon update feedback triage'
  ) then
    create policy "Allow anon update feedback triage" on public.feedback_records
      for update
      to anon
      using (id is not null)
      with check (
        triage_status in ('pending', 'reviewed') and 
        (triaged_at is null or triaged_at > now() - interval '24 hours')
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'feedback_records' and policyname = 'Allow anon select feedback'
  ) then
    create policy "Allow anon select feedback" on public.feedback_records
      for select
      to anon
      using (true);
  end if;
end $$;

create or replace view public.feedback_summary_by_game as
select
  slug,
  count(*) filter (where rating = 'positive')::int as positive,
  count(*) filter (where rating = 'neutral')::int as neutral,
  count(*) filter (where rating = 'negative')::int as negative,
  count(*) filter (where comment is not null and length(trim(comment)) > 0)::int as with_comments,
  count(*)::int as total
from public.feedback_records
group by slug;

create or replace view public.feedback_recent as
select
  feedback_id,
  session_id,
  anonymous_id,
  slug,
  engine_kind,
  rating,
  comment,
  triage_status,
  triaged_at,
  created_at
from public.feedback_records
order by created_at desc;

create or replace view public.beta_funnel_overview as
select
  count(*)::int as total_sessions,
  count(*) filter (where status = 'completed')::int as completions,
  (
    select count(*)::int
    from public.game_events e
    where e.event_name = 'game_start'
  ) as starts,
  (
    select count(*)::int
    from public.game_events e
    where e.event_name in ('result_copy', 'link_copy')
  ) as shares,
  (
    select count(*)::int
    from public.game_events e
  ) as total_events
from public.game_sessions;

create or replace view public.beta_events_overview as
select
  event_name,
  count(*)::int as total
from public.game_events
group by event_name
order by total desc;

create or replace view public.beta_sources_overview as
with base as (
  select
    coalesce(nullif(trim(utm_source), ''), nullif(split_part(referrer, '/', 3), ''), 'direto/desconhecido') as source,
    session_id,
    status
  from public.game_sessions
), starts as (
  select
    b.source,
    count(*)::int as starts
  from base b
  join public.game_events e on e.session_id = b.session_id
  where e.event_name = 'game_start'
  group by b.source
), shares as (
  select
    b.source,
    count(*)::int as shares
  from base b
  join public.game_events e on e.session_id = b.session_id
  where e.event_name in ('result_copy', 'link_copy')
  group by b.source
)
select
  b.source,
  count(*)::int as sessions,
  coalesce(s.starts, 0)::int as starts,
  count(*) filter (where b.status = 'completed')::int as completions,
  coalesce(sh.shares, 0)::int as shares,
  case
    when count(*) = 0 then 0
    else round((count(*) filter (where b.status = 'completed')::numeric / count(*)::numeric) * 100)
  end::int as completion_rate
from base b
left join starts s on s.source = b.source
left join shares sh on sh.source = b.source
group by b.source, s.starts, sh.shares
order by sessions desc;

create or replace view public.beta_game_overview as
with starts as (
  select
    slug,
    count(*)::int as starts
  from public.game_events
  where event_name = 'game_start'
  group by slug
), shares as (
  select
    slug,
    count(*)::int as shares
  from public.game_events
  where event_name in ('result_copy', 'link_copy')
  group by slug
), feedback as (
  select
    slug,
    count(*) filter (where rating = 'positive')::int as feedback_positive,
    count(*) filter (where rating = 'neutral')::int as feedback_neutral,
    count(*) filter (where rating = 'negative')::int as feedback_negative
  from public.feedback_records
  group by slug
)
select
  s.slug,
  count(*)::int as initiated,
  count(*) filter (where s.status = 'completed')::int as completed,
  coalesce(sh.shares, 0)::int as shares,
  case
    when count(*) = 0 then 0
    else round((count(*) filter (where s.status = 'completed')::numeric / count(*)::numeric) * 100)
  end::int as completion_rate,
  coalesce(f.feedback_positive, 0)::int as feedback_positive,
  coalesce(f.feedback_neutral, 0)::int as feedback_neutral,
  coalesce(f.feedback_negative, 0)::int as feedback_negative
from public.game_sessions s
left join starts st on st.slug = s.slug
left join shares sh on sh.slug = s.slug
left join feedback f on f.slug = s.slug
group by s.slug, st.starts, sh.shares, f.feedback_positive, f.feedback_neutral, f.feedback_negative
order by initiated desc;

create or replace view public.beta_engine_overview as
with starts as (
  select
    engine_kind,
    count(*)::int as starts
  from public.game_events
  where event_name = 'game_start'
  group by engine_kind
), shares as (
  select
    engine_kind,
    count(*)::int as shares
  from public.game_events
  where event_name in ('result_copy', 'link_copy')
  group by engine_kind
)
select
  s.engine_kind,
  count(*)::int as sessions,
  coalesce(st.starts, 0)::int as starts,
  count(*) filter (where s.status = 'completed')::int as completions,
  coalesce(sh.shares, 0)::int as shares,
  case
    when count(*) = 0 then 0
    else round((count(*) filter (where s.status = 'completed')::numeric / count(*)::numeric) * 100)
  end::int as completion_rate
from public.game_sessions s
left join starts st on st.engine_kind = s.engine_kind
left join shares sh on sh.engine_kind = s.engine_kind
group by s.engine_kind, st.starts, sh.shares
order by sessions desc;

create or replace view public.experiment_performance as
with session_experiments as (
  select
    s.session_id,
    s.status,
    exp.key as experiment_key,
    exp.variant as variant
  from public.game_sessions s
  cross join lateral jsonb_to_recordset(
    case
      when jsonb_typeof(s.experiments) = 'array' then s.experiments
      else '[]'::jsonb
    end
  ) as exp(key text, variant text)
)
select
  experiment_key,
  variant,
  count(*)::int as sessions,
  count(*) filter (where status = 'completed')::int as completions,
  case
    when count(*) = 0 then 0
    else round((count(*) filter (where status = 'completed')::numeric / count(*)::numeric) * 100)
  end::int as completion_rate
from session_experiments
group by experiment_key, variant
order by experiment_key, sessions desc;

-- Tijolo 17 - Circulação disciplinada (views complementares)

create or replace view public.beta_circulation_placement_overview as
with views as (
  select
    coalesce(nullif(trim(e.metadata->>'placement'), ''), 'outcome_page') as placement,
    count(*)::int as outcome_views
  from public.game_events e
  where e.event_name = 'outcome_view'
  group by 1
), clicks as (
  select
    coalesce(nullif(trim(e.metadata->>'placement'), ''),
      case when e.event_name = 'primary_cta_click' then 'outcome_primary' else 'outcome_secondary' end
    ) as placement,
    count(*)::int as clicks
  from public.game_events e
  where e.event_name in ('primary_cta_click', 'secondary_cta_click')
  group by 1
)
select
  coalesce(v.placement, c.placement) as placement,
  coalesce(v.outcome_views, 0)::int as outcome_views,
  coalesce(c.clicks, 0)::int as clicks,
  case
    when coalesce(v.outcome_views, 0) = 0 then 0
    else round((coalesce(c.clicks, 0)::numeric / v.outcome_views::numeric) * 100)
  end::int as ctr
from views v
full join clicks c on c.placement = v.placement
order by outcome_views desc, clicks desc;

create or replace view public.beta_circulation_cta_overview as
select
  coalesce(nullif(trim(cta_id), ''), 'unknown') as cta_id,
  count(*)::int as clicks,
  max(nullif(trim(metadata->>'trackingId'), '')) as tracking_id,
  max(nullif(trim(metadata->>'category'), '')) as category
from public.game_events
where event_name in ('primary_cta_click', 'secondary_cta_click')
group by 1
order by clicks desc;

create or replace view public.beta_circulation_reentry_overview as
select
  count(*) filter (where event_name = 'share_page_view')::int as share_page_views,
  count(*) filter (where event_name = 'next_game_click')::int as next_game_clicks,
  count(*) filter (where event_name = 'hub_return_click')::int as hub_return_clicks,
  (
    count(*) filter (where event_name = 'next_game_click') +
    count(*) filter (where event_name = 'hub_return_click')
  )::int as reentry_actions,
  case
    when count(*) filter (where event_name = 'share_page_view') = 0 then 0
    else round((
      (
        count(*) filter (where event_name = 'next_game_click') +
        count(*) filter (where event_name = 'hub_return_click')
      )::numeric
      /
      (count(*) filter (where event_name = 'share_page_view'))::numeric
    ) * 100)
  end::int as reentry_rate
from public.game_events
where event_name in ('share_page_view', 'next_game_click', 'hub_return_click');

create or replace view public.beta_exit_by_source as
with exits as (
  select
    e.session_id,
    coalesce(nullif(trim(s.utm_source), ''), nullif(split_part(s.referrer, '/', 3), ''), 'direto/desconhecido') as source
  from public.game_events e
  left join public.game_sessions s on s.session_id = e.session_id
  where e.event_name in ('primary_cta_click', 'secondary_cta_click', 'next_game_click', 'hub_return_click')
), source_sessions as (
  select
    coalesce(nullif(trim(utm_source), ''), nullif(split_part(referrer, '/', 3), ''), 'direto/desconhecido') as source,
    count(*)::int as sessions
  from public.game_sessions
  group by 1
)
select
  e.source,
  count(*)::int as exits,
  coalesce(ss.sessions, 0)::int as sessions,
  case
    when coalesce(ss.sessions, 0) = 0 then 0
    else round((count(*)::numeric / ss.sessions::numeric) * 100)
  end::int as exit_rate
from exits e
left join source_sessions ss on ss.source = e.source
group by e.source, ss.sessions
order by exits desc;

create or replace view public.beta_exit_by_game as
with exits as (
  select
    slug,
    count(*)::int as exits
  from public.game_events
  where event_name in ('primary_cta_click', 'secondary_cta_click', 'next_game_click', 'hub_return_click')
  group by slug
), sessions as (
  select
    slug,
    count(*)::int as sessions
  from public.game_sessions
  group by slug
)
select
  coalesce(e.slug, s.slug) as slug,
  coalesce(e.exits, 0)::int as exits,
  coalesce(s.sessions, 0)::int as sessions,
  case
    when coalesce(s.sessions, 0) = 0 then 0
    else round((coalesce(e.exits, 0)::numeric / s.sessions::numeric) * 100)
  end::int as exit_rate
from exits e
full join sessions s on s.slug = e.slug
order by exits desc;

create or replace view public.beta_exit_by_engine as
with exits as (
  select
    engine_kind,
    count(*)::int as exits
  from public.game_events
  where event_name in ('primary_cta_click', 'secondary_cta_click', 'next_game_click', 'hub_return_click')
  group by engine_kind
), sessions as (
  select
    engine_kind,
    count(*)::int as sessions
  from public.game_sessions
  group by engine_kind
)
select
  coalesce(e.engine_kind, s.engine_kind) as engine_kind,
  coalesce(e.exits, 0)::int as exits,
  coalesce(s.sessions, 0)::int as sessions,
  case
    when coalesce(s.sessions, 0) = 0 then 0
    else round((coalesce(e.exits, 0)::numeric / s.sessions::numeric) * 100)
  end::int as exit_rate
from exits e
full join sessions s on s.engine_kind = e.engine_kind
order by exits desc;
