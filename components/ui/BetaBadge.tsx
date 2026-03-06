/**
 * BetaBadge - Indicador discreto de fase de teste
 */

import styles from './BetaBadge.module.css';

interface BetaBadgeProps {
    className?: string;
    dot?: boolean;
}

export function BetaBadge({ className = '', dot = true }: BetaBadgeProps) {
    return (
        <div className={`${styles.badge} ${className}`}>
            {dot && <span className={styles.dot} aria-hidden />}
            <span className={styles.text}>BETA PÚBLICO</span>
        </div>
    );
}
