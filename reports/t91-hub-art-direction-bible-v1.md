# T91 — Hub Art Direction Bible v1: Master Visual Language

## 🎯 Context: Visual Execution for Flagships
Este documento define o sistema de linguagem visual original do Hub. O objetivo é garantir que cada jogo, independente do gênero, carregue o DNA visual do Hub: **Territorial, Vibrante, Reativo e Tátil.**

---

## 🏛️ 1. Master Visual Identity (Identidade Núcleo)

### Shape Language (Formas)
- **Cuidado/Comunidade**: Formas orgânicas, cantos arredondados, silhuetas suaves (clip-paths fluidos).
- **Crise/Infraestrutura**: Formas geométricas rígidas, cantos vivos, linhas de grade técnicas.
- **Contraste**: O perigo deve ser "afiado" e retangular; a proteção deve ser "acolhedora" e circular/orgânica.

### Color Philosophy (Cores)
- **Palette**: HSL tailored para garantir harmonia.
- **Saúde (Teal/Emerald)**: `#22c55e` (Ação positiva), `#4bb0ff` (Rede estável).
- **Atenção (Amber/Orange)**: `#f59e0b` (Urgência mid-level).
- **Crise (Red/Crimson)**: `#ef4444` (Vibe "Emergency Scan").
- **Fundo (Deep Navy/Slate)**: `#020c18` (Profundidade e contraste para glows).

### Texture & Materiality
- **RJ Urban**: Concrete (cinza texturizado), Ceramic Tile (azulejos), Brick (tijolo aparente), Tropical Greenery (verde vibrante).
- **Overlay**: Scan-lines sutis e vinhetas para dar profundidade de cockpit/radar.

---

## 🕹️ 2. Visual Grammar by Genre (Gramática por Gênero)

| Gênero | Câmera | Escala de Assets | Foco de HUD | Readability Cue |
| :--- | :--- | :--- | :--- | :--- |
| **RTS-lite** | Angled Isometric | Miniature (Tabletop) | Tactile Toolbars | Linhas de pulso/despache |
| **City Sim** | Top-down Map | Large Silhouettes | Glassmorphic HUD | Overlays de cor do distrito |
| **Platformer** | Side-view 2D | Heroic (Character) | Minimalist Overlay | Contraste de silhueta (Foreground) |
| **Physics** | 2D / 45° | Object-focused | Hit-counters | Partículas de colapso/debris |

---

## 📐 3. Camera & Board Rules
- **RTS/Strategy**: Manter o "Command Center" vibe. Mapa fixo com zoom responsivo. 
- **Simulations**: "God View" pura. O terreno é a interface (Map-first).
- **Arcade/Action**: "Center Frame". O player/objeto central guia a rolagem.

---

## 🛠️ 4. Asset Fidelity Targets (Níveis de Entrega)
1. **Graybox**: Formas básicas, cores chapadas, zero assets complexos.
2. **Visual Beta**: Assets SVG base, paleta de cores final, HUD funcional.
3. **Public Ready**: Sombreado, brilhos (glows), animações de idle, áudio sync.
4. **Flagship Ready**: Partículas, micro-interações, efeitos de glitch/shockwave, "Juice" total.

---

## ⚡ 5. Motion & Gamefeel Language
- **Click Response**: Sempre gera uma micro-escala (1.1x) e um glow instantâneo.
- **Danger Escalation**: Pulsação de borda frenética e distorção de cor (hue-shift para vermelho).
- **Success Relief**: Varredura de luz ciano/verde (clean sweep) e retorno à estabilidade calma.
- **Ambient Life**: O mapa nunca fica parado. Poeira, luzes ou trânsito devem estar sempre em movimento sutil.

---

## 🚧 6. Anti-Copy Guardrails
- **DO NOT**: Usar layouts de grade de SimCity ou fontes de Mario.
- **INSTEAD**: Usar a estética de favela RJ (densidade orgânica) e fontes técnicas modernas (Inter/Outfit).
- **DO NOT**: Usar os mesmos ícones de RTS clássicos.
- **INSTEAD**: Usar simbologia de brigadas populares e mutirões territoriais.

---

## 📈 7. Application Examples

### Bairro Resiste (Arcade Strategy)
- **Target**: Estilo "Radar de Proteção".
- **Visuals**: Hotspots com silhuetas de prédios reais RJ. Linhas de despache como raios de energia de cuidado. Atmosphere fog permanente.

### Cidade Real (Map View Sim)
- **Target**: Estilo "Topografia de Poder".
- **Visuals**: Distritos com bordas irregulares (geografia do Rio). Intervenções que deixam "marcas verdes" permanentes no mapa cinza.

---

## 📸 8. Screenshot Standards (O Teste da Verdade)
Todo jogo do Hub deve produzir estes 5 stills para marketing:
1. **The Hero Shot**: Dashboard de gameplay limpo, mostrando a beleza do mundo.
2. **The Tension Shot**: Momento de crise máxima com todos os FX ativos.
3. **The InterAction**: Momento exato de um clique com shockwave/glow.
4. **The Scale Shot**: Mostrando a totalidade da cidade/bairro sob controle.
5. **The Outcome Card**: O resumo visual da glória ou colapso.
