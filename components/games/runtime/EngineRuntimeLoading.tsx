import styles from './GameRuntime.module.css';

export function EngineRuntimeLoading() {
  return (
    <div className={styles.loadingCard} role="status" aria-live="polite">
      <h3>Carregando experiência...</h3>
      <p>Preparando a engine deste jogo.</p>
    </div>
  );
}
