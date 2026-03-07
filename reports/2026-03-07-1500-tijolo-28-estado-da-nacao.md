# Estado da Nacao - Tijolo 28

Data: 2026-03-07 15:00
Status: concluido

## Diagnostico do estado anterior (entrada do Tijolo 28)

Estado de entrada (apos Tijolo 27):
- plano operacional de distribuicao criado em `docs/plano-distribuicao-quick.md`
- metas minimas de amostra definidas por janela (7d, 30d, all)
- status de coleta implementado (`coleta-insuficiente`, `coleta-em-andamento`, `coleta-minima-atingida`, `pronto-para-priorizacao`)
- report de distribuicao operacional (`beta:distribution-report`) com progresso por quick/serie/territorio
- cockpit `/estado` com barras de progresso e avisos de insuficiencia
- criterio formal de "pronto para Tijolo 29" baseado em amostra minima

Fragilidades na entrada:
- ainda sem amostra quick suficiente para comparacao confiavel (mesma situacao do T26-T27)
- distribuicao manual, sem links prontos por canal/territorio
- sem operacao semanal documentada para executar plano de distribuicao
- `/estado` apenas informativo, sem recomendacoes acionaveis
- branding eleitoral presente mas nao reforçado em materiais de campanha

## Objetivo do Tijolo 28

Transformar o plano de distribuicao do Tijolo 27 em operacao pratica de campanha, criando ferramentas simples e rastreaveis para distribuir quick games por canal, territorio e serie sem abrir novo escopo de produto.

Foco:
- gerar engajamento eleitoral real
- reforçar pre-campanha de Alexandre Fonseca para Deputado
- distribuir quick games de forma comparavel
- coletar amostra suficiente para decidir proxima fase com honestidade

## Entregas do Tijolo 28

### 1. Sistema de links de campanha rastreaveis

Criado em `lib/campaign-links/`:
- `types.ts`: tipos para canais, mediums, campanhas (Instagram, WhatsApp, TikTok, etc.)
- `builder.ts`: funcoes para construir links com UTMs automaticos
- `packages.ts`: geradores de pacotes por canal, territorio e serie
- `index.ts`: barrel export do modulo

Funcionalidades:
- links com UTMs completos (source, medium, campaign, content)
- parametros de contexto (territorio, serie, jogo)
- builder functions para home, explorar e play
- suporte a 10 canais (Instagram, WhatsApp, TikTok, Twitter, Facebook, Telegram, YouTube, Direto, Bio, LinkHub)

### 2. Script de geracao de links de campanha

Criado `tools/generate-campaign-links.js`:
- comando: `npm run campaign:links`
- gera pacotes de distribuicao para todos os canais prioritarios
- output em `reports/distribution/links/campaign-links-YYYY-MM-DDTHH-MM-SS.md`
- suporte a formato JSON com `--format=json`
- pacotes organizados por prioridade (territorio, canal, serie)

### 3. Pacotes de distribuicao por canal

Criados em `reports/distribution/packages/`:
- `instagram-geral.md`: links prontos para Instagram (stories, posts, reels, bio)
- `whatsapp-geral.md`: links prontos para WhatsApp (grupos, listas, status, individuais)
- `tiktok-geral.md`: links prontos para TikTok (videos, bio, ideias de conteudo)

Cada pacote inclui:
- links para home, explorar e cada quick game
- textos prontos contextualizados por jogo
- dicas de uso por formato (stories, posts, videos, mensagens)
- hashtags sugeridas
- estrategias de distribuicao por canal

### 4. Pacotes de distribuicao por territorio

Criados em `reports/distribution/packages/`:
- `territorio-estado-rj.md`: pacote prioritario para Estado do Rio de Janeiro (semana 1)
- `territorio-volta-redonda.md`: pacote comparativo para Volta Redonda (semana 2)

Cada pacote inclui:
- quick games prioritarios em ordem de distribuicao
- links para Instagram, WhatsApp e TikTok por quick game
- metas operacionais (80+ sessoes na janela 7d)
- plano semanal (dias 1-7) com foco diferenciado por dia
- mensagens contextualizadas para o territorio
- indicadores de sucesso e proximos passos

### 5. Operacao semanal documentada

Criado `docs/operacao-semanal-distribuicao.md`:
- ciclo completo de 14 dias (semana 1: estado-rj, semana 2: volta-redonda)
- rotina diaria detalhada com checklists executaveis
- ordem de distribuicao por quick game (alternar a cada 2-3 dias)
- checkpoints de progresso (meio da semana, fim da semana)
- criterios de "nao-concluir-cedo-demais"
- decisao no fim de cada semana (continuar ou avancar)
- rastreamento de experimento QR A/B em paralelo

### 6. Script de brief semanal de campanha

Criado `tools/beta-campaign-brief.js`:
- comando: `npm run campaign:brief`
- gera resumo executivo automatico da campanha
- output em `reports/distribution/briefs/campaign-brief-YYYY-MM-DDTHH-MM-SS.md`
- conteudo:
  - candidato e objetivo da campanha jogavel
  - foco da semana atual (territorio, serie, quicks prioritarios)
  - quick games ativos com links prontos
  - status de coleta (ultimos 7 dias)
  - recomendacoes da semana (acoes prioritarias, alertas, proximos passos)
  - recursos de distribuicao (pacotes, docs, comandos)
