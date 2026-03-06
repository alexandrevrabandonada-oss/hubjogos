'use client';

import { Component, ReactNode } from 'react';
import Link from 'next/link';
import styles from './GameRuntime.module.css';

interface EngineRuntimeErrorBoundaryProps {
  children: ReactNode;
}

interface EngineRuntimeErrorBoundaryState {
  hasError: boolean;
}

export class EngineRuntimeErrorBoundary extends Component<
  EngineRuntimeErrorBoundaryProps,
  EngineRuntimeErrorBoundaryState
> {
  state: EngineRuntimeErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): EngineRuntimeErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.error('Engine runtime failed to render', error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorCard} role="alert">
          <h3>Não foi possível carregar esta engine</h3>
          <p>Recarregue a página ou abra outra experiência enquanto estabilizamos este módulo.</p>
          <Link href="/explorar" className={styles.quizLink}>
            Voltar ao catálogo →
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
