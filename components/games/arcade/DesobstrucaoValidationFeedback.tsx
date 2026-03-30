'use client';

/**
 * T117A Post-session micro-feedback overlay.
 * Fires once after the two-phase CLEARED state.
 * Collects satisfaction rating + qualitative cluster chips + optional open note.
 * Results flow into the existing analytics pipeline via desobstrucao_feedback event.
 */

import React, { useState } from 'react';
import styles from './DesobstrucaoValidationFeedback.module.css';
import { trackDesobstrucaoFeedback } from '@/lib/analytics/track';

const CLUSTERS = [
  { id: 'primer_helped',         label: 'Primer helped' },
  { id: 'still_confused_mobile', label: 'Still confused on mobile' },
  { id: 'steel_distinct',        label: 'Steel felt distinct' },
  { id: 'steel_repetitive',      label: 'Steel felt repetitive' },
  { id: 'felt_deeper',           label: 'Felt deeper' },
  { id: 'felt_too_long',         label: 'Felt too long' },
  { id: 'impact_punchy',         label: 'Impact still punchy' },
  { id: 'second_phase_weak',     label: 'Second phase weakened it' },
] as const;

type ClusterId = (typeof CLUSTERS)[number]['id'];

interface Props {
  isTouchDevice: boolean;
  onDismiss: () => void;
}

export const DesobstrucaoValidationFeedback: React.FC<Props> = ({ isTouchDevice, onDismiss }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState<Set<ClusterId>>(new Set());
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleCluster = (id: ClusterId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitted(true);
    try {
      await trackDesobstrucaoFeedback({
        satisfactionRating: rating,
        clusters: Array.from(selected),
        openNote: note.trim(),
        isTouchDevice,
      });
    } catch {
      // Analytics failure should never block the user
    }
    onDismiss();
  };

  if (submitted) return null;

  const displayRating = hovered || rating;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.title}>Quick feedback</p>
        <p className={styles.subtitle}>30 seconds — helps us decide what comes next</p>

        {/* Star rating */}
        <div className={styles.starsRow} onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={`${styles.star} ${displayRating >= n ? styles.starActive : ''}`}
              onMouseEnter={() => setHovered(n)}
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Cluster chips */}
        <p className={styles.sectionLabel}>What felt true?</p>
        <div className={styles.clusters}>
          {CLUSTERS.map(({ id, label }) => (
            <button
              key={id}
              className={`${styles.chip} ${selected.has(id) ? styles.chipSelected : ''}`}
              onClick={() => toggleCluster(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Optional open note */}
        <textarea
          className={styles.noteInput}
          rows={2}
          maxLength={280}
          placeholder="Anything else? (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div className={styles.actions}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Send feedback
          </button>
          <button className={styles.skipButton} onClick={onDismiss}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesobstrucaoValidationFeedback;
