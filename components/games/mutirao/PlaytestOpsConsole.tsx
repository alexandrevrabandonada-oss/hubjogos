'use client';

/**
 * T77: Playtest Ops Console — Main Component
 * 
 * Internal tool for running Mutirão playtest sprints with low friction.
 * Consolidates session management, live observation, and evidence bundling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PlaytestSession, SessionMetadata, OperatorNote, AuditProgress } from '@/lib/games/mutirao/playtest-types';
import { SessionRegistrationForm } from './SessionRegistrationForm';
import { LiveSessionTools } from './LiveSessionTools';
import { ReviewSummary } from './ReviewSummary';
import { AuditTracker } from './AuditTracker';
import { EvidenceExport } from './EvidenceExport';
import { BetaDecisionDraft } from './BetaDecisionDraft';
import styles from './PlaytestOpsConsole.module.css';

type ConsoleTab = 'register' | 'live' | 'review' | 'audits' | 'export' | 'decision';

export function PlaytestOpsConsole() {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('register');
  const [sessions, setSessions] = useState<PlaytestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PlaytestSession | null>(null);
  const [auditProgress, setAuditProgress] = useState<AuditProgress>({
    comprehensionCompleted: false,
    balanceCompleted: false,
    mobileCompleted: false,
    feedbackClustered: false,
    issuesTriaged: false,
    decisionReady: false,
  });

  // Load sessions on mount
  useEffect(() => {
    const stored = localStorage.getItem('mutirao_playtest_sessions');
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        console.error('Failed to parse playtest sessions');
      }
    }

    const auditStored = localStorage.getItem('mutirao_audit_progress');
    if (auditStored) {
      try {
        setAuditProgress(JSON.parse(auditStored));
      } catch {
        console.error('Failed to parse audit progress');
      }
    }
  }, []);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('mutirao_playtest_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Persist audit progress
  useEffect(() => {
    localStorage.setItem('mutirao_audit_progress', JSON.stringify(auditProgress));
  }, [auditProgress]);

  const handleSessionStart = useCallback((metadata: SessionMetadata) => {
    const session: PlaytestSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata,
      startTime: Date.now(),
      notes: [],
      status: 'active',
      telemetrySnapshot: null,
      feedbackSnapshot: null,
    };
    
    setSessions(prev => [...prev, session]);
    setCurrentSession(session);
    setActiveTab('live');
  }, []);

  const handleSessionComplete = useCallback((sessionId: string, notes: OperatorNote[]) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, status: 'completed', endTime: Date.now(), notes }
        : s
    ));
    setCurrentSession(null);
    setActiveTab('review');
  }, []);

  const handleAddNote = useCallback((sessionId: string, note: Omit<OperatorNote, 'id' | 'timestamp'>) => {
    const newNote: OperatorNote = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, notes: [...s.notes, newNote] }
        : s
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
    }
  }, [currentSession]);

  const handleUpdateAuditProgress = useCallback((updates: Partial<AuditProgress>) => {
    setAuditProgress(prev => ({ ...prev, ...updates }));
  }, []);

  const handleResetAll = useCallback(() => {
    if (confirm('Reset ALL playtest data? This cannot be undone.')) {
      localStorage.removeItem('mutirao_playtest_sessions');
      localStorage.removeItem('mutirao_audit_progress');
      localStorage.removeItem('mutirao_telemetry_sessions');
      localStorage.removeItem('mutirao_feedback_v1');
      setSessions([]);
      setAuditProgress({
        comprehensionCompleted: false,
        balanceCompleted: false,
        mobileCompleted: false,
        feedbackClustered: false,
        issuesTriaged: false,
        decisionReady: false,
      });
      setCurrentSession(null);
    }
  }, []);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const activeCount = sessions.filter(s => s.status === 'active').length;

  return (
    <div className={styles.console}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎮 Mutirão Playtest Ops Console</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{completedSessions.length}</strong> completed
          </span>
          <span className={styles.stat}>
            <strong>{activeCount}</strong> active
          </span>
          <span className={styles.stat}>
            <strong>{sessions.length}</strong> total
          </span>
        </div>
        <button className={styles.resetBtn} onClick={handleResetAll}>
          🗑 Reset All
        </button>
      </header>

      <nav className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
          onClick={() => setActiveTab('register')}
        >
          📋 Register Session
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'live' ? styles.active : ''} ${currentSession ? styles.pulse : ''}`}
          onClick={() => setActiveTab('live')}
          disabled={!currentSession}
        >
          🔴 Live Tools {currentSession && '(ACTIVE)'}
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'review' ? styles.active : ''}`}
          onClick={() => setActiveTab('review')}
        >
          📊 Review
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'audits' ? styles.active : ''}`}
          onClick={() => setActiveTab('audits')}
        >
          ✅ Audits
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'export' ? styles.active : ''}`}
          onClick={() => setActiveTab('export')}
        >
          ⬇ Export
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'decision' ? styles.active : ''}`}
          onClick={() => setActiveTab('decision')}
        >
          🎯 Decision
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'register' && (
          <SessionRegistrationForm 
            onSessionStart={handleSessionStart}
            currentCount={sessions.length}
          />
        )}

        {activeTab === 'live' && currentSession && (
          <LiveSessionTools
            session={currentSession}
            onAddNote={handleAddNote}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {activeTab === 'live' && !currentSession && (
          <div className={styles.emptyState}>
            <p>No active session. Start one from the Register tab.</p>
            <button onClick={() => setActiveTab('register')}>
              Go to Register
            </button>
          </div>
        )}

        {activeTab === 'review' && (
          <ReviewSummary sessions={sessions} />
        )}

        {activeTab === 'audits' && (
          <AuditTracker 
            progress={auditProgress}
            onUpdate={handleUpdateAuditProgress}
            sessions={sessions}
          />
        )}

        {activeTab === 'export' && (
          <EvidenceExport sessions={sessions} />
        )}

        {activeTab === 'decision' && (
          <BetaDecisionDraft 
            sessions={sessions}
            auditProgress={auditProgress}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>T77 Playtest Ops Console — Internal Use Only</p>
        <p>Data stored locally only. Export before clearing browser data.</p>
      </footer>
    </div>
  );
}

export default PlaytestOpsConsole;
