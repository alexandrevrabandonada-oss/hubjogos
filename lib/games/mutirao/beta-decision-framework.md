# T76: Beta Decision Framework

**Purpose:** Produce a clear, evidence-based go/no-go decision for beta.

---

## The Three Possible Decisions

### 1. GO TO CLOSED BETA
**When:** Game is stable, understandable, balanced, and mobile-viable.

**Evidence Required:**
- Zero P0 issues
- Completion rate ≥ 60%
- Mobile functional on tested devices
- ≥ 2 viable strategies observed
- Players understand why they won/lost
- ≥ 30% would replay

---

### 2. DO ONE MORE HARDENING PASS
**When:** Game is close but needs specific fixes before beta-ready.

**Evidence:**
- 1-3 P1 issues identified
- Completion rate 40-60%
- Mobile works but has friction
- Minor balance skew
- Some confusion but not blocking

**Timeline:** 3-7 days for fixes + re-test

---

### 3. REWORK CORE LOOP BEFORE BETA
**When:** Fundamental issues with gameplay loop.

**Evidence:**
- P0 issues requiring structural changes
- Completion rate < 40%
- Mobile fundamentally broken
- Single dominant strategy
- Players consistently don't understand
- < 20% would replay

**Timeline:** 2-4 weeks for core changes + full re-test

---

## Decision Matrix

| Factor | GO | HARDENING | REWORK |
|--------|----|-----------|--------|
| **P0 Issues** | 0 | 0 | > 0 or fundamental |
| **Completion Rate** | ≥ 60% | 40-60% | < 40% |
| **Mobile Status** | Good | Acceptable | Poor |
| **Strategies** | ≥ 2 viable | 2, but one preferred | 1 only |
| **Comprehension** | ≥ 70% understand | 50-70% | < 50% |
| **Replay Intent** | ≥ 30% | 20-30% | < 20% |
| **Time to Fix** | — | 3-7 days | 2-4 weeks |

---

## Decision Process

### Step 1: Compile Evidence
Review all audit documents:
- [ ] Telemetry summary (`TelemetryReview` data)
- [ ] Comprehension audit scores
- [ ] Balance audit findings
- [ ] Mobile audit results
- [ ] Issue triage list

### Step 2: Score Each Factor
| Factor | Score | Weight |
|--------|-------|--------|
| Completion Rate | [0-10] | 20% |
| Mobile Functionality | [0-10] | 20% |
| Comprehension | [0-10] | 20% |
| Balance | [0-10] | 15% |
| Replay Intent | [0-10] | 15% |
| Issue Severity | [0-10] | 10% |

**Weighted Score Calculation:**
```
Total = (Completion × 0.20) + (Mobile × 0.20) + (Comprehension × 0.20) + 
        (Balance × 0.15) + (Replay × 0.15) + (Issues × 0.10)
```

### Step 3: Apply Thresholds
| Score Range | Decision |
|-------------|----------|
| ≥ 7.5 | GO TO CLOSED BETA |
| 5.0 - 7.4 | DO ONE MORE HARDENING PASS |
| < 5.0 | REWORK CORE LOOP |

### Step 4: Override Conditions
Even with good score, REWORK if:
- [ ] Completion rate < 40%
- [ ] Mobile unplayable
- [ ] Fundamental comprehension failure

Even with lower score, GO if:
- [ ] Issues are P2/P3 only
- [ ] Beta can be "soft launch" with known issues
- [ ] Team accepts "fix during beta" plan

---

## Decision Documentation Template

