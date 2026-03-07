# Tarifa Zero RJ - Corredor do Povo: Direção de Arte

**Status:** Fundação profissional (T35A)  
**Tipo:** Arcade de corrida/coletividade  
**Duração:** 55 segundos  
**Plataforma:** Mobile-first, desktop bom  

---

## Fantasia Visual

**Conceito central:**  
Você é Alexandre Fonseca correndo num corredor popular urbano para liberar passagem com tarifa zero. A corrida é coletiva: quanto mais apoio, mutirão e organização você pega, mais forte fica o corredor do povo. Bloqueios (catracas, barreiras) e individualismos enfraquecem o comum.

**Sensação que o jogo deve passar:**
- Movimento rápido mas controlado
- Cidade/transporte/mobilidade urbana
- Coletividade x individualismo como mecânica visual
- Política aparece no mundo do jogo, não só em texto
- Urgência de mobilização popular
- Satisfação de construir força coletiva

**O que NÃO é:**
- Não é cartoon infantil
- Não é hiper-realista
- Não é sci-fi
- Não é fantasy
- Não é minimalista frio

**O que SIM é:**
- Político-jogável
- Urbano-popular
- Ilustrado-editorial com energia
- Formas claras e legíveis
- Cores intencionais (não aleatórias)

---

## Paleta de Cores

### Paleta primária (identidade do jogo)

**Fundo e estrutura:**
- `#08121d` → Asfalto noturno (sombras profundas)
- `#0f2a3d` → Cimento urbano escuro (base principal)
- `#123d59` → Azul de transporte público (estrutura, contornos)
- `#195173` → Azul ativo (hover, destaque leve)

**Player e protagonismo:**
- `#f9cf4a` → Amarelo Alexandre (player, destaque central)
- `#ffd765` → Dourado mutirão (power-up coletivo)
- `#ffebb0` → Amarelo claro (auras, brilho)

**Coletivo positivo:**
- `#7ce0ae` → Verde apoio popular (pickups de organização)
- `#5ac48f` → Verde Floresta (reforço visual)
- `#a8f0d3` → Verde claro (feedback de sucesso)

**Obstáculos e bloqueio:**
- `#f45f5f` → Vermelho bloqueio (catracas, barreiras)
- `#ff8080` → Vermelho leve (borda, alerta)
- `#ffe2e2` → Rosa alerta (flash de colisão)

**Individualismo:**
- `#d3d3d3` → Cinza metálico (pickups de atalho individual)
- `#9a9a9a` → Cinza médio (reforço)
- `#e8e8e8` → Cinza claro (borda)

**Chance coletiva (raro):**
- `#00d9ff` → Ciano sorte (evento especial)
- `#66e5ff` → Ciano claro (brilho)
- `#00a3cc` → Ciano escuro (contorno)

### Paleta secundária (UI/HUD)

**Textos e informação:**
- `#f0f5ff` → Branco quente (score, labels principais)
- `#c5d9e8` → Cinza claro (textos auxiliares)
- `#244861` → Azul texto escuro (stats)

**Fundo de HUD:**
- `rgba(9, 20, 30, 0.9)` → Preto translúcido (fundo de painel)
- `rgba(18, 61, 89, 0.85)` → Azul translúcido (painéis secundários)

**Feedback visual:**
- `rgba(255, 80, 80, 0.18)` → Flash de dano
- `rgba(250, 211, 87, 0.6)` → Flash de combo
- `rgba(124, 224, 174, 0.35)` → Flash de sucesso

---

## Linguagem de Formas

### Protagonista (Alexandre Fonseca)
- **Forma base:** Circular com silhueta reconhecível
- **Tamanho:** 18-22px raio (legível em movimento)
- **Detalhamento:** Avatar simplificado mas personalizado
- **Contorno:** 2-3px, cor escura ou branca dependendo do fundo
- **Animação:** Pode ter leve bounce ou inclinação ao trocar de lane

### Pickups de apoio
- **Forma:** Circular, hexagonal ou escudo
- **Tamanho:** 14-16px raio
- **Estilo:** Contorno forte, ícone interno legível
- **Cores:** Verde família `#7ce0ae`

### Pickups de mutirão
- **Forma:** Circular maior ou estrela de 5 pontas
- **Tamanho:** 16-18px raio
- **Estilo:** Brilho sutil, ícone "M" ou símbolo de pessoas
- **Cores:** Amarelo dourado `#ffd765`

