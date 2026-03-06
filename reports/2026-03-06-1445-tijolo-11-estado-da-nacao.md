# Relatório Estado da Nação - Tijolo 11: Beta Público como Sistema de Aprendizado

**Data:** 2026-03-06  
**Tijolo:** 11  
**Objetivo:** Transformar beta público em sistema real de aprendizado com experimentação, leitura por coortes e feedback qualitativo organizado.

---

## 🎯 Objetivo Alcançado

✅ **Beta Público convertido em Sistema de Aprendizado Disciplinado**

O Hub evoluiu de "operacionalmente confiável" (Tijolo 09-10) para "operacionalmente inteligente". Agora possui infraestrutura leve e pragmática para:

1. **Experimentar** variações de forma controlada sem inflar arquitetura
2. **Aprender** via leitura segmentada por coortes e experimentos
3. **Organizar** feedback qualitativo de forma acionável
4. **Documentar** aprendizado via snapshots operacionais periódicos

---

## 📊 Diagnóstico de Entrada (Estado do Tijolo 10)

### O que já existia:

✅ 4 engines reais funcionando (`quiz`, `branching_story`, `simulation`, `map`)  
✅ Runtime multi-engine com lazy loading  
✅ Analytics com eventos básicos (`game_view`, `game_start`, `game_complete`, `result_copy`, `link_copy`, `cta_click`)  
✅ Source tracking completo (UTM + referrer + initialPath)  
✅ Micro-feedback básico (3 botões emoji)  
✅ Dashboard `/estado` com métricas simples  
✅ Funil básico (starts → completions → shares)  
✅ Fallback local resiliente (localStorage)  
✅ CI/CD completo (E2E, Sentry, A11y)  

### O que NÃO existia:

❌ Sistema de experimentos/variantes  
❌ Instrumentação de variantes nos analytics  
❌ Leitura por coortes (origem, jogo, engine, variante)  
❌ Feedback qualitativo com comentários  
❌ Visão organizada de feedback  
❌ Snapshot operacional automatizado  
❌ CTAs consistentes entre todos os jogos  

---

## 🚀 Funcionalidades Implementadas

### 1. Sistema de Experimentos A/B (Leve e Controlável)

**Objetivo:** Permitir testar variações sem reformar arquitetura ou adicionar dependências enterprise.

**Implementação:**

```
lib/experiments/
  ├─ types.ts          # Definições de experimentos e variantes
  ├─ registry.ts       # Registro central de experimentos ativos
  ├─ resolve.ts        # Resolução determinística por sessão
  └─ index.ts          # Exports públicos
```

**Características:**

- ✅ Experimentos definidos por chave única
- ✅ Variantes com pesos configuráveis (soma = 100)
- ✅ Resolução estável por sessão via hash determinístico (DJB2)
- ✅ Sem cookies, sem tracking externo, sem libs pesadas
- ✅ Habilitação/desabilitação simples por flag
- ✅ Suporte a A/B e A/B/C

**Experimentos Ativos (prontos para uso):**

1. **`beta-banner-copy`** - Testar diferentes textos no banner de beta
   - `control`: Texto original
   - `clarity`: Foco em aprendizado

2. **`outcome-cta-style`** - Testar estilos de CTA na tela final
   - `default`: Links inline
   - `buttons`: Botões destacados

3. **`home-games-order`** (desabilitado por padrão)
   - `default`: Ordem padrão
   - `engagement`: Por taxa de conclusão

**Performance:**

- Hash simples e rápido (sem impacto perceptível)
- Zero dependências externas
- Compatível com fallback local (não depende de Supabase)

---

### 2. Instrumentação de Variantes nos Analytics

**Objetivo:** Registrar experimentos resolvidos em sessões e eventos para análise posterior.

**Mudanças:**

- ✅ Campo `experiments` adicionado a `SessionRecord`
- ✅ Campo `experiments` adicionado a `AnalyticsEventPayload`
- ✅ Resolução automática de variantes ao criar sessão
- ✅ Herança de variantes da sessão para todos os eventos
- ✅ Migração SQL para Supabase (`tijolo-11-experiments.sql`)

**Estrutura de dados:**

```typescript
experiments: [
  { key: 'beta-banner-copy', variant: 'clarity' },
  { key: 'outcome-cta-style', variant: 'buttons' }
]
```

**Persistência:**

- Local: `localStorage` (como JSON)
- Remoto (opcional): Supabase em campo JSONB com índice GIN
- View auxiliar criada: `experiment_performance`

---

### 3. Leitura por Coortes no Dashboard /estado

