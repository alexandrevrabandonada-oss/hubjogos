/**
 * T75: Mutirão de Saneamento — Audio Baseline
 * 
 * Lightweight Web Audio API implementation.
 * 5 essential sounds: click, confirm, alert, result, mute toggle.
 */

// --- Audio Context ---

let audioContext: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// --- Sound Synthesis ---

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3): void {
  if (isMuted) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playTwoTone(freq1: number, freq2: number, duration: number, volume = 0.3): void {
  if (isMuted) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // First tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
  gain1.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + duration);
  
  // Second tone (slight delay)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.frequency.setValueAtTime(freq2, ctx.currentTime + 0.05);
  gain2.gain.setValueAtTime(volume, ctx.currentTime + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.05);
  osc2.stop(ctx.currentTime + duration);
}

// --- Public API ---

export function initAudio(): void {
  // Initialize audio context on first user interaction
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function playUIClick(): void {
  // Short, crisp click - 800Hz, 0.08s
  playTone(800, 0.08, 'sine', 0.2);
}

export function playActionConfirm(): void {
  // Pleasant confirmation - ascending two-tone
  playTwoTone(440, 554, 0.25, 0.3); // A4 to C#5
}

export function playAlert(): void {
  // Warning sound - 400Hz, longer, slightly harsh
  playTone(400, 0.5, 'sawtooth', 0.25);
}

export function playCrisisAlert(): void {
  // Urgent - rapid oscillation
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  
  // Three quick beeps
  [0, 0.15, 0.3].forEach((delay, i) => {
    setTimeout(() => {
      playTone(520 - i * 30, 0.15, 'square', 0.3);
    }, delay * 1000);
  });
}

export function playResultTransition(severity: 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse'): void {
  if (isMuted) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  switch (severity) {
    case 'triumph':
    case 'success':
      // Victory fanfare - ascending major triad
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.4, 'sine', 0.35), i * 120);
      });
      break;
      
    case 'neutral':
      // Neutral resolution - single sustained tone
      playTone(440, 0.8, 'sine', 0.3);
      break;
      
    case 'struggle':
    case 'collapse':
      // Defeat - descending, somber
      [440, 392, 349, 330].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.5, 'sine', 0.25), i * 150);
      });
      break;
  }
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  
  if (!isMuted) {
    // Feedback that sound is now on
    setTimeout(() => playTone(600, 0.1, 'sine', 0.2), 50);
  }
  
  return isMuted;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

// --- React Hook ---

import { useEffect, useCallback } from 'react';

export function useMutiraoAudio() {
  useEffect(() => {
    // Initialize audio on mount (will be suspended until user interaction)
    initAudio();
  }, []);
  
  return {
    playUIClick: useCallback(playUIClick, []),
    playActionConfirm: useCallback(playActionConfirm, []),
    playAlert: useCallback(playAlert, []),
    playCrisisAlert: useCallback(playCrisisAlert, []),
    playResultTransition: useCallback(playResultTransition, []),
    toggleMute: useCallback(toggleMute, []),
    isMuted: isAudioMuted(),
  };
}
