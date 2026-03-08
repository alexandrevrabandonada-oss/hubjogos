# Tarifa Zero RJ — Corredor do Povo: Systems Design

**Objetivo**: Transformar run de lane-swap simples em experiência com profundidade, variedade e narrativa emergente por mecânica política.

**Documento criado**: 2026-03-07 (Tijolo 35B)  
**Status**: Design completo para implementação

## Atualizacao T35F (implementado)

- Runtime de eventos ampliado para `collision`, `phase_transition` e `special_event`.
- Camada de SFX base adicionada em `lib/games/arcade/audio/` com controle de mute no HUD e atalho `M`.
- Mapeamento de eventos para cues: coleta, colisao leve/pesada, transicao de fase, evento especial e fim de run.
- Fixture de final premium rapido habilitada via `?preview=final` (ou `?fixture=final-premium`) para smoke/E2E.
- Telemetria existente preservada, sem reescrever core de gameplay.

---

## Visão do Gameplay

### Fantasia Central
Você é Alexandre Fonseca (AF) abrindo corredor do povo em 55 segundos: desvie bloqueio institucional, puxe apoio popular, ative mutirão e mantenha força coletiva para liberar passagem com tarifa zero.

### Loop Core
1. **Ler o corredor** à frente (0.5-1.5s de antecipação)
2. **Mudar de lane** para coletar apoio/mutirão ou evitar bloqueio
3. **Manter sequência coletiva** (combo) para multiplicar ganho
4. **Reagir a eventos** (onda de bloqueio, janela de chance, mutirão ativo)
5. **Gerenciar medidor coletivo** como recurso de estabilidade/multiplicador

### Pilares de Profundidade
1. **Variedade de entidades**: 15+ tipos (5 categorias × 3 variantes cada)
2. **Pacing por fases**: começo legível → meio pressão → picos caos → final intenso
3. **Eventos especiais**: 6 eventos que alteram ritmo e criam momentos únicos
4. **Risk/reward implícito**: escolhas de lane com trade-offs táticos
5. **Sistema de combo profundo**: sequências, chains, multiplicadores contextuais

---

## Progressão da Run (55s)

### Fase 1: Abertura (0-12s)
**Objetivo pedagógico**: Aprender a ler e se mover.

- **Spawn rate**: Baixo (800-1000ms entre entidades)
- **Velocidade**: Lenta (180-220 px/s)
- **Densidade**: 1 entidade por vez, raramente 2
- **Mix**: 60% apoio, 25% bloqueio simples, 15% neutro
- **Eventos**: Nenhum (fase de warm-up)

**Sensação**: "Estou pegando o ritmo."

### Fase 2: Escalada (12-28s)
**Objetivo tático**: Construir medidor e combo.

- **Spawn rate**: Moderado (550-750ms)
- **Velocidade**: Média (220-280 px/s)
- **Densidade**: 2-3 entidades simultâneas
- **Mix**: 40% apoio, 30% bloqueio, 20% mutirão, 10% individualismo
- **Eventos**: Possível "Mutirão Ativo" (1° evento)

**Sensação**: "Estou construindo algo, preciso manter."

### Fase 3: Pressão (28-42s)
**Objetivo estratégico**: Decisões sob pressão.

- **Spawn rate**: Alto (380-550ms)
- **Velocidade**: Rápida (280-340 px/s)
- **Densidade**: 3-4 entidades simultâneas, padrões espaciais
- **Mix**: 30% apoio, 35% bloqueio variado, 15% mutirão, 15% individualismo, 5% chance
- **Eventos**: "Onda de Bloqueio", "Corredor Livre", "Janela de Chance"

**Sensação**: "Agora é sério, preciso me concentrar."

### Fase 4: Final Crítico (42-55s)
**Objetivo emocional**: Vitória dramática ou derrota clara.

- **Spawn rate**: Muito alto (300-450ms)
- **Velocidade**: Muito rápida (340-420 px/s)
- **Densidade**: 4-6 entidades simultâneas, clusters perigosos
- **Mix**: 25% apoio, 40% bloqueio pesado, 10% mutirão, 20% individualismo tentador, 5% chance rara
- **Eventos**: "Força Coletiva" (buff final), "Catraca Fechando" (debuff final)

