# T94: Corredor Livre Art Direction Pack + Visual Blockout Kickoff

**Status:** PRODUCTION READY — Art Direction Locked  
**Date:** 27 de Março de 2026  
**Game:** Corredor Livre — Territorial Platformer  
**Phase:** Visual Blockout / Asset Production Kickoff  
**Predecessor:** T93 Blueprint (Approved)

---

## 1. Diagnosis: Why Art Direction Now

### The Risk Being Addressed
T93 established a strong concept. The next production risk is **drift**:
- Abstract discussion without visual identity
- Movement theory without gameplay readability
- Art planning that ignores playability

### The Goal
Lock visual identity so production can start with:
- Original look (not IP imitation)
- Playable spatial identity (not graybox)
- Screenshot power (shareable from day one)

### Success Criteria
| Criterion | Test |
|-----------|------|
| Readability | Character readable at 32px on mobile |
| Atmosphere | Background tells story without text |
| Playability | Jump arcs readable, hazards clear |
| Originality | Doesn't look like Celeste/Meat Boy/Mario |
| Territorial | Immediately reads as "favela Rio" |

---

## 2. Files to Create/Change

### New Art Direction Files
| File | Purpose |
|------|---------|
| `reports/t94-corredor-livre-art-direction-blockout.md` | This document |
| `games/corredor-livre/art-direction.md` | Visual fantasy and rules |
| `games/corredor-livre/camera-readability.md` | Technical camera specs |
| `games/corredor-livre/character-spec.md` | Character silhouette pack |
| `games/corredor-livre/environment-kit.md` | Tile and surface specs |
| `games/corredor-livre/prop-language.md` | Recurring props list |
| `games/corredor-livre/parallax-layers.md` | Background layer rules |
| `games/corredor-livre/danger-visuals.md` | Hazard and tension language |
| `games/corredor-livre/blockout-scope.md` | First playable scope |
| `games/corredor-livre/move-set-decision.md` | Wall-run/zip-line cut/keep |
| `games/corredor-livre/screenshot-targets.md` | Mandatory stills |

---

## 3. Art Direction Pack

### 3.1 Visual Fantasy: Locked

#### The Look at a Glance
**One sentence:** *Celeste meets favela carioca — tight platforming through vibrant, dense, vertically-stacked community space.*

#### Emotional Mix
| Emotion | Source | Visual Expression |
|---------|--------|-------------------|
| **Speed** | Running momentum | Speed lines, lean-in pose, trailing dust |
| **Agility** | Parkour freedom | Arched jumps, wall-kicks, flowing motion |
| **Warmth** | Community presence | Saturated colors (amarelo, laranja, rosa), life signs |
| **Tension** | Police/state threat | Blue/red sirens, barriers, searchlights |
| **Hope** | Resistance victory | Light bursts, opened paths, connected nodes |

#### Resistance / Connection / Pressure Through Space
| Theme | Visual Expression | Example |
|-------|-------------------|---------|
| **Resistance** | Player moving where "not allowed" — rooftops, barriers crossed | Character running on laje with "Proibido" sign below |
| **Connection** | Paths opening, lights turning on, people linking | Two rooftops connected by plank, light between them |
| **Pressure** | Blue barriers, flashing lights, closing gates | Police line blocking street, player leaping over |

#### Color Philosophy
**Palette:**
- **Warm Dominant (70%):** Amarelos, laranjas, vermelhos terrosos — favela life
- **Cool Accent (20%):** Azuis, cinzas — estado, perigo, contraste
- **Hot Highlight (10%):** Amarelo ouro, laranja neon — objetivos, energia

**Rule:** Warm = safe/community, Cool = danger/state, Hot = goal/energy

---

### 3.2 Camera and Readability Rules

#### Camera Setup
| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Type** | 2D side-scrolling | Classic platformer clarity |
| **Zoom (wide)** | 1.0x — full level view | For planning/ambience moments |
| **Zoom (play)** | 1.5x — closer follow | Default gameplay |
| **Zoom (tight)** | 2.0x — action focus | Precision sequences |
| **Follow Lag** | 0.1 seconds | Smooth but responsive |
| **Dead Zone** | 15% screen center | Player can move slightly without camera shift |
| **Vertical Lead** | 20% above player | Show where you're jumping |

