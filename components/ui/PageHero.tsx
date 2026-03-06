import { ReactNode } from 'react';
import { ShellContainer } from './ShellContainer';
import styles from './PageHero.module.css';

interface PageHeroProps {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHero({
  title,
  description,
  eyebrow,
  actions,
  children,
}: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <ShellContainer className={styles.grid}>
        <div className={styles.content}>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          <p>{description}</p>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {children ? <div className={styles.side}>{children}</div> : null}
      </ShellContainer>
    </section>
  );
}
