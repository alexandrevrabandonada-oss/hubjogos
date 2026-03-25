'use client';

/**
 * T77: Evidence Export
 * 
 * Export structured evidence pack for the playtest sprint.
 */

import React, { useCallback } from 'react';
import { PlaytestSession } from '@/lib/games/mutirao/playtest-types';
import { getTelemetryAggregate } from '@/lib/games/mutirao/telemetry';
import styles from './PlaytestOpsConsole.module.css';

interface EvidenceExportProps {
  sessions: PlaytestSession[];
}

export function EvidenceExport({ sessions }: EvidenceExportProps) {
  const telemetry = getTelemetryAggregate();

  const exportJSON = useCallback((filename: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportCSV = useCallback((filename: string, rows: string[][]) => {
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportSessions = useCallback(() => {
    exportJSON(`mutirao-sessions-${new Date().toISOString().split('T')[0]}.json`, sessions);
  }, [sessions, exportJSON]);

  const exportNotes = useCallback(() => {
    const allNotes = sessions.flatMap(s => 
      s.notes.map(n => ({
        sessionId: s.id,
        tester: s.metadata.testerNickname,
        ...n,
      }))
    );
    exportJSON(`mutirao-notes-${new Date().toISOString().split('T')[0]}.json`, allNotes);
  }, [sessions, exportJSON]);

  const exportSummary = useCallback(() => {
    const summary = {
      exportedAt: new Date().toISOString(),
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      deviceCoverage: Array.from(new Set(sessions.map(s => s.metadata.deviceType))),
      browserCoverage: Array.from(new Set(sessions.map(s => s.metadata.browser))),
      profileCoverage: Array.from(new Set(sessions.map(s => s.metadata.profile))),
      telemetry,
    };
    exportJSON(`mutirao-summary-${new Date().toISOString().split('T')[0]}.json`, summary);
  }, [sessions, telemetry, exportJSON]);

  const exportCSVSummary = useCallback(() => {
    const rows = [
      ['Tester', 'Profile', 'Device', 'Browser', 'Status', 'Notes Count', 'Duration (min)'],
      ...sessions.map(s => [
        s.metadata.testerNickname,
        s.metadata.profile,
        s.metadata.deviceType,
        s.metadata.browser,
        s.status,
        s.notes.length.toString(),
        s.endTime ? Math.round((s.endTime - s.startTime) / 60000).toString() : 'N/A',
      ]),
    ];
    exportCSV(`mutirao-sessions-${new Date().toISOString().split('T')[0]}.csv`, rows);
  }, [sessions, exportCSV]);

  const exportFullPack = useCallback(() => {
    const pack = {
      exportedAt: new Date().toISOString(),
      sessions,
      telemetry,
      summary: {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        deviceCoverage: Array.from(new Set(sessions.map(s => s.metadata.deviceType))),
        browserCoverage: Array.from(new Set(sessions.map(s => s.metadata.browser))),
        profileCoverage: Array.from(new Set(sessions.map(s => s.metadata.profile))),
      },
    };
    exportJSON(`mutirao-evidence-pack-${new Date().toISOString().split('T')[0]}.json`, pack);
  }, [sessions, telemetry, exportJSON]);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>⬇ Export Evidence</h2>

      <div className={styles.exportGrid}>
        <div className={styles.exportCard}>
          <h4>📦 Full Evidence Pack</h4>
          <p>Complete bundle with sessions, notes, and telemetry</p>
          <button onClick={exportFullPack} className={styles.exportBtn}>
            Download Pack (.json)
          </button>
        </div>

        <div className={styles.exportCard}>
          <h4>📋 Sessions</h4>
          <p>All session metadata and operator notes</p>
          <button onClick={exportSessions} className={styles.exportBtn}>
            Download Sessions (.json)
          </button>
        </div>

        <div className={styles.exportCard}>
          <h4>📝 Operator Notes</h4>
          <p>All notes across sessions with session refs</p>
          <button onClick={exportNotes} className={styles.exportBtn}>
            Download Notes (.json)
          </button>
        </div>

        <div className={styles.exportCard}>
          <h4>📊 Summary Report</h4>
          <p>Aggregated metrics and coverage overview</p>
          <button onClick={exportSummary} className={styles.exportBtn}>
            Download Summary (.json)
          </button>
        </div>

        <div className={styles.exportCard}>
          <h4>📈 CSV Export</h4>
          <p>Sessions table for spreadsheet analysis</p>
          <button onClick={exportCSVSummary} className={styles.exportBtn}>
            Download CSV
          </button>
        </div>
      </div>

      {/* Manual Export Instructions */}
      <div className={styles.manualExport}>
        <h4>Manual Export (Fallback)</h4>
        <p>If automated export fails, manually copy from DevTools Console:</p>
        <pre className={styles.codeBlock}>
{`// Copy sessions
JSON.parse(localStorage.getItem('mutirao_playtest_sessions'))

// Copy telemetry  
JSON.parse(localStorage.getItem('mutirao_telemetry_sessions'))

// Copy feedback
JSON.parse(localStorage.getItem('mutirao_feedback_v1'))`}
        </pre>
      </div>

      {/* Storage Warning */}
      <div className={styles.storageWarning}>
        <strong>⚠️ Important:</strong> Data is stored in browser localStorage only.
        Export before clearing browser data or closing this tab!
      </div>
    </div>
  );
}
