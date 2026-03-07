import Link from 'next/link';
import styles from './CampaignMark.module.css';

interface CampaignMarkProps {
  compact?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function CampaignMark({ compact = false, href = '/sobre', onClick, className }: CampaignMarkProps) {
  const label = compact
    ? 'Pré-campanha de Alexandre Fonseca para Deputado'
    : 'Hub da Pré-campanha de Alexandre Fonseca para Deputado';

  const classes = [styles.mark, className].filter(Boolean).join(' ');

  return (
    <Link href={href} className={classes} onClick={onClick} aria-label={label}>
      <span className={styles.badge}>AF</span>
      <span className={styles.text}>{label}</span>
    </Link>
  );
}
