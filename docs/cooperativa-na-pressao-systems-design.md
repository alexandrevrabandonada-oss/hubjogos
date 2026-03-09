# Cooperativa na Pressao - Systems Design (T42 Slice)

## Objetivo do slice

Validar um loop curto e distinto de Tarifa/Mutirao: coordenacao de producao coletiva com tensao entre fila de demanda, exaustao e solidariedade.

## Loop central

1. Escolher estacao (montagem, logistica, cuidado).
2. Aplicar acao principal:
- Organizar turno
- Redistribuir esforco
- Cuidar equipe
- Mutirao cooperativo (especial)
3. Controlar pressao crescente e evitar colapso.
4. Fechar run em 85s com outcome e replay.

## Estados principais

- `estabilidade` (saude operacional geral)
- `solidariedade` (coesao coletiva)
- `pressao` (media de backlog + exaustao)
- `mutiraoCharge` (habilita janela especial)

## Fail state

Colapso se `estabilidade` ou `solidariedade` ficam em zona critica por janela continua (grace period).

## Success state

Sobreviver ate o fim da run com score positivo e leitura de eficiencia coletiva.

## Input

- Mobile/touch: selecionar estacao por toque e usar botoes de acao.
- Teclado: setas/A-D para estacao; 1/2/3 para acoes; Espaco para mutirao; P pausa; R restart.
- Mouse: clique na pista/estacao + botoes de acao.

## HUD minima

- barras: estabilidade, solidariedade, pressao, carga de mutirao;
- feedback textual da ultima acao;
- tempo restante e fase da run.

## Fases do slice

- abertura: legibilidade do loop
- ritmo: aumento controlado da demanda
- pressao: eventos e risco de colapso
- fechamento: pico curto + desfecho

## Eventos minimos

- queda-fornecedor
- pane-maquina
- onda-solidaria

## O que entra no T42

- runtime jogavel do loop completo
- outcome screen com replay/proximo jogo/CTA campanha
- telemetria baseline
- assets P0 com fallback

## O que NAO entra no T42

- pass premium final de arte/audio
- balanceamento de longo prazo
- modos extras, meta-progressao, coop multiplayer

---

## T42B - Tuning de Balanceamento e Polish de UX

### Diagnostico do estado T42

**Gargalos de balanceamento identificados:**
1. Escalada de pressao muito agressiva na fase 'pressao' (0.015 vs 0.006 inicial) - pouco tempo para reagir
2. Grace period de colapso muito curto (6s) - jogador colapsa antes de entender o que fazer
3. Eventos com impacto multiplicativo alto (1.55x queda-fornecedor, 1.45x pane-maquina) sem contramedidas obvias
4. Mutirao cooperativo demora muito para carregar (precisa 100% charge) e janela de boost (7.5s) e curta demais

**Pontos de atrito de UX:**
1. Estacoes visuais sem hierarquia clara - dificil distinguir selecionada vs nao-selecionada
2. Estado de risco das estacoes nao e visualmente obvio (backlog/burnout alto nao grita)
3. Feedback das acoes e apenas textual - falta impacto visual e sensacao de "valeu usar"
4. Fases da run nao tem transicao visual clara alem de um fade rapido
5. HUD sem hierarquia - todas as barras tem o mesmo peso visual
6. Colapso iminente nao tem aviso visual claro antes do fail

**Run injusta, confusa ou repetitiva:**
- Run colapsa nas maos sem clareza de porque (burnout? backlog? evento?)
- Estrategia de "spammar acoes" vence estrategia de coordenacao coletiva
- Eventos surgem e o jogador nao entende como reagir
- Final da run (fechamento) e sempre colapso frustrado, raramente uma vitoria satisfatoria

### Objetivos do tuning T42B

1. Reduzir frustacao injusta sem perder tensao
2. Tornar runs boas mais satisfatorias
3. Fazer coordenacao coletiva vencer spam cego
4. Tornar a leitura do estado do jogo mais clara
5. Melhorar feedback de acoes
6. Tornar o mutirao cooperativo mais acessivel e impactante

