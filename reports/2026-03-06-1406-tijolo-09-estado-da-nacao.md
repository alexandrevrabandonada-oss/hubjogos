# Estado da Nação – Tijolo 09: Confiabilidade de Produção

**Data:** 2026-03-06 14:06  
**Tijolo:** 09  
**Foco:** E2E no CI + Sentry (Observabilidade) + Acessibilidade (Axe) + Cache OG

---

## 1. Diagnóstico do Estado Anterior (Entrada)

| Componente | Estado de Entrada |
|---|---|
| CI (GitHub Actions) | ✅ Básico (lint, type, unit, build) |
| E2E (Playwright) | ⚠️ Apenas local (não rodava no CI) |
| Observabilidade | ❌ Sem monitoramento de erros em produção |
| Acessibilidade | ❌ Sem testes automatizados |
| OG Image | ⚠️ Dinâmica, mas sem estratégia de cache agressivo |
| Página `/estado` | ✅ Funcional, mas sem indicadores de monitoramento |

---

## 2. CI/CD: E2E e Acessibilidade Automatizados

**Mudança principal:** O pipeline `.github/workflows/ci.yml` foi expandido para incluir o job `e2e`, garantindo que toda alteração seja testada em um ambiente produtivo (build real).

**Conquistas:**
- **Job E2E:** Roda após as checagens iniciais.
- **Cache:** Otimização de tempo com cache de dependências e browsers.
- **Artifacts:** Upload de relatórios HTML em caso de falha no CI.
- **Gate de Qualidade:** Proteção contra quebras em fluxos de engajamento (engajamento, resultado, navegação).

---

## 3. Observabilidade Real (Sentry)

**Integração:** Adicionado `@sentry/nextjs` com configurações para Client, Server e Edge.

**Funcionalidades:**
- **Capture:** Rastreamento automático de exceções e erros de runtime.
- **Performance:** Monitoramento de latência e Core Web Vitals.
- **Resiliência:** Sentry é opcional; o app funciona perfeitamente sem `SENTRY_DSN` (detecção automática).
- **Dashboard:** Visibilidade centralizada da saúde do Hub em produção.

---

## 4. Acessibilidade (Baseline Axe-core)

**Solução:** Integração do `@axe-core/playwright` na suíte de testes E2E.

**O que foi entregue:**
- **Spec:** `tests/e2e/a11y.spec.ts` cobrindo 100% das rotas críticas.
- **Baseline:** Foco em violações `serious` e `critical` para evitar ruído e focar em impacto real.
- **Fixes:** Saneamento de contrastes na página `/estado` (WCAG AA atingido para avisos e badges).

---

## 5. Performance: Cache de OG Image

**Estratégia:** Cabeçalhos de cache agressivos para as rotas `/api/og/*`.

**Configuração:**
- `Cache-Control: public, s-maxage=31536000, stale-while-revalidate`
- **Impacto:** Imagens dinâmicas são geradas uma vez e cacheadas na Edge Network da Vercel/Cloudflare, reduzindo latência e custo de processamento.

---

## 6. Evolução da Página `/estado`

A página operacional agora reflete a infraestrutura técnica:
- **Badge Sentry:** `active` (configurado) / `off` (não configurado).
- **Badge CI/CD:** `active` (fluxo automatizado detectado).
- **Correção Visual:** Contraste de cores ajustado para acessibilidade.

---

## 7. Resultado do Gate Técnico Final

| Check | Resultado |
|---|---|
| `npm run lint` | ✅ Passou (0 erros) |
| `npm run type-check` | ✅ Passou (0 erros) |
| `npm run test:unit` | ✅ Passou |
| `npm run test:e2e` | ✅ Passou (7 specs de fluxo) |
| `npm run test:a11y` | ✅ Passou (7 specs de acessibilidade) |
| `npm run build` | ✅ Passou (Sentry inclusive) |
| `node tools/verify.js` | ✅ Passou (Gates operacionais OK) |

---

## 8. Documentação e Próximos Passos

- **Roadmap:** Tijolo 09 ✅ completo.
- **Arquitetura:** Atualizada com seção de Observabilidade e Acessibilidade.
- **Tijolos:** Histórico atualizado.

**Próximo Bloco (Tijolo 10): Distribuição em Massa e Engajamento**
1. Estratégia de SEO avançada (metadados por engine).
2. Mini-Auth/Identidade persistente sem fricção.
3. Dashboard Admin simplificado para vizualização de fluxos.

---

## Resumo Executivo (Tijolo 09)

O Hub de Jogos da Pré-Campanha agora é uma **plataforma madura operacionalmente**. 
Não apenas o código funciona, mas ele é **monitorado** (Sentry), **testado automaticamente** (Playwright CI), **acessível** (Axe) e **veloz** (Edge Caching). 

**Status da Nação:** Operação Confiável. Pronto para o público.
