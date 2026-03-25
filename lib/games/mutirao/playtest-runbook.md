# T76: Playtest Runbook — Operator Checklist

**Purpose:** Ensure every playtest session is run consistently and captures required data.

---

## Pre-Session Setup (5 min)

### 1. Environment Preparation
```markdown
□ Open browser in Incognito/Private mode
□ Navigate to: [game URL]
□ Open DevTools → Console (para logs)
□ Open DevTools → Application → Local Storage
□ Confirm localStorage is empty (clear if needed):
   - mutirao_telemetry_sessions
   - mutirao_feedback_v1
   - mutirao_telemetry_last_session
```

### 2. Tester Briefing (2 min)
Say exactly:
> "Você vai testar um jogo sobre saneamento comunitário. O objetivo é ajudar o bairro Vila Esperança a melhorar a infraestrutura. Jogue como achar melhor — não tem resposta certa. Vou te pedir para preencher um formulário curto no final."

For **think-aloud sessions**, add:
> "Pense em voz alta. Fale o que está vendo, o que está tentando fazer, o que te confunde."

### 3. Device/Browser Recording
```markdown
□ Record in session log:
   - Device: [e.g., "Moto G Power", "MacBook Pro"]
   - OS: [e.g., "Android 13", "macOS 14"]
   - Browser: [e.g., "Chrome 120", "Safari 17"]
   - Screen size: [e.g., "1080x1920", "1440x900"]
   - Date/Time: [ISO 8601]
   - Tester ID: [anon_id ou nome]
   - Profile: [A/B/C/D from playtest-plan.md]
```

---

## During Session (15-30 min)

### 4. Silent Observation (Self-Guided Sessions)
```markdown
□ Do NOT intervene unless asked
□ Do NOT answer "como faço X?" unless tester stuck > 2 min
□ If tester asks for help, respond: "Tente como achar melhor — estamos testando o que é intuitivo"
□ Note timestamp of any confusion/frustration
```

### 5. Active Observation (Think-Aloud Sessions)
```markdown
□ Prompt if silent > 30 sec: "O que você está pensando?"
□ Note exact quotes that indicate:
   - Confusion: "Não sei o que fazer", "Isso faz o quê?"
   - Frustration: "Isso não funciona", "Tá difícil"
   - Delight: "Legal!", "Entendi!", "Isso foi bom"
   - Strategy: "Acho que preciso...", "Vou tentar..."
□ Note any mobile-specific issues:
   - Tap errors (clicou errado)
   - Scroll conflicts
   - Text too small
   - Mis-taps on small buttons
```

### 6. Key Timestamps to Record
| Event | What to Note |
|-------|--------------|
| Session start | Click "Play" |
| First interaction | Time until first action |
| First confusion | What they didn't understand |
| Dengue warning | Reaction to first health risk alert |
| First blocked action | Why action was disabled |
| Mid-game | Energy/coverage status around turn 6 |
| Game end | Result achieved |
| Form submission | Time to complete feedback |

---

## Post-Session (5 min)

### 7. Data Export
```markdown
□ Open DevTools → Console
□ Run: copy(JSON.parse(localStorage.getItem('mutirao_telemetry_sessions'), null, 2))
□ Paste into: data/sessions/YYYY-MM-DD-[tester-id].json
□ Run: copy(JSON.parse(localStorage.getItem('mutirao_feedback_v1'), null, 2))
□ Paste into: data/feedback/YYYY-MM-DD-[tester-id].json
□ Clear localStorage for next session
```

### 8. Observation Notes (Think-Aloud)
```markdown
□ Open: observations/YYYY-MM-DD-[tester-id].md
□ Fill template:

## Session: [Tester ID] — [Device]
**Duration:** [X min]  
**Completion:** [Sim/Não]  
**Result:** [Se completou, qual]  

### Key Moments
- [Time]: [What happened / What they said]
- [Time]: [What happened / What they said]

### Confusion Points
1. [What confused them]
2. [What confused them]

### Positive Signals
1. [What worked well]
2. [What worked well]

### Mobile Issues (if applicable)
1. [Tap error, scroll conflict, etc.]

### Verbatim Quotes
> "[Exact quote]"
> "[Exact quote]"

### Operator Notes
- [Any additional context]
```

### 9. Quick Sanity Check
```markdown
□ Did telemetry save? (check localStorage)
□ Did feedback form appear at end?
□ Did tester complete form?
□ Any obvious bugs to report immediately?
```

---

## Batch Review (End of Day)

### 10. Aggregate Check
```markdown
□ Export all sessions from today
□ Run telemetry aggregation (via debug screen)
□ Check completion rate for the day
□ Check for any P0 issues (crashes, soft-locks)
□ If P0 found: PAUSE playtest, escalate immediately
```

### 11. Daily Standup Notes
```markdown
Prepare 3 bullets for team:
1. Sessions today: [N completed, M abandoned]
2. Biggest friction: [one sentence]
3. Biggest positive: [one sentence]
```

---

## Emergency Procedures

### If Tester Finds Crash/Bug
1. Ask: "O que você fez imediatamente antes?"
2. Screenshot/console log
3. STOP session if game unplayable
4. File P0 issue immediately
5. Do NOT continue playtest until fixed

### If Tester Completely Lost
- Allow up to 3 minutes of confusion
- Then intervene minimally: "Tente clicar em um morador"
- Note this as "required intervention" — this is a finding

### If Mobile Tester Can't Play
- If touch completely broken: STOP, file P0
- If just frustrating: complete session, note severity
- If text unreadable: STOP, file P0

---

## Quick Reference Card

**Tester Profiles:**
- A = Equipe técnica
- B = Jogador casual
- C = Mobile-only
- D = Desktop-only

**Device Priority:**
1. Moto G / Samsung A (Android mid-range)
2. iPhone SE/11 (iOS)
3. Laptop Chrome
4. Desktop Safari

**Must Capture:**
- Time to first interaction
- Completion (Sim/Não)
- Result (se completou)
- Feedback form responses
- Observation notes (think-aloud)

**Red Flags (Escalate):**
- Crash/soft-lock
- Mobile unplayable
- 0% completion rate in batch
- "Não entendi nada" de 50%+ testers

---

*Playtest Runbook — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
