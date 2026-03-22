import React from 'react';
import styles from './CampaignShell.module.css';

interface CampaignShellProps {
  children: React.ReactNode;
}

export function CampaignShell({ children }: CampaignShellProps) {
  return (
    <div className={styles.campaignShell}>
      {children}
      <div className={styles.campaignFooterRibbon}>
        <div className={styles.ribbonContent}>
          <span className={styles.ribbonName}>Alexandre Fonseca para Deputado Estadual</span>
          <span className={styles.ribbonTagline}>RJ - Pré-Campanha 2026</span>
        </div>
      </div>
    </div>
  );
}
