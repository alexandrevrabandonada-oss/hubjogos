/**
 * Engine de mapa
 * Lógica pura de exploração territorial e descoberta de padrões
 */

import { calculateMapResult, MapDefinition, MapPoint, MapState } from './types';

export function createInitialMapState(definition: MapDefinition): MapState {
  const pointsMap: Record<string, MapPoint> = {};
  definition.points.forEach((p) => {
    pointsMap[p.id] = { ...p, discovered: false };
  });

  return {
    points: pointsMap,
    visitedPoints: [],
    currentPointId: null,
    explorationComplete: false,
    finalResult: null,
  };
}

export function visitPoint(state: MapState, pointId: string): MapState {
  if (!state.points[pointId]) {
    return state;
  }

  const alreadyVisited = state.visitedPoints.includes(pointId);

  return {
    ...state,
    points: {
      ...state.points,
      [pointId]: {
        ...state.points[pointId],
        discovered: true,
      },
    },
    visitedPoints: alreadyVisited ? state.visitedPoints : [...state.visitedPoints, pointId],
    currentPointId: pointId,
  };
}

export function canComplete(state: MapState, minPoints: number): boolean {
  return state.visitedPoints.length >= minPoints;
}

export function completeExploration(
  state: MapState,
  definition: MapDefinition
): MapState {
  const result = calculateMapResult(definition, state.visitedPoints);

  return {
    ...state,
    explorationComplete: true,
    finalResult: result,
  };
}

export function getVisitedCount(state: MapState): number {
  return state.visitedPoints.length;
}

export function getTotalPoints(definition: MapDefinition): number {
  return definition.points.length;
}

export function getProgressPercent(state: MapState, definition: MapDefinition): number {
  const visited = state.visitedPoints.length;
  const total = definition.points.length;
  return Math.round((visited / total) * 100);
}

export function getPointsByRegion(
  definition: MapDefinition,
  regionId: string
): MapPoint[] {
  return definition.points.filter((p) => p.region === regionId);
}