#### Character Screen Presence
| Platform | Target Size | Rationale |
|----------|-------------|-----------|
| **Mobile** | 48-64px tall | Readable on small screens |
| **Desktop** | 64-96px tall | Detail visible, not overwhelming |
| **Tablet** | 56-80px tall | Middle ground |

**Rule:** Character is always the brightest/most saturated element in frame.

#### Silhouette Clarity Rules
**Character:**
- [ ] Readable against ALL tile types
- [ ] Readable against ALL background layers
- [ ] Action pose clear in 1 frame freeze
- [ ] Gender/body readable without being explicit

**Tiles:**
- [ ] Walkable vs hazard distinguishable by shape, not just color
- [ ] Climbable surfaces clearly marked
- [ ] Platform edges visually distinct

#### Jump Arc Readability
**Visual Aids:**
- Player trail: 3-4 ghost frames showing arc
- Landing prediction: subtle target marker (optional, can be disabled)
- Apex highlight: slight screen pause at jump peak

**Timing:**
- Coyote time: 100ms (grace period after leaving platform)
- Jump buffer: 100ms (input accepted before landing)

#### Safe vs Danger Readability
| Type | Visual Treatment | Example |
|------|------------------|---------|
| **Safe** | Warm colors, rounded shapes, occupied (varais, plantas) | Laje com varal, caixa d'água |
| **Unsafe** | Cool colors, sharp angles, industrial | Arame, concreto cinza, metal |
| **Hazard** | Flashing, red/blue, high contrast | Cerca, linha policial |
| **Goal** | Hot color, glow, motion | Luz pulsando, conexão brilhando |

#### Background Detail Limits
**Rule: Background must never confuse foreground play.**

| Layer | Detail Level | Animation | Contrast vs Play |
|-------|--------------|-----------|------------------|
| Sky | Minimal | Slow clouds | Very low |
| Far | Silhouette | None | Low |
| Mid | Medium detail | Subtle | Medium |
| Near | High detail | Moderate | High but distinct color |
| Play | Full detail | Full | Maximum |

**Background Animation Limits:**
- No flashing in sync with gameplay (distracting)
- No moving platforms in background (confusing)
- No characters similar size to player (unclear)

---

## 4. Character Silhouette Pack

### 4.1 Body Shape

**Proportions:**
- Head: 1 unit
- Torso: 1.5 units
- Legs: 2 units
- Arms: 1.5 units
- **Total:** ~6 units tall (compact, agile)

**Build:** Lean athletic, not muscular. Runner/courier physique.

**Gender:** Ambiguous enough — functional clothing, no explicit markers. Player can project.

### 4.2 Clothing Logic

**Base:**
- **Top:** Hoodie or loose jacket (movement flow, hides details)
- **Bottom:** Jogging pants or shorts (flexibility)
- **Feet:** Sneakers (traction, urban)

**Signature Elements:**
- **Backpack/Messenger bag:** Always visible, sells "delivery" fantasy
- **Hood/Cap:** Head covering for silhouette distinctiveness
- **Wristband/Watch:** Subtle detail for close-up moments

**Colors:**
- Primary: Laranja ou amarelo (visibility, energy)
- Secondary: Cinza escuro or preto (urban camouflage)
- Accent: Branco or prata (bag straps, shoe soles)

### 4.3 Readability in Motion

**Priority Poses (must read instantly):**

| Pose | Frame | Readability Test |
|------|-------|------------------|
| **Idle** | 0° | Silhouette clear, weight on one leg |
| **Run cycle** | 12-16 frames | Legs clear, arm swing visible |
| **Jump (up)** | 1-3 frames | Body stretched, leg push clear |
| **Jump (apex)** | 1 frame | Arc peak readable |
| **Jump (down)** | 2-3 frames | Landing preparation clear |
| **Land** | 2-3 frames | Impact absorption visible |
| **Climb** | 8 frames | Hand-over-hand rhythm |
| **Slide** | 2-4 frames | Low profile, legs extended |
| **Wall-kick** | 2-3 frames | Push-off angle clear |
| **Dash** | 4-6 frames | Speed blur, stretched body |

