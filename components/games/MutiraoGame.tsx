'use client';

// Mutirão de Saneamento - Game Component
// T75 — Beta Hardened with telemetry, audio, balance improvements

import React, { useState, useCallback, useEffect } from 'react';
import { PlayShell } from '@/components/play/PlayShell';
import { ResultScreen } from '@/components/result/ResultScreen';
import { MUTIRAO_RESULT_STATES } from '@/lib/production/blueprints/mutirao-saneamento';
import { Game } from '@/lib/games/catalog';
import { useMutiraoAudio } from '@/lib/games/mutirao/audio';
import {
  startTelemetrySession,
  recordAction,
  recordStateSnapshot,
  completeSession,
} from '@/lib/games/mutirao/telemetry';
import {
  BALANCE_STARTING_STATE,
  BALANCE_ENERGY_COSTS,
  BALANCE_ENERGY_REGEN,
  BALANCE_EFFECTS,
  BALANCE_CRISIS,
  BALANCE_DECAY,
  canExecuteObra,
  getObraDisabledReason,
  calculateResultSeverity,
  shouldTriggerDengueWarning,
  shouldTriggerDengueOutbreak,
  shouldDecayConfianca,
} from '@/lib/games/mutirao/balance';
import styles from './MutiraoGame.module.css';

// --- Game State ---

interface GameState {
  turn: number;
  confianca: number;
  energia: number;
  riscoSaude: number;
  cobertura: number;
  acoesRealizadas: number;
  selectedActor: string | null;
  log: string[];
  gameOver: boolean;
  result: typeof MUTIRAO_RESULT_STATES[0] | null;
}

const INITIAL_STATE: GameState = {
  turn: BALANCE_STARTING_STATE.turn,
  confianca: BALANCE_STARTING_STATE.confianca,
  energia: BALANCE_STARTING_STATE.energia,
  riscoSaude: BALANCE_STARTING_STATE.riscoSaude,
  cobertura: BALANCE_STARTING_STATE.cobertura,
  acoesRealizadas: BALANCE_STARTING_STATE.acoesRealizadas,
  selectedActor: null,
  log: ['Bem-vindo à Vila Esperança. O bairro precisa de você.'],
  gameOver: false,
  result: null,
};

// --- Game Component ---

interface MutiraoGameProps {
  game: Game;
  onComplete: (result: any) => void;
}

