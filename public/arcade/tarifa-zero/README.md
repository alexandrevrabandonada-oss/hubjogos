# Pipeline de Assets - Tarifa Zero RJ

**Localização:** `public/arcade/tarifa-zero/`  
**Criado em:** T35A (2026-03-07)  
**Propósito:** Organizar assets visuais do arcade de forma profissional e escalável

---

## Estrutura de Diretórios

```
public/arcade/tarifa-zero/
├── player/          # Avatar do protagonista (Alexandre Fonseca)
├── pickups/         # Itens colecionáveis (apoio, mutirão, individualismo, chance)
├── obstacles/       # Bloqueios e barreiras
├── ui/              # Elementos de HUD e interface
├── bg/              # Backgrounds, lane markers, ambiente
└── README.md        # Este arquivo
```

---

## Convenções de Nomenclatura

### Formato geral
`{categoria}-{nome}-{variante}.{ext}`

Exemplos:
- `player-af-default.svg`
- `player-af-moving-left.svg`
- `pickup-apoio-default.svg`
- `pickup-mutirao-active.svg`
- `obstacle-catraca-closed.svg`
- `ui-progress-bar-fill.svg`
- `bg-lane-marker.svg`

### Regras
- **Minúsculas sempre**
- **Hífen como separador** (não underscore, não camelCase)
- **Sem espaços**
- **Nomes descritivos** (não `img1.png`, `asset-final-v3.svg`)
- **Variantes claras:** `default`, `active`, `disabled`, `hover`, etc.

---

## Formatos Suportados

### Prioridade 1: SVG
- **Quando:** Formas simples, ícones, elementos de UI
- **Vantagens:** Escalável, leve, fácil de colorir via código
- **Limitações:** Pode ser complexo demais para rendering em alta velocidade
- **Convenção:** Sempre minimizado (sem comentários/metadata desnecessário)

### Prioridade 2: PNG otimizado
- **Quando:** Elementos com gradientes complexos, texturas
- **Vantagens:** Rendering rápido, previsível
- **Limitações:** Não escala perfeitamente, pode ficar pixelado
- **Tamanhos recomendados:**
  - Small (pickups): 32x32px @2x = 64x64px
  - Medium (player): 44x44px @2x = 88x88px  
  - Large (obstacles): 64x64px @2x = 128x128px
- **Otimização:** Sempre rodar por ImageOptim/TinyPNG antes de commit

### Canvas drawing direto
- **Quando:** Elementos extremamente simples (círculos, retângulos)
- **Vantagens:** Zero assets, performance máxima
- **Limitações:** Difícil de iterar visualmente
- **Uso atual:** Mantido para elementos temporários/prototype

---

## Categorias Detalhadas

### `player/` - Protagonista

Arquivos:
- `player-af-default.svg` → Estado padrão (frente/neutro)
- `player-af-moving-left.svg` → (futuro) Inclinação pra esquerda
- `player-af-moving-right.svg` → (futuro) Inclinação pra direita
- `player-af-hit.svg` → (futuro) Estado de colisão

