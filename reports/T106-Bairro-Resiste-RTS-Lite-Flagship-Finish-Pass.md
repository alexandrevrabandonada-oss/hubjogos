# T106: Bairro Resiste RTS-Lite Flagship Finish Pass

**Status:** FLAGSHIP FINISH PASS — Production Plan  
**Date:** 30 de Março de 2026  
**Game:** Bairro Resiste — Territorial RTS-Lite  
**Current Status:** Public Beta / Strong Prototype  
**Target Status:** FLAGSHIP or FLAGSHIP_CANDIDATE  
**Strategic Context:** Third pillar of Hub genre identity (Platformer + City Sim + RTS-Lite)

---

## 1. Diagnosis: Current Gap Analysis

### 1.1 Strategic Position

**Hub Genre Triangle (Now Complete):**
| Lane | Game | Status | Genre |
|------|------|--------|-------|
| **Movement** | Corredor Livre | ✅ Flagship | Platformer |
| **Simulation** | Cidade Real | ✅ Flagship | City Builder |
| **Territorial Strategy** | Bairro Resiste | ⚠️ Beta/Prototype | RTS-Lite |

**The Gap:** Bairro Resiste needs to match the visual polish and public trust of Corredor Livre and Cidade Real.

### 1.2 Non-Showpiece Signals Audit

| Signal | Current State | Target State | Gap Severity |
|--------|---------------|--------------|--------------|
| **Board feel** | Hotspots on abstract map | Living neighborhood under pressure | 🔴 High |
| **Environmental storytelling** | Weak place identity | Strong street/block/sector character | 🔴 High |
| **Spread/drama** | Functional but muted | Visible crisis spread, readable pressure | 🔴 High |
| **Brigade fantasy** | Dispatch icons | Real-time defense, save moments | 🟡 Medium |
| **Screenshot power** | Okay but not viral | Shareable, distinctive stills | 🟡 Medium |
| **Storefront treatment** | Basic entry | Full poster/trust/status treatment | 🟡 Medium |
| **Motion pack** | None | GIFs + short clip | 🔴 High |

### 1.3 Root Causes

**Why it doesn't feel flagship yet:**
1. **Abstract board:** Grid feels like UI, not place
2. **Muted feedback:** Actions don't feel consequential enough
3. **Missing spectacle:** Crisis moments lack drama
4. **Weak identity:** Could be any neighborhood, not *this* neighborhood
5. **No capture pack:** Nothing to share/viralize

**Not issues:**
- ✅ Core loop is solid (pressure → dispatch → save)
- ✅ Tutorial teaches effectively
- ✅ Difficulty curve works
- ✅ Runs stable, no crashes

---

## 2. Living Territory Improvements

### 2.1 From "Hotspots" to "Streets Under Pressure"

**Current:** Abstract grid with colored cells  
**Target:** Readable streets, blocks, and sectors with identity

**Visual Hierarchy:**
```
SECTOR (Named district, e.g., "Morro do Pinto")
├── Blocks (3-5 per sector, distinct character)
│   ├── Streets (connections between blocks)
│   ├── Buildings (landmarks, density markers)
│   └── Open spaces (squares, danger zones)
```

### 2.2 Block Identity System

Each block needs:
| Element | Visual Expression | Gameplay Function |
|---------|-------------------|-------------------|
| **Block name** | Floating label, small | Player reference |
| **Building type** | Silhouette + color | Resource generation |
| **Occupation level** | Density of small houses | Population/pressure capacity |
| **Infrastructure** | Power, water, comm icons | Dependency for recovery |
| **Street connections** | Animated lines | Brigade paths |

**Block Types (Visual Variety):**
| Type | Visual | Pressure Response |
|------|--------|-------------------|
| **Residencial** | Dense small houses | Spreads fast, fragile |
| **Comercial** | Shops, street level | Generates resources |
| **Comunitário** | Larger buildings, plaza | Stronger, rally point |
| **Industrial** | Factories, warehouses | Hazard source but resource |
| **Vazio/Lote** | Grass, debris | Firebreak, danger |

