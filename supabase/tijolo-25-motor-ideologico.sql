-- Tijolo 25 - Motor ideologico dos jogos
-- Views para leitura por eixo politico, solucao coletiva e comum vs mercado.

create or replace view public.beta_ideological_axis_overview as
with starts as (
  select
    coalesce(e.metadata->>'politicalAxis', 'unknown') as political_axis,
    count(*)::int as starts
  from public.game_events e
  where e.event_name = 'game_start'
  group by 1
), completions as (
  select
    coalesce(e.metadata->>'politicalAxis', 'unknown') as political_axis,
    count(*)::int as completions
  from public.game_events e
  where e.event_name = 'game_complete'
  group by 1
), shares as (
  select
    coalesce(e.metadata->>'politicalAxis', 'unknown') as political_axis,
    count(*)::int as shares
  from public.game_events e
  where e.event_name in ('result_copy', 'link_copy', 'final_card_share_click')
  group by 1
)
select
  coalesce(s.political_axis, c.political_axis, sh.political_axis) as political_axis,
  coalesce(s.starts, 0)::int as starts,
  coalesce(c.completions, 0)::int as completions,
  coalesce(sh.shares, 0)::int as shares,
  case
    when coalesce(s.starts, 0) = 0 then 0
    else round((coalesce(c.completions, 0)::numeric / s.starts::numeric) * 100)
  end::int as completion_rate
from starts s
full outer join completions c on c.political_axis = s.political_axis
full outer join shares sh on sh.political_axis = coalesce(s.political_axis, c.political_axis)
order by starts desc;

create or replace view public.beta_collective_solution_overview as
with starts as (
  select
    coalesce(e.metadata->>'collectiveSolutionType', 'unknown') as collective_solution,
    count(*)::int as starts
  from public.game_events e
  where e.event_name = 'game_start'
  group by 1
), completions as (
  select
    coalesce(e.metadata->>'collectiveSolutionType', 'unknown') as collective_solution,
    count(*)::int as completions
  from public.game_events e
  where e.event_name = 'game_complete'
  group by 1
)
select
  coalesce(s.collective_solution, c.collective_solution) as collective_solution,
  coalesce(s.starts, 0)::int as starts,
  coalesce(c.completions, 0)::int as completions,
  case
    when coalesce(s.starts, 0) = 0 then 0
    else round((coalesce(c.completions, 0)::numeric / s.starts::numeric) * 100)
  end::int as completion_rate
from starts s
full outer join completions c on c.collective_solution = s.collective_solution
where coalesce(s.collective_solution, c.collective_solution) <> 'nao-definido'
order by starts desc;

create or replace view public.beta_common_vs_market_overview as
with starts as (
  select
    coalesce(e.metadata->>'commonVsMarket', 'unknown') as common_vs_market,
    count(*)::int as starts
  from public.game_events e
  where e.event_name = 'game_start'
  group by 1
), completions as (
  select
    coalesce(e.metadata->>'commonVsMarket', 'unknown') as common_vs_market,
    count(*)::int as completions
  from public.game_events e
  where e.event_name = 'game_complete'
  group by 1
)
select
  coalesce(s.common_vs_market, c.common_vs_market) as common_vs_market,
  coalesce(s.starts, 0)::int as starts,
  coalesce(c.completions, 0)::int as completions,
  case
    when coalesce(s.starts, 0) = 0 then 0
    else round((coalesce(c.completions, 0)::numeric / s.starts::numeric) * 100)
  end::int as completion_rate
from starts s
full outer join completions c on c.common_vs_market = s.common_vs_market
order by starts desc;

create or replace view public.beta_ideological_signals as
select
  coalesce(metadata->>'dominantAxis', 'unknown') as dominant_axis,
  count(*)::int as signals,
  round(avg((metadata->>'axisScore')::numeric), 2) as avg_axis_score
from public.game_events
where event_name = 'ideological_axis_signal'
group by 1
order by signals desc;
