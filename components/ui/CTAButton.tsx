'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CTAButton.module.css';

interface CTAButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function CTAButton({ 
  href, 
  onClick, 
  children, 
  variant = 'primary',
  className = '' 
}: CTAButtonProps) {
  const combinedClassName = `${styles.button} ${styles[variant]} ${className}`;

  if (href) {
    if (href.startsWith('http') || href.startsWith('#')) {
      return (
        <a href={href} className={combinedClassName} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClassName} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} onClick={onClick}>
      {children}
    </button>
  );
}