**Objetivo:** Permitir análise segmentada para identificar padrões e tomar decisões baseadas em dados reais.

**Métricas expandidas:**

#### Coortes por Origem (UTM/Referrer)

| Métrica | Descrição |
|---------|-----------|
| Sessões | Total de sessões por origem |
| Inícios | Total de `game_start` por origem |
| Conclusões | Sessões completadas por origem |
| Shares | Compartilhamentos por origem |
| Taxa de Conclusão | % de conclusão segmentado |

#### Coortes por Jogo

| Métrica | Descrição |
|---------|-----------|
| Sessões | Total de sessões por jogo |
| Inícios | Starts por jogo |
| Conclusões | Completions por jogo |
| Shares | Shares por jogo |
| Taxa de Conclusão | % de conclusão por jogo |
| Feedback 😊/😐/🙁 | Distribuição de sentimento |

#### Coortes por Engine

| Métrica | Descrição |
|---------|-----------|
| Sessões | Total por tipo de engine |
| Taxa de Conclusão | % de conclusão por mecânica |
| Comparação relativa | Qual mecânica performa melhor |

#### Performance de Experimentos

| Métrica | Descrição |
|---------|-----------|
| Sessões por variante | Volume de cada grupo |
| Conclusões por variante | Performance de cada grupo |
| Taxa relativa | Comparação direta A vs B |

**Visualização:**

- Tabelas organizadas por segmento
- Cores visuais para taxas (verde/amarelo/vermelho)
- Ordenação por volume (top performers primeiro)

---

### 4. Feedback Qualitativo Evoluído

**Objetivo:** Capturar não apenas reação rápida, mas também contexto qualitativo quando usuário quiser compartilhar.

**Componente Evoluído: `MicroFeedback.tsx`**

**Fluxo de UX:**

1. Usuário vê 3 opções (😊 Sim / 😐 Meh / 🙁 Não)
2. Após clicar, sistema oferece textarea opcional (500 chars)
3. Usuário pode enviar comentário ou pular
4. Feedback registrado com contexto completo

**Dados persistidos:**

```typescript
interface FeedbackRecord {
  id: string;
  sessionId: string;
  anonymousId: string;
  gameSlug: string;
  engineKind: string;
  rating: 'positive' | 'neutral' | 'negative';
  comment?: string;  // ← NOVO
  createdAt: string;
}
```

**Persistência:**

- Local: `localStorage` (key: `hubjogos:feedback-records`)
- Remoto (futuro): Supabase quando configurado

**Sem fricção:**

- Campo opcional
- Botão "Pular" visível
- Envio instantâneo
- Feedback visual claro

---

### 5. Inbox de Feedback Qualitativo

**Objetivo:** Organizar e facilitar leitura de feedback para tomada de decisão.

**Nova Página: `/estado/feedback`**

**Visão Geral:**

- Total de feedbacks
- Distribuição por sentimento (😊/😐/🙁)
- Volume de comentários qualitativos
- Taxa de feedback positivo

**Tabela por Jogo:**

| Jogo | 😊 | 😐 | 🙁 | Com Comentário | Total |
|------|----|----|----|--------------------|-------|
| Cidade Real | 12 | 3 | 1 | 5 | 16 |
| Voto Consciente | 8 | 2 | 0 | 3 | 10 |
| ... | | | | | |

**Comentários Recentes:**

- Últimos 50 comentários
- Filtros por jogo e avaliação
- Contexto completo (jogo, rating, timestamp)
- Visualização por cards coloridos (verde/amarelo/vermelho)

**Utilidade operacional:**

- Identificar problemas rapidamente
- Entender percepção de cada jogo
- Priorizar melhorias baseadas em feedback real
- Documentar aprendizado qualitativo

---

### 6. Snapshots Operacionais do Beta

**Objetivo:** Criar retratos consolidados periódicos do estado do beta para revisões e documentação.

**Script: `tools/beta-snapshot.js`**

**Uso:**

```bash
npm run beta:snapshot
```

**Saída:**

- Arquivo Markdown em `reports/snapshots/`
- Timestamp automático no nome do arquivo
- Formato legível e compartilhável

**Conteúdo do Snapshot:**

1. **Visão Geral**
   - Sessões totais
   - Inícios, conclusões, shares
   - Taxas gerais (conclusão, share)

2. **Feedback**
   - Total por sentimento
   - Volume de comentários

3. **Top 5 Origens**
   - Ordenado por volume

4. **Top 5 Jogos**
   - Volume + taxa de conclusão

