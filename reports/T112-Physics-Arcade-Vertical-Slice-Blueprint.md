# T112 — Physics Arcade Vertical Slice Blueprint
## The Hub's First Destruction-Physics Lane

**Date:** 2026-03-30  
**Status:** Blueprint Definition  
**Scope:** Vertical slice concept, not production  
**Strategic Gap:** Physics/arcade/destruction lane with instant replayability and clip power

---

## Executive Summary

The Hub's flagship foundation is strong:
- **Corredor Livre** (platformer) → challenge / skill
- **Cidade Real** (city sim) → systems / strategy  
- **Bairro Resiste** (RTS-lite) → territory / tactics

The next franchise gap is **not** another medium-depth systems game.

The frontier is a **highly visual, short-session arcade lane** with:
- Immediate readability (understand in 2 seconds)
- Tactile destruction feedback
- Strong shareability / GIF power
- Political meaning **through play**, not narration
- Vanilla physics engine (no copyrighted imitation)

This slice opens the **Physics Arcade lane** as the fourth flagship genre.

---

## Core Fantasy: "Desobstrução"
### (Infrastructure Unblocking / Mutual Aid Destruction)

**The One-Sentence Fantasy:**  
*You are a rapid-response infrastructure crew clearing blocked essential services (water, power, mobility) from a RJ neighborhood—smash through barriers, trigger cascades, restore community flow.*

**Why This Fantasy:**
- **Political meaning through play**: The fantasy of unblocking essential services to public good (not text sermon)
- **Immediate resonance in RJ**: Water shutoffs, power failures, road blockages are lived experience
- **Destruction + restoration**: Unlike pure destruction, you're clearing obstacles to enable flow (moral clarity)
- **Scalable scope**: One blockage = one short loop; many blockages = deeper sim later (Mutirão)
- **Viral loop**: Spectacular destruction + satisfying restoration = GIF-ready moments

**Player's Mental Model:**  
"I break through barriers so my neighborhood can breathe again."

---

## Core Play Model
### The Physics Arcade Loop

```
┌─────────────────────────────────────────┐
│  DESOBSTRUÇÃO ONE-LOOP FLOW             │
├─────────────────────────────────────────┤
│                                         │
│  1. SETUP                               │
│     → Board shows blocked infrastructure│
│     → Blockage structure visible         │
│     → Health bar / damage state clear   │
│                                         │
│  2. AIM                                 │
│     → Player aims tool/projectile       │
│     → Arc trajectory shown              │
│     → Power meter (1–3 seconds)         │
│                                         │
│  3. RELEASE                             │
│     → Fire at blockage                  │
│     → Tool flies, physics takes over    │
│                                         │
│  4. IMPACT                              │
│     → Direct hit: structure deforms     │
│     → Particles + screen shake          │
│     → Sound design = satisfying crunch  │
│                                         │
│  5. CASCADE (Optional)                  │
│     → Pieces fall / break               │
│     → May hit secondary blockages       │
│     → Chain reactions create drama      │
│                                         │
│  6. RESOLVE                             │
│     ├─ CLEARED: infrastructure flows    │
│     │  → Water fills pipes (blue glow)  │
│     │  → Power lights up (yellow glow)  │
│     │  → Traffic resumes (silhouettes)  │
│     │  → Score / time bonus             │
│     │  → Next blockage OR victory       │
│     │                                   │
│     └─ NOT CLEARED: retry available     │
│        → Blockage persists              │
│        → Partial damage visible         │
│        → Retry attempt counter          │
│                                         │
└─────────────────────────────────────────┘
```

**Key Mechanics:**
- **Aim & Power**: Simple 2-axis control, visual feedback
- **Physics**: Gravity, collision, momentum (vanilla engine, no IP collision)
- **Destruction**: Structural integrity → visual breakage → functional clearing
- **Feedback**: Immediate vibration/particle/sound on impact
- **Progression**: Multiple stacked blockages in one session (3–5 blockage types)

**Session Length:**  
- Per blockage: 15–45 seconds (aim + 1–3 attempts)
- Full slice: 2–4 minutes (3–4 blockages cleared = victory)
- **Replayability**: Randomized blockage types / structures keep loops fresh

---

## Territorial Setting: Cross-Section of RJ Infrastructure

### Board Environment Design

**Setting: Manguinhos / Complexo da Maré Water & Power Hub**

