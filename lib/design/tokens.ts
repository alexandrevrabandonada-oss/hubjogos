/**
 * Design System Tokens
 * Eixo visual: urbano/político contemporâneo (asfalto, concreto, ferrugem)
 */

export const tokens = {
  // Semantic colors
  colors: {
    bg: '#11100e',
    surface: '#1b1916',
    surface2: '#26221d',
    text: '#f2ede4',
    textMuted: '#b5ad9e',
    accent: '#d6ac00',
    accentStrong: '#f0c419',
    danger: '#a6472d',
    border: '#3a342b',
    success: '#738f3d',
    active: '#c97e2f',
  },

  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '10px',
    md: '16px',
    lg: '24px',
    xl: '36px',
    '2xl': '52px',
    '3xl': '72px',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '18px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
    md: '0 6px 16px rgba(0, 0, 0, 0.28)',
    lg: '0 12px 28px rgba(0, 0, 0, 0.38)',
    xl: '0 18px 42px rgba(0, 0, 0, 0.48)',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      md: '16px',
      lg: '18px',
      xl: '22px',
      '2xl': '30px',
      '3xl': '40px',
      '4xl': '52px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Breakpoints
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    large: '1440px',
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 500,
    fixed: 1000,
    modal: 2000,
    tooltip: 3000,
  },
};

export type Tokens = typeof tokens;