5. **Experimentos Ativos**
   - Performance por variante
   - Taxa de conclusão comparativa

**Utilidade:**

- Revisões semanais de progresso
- Decisões sobre habilitar/desabilitar experimentos
- Documentação histórica do beta
- Compartilhamento com stakeholders

---

### 7. CTAs Finais Padronizados

**Objetivo:** Tornar CTAs consistentes, comparáveis e experimentáveis.

**Evolução do `lib/games/ctas.ts`:**

- ✅ CTAs definidos para TODOS os 6 jogos do catálogo
- ✅ Estrutura consistente (primary + secondary + shareLine)
- ✅ Função `getOutcomeCtaWithVariant()` para experimentos
- ✅ Support a variantes de copy

**CTAs por Jogo:**

| Jogo | Primary CTA | Secondary CTA |
|------|-------------|---------------|
| Voto Consciente | Explorar outras experiências | Participar da construção |
| Transporte Urgente | Explorar outras experiências | Participar da construção |
| Cidade Real | Explorar outras experiências | Participar da construção |
| Abandonado | Explorar outras experiências | Participar da construção |
| Trabalho Impossível | Explorar outras experiências | Participar da construção |
| Memória Coletiva | Explorar outras experiências | Participar da construção |

**Variantes experimentais prontas:**

- `default`: CTAs padrão (inline)
- `buttons`: CTAs mais diretos ("Ver mais experiências →")

---

### 8. SEO/Distribuição Refinado

**Objetivo:** Garantir que básico está bem feito sem mergulhar em SEO enterprise.

**Melhorias:**

1. **Sitemap (`app/sitemap.ts`)**
   - ✅ Apenas jogos `live` incluídos (não `coming`)
   - ✅ Prioridade aumentada para páginas de experiências (0.9)
   - ✅ Importação otimizada (removido import desnecessário)

2. **Robots (`app/robots.ts`)**
   - ✅ `/estado` bloqueado para crawlers
   - ✅ `/estado/feedback` bloqueado
   - ✅ `/share/` bloqueado (conteúdo dinâmico de resultado)
   - ✅ `/api/` bloqueado

3. **Metadata (`app/layout.tsx`)**
   - ✅ Keywords expandidas e mais específicas
   - ✅ Descrição atualizada com "Beta público aberto"
   - ✅ OpenGraph e Twitter cards mantidos

**Pronto para:**

- Indexação correta em buscadores
- Compartilhamento em redes sociais
- Crawling focado nas páginas certas

---

## 🛠️ Qualidade Técnica

### Verificação Final: ✅ PASSOU

| Gate | Status | Observações |
|------|--------|-------------|
| **Lint** | ✅ CLEAN | 0 warnings, 0 errors |
| **Type-check** | ✅ CLEAN | TypeScript 100% tipado |
| **Test:Unit** | ✅ 15/15 PASSED | Todas as engines + runtime + metadata |
| **Build** | ✅ SUCCESS | Bundle otimizado, rotas geradas |

**Build Output:**

```
Route (app)                              Size     First Load JS
┌ ○ /                                    4.95 kB         162 kB
├ ○ /estado                              6.56 kB         214 kB
├ ○ /estado/feedback                     5.1 kB          162 kB
├ ƒ /play/[slug]                         12.9 kB         221 kB
```

**Observações:**

- `/estado` cresceu de forma controlada (+6.56 kB) devido às novas agregações
- `/estado/feedback` mantém-se leve (5.1 kB)
- Engines continuam com lazy loading eficiente
- Nenhum bundle bloat detectado

### Warnings (Não-bloqueadores):

- Sentry: Sugestão de migração para `instrumentation.ts` (futura otimização)
- Sentry: Recomenda `global-error.js` (opcional, pode ser adicionado no Tijolo 12)

---

## 📈 Arquivos Criados/Modificados

### Novos Arquivos Criados:

```
lib/experiments/
  ├─ types.ts                    [NOVO] Tipos de experimentos
  ├─ registry.ts                 [NOVO] Registro central
  ├─ resolve.ts                  [NOVO] Resolução de variantes
  └─ index.ts                    [NOVO] Exports

lib/analytics/
  └─ feedback.ts                 [NOVO] Agregação de feedback

app/estado/feedback/
  └─ page.tsx                    [NOVO] Inbox de feedback

supabase/
  └─ tijolo-11-experiments.sql   [NOVO] Migração para experimentos

tools/
  └─ beta-snapshot.js            [NOVO] Gerador de snapshots

reports/snapshots/               [NOVO] Diretório para snapshots
```

### Arquivos Modificados:

