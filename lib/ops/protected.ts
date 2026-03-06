/**
 * Operações protegidas por token
 * Camada leve de proteção operacional sem auth completa
 */

const OPS_TOKEN = process.env.OPS_ADMIN_TOKEN || process.env.NEXT_PUBLIC_OPS_ADMIN_TOKEN;

export interface OpsTokenValidation {
  valid: boolean;
  message?: string;
}

export interface FeedbackTriageOpsRequest {
  feedbackId: string;
  status: 'pending' | 'reviewed' | 'prioritario';
  token: string;
}

export interface OpsAuditEntry {
  action_type: string;
  target_type: string;
  target_id: string;
  previous_value?: string;
  next_value?: string;
  actor_label: string;
  actor_source?: string;
  metadata?: Record<string, any>;
}

/**
 * Valida token de operação
 * Retorna false se token está vazio ou inválido
 */
export function validateOpsToken(token: string): OpsTokenValidation {
  if (!OPS_TOKEN) {
    return {
      valid: false,
      message: 'Operations protection not configured (OPS_ADMIN_TOKEN missing)',
    };
  }

  if (!token) {
    return {
      valid: false,
      message: 'Token required',
    };
  }

  if (token.trim() !== OPS_TOKEN.trim()) {
    return {
      valid: false,
      message: 'Invalid token',
    };
  }

  return { valid: true };
}

/**
 * Verifica se operações protegidas estão habilitadas
 */
export function isOpsProtectionEnabled(): boolean {
  return !!OPS_TOKEN;
}

/**
 * Formata valor para log (limita tamanho)
 */
function formatValueForLog(value: any, maxLength = 500): string {
  if (!value) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (str.length > maxLength) return str.substring(0, maxLength) + '...';
  return str;
}

/**
 * Cria entrada de auditoria estruturada
 */
export function createAuditEntry(
  actionType: string,
  targetType: string,
  targetId: string,
  previousValue?: any,
  nextValue?: any,
  actorLabel?: string,
  metadata?: Record<string, any>,
): OpsAuditEntry {
  return {
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    previous_value: previousValue ? formatValueForLog(previousValue) : undefined,
    next_value: nextValue ? formatValueForLog(nextValue) : undefined,
    actor_label: actorLabel || 'unknown',
    actor_source: 'ops-api',
    metadata: metadata || {},
  };
}
