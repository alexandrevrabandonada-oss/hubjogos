import styles from './StatusBadge.module.css';

type Status = 'live' | 'beta' | 'coming';

interface StatusBadgeProps {
  status: Status;
}

const statusMap: Record<Status, { label: string; className: string }> = {
  live: { label: 'Ao vivo', className: styles.live },
  beta: { label: 'Em teste', className: styles.beta },
  coming: { label: 'Em breve', className: styles.coming },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];
  return <span className={`${styles.badge} ${item.className}`}>{item.label}</span>;
}
