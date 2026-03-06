/**
 * Cliente para rotas protegidas de operação
 * Usado no server-side apenas (não expor token ao cliente público)
 */

export interface OpsTriageResponse {
  success: boolean;
  data?: {
    feedbackId: string;
    previousStatus: string;
    newStatus: string;
    triagedAt: string;
  };
  audit?: {
    recorded: boolean;
    action_type: string;
  };
  error?: string;
}

/**
 * Chama rota protegida para triagem de feedback
 * Intendido para ser usado em server actions ou rotas (passa token via env)
 */
export async function updateFeedbackTriageViaOps(
  feedbackId: string,
  status: 'pending' | 'reviewed' | 'prioritario',
  token: string | undefined,
): Promise<OpsTriageResponse> {
  if (!token) {
    return {
      success: false,
      error: 'OPS_ADMIN_TOKEN not provided',
    };
  }

  try {
    const response = await fetch('/api/ops/feedback/triage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedbackId,
        status,
        token,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
      };
    }

    const data: OpsTriageResponse = await response.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: `Network error: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
}
