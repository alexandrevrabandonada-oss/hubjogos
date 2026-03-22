import styles from './ArcadeProgressBar.module.css';

interface ArcadeProgressBarProps {
  value: number;
  max?: number;
  icon?: string;
  label?: string;
  showValue?: boolean;
  colorState?: 'safe' | 'warning' | 'critical' | 'primary';
  className?: string;
  width?: number; // width in px for the track
}

/**
 * Shared module for Arcade Progress/Meters.
 * Padroniza a exibição de barras de HP, recursos ou timers de pressão.
 */
export function ArcadeProgressBar({
  value,
  max = 100,
  icon,
  label,
  showValue = true,
  colorState = 'safe',
  className = '',
  width = 100,
}: ArcadeProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={`${styles.container} ${className}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <div>
        {(label || showValue) && (
          <div className={styles.labels}>
            {label && <span>{label}</span>}
            {showValue && <span>{Math.round(value)}/{max}</span>}
          </div>
        )}
        <div className={styles.track} style={{ width: `${width}px` }}>
          <div
            className={`${styles.fill} ${styles[colorState]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