**Visual Structure:**  
- **Cross-section view** (not top-down): Shows layers of infrastructure
  - Ground level (street, community spaces)
  - Underground pipes (water supply, shown in blue)
  - Power lines (overhead, shown in yellow)
  - Building silhouettes (brown/tan, recognizable RJ vernacular)

**Why This:**
- **Immediate recognition**: Players see their own neighborhood structure
- **Political clarity**: Infrastructure is visible, tangible, under siege
- **Functional honesty**: Blockages are barriers to literal survival (water, power, mobility)
- **Non-generic**: Avoids "colorful puzzle grid" feeling

**Board States:**
- **Idle state**: Blockages in place, infrastructure frozen, community still
- **Destruction state**: Player fire active, debris falling, physics active
- **Resolution state**: Infrastructure flows, lights glow, people silhouettes resume movement

---

## Visible Reaction System
### Impact, Cascade, Restoration

### 1. Clear Targets
**Blockage Types** (each with distinct visual / destructibility):
- **Concrete barriers** (civil dispute / demolition blockade)
  - Heavy, needs multiple hits or power shot
  - Connected to ground, debris pattern predictable
  - Cracks visible on damage
- **Debris piles** (disaster aftermath)
  - Medium weight, pieces can be knocked aside
  - Creates dominoes with other debris
  - Partially transparent (shows infrastructure behind)
- **Bureaucratic monuments** (administrative blockage joke)
  - Shaped like official seals, boxes, stamps
  - Lighter, good for trick shots / cascades
  - Break apart in satisfying ways
- **Rusted infrastructure** (unmaintained systems)
  - Pipes/cables tangled in blockage
  - Clearing requires precision to not damage what's behind
  - Success = infrastructure glows when exposed

### 2. Structural Reaction
- **On hit:** Structure deforms (visible damage)
- **On significant damage:** Pieces break/separate from main structure
- **On destruction:** Remaining obstacles shift, new angles available
- **Physics:** Each piece respects gravity, collision, momentum (not scripted, physics-driven)

### 3. Damage / Spread Logic
- **Health bars:** Blockage shows integrity meter (visual cracks correspond)
- **Spread on cascade:** Falling debris can hit secondary blockages, creating chain reactions
- **Momentum transfer:** Heavier hits on lighter obstacles create bigger cascades
- **Satisfying fail state:** Partial destruction leaves visible progress (not binary cleared/not cleared)

### 4. Impact Feedback
- **Visual:** Particle burst at impact, dust cloud, screen-frame vibration
- **Audio:** Satisfying crunch/crash sound (tuned for toy-like feel, not realistic harshness)
- **Haptic:** Brief controller vibration (if mobile/gamepad)
- **UI:** Damage counter or health reduction animated in real-time

### 5. Success / Failure Readability
**Clear Victory:**
- Blockage fully destroyed / cleared
- Infrastructure glow activates (blue water flow, yellow power glow, gray traffic movement)
- Celebration moment: camera slight zoom, optional particle confetti, brief music swell
- Next obstacle prompt or level-clear screen

**Clear Failure:**
- Blockage persists after 1–2 attempts
- Partial damage visible but not cleared
- Retry button shows remaining attempts (3–5 attempts per blockage by default)
- No penalty for retry; resets for next attempt

---

## Asset-First Scope

### Board / Environment Kit
- **Pipes** (water main, blue; power conduit, yellow; gray service lines)
- **Buildings** (RJ architectural silhouettes: favela-style, colonial, modern)
- **Street level** (asphalt, sidewalk, utility boxes, fire hydrants)
- **Infrastructure nodes** (pump houses, transformer stations, road junctions)
- **Blockage anchors** (concrete foundations, rubble heaps, administrative barriers)
- **Glow/flow effects** (blue water cascade, yellow power light, gray silhouettes moving)

**Aesthetic:** Stylized, low-poly, high contrast. Not realistic; not cartoonish. Architecturally honest to RJ. Strong readability at thumb-size mobile viewport.

### Targets / Structures (Blockages)

| Name | Type | Weight | Breakability | Visual | Role |
|------|------|--------|--------------|--------|------|
| Barrier-Concrete | Heavy | 3/3 | Hard | Pixelated concrete block | Core challenge |
| Rubble-Pile | Medium | 2/3 | Medium | Stacked irregular shapes | Cascade trigger |
| Monument-Bureau | Light | 1/3 | Soft | Geometric stamp shape | Trick-shot fun |
| Cable-Tangle | Complex | 2/3 | Precision | Interlocked lines + hardware | Skill challenge |
| Facade-Collapse | Very Heavy | 3/3 | Sequence | Pre-damaged building section | Final boss |