### 2.3 Visible Infrastructure Under Threat

**Infrastructure Layer (Always Visible):**
| System | Visual | When Threatened |
|--------|--------|-----------------|
| **Power** | Electric poles, lines | Flicker, blackout zones |
| **Water** | Pipes, tanks | Dry taps, pressure loss |
| **Communications** | Antennas, cables | Static, dead zones |
| **Access** | Roads, bridges | Blocked, cut off |

**Infrastructure Failure Cascade:**
```
Block under pressure
    ↓
Local infrastructure stressed (visual: yellow warning)
    ↓
Infrastructure fails (visual: red, stopped)
    ↓
Connected blocks affected (visual: ripple)
    ↓
Sector-wide crisis (visual: dark, desperate)
```

### 2.4 Alive Crisis Spread

**Pressure Visual Language:**
| Stage | Visual | Audio (Future) |
|-------|--------|----------------|
| **Stable** | Soft glow, gentle pulse | Ambient neighborhood |
| **Heating** | Faster pulse, color shift | Tension music |
| **Critical** | Intense pulse, sparks | Alarm |
| **Overrun** | Static, dark, "lost" | Silence/drone |

**Spread Visualization:**
- **Ripples:** Pressure spreads with visible wave
- **Tendrils:** Crisis reaches along streets first
- **Hotspots:** Critical blocks glow intensely
- **Firebreaks:** Saved blocks stop spread visibly

### 2.5 Readable Territorial Collapse/Recovery

**Collapse Sequence (Readable at a glance):**
1. **Warning:** Block edge pulses yellow
2. **Heating:** Whole block pulses orange
3. **Critical:** Block red, infrastructure flickers
4. **Overrun:** Block dark, static, "INFECTED" label
5. **Cascade:** Neighbors at risk, connections pulse danger

**Recovery Sequence (Satisfying payoff):**
1. **Dispatch:** Brigade line animates to block
2. **Work:** Tool animations, particle effects
3. **Stabilize:** Block returns to yellow (safe but tired)
4. **Recover:** Green pulse, infrastructure relights
5. **Reinforce:** Bonus resistance, visual upgrade

---

## 3. Brigade/Action Fantasy Enhancements

### 3.1 Stronger Brigade States

**Brigade Visual States:**
| State | Visual | Meaning to Player |
|-------|--------|-------------------|
| **Ready** | Standing alert, tool ready | Available now |
| **Moving** | Walking animation, dispatch line | On the way |
| **Working** | Tool animation, sparks/particles | Saving the block |
| **Tired** | Slumped, slower animation | Needs rest |
| **Recovering** | Sitting, low opacity | Unavailable |
| **Celebrating** | Raised fist, cheer animation | Victory moment |

**Dispatch Line:**
- Animated path from HQ to target
- Color = brigade type (medical = red, construction = yellow, etc.)
- Pulse travels along line = progress
- Interruption = line breaks, brigade stops

### 3.2 Clearer Save/Stabilize Payoff

**Save Moment Spectacle:**
| Element | Visual | Duration |
|---------|--------|----------|
| **Flash** | Bright burst on stabilized block | 0.5s |
| **Ripple** | Green wave to neighbors | 1s |
| **Particles** | Confetti/sparkles | 2s |
| **Text** | "SALVO!" popup | 1.5s |
| **Sound** | (Future) Victory sting | - |

**Recovery vs Stabilize:**
- **Stabilize:** Block stops crisis, yellow state, still fragile
- **Recover:** Block returns to green, fully functional
- **Reinforce:** Block gets shield/bonus, stronger than before

### 3.3 Better Action Feedback and Urgency

**Urgency Cues (Screen-Level):**
| Level | Visual | When |
|-------|--------|------|
| **Calm** | Normal view, ambient | >70% stable |
| **Tense** | Vignette edge, faster ambient | 50-70% stable |
| **Critical** | Red vignette, pulse overlay | 25-50% stable |
| **Desperate** | Shake, intense red, alarms | <25% stable |

