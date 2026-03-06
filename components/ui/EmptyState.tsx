import { ReactNode } from 'react';
import { Card } from './Card';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className={styles.empty}>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </Card>
  );
}
