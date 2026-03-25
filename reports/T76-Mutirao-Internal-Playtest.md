# T76: Mutirão de Saneamento — Internal Playtest Sprint + Go/No-Go Review

**Status:** Playtest System Ready — Awaiting Execution  
**Date:** 24 de Março de 2026  
**Prepared for:** Internal Validation Sprint

---

## Executive Summary

T76 delivers a complete internal playtest infrastructure for validating Mutirão de Saneamento's beta readiness. The system is **prepared for execution** but playtests have not yet been run.

**Current Status:**
- ✅ All playtest infrastructure built
- ✅ All audit frameworks defined
- ✅ Decision criteria established
- ⬜ Playtest sessions pending
- ⬜ Data collection pending
- ⬜ Go/No-Go decision pending

---

## What T76 Delivered

### 1. Internal Playtest Plan
**File:** `lib/games/mutirao/playtest-plan.md`

**Contents:**
- Tester sample requirements (7-10 testers, mixed profiles)
- Device/browser coverage matrix
- Session formats (observed, self-guided, mobile-focused)
- Data capture requirements
- Blocking vs non-blocking issue definitions
- Success criteria for beta
- 5-day sprint schedule

**Key Numbers:**
- Minimum 5 testers for validation
- 2+ mobile devices required
- 2+ desktop browsers required
- 1 think-aloud session required

---

### 2. Playtest Runbook
**File:** `lib/games/mutirao/playtest-runbook.md`

**Contents:**
- Pre-session setup checklist (reset state, confirm telemetry)
- Operator script for tester briefing
- During-session observation guidelines
- Post-session data export procedures
- Emergency procedures (bugs, crashes, confusion)
- Quick reference card for operators

**Usage:**
Each playtest operator follows this checklist to ensure consistent data collection.

---

### 3. Telemetry Review Component
**File:** `components/games/mutirao/TelemetryReview.tsx`

**Features:**
- Real-time metrics dashboard
- Result distribution visualization
- Action frequency analysis
- Beta readiness signals
- Data export functionality

**Metrics Displayed:**
- Completion rate (target: ≥ 60%)
- Exit before completion (target: ≤ 30%)
- Avg turns reached (target: 9-12)
- Replay rate (target: ≥ 30%)
- Share rate (target: ≥ 10%)
- Health risk spikes
- Energy depletion frequency
- Action frequency breakdown

**Extended Telemetry:**
**File:** `lib/games/mutirao/telemetry.ts` (updated)

Added T76 metrics:
- `completionRate: number`
- `avgTurnsReached: number`
- `actionFrequency: Record<string, number>`
- `healthRiskSpikes: number`
- `energyDepletionFrequency: number`

---

### 4. Qualitative Feedback Clustering System
**File:** `lib/games/mutirao/feedback-clustering.md`

**8 Feedback Categories Defined:**
1. Confusion about priorities
2. Confusion about actor roles
3. Unclear consequences
4. Mobile control problems
5. Pacing problems
6. Weak territorial feeling
7. Weak political clarity
8. Low desire to replay/share

Each category includes:
- What to look for (example quotes)
- Severity thresholds (% of testers)
- Recommended actions
- Triage criteria (P0/P1/P2)

---

### 5. Core Comprehension Audit
**File:** `lib/games/mutirao/comprehension-audit.md`

**The 6 Core Questions:**
1. What am I trying to do?
2. What do the main resources mean?
3. Why did I win or lose?
4. Why are some actions blocked?
5. What changed after each turn?
6. What should I prioritize?

**Scoring:**
- Strong: ≥ 70% demonstrate understanding
- Acceptable: 50-70%
- Weak: < 50%

**Verbal Cues Reference:**
Lists "understanding cues" (good) vs "confusion cues" (bad) for quick assessment.

---

### 6. Balance Audit Framework
**File:** `lib/games/mutirao/balance-audit.md`

