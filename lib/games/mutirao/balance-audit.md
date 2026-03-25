# T76: Balance Audit Framework

**Purpose:** Verify game balance using telemetry data + observation.

---

## Balance Hypotheses to Test

1. **No dominant strategy** — Multiple paths to success
2. **"Obra" is meaningfully gated** — Not too easy, not too hard
3. **Talking/Mobilizing feels meaningful** — Not busywork
4. **Dengue pressure feels fair** — Predictable but challenging
5. **12-turn structure is appropriate** — Not too tight/loose
6. **Outcomes are well-distributed** — No result dominates

---

## Data Sources

| Metric | Source | Target |
|--------|--------|--------|
| Action diversity | Telemetry: actionFrequency | ≥3 action types commonly used |
| Obra timing | Telemetry: when "executar_obra" first used | Turn 4-7 (not turn 1-2) |
| Health risk spikes | Telemetry: healthRiskSpikes | < 50% of sessions |
| Result distribution | Telemetry: resultDistribution | Balanced across 5 states |
| Avg turns | Telemetry: avgTurnsReached | 9-12 turns |
| Completion rate | Telemetry: completionRate | 50-70% |
| Fail state frequency | Telemetry: failStateFrequency | 30-50% |

---

## Balance Audit Checklist

### 1. Strategy Diversity Test

**Question:** Is there more than one viable strategy?

**Evidence:**
- [ ] **Strategy A (Mobilize First):** talk → mobilize → obra
  - Evidence: Early "conversar" and "mobilizar" actions
  - Success rate for this path: ___%

- [ ] **Strategy B (Balanced):** Mix of all actions
  - Evidence: Diverse action sequence
  - Success rate: ___%

- [ ] **Strategy C (Crisis Response):** Prioritize mutirão when risk high
  - Evidence: Health risk spikes trigger "mutirao_limpeza"
  - Success rate: ___%

**Scoring:**
- **Balanced:** ≥2 strategies with ≥25% usage each
- **Concerning:** 1 strategy dominates (>60% usage)
- **Broken:** 1 strategy only viable path

**If Concerning/Broken:**
- Adjust action costs/effects
- Add trade-offs to dominant strategy
- Make alternatives more attractive

---

### 2. "Executar Obra" Gate Test

**Question:** Is obra appropriately difficult to start?

**Metrics:**
| Indicator | Target | Actual |
|-----------|--------|--------|
| First obra turn | 4-7 | ___ |
| Attempts blocked | Some early, few late | ___% |
| Players who never obra | < 30% | ___% |

**Scoring:**
- **Good:** Most players obra turn 4-7 after building confiança
- **Too Easy:** Players obra turn 1-2 (gate not working)
- **Too Hard:** Players can't obra by turn 8 (gate too strict)

**If Too Easy:**
- Increase confiança requirement
- Increase energia cost
- Add additional prerequisite

**If Too Hard:**
- Decrease confiança requirement
- Increase confiança gains from talk/mobilize
- Add alternative obra path

---

### 3. Conversation/Mobilization Meaningfulness

**Question:** Do talking and mobilizing feel impactful?

**Metrics:**
| Indicator | Target | Actual |
|-----------|--------|--------|
| "conversar" usage rate | ≥60% of sessions | ___% |
| "mobilizar" usage rate | ≥50% of sessions | ___% |
| Avg confiança at turn 6 | 40-70% | ___% |
| Players with <30% confiança at turn 6 | < 40% | ___% |

**Scoring:**
- **Meaningful:** Players use early, builds toward obra
- **Weak:** Used but no impact on progress
- **Ignored:** < 40% usage (players skip)

**If Weak/Ignored:**
- Increase confiança gains
- Make confiança decay faster (more pressure to maintain)
- Add visual feedback for confiança importance

---

### 4. Dengue Pressure Fairness

**Question:** Does dengue pressure feel fair and predictable?

**Metrics:**
| Indicator | Target | Actual |
|-----------|--------|--------|
| Health risk spike frequency | < 50% sessions spike | ___% |
| Dengue outbreak at turn 7 | Occurs as designed | ___% |
| Players surprised by outbreak | < 30% (should have warning) | ___% |
| Mutirao usage after warning | ≥60% respond | ___% |

**Scoring:**
- **Fair:** Warning at turn 6, outbreak at turn 7, preventable
- **Unpredictable:** No warning or sudden spikes
- **Punitive:** Outbreak unavoidable regardless of actions

