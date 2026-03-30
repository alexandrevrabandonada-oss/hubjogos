# T107: Bairro Resiste Living Territory Build + Crisis Spectacle

**Status:** LIVING TERRITORY PASS — Implementation Plan  
**Date:** 30 de Março de 2026  
**Game:** Bairro Resiste — Territorial RTS-Lite  
**Previous:** T106 Flagship Finish Pass (Diagnosis Complete)  
**Current Status:** PUBLIC_READY_BETA  
**Target Status:** FLAGSHIP_CANDIDATE  
**Strategic Goal:** Transform board from abstract hotspots to living neighborhood under pressure

---

## 1. Diagnosis: Why This Pass Now

### The Remaining Blocker
T106 identified that Bairro Resiste's biggest weakness is the **board feel**: it still reads as "hotspots on a map" rather than "a neighborhood under real pressure."

**Specific Issues:**
| Issue | Current | Target |
|-------|---------|--------|
| Board identity | Abstract grid | Named streets, blocks, sectors |
| Block feel | UI cells | Real urban pieces with character |
| Crisis spread | Functional | Dramatic, readable, urgent |
| Brigade fantasy | Icons dispatching | Real-time defense, visible impact |
| Recovery payoff | Color change | Spectacle, satisfaction, relief |

### Success Criteria
After this pass, the board must:
- [ ] Read as a real neighborhood (place identity)
- [ ] Feel alive (pulses, spreads, pressures)
- [ ] Make crisis visible and urgent (readable drama)
- [ ] Make saves satisfying (spectacle payoff)
- [ ] Work on mobile (clarity preserved)

---

## 2. Files to Create/Change

### Implementation Files
| File | Purpose |
|------|---------|
| `reports/T107-Bairro-Resiste-Living-Territory-Build.md` | This document |
| `games/bairro-resiste/territory/board-layout.md` | New sector/block structure |
| `games/bairro-resiste/territory/block-identity.md` | Block types and visuals |
| `games/bairro-resiste/crisis/spread-visuals.md` | Pressure/drama systems |
| `games/bairro-resiste/brigade/state-animations.md` | Brigade fantasy specs |
| `games/bairro-resiste/spectacle/recovery-payoff.md` | Save moment design |
| `games/bairro-resiste/mobile/readability-checklist.md` | Mobile safety |

### Code Files (To Modify)
| File | Changes |
|------|---------|
| `components/games/bairro-resiste/` | Visual pass implementation |
| `lib/games/bairro-resiste/types.ts` | New block/sector types |
| `app/games/bairro-resiste/page.tsx` | Integration |

---

## 3. Living-Territory Pass

### 3.1 Stronger Territorial Identity

**Named Sectors (3-5 per board):**
```
Sector: "Morro do Pinto" (Hill)
├── Block A: "Escadaria Principal" (Main Stair)
├── Block B: "Laje Comunitária" (Community Rooftop)
├── Block C: "Beco dos Artistas" (Artist Alley)
└── Block D: "Entrada da Favela" (Favela Entrance)

Sector: "Cachoeirinha" (Valley)
├── Block E: "Rua do Comércio" (Commerce Street)
├── Block F: "Praça da Feira" (Market Square)
└── Block G: "Viela Estreita" (Narrow Passage)

Sector: "Alto da Colina" (Hilltop)
├── Block H: "Mirante" (Lookout)
├── Block I: "Antenas" (Antenna Cluster)
└── Block J: "Topo do Morro" (Hilltop)
```

**Visual Identity per Sector:**
| Sector | Color Tone | Key Feature | Risk Profile |
|--------|-----------|-------------|--------------|
| Morro do Pinto | Warm oranges | Escadaria (stairs) | Spreads vertically |
| Cachoeirinha | Busy yellows | Comércio (shops) | Dense, fast spread |
| Alto da Colina | Cool blues | Mirante (view) | Isolated but fragile |

### 3.2 Clearer Street/Block Structure

**Street Network:**
- **Main arteries:** Wide, fast spread, critical to hold
- **Vielas (alleys):** Narrow, slow spread, firebreak potential
- **Escadarias (stairs):** Vertical spread, unique to hill sectors
- **Lajes (rooftops):** Connected, tactical advantage

**Block Shapes:**
- Not uniform grid cells
- Varied sizes (small houses = small blocks, large buildings = large blocks)
- Organic shapes following "terrain"
- Clear adjacencies (which blocks touch which)

