/**
 * MicroFeedback - Captura leve de reação do usuário
 */

'use client';

import { useState } from 'react';
import styles from './MicroFeedback.module.css';
import { trackEvent } from '@/lib/analytics/session-store';
import { registerFeedback } from '@/lib/analytics/feedback';

interface MicroFeedbackProps {
    gameSlug: string;
    engineKind: string;
}

export function MicroFeedback({ gameSlug, engineKind }: MicroFeedbackProps) {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRating, setSelectedRating] = useState<'positive' | 'neutral' | 'negative' | null>(null);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [comment, setComment] = useState('');

    const handleRatingClick = async (rating: 'positive' | 'neutral' | 'negative') => {
        setSelectedRating(rating);
        setShowCommentBox(true);
    };

    const handleSubmit = async () => {
        if (!selectedRating) return;
        
        setLoading(true);

        // Registra evento de feedback
        const tracked = await trackEvent({
            slug: gameSlug,
            engineKind,
            event: 'cta_click',
            ctaId: `feedback_${selectedRating}`,
            metadata: { 
                rating: selectedRating, 
                type: 'micro_feedback',
                hasComment: comment.trim().length > 0
            }
        });

        await registerFeedback({
            gameSlug,
            engineKind,
            rating: selectedRating,
            comment: comment.trim() || undefined,
            sessionId: tracked.sessionId,
            anonymousId: tracked.anonymousId,
        });

        setSent(true);
        setLoading(false);
    };

    const handleSkip = async () => {
        if (!selectedRating) return;
        
        setLoading(true);
        const tracked = await trackEvent({
            slug: gameSlug,
            engineKind,
            event: 'cta_click',
            ctaId: `feedback_${selectedRating}`,
            metadata: { rating: selectedRating, type: 'micro_feedback', hasComment: false }
        });

        await registerFeedback({
            gameSlug,
            engineKind,
            rating: selectedRating,
            sessionId: tracked.sessionId,
            anonymousId: tracked.anonymousId,
        });
        setSent(true);
        setLoading(false);
    };

    if (sent) {
        return (
            <div className={styles.sent}>
                <span className={styles.icon}>✨</span>
                <p>Obrigado pelo seu feedback!</p>
            </div>
        );
    }

    if (showCommentBox && selectedRating) {
        return (
            <div className={styles.container}>
                <p className={styles.question}>Quer compartilhar mais sobre sua experiência?</p>
                <textarea
                    className={styles.commentBox}
                    placeholder="Comentário opcional (até 500 caracteres)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    rows={3}
                    disabled={loading}
                />
                <div className={styles.commentActions}>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {comment.trim() ? 'Enviar' : 'Pular'}
                    </button>
                    {!comment.trim() && (
                        <button
                            onClick={handleSkip}
                            disabled={loading}
                            className={styles.skipButton}
                        >
                            Pular
                        </button>
                    )}
                </div>
                <p className={styles.helpText}>
                    {comment.length}/500 caracteres
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <p className={styles.question}>Essa experiência te fez pensar?</p>
            <div className={styles.options}>
                <button
                    onClick={() => handleRatingClick('positive')}
                    disabled={loading}
                    className={styles.option}
                    title="Sim"
                >
                    <span>😊</span>
                    <label>Sim</label>
                </button>
                <button
                    onClick={() => handleRatingClick('neutral')}
                    disabled={loading}
                    className={styles.option}
                    title="Mais ou menos"
                >
                    <span>😐</span>
                    <label>Meh</label>
                </button>
                <button
                    onClick={() => handleRatingClick('negative')}
                    disabled={loading}
                    className={styles.option}
                    title="Não"
                >
                    <span>🙁</span>
                    <label>Não</label>
                </button>
            </div>
        </div>
    );
}
