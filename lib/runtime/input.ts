// Input Management System
// T72 — Game Runtime Contract

import { InputMode, InputConfig, TouchZoneConfig, KeyboardMapConfig } from './types';

// --- Input Detection ---

export function detectInputMode(): InputMode {
  if (typeof window === 'undefined') return 'touch_simple';
  
  // Check for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check for fine pointer (mouse)
  const hasMouse = window.matchMedia('(pointer: fine)').matches;
  
  if (hasTouch && !hasMouse) {
    return 'touch_simple';
  } else if (hasMouse) {
    return 'mixed_pointer';
  } else {
    return 'keyboard';
  }
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (width < 768 && hasTouch) {
    return 'mobile';
  } else if (width < 1024 && hasTouch) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// --- Input Configuration Builders ---

export function buildArcadeInputConfig(): InputConfig {
  const deviceType = getDeviceType();
  
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    return {
      mode: 'touch_action',
      hints: {
        primaryAction: 'Toque para agir',
        movement: 'Arraste para mover',
        pause: 'Pausar',
      },
      touchZones: [
        {
          id: 'action',
          label: 'Ação',
          region: 'right',
          action: 'primary',
          priority: 'primary',
        },
        {
          id: 'movement',
          label: 'Mover',
          region: 'left',
          action: 'move',
          priority: 'primary',
        },
      ],
    };
  } else {
    return {
      mode: 'keyboard',
      hints: {
        primaryAction: 'Espaço ou K',
        movement: 'Setas ou WASD',
        pause: 'P ou Esc',
      },
      keyboardMap: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        action: ' ',
        secondary: 'Shift',
        pause: 'Escape',
      },
    };
  }
}

export function buildNarrativeInputConfig(): InputConfig {
  return {
    mode: 'touch_simple',
    hints: {
      primaryAction: 'Toque para continuar',
      pause: 'Pausar',
    },
    touchZones: [
      {
        id: 'continue',
        label: 'Continuar',
        region: 'center',
        action: 'continue',
        priority: 'primary',
      },
    ],
    keyboardMap: {
      action: ' ',
      pause: 'Escape',
    },
  };
}

export function buildSimulationInputConfig(): InputConfig {
  const deviceType = getDeviceType();
  
  if (deviceType === 'mobile' || deviceType === 'tablet') {
    return {
      mode: 'touch_drag',
      hints: {
        primaryAction: 'Toque para selecionar',
        secondaryAction: 'Arraste para mover',
        pause: 'Pausar',
      },
      touchZones: [
        {
          id: 'select',
          label: 'Selecionar',
          region: 'center',
          action: 'select',
          priority: 'primary',
        },
        {
          id: 'menu',
          label: 'Menu',
          region: 'top',
          action: 'menu',
          priority: 'secondary',
        },
      ],
    };
  } else {
    return {
      mode: 'mixed_pointer',
      hints: {
        primaryAction: 'Clique para selecionar',
        secondaryAction: 'Botão direito',
        movement: 'Arraste',
        pause: 'P ou Esc',
      },
      keyboardMap: {
        action: ' ',
        pause: 'Escape',
      },
    };
  }
}

export function buildQuizInputConfig(): InputConfig {
  return {
    mode: 'touch_simple',
    hints: {
      primaryAction: 'Toque para responder',
      pause: 'Pausar',
    },
    touchZones: [
      {
        id: 'answer',
        label: 'Responder',
        region: 'center',
        action: 'answer',
        priority: 'primary',
      },
    ],
    keyboardMap: {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      action: 'Enter',
      pause: 'Escape',
    },
  };
}

// --- Input Hints Display ---

export function formatInputHints(config: InputConfig): string[] {
  const hints: string[] = [];
  
  if (config.hints.primaryAction) {
    hints.push(config.hints.primaryAction);
  }
  
  if (config.hints.movement) {
    hints.push(config.hints.movement);
  }
  
  if (config.hints.secondaryAction) {
    hints.push(config.hints.secondaryAction);
  }
  
  if (config.hints.pause) {
    hints.push(`${config.hints.pause} para pausar`);
  }
  
  if (config.hints.special) {
    hints.push(...config.hints.special);
  }
  
  return hints;
}

// --- Keyboard Event Helpers ---

export function matchesKeyboardMap(
  event: KeyboardEvent,
  map: KeyboardMapConfig,
  action: keyof KeyboardMapConfig
): boolean {
  const key = map[action];
  if (!key) return false;
  
  return event.key === key || event.code === key;
}

// --- Touch Zone Helpers ---

export function getTouchZoneStyle(
  zone: TouchZoneConfig,
  isActive: boolean
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    touchAction: 'manipulation',
  };
  
  const regionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '3rem',
      height: '3rem',
    },
    bottom: {
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '3rem',
      height: '3rem',
    },
    left: {
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4rem',
      height: '4rem',
    },
    right: {
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4rem',
      height: '4rem',
    },
    center: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
    },
  };
  
  const priorityColors = {
    primary: isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
    secondary: isActive ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
    tertiary: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
  };
  
  return {
    ...baseStyle,
    ...regionStyles[zone.region],
    backgroundColor: priorityColors[zone.priority],
    color: 'white',
    border: isActive ? '2px solid white' : '2px solid transparent',
  };
}
