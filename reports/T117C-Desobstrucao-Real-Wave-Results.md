# T117C — Desobstrução Real Human Validation Wave Results

Date: March 30, 2026
Build: T116 + T117 + T117A + T117B telemetry fix
Scope: Real human validation wave execution and T118 go/no-go

## Diagnosis

T117B completed the telemetry correction for primer attempts (`touchstart`-based discrete attempts + `completedOnFirstAttempt`).

For T117C, the required step was real human execution (12–18 players with quota constraints) and gate calculation.

Hard evidence available in this workspace:
- `.local-data/events.json`: 670 events
- `.local-data/sessions.json`: 330 sessions
- No Desobstrução/T117 telemetry events found:
  - `desobstrucao_primer_complete`
  - `desobstrucao_phase_transition`
  - `desobstrucao_session_complete`
  - `desobstrucao_feedback`

Conclusion: the real human wave was not executed in this workspace dataset. Therefore, no valid gate computation can be made yet.

## Files to create/change

Created:
- `reports/T117C-Desobstrucao-Real-Wave-Results.md`

No gameplay files changed in T117C.

## Real-wave findings

### Tester mix

Required:
- 12–18 total players
- >=6 compact-screen mobile
- >=3 Android
- >=3 desktop
- >=4 casual/low-context
- >=2 returning T115 players

Observed in available T117C dataset for Desobstrução:
- Total Desobstrução sessions: 0
- Compact-screen subgroup: 0
- Android subgroup: 0
- Desktop subgroup: 0
- Casual/low-context subgroup: 0
- Returning T115 subgroup: 0

### Primer metrics

Required gate:
- `completedOnFirstAttempt >= 70%` on compact-screen subgroup

Observed:
- No `desobstrucao_primer_complete` events in dataset
- Gate cannot be computed

### Steel distinctiveness

Required gate:
- `steel_distinct` in >=8/12 sessions

Observed:
- No `desobstrucao_feedback` events/chips in dataset
- Gate cannot be computed

### Toy factor vs T115 baseline

Required gates:
- satisfaction median >= T115 median
- `felt_too_long <= 25%`

Observed:
- No Desobstrução satisfaction/chip telemetry in dataset
- Gates cannot be computed

## Final outcome

NEEDS ONE TARGETED PATCH BEFORE T118

Reason:
- The required human evidence does not exist yet; go/no-go for T118 cannot be honestly promoted to READY.
- Gameplay and telemetry are ready; missing piece is operational execution of the real wave with quota-compliant participants.

Exact next recommendation:
1. Execute the real 12–18 player wave on current build (no gameplay changes).
2. Ensure quotas are met exactly.
3. Collect telemetry + chips from live sessions.
4. Recompute the 3 gates:
   - Primer: compact-screen `completedOnFirstAttempt >= 70%`
   - Depth: `steel_distinct >= 8/12`
   - Toy factor: satisfaction median >= T115 median and `felt_too_long <= 25%`
5. Reissue final T118 decision immediately from that dataset.

## Verification summary

- T117B telemetry patch is present (discrete attempts + `completedOnFirstAttempt`): confirmed in code.
- TypeScript status from prior run: pass (`EXIT:0`).
- T116 proof spec status from prior run: pass (4/4).
- T117C real-wave evidence in local dataset: absent (no Desobstrução validation events).