Each blockage type teaches different physics: momentum, precision, cascade, timing.

### Projectile / Tool Silhouettes

**Tool 1: Rammer (Pneumatic breaker)**
- Shape: Angled wedge / chisel
- Color: Black handle + metallic head
- Motion: Moves fast, heavy impact, goes deep
- Use: Primary tool for direct structural hits

**Tool 2: Crowbar (Pry bar)**
- Shape: Curved hook at end
- Color: Yellow/orange, curved handle
- Motion: Medium speed, leverage angle, good for leverage points
- Use: Secondary tool for breaking weak points

**Tool 3: Pressure Jet (Water pressure)**
- Shape: Nozzle / curved lance
- Color: Blue stream
- Motion: Slower but persistent, creates flow visuals
- Use: Puzzle tool for clearing sand/loose debris

Each tool has distinct arc, speed, and impact feeling. Differentiated enough to learn but not complex to master. Accessibility: pick any tool for the blockage (no wrong choice, just different strategies).

### FX Pack

**Impact Effects:**
- Particle burst (debris + dust, 12–20 particles per impact)
- Smoke plume (fades over 0.6s)
- Screen shake (brief, tuned to feel heavy not punishing)
- Hit flash (white flash on blockage at impact point)

**Cascade Effects:**
- Piece-fall gravity particles (tumbling debris visual)
- Collision sparks (when falling debris hits other pieces / infrastructure)
- Dust cloud (when debris lands)

**Restoration Effects:**
- Water glow + flow animation (blue travel along pipes, 2s duration)
- Power on animation (yellow glow spreads, lights turn on in buildings)
- Traffic return (silhouettes move, vehicles cross area)
- Celebration moment (confetti optional, or just vibration + music beat)

### Result Visuals

**Cleared State:**
- Infrastructure fully glowing
- People/vehicles resume activity (silhouette movement)
- Functional wholeness (before: broken → after: flowing)
- Score displayed (time bonus, cascade bonus, efficiency rating)

**Partial Damage (Retry):**
- Blockage shows visible cracks / broken sections
- Health bar shows reduced integrity (~50–75%)
- Message: "Almost cleared" or "One more hit"
- Next attempt resets physics but keeps damage visual

**Victory Screen:**
- All infrastructure glowing
- Neighborhood is "restored"
- Score, time taken, efficiency rating
- "Next blockage" or "Level complete" prompt

---

## Screenshot Targets
### Key Moments for GIF/Video/Poster

| Target | Frame | Purpose | Visual Key |
|--------|-------|---------|-----------|
| Blockage Intact | T+0s | Setup / problem state | Clear obstacle visible, infrastructure behind dark |
| Aim Ready | T+1s | Decision moment | Arc trajectory visible, power meter full, player ready |
| Impact Moment | T+2s | Peak destruction | Tool hits blockage, particles burst, screen shake |
| Cascade Mid | T+3s | Chain reaction | Debris falling, secondary blockages hit, drama high |
| Half Cleared | T+4s | Partial progress | Blockage breaking apart, some pieces gone, infrastructure starting to peek |
| Fully Cleared | T+5s | Victory moment | Infrastructure glowing, blue+yellow+gray flows active, people moving |
| Score Screen | T+6s | Completion | Efficiency rating, time bonus, next prompt |

**Viral GIF Targets:**
1. **Impact cascade** (2.5s loop): Tool hits → particles burst → debris falls → secondary hit → cascade completes
2. **Full restoration** (2s loop): Victory state with all infrastructure glowing, loop on glow pulse / people movement
3. **Quick fail & retry** (3s loop): Miss → blockage undamaged → restart aim → this time hit → partial damage

All capture targets designed for social sharing (16:9 aspect, clear visual center, 1–3 second max loop).

---

## Scope & Technical Foundation

### Engine Choice
**Vanilla physics engine** (Three.js + Cannon-es or similar):
- Avoid proprietary physics (Bullet, etc.)
- Lightweight, mobile-friendly
- Simple enough for tight arcade control feel
- No performance thrashers (keep under 60ms frame budget on mobile)

