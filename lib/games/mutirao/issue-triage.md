# T76: Issue Severity Triage Template

**Purpose:** Classify all identified issues by severity to determine what blocks beta.

---

## Severity Definitions

### P0 — BLOCKS BETA (Must Fix)
**Definition:** Issue prevents game from being playable, understandable, or viable on mobile.

**Criteria:**
- Crash or soft-lock
- Mobile completely unplayable (touch broken, text unreadable)
- < 40% completion rate in playtests
- No one understands the objective
- Single dominant strategy (no meaningful choice)
- All players get same result
- Players can't understand why they won/lost

**Action:** STOP beta, fix immediately, re-test.

---

### P1 — SERIOUS (Fix Before Beta if Possible)
**Definition:** Issue significantly harms experience but doesn't make game unplayable.

**Criteria:**
- UX confusion in 30-50% of testers
- Mobile frustrating but functional
- Balance skewed but not broken
- 40-60% completion rate
- Replay rate < 20%
- Result distribution heavily skewed
- Dengue feels unfair/punitive

**Action:** Fix before beta if time permits; OK to fix during beta if necessary.

---

### P2 — POLISH (Fix During Beta)
**Definition:** Issue noticeable but doesn't significantly impact core experience.

**Criteria:**
- Minor UI inconsistencies
- Copy could be clearer
- Visual polish needed
- Tutorial could be stronger
- Audio could be better
- Performance could be smoother

**Action:** Schedule for beta iteration or post-launch polish.

---

### P3 — FUTURE (Post-Beta)
**Definition:** Nice-to-have improvements beyond beta scope.

**Criteria:**
- New features
- Content additions
- Major visual upgrades
- Advanced accessibility
- Social features
- Analytics enhancements

**Action:** Backlog for post-beta development.

---

## Triage Decision Tree

```
Is the issue a crash/soft-lock?
  YES → P0
  NO → Continue

Does it make mobile unplayable?
  YES → P0
  NO → Continue

Does it prevent understanding core objective?
  YES → P0
  NO → Continue

Does it affect > 40% of testers?
  YES → P1
  NO → Continue

Does it affect 20-40% of testers?
  YES → P1 (or P2 if minor)
  NO → Continue

Is it a polish/quality issue?
  YES → P2
  NO → Continue

Is it a new feature request?
  YES → P3
  NO → P2
```

---

## Triage Template

```markdown
# Issue Triage - Mutirão de Saneamento
**Date:** YYYY-MM-DD
**Playtest Sessions:** N
**Total Issues Found:** N

## P0 — BLOCKS BETA
| ID | Issue | Source | Evidence | Fix Owner | ETA |
|----|-------|--------|----------|-----------|-----|
| P0-001 | [Description] | [Telemetry/Feedback/Obs] | [Data] | [Name] | [Date] |
| P0-002 | ... | ... | ... | ... | ... |

**P0 Count:** N
**Status:** [All assigned / Some unassigned / Blocking]

---

## P1 — SERIOUS
| ID | Issue | Source | Evidence | Fix Owner | ETA | Beta OK? |
|----|-------|--------|----------|-----------|-----|----------|
| P1-001 | [Description] | [Source] | [Data] | [Name] | [Date] | [Yes/No] |
| P1-002 | ... | ... | ... | ... | ... | ... |

**P1 Count:** N
**Fix Before Beta:** N issues
**Fix During Beta:** N issues

---

## P2 — POLISH
| ID | Issue | Source | Notes |
|----|-------|--------|-------|
| P2-001 | [Description] | [Source] | [Notes] |
| P2-002 | ... | ... | ... |

**P2 Count:** N
**Target:** Beta iteration

---

## P3 — FUTURE
| ID | Issue | Source | Notes |
|----|-------|--------|-------|
| P3-001 | [Description] | [Source] | [Notes] |
| P3-002 | ... | ... | ... |

**P3 Count:** N
**Target:** Post-beta

---

## Summary
| Severity | Count | Beta Impact |
|----------|-------|-------------|
| P0 | N | [BLOCKING / RESOLVED] |
| P1 | N | [N fix before, N during] |
| P2 | N | [Beta polish] |
| P3 | N | [Post-beta] |

**Beta Recommendation:** [GO / GO WITH P1 FIXES / NO-GO]
```

---

## Example Triage Entries

### P0 Example
```markdown
| ID | Issue | Source | Evidence | Fix Owner | ETA |
|----|-------|--------|----------|-----------|-----|
| P0-001 | "Executar Obra" button crashes on mobile Chrome | Observation + Telemetry | 3/4 mobile sessions crashed when tapping obra | @dev-team | 2026-03-27 |
| P0-002 | 25% completion rate | Telemetry | Only 2/8 sessions completed | @design-team | 2026-03-28 |
```

### P1 Example
```markdown
| ID | Issue | Source | Evidence | Fix Owner | ETA | Beta OK? |
|----|-------|--------|----------|-----------|-----|----------|
| P1-001 | Players don't understand "Risco de Saúde" | Feedback + Comprehension Audit | 4/8 testers: "não entendi o que é risco" | @ux-team | 2026-03-29 | No |
| P1-002 | Mobile touch targets too small | Mobile Audit | 30% tap error rate on iPhone SE | @dev-team | 2026-03-28 | No |
| P1-003 | Result distribution 70% collapse | Balance Audit | Telemetry shows 70% collapse, 10% other | @balance-team | 2026-03-30 | Yes (fix during beta) |
```

### P2 Example
```markdown
| ID | Issue | Source | Notes |
|----|-------|--------|-------|
| P2-001 | Actor icons could be more distinct | Feedback | "todos parecem iguais" mentioned by 2/8 |
| P2-002 | Tutorial text could be punchier | Observation | Think-aloud showed reading but not processing |
| P2-003 | Result screen transition could be smoother | Observation | Minor visual stutter noticed |
```

---

## Severity Escalation Rules

### Auto-Escalate to P0 if:
- [ ] Issue appears in > 50% of sessions
- [ ] Issue prevents completion for > 30% of players
- [ ] Mobile completely broken on tested device
- [ ] Crash or data loss

### Auto-De-escalate if:
- [ ] Issue affects < 10% of players
- [ ] Workaround exists
- [ ] Minor cosmetic issue

### Disputed Severity Resolution:
1. Product owner makes final call
2. Default to more severe if in doubt
3. Document reasoning

---

## Beta Go/No-Go Based on Triage

### GO if:
- [ ] Zero P0 issues remain
- [ ] All P1 issues either:
  - Fixed, OR
  - Assigned with ETA before beta launch, OR
  - Explicitly accepted as "fix during beta"

### NO-GO if:
- [ ] Any P0 issue unassigned or no ETA
- [ ] > 3 P1 issues without fix plan
- [ ] Mobile fundamentally broken

### CONDITIONAL GO if:
- [ ] 1-2 P1 issues accepted as "fix during beta"
- [ ] Clear plan and ownership
- [ ] Issues don't block core experience

---

*Issue Severity Triage — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
