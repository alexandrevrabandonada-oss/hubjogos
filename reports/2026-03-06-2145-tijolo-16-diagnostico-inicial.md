# Diagnóstico Inicial - Tijolo 16: Circulação e Conversão

**Data:** 2026-03-06 21:45  
**Autor:** Engineering Team  
**Status:** Diagnóstico concluído

## Estado Atual da Base

### ✅ Já Implementado (Bem Estruturado)

1. **Sistema de CTA base**
   - `lib/games/ctas.ts` com `OutcomeCtaConfig` (primary, secondary, shareLine)
   - Suporte a variantes experimentais (`default`, `buttons`)
   - CTA customizado por jogo + fallback
   - Integração em todos os 4 engines

2. **Pages chave**
   - Home (`app/page.tsx`): CTAs para `/explorar` e jogo inaugural `voto-consciente`
   - Explorar (`app/explorar`): Catálogo jogável
   - Play (`app/play/[slug]`): Runtime multi-engine
   - Outcomes: Componente `GameOutcome.tsx` com primary/secondary CTAs
   - Share (`app/share/[game]/[result]`): Renderiza card visual + botão de download PNG

3. **Analytics e Tracking**
   - Eventos básicos: `game_view`, `game_start`, `game_complete`, `cta_click`, `result_copy`, `link_copy`
   - Função `trackCtaClick(game, ctaId)` em todos os 4 engines
   - Integrações: localStorage (fallback) + Supabase (remoto)
   - Dashboard `/estado` com funil, cohortes, engines, feedback, experimentos

4. **MicroFeedback**
   - Componente integrado no outcome
   - Captura `positive`, `neutral`, `negative` com comentário opcional
   - Triagem em `/estado/feedback`

5. **Operações**
   - Snapshots, exports, alertas, auditorias (Tijolo 15)
   - CI/CD, lint, type-check, test:unit, build, verify
   - E2E com Playwright (15/15 testes)

### ⚠️ Gargalos Identificados (Conversão e Circulação)

1. **CTAs ainda são muito genéricos**
   - Todos os games (ou maioria) apontam para `/explorar` ou `/participar`
   - Sem contexto de origem (Instagram/TikTok vindo via share? Direto? Via newsletter?)
   - Sem diferenciação de contexto (primeira vez vs. replay? Completo vs. abandonado?)

2. **Share pages não têm força de reentrada**
   - Exibem card visual + link
   - Instruções são apenas "baixar PNG + copiar link"
   - Sem CTA forte para "voltar ao hub" ou "explorar relacionados"
   - Sem indicação clara de tempo/tipo da experiência

3. **Outcomes poderiam ser mais acionáveis**
   - Mostram resultado, leitura política, próximo passo
   - Mas CTAs são estáticos e não reflecem:
     - A força relativa dessa experiência vs. outras
     - Próximos jogos relacionados por tema/engine
     - Continuidade se usuário estava em uma jornada temática

4. **Eventos de saída não são tão granulares**
   - Existe `cta_click` com `ctaId`
   - Faltam eventos de:
     - `outcome_view` (quando chega ao resultado)
     - `primary_cta_click` vs `secondary_cta_click` (para comparar força)
     - `share_page_view` (quando entra na share)
     - `share_export_click` (tentativa de download PNG)
     - `next_game_click` (clica em próximo jogo sugerido)
     - `hub_return_click` (volta para home/explorar)

5. **Leitura de circulação em `/estado` é fraca**
   - Tem funil (sessões → inícios → conclusões → shares)
   - Mas falta:
     - CTR por jogo (quantos clicks em CTAs vs. quantos viram o resultado?)
     - Placement-level metrics (qual CTA foi mais clicado em outcomes?)
     - Share → reentrada (de quantos share_page_view vira novo game_start?)
     - Top jogos por "próxima ação" (qual tem maior retention de usuário)
     - Comparação de força: quiz vs. branching vs. simulation vs. map nesses padrões

