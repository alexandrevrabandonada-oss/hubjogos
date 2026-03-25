# T75: Mutirão de Saneamento — Beta Hardening + Playtest Loop

**Data:** 24 de Março de 2026  
**Versão:** v1.0 — Beta Hardening Completo  
**Status:** ✅ Pronto para Playtest

---

## 1. Diagnóstico Frio do Slice T74

### Forças do Slice Original
| Aspecto | Avaliação |
|---------|-----------|
| Loop de gameplay | Funcional e legível |
| Integração T69-T72 | Stack completo operacional |
| Mensagem política | Clara sem ser pesada |
| Responsividade | Mobile + Desktop funcionando |
| Resultados | 5 estados distintos implementados |

### Fraquezas Identificadas
| Área | Problema | Risco |
|------|----------|-------|
| **Balanceamento** | Custos de energia arbitrários | Estratégia não emergente |
| **UX** | Prioridades não claras no início | Paralisia do jogador |
| **Mobile** | Touch targets pequenos | Erros acidentais, frustração |
| **Áudio** | Silêncio completo | Experiência "vazia" |
| **Arte** | Ícones genéricos, HUD sem hierarquia | Percepção de baixa qualidade |
| **Telemetria** | Sem visibilidade de comportamento | Cego a problemas reais |

### Riscos Abertos
1. Jogadores não entendem por que ganharam/perderam
2. Estratégia dominante óbvia (sempre fazer X)
3. Mobile impreciso → abandono
4. Sem dados → decisões às cegas
5. Sem áudio → imersão quebrada

---

## 2. Plano de Hardening Executado

### 2.1 Instrumentação (Telemetria)

**Arquivo:** `lib/games/mutirao/telemetry.ts` (~180 linhas)

**Sinais Implementados:**
| Sinal | Descrição | Uso |
|-------|-----------|-----|
| `time_to_first_interaction` | Tempo até primeira ação | Medir engajamento inicial |
| `actions_per_run` | Total de ações por sessão | Profundidade de exploração |
| `trust_curve` | Snapshots de confiança | Arco emocional |
| `energy_depletion_moments` | Quando energia acaba | Picos de dificuldade |
| `health_risk_spikes` | Quando risco sobe | Crises percebidas |
| `turn_reached` | Turno final alcançado | Retenção |
| `fail_state_frequency` | Taxa de fracasso | Dificuldade real |
| `result_distribution` | Distribuição dos 5 resultados | Balanceamento |
| `replay_rate` | Taxa de replay | Satisfação |
| `share_click_rate` | Taxa de compartilhamento | Viralidade |
| `exit_before_completion` | Abandono antes do fim | Frustração |

**APIs Expostas:**
- `startTelemetrySession()` — Inicia tracking
- `recordAction(type, turn, metadata)` — Registra ações
- `recordStateSnapshot(...)` — Captura estado
- `completeSession(...)` — Finaliza com resultado
- `getTelemetryAggregate()` — Analytics agregados
- `exportTelemetryData()` — Export para análise

### 2.2 Balance Pass

**Arquivo:** `lib/games/mutirao/balance.ts` (~220 linhas)

**Mudanças de Balanceamento:**

| Aspecto | Antes | Depois | Rationale |
|---------|-------|--------|-----------|
| **Energia inicial** | 30 | 40 | Menos punishing no início |
| **Regeneração** | +5/turno | +6/turno | Mais forgiving |
| **Conversar custo** | 2 | 1 | Mais acessível |
| **Mobilizar custo** | 5 | 4 | Levemente mais barato |
| **Executar Obra custo** | 10 | 12 | Maior comprometimento |
| **Executar Obra requisito** | Nenhum | 40% confiança | Força mobilização primeiro |
| **Mutirão Limpeza custo** | 8 | 6 | Alternativa viável |
| **Dengue turno** | 8 | 7 | Pressão mais cedo |
| **Dengue aviso** | Nenhum | Turno 6 | Dá tempo de reagir |
| **Triumph threshold** | 80% | 85% cobertura | Mais difícil de alcançar |

**Funções de Balance:**
- `canExecuteObra()` — Verifica se pode executar
- `getObraDisabledReason()` — Explica por que não pode
- `calculateResultSeverity()` — Determina resultado
- `shouldTriggerDengueWarning()` — Aviso preventivo
- `shouldTriggerDengueOutbreak()` — Surto de dengue
- `shouldDecayConfianca()` — Decaimento de confiança

### 2.3 UX Readability

**Melhorias no Componente:**

1. **Tutorial Embutido**
   - Dicas contextuais nos primeiros 3 turnos
   - Guia visual de "Próxima Ação Sugerida"

2. **Alertas de Crise**
   - Banner visual quando dengue está próximo
   - Aviso no log 1 turno antes do surto

3. **Feedback de Ações**
   - Efeitos mostrados imediatamente no log
   - Ícones indicando tipo de efeito (📈 📉)