**6 Balance Tests:**
1. Strategy diversity (≥ 2 viable strategies)
2. "Executar Obra" gate (turn 4-7 typical)
3. Talk/mobilize meaningfulness (confiança builds)
4. Dengue pressure fairness (warning before outbreak)
5. 12-turn structure appropriateness
6. Result distribution balance (all 5 states achievable)

**Target Distribution:**
- Triumph: 10-15%
- Success: 20-30%
- Neutral: 20-30%
- Struggle: 15-25%
- Collapse: 10-15%

---

### 7. Mobile Reality Audit
**File:** `lib/games/mutirao/mobile-audit.md`

**8 Mobile Tests:**
1. Touch comfort (target: < 5% error rate)
2. Readability (target: ≥ 14px, good contrast)
3. Layout & responsiveness (test 320px-768px)
4. Performance (target: ≥ 30fps)
5. Thumb zone accessibility
6. Scroll vs. interaction conflicts
7. Input responsiveness
8. Battery & heat

**Minimum Devices:**
- Moto G Power (Android mid-range)
- iPhone SE (iOS entry-level)

---

### 8. Issue Severity Triage
**File:** `lib/games/mutirao/issue-triage.md`

**4 Severity Levels:**
- **P0** — BLOCKS BETA (must fix)
- **P1** — SERIOUS (fix before or during beta)
- **P2** — POLISH (fix during beta)
- **P3** — FUTURE (post-beta)

**Decision Tree:**
Provides step-by-step triage logic.

**Go/No-Go Rules:**
- GO if: Zero P0 issues
- NO-GO if: Any unassigned P0, or > 3 P1 without fix plan
- CONDITIONAL if: 1-2 P1 accepted for "fix during beta"

---

### 9. Beta Decision Framework
**File:** `lib/games/mutirao/beta-decision-framework.md`

**Three Possible Decisions:**
1. **GO TO CLOSED BETA** — Ready for external testing
2. **DO ONE MORE HARDENING PASS** — 3-7 days of fixes
3. **REWORK CORE LOOP** — 2-4 weeks of changes

**Decision Matrix:**
6 weighted factors:
- Completion rate (20%)
- Mobile functionality (20%)
- Comprehension (20%)
- Balance (15%)
- Replay intent (15%)
- Issue severity (10%)

**Thresholds:**
- ≥ 7.5: GO
- 5.0-7.4: HARDENING
- < 5.0: REWORK

---

## File Summary

### New Files Created (T76)
| File | Lines | Purpose |
|------|-------|---------|
| `lib/games/mutirao/playtest-plan.md` | ~250 | Playtest planning |
| `lib/games/mutirao/playtest-runbook.md` | ~200 | Operator procedures |
| `components/games/mutirao/TelemetryReview.tsx` | ~350 | Metrics dashboard |
| `components/games/mutirao/TelemetryReview.module.css` | ~250 | Dashboard styles |
| `lib/games/mutirao/feedback-clustering.md` | ~250 | Feedback categorization |
| `lib/games/mutirao/comprehension-audit.md` | ~200 | Understanding validation |
| `lib/games/mutirao/balance-audit.md` | ~250 | Balance validation |
| `lib/games/mutirao/mobile-audit.md` | ~300 | Mobile validation |
| `lib/games/mutirao/issue-triage.md` | ~200 | Severity classification |
| `lib/games/mutirao/beta-decision-framework.md` | ~250 | Decision methodology |
| `reports/T76-Mutirao-Internal-Playtest.md` | ~400 | This report |

### Modified Files (T76)
| File | Changes |
|------|---------|
| `lib/games/mutirao/telemetry.ts` | Added T76 metrics |

**Total T76:** ~2,900 lines of documentation + component code

---

## How to Execute the Playtest Sprint

### Pre-Sprint (Day 1)
1. Recruit 7-10 testers per profile requirements
2. Prepare test devices (Moto G, iPhone SE)
3. Brief operators on runbook
4. Clear previous telemetry data
5. Deploy game to test environment

### Sprint Execution (Days 2-3)
1. Run sessions per playtest-plan.md
2. Operators follow runbook.md
3. Export telemetry after each batch
4. Record observation notes
5. Collect feedback forms

