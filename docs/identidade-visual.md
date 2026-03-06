# Identidade Visual - Hub de Jogos da Pré-Campanha

## 🎨 Conceito

**Universo:** Urbano/Industrial, inspirado em "VR Abandonada" / "#ÉLUTA"  
**Tom:** Moderno, vibrante, ousado  
**Acessibilidade:** WCAG AA (future target)

---

## 🎭 Mood Board

**Características:**
- ✅ Moderna, não retro
- ✅ Forte presença visual
- ✅ Rápida legibilidade em mobile
- ✅ Shareable e fotogênica
- ⚠️ Evitar: Placeholder, corporate clichê, estética dated

**Inspirações (referência, não cópia):**
- Abstracionismo geométrico urbano
- Graffiti digital limpo
- Interfaces futuristas accessíveis
- Palette de cores estratégicas

---

## 🎨 Paleta de Cores

### Primária

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Ação** | `#FF1493` | (255, 20, 147) | CTAs, destaque máximo |
| **Secundária** | `#00D9FF` | (0, 217, 255) | Links, hover, interação |
| **Terciária** | `#FFB81C` | (255, 184, 28) | Alertas, achievements |

### Neutros

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Background Dark** | `#0A0E27` | (10, 14, 39) | Fundo principal |
| **Surface** | `#1A1F3A` | (26, 31, 58) | Cards, modals |
| **Text Primary** | `#FFFFFF` | (255, 255, 255) | Texto principal |
| **Text Secondary** | `#A0A0B0` | (160, 160, 176) | Texto secundário |
| **Border** | `#2A2F4A` | (42, 47, 74) | Bordas, dividers |

### Extends (Futuro)

- **Success:** `#00FF88`
- **Warning:** `#FFB81C`
- **Error:** `#FF3860`
- **Info:** `#00D9FF`

---

## 🔤 Tipografia

### Headlines

**Família:** `Inter` ou `Poppins` (web font)  
**Weights:** 700 (bold), 600 (semibold)  
**Sizes:**
- H1: 48px (mobile: 32px)
- H2: 36px (mobile: 24px)
- H3: 28px (mobile: 20px)

```css
font-family: 'Poppins', sans-serif;
font-weight: 700;
line-height: 1.2;
letter-spacing: -0.02em;
```

### Body Text

**Família:** `Inter`  
**Weight:** 400  
**Sizes:**
- Body L: 18px
- Body M: 16px (default)
- Body S: 14px
- Caption: 12px

```css
font-family: 'Inter', sans-serif;
font-weight: 400;
line-height: 1.5;
letter-spacing: -0.01em;
```

### Monospace (futuro - código/dados)

**Família:** `JetBrains Mono`  
**Weight:** 400  
**Size:** 14px

---

## 🎨 Componentes Visuais

### Buttons

**Estado Default:**
```css
background: #FF1493;
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;
border: none;
cursor: pointer;
transition: all 0.2s ease;
```

**Estado Hover:**
```css
background: #E60A7D;
transform: translateY(-2px);
box-shadow: 0 8px 16px rgba(255, 20, 147, 0.3);
```

**Estado Active:**
```css
background: #C6085C;
transform: translateY(0);
```

**Secundário (Ghost):**
```css
background: transparent;
border: 2px solid #00D9FF;
color: #00D9FF;
```

### Cards

```css
background: #1A1F3A;
border: 1px solid #2A2F4A;
border-radius: 12px;
padding: 20px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
```

### Dividers & Borders

```css
border-color: #2A2F4A;
border-width: 1px;
margin: 16px 0;
```

### Input Fields

```css
background: #0A0E27;
border: 2px solid #2A2F4A;
border-radius: 8px;
padding: 12px 16px;
color: #FFFFFF;
font-size: 16px;
```

**Focus State:**
```css
border-color: #00D9FF;
box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
```

---

## 📱 Spacing & Layout

### Spacing Scale

```
4px   (xs)
8px   (sm)
16px  (md)
24px  (lg)
32px  (xl)
48px  (2xl)
64px  (3xl)
```

### Grid

Mobile-first:
- **Mobile:** 1 column, 16px padding
- **Tablet:** 2 columns, 24px padding
- **Desktop:** 4 columns, 32px padding

### Typography Spacing

```
Headline + Body: 16px gap
Section to Section: 32px gap
Paragraph to Paragraph: 12px gap
```

---

## 🎯 Iconograpia

**Estilo:** Stroke-based, 24px base size, 2px stroke width  
**Conjunto:** Heroicons v2 ou similar (futuro)

---

## 🎮 Game UI Specifics

### Score Display

```css
font-size: 32px;
font-weight: 700;
color: #FFB81C;        /* Destaque */
font-family: 'JetBrains Mono';
```

### Game Over / Result Screen

**Fundo:** Gradient dark to darker  
**CTA:** Botão #FF1493 destacado  
**Texto:** #FFFFFF com sombra para legibilidade

### Share Card (Preview)

- Dimensões: 1200x630px (OG Image)
- Logo no topo
- Score/result centralizado
- CTA "Compartilhar" em destaque
- QR code ou URL curta

---

## ♿ Acessibilidade

### Contrast Ratios

- **Text on background:** 7:1 (AAA target)
- **UI components:** 4.5:1 minimum (AA)

### Color Not Alone

- Usar ícones + cores para diferencer estados
- Exemplo: ✓ checkmark + cor verde, não só cor

### Focus States

```css
outline: 2px solid #00D9FF;
outline-offset: 2px;
```

### Font Sizes

- Mínimo body: 16px
- Escala responsiva em mobile

---

## 🎬 Animations & Micro-interactions

### Button Interactions

- Hover: `-2px` transform + shadow
- Active: no transform (feedback immediate)
- Disabled: opacity 0.5

### Transitions

```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Load States

- Skeleton screens (shimmer effect)
- Spinner com cor #00D9FF
- Progress bars com gradient

---

## 🎨 Dark Mode (Primary) / Light Mode (Future)

**MVP:** Apenas dark mode  
**Futuro:** Light mode com paleta adaptada

---

## 📐 Responsive Breakpoints

```css
/* Mobile first */
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;
$large: 1440px;
```

---

## 🗺️ Design System Roadmap

### Tijolo 03 (MVP)
- [ ] Paleta de cores
- [ ] Tipografia base
- [ ] Buttons, Cards, Inputs
- [ ] Spacing & Grid
- [ ] Dark mode default

### Tijolo 03+ (Extensão)
- [ ] Iconografia
- [ ] Animations
- [ ] Light mode
- [ ] Figma component library
- [ ] Storybook integration

---

## 🔗 Referências

**Inspirações:**
- Dribbble: search "dark mode games", "interactive UI"
- Behance: "gamification design"
- UI kits: Radix UI, shadcn/ui (para referência estrutural)

**Tools:**
- Figma (design)
- Color Picker: https://www.colorhexa.com/
- Contrast Checker: https://webaim.org/resources/contrastchecker/

---

## 📝 Implementação em Código

Cada componente segue:

```tsx
// Button.tsx
import styles from './Button.module.css';

export function Button({ children, variant = 'primary', ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

```css
/* Button.module.css */
.button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.primary {
  background: #FF1493;
  color: #FFFFFF;
}

.primary:hover {
  background: #E60A7D;
  transform: translateY(-2px);
}
```

---

**Última atualização:** 2026-03-05  
**Status:** Draft - Completo para Tijolo 01, detalha em Tijolo 03
