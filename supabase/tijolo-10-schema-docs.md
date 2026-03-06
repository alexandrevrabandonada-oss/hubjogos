# Schema do Supabase – Tijolo 08

Documentação das tabelas utilizadas para persistência remota de analytics do Hub de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado.

O SQL de criação está em [`tijolo-04-minimal-schema.sql`](./tijolo-04-minimal-schema.sql) e é aplicado manualmente no console do Supabase.

---

## Tabelas

### `game_sessions`

Registra cada sessão de jogo iniciada.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigserial PK | Identificador interno |
| `session_id` | text UNIQUE | ID único da sessão (gerado no cliente) |
| `anonymous_id` | text | ID anônimo persistente do usuário |
| `slug` | text | Slug do jogo (ex: `voto-consciente`) |
| `engine_kind` | text | Tipo de engine (`quiz`, `branching_story`, etc.) |
| `engine_id` | text? | ID específico de engine (opcional) |
| `status` | text | `started` ou `completed` |
| `started_at` | timestamptz | Timestamp de início |
| `completed_at` | timestamptz? | Timestamp de conclusão (opcional) |
| `utm_source` | text? | Origem do tráfego (UTM) |
| `utm_medium` | text? | Meio do tráfego (UTM) |
| `utm_campaign` | text? | Campanha (UTM) |
| `utm_content` | text? | Conteúdo (UTM) |
| `referrer` | text? | URL de origem externa |
| `initial_path` | text? | Página de entrada do usuário |

---

### `game_events`

Registra cada evento rastreado durante uma sessão.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigserial PK | Identificador interno |
| `session_id` | text | Referência à sessão |
| `anonymous_id` | text | ID anônimo do usuário |
| `event_name` | text | Nome do evento (ver lista abaixo) |
| `slug` | text | Slug do jogo |
| `engine_kind` | text | Tipo de engine |
| `engine_id` | text? | ID de engine (opcional) |
| `step` | text? | Passo/etapa do jogo (opcional) |
| `result_id` | text? | ID de resultado (quando aplicável) |
| `cta_id` | text? | ID do CTA clicado (quando aplicável) |
| `metadata` | jsonb | Dados adicionais do evento |
| `created_at` | timestamptz | Timestamp do evento |

**Eventos rastreados:**
- `game_view` – jogo foi visualizado
- `game_start` – jogo foi iniciado
- `step_advance` – etapa avançada
- `game_complete` – jogo concluído
- `result_copy` – resultado copiado
- `link_copy` – link copiado
- `cta_click` – CTA clicado

---

### `game_results`

Registra o resultado final de cada sessão concluída.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigserial PK | Identificador interno |
| `session_id` | text | Referência à sessão |
| `anonymous_id` | text | ID anônimo do usuário |
| `slug` | text | Slug do jogo |
| `engine_kind` | text | Tipo de engine |
| `engine_id` | text? | ID de engine (opcional) |
| `result_id` | text | ID do resultado obtido |
| `result_title` | text | Título do resultado |
| `summary` | text | Texto de resumo do resultado |
| `created_at` | timestamptz | Timestamp de conclusão |

---

## Índices

```sql
idx_game_sessions_slug   -- busca por jogo
idx_game_events_slug     -- filtro por jogo
idx_game_events_name     -- filtro por tipo de evento
idx_game_results_slug    -- busca de resultados por jogo
```

---

## Segurança (RLS)

O RLS está habilitado em todas as tabelas. As políticas permitem:
- **`anon` INSERT** em todas as tabelas (coleta sem auth)
- Leitura agregada fica para nível de serviço (`service_role`) ou dashboard futuro

---

## Como configurar o Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `tijolo-04-minimal-schema.sql`
3. Copie as chaves do projeto (Settings → API)
4. Adicione ao `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Reinicie o servidor de desenvolvimento: `npm run dev`

---

> **Fallback local:** Se as variáveis não estiverem configuradas, o app funciona normalmente com localStorage. A tela `/estado` indica a origem dos dados.

Última atualização: 2026-03-06 (Tijolo 10)
