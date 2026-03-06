import { ReactNode } from 'react';
import styles from './MetaChip.module.css';

interface MetaChipProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function MetaChip({ icon, children }: MetaChipProps) {
  return (
    <span className={styles.chip}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children}
    </span>
  );
}
