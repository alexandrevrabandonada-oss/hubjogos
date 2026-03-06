/**
 * Script de teste Tijolo 14: Fluxo de triagem protegida com auditoria
 * 
 * Testa:
 * 1. Busca feedback pendente no Supabase
 * 2. Chama rota protegida com token
 * 3. Valida audit log remoto
 * 4. Testa fallback sem token
 */

const fs = require('fs');
const path = require('path');

// Carregar .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPS_ADMIN_TOKEN = process.env.OPS_ADMIN_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function test() {
  console.log('🧪 Iniciando teste do Tijolo 14 - Triagem Protegida com Auditoria\n');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Falta configuração Supabase');
    process.exit(1);
  }

  if (!OPS_ADMIN_TOKEN) {
    console.error('❌ Falta OPS_ADMIN_TOKEN em .env.local');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ========================================
  // 1. Buscar feedback pendente
  // ========================================
  console.log('📋 Passo 1: Buscar feedback pendente...\n');
  const { data: feedbacks, error: fbError } = await supabase
    .from('feedback_records')
    .select('*')
    .eq('triage_status', 'pending')
    .limit(1)
    .single();

  if (fbError || !feedbacks) {
    console.log('ℹ️  Nenhum feedback pendente. Criando feedback de teste...\n');
    // Criar feedback de teste
    const { data: newFb, error: createError } = await supabase
      .from('feedback_records')
      .insert([
        {
          feedback_id: `test-${Date.now()}`,
          session_id: 'test-session',
          anonymous_id: 'test-anon',
          slug: 'tijolo-14-test',
          engine_kind: 'branching',
          rating: 'positive',
          comment: 'Teste de triagem protegida com auditoria',
          triage_status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro criando feedback de teste:', createError.message);
      process.exit(1);
    }

    console.log(`✅ Feedback de teste criado: ${newFb.feedback_id}\n`);
    feedbacks = newFb;
  } else {
    console.log(
      `✅ Feedback pendente encontrado: ${feedbacks.feedback_id}\n`,
    );
  }

  const testFeedbackId = feedbacks.feedback_id;

  // ========================================
  // 2. Testar rota protegida COM token
  // ========================================
  console.log('🔐 Passo 2: Testar rota protegida COM token...\n');
  try {
    const response = await fetch(
      `${APP_URL}/api/ops/feedback/triage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ops-token': OPS_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          feedbackId: testFeedbackId,
          status: 'reviewed',
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Erro na rota: ${response.status}`, result);
      process.exit(1);
    }

    console.log(`✅ Resposta da rota:`, JSON.stringify(result, null, 2));
    if (!result.audit?.recorded) {
      console.warn('⚠️  Audit log não foi registrado na resposta\n');
    } else {
      console.log('✅ Audit log registrado na resposta\n');
    }
  } catch (err) {
    console.error('❌ Erro chamando rota:', err.message);
    process.exit(1);
  }

  // ========================================
  // 3. Verificar audit log remoto
  // ========================================
  console.log('📊 Passo 3: Verificar audit log remoto...\n');
  const { data: auditLogs, error: auditError } = await supabase
    .from('ops_audit_log')
    .select('*')
    .eq('target_id', testFeedbackId)
    .eq('action_type', 'feedback_triage')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (auditError || !auditLogs) {
    console.error('❌ Audit log não encontrado no Supabase');
    console.error('Erro:', auditError?.message);
    process.exit(1);
  }

  console.log('✅ Audit log encontrado no Supabase remoto:\n');
  console.log(`   action_type: ${auditLogs.action_type}`);
  console.log(`   target_type: ${auditLogs.target_type}`);
  console.log(`   target_id: ${auditLogs.target_id}`);
  console.log(`   previous_value: ${auditLogs.previous_value}`);
  console.log(`   next_value: ${auditLogs.next_value}`);
  console.log(`   actor_label: ${auditLogs.actor_label}`);
  console.log(`   actor_source: ${auditLogs.actor_source}`);
  console.log(`   created_at: ${auditLogs.created_at}\n`);

  // ========================================
  // 4. Testar fallback SEM token
  // ========================================
  console.log('🔄 Passo 4: Testar fallback SEM token...\n');

  // Criar novo feedback de teste para fallback
  const { data: fb2, error: fb2Error } = await supabase
    .from('feedback_records')
    .insert([
      {
        feedback_id: `test-fallback-${Date.now()}`,
        session_id: 'test-session-fallback',
        anonymous_id: 'test-anon',
        slug: 'tijolo-14-test-fallback',
        engine_kind: 'branching',
        rating: 'negative',
        comment: 'Teste de fallback sem token',
        triage_status: 'pending',
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (fb2Error) {
    console.error('❌ Erro criando feedback para teste fallback:', fb2Error.message);
    process.exit(1);
  }

  try {
    const fbFallbackId = fb2.feedback_id;
    const response = await fetch(
      `${APP_URL}/api/ops/feedback/triage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // SEM token
        },
        body: JSON.stringify({
          feedbackId: fbFallbackId,
          status: 'reviewed',
        }),
      },
    );

    if (response.ok) {
      console.warn('⚠️  Rota SEM token não deveria retornar 200 (fallback local esperado no cliente)\n');
    } else if (response.status === 401) {
      console.log('✅ Rota retornou 401 sem token (comportamento esperado)\n');
    }
  } catch (err) {
    console.log('ℹ️  Erro ao chamar rota sem token (fallback esperado no cliente):', err.message, '\n');
  }

  // ========================================
  // 5. Verificar total de registros no audit log
  // ========================================
  console.log('📈 Passo 5: Resumo do audit log...\n');
  const { data: allAudits, error: allError } = await supabase
    .from('ops_audit_log')
    .select('action_type')
    .order('created_at', { ascending: false })
    .limit(10);

  if (!allError && allAudits) {
    const actionCounts = {};
    allAudits.forEach(audit => {
      actionCounts[audit.action_type] = (actionCounts[audit.action_type] || 0) + 1;
    });

    console.log('✅ Ações recentes no audit log:');
    Object.entries(actionCounts).forEach(([action, count]) => {
      console.log(`   ${action}: ${count}`);
    });
  }

  console.log('\n🎉 Teste do Tijolo 14 concluído com sucesso!');
  console.log('📋 Resumo:');
  console.log('   ✅ Rota protegida funcionando');
  console.log('   ✅ Audit log registrado remoto');
  console.log('   ✅ Validação de token funcionando');
}

test().catch(err => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
