import React from 'react';
import styles from './CampaignPortalSection.module.css';
import { CampaignMark } from '../campaign/CampaignMark';

interface CampaignPortalSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function CampaignPortalSection({ eyebrow, title, description, children }: CampaignPortalSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.markWrap}>
          <CampaignMark compact />
        </div>
        <div className={styles.textContent}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
}
