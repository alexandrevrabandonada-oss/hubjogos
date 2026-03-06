# Schema do Supabase - Tijolo 12

Consolidacao remota do sistema de aprendizado com foco em feedback qualitativo, leitura operacional e triagem leve.

## Arquivo SQL

Execute no SQL Editor do Supabase:

- `supabase/tijolo-12-remote-learning.sql`

## Tabela nova

### `feedback_records`

Persistencia de feedback qualitativo com contexto de sessao.

Campos principais:

- `feedback_id` (text unique)
- `session_id` (text)
- `anonymous_id` (text)
- `slug` (text)
- `engine_kind` (text)
- `rating` (`positive` | `neutral` | `negative`)
- `comment` (text nullable)
- `triage_status` (`pending` | `reviewed`)
- `triaged_at` (timestamptz nullable)
- `created_at` (timestamptz)

## Views operacionais

- `beta_funnel_overview`
- `beta_sources_overview`
- `beta_game_overview`
- `beta_engine_overview`
- `beta_events_overview`
- `feedback_summary_by_game`
- `feedback_recent`
- `experiment_performance`

Essas views alimentam o dashboard `/estado`, o inbox `/estado/feedback` e os scripts operacionais.

## Politicas

RLS habilitado com politicas anonimas para:

- `INSERT` em `feedback_records`
- `SELECT` em `feedback_records`
- `UPDATE` em `feedback_records` (triagem)

Importante: para producao com operacao interna, evoluir para politicas com identidade de operador.