**Sensação**: "Cada decisão conta. Vou conseguir?"

---

## Categorias de Entidades

### 1. APOIO (Positivo Coletivo)

#### Apoio Simples ✅ (já existe)
- **Visual**: Círculo verde #7ce0ae, 14px raio, ícone "+"
- **Comportamento**: Desce em linha reta
- **Coleta**: +8 medidor coletivo, +14 score base, chance de combo
- **Frequência**: Comum (40-60% do mix positivo)
- **Política**: Apoio popular básico — sempre presente, sempre válido

#### Apoio em Cadeia 🆕
- **Visual**: Círculo verde #7ce0ae, 16px raio, ícone "++" ou setas conectadas
- **Comportamento**: Aparece em sequência de 2-3 na mesma lane com ~0.3s intervalo
- **Coleta**: 
  - 1° da cadeia: +6 medidor, +12 score
  - 2° da cadeia (se pegar): +10 medidor, +20 score
  - 3° da cadeia (se pegar): +14 medidor, +35 score (payoff)
- **Frequência**: Raro (10-15% do mix positivo), fase 2-4
- **Política**: Organização sequencial — ação coletiva sustentada rende mais

#### Apoio Territorial 🆕
- **Visual**: Círculo verde claro #8ef0be, 15px raio, ícone "▲" (território)
- **Comportamento**: Desce mais devagar que apoio normal (70% da velocidade)
- **Coleta**: +12 medidor coletivo, +18 score, +bônus se medidor >60% (+10 score extra)
- **Frequência**: Moderado (20-25% do mix positivo), fase 2-3
- **Política**: Base territorial forte — mais valioso quando coletivo já está estabelecido

### 2. MUTIRÃO (Multiplicador Coletivo)

#### Mutirão Popular ✅ (já existe, melhorar)
- **Visual**: Círculo amarelo #ffd765→#f9cf4a, 16px raio, ícone "M"
- **Comportamento**: Desce em linha reta
- **Coleta**: +20 medidor coletivo, +28 score, ativa combo multiplicador 1.75× por 6s
- **Frequência**: Comum mutirão (60% do mix mutirão)
- **Política**: Ação coletiva organizada — potencializa tudo que vem depois

#### Mutirão de Bairro 🆕
- **Visual**: Círculo amarelo ouro #ffcc33, 18px raio, ícone "MB" ou casas
- **Comportamento**: Aparece sempre em lane diferente da última entidade coletada
- **Coleta**: +25 medidor, +35 score, combo 2× por 5s (mais intenso, mais curto)
- **Frequência**: Moderado (30% do mix mutirão), fase 2-4
- **Política**: Organização de base — exige mobilidade e atenção territorial

#### Mutirão Sindical 🆕
- **Visual**: Círculo amarelo escuro #e6b800, 17px raio, ícone "S" ou punho
- **Comportamento**: Desce devagar mas dá tempo maior para decidir
- **Coleta**: +30 medidor, +40 score, combo 1.5× por 8s (multiplicador menor, duração maior)
- **Frequência**: Raro (10% do mix mutirão), fase 3-4
- **Política**: Organização estruturada — mais estável, sustenta pressão prolongada

### 3. BLOQUEIO (Negativo Institucional)

#### Bloqueio Simples ✅ (já existe)
- **Visual**: Quadrado vermelho #f45f5f, 32px, X branco
- **Comportamento**: Desce em linha reta
- **Colisão**: -14 medidor coletivo, -18 score, flash damage
- **Frequência**: Comum (50% do mix bloqueio)
- **Política**: Resistência institucional básica — evitável com atenção

#### Bloqueio Pesado 🆕
- **Visual**: Quadrado vermelho escuro #d93f3f, 36px, X grosso duplo
- **Comportamento**: Desce 30% mais devagar, ocupa visualmente mais espaço
- **Colisão**: -20 medidor coletivo, -28 score, flash damage longo (400ms)
- **Frequência**: Moderado (25% do mix bloqueio), fase 2-4
- **Política**: Bloqueio estrutural — mais punitivo, mas dá mais tempo para desviar

