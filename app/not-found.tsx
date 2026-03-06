'use client';

import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { ShellContainer } from '@/components/ui/ShellContainer';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <Section>
      <ShellContainer className={styles.wrap}>
        <div className={styles.content}>
          <span className="eyebrow">404</span>
          <h2>Experiência não encontrada</h2>
          <p>
            A pauta que você procura não existe ou ainda está em
            desenvolvimento.
          </p>

          <div className={styles.actions}>
            <Link href="/explorar" className={styles.primary}>
              Explorar Todas as Experiências
            </Link>
            <Link href="/" className={styles.secondary}>
              Voltar à Home
            </Link>
          </div>

          <div className={styles.alternatives}>
            <h3>Sugestões</h3>
            <ul>
              <li>
                <Link href="/explorar">Ver catálogo completo</Link>
              </li>
              <li>
                <Link href="/sobre">Entender sobre o projeto</Link>
              </li>
              <li>
                <Link href="/participar">Sugerir uma nova pauta</Link>
              </li>
            </ul>
          </div>
        </div>
      </ShellContainer>
    </Section>
  );
}