- determina semana automaticamente (1 ou 2 do ciclo de 14 dias)

### 7. Melhorias no `beta:distribution-report`

Atualizacoes em `tools/beta-distribution-report.js`:
- nova secao "O que distribuir esta semana" com:
  - quick prioritario (menor progresso)
  - territorio prioritario
  - serie prioritaria
  - pacotes de distribuicao recomendados
- ordenacao de quicks/series/territorios por progressPct (menor primeiro)
- recomendacoes mais acionaveis e especificas
- indicacao clara quando meta esta atingida (pronto para Tijolo 29)

### 8. Melhorias no `/estado` para operacao de campanha

Atualizacoes em `app/estado/page.tsx`:
- novo bloco "O que distribuir agora - Operacao de Campanha" exibido antes do "Status de Coleta"
- conteudo dinamico baseado em status de coleta:
  - quick prioritario (menor progresso) com % da meta e canais recomendados
  - territorio prioritario com % da meta e link para pacote
  - serie prioritaria com % da meta
  - alerta de experimento QR se precisar atencao
  - indicacao quando metas estao atingidas (pronto para Tijolo 29)
- mensagem visual de sucesso quando todas as metas foram atingidas
- link para `docs/operacao-semanal-distribuicao.md` para roteiro completo

### 9. Documentacao de distribuicao

Criado `docs/distribuicao-links.md`:
- explica sistema de links rastreaveis com UTMs
- descreve canais prioritarios e secundarios
- lista territorios e series prioritarias
- detalha estrutura de pacotes (por territorio, por canal, por serie)
- instrucoes de uso operacional para semana 1 e semana 2
- exemplo de link completo com todos os parametros
- integracao com rastreamento (Supabase Events, metricas quick, status de coleta)

### 10. Atualizacoes em documentacao geral

Atualizados:
- `README.md`:
  - status atual: Tijolo 28 concluido
  - nova secao "Operacao de Distribuicao (Tijolo 28)" com scripts e docs
  - bloco "O que distribuir agora" mencionado no cockpit
- `docs/roadmap.md`:
  - Tijolo 28 marcado como concluido
  - listadas todas as entregas
  - proximo ciclo (Tijolo 29) atualizado com foco em execucao da distribuicao
- `docs/tijolos.md`:
  - Tijolo 28 adicionado com objetivo, entregues, nao-inclui e guardrails
  - proximo passo definido (Tijolo 29)

### 11. Branding eleitoral reforçado

Todos os materiais de distribuicao mencionam explicitamente:
- "Pre-Campanha de Alexandre Fonseca para Deputado"
- Candidato: Alexandre Fonseca
- Cargo: Deputado Estadual
- Estado: Rio de Janeiro

Presenca em:
- pacotes de canal (Instagram, WhatsApp, TikTok)
- pacotes de territorio (estado-rj, volta-redonda)
- textos prontos para posts/mensagens
- brief semanal
- documentacao de distribuicao
- links de campanha (utm_campaign=pre-campanha-alexandre-fonseca)

## Leitura operacional atual (dados reais)

Fonte: mesma situacao do Tijolo 27 (sem amostra quick suficiente ainda).

### Amostra quick (janela 7d)
- Sem sessoes quick suficientes na janela 7d para comparacao
- Status geral de quicks: sem dados
- **Razao**: distribuicao ainda nao foi executada com links prontos

### Amostra territorio (janela 7d)
- Sem dados de territorios quick na janela 7d
- **Razao**: distribuicao territorial sera executada a partir de agora com pacotes criados

### Amostra serie (janela 7d)
- Sem dados de series quick na janela 7d
- **Razao**: distribuicao por serie sera executada seguindo `docs/operacao-semanal-distribuicao.md`

### Experimento QR A/B
- Continua em coleta com ~47-52 sessoes por variante
- QR views: 2 (baixo)
- QR clicks: 0 (zerado)
- Status: "coleta-em-andamento" (29-32% da meta)

## Validacoes tecnicas

Rodadas em 2026-03-07:

```bash
npm run lint           # ✅ No ESLint warnings or errors
npm run type-check     # ✅ OK (apos correcao de tipos em campaign-links/builder.ts)
npm run test:unit      # ✅ 15/15 passed
npm run build          # ✅ Build otimizado OK (warnings Sentry nao-bloqueantes)
npm run verify         # ✅ 52/52 checks OK
```

Correcoes aplicadas:
- tipagem de `campaign` em `buildGameLinks`, `buildHomeLinks`, `buildExploreLinks` corrigida de `string` para `CampaignName`
- importacao de `CampaignName` adicionada em `campaign-links/builder.ts`

## Riscos restantes

