'use client';

// Game Production Tracker Component
// T73 — Vertical Slice Checklist UI

import React from 'react';
import styles from './ProductionTracker.module.css';
import {
  useVerticalSliceTracker,
  INITIAL_CHECKLIST,
  VERTICAL_SLICE_REQUIREMENTS,
} from '@/lib/production/hooks';
import { GameProductionBlueprint } from '@/lib/production/types';

// --- Vertical Slice Tracker Component ---

interface VerticalSliceTrackerProps {
  blueprint: GameProductionBlueprint;
  initialChecklist?: Partial<typeof INITIAL_CHECKLIST>;
  onComplete?: () => void;
}

export function VerticalSliceTracker({
  blueprint,
  initialChecklist,
  onComplete,
}: VerticalSliceTrackerProps) {
  const { checklist, updateCheck, progress, isComplete, missingRequirements } =
    useVerticalSliceTracker(initialChecklist);

  // Notify when complete
  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const sections = [
    {
      title: 'Core Gameplay',
      items: ['coreLoopPlayable', 'coreLoopFun', 'designClarityAchieved', 'controlsStable', 'pacingAcceptable'],
    },
    {
      title: 'Art & Sound',
      items: ['artDirectionBaseline', 'visualIdentityClear', 'territorialFeelPresent', 'soundBaseline', 'audioAppropriate'],
    },
    {
      title: 'Hub Integration',
      items: ['runtimeIntegrationComplete', 'entryPageComplete', 'resultLayerComplete', 'progressionIntegrationComplete'],
    },
    {
      title: 'Quality & Release',
      items: ['mobileViable', 'desktopViable', 'basicQAPass', 'performanceAcceptable', 'shareFlowUsable'],
    },
    {
      title: 'Political Framing',
      items: ['framingPresent', 'noIdentityDrift'],
    },
    {
      title: 'Stability',
      items: ['noMajorUIBreaks'],
    },
  ];

  const getItemLabel = (key: string): string => {
    const labels: Record<string, string> = {
      coreLoopPlayable: 'Core Loop Playable',
      coreLoopFun: 'Core Loop Fun',
      designClarityAchieved: 'Design Clarity Achieved',
      controlsStable: 'Controls Stable',
      pacingAcceptable: 'Pacing Acceptable',
      artDirectionBaseline: 'Art Direction Baseline',
      visualIdentityClear: 'Visual Identity Clear',
      territorialFeelPresent: 'Territorial Feel Present',
      soundBaseline: 'Sound Baseline',
      audioAppropriate: 'Audio Appropriate',
      runtimeIntegrationComplete: 'Runtime Integration Complete',
      entryPageComplete: 'Entry Page Complete',
      resultLayerComplete: 'Result Layer Complete',
      progressionIntegrationComplete: 'Progression Integration Complete',
      mobileViable: 'Mobile Viable',
      desktopViable: 'Desktop Viable',
      basicQAPass: 'Basic QA Pass',
      performanceAcceptable: 'Performance Acceptable',
      shareFlowUsable: 'Share Flow Usable',
      framingPresent: 'Political Framing Present',
      noIdentityDrift: 'No Identity Drift',
      noMajorUIBreaks: 'No Major UI Breaks',
    };
    return labels[key] || key;
  };

  return (
    <div className={styles.tracker}>
      <header className={styles.header}>
        <h2 className={styles.title}>Vertical Slice Checklist</h2>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <span className={styles.progressText}>{progress}%</span>
        </div>
      </header>

      {isComplete ? (
        <div className={styles.completeBadge}>
          ✅ Vertical Slice Complete
        </div>
      ) : (
        <div className={styles.missingAlert}>
          ⚠️ {missingRequirements.length} required items pending
        </div>
      )}

      <div className={styles.sections}>
        {sections.map(section => (
          <section key={section.title} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <ul className={styles.checklist}>
              {section.items.map(item => {
                const isRequired = VERTICAL_SLICE_REQUIREMENTS.includes(item as any);
                const isChecked = checklist[item as keyof typeof checklist];
                
                return (
                  <li
                    key={item}
                    className={`${styles.checkItem} ${isChecked ? styles.checked : ''} ${isRequired ? styles.required : ''}`}
                  >
                    <label className={styles.label}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => updateCheck(item as any, e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.itemLabel}>{getItemLabel(item)}</span>
                      {isRequired && <span className={styles.requiredBadge}>Obrigatório</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <footer className={styles.footer}>
        <p className={styles.blueprintInfo}>
          <strong>{blueprint.title}</strong> — {blueprint.genre} — Track {blueprint.complexity === 'low' ? 'A' : blueprint.complexity === 'medium' ? 'B' : 'C'}
        </p>
      </footer>
    </div>
  );
}

// --- Production Status Badge ---

interface ProductionStatusBadgeProps {
  status: GameProductionBlueprint['status'];
}

export function ProductionStatusBadge({ status }: ProductionStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    concept: { label: 'Concept', className: styles.statusConcept },
    pre_production: { label: 'Pre-Production', className: styles.statusPreProduction },
    prototype: { label: 'Prototype', className: styles.statusPrototype },
    vertical_slice: { label: 'Vertical Slice', className: styles.statusVerticalSlice },
    beta: { label: 'Beta', className: styles.statusBeta },
    release_candidate: { label: 'Release Candidate', className: styles.statusRC },
    live: { label: 'Live', className: styles.statusLive },
    maintenance: { label: 'Maintenance', className: styles.statusMaintenance },
  };

  const config = statusConfig[status] || statusConfig.concept;

  return <span className={`${styles.statusBadge} ${config.className}`}>{config.label}</span>;
}

// --- Priority Score Card ---

interface PriorityScoreCardProps {
  blueprint: GameProductionBlueprint;
  score: number;
  rank: number;
  track: 'A_quick' | 'B_systems' | 'C_premium';
  recommendation: string;
}

export function PriorityScoreCard({
  blueprint,
  score,
  rank,
  track,
  recommendation,
}: PriorityScoreCardProps) {
  const recommendationLabels: Record<string, string> = {
    build_now: 'Construir Agora',
    build_soon: 'Construir Em Breve',
    build_later: 'Construir Depois',
    hold: 'Aguardar',
  };

  const trackLabels: Record<string, string> = {
    A_quick: 'A — Rápido',
    B_systems: 'B — Sistemas',
    C_premium: 'C — Premium',
  };

  return (
    <div className={`${styles.scoreCard} ${styles[recommendation]}`}>
      <div className={styles.rank}>#{rank}</div>
      <div className={styles.scoreInfo}>
        <h3 className={styles.scoreTitle}>{blueprint.title}</h3>
        <p className={styles.scorePremise}>{blueprint.oneLinerPremise}</p>
        <div className={styles.scoreMeta}>
          <span className={styles.trackBadge}>{trackLabels[track]}</span>
          <ProductionStatusBadge status={blueprint.status} />
        </div>
      </div>
      <div className={styles.scoreValue}>
        <span className={styles.scoreNumber}>{score}</span>
        <span className={styles.recommendation}>{recommendationLabels[recommendation]}</span>
      </div>
    </div>
  );
}
