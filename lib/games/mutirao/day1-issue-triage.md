# Day 1 Issue Triage Template

**Purpose:** Classify issues found in first 3 sessions by severity  
**Input:** Feedback clustering + operator notes + bugs found  
**Output:** P0/P1/P2/P3 classification with action items  
**Time:** 15-20 minutes

---

## Issue Inventory

### Issues from Session 1
| # | Issue | Type | Session | Evidence |
|---|-------|------|---------|----------|
| 1 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 1 | |
| 2 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 1 | |
| 3 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 1 | |

### Issues from Session 2
| # | Issue | Type | Session | Evidence |
|---|-------|------|---------|----------|
| 4 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 2 | |
| 5 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 2 | |
| 6 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 2 | |

### Issues from Session 3
| # | Issue | Type | Session | Evidence |
|---|-------|------|---------|----------|
| 7 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 3 | |
| 8 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 3 | |
| 9 | | ☐ Bug ☐ Confusion ☐ UX ☐ Performance | 3 | |

---

## Severity Definitions

| Level | Name | Definition | Sprint Impact |
|-------|------|------------|---------------|
| **P0** | Critical | Blocks sprint continuation. Data loss, crashes, or complete playability failure. | STOP and fix immediately |
| **P1** | Serious | Damages test validity or player experience significantly. Sprint can continue but must be addressed. | Fix during sprint if possible |
| **P2** | Moderate | Noticeable friction but doesn't block play. Polish/tuning items. | Fix if time permits |
| **P3** | Minor | Nice-to-have improvements. Future enhancement. | Defer to post-sprint |

---

## P0 Issues (Critical — Fix Before Continuing)

### Issue #[number]
**Description:** 
```

```

**Impact:** 
```

```

**Sessions affected:** ___/3  
**Reproducibility:** ☐ Always ☐ Sometimes ☐ Once

**Evidence:**
```

```

**Fix required:**
```

```

**Effort estimate:** ☐ < 1 hour ☐ 1-4 hours ☐ > 4 hours  
**Owner:** 

**Status:** ☐ Open ☐ In Progress ☐ Fixed ☐ Verified

---

### Issue #[number]
[Template above repeated for each P0]

---

## P1 Issues (Serious — Address During Sprint)

### Issue #[number]
**Description:** 
```

```

**Impact:** 
```

```

**Sessions affected:** ___/3  
**Reproducibility:** ☐ Always ☐ Sometimes ☐ Once

**Evidence:**
```

```

**Proposed fix:**
```

```

**Workaround available?** ☐ Yes ☐ No  
**Effort estimate:** ☐ < 1 hour ☐ 1-4 hours ☐ > 4 hours  
**Owner:** 

**Status:** ☐ Open ☐ In Progress ☐ Fixed ☐ Verified

**Sprint continuation risk:** ☐ Low ☐ Medium ☐ High

---

### Issue #[number]
[Template above repeated for each P1]

---

## P2 Issues (Moderate — Fix If Time Permits)

### Issue #[number]
**Description:** 
```

```

**Impact:** 
```

```

**Sessions affected:** ___/3

**Evidence:**
```

```

**Proposed fix:**
```

```

**Effort estimate:** ☐ < 1 hour ☐ 1-4 hours ☐ > 4 hours

**Status:** ☐ Open ☐ Deferred

---

### Issue #[number]
[Template above repeated for each P2]

---

## P3 Issues (Minor — Future Enhancement)

### Issue #[number]
**Description:** 
```

```

**Nice-to-have rationale:**
```

```

**Status:** ☐ Backlog

---

## Triage Summary Table

| Severity | Count | % of Total | Status |
|----------|-------|------------|--------|
| P0 — Critical | | | ☐ 0 open required |
| P1 — Serious | | | ☐ Managed |
| P2 — Moderate | | | ☐ Tracked |
| P3 — Minor | | | ☐ Backlog |
| **Total** | | | |

---

## Cross-Issue Patterns

### Clustered Issues (Multiple sessions)
| Issue | Sessions | Severity | Action |
|-------|----------|----------|--------|
| | 1, 2, 3 | | |
| | 1, 2 | | |
| | 2, 3 | | |

**Interpretation:** Issues appearing in multiple sessions are more likely to be real problems, not one-off confusion.

### Profile-Specific Issues
| Issue | Profile | Severity | Action |
|-------|---------|----------|--------|
| | Mobile-first | | |
| | Desktop | | |
| | Non-expert | | |

**Interpretation:** Profile-specific issues may be acceptable if they don't affect target audience.

---

## SPRINT-LOCK Compliance Check

Before fixing any issue, verify against sprint lock rules:

| Issue | Fix Type | SPRINT-LOCK Allow? | Approved? |
|-------|----------|-------------------|-----------|
| | ☐ Bug fix ☐ Ops fix ☐ Copy change | ☐ Yes ☐ No | ☐ Yes ☐ Needs approval |
| | ☐ Bug fix ☐ Ops fix ☐ Copy change | ☐ Yes ☐ No | ☐ Yes ☐ Needs approval |

**Reference:** `lib/games/mutirao/SPRINT-LOCK.md`

---

## Day 1 Triage Decision

Based on issue inventory above, select ONE:

### ☐ CONTINUE SPRINT AS PLANNED
**Conditions met:**
- [ ] 0 P0 issues OR all P0 fixed
- [ ] P1 issues have workarounds or are manageable
- [ ] No issues threaten data validity

**Rationale:**
```

```

---

### ☐ CONTINUE WITH MINOR FIXES
**Conditions met:**
- [ ] 0-1 P0 issues (quick fixes)
- [ ] P1 issues are contained
- [ ] Fixes can be done in < 4 hours total
- [ ] Fixes won't invalidate previous sessions

**Rationale:**
```

```

**Fixes to apply:**
1. _________________________ (___ hours)
2. _________________________ (___ hours)
3. _________________________ (___ hours)

**Total fix time:** ___ hours  
**Fix deadline:** End of Day ___

---

### ☐ PAUSE SPRINT AND FIX BLOCKERS
**Conditions met:**
- [ ] 1+ unfixable P0 issues
- [ ] P1 issues threaten test validity
- [ ] Data capture is compromised
- [ ] Player safety concerns

**Rationale:**
```

```

**Blockers to fix:**
1. _________________________
2. _________________________

**Estimated unblock time:** ___ hours/days  
**New Day 1 date:** ___

---

## Action Items

### Immediate (Today)
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | ☐ Done |
| | | | ☐ Done |

### Tomorrow (Day 2)
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | ☐ Done |
| | | | ☐ Done |

---

## Risk Assessment

### If we continue without fixes:
**Risk level:** ☐ Low ☐ Medium ☐ High  
**Biggest risk:** 
```

```

### If we pause to fix:
**Impact:** ☐ 1 day delay ☐ 2-3 day delay ☐ > 3 day delay  
**Cost of delay:** 
```

```

**Recommendation:**
```

```

---

## Escalation

**If P0 found or decision unclear:**
- Escalate to: _______________
- With: This triage document + evidence files
- Decision needed by: _______________

---

**Triaged by:** _______________  
**Date:** _______________  
**Reviewed by:** _______________  
**Decision:** ☐ Continue ☐ Continue with fixes ☐ Pause

**Next review:** End of Day ___ (after ___ more sessions)