6. **Copy das páginas pode ser refinado**
   - Home e explorar: um pouco descritivos/acadêmicos
   - Outcomes: poderíamos reforçar melhor:
     - Resultado visual + insight político + ação concreta
     - Urgência ou convite maior para compartilhar
   - Share page: foco em download técnico, menos em convite para jogar

7. **Experimentos existem mas não focam em conversão**
   - Registry tem `beta-banner-copy`, `outcome-cta-style`, `ui_variant`
   - Mas não há experimento de:
     - CTA final (compare textos de conversão)
     - Share page copy (compare convites para jogar vs. técnico)
     - Home copy (compare chamadas à ação)

## Números Atuais (Referência)

Do snapshot mais recente (reports/snapshots/):
- **Sessões:** 56
- **Inícios:** 51
- **Conclusões:** 12 (21%)
- **Compartilhamentos:** 4 (33% de quem completou)
- **Origens:** direto/desconhecido (~70%), google (~7%), twitter (~4%), outros (~19%)
- **Feedback:** 4 (todos em pending/reviewed, nenhum prioritario)
- **Engines:** quiz (35%), map (23%), simulation (21%), branching (18%)

**Gaps de análise:**
- CTR de CTAs: unknown (existe click mas sem breakdown por placement)
- Share-to-reentry: unknown (não há tracking de quem clica share_page_view → volta a jogar)
- Engine performance em conversão: diferenças não são claras

## Oportunidades para Tijolo 16

1. ✅ **Melhorar CTAs por contexto**
   - Criar dimensão de "origem" e "situação"
   - Servir CTA diferente se vem de TikTok vs. newsletter vs. direto
   - Registrar qual CTA foi servido (para analisar depois)

2. ✅ **Reforçar share pages**
   - CTA forte: "Voltar a jogar"
   - Sugerir próximo jogo relacionado
   - Mostrar tipo + tempo da experiência
   - Copy mais clara

3. ✅ **Instrumentar melhor saída**
   - Novos eventos: `outcome_view`, `primary_cta_click`, `secondary_cta_click`, `share_page_view`, `next_game_click`
   - Relacionar sempre a: slug, engine, origem, variante se houver

4. ✅ **Evoluir `/estado`**
   - Seção "Circulação" com CTR, top CTAs, top origens por conversão
   - Visualizar share→reentry quando houver sinal
   - Comparação por engine em termos de "força de saída"
   - Sem virar BI enterprise

5. ✅ **Criar experimentos de conversão**
   - Testar 2-3 variantes de CTA final
   - Testar 1 variante de share page copy
   - Rodar com 50% do tráfego cada

6. ✅ **Refinar copy das páginas chave**
   - Home: clareza + desejo de jogar
   - Outcomes: leitura forte + urgência de compartilhar
   - Share page: convite para "jogar agora" + próximo passo

7. ✅ **Atualizar snapshot/export**
   - Incluir top CTAs, CTR por placement, top origens por conversão
   - Top jogos por "próxima ação"

## Princípios para Este Tijolo

- **Idempotência:** não quebrar nenhuma das 4 engines
- **Lean:** melhorias estruturais, não mudanças visuais drásticas
- **Mensuração:** toda mudança deve ser rastreável
- **Progressivo:** começar com fundações estruturais (CTA registry + eventos), depois evolução de `/estado`

## Próximos Passos

1. Expandir `lib/games/ctas.ts` para incluir contexto (origem, situação)
2. Criar `lib/analytics/events.ts` com novos eventos de saída
3. Instrumentar GameOutcome e SharePageClient com novos eventos
4. Criar bloco de circulação em `/estado`
5. Criar experimentos em `lib/experiments/registry.ts`
6. Refinar copy de home, outcomes, share page
7. Gate técnico completo
8. Relatório Estado da Nação

---

**Conclusão:** Base é sólida. O Tijolo 16 é sobre estruturar melhor o que sai (CTAs, eventos, análise) para entender e melhorar circulação. Não é novo código caótico — é refinamento estruturado existente.