**Action Feedback:**
- **Dispatch:** Immediate sound (future), line appears
- **Arrival:** Brigade "lands" with small impact
- **Work:** Continuous particles, progress bar
- **Complete:** Flash, text, celebration animation

---

## 4. Spectacle and Crisis Readability

### 4.1 Pressure Spread Visuals

**Spread Types:**
| Type | Visual | Counter |
|------|--------|---------|
| **Fire** | Orange/red, upward tendrils | Fire brigade |
| **Disease** | Green/purple, pulsing blobs | Medical brigade |
| **Violence** | Red flashes, impact marks | Community brigade |
| **Neglect** | Gray spread, crumbling | Construction brigade |

**Spread Animation:**
- Origin: Block at critical
- Path: Along streets (not through blocks)
- Speed: Fast along streets, slow through blocks
- Blockage: Brigades can stop spread (visible barrier)

### 4.2 Critical-State Drama

**Critical Block Treatment:**
- Intense pulsing (1Hz)
- Color: Deep red with white core
- Particles: Sparks, debris
- Label: "CRÍTICO!" or "URGENTE!"
- Sound: (Future) Heartbeat/pulse

**Near-Collapse Board:**
- Multiple critical blocks = panic mode
- Screen effects: Vignette, slight shake
- HUD: Red alert banner
- Timer: If applicable, visible countdown

### 4.3 Collapse States

**Overrun/ Lost Block:**
- Color: Dark gray/black
- Static: Noise overlay
- Label: "PERDIDO" or "COLAPSADO"
- Connection: Cut from network
- Recovery: Only via special mission (not standard dispatch)

**Cascade Warning:**
- When 3+ blocks critical = "CASCATA" warning
- Visual: Ripple effect across whole sector
- Urgency: Highest, all hands on deck

### 4.4 Rescue/Stabilization Moments

**Rescue Scenario (High Drama):**
1. Block at critical (red, pulsing)
2. Brigade dispatched (line animates)
3. Race against time (progress bar vs. collapse timer)
4. Arrival at last moment (tense)
5. Save (flash, celebration, relief)

**Last-Second Save Spectacle:**
- Slow-motion (brief)
- Freeze frame on save
- Dramatic text: "NO LIMITE!"
- Bonus points (if applicable)

### 4.5 Phase Transitions

**Phase Change Visuals:**
| Transition | Visual | Audio (Future) |
|------------|--------|----------------|
| **Wave start** | Map edge glows, incoming | Rising tension |
| **Wave peak** | Maximum spread, chaos | Climax |
| **Wave end** | Calming, recoveries | Relief |
| **Victory** | Whole board celebration | Triumphant |
| **Defeat** | Darkening, collapse | Somber |

### 4.6 Board-Wide Stress Cues

**Sector-Level Status:**
- Mini-map or edge indicators
- Color summary (green/yellow/red zones)
- Pulse rate = overall stress

**HQ Status:**
- HQ building changes appearance
- Calm = intact, flags flying
- Stressed = damaged, flags tattered
- Critical = burning, alarms

---

## 5. Official Still Pack

### 5.1 Shot List (5 Mandatory)

| # | Shot Name | Scene | Composition | Mood |
|---|-----------|-------|-------------|------|
| **1** | **Opening Calm** | Board at start, organized sectors | Wide view, balanced, green/yellow | Hopeful, ready |
| **2** | **Mid-Pressure** | Crisis spreading, first responses | Diagonal tension, orange/red bleeding in | Tense, active |
| **3** | **Critical Moment** | Multiple critical blocks, desperate | Chaos, red dominant, brigades racing | Dramatic, urgent |
| **4** | **Intervention/Save** | Brigade arriving at critical block | Focus on save moment, before/after | Heroic, satisfying |
| **5** | **Result/End-State** | Victory or defeat board | Either celebration or collapse | Definitive |

### 5.2 Shot Specifications

**Shot 1: Opening Calm**
- **Trigger:** New game, first turn
- **View:** Full board, slight angle
- **Elements:** Organized sectors, ready brigades, clear labels
- **Colors:** Green (stable), yellow (warming), clean blue UI
- **Message:** "This neighborhood is alive and needs you"