**If Unpredictable/Punitive:**
- Strengthen turn 6 warning
- Give more time to respond
- Reduce outbreak severity
- Make mutirão more effective

---

### 5. Turn Structure Appropriateness

**Question:** Is 12-turn structure appropriate?

**Metrics:**
| Indicator | Target | Actual |
|-----------|--------|--------|
| Avg turns reached | 9-12 | ___ |
| Games ending turn < 6 | < 15% (fail fast) | ___% |
| Games ending turn > 10 | ≥40% (close finish) | ___% |
| Energy depletion moments | Some tension, not crippling | ___% |

**Scoring:**
- **Good:** Most games 9-12 turns, some tension
- **Too Short:** Many end < 6 turns (not enough time)
- **Too Long:** Most go 12 turns (no time pressure)

**If Too Short:**
- Increase starting energy
- Reduce early crisis severity
- Give more early turns

**If Too Long:**
- Increase crisis frequency
- Reduce energy regeneration
- Add mid-game pressure

---

### 6. Result Distribution Balance

**Question:** Are all 5 result states achievable?

**Target Distribution:**
| Result | Target % | Actual % |
|--------|----------|----------|
| Cuidado Floresceu (Triumph) | 10-15% | ___% |
| Bairro Respirou (Success) | 20-30% | ___% |
| Crise Contida (Neutral) | 20-30% | ___% |
| Mutirão Insuficiente (Struggle) | 15-25% | ___% |
| Abandono Venceu (Collapse) | 10-15% | ___% |

**Scoring:**
- **Balanced:** All 5 results achieved, min-max ratio ≥ 1:3
- **Skewed:** One result dominates (>40%)
- **Broken:** Only 2-3 results ever achieved

**If Skewed/Broken:**
- Adjust thresholds in balance.ts
- Review if certain strategies always lead to same result
- Add more outcome diversity

---

## Balance Audit Report Template

```markdown
# Balance Audit - Mutirão de Saneamento
**Date:** YYYY-MM-DD
**Sessions Analyzed:** N

## Summary
| Test | Result | Status |
|------|--------|--------|
| Strategy Diversity | [Findings] | [PASS/CONCERN/FAIL] |
| Obra Gate | [Findings] | [PASS/CONCERN/FAIL] |
| Talk/Mobilize Meaningful | [Findings] | [PASS/CONCERN/FAIL] |
| Dengue Fairness | [Findings] | [PASS/CONCERN/FAIL] |
| Turn Structure | [Findings] | [PASS/CONCERN/FAIL] |
| Result Distribution | [Findings] | [PASS/CONCERN/FAIL] |

**Overall Balance:** [HEALTHY / NEEDS TUNING / REQUIRES REWORK]

## Detailed Findings

### 1. Strategy Diversity
**Evidence:**
- Action frequency: [List from telemetry]
- Common sequences: [Observed patterns]

**Finding:** [Analysis]

**Recommendation:** [If needed]

### 2. Obra Gate
**Evidence:**
- Avg first obra turn: [Number]
- Block rate: [Number]

**Finding:** [Analysis]

**Recommendation:** [If needed]

### 3. Talk/Mobilize Meaningfulness
...

### 4. Dengue Fairness
...

### 5. Turn Structure
...

### 6. Result Distribution
**Evidence:**
[Distribution table]

**Finding:** [Analysis]

**Recommendation:** [If needed]

## Recommended Tuning Changes

### If Minor Tuning Needed
```typescript
// In balance.ts:
const BALANCE_ENERGY_COSTS = {
  conversar: 1,      // Change to: ?
  mobilizar: 4,      // Change to: ?
  executarObra: 12, // Change to: ?
  mutiraoLimpeza: 6, // Change to: ?
};
```

### If Major Rework Needed
- [List structural changes]

## Re-test Criteria
Re-run audit after tuning when:
- All tests ≥ CONCERN level
- Result distribution balanced
- No dominant strategy
```

---

## Quick Balance Metrics Reference

### From TelemetryReview Component
| Metric | Good Range | Warning | Danger |
|--------|------------|---------|--------|
| completionRate | 50-70% | 40-50% or 70-80% | < 40% or > 80% |
| exitBeforeCompletionRate | < 30% | 30-50% | > 50% |
| avgTurnsReached | 9-12 | 7-9 or 12+ | < 7 |
| replayRate | ≥ 30% | 20-30% | < 20% |
| healthRiskSpikes | < 50% | 50-70% | > 70% |
| energyDepletionFrequency | 20-40% | 40-60% | > 60% |

---

*Balance Audit Framework — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
