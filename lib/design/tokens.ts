/**
 * Design System Tokens
 * Inspiração: Universo urbano/industrial VR Abandonada, contemporâneo
 */

export const tokens = {
  // Colors
  colors: {
    // Primary palette
    action: '#FF1493', // Rosa quente - CTAs, destaque
    secondary: '#00D9FF', // Ciano - links, hover
    accent: '#FFB81C', // Amarelo sinalização - highlights

    // Neutrals
    dark: {
      bg: '#0A0E27', // Background principal muito escuro
      surface: '#1A1F3A', // Cards, modals
      border: '#2A2F4A', // Bordas
    },
    light: {
      primary: '#FFFFFF', // Texto principal
      secondary: '#A0A0B0', // Texto secundário
    },

    // Status (futuro)
    success: '#00FF88',
    warning: '#FFB81C',
    error: '#FF3860',
    info: '#00D9FF',
  },

  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.2)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.3)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.4)',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      '2xl': '28px',
      '3xl': '36px',
      '4xl': '48px',
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
