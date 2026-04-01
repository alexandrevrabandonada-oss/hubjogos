# T139 — Frota Popular Live Human Fairness Recheck
## Playtest Protocol (Build T138)

**Goal:** Confirm whether attentive first-time players can win fairly, or identify the remaining blocker.  
**Build:** T138 — 24 vehicles, 08:00 lote_xv +6, 1-click dispatch, scaled fleet bar.  
**URL:** `/games/frota-popular-spike`

---

## Tester Requirements

| Requirement | Target |
|---|---|
| Sample size | 3–5 players minimum |
| Prior exposure | Zero — first-run only |
| Skill mix | At least one non-gamer, one casual gamer |
| Device mix | At least one mobile, one desktop |
| Language | Portuguese preferred; any if unavailable |

Do **not** explain the game before or during the session. Let the HUD teach.

---

## Session Procedure

### Before the session
1. Open `/games/frota-popular-spike` on the test device.
2. Do not scroll, point, or explain anything.
3. Start a stopwatch (or note the system clock).

### During the session
1. Say only: **"É um jogo. Tente vencer."** ("It's a game. Try to win.")
2. Observe silently. Note:
   - Did they click a community node within the first 10 seconds?
   - Did they ever try to click the station (hub) looking for a second step?
   - Did they narrate confusion or frustration during 08:00–09:00?
   - Did losses feel met with "okay, I see what happened" or "that was unfair"?
3. Do not intervene or hint.

### At the end of the session (result screen shown)
1. Ask the tester to click **"Copiar dados da sessão"** and paste the JSON into a shared doc or message.
2. Ask 3 quick questions (30 seconds max):
   - *"O que aconteceu às 08:00?"* — Did they notice the surge?
   - *"Você entendeu como despachar desde o início?"* — Did 1-click make sense immediately?
   - *"A derrota/vitória pareceu justa?"* — Did the outcome feel earned?
3. Note answers in the log table below.

---

## Data Log Template

Copy this table once per session:

```
| Field                     | Value |
|---------------------------|-------|
| Tester ID (anonymous)     |       |
| Device                    | mobile / desktop |
| Outcome                   | won / failed |
| totalDispatches           |       |
| firstDispatchOffsetSeconds|       |
| drainEvents               |       |
| drainDuring0800Band       | true / false |
| sessionDurationSeconds    |       |
| Noticed 08:00 surge?      | yes / no / partial |
| Understood 1-click immediately? | yes / no |
| Outcome felt fair?        | yes / no / unsure |
| Top verbal complaint      |       |
```

The JSON from the "Copiar dados da sessão" button fills most numeric fields automatically.

---

## Fairness Thresholds

Use these to select the outcome lane after all sessions:

| Metric | CONFIRMED | STILL TOO HARD | OVERCORRECTED |
|---|---|---|---|
| First-run win rate | ≥ 40% | < 25% | > 80% |
| `drainDuring0800Band` frequency | ≤ 40% of sessions | > 70% of sessions | — |
| "That was unfair" responses | < 30% | > 60% | — |
| "Too easy / boring" responses | — | — | > 40% |
| Players who understood 1-click immediately | ≥ 80% | — | — |

---

## Outcome Lanes

After collecting all sessions, pick exactly one:

- **FAIRNESS CONFIRMED / READY FOR T140 ECONOMY SCOPING**
  → Win rate ≥ 40%, losses considered deserved, tension reported as real.

- **STILL TOO HARD / NEED ONE LAST MICRO-TUNING PASS**
  → Win rate < 25%, `drainDuring0800Band` in majority of loss sessions.
  → Suggested next lever: reduce 06:05 `bom_pastor` from +12 to +9.

- **OVERCORRECTED / NEED TENSION RESTORE**
  → Win rate > 80%, "too easy" dominates feedback.
  → Suggested next lever: increase `upa` 08:00 from +8 to +10.

---

## After the Protocol

Fill in `reports/T139-Frota-Popular-Live-Human-Fairness-Recheck.md` with:
- The filled data log table (one row per session)
- Chosen outcome lane with justification
- Exact next recommendation

The report shell is ready to receive real data as soon as sessions are complete.
