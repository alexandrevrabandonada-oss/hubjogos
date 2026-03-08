export type ArcadeSfxCue =
  | 'move'
  | 'pause'
  | 'resume'
  | 'powerup'
  | 'collision-light'
  | 'collision-heavy'
  | 'phase-transition'
  | 'special-event'
  | 'run-end';

export interface ArcadeAudioController {
  arm: () => void;
  toggleMute: () => boolean;
  setMuted: (value: boolean) => void;
  isMuted: () => boolean;
  play: (cue: ArcadeSfxCue) => void;
}

function tone(
  context: AudioContext,
  frequency: number,
  durationMs: number,
  gainValue: number,
  type: OscillatorType,
  delayMs = 0,
) {
  const now = context.currentTime + delayMs / 1000;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000 + 0.02);
}

export function createArcadeAudioController(): ArcadeAudioController {
  let context: AudioContext | null = null;
  let muted = true;
  let armed = false;

  const ensureContext = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!context) {
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        return null;
      }
      context = new AudioContextCtor();
    }

    if (context.state === 'suspended') {
      void context.resume();
    }

    return context;
  };

  const play = (cue: ArcadeSfxCue) => {
    if (muted || !armed) {
      return;
    }

    const ctx = ensureContext();
    if (!ctx) {
      return;
    }

    switch (cue) {
      case 'move':
        tone(ctx, 420, 70, 0.02, 'square');
        break;
      case 'pause':
        tone(ctx, 280, 100, 0.03, 'triangle');
        break;
      case 'resume':
        tone(ctx, 360, 90, 0.03, 'triangle');
        break;
      case 'powerup':
        tone(ctx, 620, 110, 0.035, 'sine');
        tone(ctx, 780, 140, 0.02, 'sine', 40);
        break;
      case 'collision-light':
        tone(ctx, 180, 120, 0.03, 'sawtooth');
        break;
      case 'collision-heavy':
        tone(ctx, 120, 170, 0.04, 'sawtooth');
        tone(ctx, 90, 140, 0.03, 'square', 24);
        break;
      case 'phase-transition':
        tone(ctx, 420, 100, 0.024, 'triangle');
        tone(ctx, 540, 120, 0.026, 'triangle', 70);
        tone(ctx, 640, 130, 0.022, 'triangle', 140);
        break;
      case 'special-event':
        tone(ctx, 520, 110, 0.03, 'sine');
        tone(ctx, 680, 120, 0.025, 'sine', 60);
        break;
      case 'run-end':
        tone(ctx, 460, 130, 0.03, 'triangle');
        tone(ctx, 620, 170, 0.025, 'triangle', 90);
        break;
      default:
        break;
    }
  };

  return {
    arm: () => {
      armed = true;
      ensureContext();
    },
    toggleMute: () => {
      muted = !muted;
      return muted;
    },
    setMuted: (value: boolean) => {
      muted = value;
    },
    isMuted: () => muted,
    play,
  };
}
