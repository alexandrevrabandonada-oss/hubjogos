/**
 * Header - Navegação Principal
 * Componente do tipo "shell" do produto
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo / Branding */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoBracket}>[</span>
          <span className={styles.logoText}>HUB</span>
          <span className={styles.logoSubtext}>JOGOS</span>
          <span className={styles.logoBracket}>]</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className={styles.navDesktop}>
          <Link href="/explorar" className={styles.navLink}>
            Explorar
          </Link>
          <Link href="/sobre" className={styles.navLink}>
            Sobre
          </Link>
          <Link href="/participar" className={styles.navLink}>
            Participar
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
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

      {/* Navigation - Mobile */}
      {menuOpen && (
        <nav className={styles.navMobile}>
          <Link
            href="/explorar"
            className={styles.navLinkMobile}
            onClick={() => setMenuOpen(false)}
          >
            Explorar
          </Link>
          <Link
            href="/sobre"
            className={styles.navLinkMobile}
            onClick={() => setMenuOpen(false)}
          >
            Sobre
          </Link>
          <Link
            href="/participar"
            className={styles.navLinkMobile}
            onClick={() => setMenuOpen(false)}
          >
            Participar
          </Link>
        </nav>
      )}
    </header>
  );
}
