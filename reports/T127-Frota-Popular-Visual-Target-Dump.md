# T127 Frota Popular Visual Target Dump

## Diagnosis
The *Frota Popular* tycoon needs a locked visual standard to protect its development from drifting back into "spreadsheet transport sim" territory. Using the Light Isometric direction defined in T126, we have generated primary visual targets ranging from individual asset sprites to full scene compositions. This ensures readability, anti-clutter mechanics, and screenshot power.

## Visual Target Dump & Asset Hierarchy
1. **The Map Chunk**: Vibrant, defined asphalt with clear intersections.
2. **Transportation Nodes**: Small bus shelters with physical space for crowds.
3. **The Fleet**:
   - Bright white **Kombi** (smaller, compact footprint).
   - High-capacity **Van Cooperativa** (longer, blocky silhouette).
4. **The Peeps (Crowds)**: Tiny, saturated dot-characters. Their density, not a UI number, defines the queue logic.

![Asset Dump Concept](file:///C:/Users/Micro/.gemini/antigravity/brain/8e08de06-1885-4a5e-a57f-da22c0b241da/frota_popular_asset_dump_1774973931593.png)

## The 4 Screenshot Mockups (Vertical Slice Proof)

### 1. The Calm Start
At the beginning of the shift, the neighborhood is quiet. A single Kombi traces the route. The visual hierarchy proves that idle peeps are easily distinguishable against the light asphalt.
![Calm Start](file:///C:/Users/Micro/.gemini/antigravity/brain/8e08de06-1885-4a5e-a57f-da22c0b241da/frota_popular_calm_start_1774973951060.png)

### 2. The Morning Surge (Crisis Bottleneck)
The bus lines fail, forcing hundreds of workers into the alternative transit nodes. The peeps clump into an amorphous, expanding mass, spilling onto the streets. The visual clutter here is *intentional*: the player recognizes immediately that the situation is failing without reading a single number.
![Morning Surge](file:///C:/Users/Micro/.gemini/antigravity/brain/8e08de06-1885-4a5e-a57f-da22c0b241da/frota_popular_morning_surge_1774973968166.png)

### 3. The Intervention
The player reacts by dragging a new Van onto the glowing route line. The route line adds temporary UI overlay to guide the drop, contrasting aggressively with the organic crowds, proving tactile satisfaction.
![Intervention](file:///C:/Users/Micro/.gemini/antigravity/brain/8e08de06-1885-4a5e-a57f-da22c0b241da/frota_popular_intervention_1774973983780.png)

### 4. Restored Flow (Positive Resolution)
The fleet arrives. The massive crowd is ingested by the Vans. The streets return to order, and the remaining peeps emit positive green FX (hearts/thumbs up), resolving the visual tension into a clean, "reward" state.
![Restored Flow](file:///C:/Users/Micro/.gemini/antigravity/brain/8e08de06-1885-4a5e-a57f-da22c0b241da/frota_popular_restored_flow_1774974001161.png)

## Anti-Clutter Readability Review
- **Nodes**: Unmistakable.
- **Vehicles vs Crowds**: Bright white vans contrast cleanly against the colorful, swarming dots of the passengers.
- **Route Lines**: Only glowing actively during construction or selection, preventing a spaghetti-lane unreadable mess.
- **Identification Speed**: A bottleneck can be identified visually in <2 seconds simply by looking for the largest, thickest cluster of overlapping dots.

## Scope Guardrails (Enforced visually)
- We do not need dozens of vehicle variations. Just two clear silhouettes are enough to create flow complexity.
- We do not need vast metropolitan maps. A single tight intersection tells the entire story.
- *Dashboard UIs are explicitly forbidden*. Satisfaction scores are read via floating emojis, not progress bars.

## Exact Next Production Recommendation
The visual targets successfully prove the Tycoon concept is viable and highly readable without dry dashboards. 
**Next Step**: Initiate `T128 — React Flow Prototype`. Build a rudimentary React loop that renders peeps, spawns a Kombi, and allows the player to trace a line from point A to B to move the vehicle.
