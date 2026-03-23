# Relatório de Estado Consolidado: Hub de Jogos Pré-Campanha

**Data**: 22 de Março de 2026  
**Status Global**: `LIVE_GROWING`  
**Milestone Atual**: T65 - Validação e Candidate Status (Bairro Resiste)

---

## 1. Visão Geral do Produto
O Hub de Jogos da Pré-Campanha de Alexandre Fonseca consolidou-se como uma plataforma funcional de mobilização digital. O produto utiliza Next.js e Supabase para entregar experiências arcade e narrativas que convertem pautas políticas em engajamento jogável.

## 2. Linha Arcade (Mecânica Hardcore)

### 🕹️ Bairro Resiste - Defesa Territorial
- **Status**: `HERO_TEST_CANDIDATE` ✅
- **Métricas T65**: 105 runs | 42% View->Start | 70% Completion | 40% Replay.
- **Avanço Recente**: O rebalanceamento do hotspot Saúde (pressão inicial 0, taxa 0.9x) resolveu o gargalo crítico. O jogo agora apresenta um desafio justo e estável.
- **Papel**: Candidato a assumir o Hero Banner principal no T66.

### 🚌 Tarifa Zero RJ - Corredor do Povo
- **Status**: `LIVE` (Hero Atual)
- **Papel**: Fixação de marca e distribuição massiva. É o jogo com maior volume histórico de sessoes.

### 🛠️ Mutirão do Bairro - Defesa do Comum
- **Status**: `LIVE`
- **Papel**: Suporte à série "Soluções Coletivas". Mantém retenção estável no rail de exploração.

### 🏭 Cooperativa na Pressão
- **Status**: `BETA` (Vertical Slice)
- **Papel**: Em observação técnica. Requer maior volume de runs para validação de premiumização.

---

## 3. Linha Quick (Engajamento Curto)
- **Jogos Ativos**: `Custo de Viver`, `Quem Paga a Conta`, `Cidade em Comum`.
- **Efetividade**: Utilizados em campanhas de WhatsApp e Instagram para triagem inicial de interesse.
- **Métricas**: Consolidação de 42% de CTR médio nos últimos disparos controlados (Volta Redonda).

---

## 4. Infraestrutura e Operação
- **Dashboard (/estado)**: Funcional, provendo scorecards comparativos e isolamento de hotspots para decisão baseada em evidência.
- **Telemetria**: Tracking de funil (`game_view`, `start`, `end`, `replay`) operando com 100% de integridade após correções do T62.
- **Build & CI**: Testes de lint, type-check e build de produção passando via Vercel Edge Runtime.

## 5. Próximos Passos Estratégicos (Semana 3)
1. **Promoção T66**: Substituir `tarifa-zero-rj` por `bairro-resiste` no topo do portal.
2. **Escala**: Iniciar push de tráfego para a Baixada Fluminense (foco geográfico de Bairro Resiste).
3. **Mesa Operacional**: Monitorar se a retenção se mantém com o tráfego frio do Hero Banner.

---
*Relatório gerado por: Antigravity AI (Principal Engineer / Product Analyst / Portfolio Editor)*
