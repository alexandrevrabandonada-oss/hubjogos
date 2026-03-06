-- Tijolo 13 - Adicionar 'prioritario' ao status de triagem

-- Atualizar constraint para incluir 'prioritario'
alter table public.feedback_records
drop constraint if exists feedback_records_triage_status_check;

alter table public.feedback_records
add constraint feedback_records_triage_status_check
check (triage_status in ('pending', 'reviewed', 'prioritario'));

-- Atualizar constraint de update policy se necessário
drop policy if exists "Allow anon update feedback triage" on public.feedback_records;

create policy "Allow anon update feedback triage" on public.feedback_records
  for update
  to anon
  using (id is not null)
  with check (
    triage_status in ('pending', 'reviewed', 'prioritario') and 
    (triaged_at is null or triaged_at > now() - interval '24 hours')
  );
