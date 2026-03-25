# T75: Beta Hardening Plan — Mutirão de Saneamento

## Diagnóstico Frio do Slice T74

### Forças
- Loop de gameplay funcional e legível
- Integração T69-T72 completa
- Mensagem política clara sem ser pesada
- Responsivo mobile/desktop
- 5 estados de resultado distintos

### Fraquezas Identificadas
| Área | Problema | Impacto |
|------|----------|---------|
| **Balanceamento** | Custo de energia pode parecer arbitrário | Estratégia não emergente |
| **UX** | Prioridades não claras no início | Paralisia do jogador |
| **Mobile** | Touch targets pequenos em ações | Frustração, erros |
| **Áudio** | Silêncio completo | Experiência "vazia" |
| **Arte** | Ícones genéricos, HUD sem hierarquia | Percepção de baixa qualidade |
| **Resultados** | Transição pouco dramática | Anticlimax |
| **Telemetria** | Sem visibilidade de comportamento | Cego a problemas reais |

### Riscos Abertos
1. **Jogadores não entendem por que ganharam/perderam**
2. **Estratégia dominante óbvia** (sempre fazer X)
3. **Mobile impreciso** → abandono
4. **Sem dados** → decisões às cegas
5. **Sem áudio** → imersão quebrada

---

## Plano de Hardening — 8 Áreas de Foco

### 1. Instrumentação (Telemetria)
**Objetivo:** Visibilidade completa do comportamento do jogador

**Sinais a trackear:**
- `time_to_first_interaction` — Engajamento inicial
- `actions_per_run` — Profundidade de exploração
- `trust_curve` — Arco emocional
- `energy_depletion_moments` — Picos de dificuldade
- `health_risk_spikes` — Crises percebidas
- `turn_reached` — Retenção
- `fail_state_frequency` — Dificuldade real
- `result_distribution` — Balanceamento de resultado
- `replay_rate` — Satisfação
- `share_click_rate` — Viralidade
- `exit_before_completion` — Abandono

**Entregável:** `lib/games/mutirao/telemetry.ts`

---

### 2. Balance Pass
**Objetivo:** Evitar dificuldade falsa, facilidade falsa, ou estratégia única

**Audit:**
| Sistema | Estado Atual | Problema | Ajuste Proposto |
|---------|-------------|----------|----------------|
| Energia | 30 inicial, +5/turno | Rápido esgotamento | 40 inicial, +6/turno |
| Conversar | -2 energia, +5 confiança | Pouco atrativo | -1 energia, +4 confiança |
| Mobilizar | -5 energia, +10 confiança | Alto custo, alto retorno | -4 energia, +8 confiança |
| Obra | -10 energia, +15% cobertura | Única escolha óbvia | -12 energia, +20% cobertura, precisa confiança ≥40 |
| Limpeza | -8 energia, -3 risco | Alternativa válida | -6 energia, -2 risco, +3 confiança |
| Dengue | Turno 8, +3 risco | Surto tardio | Turno 7, +2 risco, aviso no turno 6 |

**Entregável:** `lib/games/mutirao/balance.ts`

---

### 3. UX Readability
**Objetivo:** Clareza total de prioridades e consequências

**Fricções a Resolver:**
- **Prioridades:** Adicionar "Próxima Ação Sugerida" para primeiros 3 turnos
- **Atores:** Tooltips explicando papel de cada ator
- **Urgência:** Indicador visual de "Risco de Saúde" com alerta em ≥6
- **Consequências:** Preview de efeito ao hover em ação
- **Falha:** Explicação clara no resultado de por que perdeu

**Entregável:** Melhorias em `MutiraoGame.tsx` + `MutiraoGame.module.css`

---

### 4. Mobile Validation
**Objetivo:** Touch confortável, sem erros acidentais

**Ações:**
- Aumentar touch targets para 48x48px mínimo
- Adicionar `touch-action: manipulation` para prevenir zoom acidental
- Implementar swipe para ações secundárias
- Adicionar vibração sutil (haptic) em ações confirmadas
- Testar orientação landscape (desativar ou suportar)
- Verificar performance em Moto G / iPhone SE (2020)