```
lib/analytics/
  ├─ events.ts                   [MOD] +experiments field
  ├─ session-store.ts            [MOD] Resolução e captura de experimentos
  └─ metrics.ts                  [MOD] Coortes expandidas

lib/storage/
  └─ local-session.ts            [MOD] +feedback key

components/ui/
  ├─ MicroFeedback.tsx           [MOD] Comentário opcional
  └─ MicroFeedback.module.css    [MOD] Estilos para textarea

app/estado/
  ├─ page.tsx                    [MOD] Coortes + experimentos + link feedback
  └─ metrics.module.css          [MOD] Estilos para experimentos

app/
  ├─ layout.tsx                  [MOD] Keywords SEO expandidas
  ├─ sitemap.ts                  [MOD] Apenas jogos live, prioridades
  └─ robots.ts                   [MOD] Bloqueio de /estado/feedback e /share

lib/games/
  └─ ctas.ts                     [MOD] CTAs para todos os jogos + variantes

docs/
  ├─ README.md                   [MOD] Tijolo 11 documented
  ├─ arquitetura.md              [MOD] Seções de experimentos e feedback
  └─ tijolos.md                  [MOD] Estado atualizado

package.json                     [MOD] +beta:snapshot script
```

---

## 🧪 Experimentação Real Adicionada

### Sistema Completo de Experimentos:

✅ **Definição leve** via registry simples (sem libs externas)  
✅ **Resolução estável** por sessão (hash determinístico)  
✅ **Instrumentação automática** em analytics  
✅ **Dashboard de performance** por variante  
✅ **3 experimentos prontos** (beta-banner, cta-style, games-order)  

**Como adicionar novo experimento:**

1. Definir em `lib/experiments/registry.ts`
2. Usar `resolveVariant()` onde necessário
3. Analytics automaticamente registra
4. Ver performance em `/estado`

**Sem complexidade enterprise:**

- Sem A/B testing SaaS
- Sem cookies de terceiros
- Sem tracking externo
- Sem libs pesadas

---

## 📊 Leitura Real de Coortes Adicionada

### Segmentações Implementadas:

✅ **Por Origem** (UTM/Referrer)  
   - Sessões, starts, conclusões, shares, taxa

✅ **Por Jogo**  
   - Performance completa + feedback qualitativo

✅ **Por Engine**  
   - Comparação de mecânicas (quiz vs branching vs simulation vs map)

✅ **Por Variante de Experimento**  
   - Comparação direta A vs B

**Dashboard expandido:**

- 4 novas tabelas segmentadas
- Taxas calculadas por segmento
- Cores visuais para quick scan
- Ordenação por volume

**Capacidade analítica:**

- Identificar origens mais engajadas
- Comparar performance de jogos
- Entender qual mecânica funciona melhor
- Medir impacto de variantes

---

## 💬 Feedback Qualitativo Real Adicionado

### Sistema Completo:

✅ **Captura ampliada** (rating + comentário opcional)  
✅ **Persistência estruturada** (local + futuro remoto)  
✅ **Inbox organizado** (`/estado/feedback`)  
✅ **Filtros úteis** (por jogo, por avaliação)  
✅ **Agregações práticas** (distribuição, volume, recentes)  

**Fluxo sem fricção:**

- Comentário opcional (não obrigatório)
- Limite de 500 chars (evita walls of text)
- Feedback visual imediato
- Persistência resiliente

**Visibilidade operacional:**

- Últimos 50 comentários sempre disponíveis
- Filtros instantâneos
- Contexto completo (jogo, rating, timestamp)
- Cards visuais coloridos por sentimento

---

## 📸 Snapshots Operacionais Adicionados

### Script Automatizado:

✅ **Comando simples:** `npm run beta:snapshot`  
✅ **Saída clara:** Markdown em `reports/snapshots/`  
✅ **Timestamp automático**  
✅ **Conteúdo consolidado** (overview + feedback + top sources/games + experiments)  

**Utilidade Real:**

- Revisões semanais estruturadas
- Documentação histórica do beta
- Tomada de decisão baseada em dados
- Compartilhamento com stakeholders

**Leve e independente:**

- Roda em Node.js puro
- Lê de localStorage simulado (ou remote futuro)
- Zero dependências extras
- Output legível para humanos

---

## 🎯 Critérios de Sucesso: ✅ TODOS ATINGIDOS