**Shot 2: Mid-Pressure**
- **Trigger:** First major crisis spread
- **View:** Same angle, now with tension
- **Elements:** Spread visible, brigades en route, heat map effect
- **Colors:** Orange spreading, yellow warning zones
- **Message:** "Pressure is mounting, respond strategically"

**Shot 3: Critical Moment**
- **Trigger:** 3+ blocks critical simultaneously
- **View:** Tighter on crisis zone, some context
- **Elements:** Critical blocks pulsing, brigades racing, urgency cues
- **Colors:** Red dominant, white sparks, dark edges
- **Message:** "This is the test - can you hold?"

**Shot 4: Intervention/Save**
- **Trigger:** Successful last-second save
- **View:** Close on block, brigade visible
- **Elements:** Before/after split or flash, celebration particles
- **Colors:** Red → Green transition, bright flash
- **Message:** "Your dispatch saved this block"

**Shot 5: Result/End-State**
- **Trigger:** Victory or defeat
- **View:** Full board
- **Victory:** Greens, celebrations, "VITÓRIA" text
- **Defeat:** Dark, lost blocks labeled, "DERROTA" text
- **Message:** "The outcome of your strategy"

### 5.3 Technical Specs

| Spec | Value |
|------|-------|
| **Resolution** | 1920x1080 minimum |
| **Format** | PNG for stills, lossless |
| **Color space** | sRGB |
| **Compression** | None for masters |
| **Variants** | 16:9, 1:1 (social), 9:16 (mobile stories) |

---

## 6. Official Motion Pack

### 6.1 GIF List (3 Required)

| # | GIF Name | Content | Duration | Loop? |
|---|----------|---------|----------|-------|
| **1** | **Pressure Spread** | Crisis spreading across blocks | 3-4s | Seamless loop |
| **2** | **Brigade Dispatch** | Dispatch, travel, save sequence | 4-5s | Once, then freeze on success |
| **3** | **Critical Rescue** | Last-second save moment | 2-3s | Once, dramatic pause |

### 6.2 Short Clip (1 Required)

**"Bairro Resiste in 30 Seconds"**
- **Duration:** 30 seconds
- **Content:**
  0-5s: Opening calm (establish)
  5-10s: Crisis hits (pressure rises)
  10-20s: Dispatch chaos (multiple responses)
  20-25s: Critical moment (tension peak)
  25-30s: Victory save (payoff)

### 6.3 GIF Specifications

| Spec | Value |
|------|-------|
| **Resolution** | 800x450 minimum |
| **Format** | GIF, or MP4 for web |
| **Frame rate** | 30fps |
| **Colors** | 128-256 for GIF |
| **File size** | <5MB per GIF |
| **Loop** | Seamless for spread, once for save |

### 6.4 Capture Technique

**For Pressure Spread GIF:**
1. Set up board with controlled crisis
2. Record 6 seconds (2 cycles for loop)
3. Trim to best 3-4 second segment
4. Ensure seamless loop point

**For Brigade Dispatch GIF:**
1. Position camera on route
2. Trigger dispatch
3. Record full travel + save
4. Hold on celebration for 1s
5. End (no loop)

---

## 7. Storefront Upgrades

### 7.1 Current vs Target

| Element | Current | Target |
|---------|---------|--------|
| **Poster** | Basic card | Full poster treatment |
| **Subtitle** | "Defesa comunitária em tempo real" | Punchy, genre-clear |
| **Trust row** | Minimal | Full trust indicators |
| **Status** | "Public Beta" | Honest but aspirational |
| **Entry** | Standard lane | Hero treatment if flagship |

### 7.2 Poster Treatment

**Visual Design:**
- **Base:** Shot 3 (Critical Moment) or Shot 4 (Intervention)
- **Overlay:** "BAIRRO RESISTE" title, bold, impactful
- **Subtitle:** "RTS de Território em Tempo Real"
- **Color:** Warm palette (oranges, reds) with resistance green
- **Style:** Action-oriented, not abstract

