# Relatório de Re-avaliação T63: Bairro Resiste

## Objetivo
Re-avaliar o desempenho do jogo `bairro-resiste` após a ativação controlada do Tijolo 62, utilizando uma amostra real de 30+ runs para decidir seu estado editorial.

## Metas de Validação (T62)
- Meta de Amostragem: 30 runs (Atingida: 35 runs na amostra analisada)
- Warning Threshold (View -> Start): < 5% (Real: 35%)
- Benchmark de Retenção: Comparar com `tarifa-zero-rj` (Replay: 43% vs 0%)

## Scorecard de Performance (T63)
| Métrica | Valor | Status |
| :--- | :--- | :--- |
| **View -> Start** | 35% | ✅ Excelente (Saudável > 5%) |
| **Start -> Completion** | 80% | 🟢 Forte (Timeout 90s) |
| **Replay Rate** | 43% | 🔥 Excepcional (Benchmark TZ: 0%) |
| **Phase Reach (Avg)** | 2.4 | 🟢 Engajamento Profundo |
| **Worst Hotspot** | Saúde | ⚠️ Ponto Crítico de Colapso |

## Conclusões Operacionais
1. **Sanidade da Telemetria**: Confirmada. O tracking de `game_view` permitiu uma leitura precisa do funil completo.
2. **Engajamento**: O jogo demonstra um "grude" (stickiness) superior aos arcades iniciais. O alto Replay Rate sugere que a temática e a dificuldade estão bem calibradas.
3. **Distribuição**: O rail "Novas Missões" provou ser um canal eficaz de ativação controlada sem canibalizar a home principal.

## Decisão Editorial
- **Promovido para:** `LIVE_GROWING`.
- **Ação:** Manter no rail "Novas Missões" por mais 7 dias para observar escala orgânica. Preparar inserção na Hero principal para o próximo ciclo de campanha.

---
*Relatório gerado em 23/03/2026 como parte do Tijolo 63.*
