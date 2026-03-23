# Relatório de Ativação T62: Bairro Resiste

## Objetivo
Tirar o jogo `bairro-resiste` do estado de "amostra fria" e validar a sanidade da telemetria através de uma ativação controlada.

## Ações Realizadas

### 1. Correção de Telemetria
- **Problema**: O evento `game_view` não estava sendo disparado ao carregar a página do arcade.
- **Solução**: Implementado `useEffect` em `app/arcade/[slug]/page.tsx` para garantir o tracking de visualização em todos os jogos de arcade.
- **Impacto**: Agora temos o topo do funil (View) garantido para cálculo de conversão real.

### 2. Ativação Controlada
- **Estratégia**: Adição do rail "🚀 Novas Missões em Validação" na Home.
- **Posicionamento**: Acima das coleções consolidadas, mas abaixo do hero principal, evitando "sequestrar" o tráfego orgânico do `tarifa-zero-corredor`.
- **Segmentação**: Focada em usuários que buscam novidades e mecânicas experimentais.

### 3. Dashboard de Validação (`/estado`)
- **Novo Card**: "Amostragem: Bairro Resiste".
- **Métricas em Tempo Real**:
    - Runs efetivas (meta: 30 para baseline estatística).
    - Funil completo: View → Start → Completion (90s) → Replay.
    - Setor mais crítico (Moda do wipe).
    - Fase média atingida.
- **Veredito Provisório**: Mantido em `LIVE_BUT_EARLY` até atingir 30 runs consolidadas.

## Próximos Passos
1. Acompanhar o cockpit `/estado` nas próximas 24h.
2. Se a conversão View → Start for < 5%, revisar o card de preview.
3. Ao atingir 30 runs, realizar a análise de retenção vs `tarifa-zero-rj`.

---
*Gerado por Antigravity - Principal Engineer*
