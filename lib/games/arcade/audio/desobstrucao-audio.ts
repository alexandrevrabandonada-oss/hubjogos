/**
 * T114 Desobstrução Audio System
 * Impact feedback via Web Audio API
 * Minimal, satisfying, not intrusive
 */

export interface AudioConfig {
  masterVolume: number; // 0–1
  sfxVolume: number; // 0–1
  enabled: boolean;
}

export class DesobstrucaoAudio {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig;
  private oscillators: Map<string, OscillatorNode> = new Map();

  constructor(config?: Partial<AudioConfig>) {
    this.config = {
      masterVolume: 0.3,
      sfxVolume: 0.5,
      enabled: true,
      ...config,
    };
  }

  // Initialize audio context on first user interaction
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (e) {
      console.warn('Audio initialization failed:', e);
      this.config.enabled = false;
    }
  }

  private get ctx(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Impact Crunch — Heavy, satisfying collision sound
   * Frequency sweep + amplitude envelope for "weight" perception
   */
  playImpactCrunch(force: number = 1): void {
    if (!this.ctx || !this.config.enabled) return;

    const now = this.ctx.currentTime;
    const duration = 0.3;

    // Create gain node for volume envelope
    const gainNode = this.ctx.createGain();
    gainNode.connect(this.ctx.destination);
    gainNode.gain.setValueAtTime(0.4 * this.config.sfxVolume * this.config.masterVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Create oscillator for crunch tone (frequency sweep down)
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';

    // Start high, sweep down based on force
    const startFreq = 200 + force * 100;
    const endFreq = 60 + force * 20;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + duration);

    // Add a tiny bit of noise for "crunch" texture
    this.addNoiseLayer(gainNode, now, duration, force);
  }

  /**
   * Cascade Rattle — Falling debris sounds
   * Quick, tumbling, with pitch variation
   */
  playCascadeRattle(pieces: number = 1): void {
    if (!this.ctx || !this.config.enabled) return;

    const now = this.ctx.currentTime;
    const baseDelay = 0.05;

    // Play several quick tones with slight delays
    for (let i = 0; i < Math.min(pieces, 4); i++) {
      const delay = baseDelay + i * 0.08;
      const duration = 0.15;

      const gainNode = this.ctx.createGain();
      gainNode.connect(this.ctx.destination);
      gainNode.gain.setValueAtTime(0.3 * this.config.sfxVolume * this.config.masterVolume, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.02, now + delay + duration);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';

      // Each piece gets a different pitch (descending)
      const freq = 150 - i * 30 + (Math.random() - 0.5) * 20;
      osc.frequency.setValueAtTime(freq, now + delay);

      osc.connect(gainNode);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    }
  }

  /**
   * Restoration Chime — Celebratory, ascending tone
   * Signals success without being jarring
   */
  playRestorationChime(): void {
    if (!this.ctx || !this.config.enabled) return;

    const now = this.ctx.currentTime;
    const duration = 0.6;

    // Create a two-tone ascending chime
    const chimeFreqs = [523.25, 659.25]; // C5, E5 (pleasant major third)

    chimeFreqs.forEach((freq, idx) => {
      const delay = idx * 0.15;

      const gainNode = this.ctx!.createGain();
      gainNode.connect(this.ctx!.destination);
      gainNode.gain.setValueAtTime(0.5 * this.config.sfxVolume * this.config.masterVolume, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + delay + duration);

      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      osc.connect(gainNode);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });
  }

  /**
   * Launch Sound — Brief, punchy feedback for firing
   * Gives confidence that the shot was registered
   */
  playLaunchSound(): void {
    if (!this.ctx || !this.config.enabled) return;

    const now = this.ctx.currentTime;
    const duration = 0.15;

    const gainNode = this.ctx.createGain();
    gainNode.connect(this.ctx.destination);
    gainNode.gain.setValueAtTime(0.2 * this.config.sfxVolume * this.config.masterVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Noise burst for "whoosh"
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start(now);
    source.stop(now + duration);
  }

  /**
   * Helper: Add white noise texture to a sound
   */
  private addNoiseLayer(
    gainNode: GainNode,
    startTime: number,
    duration: number,
    intensity: number = 0.5
  ): void {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * intensity;
    }

    const noiseGain = this.ctx.createGain();
    noiseGain.connect(gainNode);
    noiseGain.gain.setValueAtTime(0.2, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(noiseGain);
    source.start(startTime);
    source.stop(startTime + duration);
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators.clear();
  }
}
