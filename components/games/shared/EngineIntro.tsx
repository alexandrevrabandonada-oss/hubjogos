import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './EngineIntro.module.css';

interface EngineIntroProps {
  engineType: 'quiz' | 'branching_story' | 'simulation' | 'map';
  title: string;
  description: string;
  duration: string;
  whatYouDiscover: string;
  onStart: () => void;
  icon?: ReactNode;
}

const ENGINE_LABELS: Record<EngineIntroProps['engineType'], string> = {
  quiz: 'Questionário político',
  branching_story: 'Narrativa de escolhas',
  simulation: 'Simulação de decisões',
  map: 'Exploração territorial',
};

const ENGINE_HOW_IT_WORKS: Record<EngineIntroProps['engineType'], string> = {
  quiz: 'Escolha rápido, compare prioridades e siga.',
  branching_story: 'Decida em segundos e veja a virada da rota.',
  simulation: 'Distribua agora e sinta o impacto no próximo passo.',
  map: 'Toque em um ponto e a cidade revela camadas escondidas.',
};

export function EngineIntro({
  engineType,
  title,
  description,
  duration,
  whatYouDiscover,
  onStart,
  icon,
}: EngineIntroProps) {
  return (
    <Card className={styles.intro}>
      <div className={styles.header}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <div>
          <p className={styles.engineType}>{ENGINE_LABELS[engineType]}</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>{description}</p>

        <div className={styles.fastStart}>
          <strong>Começo rápido:</strong> primeira decisão em menos de 15 segundos.
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <h3>Como funciona</h3>
            <p>{ENGINE_HOW_IT_WORKS[engineType]}</p>
          </div>

          <div className={styles.metaItem}>
            <h3>Duração</h3>
            <p>{duration}</p>
          </div>

          <div className={styles.metaItem}>
            <h3>O que você vai descobrir</h3>
            <p>{whatYouDiscover}</p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button onClick={onStart} variant="primary" fullWidth>
          Jogar agora
        </Button>
      </div>
    </Card>
  );
}