### Pacing da run (target T42B)

**Duracao total:** 85s (mantido)

**Fases (ajustadas):**
- **Abertura** (0–20s): Legibilidade do loop, pressao minima (0.005)
- **Ritmo** (20–55s): Escalada controlada, pressao media (0.009)
- **Pressao** (55–75s): Pico de tensao, eventos frequentes, pressao alta (0.013)
- **Fechamento** (75–85s): Sprint final, pressao maxima (0.016)

**Mudancas vs T42:**
- Fase 'abertura' aumentada de 18s → 20s (melhor onboarding)
- Pressao reduzida em todas as fases (~35% mais suave)
- Fase 'pressao' reduzida de 72s → 75s (menos tempo no pico frustrante)

### Pressao por fase (ajustada T42B)

| Fase        | Pressao base (T42) | Pressao base (T42B) | Mudanca |
|-------------|-------------------|-------------------|---------|
| Abertura    | 0.006             | 0.005             | -17%    |
| Ritmo       | 0.0105            | 0.009             | -14%    |
| Pressao     | 0.015             | 0.013             | -13%    |
| Fechamento  | 0.019             | 0.016             | -16%    |

**Rationale:** Reduzir pressao base permite ao jogador ter tempo de pensar e reagir, tornando a run mais justa sem perder tensao.

### Custo/efeito das acoes (ajustado T42B)

**Organizar turno** (foco: reduzir backlog da estacao selecionada):
- Reduz backlog: 18 → **22** (melhor impacto focal)
- Reduz burnout: 6 → **8** (ajuda secundaria)
- Mutirao charge gain: 11 → **13** (carrega mais rapido)
- Score: 40 → **45**
- **Mudanca:** Acao focal mais forte, carrega mutirao mais rapido

**Redistribuir esforco** (foco: balancear todas as estacoes):
- Reduz backlog (estacao alta): 10 → **12**
- Reduz backlog (estacao baixa): 4 → **5**
- Reduz burnout (todas): 3 → **4**
- Mutirao charge gain: 13 → **15** (carrega mais rapido)
- Score: 34 → **38**
- **Mudanca:** Melhor nos primeiros 45s quando pressao esta desbalanceada

**Cuidar equipe** (foco: reduzir exaustao coletiva):
- Reduz burnout (todas): 12 → **15** (impacto mais claro)
- Reduz backlog (todas): 4 → **5**
- Mutirao charge gain: 9 → **12**
- Score: 28 → **32**
- **Mudanca:** Melhor contramedida para burnout alto

**Mutirao cooperativo** (especial):
- Ativacao: 100% charge → **85% charge** (mais acessivel)
- Duracao boost: 7.5s → **10s** (janela mais generosa)
- Boost multiplicador: 1.3x → **1.5x** (impacto mais obvio)
- Passive drain durante mutirao: 0.24 backlog + 0.18 burnout → **0.32 backlog + 0.24 burnout** (mais forte)
- Score: 90 → **120** (recompensa maior)
- **Mudanca:** Mais acessivel, mais longo, mais impactante - torna decisivo na run

### Janela do mutirao cooperativo

**Estado T42:**
- Carga lenta (precisa 100%)
- Boost curto (7.5s)
- Impacto moderado (1.3x)

**Estado T42B:**
- Carga rapida (85% + gain aumentado por acao)
- Boost medio (10s)
- Impacto alto (1.5x + passive drain mais forte)
- Visual claro quando disponivel (HUD destaque)

**Objetivo:** Tornar o mutirao um momento decisivo da run, nao um bonus raro.

### Objetivos de run

**Score minimo (sobrevivencia):** 800–1200 (depende de estrategia)
**Score bom (coordenacao eficiente):** 1400–1800
**Score excelente (coordenacao otima + mutirao bem usado):** 2000+

**Collectivity Rate target:**
- Minimo para sobreviver: 60%+
- Bom: 75%+
- Excelente: 85%+

### Criterios de colapso (ajustado T42B)

