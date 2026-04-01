# T125 Tycoon / Management Lane Blueprint

## Diagnosis
The Hub Jogos portfolio lacks a "Macro-Flow" management simulation. While *Bairro Resiste* covers tactical RTS and *Cidade Real* touches civic balance, we are missing the pure *RollerCoaster Tycoon* DNA: deep satisfaction derived from watching complex, visible logistical flows resolve in real-time. To maintain the "Anti-Dashboard" doctrine, the simulation must be entirely tactile and physically represented on a map, deeply rooted in RJ's territorial reality.

## Fantasy: "Frota Popular" (Transporte Alternativo Tycoon)
**The Hook**: The official bus monopolies have failed or entered a strike. You operate a grassroots, community-run alternative transport network (Kombis, Vans, Moto-táxis) across the Baixada Fluminense and Zona Oeste.
**The Promise**: Connect isolated neighborhoods to essential hubs (SuperVia stations, UPAs, schools) by physically drawing routes and deploying vehicles to clear massive, visible passenger queues. 

## Core Loop
1. **Trace routes**: Drag connections between isolated neighborhood nodes and destination hubs.
2. **Deploy fleet**: Drag and drop vehicles (from quick Moto-táxis to high-capacity Vans) onto specific routes based on visible queue density.
3. **Watch the flow**: Observe vehicles driving the routes, picking up tiny passenger sprites, and resolving the bottleneck.
4. **Expand and Stabilize**: Use earned community trust to unlock new neighborhood nodes and upgrade hubs, facing escalating rush-hour crises.

## Territorial Setting
**Baixada Fluminense Interconectada**. 
The map is not a spreadsheet; it is a recognizable top-down or isometric representation of RJ's periphery structure. Nodes reflect genuine realities: 
- A dense periphery neighborhood (e.g., Austin, Santa Cruz)
- A central integration hub (e.g., Central do Brasil, Pavuna)
- Essential POIs (Hospital de Base, Universidades)

## Visible Systems (Anti-Dashboard Rules)
- **The Queues**: Passengers are explicitly rendered as clusters of tiny animated sprites waiting at stops. You can *see* the line growing.
- **The Fleet**: Vehicles move along spline curves on the map. You see them physical stop, load (queue shrinks), and depart.
- **Congestion/Capacity**: If a route has too many vehicles, they visibly clump together (traffic). If a vehicle is full, a tactile "Lotada" icon floats above it.
- **Friction/Crisis**: Extreme weather (flooded nodes) or bus strikes physically alter the map, forcing rapid route redrawing.
- **Neighborhood Response**: Happy passengers emit green "thumbs up" or heart particles upon arriving at work/home; angry passengers leaving abandoned queues emit red frustration markers.

## Asset Pack Requirements (Visual-First Doctrine)
To achieve screenshot-power, the following asset kit must be built BEFORE coding:
- **Map Base**: High-fidelity, stylized isometric map of a fragmented urban territory (roads, hills, train lines).
- **Node Kit**: Distinct visual models for "Ponto do Bairro", "Terminal de Trem", "UPA".
- **Vehicle Kit**: Sprites for Moto-táxi (fast, capacity 1), Kombi Clássica (medium, capacity 6), Van Cooperativa (slow, capacity 12).
- **Peep Kit**: Tiny, colorful dots/sprites representing passengers (idle, boarding, frustrated).
- **FX Kit**: Boarding animations, route tracing glowing lines, floating emojis (satisfaction/anger).

## Screenshot Targets
To prove the vertical slice, we must hit three specific visual targets:
1. **The Morning Rush hour**: A chaotic but functional network showing 3 interconnected nodes, colored routes, and vans moving.
2. **The Bottleneck Recovery**: A huge queue at a specific station, with the player physically dragging a new Van onto the glowing route to save the day.
3. **The Expansion Reward**: A zoomed-out view showing a massive, vibrant, and smoothly flowing community transit web emitting positive feedback particles.

## Roadmap Role & Why it Matters Now
- **Corredor Livre**: Micro/Reflexes (Individual movement)
- **Desobstrução**: Micro/Physics (Individual impact)
- **Bairro Resiste**: Tactical/RTS (Squad management)
- **Frota Popular (Tycoon)**: Macro/Systems (Logistics and Flow)

This lane completes the cognitive spectrum of the Hub. It taps into a massive, universal gaming appeal (management sims) while delivering a highly subversive political framing: what happens when citizens manage their own essential infrastructure through mutual aid? It moves the political conversation from "complaining about buses" to "experiencing the joy of collective logistical solutions."