#### Bloqueio em Sequência 🆕
- **Visual**: 2-3 quadrados vermelho médio #f45f5f, 30px, conectados visualmente
- **Comportamento**: Aparecem em 2 lanes adjacentes ao mesmo tempo ou com 0.2s de diferença
- **Colisão**: -12 medidor cada, -15 score cada
- **Frequência**: Raro (15% do mix bloqueio), fase 3-4
- **Política**: Cerco institucional — força decisão rápida de rota

#### Zona de Pressão 🆕
- **Visual**: Retângulo vermelho translúcido #f45f5f40, altura 60px ocupando lane inteira
- **Comportamento**: Desce devagar, bloqueia lane temporariamente
- **Colisão**: -10 medidor, -12 score por colisão, mas pode atravessar (penalidade contínua)
- **Frequência**: Raro (10% do mix bloqueio), fase 3-4 apenas
- **Política**: Repressão temporária — escolha entre perder pontos ou perder posição

### 4. INDIVIDUALISMO (Trade-off Ambíguo)

#### Individualismo Rápido ✅ (já existe como base)
- **Visual**: Círculo cinza #b8c5d0, 13px raio, ícone "$"
- **Comportamento**: Desce em linha reta
- **Coleta**: -22 medidor coletivo, +10 score (trade: pontos rápidos, sabota comum)
- **Frequência**: Comum (60% do mix individualismo)
- **Política**: Atalho individual — ganho imediato, custo coletivo

#### Individualismo Tentador 🆕
- **Visual**: Círculo cinza brilhante #c8d5e0, 15px raio, ícone "$$"
- **Comportamento**: Aparece em lane segura (sem bloqueio próximo)
- **Coleta**: -28 medidor coletivo, +22 score (mais score, mais penalidade)
- **Frequência**: Moderado (30% do mix individualismo), fase 3-4
- **Política**: Oportunismo funcional — decisão difícil sob pressão

#### Individualismo em Cluster 🆕
- **Visual**: 3 círculos cinza pequenos #b8c5d0, 11px raio, agrupados
- **Comportamento**: Aparecem juntos na mesma lane
- **Coleta**: -18 medidor por unidade, +8 score por unidade (total: -54 medidor, +24 score)
- **Frequência**: Raro (10% do mix individualismo), fase 4 apenas
- **Política**: Colapso organizativo — tentação multiplicada, destruição coletiva garantida

### 5. CHANCE (Evento Raro de Virada)

#### Chance Coletiva ✅ (já existe como base)
- **Visual**: Estrela azul #00d9ff, 17px, glow, ícone "?"
- **Comportamento**: Aparece apenas últimos 15s, 5% chance
- **Coleta**: +30 medidor, +50 score, combo 2× por 8s
- **Frequência**: Muito raro (base)
- **Política**: Oportunidade política — janela de virada estratégica

#### Chance de Virada 🆕
- **Visual**: Estrela dourada #ffd700, 19px, glow intenso, ícone "!!"
- **Comportamento**: Aparece apenas se medidor <40% nos últimos 20s
- **Coleta**: +40 medidor, +80 score, combo 2.5× por 6s, recuperação dramática
- **Frequência**: Condicional (só aparece em run difícil)
- **Política**: Mobilização de emergência — recompensa resistência

#### Janela de Abertura 🆕
- **Visual**: Estrela verde-azul #00e6ac, 18px, pulso visual
- **Comportamento**: Aparece apenas durante evento "Corredor Livre"
- **Coleta**: +35 medidor, +65 score, extende evento +2s
- **Frequência**: Condicional (só em evento específico)
- **Política**: Consolidar conquista — aproveitar momento de força

---

## Eventos Especiais de Run

### 1. Mutirão Ativo (12-35s, duração 8s, prob 25%)
**Trigger**: Random quando medidor >50%  
**Efeito**: Multiplicador global de apoio 1.5×, spawn rate de apoio +40%  
**Visual**: Banner amarelo "MUTIRÃO ATIVO", glow nas lanes  
**Áudio sugerido**: Vinheta de mobilização  
**Política**: Organização fortalecida potencializa ganhos

