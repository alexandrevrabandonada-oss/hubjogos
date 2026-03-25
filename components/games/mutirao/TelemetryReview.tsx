'use client';

/**
 * T76: Telemetry Review Screen
 * 
 * Lightweight debug/review component for playtest analysis.
 * Shows aggregated metrics for internal validation.
 */

import React, { useState, useEffect } from 'react';
import { getTelemetryAggregate, exportTelemetryData, TelemetryAggregate } from '@/lib/games/mutirao/telemetry';
import styles from './TelemetryReview.module.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'danger' | 'neutral';
  target?: string;
}

function MetricCard({ label, value, status, target }: MetricCardProps) {
  return (
    <div className={`${styles.metricCard} ${styles[status]}`}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      {target && <div className={styles.metricTarget}>Target: {target}</div>}
    </div>
  );
}

export function TelemetryReview() {
  const [data, setData] = useState<TelemetryAggregate | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setData(getTelemetryAggregate());
  }, []);

  const handleRefresh = () => {
    setData(getTelemetryAggregate());
  };

  const handleExport = () => {
    const exported = exportTelemetryData();
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mutirao-telemetry-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleClear = () => {
    if (confirm('Clear all telemetry data? This cannot be undone.')) {
      localStorage.removeItem('mutirao_telemetry_sessions');
      localStorage.removeItem('mutirao_telemetry_last_session');
      setData(getTelemetryAggregate());
    }
  };

  if (!data) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Telemetry Review</h2>
        <p className={styles.empty}>Loading...</p>
      </div>
    );
  }

  // Calculate status indicators
  const completionStatus = data.completionRate >= 60 ? 'good' : data.completionRate >= 40 ? 'warning' : 'danger';
  const replayStatus = data.replayRate >= 30 ? 'good' : data.replayRate >= 20 ? 'warning' : 'neutral';
  const shareStatus = data.shareRate >= 10 ? 'good' : data.shareRate >= 5 ? 'warning' : 'neutral';
  const exitStatus = data.exitBeforeCompletionRate <= 30 ? 'good' : data.exitBeforeCompletionRate <= 50 ? 'warning' : 'danger';
  const turnsStatus = data.avgTurnsReached >= 9 ? 'good' : data.avgTurnsReached >= 6 ? 'warning' : 'danger';

  // Calculate result distribution balance
  const resultValues = Object.values(data.resultDistribution);
  const maxResult = Math.max(...resultValues);
  const minResult = Math.min(...resultValues.filter(v => v > 0));
  const resultBalance = maxResult > 0 ? (minResult / maxResult) : 0;
  const balanceStatus = resultBalance >= 0.3 ? 'good' : resultBalance >= 0.15 ? 'warning' : 'danger';

  // Check if energy depletion is too frequent
  const energyStatus = data.energyDepletionFrequency <= 30 ? 'good' : data.energyDepletionFrequency <= 50 ? 'warning' : 'neutral';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>🎮 Mutirão de Saneamento — Telemetry Review</h2>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleRefresh}>↻ Refresh</button>
          <button className={styles.actionBtn} onClick={handleExport}>⬇ Export</button>
          <button className={`${styles.actionBtn} ${styles.danger}`} onClick={handleClear}>🗑 Clear</button>
        </div>
      </header>

      <div className={styles.overview}>
        <div className={styles.statBadge}>
          <span className={styles.statNumber}>{data.totalSessions}</span>
          <span className={styles.statLabel}>Total Sessions</span>
        </div>
        <div className={styles.statBadge}>
          <span className={styles.statNumber}>{data.completedSessions}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statBadge}>
          <span className={styles.statNumber}>{data.replayed}</span>
          <span className={styles.statLabel}>Replayed</span>
        </div>
        <div className={styles.statBadge}>
          <span className={styles.statNumber}>{data.shared}</span>
          <span className={styles.statLabel}>Shared</span>
        </div>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Core Metrics</h3>
        <div className={styles.metricsGrid}>
          <MetricCard 
            label="Completion Rate" 
            value={`${data.completionRate.toFixed(1)}%`}
            status={completionStatus}
            target="≥60%"
          />
          <MetricCard 
            label="Exit Before Completion" 
            value={`${data.exitBeforeCompletionRate.toFixed(1)}%`}
            status={exitStatus}
            target="≤30%"
          />
          <MetricCard 
            label="Avg Turns Reached" 
            value={data.avgTurnsReached.toFixed(1)}
            status={turnsStatus}
            target="≥9"
          />
          <MetricCard 
            label="Replay Rate" 
            value={`${data.replayRate.toFixed(1)}%`}
            status={replayStatus}
            target="≥30%"
          />
          <MetricCard 
            label="Share Rate" 
            value={`${data.shareRate.toFixed(1)}%`}
            status={shareStatus}
            target="≥10%"
          />
          <MetricCard 
            label="Avg Actions/Run" 
            value={data.avgActionsPerRun.toFixed(1)}
            status="neutral"
            target="8-15"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Result Distribution</h3>
        <div className={styles.resultGrid}>
          {Object.entries(data.resultDistribution).map(([result, count]) => {
            const percentage = data.totalSessions > 0 ? (count / data.totalSessions * 100).toFixed(1) : '0';
            const resultNames: Record<string, string> = {
              'cuidado-coletivo-floresceu': '🏆 Triumph',
              'bairro-respirou': '✅ Success',
              'crise-contida': '◆ Neutral',
              'mutirao-insuficiente': '⚡ Struggle',
              'abandono-venceu': '⚠️ Collapse',
            };
            return (
              <div key={result} className={styles.resultBar}>
                <div className={styles.resultLabel}>{resultNames[result] || result}</div>
                <div className={styles.resultBarTrack}>
                  <div 
                    className={styles.resultBarFill} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className={styles.resultValue}>{count} ({percentage}%)</div>
              </div>
            );
          })}
        </div>
        <div className={styles.balanceIndicator}>
          <MetricCard 
            label="Result Balance" 
            value={resultBalance >= 0.3 ? 'Balanced' : resultBalance >= 0.15 ? 'Slightly Skewed' : 'Heavily Skewed'}
            status={balanceStatus}
            target="Balanced"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Action Frequency</h3>
        <div className={styles.actionGrid}>
          {Object.entries(data.actionFrequency).map(([action, count]) => (
            <div key={action} className={styles.actionItem}>
              <span className={styles.actionName}>{action}</span>
              <span className={styles.actionCount}>{count} uses</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Crisis & Difficulty</h3>
        <div className={styles.metricsGrid}>
          <MetricCard 
            label="Health Risk Spikes" 
            value={data.healthRiskSpikes}
            status={data.healthRiskSpikes > data.totalSessions * 0.5 ? 'warning' : 'neutral'}
            target="Varies"
          />
          <MetricCard 
            label="Energy Depletion Freq" 
            value={`${data.energyDepletionFrequency.toFixed(1)}%`}
            status={energyStatus}
            target="≤30%"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Beta Readiness Signals</h3>
        <div className={styles.signals}>
          <div className={`${styles.signal} ${completionStatus === 'good' ? styles.good : completionStatus === 'warning' ? styles.warning : styles.danger}`}>
            <span className={styles.signalIcon}>{completionStatus === 'good' ? '✓' : completionStatus === 'warning' ? '◐' : '✗'}</span>
            <span className={styles.signalText}>
              Completion {completionStatus === 'good' ? 'GOOD' : completionStatus === 'warning' ? 'ACCEPTABLE' : 'LOW'}
            </span>
          </div>
          <div className={`${styles.signal} ${turnsStatus === 'good' ? styles.good : turnsStatus === 'warning' ? styles.warning : styles.danger}`}>
            <span className={styles.signalIcon}>{turnsStatus === 'good' ? '✓' : turnsStatus === 'warning' ? '◐' : '✗'}</span>
            <span className={styles.signalText}>
              Engagement {turnsStatus === 'good' ? 'GOOD' : turnsStatus === 'warning' ? 'ACCEPTABLE' : 'LOW'}
            </span>
          </div>
          <div className={`${styles.signal} ${balanceStatus === 'good' ? styles.good : balanceStatus === 'warning' ? styles.warning : styles.danger}`}>
            <span className={styles.signalIcon}>{balanceStatus === 'good' ? '✓' : balanceStatus === 'warning' ? '◐' : '✗'}</span>
            <span className={styles.signalText}>
              Balance {balanceStatus === 'good' ? 'GOOD' : balanceStatus === 'warning' ? 'ACCEPTABLE' : 'SKEWED'}
            </span>
          </div>
          <div className={`${styles.signal} ${exitStatus === 'good' ? styles.good : exitStatus === 'warning' ? styles.warning : styles.danger}`}>
            <span className={styles.signalIcon}>{exitStatus === 'good' ? '✓' : exitStatus === 'warning' ? '◐' : '✗'}</span>
            <span className={styles.signalText}>
              Retention {exitStatus === 'good' ? 'GOOD' : exitStatus === 'warning' ? 'ACCEPTABLE' : 'HIGH EXIT'}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <button className={styles.toggleBtn} onClick={() => setShowRaw(!showRaw)}>
          {showRaw ? 'Hide' : 'Show'} Raw Data
        </button>
        {showRaw && (
          <pre className={styles.rawData}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

export default TelemetryReview;