| Critério | Status |
|----------|--------|
| 4 engines continuam funcionando | ✅ SIM |
| Existe camada real de experimentos leves | ✅ SIM |
| Variantes entram nos analytics | ✅ SIM |
| /estado passa a ler coortes e variantes | ✅ SIM |
| Existe visão útil de feedback qualitativo | ✅ SIM |
| Existe snapshot operacional do beta | ✅ SIM |
| Lint, type-check, build e verify passam | ✅ SIM |
| Relatório Estado da Nação gerado | ✅ SIM |

---

## ⚠️ Riscos Restantes

### Técnicos:

1. **Snapshots dependem de dados locais em ambiente Node**
   - Solução: Futura integração com Supabase para snapshots remotos

2. **Feedback não persiste remotamente ainda**
   - Solução: Adicionar persistência em Supabase (Tijolo 12)

3. **Experimentos não têm UI de gerenciamento**
   - Aceitável: Registro via código é leve e versionado
   - Futuro: Admin leve pode adicionar toggle visual (Tijolo 12)

### Operacionais:

1. **Sem monitoramento de performance de experimentos em tempo real**
   - Solução: Snapshots periódicos resolvem por agora
   - Futuro: Dashboard real-time opcional

2. **Sem moderação de feedback qualitativo**
   - Aceitável para beta: Volume baixo, leitura manual viável
   - Futuro: Flags de moderação quando escalar

---

## 🔮 O que Fica para o Tijolo 12

### Auth Minimalista Opcional:

- Identificação persistente leve (sem password, sem OAuth pesado)
- Sessões persistentes entre devices
- Opcional (não obrigatório para uso)

### Admin Leve:

- Toggle visual de experimentos
- Consulta rápida de métricas
- Moderação básica de feedback
- Exportação de snapshots agendada

### SEO Avançado (Opcional):

- Rich Snippets (structured data)
- Breadcrumbs
- FAQ schema

### Consolidação Remota:

- Persistência de feedback no Supabase
- Views analíticas otimizadas
- Snapshots remotos automáticos

---

## 🎓 Aprendizado Metodológico

### O que funcionou bem:

1. **Sistema de experimentos leve** (DJB2 hash + registry simples)
   - Sem over-engineering
   - Fácil de entender e manter
   - Estável e determinístico

2. **Coortes direto no metrics.ts**
   - Mantém agregação perto da fonte
   - Performance aceitável para volumes de beta
   - Simples de debugar

3. **Feedback com campo opcional**
   - Não quebra fluxo
   - Maior adesão que obrigatório
   - Dados mais ricos

4. **Snapshots em script Node**
   - Rápido de implementar
   - Fácil de executar
   - Output útil imediatamente

### O que evitamos (e por quê):

1. **Feature flags enterprise** (LaunchDarkly, Flagsmith)
   - Overkill para 3-5 experimentos
   - Lock-in desnecessário
   - Custo injustificado

2. **Analytics SaaS** (Mixpanel, Amplitude)
   - Dados sensíveis políticos
   - Controle total com Supabase
   - Custo evitado

3. **Admin complexo**
   - Código > UI nesta fase
   - Git como source of truth
   - Menos superfície de bug

---

## 📊 Resumo Executivo

### O que este tijolo entregou:

**Experimentação Real:**
- Sistema leve de A/B testing
- 3 experimentos prontos para ativar
- Performance comparativa em dashboard

**Leitura Real de Coortes:**
- 4 segmentações (origem, jogo, engine, variante)
- Taxas calculadas por segmento
- Visão consolidada em `/estado`

**Feedback Qualitativo Real:**
- Captura de comentários opcionais
- Inbox organizado com filtros
- 50 últimos comentários sempre visíveis

**Snapshots Operacionais:**
- Comando `npm run beta:snapshot`
- Retratos periódicos do beta
- Documentação histórica automática

---

## ✅ Gate Técnico Final

```bash
✓ npm run lint        # CLEAN
✓ npm run type-check  # CLEAN
✓ npm run test:unit   # 15/15 PASSED
✓ npm run build       # SUCCESS
```

---

## 🏁 Conclusão

**Tijolo 11 está completo e pronto para produção.**

O Hub de Jogos da Pré-Campanha agora possui um **sistema real de aprendizado**:

- ✅ Pode experimentar variações de forma controlada
- ✅ Pode aprender com dados segmentados reais
- ✅ Pode organizar feedback qualitativo de forma acionável
- ✅ Pode documentar aprendizado ao longo do tempo

**Transformamos "medir" em "aprender com método".**

Próxima fronteira: Tijolo 12 (auth minimalista + admin leve).

---

**Relatório gerado em:** 2026-03-06  
**Autor:** Principal Engineer de Produto  
**Status:** ✅ CONCLUÍDO
