'use client';

/**
 * T77: Audit Tracker
 * 
 * Shows progress across T76 audit layers and what's still needed.
 */

import React from 'react';
import { AuditProgress, PlaytestSession } from '@/lib/games/mutirao/playtest-types';
import styles from './PlaytestOpsConsole.module.css';

interface AuditTrackerProps {
  progress: AuditProgress;
  onUpdate: (updates: Partial<AuditProgress>) => void;
  sessions: PlaytestSession[];
}

interface AuditItem {
  key: keyof AuditProgress;
  label: string;
  description: string;
  minSessions: number;
}

const AUDIT_ITEMS: AuditItem[] = [
  {
    key: 'comprehensionCompleted',
    label: 'Comprehension Audit',
    description: 'Verify players understand objectives, resources, outcomes',
    minSessions: 3,
  },
  {
    key: 'balanceCompleted',
    label: 'Balance Audit',
    description: 'Check strategy diversity, obra gate, dengue fairness',
    minSessions: 5,
  },
  {
    key: 'mobileCompleted',
    label: 'Mobile Reality Audit',
    description: 'Test on real devices, touch comfort, performance',
    minSessions: 2,
  },
  {
    key: 'feedbackClustered',
    label: 'Feedback Clustering',
    description: 'Categorize qualitative feedback into themes',
    minSessions: 3,
  },
  {
    key: 'issuesTriaged',
    label: 'Issue Triage',
    description: 'Classify all issues as P0/P1/P2/P3',
    minSessions: 3,
  },
  {
    key: 'decisionReady',
    label: 'Beta Decision Ready',
    description: 'All audits complete, decision documented',
    minSessions: 5,
  },
];

export function AuditTracker({ progress, onUpdate, sessions }: AuditTrackerProps) {
  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalCount = AUDIT_ITEMS.length;
  const percentComplete = (completedCount / totalCount) * 100;

  const canComplete = (item: AuditItem) => {
    return sessions.length >= item.minSessions;
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>✅ Audit Progress</h2>
      
      {/* Overall Progress */}
      <div className={styles.overallProgress}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <div className={styles.progressText}>
          {completedCount} of {totalCount} audits complete ({percentComplete.toFixed(0)}%)
        </div>
      </div>

      {/* Sessions Status */}
      <div className={styles.sessionsStatus}>
        <strong>{sessions.length}</strong> sessions recorded
        {sessions.length < 5 && (
          <span className={styles.warning}>
            {' '}(need at least 5 for full decision)
          </span>
        )}
      </div>

      {/* Audit Checklist */}
      <div className={styles.auditList}>
        {AUDIT_ITEMS.map(item => {
          const isComplete = progress[item.key];
          const hasEnoughSessions = canComplete(item);
          
          return (
            <div 
              key={item.key} 
              className={`${styles.auditItem} ${isComplete ? styles.complete : ''} ${!hasEnoughSessions ? styles.disabled : ''}`}
            >
              <div className={styles.auditHeader}>
                <input
                  type="checkbox"
                  checked={isComplete}
                  onChange={() => hasEnoughSessions && onUpdate({ [item.key]: !isComplete })}
                  disabled={!hasEnoughSessions}
                  className={styles.auditCheckbox}
                />
                <span className={styles.auditLabel}>{item.label}</span>
                {isComplete && <span className={styles.completeBadge}>✓</span>}
              </div>
              <p className={styles.auditDescription}>{item.description}</p>
              <span className={styles.auditRequirement}>
                Requires {item.minSessions}+ sessions
              </span>
            </div>
          );
        })}
      </div>

      {/* Blockers */}
      {!progress.decisionReady && (
        <div className={styles.blockers}>
          <h4>🚧 Before Decision Can Be Made:</h4>
          <ul>
            {sessions.length < 5 && (
              <li>Need {5 - sessions.length} more sessions (min 5)</li>
            )}
            {!progress.comprehensionCompleted && (
              <li>Complete comprehension audit</li>
            )}
            {!progress.balanceCompleted && (
              <li>Complete balance audit</li>
            )}
            {!progress.mobileCompleted && (
              <li>Complete mobile audit</li>
            )}
            {!progress.issuesTriaged && (
              <li>Triage all issues</li>
            )}
          </ul>
        </div>
      )}

      {/* Ready Indicator */}
      {progress.decisionReady && sessions.length >= 5 && (
        <div className={styles.readyBanner}>
          ✅ <strong>Ready for Beta Decision!</strong> Go to the Decision tab.
        </div>
      )}
    </div>
  );
}