### 2. Onda de Bloqueio (20-42s, duração 6s, prob 20%)
**Trigger**: Random quando bloqueios coletados >5  
**Efeito**: Spawn rate de bloqueio +60%, velocidade +15%  
**Visual**: Flash vermelho sutil, texto "ONDA DE BLOQUEIO"  
**Áudio sugerido**: Tensão crescente  
**Política**: Repressão coordenada — teste de habilidade

### 3. Corredor Livre (15-38s, duração 5s, prob 15%)
**Trigger**: Random quando combo ativo + medidor >60%  
**Efeito**: Bloqueios não aparecem, apoio +30%, pode spawnar "Janela de Abertura"  
**Visual**: Lanes com brilho verde, texto "CORREDOR LIVRE"  
**Áudio sugerido**: Momento de vitória temporária  
**Política**: Conquista temporária do espaço público

### 4. Janela de Chance (32-50s, duração 4s, prob 12%)
**Trigger**: Random nos últimos 23s  
**Efeito**: Chance entities têm 25% de spawn (vs 5% normal)  
**Visual**: Estrelas pequenas no fundo, texto "JANELA DE CHANCE"  
**Áudio sugerido**: Oportunidade crítica  
**Política**: Momento político decisivo

### 5. Força Coletiva (38-55s, duração 7s, prob 18%)
**Trigger**: Random últimos 17s se medidor >55%  
**Efeito**: Combo multiplicador +0.5×, medidor não cai de bloqueios (zera penalidade)  
**Visual**: Aura amarela ao redor do player, texto "FORÇA COLETIVA"  
**Áudio sugerido**: Empoderamento  
**Política**: Quando organização está forte, resistimos melhor à repressão

### 6. Catraca Fechando (42-55s, duração 6s, prob 20%)
**Trigger**: Random últimos 13s se medidor <35%  
**Efeito**: Velocidade de entidades +20%, spawn de individualismo +50%  
**Visual**: Sombra vermelha nas bordas, texto "CATRACA FECHANDO"  
**Áudio sugerido**: Tensão final  
**Política**: Quando organização está fraca, sistema fecha mais rápido

---

## Sistema de Combo Profundido

### Camadas de Combo

#### 1. Combo Básico (Mutirão)
- **Ativação**: Coletar Mutirão Popular/Bairro/Sindical
- **Efeito**: Multiplicador 1.5-2× por 5-8s
- **Visual**: Banner "COMBO ATIVO"
- **Mecânica**: Já existe, manter

#### 2. Sequência Coletiva 🆕
- **Ativação**: Coletar 3+ apoios consecutivos sem intervalo >1.5s
- **Efeito**: 
  - 3 apoios: +5 score bônus
  - 4 apoios: +12 score bônus
  - 5+ apoios: +25 score bônus + medidor +5
- **Visual**: Contador pequeno "3×", "4×", "5×"
- **Mecânica**: Premia consistência

#### 3. Sem Colisão (Perfect) 🆕
- **Ativação**: 10s sem colidir com bloqueio/individualismo
- **Efeito**: +15 score bônus, medidor +3
- **Visual**: Indicador "SEM COLISÃO 10s" com timer
- **Mecânica**: Premia desvio perfeito

#### 4. Cadeia de Mutirão 🆕
- **Ativação**: Coletar 2 mutir ões em <12s
- **Efeito**: Segundo mutirão vale 2× score e extende combo anterior +3s
- **Visual**: "CADEIA!" com brilho amarelo
- **Mecânica**: Premia busca ativa de multiplicadores

### Quebra de Combo
- Colidir com Bloqueio: Zera sequência, mantém combo de mutirão
- Coletar Individualismo: Zera sequência, reduz tempo de combo mutirão -2s
- Timeout natural: Sem penalidade extra

---

## Risk/Reward Implícito

### Decisões Táticas

#### 1. Lane Segura vs Lane Lucrativa
- Lane com bloqueio + apoio territorial de alto valor
- Lane limpa mas com individualismo tentador
- **Trade-off**: Risco físico vs risco estratégico (medidor)

