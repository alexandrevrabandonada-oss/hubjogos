// Production Tracker Hooks
// T73 — Game Production System

'use client';

import { useState, useCallback } from 'react';
import {
  GameProductionBlueprint,
  ProductionReadinessScore,
  VerticalSliceChecklist,
  AssetPipelineItem,
  ReleaseStatus,
  AssetStage,
  calculatePriorityScore,
  recommendTrack,
  generateRecommendation,
} from '@/lib/production/types';

// --- Hook: useProductionTracker ---

export interface UseProductionTrackerReturn {
  blueprints: GameProductionBlueprint[];
  addBlueprint: (blueprint: GameProductionBlueprint) => void;
  updateBlueprint: (id: string, updates: Partial<GameProductionBlueprint>) => void;
  removeBlueprint: (id: string) => void;
  getBlueprint: (id: string) => GameProductionBlueprint | undefined;
  prioritize: () => ProductionReadinessScore[];
}

export function useProductionTracker(
  initialBlueprints: GameProductionBlueprint[] = []
): UseProductionTrackerReturn {
  const [blueprints, setBlueprints] = useState<GameProductionBlueprint[]>(initialBlueprints);

  const addBlueprint = useCallback((blueprint: GameProductionBlueprint) => {
    setBlueprints(prev => [...prev, blueprint]);
  }, []);

  const updateBlueprint = useCallback((id: string, updates: Partial<GameProductionBlueprint>) => {
    setBlueprints(prev =>
      prev.map(bp => (bp.id === id ? { ...bp, ...updates } : bp))
    );
  }, []);

  const removeBlueprint = useCallback((id: string) => {
    setBlueprints(prev => prev.filter(bp => bp.id !== id));
  }, []);

  const getBlueprint = useCallback(
    (id: string) => blueprints.find(bp => bp.id === id),
    [blueprints]
  );

  const prioritize = useCallback((): ProductionReadinessScore[] => {
    const scored = blueprints.map(bp => {
      const score = calculatePriorityScore(bp);
      const track = recommendTrack(bp);
      const recommendation = generateRecommendation(score);

      return {
        blueprint: bp,
        scores: {
          strategicValue: score >= 70 ? 10 : score >= 50 ? 7 : 5,
          productionCost: bp.productionCost === 'low' ? 10 : bp.productionCost === 'medium' ? 6 : 3,
          assetComplexity: bp.assetNeeds.environments === 'minimal' ? 10 : bp.assetNeeds.environments === 'moderate' ? 6 : 3,
          gameplayDepth: bp.replayability === 'high' ? 10 : bp.replayability === 'some' ? 6 : 3,
          mobileDifficulty: 7,
          desktopQuality: 8,
          shareability: bp.shareabilityAngle ? 8 : 5,
          politicalClarity: bp.corePoliticalMessage.length > 50 ? 9 : 6,
          territoryStrength: bp.territorialSetting.length > 30 ? 8 : 5,
        },
        totalScore: score,
        recommendedTrack: track,
        priorityRank: 0,
        recommendation,
      };
    });

    // Sort by total score
    return scored
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({ ...item, priorityRank: index + 1 }));
  }, [blueprints]);

  return {
    blueprints,
    addBlueprint,
    updateBlueprint,
    removeBlueprint,
    getBlueprint,
    prioritize,
  };
}

// --- Hook: useVerticalSliceTracker ---

export interface UseVerticalSliceTrackerReturn {
  checklist: VerticalSliceChecklist;
  updateCheck: (key: keyof VerticalSliceChecklist, value: boolean) => void;
  progress: number;
  isComplete: boolean;
  missingRequirements: (keyof VerticalSliceChecklist)[];
}

export const INITIAL_CHECKLIST: VerticalSliceChecklist = {
  coreLoopPlayable: false,
  coreLoopFun: false,
  artDirectionBaseline: false,
  visualIdentityClear: false,
  territorialFeelPresent: false,
  soundBaseline: false,
  audioAppropriate: false,
  runtimeIntegrationComplete: false,
  entryPageComplete: false,
  resultLayerComplete: false,
  progressionIntegrationComplete: false,
  mobileViable: false,
  desktopViable: false,
  basicQAPass: false,
  performanceAcceptable: false,
  shareFlowUsable: false,
  designClarityAchieved: false,
  controlsStable: false,
  pacingAcceptable: false,
  framingPresent: false,
  noMajorUIBreaks: false,
  noIdentityDrift: false,
};

export const VERTICAL_SLICE_REQUIREMENTS: (keyof VerticalSliceChecklist)[] = [
  'coreLoopPlayable',
  'artDirectionBaseline',
  'runtimeIntegrationComplete',
  'entryPageComplete',
  'resultLayerComplete',
  'mobileViable',
  'desktopViable',
  'basicQAPass',
  'designClarityAchieved',
  'controlsStable',
  'noMajorUIBreaks',
];

export function useVerticalSliceTracker(
  initialChecklist: Partial<VerticalSliceChecklist> = {}
): UseVerticalSliceTrackerReturn {
  const [checklist, setChecklist] = useState<VerticalSliceChecklist>({
    ...INITIAL_CHECKLIST,
    ...initialChecklist,
  });

  const updateCheck = useCallback((key: keyof VerticalSliceChecklist, value: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  }, []);

  const totalItems = Object.keys(INITIAL_CHECKLIST).length;
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const progress = Math.round((completedItems / totalItems) * 100);

  const missingRequirements = VERTICAL_SLICE_REQUIREMENTS.filter(
    req => !checklist[req]
  );

  const isComplete = missingRequirements.length === 0;

  return {
    checklist,
    updateCheck,
    progress,
    isComplete,
    missingRequirements,
  };
}

