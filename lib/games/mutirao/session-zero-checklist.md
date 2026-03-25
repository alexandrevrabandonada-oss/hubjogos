# Session Zero — Pre-Sprint Verification Checklist

**Purpose:** Verify T77/T78 playtest pipeline before involving real testers  
**Duration:** 15-20 minutes  
**Executor:** Operator (solo)  
**When:** Day before or morning of Day 1

---

## Pre-Conditions

- [ ] Console code deployed and accessible
- [ ] Browser DevTools available
- [ ] 15 minutes uninterrupted
- [ ] SPRINT-LOCK.md reviewed

---

## Phase 1: Console Access (2 min)

### Step 1.1: Open Console
```
URL: /internal/playtest/mutirao
```

**Verify:**
- [ ] Page loads without errors
- [ ] Header shows "Mutirão Playtest Ops Console"
- [ ] Footer shows "T77 Playtest Ops Console"
- [ ] All 6 tabs visible: Register, Live, Review, Audits, Export, Decision

**If fails:** Check console for import errors, verify file paths

---

## Phase 2: Reset Verification (3 min)

### Step 2.1: Clear All State
1. Click "🗑 Reset All" button (header)
2. Confirm dialog
3. Verify: All stats show "0"

### Step 2.2: Verify localStorage Cleared
Open DevTools → Application → Local Storage:

**Verify these keys are REMOVED:**
- [ ] `mutirao_playtest_sessions`
- [ ] `mutirao_audit_progress`
- [ ] `mutirao_telemetry_sessions`
- [ ] `mutirao_feedback_v1`

**If any remain:** Clear manually, file bug

---

## Phase 3: Registration Flow (3 min)

### Step 3.1: Fill Registration Form
Go to "📋 Register Session" tab:

| Field | Value |
|-------|-------|
| Tester Nickname | `session-zero` |
| Profile | `team` |
| Device | `Windows Laptop` |
| Browser | `Chrome Desktop` |
| Screen Size | `1920x1080` |
| Session Type | `self-guided` |
| Operator Name | `[your name]` |
| Notes | `Session Zero dummy run` |

### Step 3.2: Test Individual Resets
Click each reset button:
- [ ] "📊 Clear Telemetry" → turns green ✓
- [ ] "📝 Clear Feedback" → turns green ✓
- [ ] "🎮 Clear Game State" → turns green ✓

### Step 3.3: Start Session
Click "🚀 Start Session"

**Verify:**
- [ ] Auto-switches to "🔴 Live Tools" tab
- [ ] Tab shows "(ACTIVE)" indicator
- [ ] Live badge shows pulse animation
- [ ] Session info displays correctly

---

## Phase 4: Live Tools Verification (4 min)

### Step 4.1: Test Quick Markers
In Live Tools tab, click each button:

| Button | Expected Result |
|--------|-----------------|
| 😕 Confusion | Note added to recent list |
| ✨ Strong Moment | Note added to recent list |
| 🐛 Bug | Note added to recent list |
| 🚪 Drop | Note added to recent list |
| 🏁 Completion | Note added to recent list |
| 📍 Timestamp | Note added to recent list |

**Verify:**
- [ ] Each click adds note immediately
- [ ] Notes appear in "Recent Notes" list
- [ ] Timestamp shows correct time
- [ ] Turn field defaults to "1"

### Step 4.2: Test Custom Note
1. Type: `Testing custom note functionality`
2. Set turn to: `3`
3. Click "Add Note"

**Verify:**
- [ ] Note appears in list
- [ ] Shows as "custom" type
- [ ] Shows turn "3"

### Step 4.3: Test Turn Tracker
1. Change turn input to: `7`
2. Click "😕 Confusion"

**Verify:**
- [ ] New note shows "T7"

---

## Phase 5: Game Integration (Optional, 5 min)

If time permits, briefly test with actual game:

### Step 5.1: Launch Game
Open `/games/mutirao` in new tab

