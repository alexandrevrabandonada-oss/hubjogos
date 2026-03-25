# T76: Internal Playtest Plan — Mutirão de Saneamento

**Sprint Duration:** 3-5 dias  
**Target Date:** 28-31 Março 2026  
**Status:** Preparação Completa (T75) → Validação Pendente

---

## 1. Tester Sample

### Minimum Required
| Perfil | Quantidade | Por quê |
|--------|------------|---------|
| **Equipe interna** | 3-4 pessoas | Conhecem o projeto, testam mecânicas |
| **Não-gamers / Casual** | 2-3 pessoas | Representam público-alvo real |
| **Mobile-first users** | 2 pessoas | Validam touch, responsive |
| **Desktop-focused** | 2 pessoas | Validam fluxo completo, legibilidade |
| **Observador com notas** | 1 pessoa | Think-aloud session |

**Total: 7-10 testers (mínimo 5 para validação estatística básica)**

### Tester Profiles

**Perfil A: Equipe Técnica (3-4)**
- Desenvolvedores/designers do projeto
- Conhecem intenções de design
- Focam em bugs, inconsistências
- Session: 20-30 min + debrief

**Perfil B: Jogadores Casuais (2-3)**
- Não trabalham com games
- Idade 25-45 anos
- Representam cidadãos comuns
- Session: 15-20 min + survey

**Perfil C: Mobile-Only (2)**
- Usam primariamente celular
- Testam em devices reais (não emulador)
- Focam em touch, scroll, legibilidade
- Session: 15 min observado

**Perfil D: Desktop-Only (2)**
- Usam laptop/desktop
- Focam em fluxo completo, estratégia
- Session: 20-30 min

---

## 2. Device & Browser Coverage

### Mobile Devices (Mínimo 2)
| Device | OS | Browser | Prioridade |
|--------|-----|---------|------------|
| Moto G Power (mid-range) | Android 13 | Chrome | Alta |
| iPhone SE / 11 | iOS 17 | Safari | Alta |
| Samsung A series | Android 12 | Chrome | Média |

### Desktop (Mínimo 2 browsers)
| OS | Browser | Resolução | Prioridade |
|----|---------|-----------|------------|
| Windows 11 | Chrome 120+ | 1920x1080 | Alta |
| macOS | Safari 17 | 1440x900 | Alta |
| Windows | Firefox | 1366x768 | Média |

### Test Conditions
- **Wi-Fi estável** (não testar em 3G/4G instável por enquanto)
- **Modo privado/incognito** (sem cache de sessões anteriores)
- **Limpar localStorage antes** (estado fresco)

---

## 3. Session Format

### Session Type A: Observada (Think-Aloud)
**Duração:** 20 min  
**Formato:** 1 tester + 1 observador  
**Device:** Mobile (prioridade) ou Desktop

**Script:**
1. (2 min) Setup: "Vou te pedir para falar em voz alta o que está pensando"
2. (1 min) Primeira impressão: o que vê na tela inicial
3. (15 min) Jogar até completar ou abandonar
4. (2 min) Debrief rápido: "O que entendeu do jogo?"

**Observador anota:**
- Primeira ação (quanto tempo demorou)
- Momentos de hesitação
- Cliques/taps errados
- Expressões de frustração
- O que verbalizou sobre objetivos

### Session Type B: Self-Guided + Survey
**Duração:** 15-20 min  
**Formato:** Tester joga sozinho, preenche feedback depois

**Flow:**
1. Recebe link
2. Joga (máximo 12 turnos ou até resultado)
3. Feedback form aparece automaticamente
4. Submete

### Session Type C: Focused Mobile Test
**Duração:** 15 min  
**Foco exclusivo:** Touch, responsividade, legibilidade

**Checklist do tester:**
- [ ] Conseguiu tocar nos botões sem erro
- [ ] Texto legível sem zoom
- [ ] Não houve scroll acidental
- [ ] Entendi onde estava no jogo
- [ ] Não me senti "perdido" na interface

---

## 4. Data Capture Requirements

### Automático (Telemetry)
| Dado | Onde vem | Como verificar |
|------|----------|----------------|
| Time to first interaction | `telemetry.ts` | `actions[0].timestamp - sessionStart` |
| Completion rate | `telemetry.ts` | `completed === true` |
| Exit before completion | `telemetry.ts` | `!completed && actions.length < 5` |
| Avg turns reached | `telemetry.ts` | `finalTurn` nos sessions completados |
| Replay rate | `telemetry.ts` | `replayed === true` |
| Share click rate | `telemetry.ts` | `shared === true` |
| Result distribution | `telemetry.ts` | `resultId` no complete |
| Actions frequency | `telemetry.ts` | Contagem por `actionType` |
| Energy depletion | `telemetry.ts` | Quando `energia === 0` |
| Health risk spikes | `telemetry.ts` | Quando `riscoSaude` aumenta > 2 pontos |

### Manual (Observador)
| Dado | Como capturar | Onde registrar |
|------|---------------|----------------|
| Confusion points | Anotações durante think-aloud | `observations/YYYY-MM-DD-tester-name.md` |
| Verbalized expectations | Transcrição frases-chave | Mesmo arquivo |
| Mobile tap errors | Contagem visual | Campo `mobileErrors` na planilha |
| Time to understand objective | Cronômetro até primeira ação intencional | `timeToFirstIntentionalAction` |

