'use client';

import React from 'react';
import { ShellContainer } from '@/components/ui/ShellContainer';
import styles from './EditorialMasthead.module.css';
import { CTAButton } from '@/components/ui/CTAButton';

interface EditorialMastheadProps {
  title: string;
  description: string;
  eyebrow?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  stats?: { label: string; value: string }[];
}

export function EditorialMasthead({
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryAction,
  stats
}: EditorialMastheadProps) {
  return (
    <section className={styles.masthead}>
      <ShellContainer>
        <div className={styles.grid}>
          <div className={styles.content}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
            
            <div className={styles.actions}>
              {primaryAction && (
                <CTAButton href={primaryAction.href} variant="primary">
                  {primaryAction.label}
                </CTAButton>
              )}
              {secondaryAction && (
                <CTAButton href={secondaryAction.href} variant="secondary">
                  {secondaryAction.label}
                </CTAButton>
              )}
            </div>

            {stats && stats.length > 0 && (
              <div className={styles.badgeGroup}>
                {stats.map((stat, i) => (
                  <div key={i} className={styles.stat}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.visualSide}>
            <div className={styles.glow} />
            <div className={styles.civicPillars}>
              <span className={styles.pillar}>✊ Poder Popular</span>
              <span className={styles.pillar}>🚌 Tarifa Zero</span>
              <span className={styles.pillar}>🏙️ Direito à Cidade</span>
            </div>
          </div>
        </div>
      </ShellContainer>
    </section>
  );
}