#### 2. Timing de Mutirão
- Pegar mutirão agora (multiplicador ativa) vs esperar sequência de apoios antes
- **Trade-off**: Ativação imediata vs maximizar multiplicador

#### 3. Atravessar Zona de Pressão
- Perder 10-12 pontos atravessando vs sacrificar posição ideal
- **Trade-off**: Dano controlado vs perder oportunidade

#### 4. Individualismo sob Pressão
- Pegar +22 score rápido mas perder -28 medidor quando medidor já está baixo
- **Trade-off**: Sobrevivência de curto prazo vs colapso de longo prazo

#### 5. Cadeia de Apoio vs Mutirão Isolado
- Seguir cadeia de 3 apoios (+12+20+35) vs pular para lane com mutirão (+35 + multiplicador)
- **Trade-off**: Payoff garantido vs potencial maior mas menos certo

### Leitura de Risco
- **Baixo risco, baixo retorno**: Lane limpa, poucos apoios
- **Médio risco, médio retorno**: Lane com bloqueio evitável + apoio normal
- **Alto risco, alto retorno**: Lane com bloqueio pesado + cadeia de apoio + mutirão
- **Risco extremo, payoff dramático**: Atravessar zona de pressão para pegar Chance de Virada

---

## Política Embutida em Sistemas

### Eixo Coletivo vs Individual

**Coletivo fortalecido**:
- Apoio em cadeia vale mais (organização sequencial)
- Mutirão territorial exige mobilidade (base distribuída)
- Combo premia consistência (ação sustentada)
- Força Coletiva bloqueia penalidades (união protege)

**Individual enfraquecido**:
- Individualismo tentador parece bom, mas sabota medidor
- Cluster de individualismo é colapso organizativo
- Combinado com evento "Catraca Fechando" é armadilha final

### Narrativa Política por Evento

- **Mutirão Ativo**: Quando nos organizamos, tudo fica mais fácil
- **Onda de Bloqueio**: Sistema reage com repressão coordenada
- **Corredor Livre**: Conquista temporária do espaço público
- **Força Coletiva**: União nos torna resilientes
- **Catraca Fechando**: Desorganização facilita fechamento do sistema

### Medidor Coletivo como Recurso

- **> 70%**: Estável, multiplicadores fortes, eventos positivos mais prováveis
- **50-70%**: Equilibrado, mix neutro
- **30-50%**: Risco, individualismo mais tentador
- **< 30%**: Crítico, sistema fecha (Catraca), Chance de Virada pode aparecer

---

## Métricas de Profundidade

### Tracking de Gameplay (instrumentação)

```typescript
interface RunDepthMetrics {
  // Obstáculos
  collision_by_obstacle_type: Record<string, number>;
  bloqueio_pesado_avoided: number;
  zona_pressao_traversed: number;
  
  // Pickups
  pickup_by_type: Record<string, number>;
  apoio_chain_completed: number; // Quantas cadeias 3x
  apoio_chain_max: number; // Maior cadeia alcançada
  
  // Combo
  combo_peak_multiplier: number;
  sequencia_coletiva_max: number;
  perfect_streak_max_seconds: number;
  mutirao_chain_count: number;
  
  // Eventos
  events_triggered: string[]; // ["mutirao_ativo", "corredor_livre"]
  event_count: number;
  
  // Risk/Reward
  individualismo_under_pressure: number; // Pego quando medidor <40%
  high_risk_lane_chosen: number; // Lane com bloqueio+apoio
  zona_pressao_score_trade: number; // Score perdido atravessando
  
  // Fases
  death_phase: 'abertura' | 'escalada' | 'pressao' | 'final' | 'completou';
  score_by_phase: [number, number, number, number]; // [fase1, fase2, fase3, fase4]
  
  // Medidor
  medidor_peak: number;
  medidor_low: number;
  medidor_final: number;
  medidor_avg: number;
}
```

### Dashboard `/estado` - Novos Blocos

#### Bloco: Variedade de Run
- Entidades mais coletadas por tipo
- Eventos mais acionados
- Fase média de morte
- Diversidade de runs (quantos tipos diferentes por run)