### Step 5.2: Generate Telemetry
- Play 2-3 turns
- Take some actions
- (Don't need to finish - just verify capture)

### Step 5.3: Verify Telemetry Storage
In DevTools → Application → Local Storage:

**Verify:**
- [ ] `mutirao_telemetry_sessions` exists
- [ ] Contains session data

---

## Phase 6: Session Completion (2 min)

### Step 6.1: Complete Session
1. Click "✅ Complete Session"
2. Confirm in modal

**Verify:**
- [ ] Auto-switches to "📊 Review" tab
- [ ] "Total Sessions" shows 1
- [ ] "Completed" shows 1
- [ ] Session appears in Recent Sessions table

---

## Phase 7: Review & Audit Tabs (2 min)

### Step 7.1: Review Tab
**Verify:**
- [ ] Overview cards render
- [ ] Session count = 1
- [ ] No console errors

### Step 7.2: Audits Tab
**Verify:**
- [ ] Progress bar shows 0%
- [ ] All 6 audit items listed
- [ ] Checkboxes are disabled (need 3+ sessions)

---

## Phase 8: Export Verification (2 min)

### Step 8.1: Test Exports
In "⬇ Export" tab, click:

- [ ] "Download Pack (.json)" → File downloads
- [ ] Open file, verify JSON is valid
- [ ] Verify structure has: exportedAt, sessions, telemetry, summary

**Check JSON structure:**
```json
{
  "exportedAt": "2026-03-25...",
  "sessions": [...],
  "telemetry": {...},
  "summary": {
    "totalSessions": 1,
    "completedSessions": 1,
    ...
  }
}
```

### Step 8.2: Test CSV Export
- [ ] Click "Download CSV"
- [ ] Open in spreadsheet
- [ ] Verify columns: Tester, Profile, Device, Browser, Status, Notes Count, Duration

---

## Phase 9: Decision Draft (2 min)

### Step 9.1: Generate Draft
In "🎯 Decision" tab:

**Verify:**
- [ ] "Not ready for decision" banner shows (need 5 sessions)
- [ ] Recommendation shows (likely "HARDENING" or "REWORK" due to low sample)
- [ ] Stats show "Sessions: 1"
- [ ] Download button is active

### Step 9.2: Download Draft
- [ ] Click "Download Decision Draft (.md)"
- [ ] Open markdown file
- [ ] Verify sections: Evidence Summary, Audit Status, Main Friction Points
- [ ] Verify recommendation placeholder present

---

## Phase 10: Final Reset (1 min)

### Step 10.1: Clean Up
Click "🗑 Reset All" to clear Session Zero data

**Verify:**
- [ ] All stats return to 0
- [ ] localStorage cleared

---

## Session Zero Sign-Off

| Checkpoint | Status |
|------------|--------|
| Console loads | ☐ Pass ☐ Fail |
| Reset works | ☐ Pass ☐ Fail |
| Registration flows | ☐ Pass ☐ Fail |
| Live tools respond | ☐ Pass ☐ Fail |
| Completion triggers | ☐ Pass ☐ Fail |
| Review renders | ☐ Pass ☐ Fail |
| Export generates valid JSON | ☐ Pass ☐ Fail |
| Decision draft renders | ☐ Pass ☐ Fail |

**Overall:** ☐ READY FOR DAY 1 ☐ FIX ISSUES FIRST

**Issues Found:**
```
[List any issues here]
```

**Fixes Applied:**
```
[Document any fixes]
```

---

## If Session Zero Passes

✅ **You are cleared for Day 1.**

**Next steps:**
1. Brief testers (5 min each)
2. Schedule 3 sessions
3. Ensure mobile device available
4. Keep this checklist for reference

## If Session Zero Fails

⛔ **Do not proceed to Day 1.**

**Options:**
1. Fix blocking issues (reference SPRINT-LOCK.md for allowed changes)
2. Re-run Session Zero
3. Escalate to project lead if cannot resolve

---

**Executed by:** _______________  
**Date:** _______________  
**Time:** _______________  
**Result:** ☐ PASS ☐ FAIL
