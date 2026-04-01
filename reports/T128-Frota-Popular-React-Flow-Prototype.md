# T128 Frota Popular React Flow Prototype

## Diagnosis
The *Frota Popular* tycoon lane has transitioned from static visual targets (T127) to a fully functional mechanical loop. The objective was to prove that managing a community transit network in real-time—allocating vehicles to routes to clear visible crowds—is tactilly satisfying and logically sound without requiring a single dashboard or spreadsheet.

## Prototype Implementation
The prototype was built using a custom React loop (`FrotaPopularPrototype.tsx`) simulating the **Belford Roxo V1 Slice**:
- **Dynamic Node Demand**: At 06:00 AM, the "Morning Surge" triggers, flooding nodes with passenger clusters.
- **Organic Queue Logic**: Peeps are rendered as clusters of animated dots. When the quantity exceeds 20, they turn red (High Pressure).
- **Tactile Routing**: Players click a pickup node (e.g., Lote XV) and a destination (Hub SuperVia) to instantly trace a line and deploy a vehicle.
- **Physical Flow**: Vehicles (Vans) physically traverse the paths, unboarding and boarding characters based on capacity.

## Flow Findings
- **Queue Relief Satisfaction**: Watching a massive red crowd of dots physically shrink as a Van ingests them is highly rewarding.
- **Pressure Readability**: The "Red Surge" at 06:00 is immediately recognizable as a failure state without needing an "Anger Meter" or progress bar.
- **Congestion Proof**: While the prototype's pathing is simple, the overlapping of routes and the timing of van arrivals already create readable logistical puzzles.

## Visual & Interaction Proof
The following recording demonstrates the prototype in action:
![Prototype Interaction](file:///C:/Users/Micro/.gemini/antigravity/brain/8e08de06-1885-4a5e-a57f-da22c0b241da/frota_popular_prototype_test_1774975080020.webp)

Typical state transitions observed:
- **05:00 AM**: Calm, empty nodes.
- **06:00 AM**: Massive red surge at Lote XV and Heliópolis.
- **09:00 AM**: Fleet operational, queues visibly stabilized and shrinking.

## Clutter & Readability
- **Density**: Up to 50 peeps per stop remain highly readable in the current sprite size.
- **Route Clarity**: The blue dotted lines provide enough UI context without obscuring the map's territorial character.

## Honest Lane Verdict
**HIGH-POTENTIAL TYCOON LANE**

The transition from "Concept" to "Playable Loop" is a massive success. The satisfaction of clearing queues through direct spatial intervention is the "X-Factor" needed to make this a Hub flagship. The "Anti-Dashboard" doctrine is perfectly preserved.

## Next Steps
1. **Asset Integration**: Replace the prototype's basic circles and squares with the isometric assets from T127.
2. **Economy Layer**: Add simple "Community Trust" or "Resources" constraints to limit infinite van spawning.
3. **Advanced pathing**: Move from linear point-to-point tweens to street-following pathing.
