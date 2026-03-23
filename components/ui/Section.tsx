import { ReactNode } from 'react';
import { ShellContainer } from './ShellContainer';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({
  id,
  title,
  eyebrow,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={[styles.section, className || ''].join(' ')}>
      <ShellContainer>
        {(title || eyebrow || description) && (
          <header className={styles.header}>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </header>
        )}
        {children}
      </ShellContainer>
    </section>
  );
}
