import type { ArcadeRuntimeEvent } from '@/lib/games/arcade/types';
import type { ArcadeAudioController } from './arcade-audio';

export function playTarifaZeroRuntimeSfx(audio: ArcadeAudioController, event: ArcadeRuntimeEvent) {
  if (event.type === 'powerup_collect') {
    audio.play('powerup');
    return;
  }

  if (event.type === 'collision') {
    audio.play(event.severity === 'heavy' ? 'collision-heavy' : 'collision-light');
    return;
  }

  if (event.type === 'phase_transition') {
    audio.play('phase-transition');
    return;
  }

  if (event.type === 'special_event') {
    audio.play('special-event');
  }
}