export function MutiraoGame({ game, onComplete }: MutiraoGameProps) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const audio = useMutiraoAudio();

  // Initialize telemetry on mount
  useEffect(() => {
    startTelemetrySession();
  }, []);

  // Record state snapshot on significant changes
  useEffect(() => {
    recordStateSnapshot(
      gameState.turn,
      gameState.confianca,
      gameState.energia,
      gameState.riscoSaude,
      gameState.cobertura
    );
  }, [gameState.turn, gameState.confianca, gameState.energia, gameState.riscoSaude, gameState.cobertura]);

  const calculateResult = useCallback((): { result: typeof MUTIRAO_RESULT_STATES[0]; severity: string } => {
    const severity = calculateResultSeverity({
      cobertura: gameState.cobertura,
      confianca: gameState.confianca,
      riscoSaude: gameState.riscoSaude,
      acoesRealizadas: gameState.acoesRealizadas,
    });
    
    const resultMap: Record<string, string> = {
      triumph: 'cuidado-coletivo-floresceu',
      success: 'bairro-respirou',
      neutral: 'crise-contida',
      struggle: 'mutirao-insuficiente',
      collapse: 'abandono-venceu',
    };
    
    return {
      result: MUTIRAO_RESULT_STATES.find(r => r.id === resultMap[severity])!,
      severity,
    };
  }, [gameState]);

  const checkEndGame = useCallback((): boolean => {
    // Win conditions
    if (gameState.cobertura >= 85 && gameState.confianca >= 60) return true;
    
    // Fail conditions
    if (gameState.confianca <= 0 || gameState.riscoSaude >= 10) return true;
    
    // Time limit (12 turns)
    if (gameState.turn >= 12) return true;
    
    return false;
  }, [gameState]);

  const executeAction = useCallback((action: string, target: string) => {
    audio.playUIClick();
    
    setGameState(prev => {
      const newState = { ...prev };
      
      switch (action) {
        case 'conversar':
          if (newState.energia >= BALANCE_ENERGY_COSTS.conversar) {
            newState.energia -= BALANCE_ENERGY_COSTS.conversar;
            newState.confianca = Math.min(100, newState.confianca + BALANCE_EFFECTS.conversar.confianca);
            newState.log.push(`💬 Conversou com ${target}. Confiança +${BALANCE_EFFECTS.conversar.confianca}`);
            audio.playActionConfirm();
            recordAction('conversar', newState.turn, { target, confiancaDelta: BALANCE_EFFECTS.conversar.confianca });
          }
          break;
          
        case 'mobilizar':
          if (newState.energia >= BALANCE_ENERGY_COSTS.mobilizar) {
            newState.energia -= BALANCE_ENERGY_COSTS.mobilizar;
            newState.confianca = Math.min(100, newState.confianca + BALANCE_EFFECTS.mobilizar.confianca);
            newState.log.push(`📢 Mobilizou ${target}. Confiança +${BALANCE_EFFECTS.mobilizar.confianca}`);
            audio.playActionConfirm();
            recordAction('mobilizar', newState.turn, { target, confiancaDelta: BALANCE_EFFECTS.mobilizar.confianca });
          }
          break;
          
        case 'executar_obra':
          if (canExecuteObra({ energia: newState.energia, confianca: newState.confianca })) {
            newState.energia -= BALANCE_ENERGY_COSTS.executarObra;
            newState.cobertura = Math.min(100, newState.cobertura + BALANCE_EFFECTS.executarObra.cobertura);
            newState.riscoSaude = Math.max(0, newState.riscoSaude + BALANCE_EFFECTS.executarObra.riscoSaude);
            newState.acoesRealizadas++;
            newState.log.push(`🔧 Executou obra de saneamento. Cobertura +${BALANCE_EFFECTS.executarObra.cobertura}%`);
            audio.playActionConfirm();
            recordAction('executar_obra', newState.turn, { coberturaDelta: BALANCE_EFFECTS.executarObra.cobertura });
          } else {
            const reason = getObraDisabledReason({ energia: newState.energia, confianca: newState.confianca });
            newState.log.push(`❌ Não foi possível: ${reason}`);
            audio.playAlert();
          }
          break;
          
        case 'mutirao_limpeza':
          if (newState.energia >= BALANCE_ENERGY_COSTS.mutiraoLimpeza) {
            newState.energia -= BALANCE_ENERGY_COSTS.mutiraoLimpeza;
            newState.riscoSaude = Math.max(0, newState.riscoSaude + BALANCE_EFFECTS.mutiraoLimpeza.riscoSaude);
            newState.confianca = Math.min(100, newState.confianca + BALANCE_EFFECTS.mutiraoLimpeza.confianca);
            newState.acoesRealizadas++;
            newState.log.push(`🧹 Mutirão de limpeza realizado. Risco ${BALANCE_EFFECTS.mutiraoLimpeza.riscoSaude}, Confiança +${BALANCE_EFFECTS.mutiraoLimpeza.confianca}`);
            audio.playActionConfirm();
            recordAction('mutirao_limpeza', newState.turn, { riscoDelta: BALANCE_EFFECTS.mutiraoLimpeza.riscoSaude });
          }
          break;
          
        case 'proximo_turno':
          newState.turn++;
          newState.energia = Math.min(BALANCE_ENERGY_REGEN.maxEnergy, newState.energia + BALANCE_ENERGY_REGEN.perTurn);
          
          // Check dengue warning
          if (shouldTriggerDengueWarning(newState.turn, newState.riscoSaude)) {
            newState.log.push('⚠️ AVISO: Condições favoráveis para dengue! Faça mutirão de limpeza!');
            audio.playAlert();
          }
          
          // Check dengue outbreak
          if (shouldTriggerDengueOutbreak(newState.turn, newState.riscoSaude)) {
            newState.riscoSaude += BALANCE_CRISIS.dengue.riskIncrease;
            newState.log.push('🚨 SURTO DE DENGUE! Risco de saúde aumentou críticamente!');
            audio.playCrisisAlert();
          }
          
          // Decay confianca if low coverage
          if (shouldDecayConfianca(newState.turn, newState.cobertura)) {
            newState.confianca = Math.max(0, newState.confianca - BALANCE_DECAY.confianca.decayAmount);
            newState.log.push('📉 Moradores perdem esperança sem progresso visível');
          }
          
          recordAction('proximo_turno', newState.turn, {});
          break;
      }
      
      // Check end game
      if (checkEndGame()) {
        newState.gameOver = true;
        const { result, severity } = calculateResult();
        newState.result = result;
        audio.playResultTransition(severity as 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse');
        
        completeSession(
          newState.turn,
          newState.confianca,
          newState.energia,
          newState.riscoSaude,
          newState.cobertura,
          newState.acoesRealizadas,
          result.id,
          severity as 'triumph' | 'success' | 'neutral' | 'struggle' | 'collapse'
        );
      }
      
      return newState;
    });
  }, [audio, checkEndGame, calculateResult]);

  const handleActorClick = useCallback((actorId: string) => {
    audio.playUIClick();
    setGameState(prev => ({
      ...prev,
      selectedActor: prev.selectedActor === actorId ? null : actorId,
    }));
  }, [audio]);

  // Render game over screen
  if (gameState.gameOver && gameState.result) {
    const resultData = {
      outcomeType: 'territory_state' as const,
      outcomeSeverity: gameState.result.severity,
      title: gameState.result.title,
      summary: gameState.result.summary,
      interpretation: gameState.result.interpretation,
      mainMetric: {
        label: 'Cobertura de Saneamento',
        value: `${gameState.cobertura}%`,
      },
      secondaryMetrics: [
        { label: 'Confiança', value: `${gameState.confianca}%` },
        { label: 'Risco de Saúde', value: gameState.riscoSaude },
        { label: 'Ações Realizadas', value: gameState.acoesRealizadas },
      ],
      politicalFraming: gameState.result.politicalFraming,
      shareData: gameState.result.shareData,
      nextSteps: {
        replayRecommended: true,
      },
    };

    return (
      <ResultScreen
        game={game}
        result={resultData}
        onReplay={() => {
          setGameState(INITIAL_STATE);
        }}
        onClose={() => onComplete(resultData)}
      />
    );
  }

  return (
    <div className={styles.gameContainer}>
      {/* Header / Status Bar */}
      <header className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Turno</span>
          <span className={styles.statusValue}>{gameState.turn}/12</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Confiança</span>
          <div className={styles.bar}>
            <div 
              className={styles.barFill} 
              style={{ width: `${gameState.confianca}%`, backgroundColor: '#22c55e' }}
            />
          </div>
          <span className={styles.statusValue}>{gameState.confianca}%</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Energia</span>
          <div className={styles.bar}>
            <div 
              className={styles.barFill} 
              style={{ width: `${(gameState.energia / 50) * 100}%`, backgroundColor: '#f59e0b' }}
            />
          </div>
          <span className={styles.statusValue}>{gameState.energia}</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Risco Saúde</span>
          <div className={styles.bar}>
            <div 
              className={styles.barFill} 
              style={{ 
                width: `${(gameState.riscoSaude / 10) * 100}%`, 
                backgroundColor: gameState.riscoSaude > 6 ? '#ef4444' : '#f59e0b' 
              }}
            />
          </div>
          <span className={styles.statusValue}>{gameState.riscoSaude}/10</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Cobertura</span>
          <div className={styles.bar}>
            <div 
              className={styles.barFill} 
              style={{ width: `${gameState.cobertura}%`, backgroundColor: '#3b82f6' }}
            />
          </div>
          <span className={styles.statusValue}>{gameState.cobertura}%</span>
        </div>
      </header>

      {/* Main Game Area */}
      <main className={styles.gameArea}>
        {/* Map / Territory View */}
        <section className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Vila Esperança</h2>
          
          {/* Critical Issues */}
          <div className={styles.issuesList}>
            <div className={`${styles.issue} ${gameState.riscoSaude > 5 ? styles.critical : ''}`}>
              <span className={styles.issueIcon}>⚠️</span>
              <span className={styles.issueText}>Esgoto na Rua das Palmeiras</span>
            </div>
            <div className={`${styles.issue} ${gameState.riscoSaude > 6 ? styles.critical : ''}`}>
              <span className={styles.issueIcon}>🗑️</span>
              <span className={styles.issueText}>Lixão a céu aberto</span>
            </div>
            <div className={styles.issue}>
              <span className={styles.issueIcon}>💧</span>
              <span className={styles.issueText}>Água irregular (3x/semana)</span>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className={styles.progressVisualization}>
            <div className={styles.neighborhoodBlock}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i}
                  className={`${styles.house} ${i < gameState.cobertura / 10 ? styles.served : ''}`}
                >
                  {i < gameState.cobertura / 10 ? '🏠' : '🏚️'}
                </div>
              ))}
            </div>
            <p className={styles.progressText}>
              {gameState.cobertura}% das famílias com acesso ao saneamento
            </p>
          </div>
        </section>

        {/* Actors Panel */}
        <section className={styles.actorsSection}>
          <h2 className={styles.sectionTitle}>Atores</h2>
          <div className={styles.actorsList}>
            <button
              className={`${styles.actorButton} ${gameState.selectedActor === 'dona-rita' ? styles.selected : ''}`}
              onClick={() => handleActorClick('dona-rita')}
            >
              <span className={styles.actorIcon}>👵</span>
              <span className={styles.actorName}>Dona Rita</span>
              <span className={styles.actorRole}>Líder</span>
            </button>
            <button
              className={`${styles.actorButton} ${gameState.selectedActor === 'joao-pedreiro' ? styles.selected : ''}`}
              onClick={() => handleActorClick('joao-pedreiro')}
            >
              <span className={styles.actorIcon}>👷</span>
              <span className={styles.actorName}>João Pedreiro</span>
              <span className={styles.actorRole}>Técnico</span>
            </button>
            <button
              className={`${styles.actorButton} ${gameState.selectedActor === 'tia-neide' ? styles.selected : ''}`}
              onClick={() => handleActorClick('tia-neide')}
            >
              <span className={styles.actorIcon}>🙋‍♀️</span>
              <span className={styles.actorName}>Tia Neide</span>
              <span className={styles.actorRole}>Mãe</span>
            </button>
            <button
              className={`${styles.actorButton} ${gameState.selectedActor === 'maria-agua' ? styles.selected : ''}`}
              onClick={() => handleActorClick('maria-agua')}
            >
              <span className={styles.actorIcon}>💧</span>
              <span className={styles.actorName}>Maria da ONG</span>
              <span className={styles.actorRole}>Aliada</span>
            </button>
          </div>
        </section>

        {/* Actions Panel */}
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Ações</h2>
          <div className={styles.actionsList}>
            <button
              className={styles.actionButton}
              onClick={() => executeAction('conversar', gameState.selectedActor || 'morador')}
              disabled={gameState.energia < 2}
            >
              <span className={styles.actionIcon}>💬</span>
              <span className={styles.actionName}>Conversar</span>
              <span className={styles.actionCost}>-2 energia</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => executeAction('mobilizar', gameState.selectedActor || 'grupo')}
              disabled={gameState.energia < 5}
            >
              <span className={styles.actionIcon}>📢</span>
              <span className={styles.actionName}>Mobilizar</span>
              <span className={styles.actionCost}>-5 energia</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => executeAction('executar_obra', 'saneamento')}
              disabled={gameState.energia < 10}
            >
              <span className={styles.actionIcon}>🔧</span>
              <span className={styles.actionName}>Executar Obra</span>
              <span className={styles.actionCost}>-10 energia</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={() => executeAction('mutirao_limpeza', 'comunidade')}
              disabled={gameState.energia < 8}
            >
              <span className={styles.actionIcon}>🧹</span>
              <span className={styles.actionName}>Mutirão de Limpeza</span>
              <span className={styles.actionCost}>-8 energia</span>
            </button>
            <button
              className={`${styles.actionButton} ${styles.nextTurn}`}
              onClick={() => executeAction('proximo_turno', 'tempo')}
            >
              <span className={styles.actionIcon}>⏭</span>
              <span className={styles.actionName}>Próximo Turno</span>
              <span className={styles.actionCost}>+5 energia</span>
            </button>
          </div>
        </section>

        {/* Event Log */}
        <section className={styles.logSection}>
          <h2 className={styles.sectionTitle}>Registro</h2>
          <div className={styles.logContent}>
            {gameState.log.slice(-5).map((entry, index) => (
              <p key={index} className={styles.logEntry}>{entry}</p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// --- Game Wrapper with PlayShell ---

interface MutiraoGameWrapperProps {
  game: Game;
}

export function MutiraoGameWrapper({ game }: MutiraoGameWrapperProps) {
  return (
    <PlayShell
      game={game}
      onComplete={(res) => {
        console.log('Game completed:', res);
      }}
    >
      {({ lifecycle }) => (
        <MutiraoGame
          game={game}
          onComplete={(res) => {
            lifecycle.emitComplete(res);
          }}
        />
      )}
    </PlayShell>
  );
}

export default MutiraoGameWrapper;