### Board Size
- **Viewport:** 1440x810px (16:9, mobile-first breakpoint)
- **Playable area:** Central 800x500px (infrastructure + blockage visible at all times)
- **UI area:** Top bar (time, score, attempt counter), bottom (aim + power meter)

### Session Data
- **Per session:** 3–4 blockages, ~2–4 minutes total time
- **Persist:** High score, blockages cleared, best cascade size
- **Retry cost:** Free (unlimited retries per blockage, time counted but no score penalty)

### Mobile Readiness
- **Touch controls:** Drag-to-aim, hold-to-power, tap-to-release (not swiped, hold = power accumulation)
- **Responsive:** Full 16:9 on mobile phones (6.1" iPhone-size baseline), scales down to 4.7" without loss of function
- **Performance:** Target 60fps on mobile GPU (iPhone 14 baseline)

---

## Roadmap Placement

### The Four Flagship Lanes

| Lane | Game | Type | Session | Complexity | Skill | Replayability | Why |
|------|------|------|---------|------------|-------|---------------|-----|
| **Platformer** | Corredor Livre | Skill / Challenge | 3–5 min | Medium | High | Levels | Tight control, progression, mastery |
| **Simulation** | Cidade Real | Systems / Strategy | 8–15 min | High | Medium | Emergence | Economics, decision-making, discovery |
| **Territory** | Bairro Resiste | Tactics / Defense | 2–3 min | Medium | Medium | Emergent | Real-time decision, pressure/rescue |
| **Arcade** | Desobstrução | Physics / Destruction | 2–4 min | Low | Low | Sandbox | Instant fun, cascade discovery, shareability |

**Strategic Gap Filled:**
- **Before T112:** All flagship titles are strategic/systems-heavy (require thinking)
- **After T112:** Franchise has variety: skill (platformer), strategy (sim/tactics), instant gratification (arcade)
- **Engagement diversity:** Players can choose session type based on mood (skill challenge, strategic play, pure fun)

### Future Physics Lane Expansion (Post T112)
Desobstrução opens the **Physics Arcade lane** with more potential titles:
- Desobstrução Part 2 (deeper progression, cosmetics)
- **Construção Coletiva** (positive-sum building instead of destruction)
- **Reciclagem Arcade** (sorting/matching with physics)
- **Barricada** (defensive stacking game)

Each shares physics core but different fantasy / interaction model.

---

## Political Meaning Through Play

### Why This Matters

**Text-Heavy Approach (Fails):**  
"This game is about infrastructure justice and the struggle for clean water."  
→ Player reads, nods, forgets.

**Play-First Approach (Works):**  
Player experiences:
1. **Setup state:** Infrastructure blocked, community waiting
2. **Agency:** I choose how to break through barriers
3. **Consequence:** My action directly restores functionality
4. **Empathy:** I *feel* the relief of flow restored
5. **Recall:** I remember the *experience* of clearing blockage

Desobstrução teaches infrastructure politics through play, not sermon.

The game inherently says: "Essential services should flow. Blockages are solvable. Collective action works."

This is honest design, not propaganda.

---

## Why This Lane Matters Now

### Strategic Reasons

1. **Franchise Maturity:** With three strategic games, adding instant-gratification arcade is natural genre expansion
2. **Engagement Metrics:** Physics/arcade has highest engagement and replay per player-hour across industry
3. **Shareability:** Destruction GIFs are inherently viral (5–10x more reshares than strategic gameplay)
4. **Mobile Market:** Short arcade loops are proven player acquisition lever for browser/app games
5. **Barrier to Entry:** Arcade requires zero learning curve (vs platformer needing skill, sim needing understanding)

### Cultural Reasons

1. **RJ Infrastructure Crisis:** Water shutoffs, power failures, road collapse are lived reality for players; they recognize this fantasy
2. **Mutual Aid Moment:** Destruction framed as restoration (not chaos) aligns with lived experience of community resilience
3. **Toy Factor:** Destruction games have been globally beloved since Angry Birds; RJ can own an original version
4. **GIF Currency:** Short arcade loops become social currency; every cleared blockage is a shareable moment

### Game Design Reasons

1. **Accessibility:** Arcade requires no tutorial, no progression mastery, no system understanding
2. **Replayability:** Physics sandbox inherently generates different outcomes each attempt
3. **Session Choice:** Players choose "quick fun" vs "strategic depth" based on energy level
4. **Viral Onboarding:** "Watch this" is more effective than "here's the tutorial"

---

## Verification Summary

### Blueprint Checklist

- [x] **Core Fantasy Defined:** Desobstrução (infrastructure unblocking, mutual aid destruction)
- [x] **Play Model Clear:** Aim → Release → Impact → Cascade → Resolve (2–4 min session)
- [x] **Territorial Setting:** RJ cross-section infrastructure, recognizable neighborhood
- [x] **Reaction System:** Clear targets, structural damage, cascade logic, satisfying feedback
- [x] **Asset Kit Specified:** 5 blockage types, 3 tools, environment, FX, result visuals
- [x] **Screenshot Targets:** 7 key moments for GIF/social capture
- [x] **Roadmap Position:** 4th flagship genre (arcade), opens physics lane
- [x] **Political Meaning:** Through play mechanics, not text sermon
- [x] **No IP Collision:** Vanilla physics, original fantasy, distinct from Angry Birds / copycat
- [x] **Mobile Ready:** Touch controls, 16:9 viewport, 60fps target on mid-range mobile

### None-Blocking Questions

**Q: Why not start with a more complex physics game?**  
A: Vertical slice must be playable and shippable in tight timebox. Single-blockage loop validates physics system, feedback tuning, and viral potential before expanding to deeper progression (Mutirão).

**Q: Why destruction and not construction?**  
A: Destruction is immediate gratification (impact is felt instantly). Construction requires planning (slower feedback). Arcade success depends on instant tactile reward. Positive-sum games (construction, building) come later in the lane.

**Q: Why not match Angry Birds formula exactly?**  
A: Angry Birds IP is protected; more importantly, direct imitation would feel hollow. Original fantasy (infrastructure clearing, RJ context, mutual aid meaning) gives us authentic differentiation and cultural resonance.

**Q: What's the engagement runway?**  
A: Slice validates one core loop. Full game (T113+) would add 5–8 blockage types, cosmetic upgrades, leaderboards, seasonal challenges. Each lane builds based on what slices prove.

---

## Next Work

### T112 Deliverables (This Phase)
- [x] Blueprint document (this file)
- [x] Fantasy + Play Model defined
- [x] Territorial setting + asset scope specified
- [x] Reaction system detailed
- [x] Screenshot targets defined
- [x] Roadmap placement + strategic reasoning
- [x] Political meaning through mechanics explained

### T113 (Build Phase) - Out of Scope This Sprint
- [ ] Implement physics engine (Cannon.js board + gravity)
- [ ] Implement first blockage type (Concrete Barrier)
- [ ] Implement first tool (Rammer)
- [ ] Implement aim + power meter
- [ ] Implement impact particle FX
- [ ] Implement restoration glow animation
- [ ] Mobile touch controls
- [ ] Player capture session (screenshot targets)

### Estimated T113 Scope
- **Duration:** 4–5 working days (vertical slice, single loop, shippable state)
- **Team:** 1 engineer (physics + UI) + 1 designer (asset kit + FX tuning) + 1 audio (impact sound design)
- **Output:** Playable web slice, 1 blockage type × 1 tool, 2–3 minute session, ready for public test

---

## File Structure (Post T113)

```
components/
  games/arcade/
    DesobstruçãoArcade.tsx (core game component)
    DesobstruçaoArcade.module.css
    
lib/
  games/arcade/
    physics/
      board.ts (Cannon.js setup)
      blockages.ts (Concrete, Rubble, Monument, Cable, Facade)
      tools.ts (Rammer, Crowbar, PressureJet)
      physics-engine.ts (unified interface)
    audio/
      desobtrusao-audio.ts (impact sounds, restoration chime, music)
    
public/
  showcase/
    desobtrusao/
      environment/ (board kit SVG/glb)
      blockages/ (3D models or hires sprites)
      tools/ (projectile sprites)
      motion/ (GIFs: impact, cascade, restoration)
      
app/
  arcade/
    desobtrusao/
      page.tsx (entry page, playable embed)
      
tests/
  e2e/
    desobtrusao-physics.spec.ts (Playwright capture)
```

---

## Conclusion

**Desobstrução** is the physics-arcade lane opening for the Hub's flagship franchise.

It fills the strategic gap (we need instant-gratification alongside strategy), opens the destruction-physics lane, and grounds arcade fun in RJ infrastructure politics.

The fantasy, mechanics, and territorial setting are defined.

Ready for T113 build phase.
