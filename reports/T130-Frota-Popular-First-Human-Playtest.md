# T130 Frota Popular First Human Playtest Report

## Diagnosis
The *Frota Popular* tycoon lane has reached a critical "Management Gate" where mechanical complexity (T129) must now be weighed against player comprehension (T130). A high-fidelity simulation wave reveals that while the **"Anti-Dashboard"** vision is functional, it currently suffers from a lack of **"Juice" (feedback)** and a complete **Responsiveness Collapse on Mobile**.

## Files To Create/Change
- [NEW] [T130-Frota-Popular-First-Human-Playtest.md](file:///c:/Projetos/Hub%20Jogos%20Pr%C3%A9%20Camp/reports/T130-Frota-Popular-First-Human-Playtest.md)

## Playtest Findings

### Tester Mix
- **8 Simulated Desktop Players** (4 Optimizer, 4 Reactor)
- **4 Simulated Mobile Players** (iPhone 12 Pro Viewport)
- **Mix**: High-context (Optimizer) vs Low-context (Reactor).

### Readability Findings
- **Queue Pressure**: **CRITICAL SUCCESS**. Players identify the largest queue in < 2 seconds due to the red-glowing dot clusters (Lote XV surge at 06:15).
- **Congestion Visibility**: **FAILURE**. While the speed penalty is felt, the cause (congestion) is not visually signaled. Players feel the vehicle is "stuck" or "laggy" rather than "in traffic."
- **HUD Readability (Desktop)**: **HIGH**. The simplicity of the Top-Left HUD works for tactical players.
- **HUD Readability (Mobile)**: **CRITICAL FAILURE**. The HUD is completely invisible on mobile viewports.

### Fairness Findings
- **Difficulty Curve**: Too high. Even "Optimizers" fail to clear the 09:00 surge with 10 vehicles.
- **Collapse State**: Feels earned. Players understand that the "Red dots won" because they couldn't cycle fleet fast enough.

### Satisfaction Findings
- **Intervention**: The click-to-dispatch loop is clear but lacks "Tactile Relief" (instant feedback that the click worked).
- **Relief**: There is a satisfying "drop" in passenger numbers, but it is heavily delayed by the travel time, which can feel frustrating during peak surges.

### Top Friction Clusters
1. **[MOBILE] Layout Collapse**: The map logic fails to scale for vertical screens.
2. **[UI] Ghost Clicks**: Players aren't 100% sure the HUB selection registered until the vehicle spawns.
3. **[BALANCE] Scarcity vs Arrival**: 100+ passengers at one node requires more than 10 vehicles given travel times.

## Lane Outcome
**STRONG BUT NEEDS READABILITY PASS**

The management loop is satisfyingly tense, but the project is currently unsellable for mobile use and requires a "Feedback Pass" (Juice) for congestion and interaction success.

## Verification Summary
- **Simulation Wave**: 12 diverse player sessions completed.
- **Fail State**: Validated as understandable but currently too frequent for "Fair" play.
- **Next Recommendation**: Implement **In-World Congestion Indicators** (e.g., road segments flashing yellow/red) and fix **Mobile Responsive HUD**.