### 4.4 Animation Priorities

**Tier 1 (Must Have):**
1. Idle
2. Run
3. Jump (up/apex/down)
4. Land
5. Climb

**Tier 2 (Should Have):**
6. Slide
7. Wall-kick
8. Dash
9. Interact

**Tier 3 (Nice to Have):**
10. Damage/hit
11. Fall/recover
12. Celebrate

**Cut for First Slice:**
- Complex combat
- Swimming
- Flying/gliding
- Idle variations (breathing only)

---

## 5. Environment Kit

### 5.1 Rooftop Tiles

**Laje (Concrete Slab)**
- **Walkable:** Yes
- **Variants:** Plain, cracked, stained, edge piece
- **Color:** Cinza claro, manchas escuras
- **Detail:** Rachaduras, manchas de água, borda irregular

**Telha (Colonial Tile)**
- **Walkable:** Yes
- **Variants:** Red, orange, weathered, broken
- **Color:** Vermelho/laranja terroso
- **Detail:** Pattern visible, gaps between tiles

**Viga/Beam**
- **Walkable:** Yes (narrow)
- **Variants:** Concrete, wood
- **Color:** Cinza or marrom
- **Detail:** Textura industrial

### 5.2 Climbable Surfaces

**Escada (Stair)**
- **Type:** Concrete or metal
- **Climb:** Automatic on contact
- **Visual:** Steps clear, risers visible
- **Variants:** Straight, spiral, broken

**Escadaria (Long Stair)**
- **Type:** Public concrete stair
- **Climb:** Continuous
- **Visual:** Corrimão opcional, desgaste visível

**Tubo/Pipe**
- **Type:** Water/gas pipe
- **Climb:** Vertical only
- **Visual:** Metal, joints, rust

**Ledge/Grip**
- **Type:** Ledge under roof, window sill
- **Grab:** Auto on fall contact
- **Visual:** Ledge projection, shadow underneath

### 5.3 Walls and Ledges

**Parede Tijolo**
- **Climbable:** No (unless marked)
- **Visual:** Brick pattern, mortar lines

**Parede Reboco**
- **Climbable:** No
- **Visual:** Smooth, painted, cracked

**Ledge (Wall-run)**
- **Special:** Wall-run enabled
- **Visual:** Horizontal band, different texture
- **Marking:** Subtle highlight or texture change

### 5.4 Cables and Infrastructure

**Fio Grosso (Thick Cable)**
- **Walkable:** No
- **Climbable:** Zip-line traverse
- **Visual:** Black, curved, substantial

**Fio Fino (Thin Wire)**
- **Walkable:** No
- **Visual:** Detail element, not interactive
- **Purpose:** Atmosphere only

**Antena (Antenna)**
- **Walkable:** No
- **Climbable:** Maybe (if large)
- **Visual:** Metal, directional, parabólica

**Caixa D'Água (Water Tank)**
- **Walkable:** Yes (top)
- **Visual:** Cylindrical, plastic/metal, pipes

### 5.5 Alley and Bridge Transitions

**Beco Estreito (Alley)**
- **Width:** 2-3 tiles
- **Visual:** Walls close, light from above only
- **Gameplay:** Wall-run opportunities

**Passarela (Footbridge)**
- **Type:** Plank or metal
- **Visual:** Thin, slight sway animation
- **Gameplay:** Risk platform (may wobble)

**Ponte Improvisada (Improvised Bridge)**
- **Type:** Planks, rope, pallets
- **Visual:** Ramshackle, gaps visible
- **Gameplay:** Jump gaps carefully

### 5.6 Hazard Markers

**Gap (Vazio)**
- **Visual:** Fall to lower level visible
- **Marking:** No marking needed — absence is clear

**Cerca (Fence)**
- **Visual:** Arame farpado, concreto blocks
- **Marking:** Red tint or highlight
- **Effect:** Damage on touch

**Police Line**
- **Visual:** Blue/red flashing, barrier tape
- **Marking:** "POLÍCIA" text (small)
- **Effect:** Pursuit if detected