**Entregável:** CSS mobile + otimizações React

---

### 5. Audio Baseline
**Objetivo:** Experiência sonora intencional, não vazia

**Sons mínimos:**
| Evento | Som | Prioridade |
|--------|-----|------------|
| UI Click | Click curto, orgânico | Alta |
| Ação Confirmada | Som de sucesso leve | Alta |
| Alerta/Crise | Tom de tensão curto | Alta |
| Resultado | Transição sonora | Média |
| Toggle Mute | Feedback sonoro | Média |

**Implementação:** Web Audio API, sem dependências externas
**Entregável:** `lib/games/mutirao/audio.ts`

---

### 6. Art Upgrade
**Objetivo:** Qualidade percebida aumentada nos pontos mais visíveis

**Prioridades:**
1. **HUD Status Bar:** Hierarquia visual mais clara (tamanhos, cores, ícones)
2. **Actor Icons:** Substituição de emojis por ícones estilizados
3. **Result Screen:** Visual mais dramático, celebração/impacto
4. **Environmental Depth:** Background com textura da Vila Esperança
5. **Action Buttons:** Estados hover/active mais definidos

**Entregável:** `MutiraoGame.module.css` + assets

---

### 7. Result Clarity
**Objetivo:** 5 resultados distintos, emocionalmente legíveis, politicamente significativos

**Revisão por Estado:**
| Estado | Problema | Melhoria |
|--------|----------|----------|
| Cuidado Floresceu | Parece fácil demais? | Aumentar threshold: 85% cobertura |
| Bairro Respirou | Muito similar ao anterior | Diferenciar mais visualmente |
| Crise Contida | Neutro pode parecer derrota | Reframing: "Resistência sustentada" |
| Mutirão Insuficiente | Vago | Especificar: "Esforço não sustentado" |
| Abandono Venceu | Muito negativo? | Manter — deve doer um pouco |

**Entregável:** Atualização em `mutirao-saneamento.ts` + CSS

---

### 8. Playtest Feedback Capture
**Objetivo:** Aprendizado estruturado de jogadores reais

**Sistema simples:**
- Form pós-jogo (3-5 perguntas)
- Botão "Enviar Feedback" no result screen
- Captura automática de: resultado, turnos, ações, tempo
- Armazenamento local para análise

**Perguntas:**
1. O que foi mais confuso?
2. O que funcionou bem?
3. Entendeu por que ganhou/perdeu?
4. Sentiu o bairro como lugar real?
5. Jogaria novamente/compartilharia?

**Entregável:** `components/games/mutirao/FeedbackForm.tsx`

---

## Beta Exit Criteria

### Checklist de Saída

| Critério | Threshold | Status |
|----------|-----------|--------|
| No major UX confusion | 0 bloqueios reportados em 5+ playtests | ⬜ |
| No dominant strategy | ≥2 estratégias viáveis em dados | ⬜ |
| Mobile performance | 60fps em Moto G | ⬜ |
| Audio baseline | 5 sons implementados | ⬜ |
| Key art improved | HUD, icons, result screen | ⬜ |
| Healthy result distribution | ≥10% em cada resultado em 20+ runs | ⬜ |
| Win/loss understood | 80% entendem por que | ⬜ |
| Credible replay rate | ≥30% replay após primeiro run | ⬜ |
| Share rate | ≥10% tentam compartilhar | ⬜ |

**Definition of Beta Ready:**
> O jogo é estável, legível, justo, e gera os resultados emocionais e políticos pretendidos. Não há bloqueios críticos. Pronto para teste público controlado.

---

## Ordem de Implementação

1. **Telemetria** — Habilitar observação
2. **Balance** — Correções fundamentais
3. **UX Readability** — Clareza de jogabilidade
4. **Mobile** — Acessibilidade
5. **Audio** — Imerção
6. **Art** — Percepção de qualidade
7. **Results** — Impacto emocional
8. **Feedback Capture** — Fechar o loop
9. **Exit Criteria** — Definir pronto
10. **Report** — Documentar

**Meta:** Beta candidato em 1-2 semanas de trabalho focado.

---

*Plano T75 — Beta Hardening*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
