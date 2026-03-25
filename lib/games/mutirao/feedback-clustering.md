# T76: Qualitative Feedback Clustering System

**Purpose:** Transform raw feedback form responses into actionable insight categories.

---

## Feedback Categories

### 1. Confusion About Priorities
**What to look for:**
- "Não sei por onde começar"
- "Não entendi o que fazer primeiro"
- "Muitas opções, não sei qual escolher"
- "Fiquei perdido no início"

**Severity:**
- **P0:** > 50% testers mention
- **P1:** 30-50% testers mention
- **P2:** < 30% testers mention

**Action if P0/P1:**
- Add stronger visual hierarchy to first-turn guidance
- Highlight "suggested first action"
- Tutorial overlay for first 2 turns

---

### 2. Confusion About Actor Roles
**What to look for:**
- "Não entendi a diferença entre os moradores"
- "Por que alguns dão mais confiança?"
- "Qual ator faz o quê?"
- "Todos parecem iguais"

**Severity:**
- **P0:** > 40% testers mention
- **P1:** 20-40% testers mention
- **P2:** < 20% testers mention

**Action if P0/P1:**
- Actor tooltips with role description
- Visual distinction between actor types
- Color coding for different roles

---

### 3. Unclear Consequences
**What to look for:**
- "Não sei o que aconteceu depois que fiz X"
- "A ação parece não ter efeito"
- "Não entendi por que minha energia mudou"
- "O que é 'risco de saúde'?"

**Severity:**
- **P0:** > 40% testers mention
- **P1:** 20-40% testers mention
- **P2:** < 20% testers mention

**Action if P0/P1:**
- Stronger immediate feedback on actions
- Post-action summary popup
- Resource change animations

---

### 4. Mobile Control Problems
**What to look for:**
- "Botões muito pequenos"
- "Clickei no lugar errado várias vezes"
- "Difícil de usar no celular"
- "Texto muito pequeno"
- "Scroll atrapalha"

**Severity:**
- **P0:** > 30% mobile testers OR any tester says "inviável"
- **P1:** 15-30% mobile testers mention
- **P2:** < 15% mobile testers mention

**Action if P0/P1:**
- Increase touch targets (min 48x48px)
- Adjust mobile layout
- Review responsive breakpoints

---

### 5. Pacing Problems
**What to look for:**
- "Muito rápido, não deu tempo de pensar"
- "Arrastou demais, ficou chato"
- "Turnos muito curtos"
- "Não consegui fazer nada antes do fim"

**Severity:**
- **P0:** > 40% testers mention
- **P1:** 20-40% testers mention
- **P2:** < 20% testers mention

**Action if P0/P1:**
- Adjust turn count (currently 12)
- Energy regeneration rate
- Action costs

---

### 6. Weak Territorial Feeling
**What to look for:**
- "Não senti que era um bairro real"
- "Pareceu genérico"
- "Não vi diferença entre as casas"
- "Sem alma de comunidade"

**Severity:**
- **P0:** > 50% testers + low "territoryAlive" score
- **P1:** 30-50% testers mention
- **P2:** < 30% testers mention

**Action if P0/P1:**
- Better visual storytelling
- Named locations within Vila Esperança
- Character backstories
- Environmental visual improvements

---

### 7. Weak Political Clarity
**What to look for:**
- "Não entendi a mensagem política"
- "Só parece um jogo de cliques"
- "Qual o ponto sobre saneamento?"
- "Não vi crítica social"

**Severity:**
- **P0:** > 50% testers say they didn't understand outcome
- **P1:** 30-50% testers mention
- **P2:** < 30% testers mention

**Action if P0/P1:**
- Stronger result framing
- Pre-game context about real-world issue
- Post-game reflection prompt
- Outcome screen political message

---

### 8. Low Desire to Replay/Share
**What to look for:**
- "Não jogaria de novo"
- "Não vi motivo para repetir"
- "Não compartilharia"
- "Uma vez foi suficiente"
- "Não tem variedade"

**Severity:**
- **P0:** < 20% would replay AND < 10% would share
- **P1:** 20-30% would replay
- **P2:** > 30% would replay

**Action if P0/P1:**
- Multiple strategy paths
- Different outcomes worth exploring
- Share-worthy result screens
- Unlockables or achievements

---

## Clustering Methodology

### Step 1: Transcribe All Feedback
```
Create file: data/feedback-raw/YYYY-MM-DD-all-feedback.md

Format:
## Tester-01
**Profile:** [A/B/C/D]
**Device:** [Mobile/Desktop]
**Completion:** [Yes/No]
**Result:** [If completed]

### Confusing
"[Exact quote]"

### Strong Point
"[Exact quote]"

### Understood Outcome: [Yes/No]
### Territory Felt Real: [Yes/No]
### Would Replay: [Yes/No]
```

### Step 2: Tag Each Response
Add tags to each quote:
- `[P0]` / `[P1]` / `[P2]` / `[P3]`
- `[CONFUSION-PRIORITIES]`
- `[CONFUSION-ACTORS]`
- `[UNCLEAR-CONSEQUENCES]`
- `[MOBILE-ISSUES]`
- `[PACING]`
- `[TERRITORY-WEAK]`
- `[POLITICAL-WEAK]`
- `[REPLAY-LOW]`

### Step 3: Count & Cluster
Create summary table:

| Category | # Mentions | % of Testers | Severity | Action |
|----------|------------|--------------|----------|--------|
| Confusion Priorities | 4/8 | 50% | P0 | Add tutorial |
| Mobile Issues | 2/4 mobile | 50% | P1 | Bigger touch targets |
| ... | ... | ... | ... | ... |

### Step 4: Write Findings
```markdown
## Top 3 Friction Points
1. **[Category]** - X% of testers: "[Representative quote]"
2. **[Category]** - Y% of testers: "[Representative quote]"
3. **[Category]** - Z% of testers: "[Representative quote]"

## Top 3 Positive Signals
1. **[What worked]** - X% of testers: "[Quote]"
2. **[What worked]** - Y% of testers: "[Quote]"
3. **[What worked]** - Z% of testers: "[Quote]"
```

---

## Analysis Template

```markdown
# Feedback Analysis - Mutirão de Saneamento
**Date:** YYYY-MM-DD
**Sessions Analyzed:** N
**Response Rate:** X%

## Quantitative Summary
| Question | Yes | No | % Yes |
|----------|-----|-----|-------|
| Understood outcome? | X | Y | Z% |
| Territory felt real? | X | Y | Z% |
| Would replay? | X | Y | Z% |

## Qualitative Clusters

### Confusion About Priorities
- **Count:** X mentions (Y%)
- **Severity:** [P0/P1/P2]
- **Evidence:**
  - "[Quote 1]"
  - "[Quote 2]"
- **Recommended Action:** [Action]

### [Next Category]
...

## Cross-Cutting Themes
- **[Theme 1]:** [Description + evidence]
- **[Theme 2]:** [Description + evidence]

## Recommendations
### Must Fix (P0)
1. [Item]

### Should Fix (P1)
1. [Item]

### Could Improve (P2)
1. [Item]
```

---

*Qualitative Feedback Clustering System — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