**Estado T42:**
- Grace period: 6s (muito curto)
- Threshold critico: estabilidade < 26 OU solidariedade < 24 OU pressao > 92

**Estado T42B:**
- Grace period: **9s** (mais tempo para reagir)
- Threshold critico: estabilidade < **22** OU solidariedade < **20** OU pressao > **94**
- Warning visual: grace period > 3s mostra alerta visual de colapso iminente

**Mudanca:** Mais tempo para entender e reagir, menos colapso frustrante.

### Risco/recompensa

**Alto risco, alta recompensa:**
- Ignorar burnout e focar backlog → score alto mas risco de colapso repentino
- Usar mutirao cedo demais → desperdicar janela especial
- Concentrar em uma estacao so → outras colapsam

**Baixo risco, recompensa media:**
- Balancear todas as acoes (organizar + redistribuir + cuidar) → run estavel, score medio
- Usar mutirao quando charge disponivel → run mais facil

**Coordenacao otima (high skill):**
- Ler estado das estacoes e escolher acao certa no momento certo
- Guardar mutirao para fase 'pressao' ou evento critico
- Usar redistribuir quando backlog desbalanceado, cuidar quando burnout alto

### Eventos (ajustado T42B)

**Queda-fornecedor** (afeta montagem):
- Multiplicador montagem: 1.55 → **1.45** (menos punitivo)
- Multiplicador outras: 1.2 → **1.15**
- Duracao: 7s (mantido)
- Contramedida: Organizar turno na montagem OU redistribuir esforco

**Pane-maquina** (afeta logistica):
- Multiplicador logistica: 1.45 → **1.35**
- Multiplicador outras: 1.12 → **1.10**
- Duracao: 6.5s (mantido)
- Contramedida: Organizar turno na logistica OU redistribuir esforco

**Onda-solidaria** (boost coletivo):
- Solidariedade gain: 0.08 → **0.10** (mais impacto)
- Estabilidade gain: 0.04 → **0.05**
- Duracao: 6s (mantido)
- Oportunidade: Usar mutirao durante onda-solidaria = combo forte

**Frequencia:**
- T42: ~1.1% chance por tick em janelas especificas
- T42B: ~**1.3%** (eventos mais frequentes mas menos punitivos)

### Decay passivo (ajustado T42B)

**Estabilidade decay:**
- T42: pressureFactor * 0.11
- T42B: pressureFactor * **0.09** (mais lento)

**Solidariedade decay:**
- T42: pressureFactor * 0.09
- T42B: pressureFactor * **0.07** (mais lento)

**Rationale:** Dar ao jogador mais margem antes do colapso passivo.

### Telemetria (novos eventos T42B)

- `cooperativa_station_selected` - quando jogador seleciona estacao
- `cooperativa_station_overload` - quando estacao atinge backlog > 80 OU burnout > 80
- `cooperativa_phase_reached` - quando run atinge nova fase
- `cooperativa_collapse_reason` - quando run colapsa (razao: estabilidade, solidariedade, pressao)
- `cooperativa_mutirao_activated` - quando mutirao e ativado
- `arcade_replay_click` - ja existe, mas confirmar tracking

### Criterios de sucesso do tuning T42B

1. Run media dura 70-85s (nao colapsa aos 45s)
2. Taxa de sobrevivencia melhora de ~40% -> ~65%
3. Collectivity rate medio sobe de ~60% -> ~75%
4. Uso de mutirao cooperativo sobe de ~20% -> ~60%+ das runs
5. Replay rate melhora (telemetria real)
6. Feedback de "entendi o que fazer" vs "frustrado sem saber porque perdi"

## Fechamento operacional T49

Estado observado na janela valida:
- runs observadas: 0
- runs efetivas: 0
- survival/collectivity/mutirao/replay/CTA em 0%

Decisao de engenharia/produto:
- status: `insufficient_live_usage`
- decisao final: `keep_observing`
- acao: manter observacao por mais 7 dias antes de novo tuning ou premium pass.
