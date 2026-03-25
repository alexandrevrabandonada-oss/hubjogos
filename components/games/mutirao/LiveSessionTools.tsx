'use client';

/**
 * T77: Live Session Tools
 * 
 * Quick-action tools for operators to mark moments during a playtest session.
 */

import React, { useState, useCallback } from 'react';
import { PlaytestSession, OperatorNote, NoteType } from '@/lib/games/mutirao/playtest-types';
import styles from './PlaytestOpsConsole.module.css';

interface LiveSessionToolsProps {
  session: PlaytestSession;
  onAddNote: (sessionId: string, note: Omit<OperatorNote, 'id' | 'timestamp'>) => void;
  onSessionComplete: (sessionId: string, notes: OperatorNote[]) => void;
}

const QUICK_NOTES: { type: NoteType; icon: string; label: string; color: string }[] = [
  { type: 'confusion', icon: '😕', label: 'Confusion', color: '#fbbf24' },
  { type: 'strong-moment', icon: '✨', label: 'Strong Moment', color: '#4ade80' },
  { type: 'bug', icon: '🐛', label: 'Bug', color: '#f44336' },
  { type: 'drop', icon: '🚪', label: 'Drop/Quit', color: '#ef4444' },
  { type: 'completion', icon: '🏁', label: 'Completion', color: '#22c55e' },
  { type: 'timestamp', icon: '📍', label: 'Timestamp', color: '#666' },
];

export function LiveSessionTools({ session, onAddNote, onSessionComplete }: LiveSessionToolsProps) {
  const [customNote, setCustomNote] = useState('');
  const [currentTurn, setCurrentTurn] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuickNote = useCallback((type: NoteType) => {
    onAddNote(session.id, {
      type,
      content: `${type} marked`,
      turn: currentTurn,
    });
  }, [session.id, currentTurn, onAddNote]);

  const handleCustomNote = useCallback(() => {
    if (!customNote.trim()) return;
    
    onAddNote(session.id, {
      type: 'custom',
      content: customNote.trim(),
      turn: currentTurn,
    });
    setCustomNote('');
  }, [session.id, customNote, currentTurn, onAddNote]);

  const handleComplete = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmComplete = useCallback(() => {
    onSessionComplete(session.id, session.notes);
    setShowConfirm(false);
  }, [session.id, session.notes, onSessionComplete]);

  const sessionDuration = Math.floor((Date.now() - session.startTime) / 1000);
  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;

  return (
    <div className={styles.section}>
      <div className={styles.liveHeader}>
        <div className={styles.liveBadge}>
          <span className={styles.pulse}></span>
          LIVE SESSION
        </div>
        <div className={styles.sessionInfo}>
          <span>{session.metadata.testerNickname}</span>
          <span>•</span>
          <span>{session.metadata.deviceType}</span>
          <span>•</span>
          <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className={styles.liveControls}>
        {/* Turn Tracker */}
        <div className={styles.turnTracker}>
          <label>Current Turn:</label>
          <input
            type="number"
            min={1}
            max={12}
            value={currentTurn}
            onChange={e => setCurrentTurn(parseInt(e.target.value) || 1)}
            className={styles.turnInput}
          />
          <span className={styles.turnHint}>Update as player progresses</span>
        </div>

        {/* Quick Note Buttons */}
        <div className={styles.quickNotes}>
          <h4>Quick Markers</h4>
          <div className={styles.quickNoteGrid}>
            {QUICK_NOTES.map(note => (
              <button
                key={note.type}
                className={styles.quickNoteBtn}
                onClick={() => handleQuickNote(note.type)}
                style={{ borderColor: note.color }}
              >
                <span className={styles.quickNoteIcon}>{note.icon}</span>
                <span className={styles.quickNoteLabel}>{note.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Note */}
        <div className={styles.customNote}>
          <h4>Custom Note</h4>
          <div className={styles.customNoteInput}>
            <textarea
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g., Player asked about obra requirement, seemed confused about risco..."
              rows={3}
            />
            <button 
              onClick={handleCustomNote}
              disabled={!customNote.trim()}
              className={styles.addNoteBtn}
            >
              Add Note
            </button>
          </div>
        </div>

        {/* Recent Notes */}
        {session.notes.length > 0 && (
          <div className={styles.recentNotes}>
            <h4>Recent Notes ({session.notes.length})</h4>
            <div className={styles.notesList}>
              {session.notes.slice(-5).reverse().map(note => (
                <div key={note.id} className={styles.noteItem}>
                  <span className={styles.noteTime}>
                    {new Date(note.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={styles.noteType}>{note.type}</span>
                  <span className={styles.noteTurn}>T{note.turn}</span>
                  <span className={styles.noteContent}>{note.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Session */}
        <div className={styles.completeSection}>
          <button 
            onClick={handleComplete}
            className={styles.completeBtn}
          >
            ✅ Complete Session
          </button>
          <p className={styles.completeHint}>
            Click when player finishes, abandons, or session ends.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Complete Session?</h3>
            <p>This will finalize the session and return to review mode.</p>
            <p>{session.notes.length} notes recorded</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowConfirm(false)} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmComplete} className={styles.confirmBtn}>
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