**Text Layout:**
```
[Background: Critical board with brigades]

BAIRRO
RESISTE

RTS de Território em Tempo Real

[Small: Defenda sua comunidade bloco a bloco]
```

### 7.3 Subtitle Punch-Up

**Current:** "Defesa comunitária em tempo real"  
**Issues:** Generic, doesn't say RTS  

**Options:**
| Option | Text | Why |
|--------|------|-----|
| A | "RTS de Território: Defesa em Tempo Real" | Genre first, clear |
| B | "Comandei a Resistência — Bloco a Bloco" | Player fantasy |
| C | "Estratégia Territorial em Tempo Real" | Elevated |
| **Recommended** | **"RTS de Território: Comande a Resistência"** | **Genre + fantasy** |

### 7.4 Trust Row

**Elements:**
| Icon | Text | Meaning |
|------|------|---------|
| 🎮 | "RTS em tempo real" | Genre clarity |
| ⏱️ | "Sessões de 10-20 min" | Time commitment |
| 📱 | "Desktop e mobile" | Cross-platform |
| 🆓 | "Grátis, sem anúncios invasivos" | Trust |
| 🔄 | "Beta público — em desenvolvimento" | Honest status |

### 7.5 Status Labeling

**Options:**
| Status | Badge | When |
|--------|-------|------|
| **FLAGSHIP** | "Flagship Hub" | After this pass, if approved |
| **FLAGSHIP_CANDIDATE** | "Candidato a Flagship" | During finish pass |
| **PUBLIC_READY_BETA** | "Beta Público" | Current |

**Recommendation:** Target **FLAGSHIP_CANDIDATE** → then **FLAGSHIP** after polish.

### 7.6 Entry Lane Treatment

**If FLAGSHIP:**
- Own dedicated section
- Large hero poster
- First in strategy section
- "Jogar Agora" CTA prominent

**If FLAGSHIP_CANDIDATE:**
- Featured in "Novos" or "Beta"
- Standard card size but premium position
- Badge indicating candidacy

---

## 8. Final Status Recommendation

### 8.1 Decision Matrix

| Criterion | Weight | Score | Weighted | Notes |
|-----------|--------|-------|----------|-------|
| Living territory | 3x | 6 | 18 | Needs work |
| Brigade fantasy | 2x | 6 | 12 | Solid base |
| Crisis spectacle | 3x | 5 | 15 | Muted currently |
| Screenshot power | 2x | 6 | 12 | Okay, not viral |
| Motion pack | 2x | 3 | 6 | None currently |
| Storefront ready | 2x | 5 | 10 | Basic treatment |
| Replay desire | 2x | 7 | 14 | Core loop works |
| Genre clarity | 2x | 6 | 12 | RTS-lite clear |
| **Total** | | | **99/180** | |

### 8.2 Current Score: 99/180

**Interpretation:**
- 144-180: FLAGSHIP (ready for hero treatment)
- 108-143: FLAGSHIP_CANDIDATE (strong, needs polish)
- 72-107: PUBLIC_READY_BETA (works, not flagship)
- 0-71: PROTOTYPE (not public ready)

**Current:** 99 = **PUBLIC_READY_BETA** (upper range, close to candidacy)

### 8.3 Target After T106 Pass

**Target Score:** 130+ (FLAGSHIP_CANDIDATE → FLAGSHIP)

**Required improvements:**
| Area | Current | Target | Gain |
|------|---------|--------|------|
| Living territory | 6 | 8 | +6 |
| Crisis spectacle | 5 | 8 | +9 |
| Motion pack | 3 | 8 | +10 |
| Storefront | 5 | 8 | +6 |
| **New total** | | | **130** |

### 8.4 Recommended Status Progression

| Phase | Status | Criteria |
|-------|--------|----------|
| **Now** | PUBLIC_READY_BETA | ✅ Complete |
| **After T106 visual pass** | FLAGSHIP_CANDIDATE | Living territory + spectacle |
| **After motion pack** | FLAGSHIP_CANDIDATE (strong) | GIFs + clip complete |
| **After storefront** | FLAGSHIP | Full public treatment |

