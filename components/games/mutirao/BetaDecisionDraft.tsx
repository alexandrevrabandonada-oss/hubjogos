'use client';

/**
 * T77: Beta Decision Draft
 * 
 * Generates a draft decision document based on captured evidence.
 */

import React, { useMemo } from 'react';
import { PlaytestSession, AuditProgress } from '@/lib/games/mutirao/playtest-types';
import { getTelemetryAggregate } from '@/lib/games/mutirao/telemetry';
import styles from './PlaytestOpsConsole.module.css';

interface BetaDecisionDraftProps {
  sessions: PlaytestSession[];
  auditProgress: AuditProgress;
}

export function BetaDecisionDraft({ sessions, auditProgress }: BetaDecisionDraftProps) {
  const telemetry = useMemo(() => getTelemetryAggregate(), []);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  // Device/browser coverage
  const deviceCoverage = useMemo(() => 
    Array.from(new Set(sessions.map(s => s.metadata.deviceType))),
    [sessions]
  );
  
  const browserCoverage = useMemo(() => 
    Array.from(new Set(sessions.map(s => s.metadata.browser))),
    [sessions]
  );

  // Calculate recommendation
  const recommendation = useMemo(() => {
    const completionRate = telemetry.completionRate || 0;
    const hasP0 = sessions.some(s => s.notes.some(n => n.type === 'bug' && n.content.includes('P0')));
    const mobileTested = deviceCoverage.some(d => 
      d.includes('iPhone') || d.includes('Android') || d.includes('Mobile')
    );
    const allAuditsComplete = Object.values(auditProgress).every(Boolean);

    if (hasP0 || completionRate < 40 || !mobileTested) {
      return 'REWORK';
    } else if (completionRate < 60 || !allAuditsComplete) {
      return 'HARDENING';
    } else {
      return 'GO';
    }
  }, [telemetry, sessions, deviceCoverage, auditProgress]);

  // Generate markdown content
  const generateMarkdown = () => {
    const date = new Date().toISOString().split('T')[0];
    
    return `# Beta Decision Draft - Mutirão de Saneamento
**Date:** ${date}
**Decision Owner:** [TO BE FILLED]
**Reviewers:** [TO BE FILLED]

## Executive Summary
**RECOMMENDATION:** ${recommendation === 'GO' ? 'GO TO CLOSED BETA' : recommendation === 'HARDENING' ? 'DO ONE MORE HARDENING PASS' : 'REWORK CORE LOOP BEFORE BETA'}

**Rationale:** [TO BE COMPLETED BASED ON DETAILED FINDINGS]

---

## Evidence Summary

### Quantitative Data
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Sample Size | ${sessions.length} | 5-10 | ${sessions.length >= 5 ? '✓' : '✗'} |
| Completion Rate | ${telemetry.completionRate?.toFixed(1) || '0'}% | ≥ 60% | ${telemetry.completionRate >= 60 ? '✓' : telemetry.completionRate >= 40 ? '◐' : '✗'} |
| Avg Turns Reached | ${telemetry.avgTurnsReached?.toFixed(1) || '0'} | 9-12 | ${telemetry.avgTurnsReached >= 9 ? '✓' : telemetry.avgTurnsReached >= 6 ? '◐' : '✗'} |
| Replay Intent | ${telemetry.replayRate?.toFixed(1) || '0'}% | ≥ 30% | ${telemetry.replayRate >= 30 ? '✓' : telemetry.replayRate >= 20 ? '◐' : '✗'} |
| Share Intent | ${telemetry.shareRate?.toFixed(1) || '0'}% | ≥ 10% | ${telemetry.shareRate >= 10 ? '✓' : telemetry.shareRate >= 5 ? '◐' : '✗'} |

### Device Coverage
| Device | Count |
|--------|-------|
${deviceCoverage.map(d => `| ${d} | ${sessions.filter(s => s.metadata.deviceType === d).length} |`).join('\n')}

### Browser Coverage
| Browser | Count |
|---------|-------|
${browserCoverage.map(b => `| ${b} | ${sessions.filter(s => s.metadata.browser === b).length} |`).join('\n')}

### Result Distribution
| Result | Count | % |
|--------|-------|---|
${Object.entries(telemetry.resultDistribution || {}).map(([r, c]) => `| ${r} | ${c} | ${telemetry.totalSessions > 0 ? (c / telemetry.totalSessions * 100).toFixed(1) : 0}% |`).join('\n')}

---

## Audit Status
| Audit | Status |
|-------|--------|
| Comprehension | ${auditProgress.comprehensionCompleted ? '✓ Complete' : '✗ Pending'} |
| Balance | ${auditProgress.balanceCompleted ? '✓ Complete' : '✗ Pending'} |
| Mobile | ${auditProgress.mobileCompleted ? '✓ Complete' : '✗ Pending'} |
| Feedback Clustering | ${auditProgress.feedbackClustered ? '✓ Complete' : '✗ Pending'} |
| Issue Triage | ${auditProgress.issuesTriaged ? '✓ Complete' : '✗ Pending'} |
| Decision Ready | ${auditProgress.decisionReady ? '✓ Complete' : '✗ Pending'} |

---

## Main Friction Points
[TO BE FILLED: List top 3-5 friction points with evidence]

1. [Friction point with % affected]
2. [Friction point with % affected]
3. [Friction point with % affected]

## Issue Severity Breakdown
| Severity | Count | Status |
|----------|-------|--------|
| P0 - Blocks Beta | [TO COUNT] | [Open/Resolved] |
| P1 - Serious | [TO COUNT] | [Open/In Progress] |
| P2 - Polish | [TO COUNT] | [Planned] |
| P3 - Future | [TO COUNT] | [Backlog] |

## Detailed Recommendation

### If GO TO CLOSED BETA
**Beta Parameters:**
- Target Users: [N]
- Duration: [X weeks]
- Known Issues Accepted: [List P1 issues OK to fix during beta]

### If HARDENING PASS
**Required Fixes:**
- [Issue 1] - Owner: [Name] - ETA: [Date]
- [Issue 2] - Owner: [Name] - ETA: [Date]

### If REWORK
**Core Issues:**
- [Issue 1]
- [Issue 2]

**Proposed Changes:**
- [Change 1]
- [Change 2]

**Timeline:** [X weeks]

---

## Final Decision
**DECISION:** ${recommendation === 'GO' ? 'GO TO CLOSED BETA' : recommendation === 'HARDENING' ? 'DO ONE MORE HARDENING PASS' : 'REWORK CORE LOOP'}

**Confidence Level:** ${sessions.length >= 7 ? 'High' : sessions.length >= 5 ? 'Medium' : 'Low'} (${sessions.length} sessions)

**Next Action:** [TO BE FILLED]

**Decision Date:** [TO BE FILLED]

---

*This is a draft based on captured evidence. Final decision requires human review and sign-off.*
`;
  };

  const downloadDraft = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beta-decision-draft-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isReady = auditProgress.decisionReady && sessions.length >= 5;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>🎯 Beta Decision Draft</h2>

      {!isReady && (
        <div className={styles.notReadyBanner}>
          ⚠️ Not ready for decision. Complete audits and record at least 5 sessions.
        </div>
      )}

      {/* Recommendation Preview */}
      <div className={`${styles.recommendationBox} ${styles[recommendation.toLowerCase()]}`}>
        <h3>Recommended Decision</h3>
        <div className={styles.recommendationValue}>
          {recommendation === 'GO' && '🚀 GO TO CLOSED BETA'}
          {recommendation === 'HARDENING' && '🔧 DO ONE MORE HARDENING PASS'}
          {recommendation === 'REWORK' && '♻️ REWORK CORE LOOP'}
        </div>
        <p className={styles.recommendationHint}>
          Based on {sessions.length} sessions, {telemetry.completionRate?.toFixed(1) || 0}% completion rate
        </p>
      </div>

      {/* Quick Stats */}
      <div className={styles.decisionStats}>
        <div className={styles.decisionStat}>
          <span className={styles.statLabel}>Sessions</span>
          <span className={styles.statValue}>{sessions.length}</span>
          <span className={styles.statTarget}>(need 5+)</span>
        </div>
        <div className={styles.decisionStat}>
          <span className={styles.statLabel}>Completion</span>
          <span className={`${styles.statValue} ${telemetry.completionRate >= 60 ? styles.good : telemetry.completionRate >= 40 ? styles.warning : styles.danger}`}>
            {telemetry.completionRate?.toFixed(1) || 0}%
          </span>
          <span className={styles.statTarget}>(target ≥60%)</span>
        </div>
        <div className={styles.decisionStat}>
          <span className={styles.statLabel}>Replay Intent</span>
          <span className={styles.statValue}>{telemetry.replayRate?.toFixed(1) || 0}%</span>
          <span className={styles.statTarget}>(target ≥30%)</span>
        </div>
        <div className={styles.decisionStat}>
          <span className={styles.statLabel}>Mobile Tested</span>
          <span className={styles.statValue}>
            {deviceCoverage.some(d => d.includes('iPhone') || d.includes('Android')) ? '✓' : '✗'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.decisionActions}>
        <button 
          onClick={downloadDraft} 
          className={styles.primaryBtn}
          disabled={sessions.length < 3}
        >
          ⬇ Download Decision Draft (.md)
        </button>
        <p className={styles.downloadHint}>
          {sessions.length < 3 
            ? 'Need at least 3 sessions to generate draft' 
            : 'Draft will have placeholders for human review'}
        </p>
      </div>

      {/* Preview */}
      <div className={styles.previewSection}>
        <h4>Preview</h4>
        <pre className={styles.previewContent}>
          {generateMarkdown().slice(0, 500)}...
        </pre>
      </div>
    </div>
  );
}