### Bloqueios (catracas/barreiras)
- **Forma:** Quadrada/retangular, forma de portão
- **Tamanho:** 32x32px (maior que pickups, mais ameaçador)
- **Estilo:** Contorno forte, X ou barras indicando bloqueio
- **Cores:** Vermelho `#f45f5f`
- **Variação:** Pode ter animação de piscar ou pulsar

### Individualismos
- **Forma:** Circular menor, diamante ou moeda
- **Tamanho:** 13-15px raio
- **Estilo:** Metálico, símbolo "$" ou seta individualista
- **Cores:** Cinza `#d3d3d3`

### Chance coletiva (raro)
- **Forma:** Estrela de 5 pontas grande
- **Tamanho:** 20-24px raio
- **Estilo:** Brilho intenso, símbolo "?" ou estrela cheia
- **Cores:** Ciano `#00d9ff`
- **Efeito:** Pode ter aura pulsante

### Lanes (pistas)
- **Separação:** Linhas verticais finas (2px), brancas translúcidas `rgba(255,255,255,0.15)`
- **Destaque:** Lane ativa tem overlay leve amarelo `rgba(250, 211, 87, 0.08)`
- **Profundidade:** Gradiente vertical para dar sensação de corredor

---

## Estilo de Contornos

- **Contorno padrão:** 2-3px
- **Contorno de destaque:** 3-4px
- **Contorno de UI:** 1-2px
- **Antialiasing:** Ativado sempre que possível
- **Stroke vs Fill:** Preferir fill com stroke fino para melhor legibilidade em movimento

---

## Estilo de Ícones

- **Resolução:** Simples o suficiente para funcionar em 16x16px mínimo
- **Estilo:** Flat com depth leve (não 100% flat, não 3D completo)
- **Linguagem:** Político-editorial (símbolos de coletividade, transporte, cidade)
- **Consistência:** Todos os ícones seguem mesma espessura de linha (2-3px)
- **Legibilidade:** Prioridade absoluta - ícone precisa ser reconhecido em 1 segundo movendo a 250px/s

---

## Escala de Assets

### Canvas/Viewport
- **Mobile (mínimo):** 360px largura → canvas 340px (~1:1.5 ratio)
- **Mobile (ideal):** 420px largura → canvas 400px
- **Desktop (máximo razoável):** 640px largura canvas (não maior, jogo fica estranho)
- **Altura:** Sempre ~1.5-1.6x largura (corredor vertical)
- **Aspect ratio target:** 9:16 (mobile portrait feel) ou 10:16

### Elementos de jogo
- **Player:** 18-22px raio (~36-44px diâmetro)
- **Pickup small (apoio, individualismo):** 14-16px raio
- **Pickup medium (mutirão):** 16-18px raio
- **Pickup large (chance):** 20-24px raio
- **Obstacle (bloqueio):** 30-36px quadrado ou altura
- **Lane width:** Canvas width / 3
- **Collision tolerance:** ±20-24px (não ultra preciso, acessível)

### Fontes de HUD
- **Score principal:** 18-22px bold sans-serif
- **Stats linha:** 14-16px regular sans-serif
- **Labels:** 12-14px regular sans-serif
- **Textos secundários:** 11-13px regular sans-serif
- **Família recomendada:** System sans (mantém performance)

---

## Estilo do HUD

### Layout geral
- **Posição:** HUD fixo no topo do canvas (dentro do canvas, não fora)
- **Fundo:** Painel translúcido escuro para legibilidade
- **Margem:** 12-16px das bordas
- **Hierarquia:** Score > Meter coletivo > Stats secundárias

### Componentes do HUD

**Barra de tempo/progresso:**
- Posição: Topo absoluto, margem 12px
- Tamanho: Largura canvas - 24px, altura 18-22px
- Fundo: Preto translúcido `rgba(9, 20, 30, 0.9)`
- Progresso: Verde `#7ce0ae` ou gradiente verde→amarelo
- Borda: 1px branco/cinza transparente

**Score:**
- Posição: Logo abaixo da barra de progresso, alinhado à esquerda
- Fonte: Bold 20px
- Cor: Branco quente `#f0f5ff`
- Label: "Score" seguido do número, ou apenas número grande

**Meter coletivo:**
- Posição: Abaixo do score
- Formato: Barra horizontal ou porcentagem textual
- Cor: Verde quando alto, amarelo quando médio, vermelho quando baixo
- Animação: Transição suave (interpolação já implementada)

**Combo indicator:**
- Posição: Substituir stats secundárias quando ativo
- Cor: Amarelo brilhante `#ffd765`
- Ícone: 🔥 ou símbolo de estrela
- Texto: "Mutirão ativo" ou "Combo x2"

