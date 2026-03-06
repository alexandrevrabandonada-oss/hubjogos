/**
 * DownloadCardButton
 * Botão para exportar o share card como imagem PNG.
 * Usa html-to-image para capturar DOM → PNG.
 */

'use client';

import { useState } from 'react';
import { exportCardAsImage, buildCardFilename } from '@/lib/share/export-card';
import styles from './DownloadCardButton.module.css';

interface DownloadCardButtonProps {
    /** Ref para o elemento container do card a ser capturado */
    cardContainerRef: React.RefObject<HTMLElement | null>;
    gameSlug: string;
    resultId: string;
    /** Callback executado quando o download é iniciado */
    onExportClick?: () => Promise<void>;
}

type FeedbackState = 'idle' | 'loading' | 'success' | 'error';

export function DownloadCardButton({ cardContainerRef, gameSlug, resultId, onExportClick }: DownloadCardButtonProps) {
    const [feedback, setFeedback] = useState<FeedbackState>('idle');

    async function handleDownload() {
        if (!cardContainerRef.current) {
            setFeedback('error');
            setTimeout(() => setFeedback('idle'), 3000);
            return;
        }

        setFeedback('loading');

        // Track export attempt
        if (onExportClick) {
            await onExportClick().catch(console.error);
        }

        const filename = buildCardFilename(gameSlug, resultId);
        const success = await exportCardAsImage(cardContainerRef.current, { filename, scale: 2 });

        if (success) {
            setFeedback('success');
            setTimeout(() => setFeedback('idle'), 3000);
        } else {
            setFeedback('error');
            setTimeout(() => setFeedback('idle'), 4000);
        }
    }

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.button}
                onClick={handleDownload}
                disabled={feedback === 'loading'}
                aria-label="Baixar card de resultado como imagem"
            >
                <span className={styles.icon}>
                    {feedback === 'loading' ? '⏳' : '⬇️'}
                </span>
                {feedback === 'loading' ? 'Gerando imagem...' : 'Baixar card'}
            </button>

            {feedback === 'success' && (
                <p className={`${styles.feedback} ${styles.feedbackSuccess}`} role="status">
                    ✓ Card salvo como imagem!
                </p>
            )}
            {feedback === 'error' && (
                <p className={`${styles.feedback} ${styles.feedbackError}`} role="alert">
                    ✗ Não foi possível exportar. Tente um screenshot manual.
                </p>
            )}
        </div>
    );
}
