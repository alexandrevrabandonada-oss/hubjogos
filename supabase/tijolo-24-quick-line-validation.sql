-- Tijolo 24 - Validação da linha quick
-- Objetivo: views para leitura por série, território e quick games

-- Tijolo 24: Views para análise por série e território
-- Nota: série e território vêm do catálogo (lib/games/catalog.ts), não do banco.
-- As views precisam ser alimentadas por join com metadados do catálogo.

-- View: Performance por jogo (base para série/território)
create or replace view public.beta_quick_games_overview as
with quick_sessions as (
  select
    s.slug,
    s.session_id,
    s.status,
    s.started_at,
    s.completed_at
  from public.game_sessions s
  -- Filter quick games baseado no catálogo conhecido
  where s.slug in ('custo-de-viver', 'quem-paga-a-conta')
), completions as (
  select
    slug,
    count(*)::int as total_completions
  from quick_sessions
  where status = 'completed'
  group by slug
), replays as (
  select
    e.slug,
    count(*)::int as total_replays
  from public.game_events e
  where e.event_name = 'quick_minigame_replay'
  group by e.slug
), shares as (
  select
    e.slug,
    count(*)::int as total_shares
  from public.game_events e
  where e.event_name in ('result_copy', 'link_copy', 'final_card_share_click')
  group by e.slug
), qr_views as (
  select
    e.slug,
    count(*)::int as total_qr_views
  from public.game_events e
  where e.event_name = 'final_card_qr_view'
  group by e.slug
), qr_clicks as (
  select
    e.slug,
    count(*)::int as total_qr_clicks
  from public.game_events e
  where e.event_name = 'final_card_qr_click'
  group by e.slug
)
select
  qs.slug,
  count(*)::int as sessions,
  coalesce(c.total_completions, 0)::int as completions,
  case
    when count(*) = 0 then 0
    else round((coalesce(c.total_completions, 0)::numeric / count(*)::numeric) * 100)
  end::int as completion_rate,
  coalesce(r.total_replays, 0)::int as replays,
  coalesce(sh.total_shares, 0)::int as shares,
  coalesce(qv.total_qr_views, 0)::int as qr_views,
  coalesce(qc.total_qr_clicks, 0)::int as qr_clicks,
  case
    when coalesce(qv.total_qr_views, 0) = 0 then 0
    else round((coalesce(qc.total_qr_clicks, 0)::numeric / qv.total_qr_views::numeric) * 100)
  end::int as qr_ctr
from quick_sessions qs
left join completions c on c.slug = qs.slug
left join replays r on r.slug = qs.slug
left join shares sh on sh.slug = qs.slug
left join qr_views qv on qv.slug = qs.slug
left join qr_clicks qc on qc.slug = qs.slug
group by qs.slug, c.total_completions, r.total_replays, sh.total_shares, qv.total_qr_views, qc.total_qr_clicks
order by sessions desc;

-- View: Métricas de throughput para quick games
create or replace view public.beta_quick_throughput as
with quick_completions as (
  select
    s.slug,
    s.session_id,
    s.started_at,
    s.completed_at,
    extract(epoch from (s.completed_at - s.started_at))::int as duration_seconds
  from public.game_sessions s
  where s.status = 'completed'
    and s.slug in ('custo-de-viver', 'quem-paga-a-conta')
    and s.completed_at is not null
)
select
  slug,
  count(*)::int as total_completions,
  round(avg(duration_seconds))::int as avg_duration_seconds,
  round(percentile_cont(0.5) within group (order by duration_seconds))::int as median_duration_seconds,
  min(duration_seconds)::int as min_duration_seconds,
  max(duration_seconds)::int as max_duration_seconds
from quick_completions
group by slug
order by total_completions desc;

-- View: Experimento QR no card final
create or replace view public.beta_qr_experiment_overview as
with experiment_sessions as (
  select
    s.session_id,
    s.slug,
    s.status,
    exp.variant as qr_variant
  from public.game_sessions s
  cross join lateral jsonb_to_recordset(
    case
      when jsonb_typeof(s.experiments) = 'array' then s.experiments
      else '[]'::jsonb
    end
  ) as exp(key text, variant text)
  where exp.key = 'final-card-qr-code'
), qr_views_by_variant as (
  select
    es.qr_variant,
    count(*)::int as qr_views
  from experiment_sessions es
  join public.game_events e on e.session_id = es.session_id
  where e.event_name = 'final_card_qr_view'
  group by es.qr_variant
), qr_clicks_by_variant as (
  select
    es.qr_variant,
    count(*)::int as qr_clicks
  from experiment_sessions es
  join public.game_events e on e.session_id = es.session_id
  where e.event_name = 'final_card_qr_click'
  group by es.qr_variant
)
select
  coalesce(es.qr_variant, 'unknown') as variant,
  count(*)::int as sessions,
  count(*) filter (where es.status = 'completed')::int as completions,
  coalesce(qv.qr_views, 0)::int as qr_views,
  coalesce(qc.qr_clicks, 0)::int as qr_clicks,
  case
    when coalesce(qv.qr_views, 0) = 0 then 0
    else round((coalesce(qc.qr_clicks, 0)::numeric / qv.qr_views::numeric) * 100)
  end::int as qr_ctr
from experiment_sessions es
left join qr_views_by_variant qv on qv.qr_variant = es.qr_variant
left join qr_clicks_by_variant qc on qc.qr_variant = es.qr_variant
group by es.qr_variant, qv.qr_views, qc.qr_clicks
order by sessions desc;

-- View complementar: Eventos do Tijolo 23/24
create or replace view public.beta_tijolo_23_24_events as
select
  event_name,
  count(*)::int as total,
  count(distinct slug)::int as unique_games,
  count(distinct session_id)::int as unique_sessions
from public.game_events
where event_name in (
  'final_card_qr_view',
  'final_card_qr_click',
  'avatar_v2_rendered',
  'avatar_expression_rendered',
  'quick_minigame_completion',
  'quick_minigame_replay'
)
group by event_name
order by total desc;
