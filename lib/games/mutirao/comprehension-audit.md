# T76: Core Comprehension Audit Checklist

**Purpose:** Verify whether players understand fundamental game concepts.

---

## The 6 Core Comprehension Questions

Players must understand:
1. What am I trying to do? (Objective)
2. What do the main resources mean? (Resources)
3. Why did I win or lose? (Outcome causality)
4. Why are some actions blocked? (Action requirements)
5. What changed after each turn? (Turn consequences)
6. What should I prioritize? (Strategy)

---

## Audit Methodology

### Data Sources
| Source | What it tells us |
|--------|------------------|
| Think-aloud transcripts | Verbalized confusion |
| Feedback form Q1 | "O que foi mais confuso?" |
| Feedback form Q3 | "Entendeu por que ganhou/perdeu?" |
| Telemetry: time to first action | Hesitation indicator |
| Telemetry: action patterns | Random vs intentional play |
| Observation notes | Moments of pause/hesitation |

### Scoring
| Level | Definition |
|-------|------------|
| **Strong** | ≥ 70% demonstrate clear understanding |
| **Acceptable** | 50-70% demonstrate understanding |
| **Weak** | < 50% demonstrate understanding |

---

## Comprehension Audit Checklist

### Q1: What am I trying to do?
**Evidence of understanding:**
- [ ] Can articulate goal within first 3 turns
- [ ] Mentions "melhorar bairro", "saneamento", "cobertura"
- [ ] Doesn't ask "qual o objetivo?" after playing

**How to verify:**
```
Think-aloud probe: "O que você está tentando fazer?"
Feedback form: Look for "não entendi objetivo"
Telemetry: Check if first actions are goal-directed (not random clicks)
```

**Thresholds:**
- Strong: ≥ 80% can articulate within 3 turns
- Acceptable: 60-80% can articulate
- Weak: < 60% can articulate

**If Weak:**
- Add pre-game objective screen
- Stronger first-turn guidance
- Highlight "Cobertura" as primary goal

---

### Q2: What do the main resources mean?
**Evidence of understanding:**
- [ ] Knows Confiança = mobilização comunitária
- [ ] Knows Energia = capacidade de ação
- [ ] Knows Risco de Saúde = ameaça de dengue
- [ ] Knows Cobertura = progresso principal

**How to verify:**
```
Think-aloud: "O que esses números representam?"
Feedback form: "Não entendi o que é risco de saúde"
Telemetry: Do they address health risk when it's high?
```

**Thresholds:**
- Strong: ≥ 70% understand all 4 resources
- Acceptable: 50-70% understand
- Weak: < 50% understand

**If Weak:**
- Resource tooltips on hover
- One-time tutorial on first encounter
- Visual metaphors (heart for confiança, etc.)

---

### Q3: Why did I win or lose?
**Evidence of understanding:**
- [ ] Can connect result to their actions
- [ ] Mentions specific resources ("porque minha cobertura estava baixa")
- [ ] Doesn't say "foi sorte" or "não sei"

**How to verify:**
```
Feedback form Q3: "Entendeu por que ganhou/perdeu?"
Think-aloud at result screen: "Por que você acha que aconteceu isso?"
Telemetry: Compare high/low coverage sessions to results
```

**Thresholds:**
- Strong: ≥ 80% say Yes on feedback form
- Acceptable: 60-80% say Yes
- Weak: < 60% say Yes

**If Weak:**
- Stronger result screen with causal breakdown
- Pre-result summary of key decisions
- Visual timeline of resource changes

---

### Q4: Why are some actions blocked?
**Evidence of understanding:**
- [ ] Knows "Executar Obra" needs 40% confiança
- [ ] Doesn't repeatedly click disabled buttons
- [ ] Verbalizes "preciso mobilizar primeiro"

**How to verify:**
```
Think-aloud when seeing disabled: "Por que não posso clicar?"
Telemetry: Count repeated attempts on disabled actions
Observation: Do they try alternatives or just stall?
```