// --- Hook: useAssetPipeline ---

export interface UseAssetPipelineReturn {
  assets: AssetPipelineItem[];
  addAsset: (asset: AssetPipelineItem) => void;
  updateAsset: (id: string, updates: Partial<AssetPipelineItem>) => void;
  updateStage: (id: string, stage: AssetStage) => void;
  approveAsset: (id: string) => void;
  getAssetsByType: (type: AssetPipelineItem['type']) => AssetPipelineItem[];
  getAssetsByStage: (stage: AssetStage) => AssetPipelineItem[];
  getOverallProgress: () => number;
}

export function useAssetPipeline(
  initialAssets: AssetPipelineItem[] = []
): UseAssetPipelineReturn {
  const [assets, setAssets] = useState<AssetPipelineItem[]>(initialAssets);

  const addAsset = useCallback((asset: AssetPipelineItem) => {
    setAssets(prev => [...prev, asset]);
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<AssetPipelineItem>) => {
    setAssets(prev =>
      prev.map(asset => (asset.id === id ? { ...asset, ...updates } : asset))
    );
  }, []);

  const updateStage = useCallback((id: string, stage: AssetStage) => {
    setAssets(prev =>
      prev.map(asset =>
        asset.id === id ? { ...asset, currentStage: stage } : asset
      )
    );
  }, []);

  const approveAsset = useCallback((id: string) => {
    setAssets(prev =>
      prev.map(asset => (asset.id === id ? { ...asset, approved: true } : asset))
    );
  }, []);

  const getAssetsByType = useCallback(
    (type: AssetPipelineItem['type']) => assets.filter(a => a.type === type),
    [assets]
  );

  const getAssetsByStage = useCallback(
    (stage: AssetStage) => assets.filter(a => a.currentStage === stage),
    [assets]
  );

  const getOverallProgress = useCallback(() => {
    if (assets.length === 0) return 0;
    
    const stageValues: Record<AssetStage, number> = {
      placeholder: 0,
      blockout: 0.25,
      style_baseline: 0.5,
      near_final: 0.75,
      production_final: 1,
    };

    const total = assets.reduce((sum, asset) => {
      const current = stageValues[asset.currentStage];
      const target = stageValues[asset.targetStage];
      return sum + (current / target);
    }, 0);

    return Math.round((total / assets.length) * 100);
  }, [assets]);

  return {
    assets,
    addAsset,
    updateAsset,
    updateStage,
    approveAsset,
    getAssetsByType,
    getAssetsByStage,
    getOverallProgress,
  };
}

// --- Hook: useReleaseStatusManager ---

export interface UseReleaseStatusManagerReturn {
  currentStatus: ReleaseStatus;
  statusHistory: { status: ReleaseStatus; date: number; note: string }[];
  transitionTo: (newStatus: ReleaseStatus, note?: string) => void;
  canTransitionTo: (targetStatus: ReleaseStatus) => boolean;
  timeInCurrentStatus: () => number;
}

export const STATUS_TRANSITIONS: Record<ReleaseStatus, ReleaseStatus[]> = {
  concept: ['pre_production', 'prototype'],
  pre_production: ['prototype', 'concept'],
  prototype: ['vertical_slice', 'pre_production', 'concept'],
  vertical_slice: ['beta', 'prototype', 'pre_production'],
  beta: ['release_candidate', 'vertical_slice'],
  release_candidate: ['live', 'beta'],
  live: ['maintenance', 'release_candidate'],
  maintenance: ['live'],
};

export function useReleaseStatusManager(
  initialStatus: ReleaseStatus = 'concept'
): UseReleaseStatusManagerReturn {
  const [currentStatus, setCurrentStatus] = useState<ReleaseStatus>(initialStatus);
  const [statusHistory, setStatusHistory] = useState<{ status: ReleaseStatus; date: number; note: string }[]>([
    { status: initialStatus, date: Date.now(), note: 'Initial status' },
  ]);

  const transitionTo = useCallback((newStatus: ReleaseStatus, note: string = '') => {
    if (!canTransitionToStatus(currentStatus, newStatus)) {
      console.warn(`Invalid transition from ${currentStatus} to ${newStatus}`);
      return;
    }

    setCurrentStatus(newStatus);
    setStatusHistory(prev => [...prev, { status: newStatus, date: Date.now(), note }]);
  }, [currentStatus]);

  const canTransitionTo = useCallback(
    (targetStatus: ReleaseStatus) => canTransitionToStatus(currentStatus, targetStatus),
    [currentStatus]
  );

  const timeInCurrentStatus = useCallback(() => {
    const lastTransition = statusHistory[statusHistory.length - 1];
    return Date.now() - lastTransition.date;
  }, [statusHistory]);

  return {
    currentStatus,
    statusHistory,
    transitionTo,
    canTransitionTo,
    timeInCurrentStatus,
  };
}

function canTransitionToStatus(from: ReleaseStatus, to: ReleaseStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}
