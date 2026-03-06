# Estado da Nação – Tijolo 08: Consolidação Operacional

**Data:** 2026-03-06 13:15  
**Tijolo:** 08  
**Foco:** Export automático do share card + CI/CD GitHub Actions + Tela /estado com origem dos dados

---

## 1. Diagnóstico do Estado Anterior (Entrada)

| Componente | Estado de Entrada |
|---|---|
| Analytics local | ✅ Completo (`session-store`, `track`, `events`, `metrics`) |
| Supabase client/results | ✅ Com fallback gracioso (app funciona sem Supabase) |
| Share card visual | ⚠️ Existe, mas export era manual (instrução de screenshot) |
| Tela `/estado` | ⚠️ Funciona, mas indicava apenas "local" sem badge claro |
| GitHub Actions | ❌ Diretório vazio – sem nenhum workflow ativo |
| SQL schema Supabase | ✅ Existe em `supabase/tijolo-04-minimal-schema.sql` |
| Testes unitários (6) | ✅ Passando |
| Testes E2E (1 spec) | ✅ Funciona localmente |

Limitações identificadas:
- Export do share card era 100% manual (instrução de "usar print do sistema")
- Tela `/estado` não distinguia visualmente se Supabase estava ativo ou não
- Nenhum CI/CD automatizado – sem proteção contra regressão silenciosa em push/PR

---

## 2. Export Automático do Share Card

**Solução adotada:** `html-to-image` (biblioteca leve de DOM→PNG)

**Arquivos criados/modificados:**

- `lib/share/export-card.ts` – helper com `exportCardAsImage()` e `buildCardFilename()`
- `components/games/share/DownloadCardButton.tsx` – botão com estados loading/success/error
- `components/games/share/DownloadCardButton.module.css` – estilos do botão
- `app/share/[game]/[result]/SharePageClient.tsx` – client wrapper com `useRef` para o container
- `app/share/[game]/[result]/page.tsx` – atualizado para usar `SharePageClient`

**Funcionalidades entregues:**
- Botão "Baixar card" na share page
- Nome de arquivo coerente: `resultado-{slug}-{resultId:8}.png`
- Scale 2x para qualidade de imagem
- Feedback visual: loading ("Gerando imagem...") → success ("✓ Card salvo!") → error com fallback message
- Instrução manual de screenshot removida da página
- UX funcional em mobile e desktop

**Estratégia de componente:**
- Server Component (`page.tsx`) mantido limpo
- `SharePageClient` como wrapper client-side com `useRef`
- `DownloadCardButton` desacoplado e reutilizável

---

## 3. Tela `/estado` – Origem dos Dados

**Arquivos modificados:**
- `app/estado/page.tsx` – importa `isSupabaseConfigured`, exibe badge e aviso condicional
- `app/estado/metrics.module.css` – classes `.sourceBadge`, `.supabaseWarning`, `.generatedAt`

**O que foi adicionado:**
- Badge visual: `🟢 local (localStorage)` / `🟡 remoto (Supabase)` / `🔵 híbrido (local + remoto)`
- Aviso amarelo quando Supabase não está configurado (com instrução de como configurar)
- Seção "Origem dos Dados" atualizada para diferenciar local vs. remoto com texto claro
- Timestamp de geração explícito

---

## 4. Schema/Tabelas Documentadas

**Arquivo criado:** `supabase/tijolo-08-schema-docs.md`

**Tabelas documentadas:**
- `game_sessions` – sessões (started/completed, anonymous_id, slug, engine_kind)
- `game_events` – eventos por tipo (game_view, game_start, step_advance, game_complete, etc.)
- `game_results` – resultados finais com result_id, result_title, summary

**SQL existente (`tijolo-04-minimal-schema.sql`):** cobre escopo completo, não foi necessário criar novo.

**Inclui:** guia de setup (como aplicar SQL, configurar envs, RLS e políticas mínimas).

---

## 5. Estado da Tela de Métricas `/estado`

- **Origem dos dados:** badge visual claro de fonte atual
- **Supabase desconfigurado:** aviso em destaque com instrução de configuração
- **Supabase configurado:** texto explicando que dados são enviados remotamente
- **Fallback:** UI nunca quebra independente de Supabase

---

## 6. CI/CD GitHub Actions

**Arquivo criado:** `.github/workflows/ci.yml`

**Configuração:**
- Trigger: `push` e `pull_request` em qualquer branch
- Runner: `ubuntu-latest` / Node 20
- Steps: checkout → `npm ci` → lint → type-check → test:unit → build
- Supabase: envs definidas como strings vazias (build funciona sem elas)

**Sobre E2E no CI:**
- E2E **não foi incluído por padrão** (job comentado no workflow)
- Motivo: Playwright requer servidor rodando + browser instalado, aumentando ciclo de CI significativamente
- Documentado como job separado comentado com instruções de como habilitar
- Recomendação: habilitar como job opcional no **Tijolo 09**

---

## 7. Resultado do Gate Técnico

| Check | Resultado |
|---|---|
| `npm run lint` | ✅ Passou (0 erros) |
| `npm run type-check` | ✅ Passou (0 erros) |
| `npm run test:unit` | ✅ Passou (6 test files, todos ✅) |
| `npm run build` | ✅ Passou (exit code 0) |
| `npm run verify` | ✅ Passou (exit code 0) |

**4 engines continuam funcionando:** quiz, branching_story, simulation, map – sem regressão.

---

## 8. Documentação Atualizada

- `docs/arquitetura.md` – Status Tijolo 08, export automático, CI/CD, limites atualizados
- `docs/roadmap.md` – Tijolo 08 marcado ✅, Tijolo 09 definido
- `docs/tijolos.md` – Tijolo 08 adicionado ao histórico
- `tools/verify.js` – novas verificações: `ci.yml`, `export-card.ts`, `DownloadCardButton.tsx`
- `supabase/tijolo-08-schema-docs.md` – documentação completa das tabelas

---

## 9. Riscos Restantes

| Risco | Severidade | Mitigação |
|---|---|---|
| `html-to-image` pode falhar em browsers com políticas de CORS nos assets | Baixa | Fallback de erro informativo implementado |
| E2E sem CI pode permitir regressões de UI | Média | Documentado; prioridade Tijolo 09 |
| Supabase write errors silenciosos | Baixa | `withSupabase` já captura erros sem quebrar UX |

---

## 10. Próximos Passos Recomendados (Tijolo 09)

1. Habilitar E2E no CI (job separado com Playwright + servidor Next.js)
2. Observabilidade em produção (Sentry ou equivalente)
3. Ampliação de conteúdo (nova engine ou novos cenários políticos)
4. Testes de acessibilidade automatizados

---

## Resumo Executivo

### 1. Export real implementado ✅
Share card pode ser exportado como PNG com um clique. Instrução manual de screenshot removida.

### 2. Persistência remota real ✅ (já era funcional)
A camada `lib/supabase/results.ts` já persistia remotamente quando Supabase configurado. O que foi entregue neste tijolo foi a **honestidade da UI** – tela `/estado` agora indica claramente a fonte dos dados.

### 3. CI real implementado ✅
`.github/workflows/ci.yml` protege qualquer push/PR com lint + type-check + test + build.

### 4. O que fica para o Tijolo 09
- E2E automatizado no CI
- Observabilidade em produção
- Nova engine ou ampliação de conteúdo
