/**
 * Tijolo 18: Tipos para leitura de produção com janelas temporais
 */

export type TimeWindow = '24h' | '7d' | '30d' | 'all';

export type DataEnvironment = 'local' | 'remote-staging' | 'remote-production' | 'hybrid';

export interface DataOrigin {
  environment: DataEnvironment;
  window: TimeWindow;
  lastEventAt: Date | null;
  totalEvents: number;
  isStale: boolean;
}

export interface FreshnessSignal {
  hasRecentTraffic: boolean;
  lastEventAge: string | null;
  sampleSize: number;
  isMinimumViable: boolean;
  warnings: string[];
}

export interface WindowedMetrics {
  window: TimeWindow;
  startDate: Date | null;
  endDate: Date;
  totalEvents: number;
  uniqueSessions: number;
}

export function getWindowStartDate(window: TimeWindow, now: Date = new Date()): Date | null {
  switch (window) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return null;
  }
}

export function isEventInWindow(
  eventDate: Date | string,
  window: TimeWindow,
  now: Date = new Date()
): boolean {
  const windowStart = getWindowStartDate(window, now);
  if (!windowStart) return true; // 'all' window

  const eventTime = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  return eventTime >= windowStart;
}

export function formatTimeAgo(date: Date | null): string {
  if (!date) return 'nunca';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

export function determineEnvironment(source: string, hasRemoteData: boolean): DataEnvironment {
  if (source === 'local') return 'local';
  if (!hasRemoteData) return 'local';
  if (source === 'hybrid') return 'hybrid';
  
  // Heuristic: check if remote URL suggests staging
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (supabaseUrl.includes('staging') || supabaseUrl.includes('dev')) {
    return 'remote-staging';
  }
  
  return 'remote-production';
}