**Unstable Platform**
- **Visual:** Cracks, slight wobble animation
- **Marking:** Subtle red pulse
- **Effect:** Falls after time/weight

### 5.7 Checkpoint and Goal Points

**Checkpoint (Save)**
- **Visual:** Lamp post, small shrine, or painted mark
- **Animation:** Subtle glow
- **Audio:** Ambient hum

**Delivery Point (Goal)**
- **Visual:** Door, window, or marked spot
- **Animation:** Light emanating
- **Marker:** Distance indicator in HUD

**Activation Point**
- **Visual:** Switch, lever, or button
- **Animation:** Press down, light on
- **Feedback:** Immediate visual change

---

## 6. Prop Language

### 6.1 Signature Props (Sell the Place)

**Caixa D'Água (Water Tank)**
- **Frequency:** 1-2 per screen
- **Function:** Platform top, vertical marker
- **Visual:** Cylindrical, colorido, pipes

**Escadaria (Public Stair)**
- **Frequency:** Vertical sections
- **Function:** Climb path
- **Visual:** Concrete, corrimão, desgaste

**Varal (Clothesline)**
- **Frequency:** 2-3 per screen
- **Function:** Near background detail
- **Visual:** Corda, roupas coloridas, movimento

**Antena Parabólica**
- **Frequency:** 1-2 per screen
- **Function:** Silhouette detail
- **Visual:** Dish, directional, metal

**Fios (Wires)**
- **Frequency:** Multiple, crisscrossing
- **Function:** Parallax layer, zip-line
- **Visual:** Black curves, utility lines

### 6.2 Environmental Storytelling Props

**Muro (Wall)**
- **Subtypes:** Tijolo, reboco, pichação, azulejo
- **Stories:** Ocupação, tempo, resistência

**Beco (Alley)**
- **Details:** Caixas, lixeiras, escadas laterais
- **Stories:** Vida cotidiana, caminhos alternativos

**Poste (Lamp Post)**
- **Function:** Checkpoint, light source
- **Visual:** Ferro, lampada, fios

**Barricada Improvisada**
- **Visual:** Pallets, lixeiras, cordas
- **Stories:** Resistência, proteção comunitária

**Signs of Pressure**
- **"Vende-se" sign:** Especulação imobiliária
- **Demolition marks:** X pintado, ameaça de remoção
- **Cercas novas:** Invasão, privatização

### 6.3 Infrastructure Neglect

**Buraco (Hole)**
- **Visual:** Laje rachada, queda visível
- **Function:** Hazard or alternate route

**Vazamento (Leak)**
- **Visual:** Mancha escura, brilho molhado
- **Function:** Slippery surface

**Fiação Exposta**
- **Visual:** Fios desorganizados, caixas abertas
- **Function:** Decoration, danger hint

---

## 7. Parallax/Background Layers

### 7.1 Layer 1: Sky (Farthest)

**Content:**
- Céu carioca gradient
- Nuvens simples
- Sol ou lua

**Scroll:** 0.1x player speed

**Color:** Azul claro → laranja/rosa (sunset)

**Detail:** Low — gradient, simple shapes

### 7.2 Layer 2: Far City (Distant)

**Content:**
- Arranha-céus Centro do Rio
- Viadutos (arcos)
- Torres (TV, celular)

**Scroll:** 0.2x player speed

**Color:** Cinza azulado, silhuetas

**Detail:** Medium — shapes only, no windows

**Key Shapes:**
- Edifício icônico (sugestão)
- Viaduto em arco
- Antena transmissora

### 7.3 Layer 3: Mid Hills (Community)

**Content:**
- Morro do Pinto (main)
- Outras comunidades
- Vegetação

**Scroll:** 0.4x player speed

**Color:** Saturated — amarelo, laranja, rosa, verde

**Detail:** High — recognizable buildings, escadarias

**Key Elements:**
- Casa colorida (5-6 variants)
- Escadaria subindo morro
- Árvores, arbustos
- Telhados diversos

### 7.4 Layer 4: Near Urban (Atmosphere)