**Thresholds:**
- Strong: ≥ 70% understand requirements after first block
- Acceptable: 50-70% understand
- Weak: < 50% understand

**If Weak:**
- Better disabled-state messaging
- Hover tooltip: "Precisa de 40% confiança"
- Alternative actions highlighted when main blocked

---

### Q5: What changed after each turn?
**Evidence of understanding:**
- [ ] Notices when confiança decays
- [ ] Notices dengue warning
- [ ] Notices energy regeneration
- [ ] Doesn't ask "por que mudou?"

**How to verify:**
```
Think-aloud at turn transition: "O que mudou?"
Feedback form: "Não entendi o que aconteceu depois..."
Telemetry: Compare actions before/after warnings
```

**Thresholds:**
- Strong: ≥ 70% notice major changes
- Acceptable: 50-70% notice
- Weak: < 50% notice

**If Weak:**
- Stronger turn-transition animation
- Summary of changes popup
- Highlight changed resources in different color

---

### Q6: What should I prioritize?
**Evidence of understanding:**
- [ ] Early game: focuses on confiança/mobilização
- [ ] Mid game: balances actions
- [ ] Late game: pushes for coverage
- [ ] Addresses health risk when high

**How to verify:**
```
Think-aloud: "O que você vai fazer agora? Por quê?"
Telemetry: Action sequence patterns
  - Good: talk → mobilize → obra
  - Bad: obra → obra → obra (if blocked) or random
```

**Thresholds:**
- Strong: ≥ 60% show strategic sequencing
- Acceptable: 40-60% show strategy
- Weak: < 40% strategic

**If Weak:**
- Suggested action highlighting
- Strategy hints after 2 turns of inaction
- Pre-action confirmation with consequence preview

---

## Comprehension Audit Report Template

```markdown
# Core Comprehension Audit - Mutirão de Saneamento
**Date:** YYYY-MM-DD
**Testers:** N
**Method:** Think-aloud + Feedback form + Telemetry

## Summary Score
| Question | Score | Status |
|----------|-------|--------|
| Q1: Objective | X% | [Strong/Acceptable/Weak] |
| Q2: Resources | X% | [Strong/Acceptable/Weak] |
| Q3: Outcome causality | X% | [Strong/Acceptable/Weak] |
| Q4: Action blocking | X% | [Strong/Acceptable/Weak] |
| Q5: Turn changes | X% | [Strong/Acceptable/Weak] |
| Q6: Strategy | X% | [Strong/Acceptable/Weak] |

**Overall:** [PASS / NEEDS WORK / FAIL]

## Detailed Findings

### Q1: Objective Understanding
**Score:** X% (Y/Z testers)

**Evidence:**
- Positive: "[Quote showing understanding]"
- Negative: "[Quote showing confusion]"

**Recommendations:**
- [Action item]

### Q2: Resources Understanding
...

### Q3: Outcome Causality
...

### Q4: Action Blocking
...

### Q5: Turn Changes
...

### Q6: Strategy
...

## Priority Actions

### Must Fix (if any score is Weak)
1. [Action]

### Should Improve (Acceptable scores)
1. [Action]

## Re-test Criteria
Re-run audit after fixes when:
- All scores ≥ Acceptable
- No P0 comprehension blocks remain
```

---

## Quick Reference: Verbal Cues

### Understanding Cues (Good)
- "Preciso mobilizar antes de construir"
- "Meu risco de dengue está alto, preciso fazer mutirão"
- "Perdi porque não cobri o bairro inteiro"
- "Vou conversar com o líder primeiro"

### Confusion Cues (Bad)
- "Não sei o que fazer"
- "Por que não posso clicar?"
- "O que é esse número?"
- "Por que perdi?"
- "Isso faz o quê?"

---

*Core Comprehension Audit — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
