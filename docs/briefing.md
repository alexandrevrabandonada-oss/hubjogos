# Briefing - Hub de Jogos da Pré-Campanha

## 📌 Definição de Produto

**Nome:** Hub de Jogos da Pré-Campanha  
**Tipo:** PWA (Progressive Web App)  
**Plataforma:** Mobile-first, Web responsivo  
**Status:** Fundação - Tijolo 01  

## 🎯 Objetivo

Criar uma plataforma interativa e jogável que transforma pautas políticas reais em experiências compartilháveis, educativas e orientadas para ação e consciência cidadã.

## 🔄 Visão Funcional

### O Que O Produto Faz

1. **Hub Modular de Jogos:** Agrega múltiplos mini-jogos/experiências, cada um abordando uma pauta específica

2. **Gamificação de Pautas:** Transforma tópicos políticos complexos em mecânicas lúdicas, acessíveis e envolventes

3. **Compartilhamento Social:** Designs nativamente shareable em redes sociais (Instagram Stories, WhatsApp, Twitter)

4. **Persistência e Progresso:** Rastreia participação do usuário, pontos, conquistas (future)

5. **Integração Supabase:** Backend robusto para analytics, moderação e escalabilidade

## 👥 Público-Alvo

- **Primário:** Eleitores urbanos 18-45 anos, digitalmente nativos, interessados em engajamento político
- **Secundário:** Influenciadores, ativistas, grupos de campanha que querem viralizar conteúdo
- **Terciário:** Instituições que desejam educação política gamificada

## 💻 Stack Técnico

| Aspecto | Tecnologia |
|--------|-----------|
| Framework Web | Next.js 14+ |
| Linguagem | TypeScript (futuro) |
| Banco de Dados | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Versionamento | Git + GitHub |
| PWA | Web App Manifest + Service Workers |

## 🎨 Identidade Visual

**Conceito:** Universo urbano/industrial, inspirado em "VR Abandonada" / "#ÉLUTA"  
- ❌ Sem estética retro ou placeholder
- ✅ Moderna, vibrante, com identidade forte
- ✅ Otimizada para mobile
- ✅ Acessível (WCAG AA target)

Detalhes em [identidade-visual.md](identidade-visual.md).

## 📊 Princípios de Design

1. **Mobile-First:** Desenvolvimento iniciado para mobile, escalando para desktop
2. **Compartilhável:** Cada experiência deve ter um "resultado shareable"
3. **Rápido:** Score Lighthouse 90+, <2s First Contentful Paint
4. **Modular:** Arquitetura plugin-based para adicionar novos jogos rapidamente
5. **Educativo:** Mechanics devem ensinar/conscientizar, não apenas entreter

## 🔐 Política & Ética

- **Neutralidade Técnica:** Plataforma aberta a diferentes perspectivas políticas
- **Transparência:** Origem de dados, métricas transparentes
- **Privacidade:** LGPD-compliant, sem rastreamento agressivo
- **Inclusão:** Acessibilidade como requisito, não feature

## 📈 Métricas de Sucesso (Futuro)

- Usuários únicos
- Tempo médio de sessão
- Taxa de compartilhamento
- Retenção (D1, D7, D30)
- Desvios de ação cidadã (future integration)

## 🎮 Exemplos de Módulos (Futuro)

- **Voto Consciente:** Quiz sobre propostas
- **Cidade Real:** Puzzle sobre orçamento municipal
- **Pré-Campanha:** Mini-game sobre campanhas
- **Fact-Check:** Jogo de identificar fake news
- (Mais de acordo com necessidades de pauta)

## 🚀 Fase de Lançamento

**MVP (Tijolo 04-05):** Um ou dois módulos de jogos funcionais, compartilháveis, com métricas básicas

## 📋 Escopo do Tijolo 01

Este tijolo **não implementa** features funcionais. Apenas prepara:
- Documentação clara
- Estrutura técnica
- Convenções
- Verificação

**Próximo tijolo:** Scaffold Next.js completo

---

**Última atualização:** 2026-03-05  
**Responsável:** Product Engineering Team