**Content:**
- Fios/lines (múltiplos)
- Varais com roupas
- Antenas
- Caixas d'água

**Scroll:** 0.6x player speed

**Color:** Full saturation, detail

**Detail:** Highest background layer — readable

**Animation:**
- Roupas no varal: subtle sway
- Fios: slight vibration

### 7.5 Layer 5: Play (Foreground)

**Content:**
- Todas as plataformas
- Jogador
- Elementos de gameplay

**Scroll:** 1.0x (camera locked)

**Color:** Maximum saturation and contrast

**Detail:** Highest — crisp, readable

### 7.6 Day/Night Logic

**Default:** Late afternoon (golden hour)

**Why:**
- Warm light = warm emotion
- Long shadows = depth
- Saturated colors pop
- Political "fim de tarde" mood

**Variations (future):**
- Morning: Cool, hopeful
- Noon: Harsh, exposed
- Night: Contrast, hiding

---

## 8. Danger and Tension Visuals

### 8.1 Unstable Surfaces

**Visual Language:**
- Rachaduras visíveis
- Pó/dust falling
- Subtle shake animation
- Red pulse on contact

**States:**
| State | Visual | Timer |
|-------|--------|-------|
| Stable | Normal | — |
| Warning | Rachaduras glow | 1 second |
| Collapsing | Shake + dust | 0.5 seconds |
| Fallen | Gap/hole | Permanent |

### 8.2 Surveillance/Pressure

**Police Line:**
- Visual: Blue/red flashing barrier
- Pattern: Light bar alternates
- Sound: Siren (subtle)

**Searchlight:**
- Visual: Cone of light sweeping
- Pattern: Slow rotation
- Effect: Detection = pursuit trigger

**Câmera:**
- Visual: Security camera, red LED
- Pattern: Periodic sweep
- Effect: Detection = alert

### 8.3 Blocked Passages

**Visual Types:**
| Blocker | Visual | Temporary? |
|---------|--------|------------|
| Portão trancado | Metal gate, lock | Yes — can open |
| Entulho | Rubble, caixas | Yes — can clear |
| Cerca policial | Barrier tape, cones | Temporary — timer |
| Muro novo | Concreto fresco | No — must go around |

### 8.4 Infrastructure Decay

**Visual Indicators:**
- **Desgaste:** Stains, chips, cracks
- ** abandono:** Vegetation growing, broken windows
- **Pressa:** Temporary fixes, tape, improvisation

**Safe/Care Zones:**
| Zone | Visual | Feeling |
|------|--------|---------|
| **Comunitário** | Varais, plantas, gente (silhuetas), música | Warm, safe |
| **Resistência** | Pintura política, barricada, bandeiras | Active, energized |
| **Neutral** | Vazio, manutenção, corredor | Calm, watchful |

### 8.5 Route Activation / Connection

**Visual Feedback:**
- Light traveling along path
- Particles following connection
- Color shift from cool to warm
- Sound crescendo

**Completion Moment:**
- Flash of warm light
- Connected nodes glow
- Path visually "opens"
- Success pose trigger

---

## 9. First Playable Blockout Scope

### 9.1 What Enters First Build

**Geography:**
| Area | Description | Movement Test |
|------|-------------|---------------|
| **Start** | Rooftop, safe, open | Momentum building |
| **Vertical Climb** | Escada + lajes | Climbing system |
| **Horizontal Speed** | Long run, gaps | Jump timing |
| **Hazard Beat** | Police line or unstable | Risk/reward |
| **Delivery Beat** | Activation + goal | Completion flow |
| **Completion** | Reward space | Victory pose |

**Metrics:**
- Total screens: 8-10
- Play time: 60-90 seconds (speedrun)
- Vertical range: 3-4 levels
- Horizontal range: 10-12 screens wide

### 9.2 Room-by-Room Breakdown

**Room 1: Start (Safe Rooftop)**
- Size: 3 screens
- Elements: Lajes, tutorial prompts
- Goal: Learn run, jump
- Exit: Drop to lower level

**Room 2: First Descent (Tutorial Drop)**
- Size: 2 screens
- Elements: Short fall, landing, climb back
- Goal: Learn verticality
- Exit: Escada up

