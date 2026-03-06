-- Tijolo 14 - Operações protegidas e auditoria
-- Objetivo: Audit log para ações operacionais sensíveis

-- Tabela de audit log para operações internas
create table if not exists public.ops_audit_log (
  id bigserial primary key,
  action_type text not null,
  target_type text not null,
  target_id text not null,
  previous_value text,
  next_value text,
  actor_label text not null default 'unknown',
  actor_source text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Índices para queries comuns
create index if not exists idx_ops_audit_created_at on public.ops_audit_log(created_at desc);
create index if not exists idx_ops_audit_action_type on public.ops_audit_log(action_type);
create index if not exists idx_ops_audit_target on public.ops_audit_log(target_type, target_id);

-- RLS policies para audit log (read-only via rota protegida)
alter table public.ops_audit_log enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public' and tablename = 'ops_audit_log' and policyname = 'Allow anon select audit log'
  ) then
    create policy "Allow anon select audit log" on public.ops_audit_log
      for select
      to anon
      using (true);
  end if;
end $$;

-- View para resumo de auditoria (últimas 10 ações)
create or replace view public.ops_audit_recent as
select
  id,
  action_type,
  target_type,
  target_id,
  actor_label,
  actor_source,
  created_at,
  metadata
from public.ops_audit_log
order by created_at desc
limit 10;

-- Função para registrar ação operacional (segura, executa via app server)
create or replace function public.log_ops_action(
  p_action_type text,
  p_target_type text,
  p_target_id text,
  p_previous_value text default null,
  p_next_value text default null,
  p_actor_label text default 'unknown',
  p_actor_source text default null,
  p_metadata jsonb default '{}'::jsonb
) returns bigint as $$
  insert into public.ops_audit_log (
    action_type,
    target_type,
    target_id,
    previous_value,
    next_value,
    actor_label,
    actor_source,
    metadata,
    created_at
  ) values (
    p_action_type,
    p_target_type,
    p_target_id,
    p_previous_value,
    p_next_value,
    p_actor_label,
    p_actor_source,
    coalesce(p_metadata, '{}'::jsonb),
    now()
  )
  returning id;
$$ language sql security definer;

-- View para feedback pendente e prioritário (com info de triagem)
create or replace view public.feedback_action_items as
select
  f.id,
  f.feedback_id,
  f.slug as game_slug,
  f.rating,
  f.comment,
  f.triage_status,
  f.triaged_at,
  f.created_at,
  case
    when f.triage_status = 'pending' then 'pending'
    when f.triage_status = 'prioritario' then 'prioritario'
    else 'reviewed'
  end as urgency,
  (select max(created_at) from public.ops_audit_log where target_type = 'feedback' and target_id = f.feedback_id) as last_audit
from public.feedback_records f
where f.triage_status in ('pending', 'prioritario')
order by
  case when f.triage_status = 'prioritario' then 0 else 1 end,
  f.created_at desc;