4. **Preview de Efeitos**
   - Custo/benefício visível em cada botão
   - Estados disabled com tooltip explicativo

5. **Hierarquia de Urgência**
   - Risco de saúde ≥6 fica vermelho e pulsa
   - Indicadores visuais de prioridade

### 2.4 Audio Baseline

**Arquivo:** `lib/games/mutirao/audio.ts` (~140 linhas)

**Sons Implementados (Web Audio API):**

| Evento | Som | Descrição |
|--------|-----|-----------|
| `playUIClick()` | Click curto 800Hz | Feedback de interação |
| `playActionConfirm()` | Two-tone A4→C#5 | Ação bem-sucedida |
| `playAlert()` | 400Hz sawtooth | Aviso preventivo |
| `playCrisisAlert()` | 3 beeps descendentes | Surto de dengue |
| `playResultTransition()` | Fanfare ou sombra | Baseado na severidade |

**Integração:**
- Hook `useMutiraoAudio()` para React
- Mute toggle com feedback sonoro
- Nenhuma dependência externa

### 2.5 Art Upgrade

**Melhorias Visuais:**

1. **Status Bar**
   - Cores diferenciadas por métrica
   - Barras de progresso animadas
   - Alertas visuais para valores críticos

2. **Actor Icons**
   - Emojis estilizados com background
   - Estados hover/selected claros
   - Tooltips com descrição de papel

3. **Action Buttons**
   - Estados: normal, hover, disabled
   - Preview de custo/benefício
   - Indicadores de requisitos não atendidos

4. **Result Screen**
   - Cores por severidade
   - Métricas secundárias destacadas
   - Transição sonora dramática

5. **Territorial Atmosphere**
   - Gradient earth colors (marrom → verde)
   - Background texturizado
   - Visualização de casas atendidas/não atendidas

### 2.6 Mobile Validation

**Otimizações Implementadas:**

| Aspecto | Implementação |
|---------|---------------|
| Touch targets | ≥48x48px em todos botões |
| Touch action | `touch-action: manipulation` previne zoom acidental |
| Responsive breakpoints | 1024px, 768px, 480px |
| Font sizes | ≥14px mobile, ≥16px desktop |
| Layout | Grid adaptativo, 4 colunas → 1 coluna |
| Haptic feedback | Placeholder para `navigator.vibrate()` |

### 2.7 Result Clarity

**5 Estados Refinados:**

| Estado | Threshold (Novo) | Visual |
|--------|-----------------|--------|
| **Cuidado Floresceu** | Cobertura ≥85%, Confiança ≥80% | 🏆 Dourado, fanfare |
| **Bairro Respirou** | Cobertura ≥70%, Confiança ≥60% | ✅ Verde, celebração |
| **Crise Contida** | Cobertura ≥40%, Confiança ≥30% | ◆ Azul, neutro |
| **Mutirão Insuficiente** | Cobertura ≥20%, Confiança ≥10% | ⚡ Laranja, alerta |
| **Abandono Venceu** | Abaixo de struggle | ⚠️ Vermelho, sombra |

**Framing Político:** Cada resultado mantém mensagem ideológica clara.

### 2.8 Playtest Feedback Capture

**Arquivo:** `components/games/mutirao/FeedbackForm.tsx` (~170 linhas)

**Perguntas Capturadas:**
1. O que foi mais confuso? (texto aberto)
2. O que funcionou bem? (texto aberto)
3. Entendeu por que ganhou/perdeu? (sim/não)
4. O bairro pareceu lugar real? (sim/não)
5. Jogaria novamente/compartilharia? (sim/não)

**Integração com Telemetry:**
- Feedback correlacionado com dados de gameplay
- Stored em localStorage (últimos 50)
- Exportável para análise

---

## 3. Beta Exit Criteria

### Definition of Beta Ready
> O jogo é estável, legível, justo, e gera os resultados emocionais e políticos pretendidos. Não há bloqueios críticos. Pronto para teste público controlado.

### Checklist de Saída

| Categoria | Critério | Status |
|-----------|----------|--------|
| **UX** | No major confusion em 5+ playtests | ⬜ Pendente playtests |
| **UX** | 80% entendem prioridades nos primeiros 3 turnos | ⬜ Pendente dados |
| **Balance** | ≥2 estratégias viáveis | ✅ Implementado |
| **Balance** | 40-60% vitórias (success+) | ⬜ Pendente dados |
| **Mobile** | Touch confortável, ≥48x48px | ✅ Implementado |
| **Mobile** | 60fps em devices mid-range | ⬜ Pendente teste |
| **Audio** | 5 sons implementados | ✅ Implementado |
| **Art** | HUD hierarquia clara | ✅ Implementado |
| **Results** | 5 estados distintos | ✅ Implementado |
| **Telemetry** | 11 sinais capturados | ✅ Implementado |
| **Replay** | ≥30% replay rate | ⬜ Pendente dados |
| **Share** | ≥10% share rate | ⬜ Pendente dados |

