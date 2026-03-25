'use client';

/**
 * T77: Review Summary
 * 
 * Compact internal summary showing sprint progress and key metrics.
 */

import React, { useMemo } from 'react';
import { PlaytestSession } from '@/lib/games/mutirao/playtest-types';
import { getTelemetryAggregate } from '@/lib/games/mutirao/telemetry';
import styles from './PlaytestOpsConsole.module.css';

interface ReviewSummaryProps {
  sessions: PlaytestSession[];
}

export function ReviewSummary({ sessions }: ReviewSummaryProps) {
  const telemetry = useMemo(() => getTelemetryAggregate(), []);
  
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const activeSessions = sessions.filter(s => s.status === 'active');
  
  // Device coverage
  const deviceCoverage = useMemo(() => {
    const devices = new Set(sessions.map(s => s.metadata.deviceType));
    return Array.from(devices);
  }, [sessions]);
  
  // Browser coverage
  const browserCoverage = useMemo(() => {
    const browsers = new Set(sessions.map(s => s.metadata.browser));
    return Array.from(browsers);
  }, [sessions]);
  
  // Profile coverage
  const profileCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      counts[s.metadata.profile] = (counts[s.metadata.profile] || 0) + 1;
    });
    return counts;
  }, [sessions]);
  
  // Confusion clusters from notes
  const confusionCount = useMemo(() => {
    return sessions.reduce((sum, s) => 
      sum + s.notes.filter(n => n.type === 'confusion').length, 0
    );
  }, [sessions]);
  
  const bugCount = useMemo(() => {
    return sessions.reduce((sum, s) => 
      sum + s.notes.filter(n => n.type === 'bug').length, 0
    );
  }, [sessions]);
  
  const dropCount = useMemo(() => {
    return sessions.reduce((sum, s) => 
      sum + s.notes.filter(n => n.type === 'drop').length, 0
    );
  }, [sessions]);
  
  const strongMomentCount = useMemo(() => {
    return sessions.reduce((sum, s) => 
      sum + s.notes.filter(n => n.type === 'strong-moment').length, 0
    );
  }, [sessions]);

  // Calculate completion rate from telemetry only
  const telemetryCompletionRate = telemetry.completionRate || 0;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>📊 Sprint Review Summary</h2>
      
      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <div className={styles.overviewNumber}>{sessions.length}</div>
          <div className={styles.overviewLabel}>Total Sessions</div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.overviewNumber}>{completedSessions.length}</div>
          <div className={styles.overviewLabel}>Completed</div>
        </div>
        <div className={styles.overviewCard}>
          <div className={styles.overviewNumber}>{activeSessions.length}</div>
          <div className={styles.overviewLabel}>Active</div>
        </div>
        <div className={styles.overviewCard}>
          <div className={`${styles.overviewNumber} ${telemetryCompletionRate >= 60 ? styles.good : telemetryCompletionRate >= 40 ? styles.warning : styles.danger}`}>
            {telemetryCompletionRate.toFixed(1)}%
          </div>
          <div className={styles.overviewLabel}>Completion Rate</div>
          <div className={styles.overviewTarget}>Target: ≥60%</div>
        </div>
      </div>

      {/* Coverage */}
      <div className={styles.coverageSection}>
        <h3>Coverage</h3>
        
        <div className={styles.coverageGrid}>
          <div className={styles.coverageItem}>
            <h4>Devices ({deviceCoverage.length})</h4>
            <ul>
              {deviceCoverage.map(d => <li key={d}>{d}</li>)}
            </ul>
          </div>
          
          <div className={styles.coverageItem}>
            <h4>Browsers ({browserCoverage.length})</h4>
            <ul>
              {browserCoverage.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
          
          <div className={styles.coverageItem}>
            <h4>Profiles</h4>
            <ul>
              {Object.entries(profileCounts).map(([profile, count]) => (
                <li key={profile}>{profile}: {count}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsSection}>
        <h3>Key Metrics</h3>
        <div className={styles.metricsTable}>
          <div className={styles.metricRow}>
            <span>Avg Turns Reached</span>
            <span className={styles.metricValue}>{telemetry.avgTurnsReached?.toFixed(1) || '0'}</span>
            <span className={styles.metricTarget}>(Target: 9-12)</span>
          </div>
          <div className={styles.metricRow}>
            <span>Replay Intent (Telemetry)</span>
            <span className={styles.metricValue}>{telemetry.replayRate?.toFixed(1) || '0'}%</span>
            <span className={styles.metricTarget}>(Target: ≥30%)</span>
          </div>
          <div className={styles.metricRow}>
            <span>Share Intent (Telemetry)</span>
            <span className={styles.metricValue}>{telemetry.shareRate?.toFixed(1) || '0'}%</span>
            <span className={styles.metricTarget}>(Target: ≥10%)</span>
          </div>
          <div className={styles.metricRow}>
            <span>Exit Before Completion</span>
            <span className={styles.metricValue}>{telemetry.exitBeforeCompletionRate?.toFixed(1) || '0'}%</span>
            <span className={styles.metricTarget}>(Target: ≤30%)</span>
          </div>
        </div>
      </div>

      {/* Result Distribution */}
      {telemetry.totalSessions > 0 && (
        <div className={styles.resultSection}>
          <h3>Result Distribution</h3>
          <div className={styles.resultBars}>
            {Object.entries(telemetry.resultDistribution || {}).map(([result, count]) => {
              const percentage = telemetry.totalSessions > 0 
                ? (count / telemetry.totalSessions * 100).toFixed(1) 
                : '0';
              const resultNames: Record<string, string> = {
                'triumph': '🏆 Triumph',
                'success': '✅ Success',
                'neutral': '◆ Neutral',
                'struggle': '⚡ Struggle',
                'collapse': '⚠️ Collapse',
              };
              return (
                <div key={result} className={styles.resultBarRow}>
                  <span className={styles.resultName}>{resultNames[result] || result}</span>
                  <div className={styles.resultBarTrack}>
                    <div 
                      className={styles.resultBarFill} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.resultPercent}>{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operator Notes Summary */}
      <div className={styles.notesSummary}>
        <h3>Operator Notes Summary</h3>
        <div className={styles.notesGrid}>
          <div className={`${styles.noteStat} ${confusionCount > 0 ? styles.warning : ''}`}>
            <span className={styles.noteStatIcon}>😕</span>
            <span className={styles.noteStatValue}>{confusionCount}</span>
            <span className={styles.noteStatLabel}>Confusion</span>
          </div>
          <div className={`${styles.noteStat} ${bugCount > 0 ? styles.danger : ''}`}>
            <span className={styles.noteStatIcon}>🐛</span>
            <span className={styles.noteStatValue}>{bugCount}</span>
            <span className={styles.noteStatLabel}>Bugs</span>
          </div>
          <div className={`${styles.noteStat} ${dropCount > 0 ? styles.warning : ''}`}>
            <span className={styles.noteStatIcon}>🚪</span>
            <span className={styles.noteStatValue}>{dropCount}</span>
            <span className={styles.noteStatLabel}>Drops</span>
          </div>
          <div className={styles.noteStat}>
            <span className={styles.noteStatIcon}>✨</span>
            <span className={styles.noteStatValue}>{strongMomentCount}</span>
            <span className={styles.noteStatLabel}>Strong Moments</span>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      {sessions.length > 0 && (
        <div className={styles.sessionsTable}>
          <h3>Recent Sessions</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tester</th>
                <th>Profile</th>
                <th>Device</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(-10).reverse().map(session => (
                <tr key={session.id}>
                  <td>{session.metadata.testerNickname}</td>
                  <td>{session.metadata.profile}</td>
                  <td>{session.metadata.deviceType}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[session.status]}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{session.notes.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
