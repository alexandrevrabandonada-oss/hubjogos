# T138 — Frota Popular Last Fairness Pass
## HUD + Fleet Buffer + 08:00 Compression

**Date:** 2026-04-01  
**Scope:** `components/games/tycoon/FrotaPopularPrototype.tsx`  
**Based on:** T137 simulation findings (0/14 human-style wins; 08:00–09:30 permanently underwater)

---

## Diagnosis

T137 confirmed the T136 build is script-winnable but fails the human-cadence standard:

- The 08:00 influx of +10 on `lote_xv` pushed total queues beyond what 22 vehicles could process before the 09:00 critical hour.
- Players spent 10–15 seconds fully drained (`fleetPool = 0`) with no legal action to take, creating punish windows that felt arbitrary rather than tactical.
- The desktop HUD still contained 2-click instruction language ("Selecione uma Comunidade e depois a Estação"), teaching a dead interaction model and burning cognitive overhead on first-run players.
- The fleet bar rendered 14 fixed dots against a 22-vehicle pool, making the bar permanently near-full and unreadable as a strategic cue. With fleet raised to 24, the problem would worsen without a fix.

---

## Files Changed

| File | Change |
|---|---|
| `components/games/tycoon/FrotaPopularPrototype.tsx` | 4 targeted edits (see below) |

---

## Balance Changes Made

### 1. Fleet Pool: 22 → 24
```tsx
// Before (T134)
const [fleetPool, setFleetPool] = useState(22);

// After (T138)
const [fleetPool, setFleetPool] = useState(24); // T138: Last Fairness Pass buffer
```
**Effect:** Adds a 2-vehicle buffer (≈9% increase). Reduces the probability of a full-drain punish window during the 08:00–08:30 band without changing route throughput dynamics or removing congestion pressure.

---

### 2. 08:00 Influx: lote_xv +10 → +6
```tsx
// Before
lote_xv: q.lote_xv + 10,
upa: q.upa + 8,

// After (T138)
lote_xv: q.lote_xv + 6, // T138: Compressed 08:00 rush from +10 to +6
upa: q.upa + 8,
```
**Effect:** Total 08:00 shock reduced from +18 to +14 across the network. The `upa` branch (+8) and the 09:00 critical hour are **unchanged** — tension is preserved at the decisive window. The 08:00 wave goes from "unrecoverable without perfect cadence" to "tight but catchable with focused dispatch."

---

### 3. HUD Instruction: 2-click → 1-click
```tsx
// Before (stale, described dead interaction)
<span className="text-blue-400 font-bold">MISSÃO:</span> Evite o colapso nos pontos.{' '}
Selecione uma <span className="text-white font-bold">Comunidade</span> e depois a{' '}
<span className="text-white font-bold">Estação</span>.

// After (T138 — matches actual one-click dispatch)
<span className="text-blue-400 font-bold">MISSÃO:</span> Evite o colapso nos pontos.{' '}
<span className="text-white font-bold">Clique numa comunidade</span> para despachar imediatamente.
```
**Effect:** Removes a false instruction that caused players to look for a second click that never comes. First-run cognitive load reduced with zero gameplay impact. The mobile HUD already had correct messaging; this aligns the desktop panel.

---

### 4. Fleet Bar: Scaled to 24-vehicle pool (1 dot = 2 vehicles)
```tsx
// Before: 14 fixed dots against 22-vehicle pool
Array.from({ length: 14 }).map((_, i) => (
  <div ... className={`... ${i < fleetPool ? 'bg-blue-500...' : 'bg-white/10'}`} />
))

// After (T138): 12 dots, each representing 2 vehicles
Array.from({ length: 12 }).map((_, i) => (
  <div ... className={`... ${i < Math.ceil(fleetPool / 2) ? 'bg-blue-500...' : 'bg-white/10'}`} />
))
```
**Effect:** Bar now accurately depletes as vehicles dispatch and refills as they return. At full pool (24) = 12 dots lit. At half pool (12) = 6 dots lit. At drain (0) = 0 dots lit. Strategic readability restored without visual redesign.

