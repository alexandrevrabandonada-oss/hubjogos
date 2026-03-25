# MUTIRÃO SPRINT LOCK — T78

**Status:** ACTIVE  
**Lock Date:** 25 de Março de 2026  
**Duration:** Until internal playtest sprint completes (5-7 days)  
**Owner:** Sprint Coordinator

---

## 🚫 FROZEN (No Changes Allowed)

### Gameplay Systems
- ❌ NO new mechanics
- ❌ NO new actions
- ❌ NO new resources
- ❌ NO balance re-tuning (unless critical bug)
- ❌ NO new win/loss conditions
- ❌ NO turn structure changes
- ❌ NO obra gate changes
- ❌ NO dengue pressure changes

### Content
- ❌ NO new art assets
- ❌ NO new audio
- ❌ NO new copy/text (except bug fixes)
- ❌ NO new levels/scenarios
- ❌ NO new tutorials

### Hub/Platform
- ❌ NO new hub features
- ❌ NO progression system changes
- ❌ NO new games

---

## ✅ ALLOWED (Bug Fixes & Ops Only)

### Critical Fixes (P0/P1)
- ✅ Game-breaking bugs
- ✅ Crash fixes
- ✅ Data loss bugs
- ✅ Security issues

### Playtest Flow Fixes
- ✅ Reset tool bugs
- ✅ Telemetry capture issues
- ✅ Export generation failures
- ✅ Console UI bugs
- ✅ Operator workflow blockers

### Microcopy/Labels
- ✅ Operator confusion fixes
- ✅ Label clarifications
- ✅ Button text improvements
- ✅ Error message fixes

### Smoke Verification Fixes
- ✅ T78-discovered issues
- ✅ End-to-end pipeline bugs

---

## 📋 DECISION TREE

```
Want to make a change?
    ↓
Does it fix a P0/P1 bug?
    YES → ALLOWED (document in T78)
    NO → Continue
    ↓
Does it improve playtest operations?
    YES → ALLOWED (document in T78)
    NO → Continue
    ↓
Does it change gameplay/balance/content?
    YES → NOT ALLOWED (defer to post-sprint)
    NO → ALLOWED
```

---

## 📝 CHANGE LOG

| Date | Change | Reason | Approved By |
|------|--------|--------|-------------|
| 25/03 | Sprint lock active | T78 smoke verification | — |
| | | | |
| | | | |

---

## 🎯 SPRINT COMPLETION CRITERIA

Lock lifts when ONE of:
1. Beta decision rendered (GO/HARDENING/REWORK)
2. Critical P0 bug forces work stoppage
3. Sprint window expires (Day 7)

---

**Violations of this lock must be escalated to project lead.**

*This document ensures the Mutirão internal playtest sprint runs on a stable, known codebase without scope creep or last-minute changes that invalidate test results.*
