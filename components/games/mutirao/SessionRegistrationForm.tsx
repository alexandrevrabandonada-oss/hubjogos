'use client';

/**
 * T77: Session Registration Form
 * 
 * Quick form for registering a new playtest session with metadata.
 */

import React, { useState, useCallback } from 'react';
import { SessionMetadata, TesterProfile, SessionType } from '@/lib/games/mutirao/playtest-types';
import styles from './PlaytestOpsConsole.module.css';

interface SessionRegistrationFormProps {
  onSessionStart: (metadata: SessionMetadata) => void;
  currentCount: number;
}

const TESTER_PROFILES: { value: TesterProfile; label: string }[] = [
  { value: 'team', label: 'Team (Internal)' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'non-gamer', label: 'Non-Gamer / Casual' },
  { value: 'mobile-first', label: 'Mobile-First User' },
  { value: 'desktop-first', label: 'Desktop-First User' },
  { value: 'political-proximity', label: 'Political Proximity' },
];

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'observed', label: 'Observed (Operator watching)' },
  { value: 'self-guided', label: 'Self-Guided' },
  { value: 'think-aloud', label: 'Think-Aloud (Full verbalization)' },
];

const COMMON_DEVICES = [
  'Moto G Power (Android)',
  'Samsung A14 (Android)',
  'iPhone SE',
  'iPhone 11',
  'iPhone 14',
  'Pixel 7',
  'Windows Laptop',
  'MacBook',
  'iPad',
  'Other',
];

const COMMON_BROWSERS = [
  'Chrome Mobile',
  'Safari iOS',
  'Samsung Internet',
  'Chrome Desktop',
  'Safari Desktop',
  'Firefox',
  'Edge',
  'Other',
];

export function SessionRegistrationForm({ onSessionStart, currentCount }: SessionRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<SessionMetadata>>({
    testerId: `tester_${currentCount + 1}`,
    testerNickname: '',
    profile: 'non-gamer',
    deviceType: '',
    browser: '',
    screenSize: '',
    sessionType: 'self-guided',
    operatorName: '',
    notes: '',
  });

  const [resetState, setResetState] = useState({
    telemetry: false,
    feedback: false,
    progression: false,
  });

  const handleChange = useCallback(<K extends keyof SessionMetadata>(
    field: K,
    value: SessionMetadata[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback((type: 'telemetry' | 'feedback' | 'progression') => {
    switch (type) {
      case 'telemetry':
        localStorage.removeItem('mutirao_telemetry_sessions');
        localStorage.removeItem('mutirao_telemetry_last_session');
        break;
      case 'feedback':
        localStorage.removeItem('mutirao_feedback_v1');
        break;
      case 'progression':
        localStorage.removeItem('mutirao_game_state');
        localStorage.removeItem('hub_progression');
        break;
    }
    setResetState(prev => ({ ...prev, [type]: true }));
    setTimeout(() => setResetState(prev => ({ ...prev, [type]: false })), 2000);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.testerNickname || !formData.deviceType || !formData.browser) {
      alert('Please fill in required fields: Nickname, Device, Browser');
      return;
    }

    const metadata: SessionMetadata = {
      testerId: formData.testerId || `tester_${Date.now()}`,
      testerNickname: formData.testerNickname,
      profile: formData.profile || 'non-gamer',
      deviceType: formData.deviceType,
      browser: formData.browser,
      screenSize: formData.screenSize || 'unknown',
      sessionType: formData.sessionType || 'self-guided',
      operatorName: formData.operatorName || 'self',
      notes: formData.notes || '',
    };

    onSessionStart(metadata);
  }, [formData, onSessionStart]);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>📋 Register New Session</h2>

      {/* Reset Tools */}
      <div className={styles.resetTools}>
        <h3>🧹 Pre-Session Reset</h3>
        <p className={styles.hint}>Clear state before starting a clean session:</p>
        <div className={styles.resetButtons}>
          <button 
            className={`${styles.resetActionBtn} ${resetState.telemetry ? styles.success : ''}`}
            onClick={() => handleReset('telemetry')}
          >
            {resetState.telemetry ? '✓ Cleared' : '📊 Clear Telemetry'}
          </button>
          <button 
            className={`${styles.resetActionBtn} ${resetState.feedback ? styles.success : ''}`}
            onClick={() => handleReset('feedback')}
          >
            {resetState.feedback ? '✓ Cleared' : '📝 Clear Feedback'}
          </button>
          <button 
            className={`${styles.resetActionBtn} ${resetState.progression ? styles.success : ''}`}
            onClick={() => handleReset('progression')}
          >
            {resetState.progression ? '✓ Cleared' : '🎮 Clear Game State'}
          </button>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="testerNickname">Tester Nickname *</label>
            <input
              id="testerNickname"
              type="text"
              value={formData.testerNickname}
              onChange={e => handleChange('testerNickname', e.target.value)}
              placeholder="e.g., João, Maria, Tester-01"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profile">Profile *</label>
            <select
              id="profile"
              value={formData.profile}
              onChange={e => handleChange('profile', e.target.value as TesterProfile)}
              required
            >
              {TESTER_PROFILES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deviceType">Device *</label>
            <select
              id="deviceType"
              value={formData.deviceType}
              onChange={e => handleChange('deviceType', e.target.value)}
              required
            >
              <option value="">Select device...</option>
              {COMMON_DEVICES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="browser">Browser *</label>
            <select
              id="browser"
              value={formData.browser}
              onChange={e => handleChange('browser', e.target.value)}
              required
            >
              <option value="">Select browser...</option>
              {COMMON_BROWSERS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="screenSize">Screen Size</label>
            <input
              id="screenSize"
              type="text"
              value={formData.screenSize}
              onChange={e => handleChange('screenSize', e.target.value)}
              placeholder="e.g., 375x667, 1920x1080"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sessionType">Session Type *</label>
            <select
              id="sessionType"
              value={formData.sessionType}
              onChange={e => handleChange('sessionType', e.target.value as SessionType)}
              required
            >
              {SESSION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="operatorName">Operator Name</label>
            <input
              id="operatorName"
              type="text"
              value={formData.operatorName}
              onChange={e => handleChange('operatorName', e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="testerId">Tester ID (auto)</label>
            <input
              id="testerId"
              type="text"
              value={formData.testerId}
              readOnly
              className={styles.readonly}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Pre-Session Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Any context about this tester, device issues, etc."
            rows={3}
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryBtn}>
            🚀 Start Session
          </button>
        </div>
      </form>
    </div>
  );
}
