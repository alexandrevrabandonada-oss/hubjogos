# Game Feel & Diversão – Linha Arcade

## Objetivo

Documentar os princípios de game feel para a linha arcade, com métricas observáveis de qualidade de experiência. Este arquivo guia melhorias de diversão, replayability e clareza política em todos os arcades.

---

## 1. O que é Game Feel?

**Game Feel** é a sensação em tempo real que o jogador experimenta ao interagir com o jogo. Não é dificuldade, narração, ou gráficos – é a qualidade tátil e temporal das respostas imediatas do jogo às ações do jogador.

**Em arcades da pré-campanha:**
- Feedback imediato de entrada (input responsiveness)
- Clareza de risco e recompensa a cada decisão
- Ritmo natural que convida ao replay
- Política transmitida por mecânica, não por diálogo

---

## 2. Dimensões de Game Feel para Arcade

### 2.1 Time to Fun
**Métrica**: Segundos até o primeiro momento memorável/gratificante.

**Padrão Arcade**: 0–3 segundos (primeira coleta, primeira decision).

**Tarifa Zero RJ - Estado Atual**:
- ✅ Spawn imediato de entidades (~0.5s)
- ✅ Primeira coleta possível em <2s
- ⚠️ Sem feedback sonoro ou visual forte na primeira coleta
- ⚠️ Combo window (6.5s) não sinalizado visualmente

**Melhoria**: Flash de coleta no HUD, indicador de combo timer em tela.

---

### 2.2 Feedback de Input
**Métrica**: Latência + clareza visual da resposta à ação do jogador.

**Padrão Arcade**: <50ms percebido, mudança visual clara.

**Tarifa Zero RJ - Estado Atual**:
- ✅ Keyboard (A/D, arrows): ~16ms (1 frame), imediato
- ✅ Touch/Mouse: ~33ms (2 frames), suave
- ✅ Player sprite se move imediatamente
- ⚠️ Sem highlight de lane no movimento (muito sutil)
- ⚠️ Sem som de movimento/mudança de faixa
- ⚠️ Lane flash apenas em bloqueio (vermelho breve), não em sucesso

**Melhoria**: Highlight de lane mais saturado, som leve de movimento, feedback visual em apoio/mutirão.

---

### 2.3 Clareza de Risco & Recompensa
**Métrica**: Pode o jogador entender instantly o que cada entidade faz?

**Tarifa Zero RJ - Estado Atual**:
- ✅ Cores diferentes (verde=apoio, vermelho=bloqueio, amarelo=mutirão, cinza=individualismo)
- ✅ Ícones/símbolos (+, X, M, $)
- ⚠️ "Mutirão" e "Individualismo" pouco distinguíveis
- ⚠️ Sem tooltip/label nas entidades
- ⚠️ Sem indicador de quanto de "common" cada ação dá/tira

**Melhoria**: Tamanho maior para mutirão, som de "sucesso coletivo" no mutirão, animação de pulso no combo timer.

---

### 2.4 Legibilidade do HUD
**Métrica**: Pode o jogador ver score, meter e tempo sem interrupção do gameplay?

**Tarifa Zero RJ - Estado Atual**:
- ✅ HUD minimalista (score, "Comum %", progress bar)
- ✅ Fontes grandes e legíveis em mobile
- ⚠️ "Comum %" muda muito rapidamente, difícil acompanhar mudança
- ⚠️ Progress bar verde não contrastar bem com fundo escuro em alguns casos
- ⚠️ Sem indicador de combo ativo (apenas timer)

**Melhoria**: Meter com transição suave (interpolação), indicador visual de combo ativo, fonte levemente maior para % comum.

---

### 2.5 Sensação de Velocidade & Ritmo
**Métrica**: O jogo sente dinâmico, crescente, controlável?

**Tarifa Zero RJ - Estado Atual**:
- ✅ Dificuldade rampa linearmente (spawn cooldown diminui 170ms ao longo de 55s)
- ✅ Velocidade das entidades aumenta (180 a 300 px/s)
- ✅ 55s é tempo bom para arcade (não cansativo)
- ⚠️ Sem aceleração de ritmo visual (tudo igual do começo ao fim)
- ⚠️ Sem efeito de câmera ou zoom dinâmico
- ⚠️ Sem entrada de novos tipos de entidades ao longo do tempo

**Melhoria**: Background mais rápido perto do fim, tipo novo (ex: "chance") nos últimos 15s, sons mais rápidos conforme progride.

---

### 2.6 Clareza de Acerto vs. Erro
**Métrica**: Feedback distinguível entre boa decisão e má decisão?

