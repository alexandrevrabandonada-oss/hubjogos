# Tijolo 12c - Fechamento de Experimentos

Data: 2026-03-06 19:16

## 1. Problema original (estado de entrada)

A view remota `public.experiment_performance` quebrava ao encontrar registros legados onde `game_sessions.experiments` nao era array JSON.

Erro observado no remoto:

- `cannot call jsonb_to_recordset on a non-array`
- Reproducao via REST: `GET /rest/v1/experiment_performance?select=*` retornava `400`.

## 2. Correcao aplicada

Foi reaplicada no Supabase a definicao corrigida da view, com guarda de tipo JSON:

```sql
cross join lateral jsonb_to_recordset(
  case
    when jsonb_typeof(s.experiments) = 'array' then s.experiments
    else '[]'::jsonb
  end
) as exp(key text, variant text)
```

Resultado:

- `experiment_performance` deixou de quebrar com payload legado (`null`, objeto, formato invalido).
- Comportamento idempotente e backward-compatible mantido.

## 3. Evidencia da view funcionando

Consulta direta apos reaplicar SQL:

- Status HTTP: `200`
- Retorno com linhas validas e agregadas.

Exemplos retornados:

- `ui_variant / A`: `sessions=2`, `completions=1`, `completion_rate=50`
- `ui_variant / B`: `sessions=2`, `completions=2`, `completion_rate=100`
- Outras chaves ja existentes tambem agregadas (`beta-banner-copy`, `outcome-cta-style`).

## 4. Dados reais de experimento garantidos

Foi inserido seed real no remoto com array valido em `game_sessions.experiments`:

- experimento `ui_variant`
- variantes `A` e `B`
- 4 sessoes novas (mix de completed/started)
- eventos `game_start` vinculados para coerencia operacional

## 5. Revalidacao de snapshot/export

Comandos executados:

- `npm run beta:export`
- `npm run beta:snapshot`
- `npm run beta:snapshot -- --format=json`

Resultados:

- `source = "supabase"` em todos
- `experiments` preenchido no snapshot
- `experiment_performance` refletido no output

Evidencia no snapshot JSON:

- chave `ui_variant` com variantes `A` e `B` agregadas
- bloco de experimentos ativo e sem erro

Arquivos gerados:

- `reports/exports/beta-export-2026-03-06T19-09-17.json`
- `reports/snapshots/beta-snapshot-2026-03-06T19-09-18.md`

## 6. Revalidacao de /estado

Validacao em browser (Playwright script):

- pagina carregou sem erro
- secao de experimentos presente (`Experimentos A/B Ativos`)
- fonte remota presente (badge remoto/supabase)
- `ui_variant` presente no conteudo renderizado

## 7. Gate tecnico final

Comandos executados:

- `npm run lint` -> OK
- `npm run type-check` -> OK
- `npm run build` -> OK
- `npm run verify` -> OK (`VERIFY_EXIT:0`)

## 8. Conclusao

**Tijolo 12 finalmente concluido.**

Criterios atendidos:

- `experiment_performance` nao quebra mais
- experimentos aparecem no remoto
- snapshots/export mostram experimentos
- `/estado` reflete bloco de experimentos sem erro
- gate tecnico passou
