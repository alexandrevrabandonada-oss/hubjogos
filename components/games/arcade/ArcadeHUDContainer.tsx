import type { ReactNode } from 'react';
import styles from './ArcadeHUDContainer.module.css';

interface ArcadeHUDContainerProps {
  children?: ReactNode;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomCenter?: ReactNode;
  overlay?: ReactNode;
  className?: string;
}

/**
 * Shared module for Arcade HUD layout.
 * Posiciona medidores, timers e pause buttons de maneira padronizada sobre o Canvas.
 */
export function ArcadeHUDContainer({
  children,
  topLeft,
  topRight,
  bottomCenter,
  overlay,
  className = '',
}: ArcadeHUDContainerProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.topBar}>
        {topLeft && <div className={styles.leftControls}>{topLeft}</div>}
        {topRight && <div className={styles.rightControls}>{topRight}</div>}
      </div>

      {children}

      {bottomCenter && <div className={styles.bottomBar}>{bottomCenter}</div>}

      {overlay && <div className={styles.fullScreenOverlay}>{overlay}</div>}
    </div>
  );
}
