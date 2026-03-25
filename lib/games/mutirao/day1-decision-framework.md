# Day 1 Operational Decision Framework

**Purpose:** Structured decision-making after first 3 sessions  
**Decision Type:** Operational (continue/pause), NOT beta decision  
**Decision Owner:** Sprint Coordinator / Project Lead  
**Input Required:** Evidence snapshot + feedback clustering + issue triage

---

## Decision Context

**This is NOT the final beta decision.**  
This is a tactical decision about whether to continue the sprint as planned.

### Three Valid Decisions

| Decision | Meaning | When to Choose |
|----------|---------|----------------|
| **CONTINUE SPRINT AS PLANNED** | No changes needed. Proceed with Days 2-5 as scheduled. | 0 P0 issues, P1 manageable, no data validity threats |
| **CONTINUE WITH MINOR FIXES** | Small fixes needed (< 4 hours). Apply fixes, then continue. | 1-2 quick P0/P1 fixes needed, fixes won't invalidate data |
| **PAUSE SPRINT AND FIX BLOCKERS** | Serious issues require work stoppage. Fix, then restart. | P0 unfixable, data invalid, player safety concern |

**Invalid decisions:**
- ❌ "Maybe continue" (must be decisive)
- ❌ "Let's see how tomorrow goes" (must have plan)
- ❌ "Fix everything first" (scope creep, violates sprint lock)

---

## Decision Matrix

### Score Your Current State

| Factor | Status | Score | Weight | Weighted |
|--------|--------|-------|--------|----------|
| **P0 Issues** | ☐ 0 (10) ☐ 1-2 fixable (5) ☐ 1+ unfixable (0) | | ×3 | |
| **P1 Issues** | ☐ Manageable (10) ☐ Concerning (5) ☐ Critical (0) | | ×2 | |
| **Data Quality** | ☐ Complete (10) ☐ Some gaps (5) ☐ Compromised (0) | | ×3 | |
| **Completion Rate** | ☐ ≥ 60% (10) ☐ 40-59% (5) ☐ < 40% (0) | | ×2 | |
| **Mobile Valid** | ☐ Yes (10) ☐ Partial (5) ☐ No (0) | | ×2 | |
| **Tester Safety** | ☐ No issues (10) ☐ Minor (5) ☐ Concerns (0) | | ×3 | |

**Total Possible:** 150  
**Your Score:** ___

---

### Decision Thresholds

| Score Range | Recommended Decision |
|-------------|---------------------|
| 120-150 | CONTINUE SPRINT AS PLANNED |
| 90-119 | CONTINUE WITH MINOR FIXES |
| 0-89 | PAUSE SPRINT AND FIX BLOCKERS |

---

## Decision Pathways

### Pathway A: Continue Sprint As Planned

**Prerequisites (ALL must be true):**
- [ ] Zero P0 issues found
- [ ] All P1 issues have workarounds
- [ ] Data capture is complete and valid
- [ ] Completion rate ≥ 40% (acceptable for 3 sessions)
- [ ] At least 1 mobile session completed
- [ ] No tester safety concerns

**Rationale Template:**
```
Day 1 completed 3 sessions with [X]% completion rate. 
Zero P0 issues found. [Y] P1 issues identified but manageable.
Mobile validation successful on [device].
Data capture complete for all sessions.
Proceeding with Days 2-5 as scheduled.
```

**Next Actions:**
1. Schedule sessions 4-5 (Day 2)
2. Schedule sessions 6-7 (Day 3)
3. Prepare for session 8 (Day 4)
4. Plan Day 5 decision meeting

**Risk level:** Low

---

### Pathway B: Continue With Minor Fixes

**Prerequisites (MUST have):**
- [ ] 1-2 P0 or serious P1 issues found
- [ ] Fixes estimated at < 4 hours total
- [ ] Fixes can be applied without invalidating Day 1 data
- [ ] SPRINT-LOCK allows these fixes (bug/ops/copy only)

**Rationale Template:**
```
Day 1 identified [X] issues requiring quick fixes:
1. [Issue] - [fix approach] - [time estimate]
2. [Issue] - [fix approach] - [time estimate]

Total fix time: [Y] hours.
Applying fixes [today/tomorrow morning].
Resuming sprint with Sessions 4-5 on [date].
Day 1 data remains valid.
```

**Fix Planning:**
| Issue | Fix Approach | Time | Owner | SPRINT-LOCK OK? |
|-------|--------------|------|-------|-----------------|
| | | | | ☐ Yes |
| | | | | ☐ Yes |

