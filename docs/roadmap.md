# Roadmap - Hub de Jogos da Pré-Campanha

## Linha do tempo de tijolos

- Tijolo 01 ✅ Fundação documental e operacional
- Tijolo 02 ✅ Scaffold executável
- Tijolo 03 ✅ Direção visual + componentes + quiz real
- Tijolo 04 ✅ Runtime operável multi-engine + persistência/analytics básicos
- Tijolo 05 ⏭️ Escala de engines e camada de compartilhamento avançada

## Estado atual (após Tijolo 04)

### Entregue

- Runtime unificado por adapter/resolver
- 2 engines reais em produção (`quiz` e `branching_story`)
- Componente comum de outcome com CTA político
- Persistência opcional (local + Supabase resiliente)
- Eventos analíticos mínimos instrumentados
- Share layer mínima real (copiar resumo + copiar link)

### Ainda não entregue

- Engines reais para todos os tipos (`simulation`, `map`)
- Share pack avançado (card dinâmico/OG)
- Camada analítica de visualização
- Ciclos com usuários externos

## Tijolo 05 (próximo)

Objetivo: ampliar alcance e maturidade operacional.

Escopo sugerido:

1. 1 nova engine real (simulação ou mapa)
2. hardening de performance e acessibilidade
3. share card visual por resultado
4. trilha de métricas agregadas no Supabase
5. preparação para beta externo

Critérios:

- 3+ engines reais ativas
- Web vitals e UX mobile refinados
- fluxo de compartilhamento com preview melhorado
- gate técnico 4/4 sempre verde

Última atualização: 2026-03-06
