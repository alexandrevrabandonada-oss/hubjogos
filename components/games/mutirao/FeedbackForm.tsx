'use client';

/**
 * T75: Mutirão de Saneamento — Playtest Feedback Form
 * 
 * Simple structured feedback capture for beta testing.
 */

import React, { useState } from 'react';
import { getTelemetryAggregate } from '@/lib/games/mutirao/telemetry';
import styles from './FeedbackForm.module.css';

interface FeedbackFormProps {
  onSubmit: () => void;
  onSkip: () => void;
}

export function FeedbackForm({ onSubmit, onSkip }: FeedbackFormProps) {
  const [confusing, setConfusing] = useState('');
  const [strongPoint, setStrongPoint] = useState('');
  const [understoodOutcome, setUnderstoodOutcome] = useState<boolean | null>(null);
  const [territoryAlive, setTerritoryAlive] = useState<boolean | null>(null);
  const [wouldReplay, setWouldReplay] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Get telemetry data to correlate with feedback
    const telemetry = getTelemetryAggregate();
    
    // Store feedback with telemetry correlation
    const feedbackData = {
      timestamp: Date.now(),
      confusing,
      strongPoint,
      understoodOutcome,
      territoryAlive,
      wouldReplay,
      telemetrySnapshot: telemetry,
    };
    
    // Store in localStorage for analysis
    const existing = JSON.parse(localStorage.getItem('mutirao_feedback_v1') || '[]');
    existing.push(feedbackData);
    localStorage.setItem('mutirao_feedback_v1', JSON.stringify(existing.slice(-50)));
    
    setSubmitted(true);
    setTimeout(onSubmit, 1000);
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.successIcon}>✓</span>
          <p>Obrigado pelo feedback!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ajude a melhorar o jogo</h2>
      <p className={styles.subtitle}>3 minutos para feedback valioso</p>

      <div className={styles.form}>
        {/* What was confusing? */}
        <div className={styles.field}>
          <label className={styles.label}>
            O que foi mais confuso?
          </label>
          <textarea
            className={styles.textarea}
            value={confusing}
            onChange={(e) => setConfusing(e.target.value)}
            placeholder="Ex: Não entendi quando usar cada ação..."
            rows={2}
          />
        </div>

        {/* What felt strong? */}
        <div className={styles.field}>
          <label className={styles.label}>
            O que funcionou bem?
          </label>
          <textarea
            className={styles.textarea}
            value={strongPoint}
            onChange={(e) => setStrongPoint(e.target.value)}
            placeholder="Ex: Senti que minhas escolhas importavam..."
            rows={2}
          />
        </div>

        {/* Did you understand why you won/lost? */}
        <div className={styles.field}>
          <label className={styles.label}>
            Entendeu por que ganhou/perdeu?
          </label>
          <div className={styles.options}>
            <button
              className={`${styles.option} ${understoodOutcome === true ? styles.selected : ''}`}
              onClick={() => setUnderstoodOutcome(true)}
            >
              Sim, ficou claro
            </button>
            <button
              className={`${styles.option} ${understoodOutcome === false ? styles.selected : ''}`}
              onClick={() => setUnderstoodOutcome(false)}
            >
              Não, foi confuso
            </button>
          </div>
        </div>

        {/* Did the territory feel alive? */}
        <div className={styles.field}>
          <label className={styles.label}>
            O bairro pareceu um lugar real?
          </label>
          <div className={styles.options}>
            <button
              className={`${styles.option} ${territoryAlive === true ? styles.selected : ''}`}
              onClick={() => setTerritoryAlive(true)}
            >
              Sim, senti a comunidade
            </button>
            <button
              className={`${styles.option} ${territoryAlive === false ? styles.selected : ''}`}
              onClick={() => setTerritoryAlive(false)}
            >
              Não, pareceu genérico
            </button>
          </div>
        </div>

        {/* Would you replay? */}
        <div className={styles.field}>
          <label className={styles.label}>
            Jogaria novamente ou compartilharia?
          </label>
          <div className={styles.options}>
            <button
              className={`${styles.option} ${wouldReplay === true ? styles.selected : ''}`}
              onClick={() => setWouldReplay(true)}
            >
              Sim
            </button>
            <button
              className={`${styles.option} ${wouldReplay === false ? styles.selected : ''}`}
              onClick={() => setWouldReplay(false)}
            >
              Provavelmente não
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={understoodOutcome === null || territoryAlive === null || wouldReplay === null}
          >
            Enviar Feedback
          </button>
          <button className={styles.skipButton} onClick={onSkip}>
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackForm;