**Stats secundários:** 
- Posição: Linha adicional abaixo do meter
- Fonte: Regular 13px
- Cor: Cinza claro `#c5d9e8`
- Formato: "Apoios 5 | Mutirões 2" (separado por pipe)

---

## Estilo de Feedback

### Colisão/Coleta
- **Apoio coletado:** Flash verde leve no canvas + aumento temporário do meter
- **Bloqueio hit:** Flash vermelho no canvas (já implementado) + shake leve?
- **Mutirão coletado:** Texto "Mutirão!" aparece no centro por 0.8s, fade out
- **Individualismo coletado:** Nenhum flash (reforça que é neutro/negativo)
- **Chance coletada:** Efeito de estrela explodindo, texto "!!" grande no centro

### Lane switch
- **Visual:** Lane destino acende leve antes do player chegar
- **Som:** (futuro) Som leve de switch
- **Animação:** Player pode ter leve arc/curve ao trocar (não teleporte instantâneo)

### Pause
- **Overlay:** Escurece canvas com `rgba(8, 18, 29, 0.75)`
- **Texto:** "Pausado" grande no centro, branco
- **Instrução:** "Toque P para retomar" abaixo, menor

### Game Over / Fim de run
- **Transição:** Fade out do gameplay em 0.5s
- **Tela:** Card de resultado substitui canvas (já implementado)
- **Destaque:** Score final grande e legível

---

## Como a Campanha Entra Visualmente

### No mundo do jogo
- **Apoio coletivo:** Representa organização popular (verde, símbolo de pessoas juntas)
- **Mutirão:** Ação coletiva direta (amarelo, símbolo de movimento)
- **Bloqueios:** Catracas, barreiras do capital (vermelho, forma de portão/X)
- **Individualismo:** Atalho individual que sabota o comum (cinza, símbolo de dinheiro)
- **Chance:** Oportunidade rara de organização ampliada (ciano, estrela)

### No protagonista
- **Alexandre Fonseca** como avatar jogável:
  - Amarelo característico da campanha
  - Silhueta reconhecível (sem precisar de foto-realismo)
  - Pode ter inicial "AF" ou avatar estilizado

### Na narrativa de resultado
- **Títulos:** Linguagem de mobilização ("Corredor do Povo Liberado")
- **Texto de resultado:** Conecta score com estratégia política real
- **Linha de campanha:** Sempre presente ("Tarifa zero e organização popular")

### Nos elementos visuais
- **Cores da campanha** (`#f9cf4a` amarelo, `#123d59` azul) como fundação
- **Gradientes** de azul escuro (base urbana/transporte)
- **Formas** que remetem a movimento, cidade, transporte coletivo

---

## Pipeline de Assets (Próximo)

Este documento define DIREÇÃO. O próximo passo é criar/organizar:
- `public/arcade/tarifa-zero/player/` → Variantes do protagonista
- `public/arcade/tarifa-zero/pickups/` → Apoio, mutirão, chance, individualismo
- `public/arcade/tarifa-zero/obstacles/` → Bloqueios, barreiras
- `public/arcade/tarifa-zero/ui/` → HUD elements, ícones
- `public/arcade/tarifa-zero/bg/` → Backgrounds, lane markers, ambiente

Assets podem ser:
- SVG inline (melhor performance, escalabilidade)
- PNG pequenos bem otimizados (fallback se SVG complexo demais)
- Canvas drawing direto (atual, pode ser mantido para elementos simples)

---

## Princípios de Implementação

1. **Mobile-first sempre:** Tudo precisa funcionar perfeitamente em 360px de largura.
2. **Performance crítica:** 60fps estável ou o jogo perde a magia.
3. **Legibilidade > beleza:** Se não dá pra ler em movimento, não serve.
4. **Política no mundo, não só texto:** O jogo precisa MOSTRAR coletividade x individualismo, não só falar.
5. **Profissional, não barroco:** Evitar over-design. Clareza e consistência > efeitos excessivos.
6. **Iteração responsável:** Melhorar sem quebrar o que funciona.

---

## O Que Fica para T35B (Não fazer agora)

- Animações complexas de entrada/saída de entidades
- Partículas realistas
- Som/música
- Multiplayer ou leaderboard global
- Mais de 1 arcade
- Customização de avatar
- Power-ups mais complexos
- Modo história/campanha multi-fase

**Foco do T35A:** Fundação visual profissional para o jogo atual.

---

**Última atualização:** 2026-03-07 (T35A)  
**Status:** Documento vivo - pode evoluir conforme implementação  
**Responsável:** Principal engineer + game director
