'use client';

import { useEffect, useState } from 'react';
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

const DISTRICT_CONNECTIONS = [
  {
    id: 'norte-centro',
    districts: ['vila-popular', 'centro-velho'],
    style: { top: '23%', left: '38%', width: '22%', transform: 'rotate(8deg)' },
  },
  {
    id: 'norte-porto',
    districts: ['vila-popular', 'polo-industrial'],
    style: { top: '44%', left: '22%', width: '18%', transform: 'rotate(58deg)' },
  },
  {
    id: 'centro-sul',
    districts: ['centro-velho', 'parque-das-aguas'],
    style: { top: '44%', left: '62%', width: '16%', transform: 'rotate(112deg)' },
  },
  {
    id: 'porto-sul',
    districts: ['polo-industrial', 'parque-das-aguas'],
    style: { top: '71%', left: '43%', width: '22%', transform: 'rotate(-8deg)' },
  },
] as const;

interface UrbanSimEngineProps {
  definition: SimulationDefinition;
  state: SimulationState;
  onStateChange: (newState: SimulationState) => void;
}

export function UrbanSimEngine({ definition, state, onStateChange }: UrbanSimEngineProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [lastImprovedDistrictIds, setLastImprovedDistrictIds] = useState<string[]>([]);
  const [interventionFlashIds, setInterventionFlashIds] = useState<string[]>([]);

  const nextPressure = getNextPressure(state, definition);
  const districts = definition.districts || [];
  const projects = definition.projects || [];
  const averageHealth = districts.length
    ? Math.round(
        districts.reduce((sum, district) => sum + (state.districtHealth?.[district.id] ?? district.initialHealth), 0) /
          districts.length
      )
    : 0;
  const criticalDistrictIds = districts
    .filter((district) => (state.districtHealth?.[district.id] ?? district.initialHealth) < 40)
    .map((district) => district.id);
  const previewProjectId = hoveredProjectId || selectedProjectId;
  const previewDistrictIds = previewProjectId
    ? [
        ...new Set(
          (projects.find((project) => project.id === previewProjectId)?.impacts || [])
            .map((impact) => impact.targetDistrictId)
            .filter((impact): impact is string => Boolean(impact))
        ),
      ]
    : [];
  const focusedDistrict = districts.find((district) => district.id === selectedDistrictId) || null;

  // Mostrar crise quando ela muda (exceto no início se já mostrado pelo Motor intro)
  useEffect(() => {
    if (nextPressure && state.step > 0) {
      setShowCrisis(true);
    }
  }, [state.step, nextPressure]);

  const handleProjectSelect = (projectId: string) => {
    if (state.activeProjects?.includes(projectId)) return;
    
    const project = projects.find(p => p.id === projectId);
    if (project && project.cost <= state.totalBudget) {
      setSelectedProjectId(projectId === selectedProjectId ? null : projectId);
      setHoveredProjectId(projectId);
    }
  };

  const handleDistrictFocus = (districtId: string) => {
    setSelectedDistrictId((current) => (current === districtId ? null : districtId));
  };

  const handleRunTurn = () => {
    if (!selectedProjectId) return;

    setIsSimulating(true);
    const project = projects.find(p => p.id === selectedProjectId);
    const improvedIds = project?.impacts
      .filter(i => i.targetDistrictId)
      .map(i => i.targetDistrictId!) || [];
    
    setLastImprovedDistrictIds(improvedIds);
    setInterventionFlashIds(improvedIds);

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
      setHoveredProjectId(null);
      setIsSimulating(false);
      
      // Limpa destaques após um tempo
      setTimeout(() => setLastImprovedDistrictIds([]), 2000);
      setTimeout(() => setInterventionFlashIds([]), 1800);
    }, 1200);
  };

  const getHealthColor = (health: number) => {
    if (health > 70) return '#10b981'; // green-500
    if (health > 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getDistrictClass = (id: string) => {
    switch(id) {
      case 'vila-popular': return styles.district_zona_norte;
      case 'centro-velho': return styles.district_centro;
      case 'polo-industrial': return styles.district_porto;
      case 'parque-das-aguas': return styles.district_zona_sul;
      default: return '';
    }
  };

  const getDistrictStage = (health: number) => {
    if (health >= 78) return 'Prosperando';
    if (health >= 58) return 'Estável';
    if (health >= 40) return 'Sob pressão';
    if (health >= 22) return 'Crítico';
    return 'Quase colapso';
  };

  const getDistrictNeedCopy = (districtId: string) => {
    const district = districts.find((item) => item.id === districtId);
    if (!district) return 'Sem leitura territorial';

    const urgencyLabels: Record<string, string> = {
      saude: 'Saúde em alerta',
      educacao: 'Rede educacional pressionada',
      transporte: 'Fluxo urbano travado',
      moradia: 'Moradia em disputa',
      manutencao: 'Infraestrutura desgastada',
    };

    return urgencyLabels[district.needs[0]] || 'Pressão territorial';
  };

  const getProjectTargetDistrictIds = (projectId: string) => {
    return [
      ...new Set(
        (projects.find((project) => project.id === projectId)?.impacts || [])
          .map((impact) => impact.targetDistrictId)
          .filter((impact): impact is string => Boolean(impact))
      ),
    ];
  };

  return (
    <div className={styles.urbanWrap}>
      <div className={styles.ambientLayer} />

      {showCrisis && nextPressure && (
        <div className={styles.crisisBanner}>
          <h3 className={styles.crisisTitle}>⚠️ URGENTE: {nextPressure.title}</h3>
          <p className={styles.crisisDesc}>{nextPressure.description}</p>
          <Button 
            variant="primary" 
            onClick={() => setShowCrisis(false)}
            style={{ padding: '0.8rem 2rem' }}
          >
            Assumir Comando →
          </Button>
        </div>
      )}

      <div
        className={`${styles.mapView} ${averageHealth < 45 ? styles.mapUnderStress : ''} ${averageHealth < 28 ? styles.mapNearCollapse : ''} ${isSimulating ? styles.mapIntervening : ''}`}
      >
        <div className={styles.cityPulseHalo} />
        <div className={styles.cityScanlines} />
        <div className={styles.civicCore}>
          <span className={styles.civicCoreLabel}>Núcleo Urbano</span>
          <strong>{averageHealth}%</strong>
        </div>

        {/* Ambient Transit Pulses */}
        <div className={styles.transitLine} style={{ top: '30%', left: '-10%', transform: 'rotate(-5deg)' }} />
        <div className={styles.transitLine} style={{ top: '70%', left: '-20%', animationDelay: '3s', transform: 'rotate(5deg)' }} />
        <div className={styles.transitLine} style={{ top: '50%', right: '-10%', animationDelay: '6s', transform: 'rotate(180deg)' }} />

        {DISTRICT_CONNECTIONS.map((connection, index) => {
          const linkedCritical = connection.districts.some((districtId) => criticalDistrictIds.includes(districtId));

          return (
            <div
              key={connection.id}
              className={`${styles.connectionLine} ${linkedCritical ? styles.connectionLineCritical : ''}`}
              style={{
                ...connection.style,
                animationDelay: `${index * 1.2}s`,
              }}
            />
          );
        })}

        {districts.map((district) => {
          const health = state.districtHealth?.[district.id] ?? district.initialHealth;
          const isCritical = health < 40;
          const isRecentlyImproved = lastImprovedDistrictIds.includes(district.id);
          const isPreviewed = previewDistrictIds.includes(district.id);
          const isFocused = selectedDistrictId === district.id;
          const isInterventionFlash = interventionFlashIds.includes(district.id);
          const districtProjectIcons = (state.activeProjects || [])
            .map((projectId) => projects.find((project) => project.id === projectId))
            .filter((project): project is NonNullable<(typeof projects)[number]> =>
              project !== undefined && project !== null
            )
            .filter((project) =>
              project.impacts.some((impact) => impact.targetDistrictId === district.id)
            )
            .slice(0, 3);
          
          // Crisis specific overlays
          const isFloodCrisis = nextPressure?.demandCategory === 'saude' && district.id === 'vila-popular';
          const isProtestCrisis = nextPressure?.demandCategory === 'moradia' && district.id === 'centro-velho';

          return (
            <div 
              key={district.id} 
              className={`${styles.districtArea} ${getDistrictClass(district.id)} ${isCritical ? styles.districtCritical : ''} ${isRecentlyImproved ? styles.districtRecovering : ''} ${isPreviewed ? styles.districtPreviewed : ''} ${isFocused ? styles.districtFocused : ''} ${health >= 78 ? styles.districtProsperous : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => handleDistrictFocus(district.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleDistrictFocus(district.id);
                }
              }}
            >
              <div className={styles.districtTerrain} />
              <div className={styles.districtGlow} />
              {isFloodCrisis && <div className={styles.floodOverlay} />}
              {isProtestCrisis && <div className={styles.protestOverlay} />}
              {isInterventionFlash && <div className={styles.impactPulse} />}

              <div className={styles.skylineStrip} aria-hidden>
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={`${district.id}-block-${index}`}
                    className={`${styles.cityBlock} ${health < 40 && index % 2 === 0 ? styles.cityBlockCritical : ''} ${health >= 78 && index < 3 ? styles.cityBlockHealthy : ''}`}
                    style={{ height: `${28 + ((index * 9) % 36)}px` }}
                  />
                ))}
              </div>

              {isFocused && <span className={styles.focusBadge}>Distrito em foco</span>}

              <div className={styles.districtHeader}>
                <span className={styles.districtIcon}>{district.icon}</span>
                <span className={styles.districtName}>{district.name}</span>
              </div>
              <p className={styles.districtFlavor}>{district.flavor}</p>
              <p className={styles.districtSignal}>{getDistrictNeedCopy(district.id)}</p>
              
              <div className={styles.healthBarWrap}>
                <div 
                  className={styles.healthBarFill} 
                  style={{ 
                    width: `${health}%`, 
                    ['--health-color' as any]: getHealthColor(health) 
                  }} 
                />
              </div>
              <div className={styles.integrityText} style={{ marginTop: '0.25rem' }}>{Math.round(health)}%</div>
              <div className={styles.districtFooter}>
                <span className={styles.districtStage}>{getDistrictStage(health)}</span>
                <div className={styles.projectMarkers}>
                  {districtProjectIcons.map((project) => (
                    <span key={`${district.id}-${project.id}`} className={styles.projectMarker} title={project.label}>
                      {project.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.projectsSection}>
        <h3 style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem', color: '#64748b' }}>
          Gabinete de Intervenção
        </h3>
        <div className={styles.focusSummary}>
          <div>
            <strong>{focusedDistrict ? focusedDistrict.name : 'Cidade inteira'}</strong>
            <span>{focusedDistrict ? ' em leitura prioritária para o próximo ciclo.' : ' Selecione um distrito no mapa para rastrear impacto e priorizar ação.'}</span>
          </div>
          <div className={styles.focusSummaryMeta}>
            <span>{criticalDistrictIds.length} distritos críticos</span>
            <span>Confiança pública {state.politicalTrust ?? 50}%</span>
          </div>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            const isAlreadyDone = state.activeProjects?.includes(project.id);
            const canAfford = project.cost <= state.totalBudget;
            const targetDistrictIds = getProjectTargetDistrictIds(project.id);
            const supportsFocusedDistrict = selectedDistrictId ? targetDistrictIds.includes(selectedDistrictId) : false;

            return (
              <button
                key={project.id}
                className={`${styles.projectCard} ${isSelected ? styles.active : ''} ${(!canAfford || isAlreadyDone) ? styles.disabled : ''} ${supportsFocusedDistrict ? styles.projectSupportsFocus : ''} ${selectedDistrictId && !supportsFocusedDistrict ? styles.projectMutedByFocus : ''}`}
                onClick={() => handleProjectSelect(project.id)}
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId((current) => (current === project.id ? null : current))}
                disabled={isSimulating || isAlreadyDone}
              >
                <div className={styles.districtHeader}>
                  <span className={styles.projectIcon}>{project.icon}</span>
                  <span className={styles.projectLabel}>{project.label}</span>
                </div>
                <p className={styles.projectDesc}>{project.description}</p>
                <div className={styles.projectTargets}>
                  {targetDistrictIds.map((districtId) => {
                    const targetDistrict = districts.find((district) => district.id === districtId);
                    if (!targetDistrict) return null;

                    return (
                      <span key={`${project.id}-${districtId}`} className={styles.projectTargetChip}>
                        {targetDistrict.icon} {targetDistrict.name}
                      </span>
                    );
                  })}
                </div>
                <div className={styles.projectCost}>
                  {isAlreadyDone ? '✅ Ação Concluída' : (
                    <>
                      <span style={{ color: '#94a3b8' }}>Custo:</span> {project.cost} CAP.
                    </>
                  )}
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
          style={{ minWidth: '240px', fontWeight: 900 }}
        >
          {isSimulating ? 'Impactando Território...' : selectedProjectId ? 'EXECUTAR DECISÃO →' : 'SELECIONE UMA AÇÃO'}
        </Button>
      </div>
    </div>
  );
}