**Tarifa Zero RJ - Estado Atual**:
- ✅ Flash vermelho em bloqueio
- ✅ Score diminui em bloqueio (-18)
- ⚠️ Sem som diferenciado
- ⚠️ Flash vermelho muito breve (260ms)
- ⚠️ Individualismo tira "comum" mas dá score (confuso)
- ⚠️ Sem animação de "lose" ou tremor

**Melhoria**: Som agudo para bloqueio, tremor leve na câmara em bloqueio, animação de "choque" no player ao bater bloqueio.

---

### 2.7 Replayability
**Métrica**: Primeira impressão de "quero jogar de novo"?

**Tarifa Zero RJ - Estado Atual**:
- ✅ Espawn aleatório, cada run diferente
- ✅ Botão "Jogar Novamente" visível após resultado
- ⚠️ Sem pontuação pessoal (local high score)
- ⚠️ Sem achievement/milestone ("300 apoios!!")
- ⚠️ Sem desafio explícito ("Atinge 50% Comum")
- ⚠️ Sem leaderboard (mesmo local)

**Melhoria**: Mostrar "best score" pós-run, "desafio do dia", feedback de progresso pessoal.

---

### 2.8 Compatibilidade Touch + Teclado
**Métrica**: Ambos controles funcionam com 60 FPS estável?

**Tarifa Zero RJ - Estado Atual**:
- ✅ Touch: Clique na lane funciona, responsivo
- ✅ Keyboard: A/D + Arrows funcionam, responsivo
- ⚠️ Sem botões virtuais (apenas toque na lane)
- ⚠️ Sem visual de "qual lane é clicável" em mobile
- ⚠️ Sem suporte a gamepad

**Melhoria**: Botões virtuais (L/R) em mobile abaixo canvas, descrição no intro "Clique em uma faixa para mover".

---

## 3. Diagnóstico: Tarifa Zero RJ (Tijolo 29)

### Estado Atual
| Dimensão | Score | Comentário |
|----------|-------|-----------|
| Time to Fun | 8/10 | Rápido, mas primeiro feedback fraco |
| Feedback de Input | 7/10 | Responsivo, mas sem audio/visual confirmação |
| Clareza Risco/Recompensa | 7/10 | OK visualmente, mas individualismo confuso |
| Legibilidade HUD | 8/10 | Minimalista, clara, mas meter oscila |
| Velocidade & Ritmo | 7/10 | Rampa linear, sem variação visual |
| Acerto vs Erro | 6/10 | Flash fraco, sem som, sem impacto |
| Replayability | 6/10 | Aleatório mas sem metas/desafios |
| Touch + Keyboard | 8/10 | Ambos funcionam, sem UI auxiliar |
| **Média** | **7.1/10** | **Funcional, mas sem brilho** |

### Pontos de Atrito Principais
1. **Sem confirmação sonora** – Toque sente "fantasmagórico"
2. **Meter oscila muito** – Difícil acompanhar intenção coletiva
3. **Ritmo monótono** – Sem aceleração visual conforme progride
4. **Sem feedback de combo** – Contador ativo mas lógica obscura
5. **Individualismo é recompensador** – Contra narrativa

---

## 4. Melhorias Planejadas para Tarifa Zero RJ (Tijolo 30)

### Pequenas (Sem Novo Código)
- [ ] Ampliar altura de mutirão (15→18)
- [ ] Individualismo mais pequeno e opaco (diminuir destaque)
- [ ] Meter com transição suave (interpolação ao longo de 200ms)
- [ ] Ampliar font do percentual comum (+2px)
- [ ] Progress bar com cor dinâmica (verde até 72%, amarelo até 45%, vermelho <45%)

### Médias (Pequena Lógica)
- [ ] Indicador visual de combo ativo (borda da lane ou aura)
- [ ] Tentativa de som em coleta (audio context sine wave ou web audio)
- [ ] Tremelique de câmara em bloqueio (translateX ±3px por 150ms)
- [ ] Novo tipo de entidade nos últimos 15s ("chance" rara, +50 apoio)
- [ ] Local high score persistido e exibido pós-run

### Maiores (Mais Código)
- [ ] Botões virtuais (L/R) em mobile
- [ ] Animação de "pop" em coleta (escala +10% rápida)
- [ ] Feedback sonoro completo (coleta, bloqueio, combo, fim)
- [ ] Reticulum/crosshair no cursor (mouse/touch)

---

## 5. Segundo Arcade: Briefing de Game Feel

### Loop Distinto Obrigatório
O segundo arcade **não pode ser "desviar/coletar"**.

**Temas Candidatos:**
1. **Mutirão do Bairro** – Construir/acumular juntos (tile placement, stack)
2. **Cooperativa na Pressão** – Sincronizar ações múltiplas (timing, sequência)
3. **Passe Livre Nacional** – Coordenar rotas/ocupar espaços (positioning, grupo)

