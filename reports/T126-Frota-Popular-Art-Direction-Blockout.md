# T126 Frota Popular Art Direction & Vertical Slice Blockout

## Diagnosis
The *Frota Popular* tycoon concept (T125) risks ballooning into a sterile, Mini Metro-style line-drawing abstraction or a spreadsheet-heavy transport sim. To secure the political fantasy and structural pleasure, we must restrict the first vertical slice to a singular, highly familiar Baixada Fluminense micro-region. Art direction must prioritize tactile, crowded isometric charm over flat minimalism.

## Slice Territory: O Eixo Lote XV - Belford Roxo
Instead of the entire metropolitan map, the first slice covers a tiny, potent geographic bottleneck.
- **1 Major Hub**: Estação SuperVia Belford Roxo (The transit escape valve).
- **3 Neighborhood Nodes**: Lote XV, Heliópolis, Bom Pastor (High density, high output).
- **1 Essential Service POI**: UPA 24h (Strict, non-negotiable destination for some sprites).
- **1 Recognizable Crisis**: "Linha de Ônibus Oficial Suspensa" (A sudden surge of angry sprites floods the neighborhood stops at 06:00 AM).

## Art Direction & Visual Language
To avoid the dry "transit dashboard" trap, the aesthetic leans into colorful, detailed **Light Isometric (2.5D)**.
- **Perspective**: Fixed isometric angle. We need volume to see the *Kombis* braking and the *Peeps* (passengers) waiting.
- **Lines & Routes**: Glowing, thick painted splines on the ground that adapt to the curvy street grid (no straight minimalist lines).
- **Peeps & Queues**: Passengers are not numbers (`45/100`). They are actual 2D sprites stacked in organic crowds. As the queue grows, the crowd physically spills onto the street.
- **Feedback FX**: Droplets of sweat/red anger symbols pop up from waiting crowds. Green hearts erupt when a Van doors open and ingests the queue.

## Fleet Scope (V1)
The slice operates on strict minimalism to prove the core loop.
- **Kombi Clássica Branca**: Alta agilidade, navega trânsito, capacidade baixa (6 passageiros).
- **Van de Cooperativa**: Mais lenta nas curvas, bloqueia cruzamentos curtos, capacidade alta (15 passageiros).
*(Moto-táxis e Ônibus de Integração estão expressamente trancados fora do V1).*

## Visible Systems Proof
The vertical blockout must prove:
1. **Flow Reading**: Seeing 30 angry sprites at Lote XV and watching them disappear as 2 Vans arrive.
2. **Kinetic Response**: Dragging a Kombi from an idle pool and snapping it onto a struggling route must feel instantaneous.
3. **Physical Bottlenecks**: Seing two Vans stuck behind each other on a narrow isometric street because the player over-allocated resources to one route.

## Screenshot Targets
When the blockout is complete, these 4 moments must read perfectly in still images:
1. **Calm Start**: The neighborhood asleep, clear streets, 1 Kombi doing the night-shift run.
2. **The Surge (Crisis)**: Lote XV station overflowing with 50+ angry red sprites spilling onto the avenue.
3. **The Intervention**: The player's cursor mid-air, drawing a glowing route and dropping a Van Cooperativa directly into the chaos.
4. **Flow Restored**: The street clear, Vans rolling in a neat circuit, dropping off sprites at the SuperVia hub with a cascade of green satisfaction particles.

## Scope Guardrails (What goes OUT)
To guarantee we finish the slice:
- **NO** regional Rio map. Strictly the Belford Roxo micro-axis.
- **NO** progression trees or economy (no money, upgrades, or purchasing vans. Vans are granted by script).
- **NO** dashboard-first UI. Information lives on the vehicles and the crowds.
- **NO** complex routing algorithms. Vehicles just loop their assigned line end-to-end.

## Exact Next Production Recommendation
Before opening the code editor for a React flow state, coordinate the creation of the isometric **Visual Target Dump**: map tile, 1 Kombi sprite, 1 Van sprite, and 1 passenger Peep. Once the visual standard is locked, slice programming can begin.
