# Day 1 Evidence Pack Organization

**Purpose:** Standard structure for organizing Day 1 outputs  
**Location:** `evidence/day1/` directory (create if doesn't exist)  
**Format:** Files + JSON + CSV + Markdown

---

## Directory Structure

```
evidence/
└── day1/
    ├── raw/
    │   ├── sessions.json              (exported from console)
    │   ├── telemetry-summary.json     (exported from console)
    │   └── notes.json                 (flattened operator notes)
    ├── processed/
    │   ├── evidence-snapshot.md       (first evidence template)
    │   ├── feedback-clustering.md   (clustering analysis)
    │   ├── issue-triage.md            (P0/P1/P2/P3 classification)
    │   └── decision-framework.md      (continue/pause decision)
    ├── exports/
    │   ├── sessions.csv               (spreadsheet format)
    │   └── feedback-form-responses/   (if separate from telemetry)
    ├── screenshots/
    │   ├── review-tab-overview.png    (Review tab screenshot)
    │   ├── session-1-notes.png        (optional: key moments)
    │   └── mobile-validation/         (if mobile tested)
    │       ├── device-info.txt
    │       └── screenshot.png
    └── README.md                      (index of all files)
```

---

## File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| JSON exports | `day1-{content}-{date}.json` | `day1-sessions-2026-03-25.json` |
| CSV exports | `day1-{content}-{date}.csv` | `day1-sessions-2026-03-25.csv` |
| Analysis | `day1-{type}.md` | `day1-feedback-clustering.md` |
| Screenshots | `day1-{context}-{time}.png` | `day1-review-tab-14h30.png` |
| Backups | `{original}-backup-{time}` | `sessions-backup-14h30.json` |

---

## Required Files Checklist

### Raw Data (Auto-Generated)
- [ ] `raw/sessions.json` — Console export (all 3 sessions)
- [ ] `raw/telemetry-summary.json` — Aggregated metrics
- [ ] `raw/notes.json` — Flattened operator notes

### Processed Analysis (Manual)
- [ ] `processed/evidence-snapshot.md` — First evidence template completed
- [ ] `processed/feedback-clustering.md` — Clustering template completed
- [ ] `processed/issue-triage.md` — Triage template completed
- [ ] `processed/decision-framework.md` — Decision framework completed

### Exports (Auto-Generated)
- [ ] `exports/sessions.csv` — Spreadsheet for quick analysis

### Screenshots (Manual)
- [ ] `screenshots/review-tab-overview.png` — Console review tab
- [ ] `screenshots/mobile-validation/` — If applicable

### Documentation
- [ ] `README.md` — Index of contents

---

## README.md Template

```markdown
# Day 1 Evidence Pack

**Date:** 2026-03-25  
**Operator:** [Name]  
**Sessions:** 3 (mobile, desktop, non-expert)  
**Status:** ☐ Complete ☐ In Progress

## Quick Stats
- Total Sessions: 3
- Completed: ___
- Completion Rate: ___%
- P0 Issues: ___
- P1 Issues: ___
- Decision: ☐ Continue ☐ Continue with fixes ☐ Pause

## File Index

### Raw Data
- `raw/sessions.json` — All session records and metadata
- `raw/telemetry-summary.json` — Aggregated telemetry metrics
- `raw/notes.json` — Operator notes (flattened)

### Analysis
- `processed/evidence-snapshot.md` — Quantitative + qualitative summary
- `processed/feedback-clustering.md` — Feedback themes and clusters
- `processed/issue-triage.md` — P0/P1/P2/P3 classification
- `processed/decision-framework.md` — Continue/pause decision

### Exports
- `exports/sessions.csv` — Spreadsheet format

### Visual
- `screenshots/review-tab-overview.png` — Console overview

## Key Findings

### Biggest Win
[Brief description]

### Biggest Concern
[Brief description]

### Day 1 Decision
[Continue / Continue with fixes / Pause]

## Next Steps
1. 
2. 
3. 

## File Hashes (for verification)
```
sessions.json: [md5 hash]
telemetry-summary.json: [md5 hash]
```

## Contact
Questions about this evidence pack: [Operator email/slack]
```

---

## Backup Procedures

### After Each Session
1. Screenshot Review tab
2. Export sessions.json (append timestamp)
3. Copy to backup location

### End of Day 1
1. Full export from console
2. Copy to `evidence/day1/` directory
3. Create backup in cloud storage (optional)
4. Verify all files open correctly
5. Generate README.md

### Backup Locations
| Location | Purpose |
|----------|---------|
| `evidence/day1/` | Primary |
| `evidence/day1/backup/` | Local backup |
| Cloud drive (optional) | Offsite backup |
| Git (if appropriate) | Version control |

---

## Validation Checklist

Before declaring Day 1 complete:

- [ ] All 3 sessions exported
- [ ] JSON files valid (open without parse errors)
- [ ] CSV opens in spreadsheet
- [ ] Screenshots viewable
- [ ] All analysis templates complete
- [ ] README.md created
- [ ] File sizes reasonable (> 1KB for JSON)
- [ ] Backup created

**If all checked:** Day 1 evidence pack complete.

---

## Handoff Checklist

### To Analyst
- [ ] All files in `evidence/day1/`
- [ ] README.md explains contents
- [ ] No missing critical files
- [ ] Contact info provided

### To Project Lead
- [ ] Evidence snapshot summary
- [ ] Decision recommendation
- [ ] Key issues highlighted
- [ ] Next steps clear

### To Days 2-5 Operator
- [ ] File structure explained
- [ ] Naming convention documented
- [ ] Backup process demonstrated
- [ ] Day 1 findings briefed

---

**Pack created by:** _______________  
**Date:** _______________  
**Status:** ☐ Complete ☐ Incomplete (explain: _______)