### Métricas de Sucesso (Targets)

**Engagement:**
- Time to first interaction: < 10s
- Avg actions per run: 8-15
- Completion rate: > 60%

**Balance:**
- Result distribution: 10-15% triumph, 20-30% success, 20-30% neutral, 15-25% struggle, 10-15% collapse

**Satisfaction:**
- Exit before completion: < 30%
- Replay rate: > 30%
- Would recommend: > 70%

---

## 4. Arquivos Criados/Modificados

### Novos Arquivos

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `lib/games/mutirao/beta-hardening-plan.md` | ~250 | Plano de hardening detalhado |
| `lib/games/mutirao/telemetry.ts` | ~180 | Sistema de telemetria |
| `lib/games/mutirao/balance.ts` | ~220 | Configuração de balanceamento |
| `lib/games/mutirao/audio.ts` | ~140 | Sistema de áudio |
| `lib/games/mutirao/beta-exit-criteria.md` | ~200 | Critérios de saída beta |
| `components/games/mutirao/FeedbackForm.tsx` | ~170 | Form de feedback |
| `components/games/mutirao/FeedbackForm.module.css` | ~150 | Estilos do form |

### Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `components/games/MutiraoGame.tsx` | Integração T75: audio, telemetry, balance |
| `components/games/MutiraoGame.module.css` | UX improvements, mobile optimization |

**Total T75:** ~1.500 linhas novas + modificações significativas

---

## 5. Recomendação: Beta Ready?

### Status Atual: 🟡 PRONTO PARA PLAYTEST INTERNO

**O que está pronto:**
- ✅ Sistemas de gameplay hardenados
- ✅ Balanceamento revisado
- ✅ Telemetria operacional
- ✅ Audio baseline implementado
- ✅ UX readability melhorado
- ✅ Mobile optimization aplicada
- ✅ Feedback capture system pronto
- ✅ Beta exit criteria definidos

**O que falta (pré-beta):**
- ⬜ Playtests internos (5+ sessões)
- ⬜ Mobile performance test em devices reais
- ⬜ Análise inicial de telemetry
- ⬜ Ajustes rápidos baseados em dados

### Processo Recomendado

**Fase 1: Internal Playtest (1-2 dias)**
- Equipe interna joga
- Coleta via FeedbackForm
- Análise de telemetry
- Ajustes rápidos

**Fase 2: Friends & Family (3-5 dias)**
- 10-20 pessoas próximas
- Feedback obrigatório
- Validação de métricas

**Fase 3: Closed Beta (1-2 semanas)**
- Lista de espera/convidados
- 50-100 jogadores
- A/B testing de balance

**Go/No-Go Decision:**
- Go se: completion > 60%, no dominant strategy, 0 bloqueios críticos
- No-Go se: completion < 40%, UX confusion > 30%, bugs críticos

---

## 6. Lições Aprendidas

### O que Funcionou
1. **Separação de concerns:** Módulos independentes (telemetry, balance, audio) facilitaram testes
2. **Constantes centralizadas:** `BALANCE_*` constants tornaram tuning rápido
3. **Hook-based audio:** Integração React simples sem side-effects
4. **Telemetry não-invasiva:** Funciona em background, não afeta gameplay

### O que Melhorar no Próximo Jogo
1. **Audio earlier:** Implementar áudio desde o início, não depois
2. **Mobile first:** Design mobile-first, não adaptação
3. **Telemetry first:** Instrumentar desde o protótipo
4. **Asset pipeline:** Definir placeholders vs finals mais cedo

---

## 7. Próximos Passos

### Imediatos (esta semana)
- [ ] Rodar 5 playtests internos
- [ ] Coletar feedback via FeedbackForm
- [ ] Analisar telemetry data
- [ ] Ajustar balance se necessário

### Curtos (próximas 2 semanas)
- [ ] Fechar Beta se métricas forem boas
- [ ] Ou: iterar mais se necessário
- [ ] Preparar marketing para beta público

### Médios (próximo mês)
- [ ] Assets finais (se orçamento permitir)
- [ ] Sons ambientes (opcional)
- [ ] Analytics dashboard
- [ ] Próximo jogo da fila T73

---

## Anexos

### A. Export Telemetry
```typescript
import { exportTelemetryData } from '@/lib/games/mutirao/telemetry';
console.log(exportTelemetryData()); // JSON completo
```

### B. Balance Tuning
```typescript
// Ajustar em lib/games/mutirao/balance.ts
export const BALANCE_ENERGY_COSTS = {
  conversar: 1,  // ← mudar aqui
  // ...
};
```

### C. Audio Toggle
```typescript
import { toggleMute } from '@/lib/games/mutirao/audio';
// Botão de mute no HUD
<button onClick={toggleMute}>🔊/🔇</button>
```

---

*T75 — Mutirão de Saneamento Beta Hardening*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Desenvolvedor: Cascade AI*  
*Data: 24 de Março de 2026*