1. **Amostra quick continua insuficiente**: tirando mao da operacao, distribuicao real precisa acontecer nos proximos 7-14 dias.
2. **Experimento QR com baixa exposicao**: apenas 2 QR views e 0 clicks, precisa de mais trafego.
3. **Operacao semanal depende de execucao disciplinada**: pacotes e roteiro estao prontos, mas precisam de humanos da campanha executando.
4. **Decisao sobre formato medio ainda depende de amostra**: nao abrir Tijolo 29 (formato medio) ate ter amostra minima comparavel.

## Bloqueios removidos

- **Links manuais**: agora automatizados com UTMs por canal/territorio/serie.
- **Falta de roteiro operacional**: `docs/operacao-semanal-distribuicao.md` fornece checklists diarios.
- **Cockpit passivo**: `/estado` agora tem bloco "O que distribuir agora" acionavel.
- **Distribuicao ad-hoc**: pacotes prontos por canal e territorio eliminam montagem manual.
- **Branding fraco**: pre-campanha de Alexandre Fonseca reforçada em todos os materiais.

## Proximas acoes recomendadas (Tijolo 29)

1. **Executar distribuicao da semana 1** seguindo `reports/distribution/packages/territorio-estado-rj.md`:
   - Dia 1-2: Cidade em Comum (Instagram + WhatsApp)
   - Dia 3-4: Custo de Viver (TikTok + WhatsApp)
   - Dia 5-7: Quem Paga a Conta (Instagram + WhatsApp)
   - Checkpoint meio da semana: `npm run beta:distribution-report`
   - Checkpoint fim da semana: avaliar se meta de 80+ sessoes foi atingida

2. **Se meta atingida na semana 1**: executar distribuicao da semana 2 (Volta Redonda).

3. **Se meta nao atingida na semana 1**: estender distribuicao estado-rj por mais 3-4 dias, reforcar quick com menor amostra.

4. **Ao final de 14 dias (ou quando ambos territorios atingirem meta)**:
   - Rodar `npm run beta:distribution-report`
   - Rodar `npm run campaign:brief`
   - Avaliar serie lider (provisoriamente: serie-solucoes-coletivas)
   - Avaliar territorio lider (provisoriamente: estado-rj)
   - **Decidir de forma honesta**: qual serie transformar em blueprint de formato medio
   - **Abrir Tijolo 29**: transformacao da serie lider em formato medio

5. **Nao concluir cedo demais**:
   - Nao abrir formato medio sem amostra minima (80+ sessoes/territorio, 60+ sessoes/quick)
   - Nao decidir serie lider sem comparacao honesta entre serie-solucoes-coletivas e serie-trabalho-sobrevivencia
   - Nao tensionar territorio sem ter pelo menos 2 territorios com amostra comparavel

## Guardrails respeitados

✅ Sem nova engine (4 engines permanecem)
✅ Sem formato medio (aguardando amostra para decidir)
✅ Sem auth/CMS/admin
✅ Foco em operacao de campanha e distribuicao pratica
✅ Rastreabilidade total (UTMs em todos os links)
✅ Operacao simples e idiota-proof (pacotes prontos, roteiros com checklists)
✅ Branding eleitoral reforçado sem panfletagem dura

## Estado tecnico final

- `lib/campaign-links/`: 4 arquivos (types, builder, packages, index)
- `tools/generate-campaign-links.js`: script de geracao de links
- `tools/beta-campaign-brief.js`: script de brief semanal
- `tools/beta-distribution-report.js`: atualizado com secao "O que distribuir esta semana"
- `app/estado/page.tsx`: atualizado com bloco "O que distribuir agora"
- `reports/distribution/packages/`: 5 pacotes (instagram, whatsapp, tiktok, estado-rj, volta-redonda)
- `docs/distribuicao-links.md`: documentacao de links
- `docs/operacao-semanal-distribuicao.md`: roteiro de 14 dias
- `package.json`: adicionados comandos `campaign:links` e `campaign:brief`
- `README.md`, `docs/roadmap.md`, `docs/tijolos.md`: atualizados

Linhas tocadas (estimativa): ~1200 novas linhas de codigo/documentacao
Arquivos criados: 12
Arquivos modificados: 7

## Recomendacao explicita

**Pronto para execucao operacional.**

O Tijolo 28 nao cria novo produto, cria infraestrutura operacional para executar distribuicao disciplinada.

**Nao abrir Tijolo 29 (formato medio) ate:**
- Executar distribuicao por 7-14 dias seguindo `docs/operacao-semanal-distribuicao.md`
- Consolidar amostra minima comparavel (80+ sessoes/territorio, 60+ sessoes/quick)
- Rodar `beta:distribution-report` e confirmar status "pronto para priorizacao"
- Decidir de forma honesta qual serie virou lider (aguardando evidencia real, nao intuicao)

A campanha agora tem:
- links prontos
- pacotes prontos
- roteiro semanal
- cockpit acionavel
- brief automatico

**Proxima fronteira e execucao, nao mais planejamento.**

---

Gerado em: 2026-03-07 15:00
Tijolo: 28
Status: concluido
Proximo: Tijolo 29 (executar distribuicao e decidir serie lider com evidencia)
