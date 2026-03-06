/**
 * Utilitários para ler audit log operacional
 * Usado em scripts e /estado
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';

export interface AuditLogEntry {
  id: number;
  action_type: string;
  target_type: string;
  target_id: string;
  previous_value?: string;
  next_value?: string;
  actor_label: string;
  actor_source?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface AuditLogSummary {
  total: number;
  recent: AuditLogEntry[];
  byActionType: Record<string, number>;
  lastAction?: AuditLogEntry;
}

/**
 * Fetch audit log recente
 */
export async function fetchAuditLogRecent(limit = 50): Promise<AuditLogEntry[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('ops_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return null;
    }

    return data as AuditLogEntry[];
  } catch (err) {
    console.error('Failed to fetch audit log:', err);
    return null;
  }
}

/**
 * Fetch audit log por ação específica
 */
export async function fetchAuditLogByAction(
  actionType: string,
  limit = 20,
): Promise<AuditLogEntry[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('ops_audit_log')
      .select('*')
      .eq('action_type', actionType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return null;
    }

    return data as AuditLogEntry[];
  } catch (err) {
    console.error('Failed to fetch audit log by action:', err);
    return null;
  }
}

/**
 * Resumo do audit log
 */
export async function getAuditLogSummary(): Promise<AuditLogSummary | null> {
  const recent = await fetchAuditLogRecent(100);

  if (!recent) {
    return null;
  }

  const summary: AuditLogSummary = {
    total: recent.length,
    recent: recent.slice(0, 10),
    byActionType: {},
    lastAction: recent[0] || undefined,
  };

  // Contar por tipo de ação
  recent.forEach((entry) => {
    summary.byActionType[entry.action_type] =
      (summary.byActionType[entry.action_type] || 0) + 1;
  });

  return summary;
}