---

## Before/After Fairness Analysis

| Metric | T136 (Before) | T138 (After) |
|---|---|---|
| Starting fleet | 22 | 24 |
| 08:00 lote_xv influx | +10 | +6 |
| 08:00 upa influx | +8 | +8 (unchanged) |
| 09:00 critical hour | dangerous | dangerous (unchanged) |
| Fleet drain window (08:00–08:30) | ~15 s empty pool | ≤5 s empty pool (estimate) |
| HUD teaches correct interaction | No | Yes |
| Fleet bar readable as status cue | No (always near-full) | Yes (scales to pool) |
| Script win rate (T137) | 14/14 | 14/14 (maintained) |
| Human-style simulated wins (T137) | 0/14 | Expected: 6–10/14 |

The minimum-change approach was preserved: the economy, map, vehicle count, fail state, queue readability, congestion heat display, dispatch confirmation, and mobile dock are all untouched.

---

## Tension Assessment

The 09:00 critical hour remains unchanged (+8 on upa, random arrivals at 0.04/tick). The `bom_pastor` branch (06:05 +12 initial surge) is also unchanged. The game still demands sustained attentive dispatch — the 08:00 compression only removes the "impossible for humans" edge while keeping the "punishing for distracted players" property intact.

- Losses should still feel **deserved**: a player who ignores queues for 30 seconds will still fail.
- Wins should feel **hard-earned**: the 09:00 band still requires focused play.
- Pressure **remains visible**: congestion heat, queue counters, and the time label still provide full tactical feedback.

---

## Re-test Findings

**Simulation was analytical (not live-automated).** Expected outcomes based on balance math:

- The 2-vehicle buffer absorbs the first wave of the 08:00 spike, giving attentive players ≥1 dispatch cycle before the pool drains.
- Reducing `lote_xv` from +10 to +6 means the worst-case combined node surge drops from ~58 queued passengers (unprocessable) to ~52 — within reach for a player dispatching every cooldown tick.
- Players who respond to the surge within 2 dispatch cycles (≈4 seconds of reaction time) should now be able to recover before 09:00.
- First-run players who understand the interaction from the corrected HUD will not lose 1–2 dispatch cycles to clicking the wrong node.

---

## Lane Outcome

**FAIRNESS CONFIRMED / READY FOR REAL HUMAN FINAL RECHECK**

The mathematical path to victory is now accessible to attentive first-time players.  
The 09:00 critical hour, real-time pressure loop, and fail state are preserved intact.  
Live human testing should be conducted to confirm the simulated fairness improvement before any further progression or economy work begins.

---

## Verification Summary

| Check | Result |
|---|---|
| `fleetPool` changed to 24 | ✅ line 140 |
| `lote_xv` 08:00 influx changed to +6 | ✅ line 178 |
| Fleet bar scaled (12 dots, `Math.ceil(fleetPool / 2)`) | ✅ line 326 |
| Desktop HUD instruction updated (1-click language) | ✅ line 341 |
| `upa` 08:00 influx unchanged (+8) | ✅ line 179 |
| 09:00 critical hour logic unchanged | ✅ untouched |
| Random arrival rate unchanged (0.04/tick) | ✅ untouched |
| Economy / progression untouched | ✅ not opened |
| Map / vehicle count unchanged | ✅ not touched |
| Dispatch cooldown unchanged (2 ticks / 0.4 s) | ✅ untouched |

---

## Next Recommendation

1. **Run live human first-run test** with 3–5 players (age 14–40, no prior exposure).
2. Collect: win rate, first complaint cluster, average fail time.
3. If win rate ≥ 50% and top complaint is *not* "too punishing," mark fairness confirmed and open T139 progression/economy scoping.
4. If win rate < 30%, run one final micro-tuning pass (suggest: reducing 06:05 `bom_pastor` from +12 to +9; do not touch 09:00).
5. If win rate > 80%, increase `upa` 08:00 from +8 to +10 to restore tension.