```markdownn# Beta Decision - Mutirão de Saneamento
**Date:** YYYY-MM-DD
**Decision Owner:** [Name]
**Reviewers:** [Names]

## Executive Summary
**DECISION:** [GO TO CLOSED BETA / HARDENING PASS / REWORK CORE LOOP]

**Rationale:** [One paragraph summary]

---

## Evidence Summary

### Quantitative Data
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Sessions | N | — | — |
| Completion Rate | X% | ≥ 60% | [✓/✗] |
| Avg Turns | X | 9-12 | [✓/✗] |
| Replay Rate | X% | ≥ 30% | [✓/✗] |
| Share Rate | X% | ≥ 10% | [✓/✗] |
| Mobile Completion | X% | ≥ 50% | [✓/✗] |

### Qualitative Data
| Question | Yes % | Target | Status |
|----------|-------|--------|--------|
| Understood outcome? | X% | ≥ 70% | [✓/✗] |
| Territory felt real? | X% | ≥ 60% | [✓/✗] |
| Would replay? | X% | ≥ 30% | [✓/✗] |

### Audit Results
| Audit | Score | Status |
|-------|-------|--------|
| Comprehension | X/10 | [Strong/Acceptable/Weak] |
| Balance | X/10 | [Healthy/Needs Tuning/Rework] |
| Mobile | X/10 | [Ready/Needs Work/Not Ready] |

### Issues
| Severity | Count | Status |
|----------|-------|--------|
| P0 | N | [Resolved / X open] |
| P1 | N | [N fixed / N to fix / N during beta] |
| P2 | N | [Beta polish] |

---

## Decision Factors

### Factor 1: Completion Rate
**Score:** [0-10]
**Evidence:** [Telemetry data]
**Assessment:** [Analysis]

### Factor 2: Mobile Functionality
**Score:** [0-10]
**Evidence:** [Mobile audit]
**Assessment:** [Analysis]

### Factor 3: Comprehension
**Score:** [0-10]
**Evidence:** [Comprehension audit]
**Assessment:** [Analysis]

### Factor 4: Balance
**Score:** [0-10]
**Evidence:** [Balance audit]
**Assessment:** [Analysis]

### Factor 5: Replay Intent
**Score:** [0-10]
**Evidence:** [Feedback form]
**Assessment:** [Analysis]

### Factor 6: Issue Severity
**Score:** [0-10]
**Evidence:** [Triage list]
**Assessment:** [Analysis]

---

## Weighted Score
| Factor | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Completion | X | 20% | X |
| Mobile | X | 20% | X |
| Comprehension | X | 20% | X |
| Balance | X | 15% | X |
| Replay | X | 15% | X |
| Issues | X | 10% | X |
| **TOTAL** | — | 100% | **X.X** |

---

## Decision Justification

### Why This Decision?
[Detailed explanation]

### What Would Change Our Minds?
[Conditions for different decision]

### Confidence Level
- [ ] High (strong evidence, clear metrics)
- [ ] Medium (some ambiguity, acceptable risk)
- [ ] Low (significant uncertainty)

---

## If GO TO CLOSED BETA

### Beta Parameters
| Parameter | Value |
|-----------|-------|
| Beta Type | [Closed / Friends & Family / Limited] |
| Target Users | N |
| Duration | X weeks |
| Known Issues Accepted | [List P1 issues OK to fix during beta] |

### Success Metrics for Beta
- [ ] Completion rate ≥ 65%
- [ ] Exit rate ≤ 25%
- [ ] Replay rate ≥ 35%
- [ ] No P0 bugs reported

---

## If HARDENING PASS

### Required Fixes
| Issue | Severity | Owner | ETA |
|-------|----------|-------|-----|
| [Issue] | [P1] | [Name] | [Date] |

### Re-test Criteria
- [ ] All listed issues resolved
- [ ] Quick validation playtest (3-5 sessions)
- [ ] Metrics meet GO thresholds

### New Target Date
[Date]

---

## If REWORK CORE LOOP

### Core Issues Identified
1. [Issue with evidence]
2. [Issue with evidence]

### Proposed Changes
1. [Change description]
2. [Change description]

### Timeline
- Design: X days
- Implementation: X days
- Re-test: X days
- **Total:** X weeks

### New Beta Target
[Date]

---

## Appendix
- [Link to telemetry data]
- [Link to observation notes]
- [Link to feedback analysis]
- [Link to audit reports]
```

---

## Decision Meeting Agenda

### 1. Review Evidence (20 min)
- Telemetry summary (5 min)
- Comprehension audit (5 min)
- Balance audit (5 min)
- Mobile audit (5 min)

### 2. Discuss Issues (15 min)
- P0 issues (if any)
- P1 issues and fix plan
- Accepted risks

### 3. Score and Decide (15 min)
- Score each factor
- Calculate weighted score
- Make decision

### 4. Document Next Steps (10 min)
- Assign action items
- Set dates
- Schedule follow-up

---

*Beta Decision Framework — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