### Requisitos de Game Feel
- **30s–3min por run** (contrasta com 55s do Tarifa Zero)
- **Loop primário ≠ evitar/coletar** (ex: encaixar, sincronizar, defender, repartir)
- **Feedback imediato** em cada micro-decisão (som, cor, posição)
- **Replayability intrínseca** (aleatório mas inteligível)
- **Política por mecânica** (cooperativismo/autogestão embutido na regra)
- **Compatível com touch + teclado** (sem necessidade de aiming preciso)

### Score

| Dimensão | Alvo | Notas |
|----------|------|-------|
| Time to Fun | 9/10 | Crisp feedback em <1s primeira micro-ação |
| Feedback Input | 9/10 | Som + visual confirmando cada decisão |
| Clareza Risco/Recompensa | 9/10 | Sem ambiguidade (sim/não, certo/errado) |
| Legibilidade HUD | 9/10 | Mundo é HUD (tudo visível, mínimo overlay) |
| Velocidade & Ritmo | 8/10 | Ritmo varia com progresso (mais rápido no final) |
| Acerto vs Erro | 9/10 | Som + visual + impacto (não é "já era") |
| Replayability | 9/10 | Cada run sente diferente, sempre um "motivo para jogar de novo" |
| Touch + Keyboard | 9/10 | Ambos naturais, sem controller exótico |
| **Alvo Médio** | **8.9/10** | **Forma arcade real, competir com Tarifa Zero** |

---

## 6. Padrão de Excelência: Referências

Para inspiração sem imitação servil:

### Boas práticas observadas
- **Threes! / 2048**: Feedback sonoro nítido em cada ação, efeito de câmara suave, contador de score destacado, replay imediato
- **Flappy Bird**: Time to fun <1s, feedback instantâneo, uma mecânica clara, replayability via score progressão
- **Disco Elysium (UI)**: Texto/cores/sons sincronizados, sem ambiguidade, sensação de impact em escolhas
- **Cataclysm DDA**: Sim/não claro em cada decisão, feedback múltiplo (cor, ícone, som)

### O que NÃO fazer
- Transições longas que matam ritmo
- Feedback sonoro constante (cansa)
- Ambiguidade em feedback (player não sabe se foi bom ou ruim)
- Sem escalabilidade (jogo não fica mais interessante com prática)
- Sem suporte touch (mobile é prioridade)

---

## 7. Métodos de Medição

### No Código
```typescript
// Mensuráveis via eventos arcade
- first_input_time: Tempo até primeira entrada (alvo <500ms)
- run_end: Proporção que completa run (alvo >70%)
- replay_click: Cliques em "Jogar de Novo" / total runs (alvo >60%)
- score_distribution: Média, mediana, desvio padrão (muda com game feel)
- session_length: Tempo em run vs tempo pós-run (ratio de engagement)
```

### Por Observação
- Jogador sorri após primeira coleta?
- Replica imediatamente sem pensar?
- Toca a tela/aperta botão múltiplas vezes com confiança?
- Explica para amigo próximo?

---

## 8. Princípios para Próximos Arcades

1. **Feedback é tudo** – Som, cor, movimento, texto – redundância é ok
2. **Clareza mata ambiguidade** – Nunca deixar jogador confuso sobre consequência
3. **Ritmo != Dificuldade** – Jogo pode ser fácil mas sentir satisfatório com ritmo certo
4. **Política por regra** – Não explicar valores, embutir na mecânica
5. **Replayability vem de variedade + meta** – Aleatório + desafio (score pessoal, desafio do dia)
6. **Mobile first com suporte keyboard** – Não vice-versa
7. **<3 segundos para primeira "vitória"** – Primeira coleta, primeira sincronização, primeira coisa legítima
8. **Sem tutorial** – Intro + primeira tentativa = suficiente para entender

---

## Próximos Passos (Tijolo 30)

- [ ] Implementar melhorias em Tarifa Zero (pequenas + médias)
- [ ] Validar game feel com 2-3 jogadores (antes de código do segundo arcade)
- [ ] Escolher tema segundo arcade (Mutirão / Cooperativa / Passe Livre)
- [ ] Prototipar loop segundo arcade em papel ou diagrama
- [ ] Implementar segundo arcade com game feel em mente desde dia 1
- [ ] Comparar telemetria: Tarifa Zero vs Novo Arcade (replay rate, first input, completion)
- [ ] Decidir qual cresce (dados + feeling)

---

*Documento de Game Feel – Arcade Pré-Campanha de Alexandre Fonseca para Deputado*  
*Última atualização: 2026-03-07*  
*Responsável: Principal Product Engineer (Copilot)*