**Visual Readability:**
```
Block visual hierarchy:
┌─────────────────────────────────┐
│  Block Name (small, top)        │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │    Building Silhouette  │    │ ← Main visual
│  │    (distinct per type)  │    │
│  │                         │    │
│  └─────────────────────────┘    │
│  Infrastructure dots (bottom)   │
│  ████████ Stress/Pressure bar   │
└─────────────────────────────────┘
```

### 3.3 Stronger District Silhouettes

**Building Silhouette Types:**
| Type | Shape | Color | Sector Fit |
|------|-------|-------|------------|
| **Casario** | Row houses, uniform | Warm orange | Any residential |
| **Edifício** | Tall rectangle | Gray concrete | Commercial |
| **Casa/sobrado** | Small, gabled | Varied | Residential |
| **Laje** | Flat, open top | Light | Community spaces |
| **Barracão** | Large, industrial | Rust | Industrial |
| **Vazio** | Empty, debris | Dark | Lost blocks |

**Silhouette Detail Level:**
- Desktop: Full detail (windows, doors, texture hints)
- Mobile: Simplified but still recognizable
- All: Readable at glance (don't need to zoom to tell type)

### 3.4 Visible Infrastructure Cues

**Infrastructure Types:**
| System | Icon | Visual When Healthy | Visual When Threatened |
|--------|------|---------------------|------------------------|
| **Power** | ⚡ Lightning bolt | Steady glow, white | Flickering, yellow/red |
| **Water** | 💧 Drop | Blue flow, clear | Brown, stagnant, low |
| **Comms** | 📡 Antenna | Green pulse | Static, gray, red X |
| **Gas** | 🔥 Flame | Blue flame | Leaking, orange danger |

**Infrastructure on Blocks:**
- Small icons in block corner
- Color indicates health
- Animation indicates state (pulse = working, static = broken)

### 3.5 Stronger Sense of Place

**Place Identity Through:**
1. **Names:** Every sector and block named
2. **Landmarks:** 1-2 unique buildings per sector
3. **Color:** Sector-specific palette
4. **Layout:** Sector-specific block arrangements
5. **Risk profile:** How crisis spreads here

**Landmark Examples:**
| Sector | Landmark | Visual | Gameplay Role |
|--------|----------|--------|---------------|
| Morro do Pinto | "Escadaria colorida" | Painted stairs | Critical chokepoint |
| Cachoeirinha | "Mercado Municipal" | Large market | Resource hub |
| Alto da Colina | "Antena parabólica" | Giant dish | Comm anchor |

---

## 4. Alive Blocks Implementation

### 4.1 Block Identity System

**Each Block Has:**
| Attribute | Purpose | Visual Expression |
|-----------|---------|-------------------|
| **Name** | Player reference | Small label, top of block |
| **Type** | Resource generation | Silhouette shape |
| **Occupation** | Population density | Number of small house icons |
| **Infrastructure** | Dependencies | Corner icons, color-coded |
| **Pressure** | Current crisis level | Background tint, pulse rate |
| **State** | Current condition | Overall block appearance |

**Block States:**
| State | Visual | Meaning |
|-------|--------|---------|
| **Stable** | Bright, gentle pulse | Safe, productive |
| **Stressed** | Faster pulse, slight dim | Under pressure |
| **Critical** | Intense pulse, red tint | About to fail |
| **Overrun** | Dark, static, "lost" | Needs recovery mission |
| **Recovering** | Slow return to bright | Just saved, healing |

### 4.2 Building Silhouettes

**Silhouette Style:**
- Flat, 2D, readable
- Distinctive shapes (not generic rectangles)
- Consistent lighting (light from top-left)
- Simplified detail (mobile-friendly)

**Silhouette Implementation:**
```
Casario (Row houses):
██████
██████
████████████
████████████ ← 3 connected units
████████████
████████████

Edifício (Apartment block):
██████████
██████████
██████████
██████████
██████████ ← Tall, uniform

Laje (Rooftop):
████████████
████████████ ← Flat, wide, open

Vazio (Empty lot):
▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓ ← Dark, debris texture
```

### 4.3 Occupation Density

**Density Indicators:**
- **High (8-12):** Dense residential, spreads fast, needs more help
- **Medium (4-7):** Standard, balanced
- **Low (1-3):** Sparse, slower spread, easier to save
- **Empty (0):** Abandoned, no population to save

**Visual:** Small house icons within block silhouette
- Desktop: Actual mini-houses
- Mobile: Density dots (3 dots = high, 2 = medium, 1 = low)

### 4.4 Infrastructure State

**Infrastructure Health Levels:**
| Health | Color | Icon | Effect |
|--------|-------|------|--------|
| 100% | Green | ✓ | Full function |
| 75% | Yellow | ▲ | Reduced efficiency |
| 50% | Orange | ▲▲ | Significant reduction |
| 25% | Red | X | Near failure |
| 0% | Gray | ✗ | Broken, must fix |

**Infrastructure Spread Impact:**
- Broken infrastructure in one block affects neighbors
- Visual: "ripple" of dysfunction
- Players must repair infrastructure, not just stop crisis

### 4.5 Local Signals of Stress/Recovery

**Stress Signals:**
| Level | Signal | Visual |
|-------|--------|--------|
| Low | Subtle | Slight pulse speed increase |
| Medium | Clear | Faster pulse, edge glow |
| High | Urgent | Intense pulse, red edges, sparks |
| Critical | Panic | Full red, shaking, alarms |

**Recovery Signals:**
| Stage | Signal | Visual |
|-------|--------|--------|
| Just Saved | Flash | Bright burst, then calm |
| Stabilizing | Return | Gradual color shift to yellow |
| Recovering | Healing | Slow pulse, returning to green |
| Healthy | Glow | Bright, steady, subtle pulse |

---

## 5. Crisis Spread Improvements

### 5.1 Pressure Ripples

**Ripple System:**
- When pressure increases, ripple emanates from block
- Ripples travel along street connections
- Neighboring blocks "feel" the ripple
- Multiple ripples =叠加 = faster spread

**Ripple Visual:**
```
Block A (critical)
    ↓ Ripple 1
Block B (stressed)
    ↓ Ripple 2
Block C (now critical)
```

**Ripple Animation:**
- Ring expands from source block
- Color = pressure type (red = fire, green = disease, etc.)
- Speed = spread speed
- Fade = distance attenuation

### 5.2 Tendrils Along Streets

**Tendril System:**
- Crisis spreads primarily along streets
- Visual: "tendrils" or "fingers" reaching along connections
- Directional: shows where crisis is going
- Predictive: players can see incoming crisis

**Tendril Visual:**
- Animated lines along street paths
- Color-coded by crisis type
- Thickness = strength of spread
- Pulse direction = flow of crisis

### 5.3 Critical Pulses

**Critical Block Treatment:**
- Intense 1Hz pulse (once per second)
- Red glow with white hot center
- Sparks/particles emanating
- Label: "CRÍTICO!" or "URGENTE!"
- Screen-level urgency if multiple critical

**Pulse Animation:**
```
Frame 0-15: Normal
Frame 16-30: Brighten (intensity peak)
Frame 31-45: Fade slightly
Frame 46-60: Normal
```

### 5.4 Near-Collapse Cues

**Warning System:**
| Time to Collapse | Visual | Audio (Future) |
|------------------|--------|----------------|
| 10s+ | Faster pulse, yellow edge | Tension |
| 5-10s | Orange, shaking | Faster tempo |
| <5s | Red, intense, alarms | Alarm pulse |

**Collapse Countdown:**
- Optional: visible countdown on critical blocks
- Or: implicit through pulse intensity
- Goal: Players feel urgency without explicit timer

### 5.5 Readable Cascade Risk

**Cascade Prediction:**
- When Block A critical, highlight at-risk neighbors
- Visual: "danger zone" overlay on connections
- Predicts: "If A falls, B and C will be hit"

**Cascade Visualization:**
```
[CRITICAL A]════[B]════[C]
     ↓
Danger zone extends along connections
B and C get "at risk" highlight
```

**Firebreak Visualization:**
- Saved blocks shown as barriers
- Visual: shield icon, different border
- Effect: stops spread in that direction

---

## 6. Brigade Fantasy Improvements

### 6.1 Ready/Moving/Working/Recovering States

**State Visuals:**
| State | Brigade Appearance | Animation |
|-------|-------------------|-----------|
| **Ready** | Standing, alert | Idle bounce, tool ready |
| **Moving** | Walking/running | Directional movement |
| **Working** | Active position | Tool use animation |
| **Tired** | Slumped, slow | Heavy breathing |
| **Recovering** | Sitting/resting | Minimal movement |

**State Transitions:**
- Smooth transitions between states
- No jarring jumps
- Each state clearly readable at a glance

### 6.2 Dispatch Path Readability

**Dispatch Line:**
- Animated path from HQ to target
- Color = brigade type (medical = red, etc.)
- Dash animation = travel direction
- Completion % = travel progress

**Path Visual:**
```
HQ •━━━━━━━━━━━━━━→• Block
     ↑ Animated dashes
     Color = brigade type
```

**Path Clarity:**
- Lines don't overlap confusingly
- Multiple brigades = parallel lines or offset
- Always visible above other elements

### 6.3 Arrival Impact

**Arrival Moment:**
- Brigade "lands" on target block
- Small impact effect (dust, thud)
- Immediate state change (block responds)
- No delay between arrival and effect

**Visual Impact:**
- Brief screen shake (subtle)
- Particle burst
- Block state immediately updates
- Sound cue (future)

### 6.4 Save/Stabilize Payoff

**Save Sequence:**
1. **Work Complete:** Brigade finishes animation
2. **Flash:** Bright burst on block
3. **Ripple:** Green wave to neighbors
4. **Particles:** Confetti/sparkles (brief)
5. **Text:** "SALVO!" popup (1.5s)
6. **Stabilize:** Block returns to yellow (safe)

**Text Options:**
| Language | Save Text | Stabilize Text |
|----------|-----------|----------------|
| Portuguese | "SALVO!" | "ESTABILIZADO" |
| English | "SAVED!" | "STABILIZED" |

**Particle Effects:**
- 20-30 particles
- Colors: Green, white, gold
- Duration: 1-2 seconds
- Direction: Up and out from block

### 6.5 Visible "This Block Was Saved" Moments

**Saved Block Markers:**
- Brief glow effect (3-5 seconds)
- "Saved" icon (checkmark, shield)
- Different pulse pattern (slower, calmer)
- Player can see their impact across board

**Saved Block Memory:**
- Saved blocks get subtle highlight
- Lasts until next crisis wave
- Players see chain of their saves
- Builds sense of accomplishment

---

## 7. Rescue/Recovery Spectacle

### 7.1 Flash/Ripple/Particle Payoff

**Recovery Spectacle Levels:**
| Recovery Type | Spectacle Level | Effects |
|---------------|-----------------|---------|
| **Stabilize** (stop crisis) | Medium | Flash, slow ripple |
| **Recover** (return to healthy) | High | Flash, fast ripple, particles |
| **Reinforce** (bonus protection) | Highest | All above + shield effect |

**Flash Effect:**
- Bright white/light burst
- 0.3-0.5 seconds
- Screen-space (not just block)
- Subtle even on mobile

**Ripple Effect:**
- Expanding ring from saved block
- Green/positive color
- Affects connected blocks
- Duration: 1-2 seconds

### 7.2 Relighting / Infrastructure Return

**Infrastructure Recovery:**
- Broken icons "fix" themselves
- Animation: icon rebuilds, restores color
- Cascade: fixed infrastructure helps neighbors
- Visual satisfaction of restoration

**Relighting Sequence:**
```
Block was: Dark, broken infrastructure
    ↓ Save
Block flashes
    ↓
Infrastructure icons animate back to life
    ↓
Block fully lit, healthy
```

### 7.3 Stabilized vs Recovered Distinction

**Stabilized State:**
- Color: Yellow/amber
- Pulse: Slower, calmer
- Label: "Estável" (Stable)
- Meaning: Crisis stopped, but fragile
- Can return to critical if re-pressured

**Recovered State:**
- Color: Green
- Pulse: Normal, healthy
- Label: None (implicitly healthy)
- Meaning: Fully functional, resistant
- Needs less immediate attention

**Visual Difference:**
- Stabilized: Caution yellow, "OK for now"
- Recovered: Healthy green, "All good"

### 7.4 Recovery Timing

**Recovery Speed:**
- Stabilize: Immediate on save
- Recover: 5-10 seconds after stabilize
- Reinforce: 15-30 seconds, or special action

**Progress Indicators:**
- Optional: small progress bar during recovery
- Or: pulse rate gradually normalizes
- Goal: Players see improvement happening

---

## 8. Clarity Preservation

### 8.1 Block Readability

**Minimum Requirements:**
- Block type readable at a glance
- Block state readable at a glance
- Block name/identity clear
- No confusion between adjacent blocks

**Mobile-Specific:**
- Minimum touch target: 48x48dp
- Block labels don't overlap
- Critical blocks get priority rendering
- Zoom/pan if needed for dense boards

### 8.2 Spread Readability

**Spread Clarity:**
- Always see where crisis is coming from
- Always see where crisis is going
- No hidden spread paths
- Predictable, readable patterns

**Anti-Patterns to Avoid:**
- ❌ Overlapping spread animations
- ❌ Same-color crises on same-color blocks
- ❌ Too many simultaneous spread types
- ❌ Crisis that jumps without visual connection

### 8.3 Dispatch Clarity

**Dispatch Visibility:**
- Active brigades always visible
- Dispatch paths don't disappear
- Multiple brigades = clearly distinct
- Priority: Critical block brigades most visible

**Mobile Optimization:**
- Brigade icons scale with zoom
- Dispatch lines thicken on mobile
- Simplified animations for performance

### 8.4 Mobile-Safe Clarity

**Mobile Constraints:**
| Element | Desktop | Mobile |
|---------|---------|--------|
| Block size | 80-120px | 60-80px |
| Particle count | 30-50 | 15-25 |
| Animation complexity | Full | Simplified |
| Text labels | Full names | Abbreviations |
| Detail level | High | Medium |

**Performance Budget:**
- Target: 60fps on mid-tier mobile
- Max particles: 200 total on screen
- Max animated elements: 50
- LOD (Level of Detail): Simplify distant blocks

---

## 9. Screenshot Proof Targets

### 9.1 Required Screenshots (4 Minimum)

| # | Shot Name | Trigger | Composition |
|---|-----------|---------|-------------|
| **1** | **Calm Board** | Start of game/round | Wide view, organized sectors |
| **2** | **Mid-Pressure** | First major spread | Shows crisis developing |
| **3** | **Critical State** | Multiple critical blocks | Drama, urgency, action |
| **4** | **Save/Recovery** | Successful rescue | Satisfaction, payoff |

### 9.2 Shot Specifications

**Shot 1: Calm Board**
```
Scene: Game start, organized board
Composition: Wide, full sector view
Elements: All blocks green/yellow, ready brigades
Colors: Warm, hopeful
Message: "This is what you're defending"
```

**Shot 2: Mid-Pressure**
```
Scene: Crisis spreading
Composition: Same angle, now with tension
Elements: Tendrils, ripples, brigades en route
Colors: Orange/yellow spreading
Message: "Pressure is mounting"
```

**Shot 3: Critical State**
```
Scene: Multiple critical blocks
Composition: Tight on crisis zone
Elements: Pulsing reds, urgent labels, racing brigades
Colors: Red dominant, white sparks
Message: "This is the test"
```

**Shot 4: Save/Recovery**
```
Scene: Just-saved block
Composition: Close on recovery moment
Elements: Flash, particles, "SALVO!" text, green return
Colors: Red→Green transition, bright
Message: "Your action mattered"
```

### 9.3 Technical Specs

| Spec | Value |
|------|-------|
| **Resolution** | 1920x1080 min (desktop), 1080x1920 (mobile) |
| **Format** | PNG, lossless |
| **Framing** | Game board fills 80%+ of frame |
| **UI** | Include essential HUD, hide debug |
| **Variants** | 16:9, 1:1 (social), 9:16 (mobile stories) |

---

## 10. Honest Status Check

### 10.1 Status Decision Framework

**After implementation, classify as ONLY ONE:**

☐ **FLAGSHIP_CANDIDATE**
- Board feels like living neighborhood
- Crisis has drama and readability
- Saves are satisfying
- Screenshots are shareable
- Ready for storefront polish

☐ **PUBLIC_READY_BETA**
- Improvements made but not enough
- Still feels somewhat abstract
- Needs another board pass
- Not ready for flagship push

☐ **NEEDS_ANOTHER_BOARD_PASS**
- Living territory not achieved
- Crisis still muted
- Major work still required
- Delay flagship timeline

### 10.2 Evaluation Criteria

| Criterion | Weight | Threshold for FLAGSHIP_CANDIDATE |
|-----------|--------|-----------------------------------|
| Place identity | 3x | Named sectors, distinct blocks |
| Alive feel | 3x | Pulses, spreads, reactions visible |
| Crisis drama | 2x | Critical moments feel urgent |
| Brigade impact | 2x | Saves feel satisfying |
| Mobile clarity | 2x | Readable on small screens |
| Screenshot power | 2x | Someone asks "what game is this?" |

**Scoring:**
- 90-100%: FLAGSHIP_CANDIDATE
- 70-89%: PUBLIC_READY_BETA
- <70%: NEEDS_ANOTHER_BOARD_PASS

### 10.3 Honest Self-Assessment

**After implementation, answer:**

1. Does the board feel like a real neighborhood?
   ☐ Yes ☐ Somewhat ☐ No

2. Can you tell which block is which without reading labels?
   ☐ Yes ☐ Sometimes ☐ No

3. Does crisis spread feel dramatic and urgent?
   ☐ Yes ☐ Somewhat ☐ No

4. Do saves feel satisfying?
   ☐ Yes ☐ Somewhat ☐ No

5. Would someone screenshot this to share?
   ☐ Yes ☐ Maybe ☐ No

6. Is it readable on mobile?
   ☐ Yes ☐ Mostly ☐ No

**Count:**
- 5-6 Yes: FLAGSHIP_CANDIDATE
- 3-4 Yes: PUBLIC_READY_BETA
- 0-2 Yes: NEEDS_ANOTHER_BOARD_PASS

---

## 11. Implementation Timeline

### 11.1 Phase Breakdown

**Week 1: Territorial Identity**
- [ ] Sector/block naming system
- [ ] Building silhouette implementation
- [ ] Color palette per sector
- [ ] Landmark placement

**Week 2: Alive Blocks**
- [ ] Block state animations
- [ ] Infrastructure visual system
- [ ] Occupation density display
- [ ] Local stress/recovery signals

**Week 3: Crisis Spread**
- [ ] Ripple system
- [ ] Tendril animations
- [ ] Critical pulse effects
- [ ] Cascade prediction

**Week 4: Brigade Fantasy**
- [ ] Brigade state animations
- [ ] Dispatch path system
- [ ] Arrival impact effects
- [ ] Save payoff sequence

**Week 5: Recovery Spectacle**
- [ ] Flash/ripple/particle polish
- [ ] Infrastructure return animations
- [ ] Stabilized vs recovered distinction
- [ ] Screenshot capture

**Week 6: Polish & Evaluation**
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Screenshot proof capture
- [ ] Honest status assessment

### 11.2 Daily Build Targets

| Day | Target |
|-----|--------|
| **W1D1** | Basic sector layout |
| **W1D3** | First building silhouettes |
| **W1D5** | Sector color palettes |
| **W2D2** | Block state system |
| **W2D4** | Infrastructure icons |
| **W3D1** | Ripple prototype |
| **W3D3** | Tendril system |
| **W4D1** | Brigade states |
| **W4D4** | Save payoff |
| **W5D2** | Recovery spectacle |
| **W5D5** | Screenshot capture |
| **W6D3** | Mobile pass |
| **W6D5** | Status decision |

---

## 12. Verification Summary

### 12.1 Deliverables Checklist

| Deliverable | Status | File |
|-------------|--------|------|
| Territory identity plan | ☐ | `territory/board-layout.md` |
| Alive blocks spec | ☐ | `territory/block-identity.md` |
| Crisis spread design | ☐ | `crisis/spread-visuals.md` |
| Brigade fantasy spec | ☐ | `brigade/state-animations.md` |
| Recovery spectacle | ☐ | `spectacle/recovery-payoff.md` |
| Mobile safety | ☐ | `mobile/readability-checklist.md` |
| Implementation | ☐ | Code changes |
| Screenshots | ☐ | 4+ proof shots |
| Status decision | ☐ | This report |

### 12.2 Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Place identity score | 8+/10 | ___ |
| Alive feel score | 8+/10 | ___ |
| Crisis drama score | 7+/10 | ___ |
| Brigade impact score | 7+/10 | ___ |
| Mobile clarity score | 7+/10 | ___ |
| Screenshot shareability | 80%+ yes | ___% |

### 12.3 Final Status

**After T107 implementation:**

**Status:** ☐ FLAGSHIP_CANDIDATE ☐ PUBLIC_READY_BETA ☐ NEEDS_ANOTHER_BOARD_PASS

**Rationale:**
```
[One paragraph explaining the decision]
```

**Next Steps:**
```
- If FLAGSHIP_CANDIDATE: Move to storefront polish (T106 Phase 3)
- If PUBLIC_READY_BETA: Identify specific gaps, plan T108
- If NEEDS_ANOTHER_BOARD_PASS: Major revision, reset timeline
```

---

**T107 — Bairro Resiste Living Territory Build + Crisis Spectacle**  
**Sistema: Hub de Jogos — Pré Campanha**  
**Previous:** T106 Diagnosis  
**Target:** FLAGSHIP_CANDIDATE  
**Date:** 30 de Março de 2026