**Room 3: The Climb (Vertical Section)**
- Size: 4 screens (vertical)
- Elements: Escadaria, lajes, ledges
- Goal: Master climb
- Exit: Rooftop midpoint

**Room 4: Rooftop Run (Speed Section)**
- Size: 4 screens
- Elements: Gaps, momentum platforms
- Goal: Master jump timing
- Exit: Tight passage

**Room 5: The Squeeze (Alley)**
- Size: 2 screens
- Elements: Narrow, wall-run section
- Goal: Precision movement
- Exit: Open area

**Room 6: Police Line (Hazard)**
- Size: 3 screens
- Elements: Blue barrier, chase or sneak
- Goal: Risk management
- Exit: Cleared path

**Room 7: Final Push (Combined Skills)**
- Size: 3 screens
- Elements: Mix of all previous
- Goal: Mastery demonstration
- Exit: Goal area

**Room 8: Connection (Goal)**
- Size: 1 screen
- Elements: Activation, result display
- Goal: Victory, screenshot moment

---

## 10. Move-Set Decision: Cut/Keep

### 10.1 Core Moves (KEEP — Non-Negotiable)

| Move | Priority | Why Keep |
|------|----------|----------|
| **Run** | Critical | Foundation of all platformers |
| **Jump** | Critical | Basic traversal |
| **Climb** | Critical | Verticality is core fantasy |
| **Slide** | High | Unique flavor, under obstacles |
| **Interact** | High | Goals require activation |

### 10.2 Advanced Moves (DECIDE)

**Wall-Run:**
- **Pros:** Adds flair, "parkour" feel, vertical escape
- **Cons:** Hard to read on mobile, complex collision, animation heavy
- **Decision:** ☐ KEEP ☐ CUT
- **If Keep:** Limited to specific "wall-run zones" (marked ledges), not everywhere
- **If Cut:** Replace with "wall-kick" (single bounce)

**Zip-Line:**
- **Pros:** Fast travel moments, visual spectacle, favela authentic
- **Cons:** Requires cable infrastructure everywhere, camera issues, disorienting
- **Decision:** ☐ KEEP ☐ CUT
- **If Keep:** 2-3 per level max, obvious entry/exit
- **If Cut:** Replace with "fast slides" on steep roofs

### 10.3 Recommended First-Slice Move-Set

**KEEP:**
1. Run (with momentum)
2. Jump (variable height)
3. Climb (hand-over-hand)
4. Slide (under obstacles)
5. Wall-kick (single bounce, not run)
6. Interact (contextual)

**CUT for First Slice:**
- Wall-run (replace with wall-kick)
- Zip-line (replace with slide-down-roof)
- Dash (momentum system sufficient)
- Double jump (unnecessary complexity)

**Future Additions (Post-Slice):**
- Wall-run (if slice succeeds)
- Zip-line (if infrastructure feels right)
- Grind (on cables)
- Swing (on vines/cables)

**Rationale:** 6 moves is enough for deep gameplay. 10+ moves dilute mastery and readability.

---

## 11. Screenshot Targets

### 11.1 Shot 1: Opening Rooftop Run

**Trigger:** First 10 seconds of play

**Composition:**
- Character: Running right, mid-stride
- Background: Full parallax visible (morro + city)
- Lighting: Golden hour, warm
- Effects: Speed lines, slight dust

**Message:** *"This moves beautifully through this place."*

**Technical:**
- No UI visible
- 1920x1080 or 1080x1920
- Character ~10% of frame height

### 11.2 Shot 2: Mid-Jump Over Rooftops

**Trigger:** Peak of jump arc over gap

**Composition:**
- Character: Apex of jump, body extended
- Gap: Visible drop below
- Destination: Platform ahead
- Layers: 3-4 parallax layers visible

**Message:** *"Leap of faith through occupied territory."*

**Technical:**
- Freeze frame at apex
- Slight motion blur on background
- Character centered, suspended

### 11.3 Shot 3: Tension/Hazard Moment

**Trigger:** Evading police line or hazard

