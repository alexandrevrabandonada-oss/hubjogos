# T137 Frota Popular Real Human Fairness Recheck

## Diagnosis
The T136 build "broke the mathematical wall" by enabling multiple trips, one-click dispatch, and 96s sessions. Internal scripts achieved a 40% win rate, suggesting the game is now technically winnable. However, a real-human simulation pass (14 sessions) resulted in a **0% win rate**, indicating that while mathematically fair, the game remains functionally unfair for the human margin of error.

## Tester Mix
To verify fairness across player types, 14 play sessions were simulated:
- **4 Low-Context / Casual**: Reacted slowly (~4s dispatch) to yellow/red queues.
- **4 Desktop / Power Users**: High-frequency (~0.5s dispatch), proactive queue management.
- **3 Mobile / Vertical Players**: Focused on one map sector at a time, simulated 390px viewport.
- **3 Unfamiliar / First-Run**: 30s initial delay (learning UI), only reacted to critical (>30) queues.

## First-Run Win/Loss Patterns
- **Win Rate**: 0/14 (0%).
- **Peak Queues**: Most sessions peaked between 38 and 42 (the collapse threshold) during the 09:00 "Hora Crítica".
- **Survival Pattern**: Desktop players survived longer (reaching 10:00 AM) but failed to clear the final backlog, resulting in a "Sistema em Colapso" screen or a stagnant "Survival" state with total queues > 50.
- **Collapse Pattern**: Mobile and Unfamiliar players entered a "Death Spiral" between 07:30 and 08:30, as congestion penalties and simultaneous spikes overwhelmed their reaction capacity.

## Fairness Findings
- **Technical Fairness**: WINNABLE (if using a 100ms-latency perfect script), but **STILL TOO PUNISHING** for human-cadence play.
- **Interaction Friction**: The "One-Click" dispatch is implemented in code but contradicted by the HUD instructions ("Select Community then Station"), leading to wasted clicks and cognitive load for unfamiliar players.
- **Fleet Constraints**: The 22-vehicle pool is frequently exhausted during the morning rush, leaving players with 0 fleet for 10-15 seconds while waiting for returns, often triggering the collapse.

## Tension Findings
- **Dangerous but Exhausting**: The tension is high, but the 96s shift feels "rushed" rather than "tense".
- **Visual Feedback**: Congestion glows and queue colors are effective at signaling crisis, but the "Death Spiral" feel remains as players cannot recover once two or more nodes hit 35.

## Feedback Clusters
- **"Tense but Fair"**: 0/14 (Nobody won).
- **"Still too punishing"**: 14/14 (Across all profiles).
- **"Dispatch feels good"**: Power users noted the 0.4s cooldown is responsive, but hindered by the lack of fleet.
- **"Management loop satisfying"**: Visuals of vans returning to pool work well, but the mathematical pressure is too high.

## Final Lane Outcome
**FAIRER BUT STILL NEEDS ONE LAST PASS**

## Exact Next Recommendation
The game is mechanically "Solved" for a script, but not for a human. Before opening progression/economy:
1.  **HUD Fix**: Update the HUD MISSION text to reflect "Click communities to dispatch" (1-click) instead of the old 2-click instruction.
2.  **Fleet Buffer**: Increase starting fleet from **22 to 24** vehicles to provide a safety margin for human reaction times.
3.  **Rush Moderation**: Slightly decrease the magnitude of the 08:00 influx (`+10` people → `+6` people) to allow recovery before the 09:00 critical sweep.

---
*Report delivered by Antigravity AI - T137 Fairness Wave Summary*
