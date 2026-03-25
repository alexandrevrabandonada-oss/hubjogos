'use client';

// Mutirão de Saneamento - Play Page
// T74 — Game wrapped with T72 PlayShell

import { MutiraoGameWrapper } from '@/components/games/MutiraoGame';
import { MUTIRAO_GAME } from '../constants';

export default function MutiraoPlayPage() {
  return <MutiraoGameWrapper game={MUTIRAO_GAME} />;
}
