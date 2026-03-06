/**
 * Header - Navegação Principal
 * Componente do tipo "shell" do produto
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BetaBadge } from '@/components/ui/BetaBadge';
import styles from './Header.module.css';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/explorar', label: 'Explorar' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/participar', label: 'Participar' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoBlock}>HUB</span>
          <div className={styles.logoTextGroup}>
            <span className={styles.logoText}>de Jogos da Pré-Campanha de Alexandre Fonseca para Deputado</span>
            <BetaBadge className={styles.headerBeta} />
          </div>
        </Link>

        <nav className={styles.navDesktop}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <nav className={styles.navMobile}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navLinkMobile}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