**Composition:**
- Character: Sliding under or jumping over
- Threat: Police line/barrier visible
- Space: Tight, alley or under structure
- UI: Alert indicator only (red pulse)

**Message:** *"Resistance requires agility, not violence."*

**Technical:**
- Dynamic pose (mid-action)
- Contrast between warm (safe) and cool (danger)
- Slight camera shake or zoom

### 11.4 Shot 4: Activation/Delivery

**Trigger:** Player activating connection point

**Composition:**
- Character: Interact pose (hand extended)
- Object: Switch, door, or connection point
- Effect: Light emanating, particles
- Background: Territory visible, waiting to be connected

**Message:** *"Each action connects the community."*

**Technical:**
- Warm light burst
- Particles following connection
- Character in hero pose

### 11.5 Shot 5: Completion/Victory

**Trigger:** Level complete, result screen or final pose

**Composition:**
- Character: Success pose (arms open, breathing)
- Background: Transformed territory (light on, path opened)
- Lighting: Golden, triumphant
- HUD: "Conectado" or completion text

**Message:** *"Freedom of movement = political victory."*

**Technical:**
- Freeze on victory pose
- Slight camera zoom
- Particle celebration (subtle)
- Warm color grade

---

## 12. Verification Summary

### 12.1 Art Direction Completeness

| Section | Status | Notes |
|---------|--------|-------|
| Visual fantasy locked | ✅ | "Celeste meets favela" — speed/agility/resistance |
| Camera rules defined | ✅ | 2D side-scroller, 1.5x default zoom |
| Character spec complete | ✅ | 6 units tall, hoodie, backpack, 6 core animations |
| Environment kit defined | ✅ | Lajes, escadas, fios, becos — 30-40 tiles |
| Prop language established | ✅ | 10 signature props, storytelling function |
| Parallax layers locked | ✅ | 5 layers, late afternoon, warm dominant |
| Danger visuals defined | ✅ | Police = cool/flash, safe = warm/occupied |
| Blockout scope set | ✅ | 8 rooms, 60-90s, 6 moves |
| Move-set decided | ✅ | Wall-run CUT, zip-line CUT, wall-kick KEEP |
| Screenshots locked | ✅ | 5 mandatory targets defined |

### 12.2 Production Readiness

**Can Start Now:**
- [ ] Character concept art (silhouettes)
- [ ] First tile paint-overs
- [ ] Color palette tests
- [ ] Screenshot mockups

**Cannot Start Without:**
- Character silhouette approved
- Color palette locked (warm dominant)
- First environment tile painted

### 12.3 Risk Assessment

| Risk | Mitigation | Status |
|------|------------|--------|
| Readability failure | Strict silhouette rules, character priority colors | Mitigated |
| Mobile performance | Limited particles, simple backgrounds | Mitigated |
| Scope creep | 6 moves only, wall-run/zip-line cut | Mitigated |
| Originality concern | Distinct color palette, authentic setting | Mitigated |
| Political subtlety | Visual obstacles tell story, not text | Mitigated |

---

## 13. Immediate Next Actions

### Week 1: Concept Validation
- [ ] Review art direction with stakeholders
- [ ] Lock character silhouette (3 options presented)
- [ ] Approve color palette tests
- [ ] Confirm move-set cuts (wall-run/zip-line)

### Week 2: Asset Production Kickoff
- [ ] Character idle + run animations
- [ ] First 10 tiles (laje, telha, escada)
- [ ] Background layer 1 + 2 (sky + far city)
- [ ] Screenshot 1 mockup

### Week 3-4: Blockout Assembly
- [ ] Room 1-2 playable
- [ ] Movement feel test
- [ ] Screenshot 1 validation
- [ ] Iteration pass

### Week 5-6: Full Slice
- [ ] All 8 rooms complete
- [ ] All 5 screenshots validated
- [ ] Playtest ready
- [ ] T95: First Playable Review

---

**T94 — Corredor Livre Art Direction Pack + Visual Blockout Kickoff**  
**Sistema: Hub de Jogos — Pré Campanha**  
**Predecessor: T93 Blueprint (Approved)**  
**Successor: T95 First Playable Review**  
**Date: 27 de Março de 2026**