### Analysis (Day 4)
1. Review TelemetryReview dashboard
2. Cluster feedback using feedback-clustering.md
3. Run comprehension, balance, mobile audits
4. Triage all issues
5. Calculate decision scores

### Decision (Day 5)
1. Convene decision meeting
2. Apply beta-decision-framework.md
3. Document decision
4. Assign next actions
5. Schedule follow-up

---

## Expected Outputs After Playtest

### Data Files
```
data/
├── sessions/
│   ├── 2026-03-25-tester-01.json
│   ├── 2026-03-25-tester-02.json
│   └── ...
├── feedback/
│   ├── 2026-03-25-tester-01.json
│   └── ...
└── observations/
    ├── 2026-03-25-tester-01.md
    └── ...
```

### Analysis Reports
```markdown
reports/
├── t76-playtest/
│   ├── telemetry-summary.md
│   ├── feedback-analysis.md
│   ├── comprehension-audit-results.md
│   ├── balance-audit-results.md
│   ├── mobile-audit-results.md
│   ├── issue-triage.md
│   └── beta-decision.md
```

---

## Risk Assessment

### Low Risk (Preparation Complete)
- All infrastructure built
- All frameworks documented
- Telemetry operational

### Medium Risk (Execution)
- Tester recruitment delays
- Device availability
- Schedule compression

### High Risk (If Found During Playtest)
- P0 issues requiring structural changes
- Mobile fundamentally broken
- < 40% completion rate

**Mitigation:**
- Build buffer into schedule
- Have backup testers
- Define clear NO-GO criteria

---

## Success Criteria for T76 Sprint

### Sprint Completion (Process)
- [ ] 5+ playtest sessions completed
- [ ] All sessions documented
- [ ] All audits completed
- [ ] Decision meeting held
- [ ] Decision documented

### Beta Readiness (Outcome)
**If GO:**
- [ ] Decision: GO TO CLOSED BETA
- [ ] Beta parameters defined
- [ ] Known issues list accepted
- [ ] Beta launch scheduled

**If HARDENING:**
- [ ] Decision: DO ONE MORE HARDENING PASS
- [ ] Required fixes identified
- [ ] Owners assigned
- [ ] Re-test scheduled

**If REWORK:**
- [ ] Decision: REWORK CORE LOOP
- [ ] Core issues identified
- [ ] Change plan approved
- [ ] New timeline set

---

## Next Steps (Immediate)

### For Project Manager
1. Review this report
2. Approve playtest budget/resources
3. Recruit testers
4. Schedule 5-day sprint

### For Tech Lead
1. Verify test environment ready
2. Confirm telemetry working
3. Prepare test devices
4. Train operators

### For Design Lead
1. Review audit frameworks
2. Prepare to observe sessions
3. Plan for quick-turn fixes if needed

---

## Appendix: Quick Links

### Playtest Operation
- Playtest Plan: `lib/games/mutirao/playtest-plan.md`
- Runbook: `lib/games/mutirao/playtest-runbook.md`

### Analysis Tools
- Telemetry Dashboard: `components/games/mutirao/TelemetryReview.tsx`
- Feedback Form: `components/games/mutirao/FeedbackForm.tsx`

### Audit Frameworks
- Feedback Clustering: `lib/games/mutirao/feedback-clustering.md`
- Comprehension Audit: `lib/games/mutirao/comprehension-audit.md`
- Balance Audit: `lib/games/mutirao/balance-audit.md`
- Mobile Audit: `lib/games/mutirao/mobile-audit.md`

### Decision Tools
- Issue Triage: `lib/games/mutirao/issue-triage.md`
- Beta Decision: `lib/games/mutirao/beta-decision-framework.md`

---

*This report documents the complete T76 playtest infrastructure. The system is ready for execution pending team availability and tester recruitment.*

---

*T76 — Mutirão de Saneamento Internal Playtest Sprint*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Desenvolvedor: Cascade AI*  
*Data: 24 de Março de 2026*
