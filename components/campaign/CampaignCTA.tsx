import React from 'react';
import Link from 'next/link';
import styles from './CampaignCTA.module.css';
import { CampaignMark } from './CampaignMark';

interface CampaignCTAProps {
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
}

export function CampaignCTA({
  title = 'Apoie o projeto coletivo',
  description = 'A campanha de Alexandre Fonseca é construída por milhares de mãos. Entre para a organização popular.',
  primaryAction = { label: 'Participar da Pré-Campanha', href: '/participar' },
}: CampaignCTAProps) {
  return (
    <div className={styles.campaignCta}>
      <div className={styles.markWrap}>
        <CampaignMark compact />
      </div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link href={primaryAction.href} className={styles.actionButton}>
          {primaryAction.label}
        </Link>
      </div>
    </div>
  );
}