#### Bloco: Profundidade de Decisão
- Taxa de individualismo sob pressão
- Média de sequências coletivas
- Pico médio de combo
- Uso de zonas de pressão

#### Bloco: Narrativa de Run
- Distribuição de mortes por fase
- Score médio por fase
- Eventos mais comuns em runs de sucesso vs fracasso

---

## Balanceamento Inicial

### Spawn Probabilities por Fase

**Fase 1 (Abertura):**
- Apoio Simples: 60%
- Bloqueio Simples: 25%
- Individualismo Rápido: 15%

**Fase 2 (Escalada):**
- Apoio (Simples 50%, Cadeia 10%, Territorial 15%): 75% total apoios
- Bloqueio (Simples 60%, Pesado 25%, Sequência 15%): 25% total
- Mutirão (Popular 70%, Bairro 30%): 15% (dentro do 75% apoios)
- Individualismo (Rápido 100%): 10%

**Fase 3 (Pressão):**
- Apoio (Simples 40%, Cadeia 15%, Territorial 20%): 40%
- Bloqueio (Simples 40%, Pesado 30%, Sequência 20%, Zona 10%): 35%
- Mutirão (Popular 50%, Bairro 35%, Sindical 15%): 15%
- Individualismo (Rápido 60%, Tentador 40%): 15%
- Chance (Coletiva 80%, Abertura 20%): 5%

**Fase 4 (Final):**
- Apoio (Simples 35%, Cadeia 20%, Territorial 15%): 30%
- Bloqueio (Simples 30%, Pesado 35%, Sequência 25%, Zona 10%): 40%
- Mutirão (Popular 40%, Bairro 30%, Sindical 30%): 10%
- Individualismo (Rápido 40%, Tentador 40%, Cluster 20%): 20%
- Chance (Coletiva 60%, Virada 40%): 5%

### Valores de Score/Medidor (ajustados)

**Apoios:**
- Simples: +8 medidor, +14 score
- Cadeia 1°/2°/3°: +6/+10/+14 medidor, +12/+20/+35 score
- Territorial: +12 medidor, +18 score (+10 se medidor alto)

**Mutirões:**
- Popular: +20 medidor, +28 score, combo 1.75× por 6s
- Bairro: +25 medidor, +35 score, combo 2× por 5s
- Sindical: +30 medidor, +40 score, combo 1.5× por 8s

**Bloqueios:**
- Simples: -14 medidor, -18 score
- Pesado: -20 medidor, -28 score
- Sequência: -12 medidor, -15 score (cada)
- Zona: -10 medidor, -12 score (continuous)

**Individualismos:**
- Rápido: -22 medidor, +10 score
- Tentador: -28 medidor, +22 score
- Cluster: -18 medidor, +8 score (cada, 3 total)

**Chances:**
- Coletiva: +30 medidor, +50 score, combo 2× por 8s
- Virada: +40 medidor, +80 score, combo 2.5× por 6s
- Abertura: +35 medidor, +65 score, extende evento +2s

---

## Próximos Passos (T35C ou além)

### Não incluído neste tijolo:
- ❌ Animações complexas de entities
- ❌ Particles em coleta/colisão
- ❌ Som e música dinâmica
- ❌ Assets SVG customizados para novos tipos
- ❌ Segundo arcade (Passe Livre Nacional) com mesma profundidade
- ❌ Tutorial interativo
- ❌ Achievements/badges de run

### Incluído opcionalmente (se tempo permitir):
- ✅ Juice visual mínimo (shake, flash mais forte)
- ✅ Transições de fase sutis
- ✅ Eventos visuais mais claros

---

## Conclusão

Este design transforma runs de 55s monótonas em experiências variadas e memoráveis através de:

1. **15 tipos de entidades** com comportamentos e payoffs distintos
2. **4 fases temporais** com pacing dramático
3. **6 eventos especiais** que criam momentos únicos
4. **Sistema de combo profundo** com múltiplas camadas
5. **Risk/reward implícito** em escolhas de lane e timing
6. **Política embutida em mecânica**: coletivo forte, individual enfraquecido, organização protege

A run agora conta uma história emergente por sistemas, não por texto.