### Qualitativo (Feedback Form)
| Pergunta | Tipo | Propósito |
|----------|------|-----------|
| "O que foi mais confuso?" | Texto aberto | Identificar bloqueios |
| "O que funcionou bem?" | Texto aberto | Validar acertos |
| "Entendeu por que ganhou/perdeu?" | Sim/Não | Compreensão de resultado |
| "O bairro pareceu um lugar real?" | Sim/Não | Territorial atmosphere |
| "Jogaria novamente?" | Sim/Não | Replay intent |

---

## 5. Blocking vs Non-Blocking Issues

### P0 — BLOCKS BETA (Must Fix)
| Issue Type | Exemplo |
|------------|---------|
| Crash/bug impede progresso | Botão não responde, tela branca |
| Mobile inutilizável | Touch não funciona, texto ilegível |
| Estratégia dominante óbvia | Sempre fazer X = vitória garantida |
| Resultado incompreensível | Player não entende por que ganhou/perdeu |
| Completion rate < 40% | Mais da metade abandona |
| Replay rate < 15% | Quase ninguém quer jogar de novo |

### P1 — SERIOUS (Fix Before Beta if Possible)
| Issue Type | Exemplo |
|------------|---------|
| UX confusion em 30%+ testers | Muitos não entendem prioridades |
| Mobile friction significativa | Erros de tap frequentes |
| Balance skewado | 80% colapsam, ou 80% triunfam |
| Audio quebra experiência | Sons desagradáveis ou ausentes |
| Dengue pressure injusta | Surto parece aleatório/punitivo |

### P2 — POLISH (Can Fix During Beta)
| Issue Type | Exemplo |
|------------|---------|
| UI refinements | Cores, spacing, animações |
| Copy improvements | Textos mais claros |
| Performance otimizations | Load time, fps |
| Tutorial enhancements | Dicas adicionais |

### P3 — FUTURE (Post-Beta)
| Issue Type | Exemplo |
|------------|---------|
| Novas features | Mais ações, atores |
| Melhorias visuais | Assets finais, animações |
| Som ambiente | Trilha sonora, sfx ambientes |
| Multiplayer | Competitivo, coop |

---

## 6. Success Criteria for Go

### Hard Thresholds (Todos devem passar)
| Métrica | Threshold | Como medir |
|---------|-----------|------------|
| Completion rate | ≥ 60% | `telemetry.ts` |
| Avg turns reached | ≥ 9 | `telemetry.ts` |
| Mobile completion | ≥ 50% | Filtrar por device |
| No P0 bugs | 0 issues | Issue tracker |

### Soft Targets (Flexíveis)
| Métrica | Target | Aceitável |
|---------|--------|-----------|
| Replay rate | ≥ 30% | ≥ 20% |
| Share rate | ≥ 10% | ≥ 5% |
| Result distribution | Balanced | Não 80% em um estado |
| Time to first interaction | < 10s | < 15s |

### Qualitative Signals
| Signal | Good | Bad |
|--------|------|-----|
| "Entendi objetivo" | ≥ 70% | < 50% |
| "Bairro pareceu real" | ≥ 60% | < 40% |
| "Jogaria novamente" | ≥ 60% | < 30% |
| Confusion mentions | < 30% testers | > 50% testers |

---

## 7. Sprint Schedule

### Dia 1: Setup
- [ ] Recrutar testers
- [ ] Preparar devices
- [ ] Brief observadores
- [ ] Limpar dados de teste anteriores

### Dia 2-3: Sessions
- [ ] 3-4 sessions (mix mobile/desktop)
- [ ] 1 think-aloud observado
- [ ] Export telemetry após cada batch
- [ ] Registrar notas de observação

### Dia 4: Analysis
- [ ] Review telemetry agregado
- [ ] Cluster feedback qualitativo
- [ ] Identificar P0/P1 issues
- [ ] Preparar triage

### Dia 5: Decision
- [ ] Go/No-Go meeting
- [ ] Documentar decisão
- [ ] Se Go: planejar closed beta
- [ ] Se No-Go: criar plano de hardening v2

---

## 8. Artifacts Checklist

### Pré-Sprint (T75 → T76)
- [x] Telemetry implementado
- [x] Feedback form pronto
- [x] Balance tuning aplicado
- [x] Mobile CSS otimizado
- [x] Audio baseline implementado

### Durante Sprint
- [ ] `playtest-runbook.md` (operador segue)
- [ ] `telemetry-review.md` (dados agregados)
- [ ] `observation-notes/` (notas think-aloud)
- [ ] `feedback-clustering.md` (temas identificados)

### Pós-Sprint
- [ ] `comprehension-audit.md` (checklist preenchido)
- [ ] `balance-audit.md` (findings de balance)
- [ ] `mobile-audit.md` (issues mobile)
- [ ] `issue-triage.md` (P0/P1/P2/P3)
- [ ] `beta-decision.md` (framework aplicado)
- [ ] `T76-final-report.md` (documento entregue)

---

*Internal Playtest Plan — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