**Diretrizes:**
- Raio de ~20px (40x40px viewBox)
- Cores da campanha (#f9cf4a principal)
- Silhueta reconhecível mesmo em movimento rápido
- Pode usar avatar oficial simplificado ou inicial "AF" estilizada

**Status atual (T35A):**
- Usando canvas drawing (círculo amarelo + texto "AF")
- Assets SVG a criar em próxima iteração

---

### `pickups/` - Itens Colecionáveis

Arquivos planejados:
- `pickup-apoio-default.svg` → Apoio coletivo (verde #7ce0ae)
- `pickup-mutirao-default.svg` → Mutirão (amarelo #ffd765)
- `pickup-mutirao-active.svg` → Mutirão com brilho (quando combo ativo)
- `pickup-individualismo-default.svg` → Atalho individual (cinza #d3d3d3)
- `pickup-chance-default.svg` → Chance coletiva (ciano #00d9ff)
- `pickup-chance-glow.svg` → Chance com aura

**Diretrizes:**
- Raio entre 14-18px dependendo do tipo
- Contorno de 2-3px para legibilidade
- Ícone interno claro (símbolo ou letra)
- Cores seguindo direção de arte

**Símbolos sugeridos:**
- Apoio: `+` ou ícone de pessoas juntas
- Mutirão: `M` ou ícone de movimento coletivo
- Individualismo: `$` ou seta individualista
- Chance: `?` ou estrela preenchida

**Status atual (T35A):**
- Usando canvas drawing (formas primitivas)
- Assets SVG a criar conforme direção de arte

---

### `obstacles/` - Bloqueios e Barreiras

Arquivos planejados:
- `obstacle-catraca-closed.svg` → Catraca/barreira fechada (vermelho #f45f5f)
- `obstacle-catraca-breaking.svg` → (futuro) Catraca quebrando
- `obstacle-barreira.svg` → Variante: barreira policial
- `obstacle-portao.svg` → Variante: portão fechado

**Diretrizes:**
- Tamanho: 32x32px ou 36x36px (maior que pickups)
- Forma retangular/quadrada (não circular)
- Visual de bloqueio/impedimento claro
- Vermelho intenso (#f45f5f) com contorno branco/cinza

**Símbolos sugeridos:**
- X grande
- Barras horizontais
- Forma de catraca
- Portão com cadeado

**Status atual (T35A):**
- Usando canvas drawing (retângulo vermelho + X)
- Assets SVG a criar com formas mais temáticas

---

### `ui/` - Elementos de HUD

Arquivos planejados:
- `ui-progress-bar-bg.svg` → Fundo da barra de progresso
- `ui-progress-bar-fill.svg` → Preenchimento verde
- `ui-meter-bg.svg` → Fundo do medidor coletivo
- `ui-meter-fill.svg` → Preenchimento do meter
- `ui-combo-icon.svg` → Ícone de combo (🔥)
- `ui-pause-icon.svg` → Ícone de pause
- `ui-star.svg` → Estrela de feedback

**Diretrizes:**
- Elementos leves e não intrusivos
- Seguir paleta secundária (UI/HUD)
- Bordas arredondadas consistentes (8-10px)
- Translucência onde apropriado

**Status atual (T35A):**
- HUD todo em canvas drawing
- Assets SVG podem ser criados para melhorar qualidade visual

---

### `bg/` - Backgrounds e Ambiente

Arquivos planejados:
- `bg-gradient.svg` → Gradiente de fundo (azul escuro → azul transporte)
- `bg-lane-separator.svg` → Linha de separação de lane
- `bg-lane-active.svg` → Overlay de lane ativa
- `bg-asphalt-texture.png` → (opcional) Textura leve de asfalto
- `bg-city-silhouette.svg` → (opcional) Silhueta de cidade ao fundo

**Diretrizes:**
- Sutileza: não competir com elementos de gameplay
- Gradientes suaves (não high-contrast)
- Texturas opcionais e muito leves (opacity <0.1)
- Separadores de lane com alpha baixo

**Status atual (T35A):**
- Fundo: gradiente canvas
- Lanes: retângulos translúcidos
- Assets podem ser criados para ambiente mais rico

---

## Workflow de Criação

### 1. Concept/Sketch
- Rascunho rápido (papel, Figma, Excalidraw)
- Validar tamanho e legibilidade na escala real
- Checar contraste com background

### 2. Criação
- Ferramentas sugeridas: Figma, Illustrator, Affinity Designer, Inkscape
- Seguir direção de arte (cores, formas, contornos)
- Manter simplicidade (performance importa)

### 3. Exportação
- **SVG:** Exportar com viewBox, sem dimensões fixas
- **PNG:** Exportar @2x (retina), depois redimensionar para @1x também
- Nomear seguindo convenção

### 4. Otimização
- **SVG:** SVGO, SVGOMG (remover metadata, otimizar paths)
- **PNG:** ImageOptim, TinyPNG, Squoosh
- Target: <5KB por asset pequeno, <15KB por asset médio

### 5. Integração
- Colocar no diretório apropriado
- Atualizar código para usar asset (se aplicável)
- Testar em mobile e desktop
- Validar performance (manter 60fps)

---

## Derivação Futura

Este pipeline é extensível para:
- Novos arcades (criar `public/arcade/{slug}/`)
- Variantes de tema (dia/noite, clima)
- Acessibilidade (alto contraste, formas alternativas)
- Animações (sprites, frame-by-frame se necessário)

**Regra geral:** Manter organização consistente, nomenclatura clara, e performance como prioridade.

---

## Fallbacks e Compatibilidade

### Quando um asset não carrega
- O jogo deve ter fallback para canvas drawing
- Nunca quebrar gameplay por falta de asset
- Console.warn ao invés de erro crítico

### Retro-compatibilidade
- Assets novos não devem quebrar implementação canvas atual
- Migração pode ser gradual (um elemento por vez)
- Priority: Player > Pickups > Obstacles > UI > BG

---

## Checklist de Qualidade

Antes de considerar um asset "pronto":
- [ ] Segue nomenclatura do pipeline
- [ ] Tamanho apropriado (não excessivo)
- [ ] Cores seguem direção de arte
- [ ] Legível em movimento rápido
- [ ] Performance testada (não degrada FPS)
- [ ] Funciona em mobile e desktop
- [ ] Otimizado (SVGO/ImageOptim rodado)
- [ ] Fallback canvas ainda funciona caso asset falhe
- [ ] Documentado (se for asset principal)

---

**Status do pipeline (T35A):**  
✅ Estrutura de diretórios criada  
✅ Convenções definidas  
✅ Documentação base escrita  
⏳ Assets SVG/PNG profissionais a criar

**Próximo passo:** Começar criação dos assets seguindo a direção de arte estabelecida.

---

**Última atualização:** 2026-03-07 (T35A)  
**Responsável:** Principal engineer + game director
