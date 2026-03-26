'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  SimulationDefinition, 
  SimulationState, 
} from '@/lib/games/simulation/types';
import { 
  applyProject, 
  applyPressureToDistricts, 
  advanceStep, 
  completeSimulation,
  getNextPressure
} from '@/lib/games/simulation/engine';
import styles from './UrbanSimEngine.module.css';

interface UrbanSimEngineProps {
  definition: SimulationDefinition;
  state: SimulationState;
  onStateChange: (newState: SimulationState) => void;
}

export function UrbanSimEngine({ definition, state, onStateChange }: UrbanSimEngineProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const nextPressure = getNextPressure(state, definition);
  const districts = definition.districts || [];
  const projects = definition.projects || [];

  const handleProjectSelect = (projectId: string) => {
    if (state.activeProjects?.includes(projectId)) return;
    
    const project = projects.find(p => p.id === projectId);
    if (project && project.cost <= state.totalBudget) {
      setSelectedProjectId(projectId === selectedProjectId ? null : projectId);
    }
  };

  const handleRunTurn = () => {
    if (!selectedProjectId) return;

    setIsSimulating(true);

    // Simulação visual delay
    setTimeout(() => {
      // 1. Aplica projeto
      let newState = applyProject(state, selectedProjectId, definition);
      
      // 2. Aplica decaimento e pressão
      newState = applyPressureToDistricts(newState, definition);
      
      // 3. Avança step
      newState = advanceStep(newState);

      // 4. Se fim, completa
      if (newState.step >= (definition.pressures?.length || 0)) {
        newState = completeSimulation(newState, definition);
      }

      onStateChange(newState);
      setSelectedProjectId(null);
      setIsSimulating(false);
    }, 1000);
  };

  const getHealthColor = (health: number) => {
    if (health > 70) return '#10b981'; // green-500
    if (health > 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className={styles.urbanWrap}>
      {nextPressure && (
        <div className={styles.crisisOverlay}>
          <h3 className={styles.crisisTitle}>⚠️ CRISSE: {nextPressure.title}</h3>
          <p className={styles.crisisDesc}>{nextPressure.description}</p>
        </div>
      )}

      <div className={styles.cityBoard}>
        {districts.map((district) => {
          const health = state.districtHealth?.[district.id] ?? district.initialHealth;
          return (
            <div key={district.id} className={styles.districtCard}>
              <div className={styles.districtHeader}>
                <span className={styles.districtIcon}>{district.icon}</span>
                <span className={styles.districtName}>{district.name}</span>
              </div>
              <p className={styles.districtFlavor}>{district.flavor}</p>
              
              <div className={styles.healthBarWrap}>
                <div 
                  className={styles.healthBarFill} 
                  style={{ 
                    width: `${health}%`, 
                    ['--health-color' as any]: getHealthColor(health) 
                  }} 
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right' }}>
                Integridade: {health}%
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.projectsSection}>
        <h3 style={{ fontWeight: 800 }}>Projetos Táticos Disponíveis</h3>
        <div className={styles.projectGrid}>
          {projects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            const isAlreadyDone = state.activeProjects?.includes(project.id);
            const canAfford = project.cost <= state.totalBudget;

            return (
              <button
                key={project.id}
                className={`${styles.projectCard} ${isSelected ? styles.active : ''} ${(!canAfford || isAlreadyDone) ? styles.disabled : ''}`}
                onClick={() => handleProjectSelect(project.id)}
                disabled={isSimulating || isAlreadyDone}
              >
                <div className={styles.districtHeader}>
                  <span className={styles.projectIcon}>{project.icon}</span>
                  <span className={styles.projectLabel}>{project.label}</span>
                </div>
                <p className={styles.projectDesc}>{project.description}</p>
                <div className={styles.projectCost}>
                  {isAlreadyDone ? '✅ IMPLEMENTADO' : `Custo: ${project.cost} Cap.`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.hud}>
        <div className={styles.budgetHud}>
          <span className={styles.budgetLabel}>Capacidade Coletiva</span>
          <span className={styles.budgetValue}>{state.totalBudget}</span>
        </div>

        <Button
          variant={selectedProjectId ? 'primary' : 'disabled'}
          onClick={handleRunTurn}
          disabled={!selectedProjectId || isSimulating}
          style={{ minWidth: '200px' }}
        >
          {isSimulating ? 'Simulando...' : selectedProjectId ? 'Executar Decisão →' : 'Escolha um Projeto'}
        </Button>
      </div>
    </div>
  );
}
