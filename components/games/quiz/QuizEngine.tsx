'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MetaChip } from '@/components/ui/MetaChip';
import { GameOutcome } from '@/components/games/shared/GameOutcome';
import { EngineIntro } from '@/components/games/shared/EngineIntro';
import { calculateQuizResult } from '@/lib/games/quiz/engine';
import { QuizDefinition } from '@/lib/games/quiz/types';
import { Game } from '@/lib/games/catalog';
import { getOutcomeCta } from '@/lib/games/ctas';
import {
  trackCtaClick,
  trackFirstInteractionTime,
  trackGameComplete,
  trackLinkCopy,
  trackResultCopy,
  trackStepAdvance,
} from '@/lib/analytics/track';
import styles from './QuizEngine.module.css';

interface QuizEngineProps {
  quiz: QuizDefinition;
  game: Game;
}

function storageKey(quizId: string) {
  return `hubjogos:quiz:${quizId}:answers`;
}

export function QuizEngine({ quiz, game }: QuizEngineProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return Array(quiz.questions.length).fill('');
    }
    const raw = window.localStorage.getItem(storageKey(quiz.id));
    if (!raw) {
      return Array(quiz.questions.length).fill('');
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length === quiz.questions.length) {
        return parsed;
      }
    } catch {
      return Array(quiz.questions.length).fill('');
    }
    return Array(quiz.questions.length).fill('');
  });

  const completionTracked = useRef(false);
  const introClosedAt = useRef<number | null>(null);
  const firstInteractionTracked = useRef(false);
  const isFinished = step >= quiz.questions.length;

  const result = useMemo(() => {
    return calculateQuizResult(quiz, answers);
  }, [answers, quiz]);

  const currentQuestion = quiz.questions[step];
  const selectedOption = answers[step];
  const ctas = getOutcomeCta(game);

  useEffect(() => {
    if (!isFinished || completionTracked.current) {
      return;
    }

    completionTracked.current = true;
    void trackGameComplete(game, {
      id: result.profile.id,
      title: result.profile.title,
      summary: `${ctas.shareLine} ${result.summary}`,
    });
  }, [ctas.shareLine, game, isFinished, result.profile.id, result.profile.title, result.summary]);

  function persist(next: string[]) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey(quiz.id), JSON.stringify(next));
    }
  }

  function handleSelect(optionId: string) {
    if (!firstInteractionTracked.current) {
      firstInteractionTracked.current = true;
      const elapsed = introClosedAt.current ? Date.now() - introClosedAt.current : 0;
      void trackFirstInteractionTime(game, elapsed, 'answer_select');
    }

    const next = [...answers];
    next[step] = optionId;
    setAnswers(next);
    persist(next);
  }

  async function goNext() {
    if (!selectedOption) {
      return;
    }

    const nextStep = step + 1;
    await trackStepAdvance(game, `quiz-step-${nextStep}`);
    setStep(nextStep);
  }

  function goBack() {
    setStep((prev) => Math.max(0, prev - 1));
  }

  async function copySummary(summary: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
    }
    await trackResultCopy(game);
  }

  async function copyLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
    await trackLinkCopy(game);
  }

  function restart() {
    const reset = Array(quiz.questions.length).fill('');
    completionTracked.current = false;
    firstInteractionTracked.current = false;
    introClosedAt.current = null;
    setAnswers(reset);
    setStep(0);
    setShowIntro(true);
    persist(reset);
  }

  if (showIntro) {
    return (
      <EngineIntro
        engineType="quiz"
        title={game.title}
        description={game.shortDescription}
        duration={game.duration}
        whatYouDiscover={quiz.subtitle}
        onStart={() => {
          introClosedAt.current = Date.now();
          setShowIntro(false);
        }}
        icon={game.icon}
      />
    );
  }

  if (isFinished) {
    return (
      <GameOutcome
        eyebrow="Resultado do quiz"
        title={result.profile.title}
        revelation={result.profile.description}
        nextAction={result.profile.nextAction}
        summary={`${ctas.shareLine} ${result.summary}`}
        ctas={ctas}
        onRestart={restart}
        onCopySummary={() => copySummary(`${ctas.shareLine} ${result.summary}`)}
        onCopyLink={copyLink}
        onCtaClick={(ctaId) => trackCtaClick(game, ctaId)}
        game={game}
      />
    );
  }

  const progress = Math.round(((step + 1) / quiz.questions.length) * 100);

  return (
    <Card className={styles.engineCard}>
      <header className={styles.header}>
        <div>
          <span className="eyebrow">Quiz em andamento</span>
          <h3>{quiz.title}</h3>
          <p>{quiz.subtitle}</p>
        </div>
        <MetaChip icon="⏱">Etapa {step + 1} de {quiz.questions.length}</MetaChip>
      </header>

      <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso: ${progress}%`}>
        <span className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <section className={styles.questionBlock} aria-labelledby="current-question">
        <h4 id="current-question">{currentQuestion.prompt}</h4>
        {currentQuestion.context ? <p className={styles.context}>{currentQuestion.context}</p> : null}
        <div className={styles.options} role="radiogroup" aria-label="Opções de resposta">
          {currentQuestion.options.map((option) => {
            const active = selectedOption === option.id;
            return (
              <button
                key={option.id}
                className={`${styles.option} ${active ? styles.optionActive : ''}`}
                onClick={() => handleSelect(option.id)}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={option.label}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <footer className={styles.actions}>
        <Button variant="ghost" onClick={goBack} disabled={step === 0}>
          Voltar
        </Button>
        <Button onClick={() => void goNext()} disabled={!selectedOption}>
          {step === quiz.questions.length - 1 ? 'Ver resultado' : 'Próxima'}
        </Button>
      </footer>
    </Card>
  );
}
