/**
 * Rota protegida para triagem de feedback
 * POST /api/ops/feedback/triage
 * 
 * Requer token OPS_ADMIN_TOKEN
 * Registra auditoria antes e depois
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOpsToken, createAuditEntry } from '@/lib/ops/protected';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface TriageRequest {
  feedbackId: string;
  status: 'pending' | 'reviewed' | 'prioritario';
  token?: string; // pode vir no body ou no header
}

async function recordAudit(action: {
  action_type: string;
  target_type: string;
  target_id: string;
  previous_value?: string;
  next_value?: string;
  actor_label: string;
  actor_source?: string;
  metadata?: Record<string, any>;
}) {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  try {
    await (supabase as any).rpc('log_ops_action', {
      p_action_type: action.action_type,
      p_target_type: action.target_type,
      p_target_id: action.target_id,
      p_previous_value: action.previous_value,
      p_next_value: action.next_value,
      p_actor_label: action.actor_label,
      p_actor_source: action.actor_source,
      p_metadata: JSON.stringify(action.metadata || {}),
    });
  } catch (err) {
    console.error('Failed to record audit:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TriageRequest = await request.json();

    const { feedbackId, status } = body;

    // Token pode vir no body ou no header x-ops-token
    let token = body.token || request.headers.get('x-ops-token');

    // Validar token
    const validation = validateOpsToken(token || '');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message || 'Invalid token' },
        { status: 401 },
      );
    }

    // Validar status
    if (!['pending', 'reviewed', 'prioritario'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 },
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 },
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client unavailable' },
        { status: 503 },
      );
    }

    // Buscar valor anterior para auditoria
    const { data: current } = await (supabase as any)
      .from('feedback_records')
      .select('triage_status')
      .eq('feedback_id', feedbackId)
      .single();

    const previousStatus = current?.triage_status || 'unknown';
    const triagedAt = new Date().toISOString();

    // Atualizar triagem
    const { error, data } = await (supabase as any)
      .from('feedback_records')
      .update({
        triage_status: status,
        triaged_at: triagedAt,
      })
      .eq('feedback_id', feedbackId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update triage' },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 },
      );
    }

    // Registrar auditoria
    const auditEntry = createAuditEntry(
      'feedback_triage',
      'feedback',
      feedbackId,
      previousStatus,
      status,
      'ops-admin',
      { method: 'api', route: '/api/ops/feedback/triage' },
    );

    await recordAudit(auditEntry);

    return NextResponse.json(
      {
        success: true,
        data: {
          feedbackId,
          previousStatus,
          newStatus: status,
          triagedAt,
        },
        audit: {
          recorded: true,
          action_type: auditEntry.action_type,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Ops API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
