import { ReactNode } from 'react';
import styles from './CTACluster.module.css';

interface CTAClusterProps {
  children: ReactNode;
}

export function CTACluster({ children }: CTAClusterProps) {
  return <div className={styles.cluster}>{children}</div>;
}