**Fix Window:**
- Start: ____________
- End: ____________
- Sessions resume: Day ___

**Validation after fixes:**
- [ ] Quick Session Zero re-run
- [ ] Confirm fixes work
- [ ] Verify no regressions

**Risk level:** Low-Medium

---

### Pathway C: Pause Sprint and Fix Blockers

**Triggers (ANY of these):**
- [ ] Unfixable P0 issue discovered
- [ ] Data capture fundamentally broken
- [ ] Player safety concern
- [ ] Completion rate 0% (complete failure)
- [ ] Major scope creep required (violates sprint lock)

**Rationale Template:**
```
Day 1 revealed critical blocker:
[Describe blocker and its impact]

Cannot continue sprint without fixing.
Estimated fix time: [X] days.
New Day 1 target: [date].

Day 1 sessions may need to be discarded:
[Explain which data is compromised and why]
```

**Blocker Details:**
```

```

**Fix Plan:**
1. _________________________ (___ hours/days)
2. _________________________ (___ hours/days)
3. _________________________ (___ hours/days)

**Total fix duration:** ___ days  
**New sprint start:** ___

**Data disposition:**
- [ ] Day 1 sessions valid (can keep)
- [ ] Day 1 sessions invalid (must discard)
- [ ] Partial validity (explain): 

**Risk level:** High

---

## Decision Documentation

### Decision Record

**Decision:** ☐ CONTINUE ☐ CONTINUE WITH FIXES ☐ PAUSE

**Score:** ___/150

**Rationale (one paragraph):**
```

```

**Decision owner:** _______________  
**Date:** _______________  
**Time:** _______________

**Consulted:**
- [ ] Sprint team
- [ ] Technical lead
- [ ] Project lead
- [ ] Other: _______________

**Approved by:** _______________

---

## Implementation Plan

### If Continuing (Path A or B)

**Days 2-5 Schedule:**
| Day | Sessions | Focus | Tester Profile |
|-----|----------|-------|----------------|
| 2 | 4-5 | | |
| 3 | 6-7 | | |
| 4 | 8 | | |
| 5 | Analysis | Decision meeting | — |

**Resource needs:**
- [ ] Testers scheduled
- [ ] Devices available
- [ ] Operator time blocked
- [ ] Analysis time allocated

**Check-ins:**
- Daily standup at: _______________
- End-of-day export at: _______________

---

### If Pausing (Path C)

**Fix Timeline:**
| Day | Activity | Owner | Deliverable |
|-----|----------|-------|-------------|
| | | | |
| | | | |
| | | | |

**Sprint Resumption Criteria:**
- [ ] Blocker fixed and verified
- [ ] Session Zero re-run passes
- [ ] New Day 1 scheduled
- [ ] Testers reconfirmed

---

## Communication

### Who to Notify

**If CONTINUE:**
- [ ] Sprint team: "Proceeding as planned"
- [ ] Testers: Confirm Day 2+ schedules
- [ ] Stakeholders: Day 1 complete, on track

**If CONTINUE WITH FIXES:**
- [ ] Sprint team: "Brief pause for fixes, resume [date]"
- [ ] Testers: Reschedule Day 2+ sessions
- [ ] Stakeholders: Day 1 issues identified, resolving

**If PAUSE:**
- [ ] Sprint team: "Sprint paused, fixing blockers"
- [ ] Testers: Hold on scheduling, will reschedule
- [ ] Stakeholders: Day 1 revealed critical issues, addressing
- [ ] Project lead: Escalate immediately

---

## Validation Check

Before finalizing decision, verify:

- [ ] All 3 sessions reviewed
- [ ] Evidence exported and backed up
- [ ] Feedback clustered
- [ ] Issues triaged
- [ ] SPRINT-LOCK consulted
- [ ] Decision matrix scored
- [ ] Implementation plan ready
- [ ] Team consulted
- [ ] Documentation complete

**If any unchecked:** Cannot finalize decision yet.

---

## Post-Decision Review

**After Days 2-5, review this decision:**

| Question | Answer |
|----------|--------|
| Was this decision correct? | ☐ Yes ☐ No ☐ Partial |
| If incorrect, what changed? | |
| What would we do differently? | |

**Lessons learned:**
```

```

---

**Framework version:** T79 Day 1  
**Based on:** T76 playtest framework, T77 operationalization, T78 smoke pass