### 8.5 Final Recommendation

**Recommended Status:** **FLAGSHIP_CANDIDATE** (post-T106)

**Rationale:**
- Core RTS-lite loop is proven and fun
- Public beta has validated concept
- Visual pass will elevate to "living territory" standard
- Motion pack will provide viral shareability
- Storefront upgrade will complete presentation

**Not ready for FLAGSHIP yet** because:
- Living territory needs implementation
- Motion pack doesn't exist
- Storefront treatment is basic

---

## 9. Next Production Recommendation

### 9.1 Production Phases

**Phase 1: Visual/Gamefeel Pass (2-3 weeks)**
- [ ] Living territory implementation
- [ ] Brigade state animations
- [ ] Crisis spectacle upgrade
- [ ] Screenshot capture (5 shots)

**Phase 2: Motion Pack (1 week)**
- [ ] 3 GIFs
- [ ] 30-second clip
- [ ] Social variants (1:1, 9:16)

**Phase 3: Storefront (1 week)**
- [ ] Poster design
- [ ] Entry treatment
- [ ] Trust row copy
- [ ] Status badge

**Phase 4: Launch (1 week)**
- [ ] Deploy storefront
- [ ] Publish motion pack
- [ ] Announce FLAGSHIP_CANDIDATE
- [ ] Gather feedback

**Total: 5-6 weeks to FLAGSHIP_CANDIDATE**

### 9.2 Success Criteria

**Phase 1 Complete When:**
- [ ] Board feels like living neighborhood
- [ ] Brigade actions have strong feedback
- [ ] Crisis moments have drama
- [ ] 5 screenshots captured and approved

**Phase 2 Complete When:**
- [ ] 3 GIFs ready for social
- [ ] 30s clip tells complete story
- [ ] Someone shares without prompting

**Phase 3 Complete When:**
- [ ] Storefront entry matches Corredor Livre quality
- [ ] Trust row answers all questions
- [ ] Status badge reflects true state

### 9.3 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Visual pass overruns | Strict 2-week cap, cut non-essential |
| Motion pack not viral | Test with players before finalizing |
| Storefront doesn't convert | A/B test poster options |
| Performance on mobile | Test early, optimize particles |

---

## 10. Verification Summary

### 10.1 T106 Deliverables

| Deliverable | Status | File |
|-------------|--------|------|
| Gap diagnosis | ✅ | This report |
| Living territory plan | ✅ | Section 2 |
| Brigade fantasy plan | ✅ | Section 3 |
| Spectacle plan | ✅ | Section 4 |
| Still pack specs | ✅ | Section 5 |
| Motion pack specs | ✅ | Section 6 |
| Storefront plan | ✅ | Section 7 |
| Status recommendation | ✅ | FLAGSHIP_CANDIDATE |
| Production timeline | ✅ | 5-6 weeks |

### 10.2 Ready to Start

**Can begin immediately:**
- [ ] Living territory visual design
- [ ] Brigade animation set
- [ ] Screenshot composition planning

**Blocked on:**
- [ ] Nothing — all planning complete

### 10.3 Handoff Checklist

**For Art Lead:**
- [ ] Review Section 2 (Living Territory)
- [ ] Review Section 5 (Still Pack)
- [ ] Create visual mockups

**For UX Lead:**
- [ ] Review Section 3 (Brigade Fantasy)
- [ ] Review Section 4 (Spectacle)
- [ ] Prototype feedback systems

**For Marketing:**
- [ ] Review Section 6 (Motion Pack)
- [ ] Review Section 7 (Storefront)
- [ ] Prepare social campaign

---

**T106 — Bairro Resiste RTS-Lite Flagship Finish Pass**  
**Sistema: Hub de Jogos — Pré Campanha**  
**Predecessor:** Corredor Livre (Flagship), Cidade Real (Flagship)  
**Target:** Third Pillar — Territorial RTS-Lite  
**Current:** PUBLIC_READY_BETA  
**Target Status:** FLAGSHIP_CANDIDATE (then FLAGSHIP)  
**Date:** 30 de Março de 2026
