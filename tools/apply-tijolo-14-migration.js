/**
 * Script para aplicar migração de auditoria operacional (Tijolo 14)
 * 
 * Uso: node tools/apply-tijolo-14-migration.js
 * Requer .env.local com SUPABASE_URL e SUPABASE_SERVICE_KEY
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      '❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment',
    );
    process.exit(1);
  }

  // Parse PostgreSQL connection string from Supabase URL
  const url = new URL(supabaseUrl);
  const host = url.hostname;
  const port = 5432;
  const database = 'postgres';
  const user = 'postgres';
  const password = serviceKey;

  const client = new Client({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔐 Conectando ao Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso');

    const migrationPath = path.join(
      __dirname,
      '../supabase/tijolo-14-ops-audit.sql',
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('\n📝 Aplicando migração de auditoria operacional...');
    await client.query(migrationSQL);
    console.log('✅ Migração aplicada com sucesso');

    // Verificar se tabela foi criada
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ops_audit_log'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabela ops_audit_log verificada');
    } else {
      console.error('❌ Tabela ops_audit_log não foi criada');
      process.exit(1);
    }

    // Verificar se função foi criada
    const funcCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'log_ops_action' AND pronamespace = (
          SELECT oid FROM pg_namespace WHERE nspname = 'public'
        )
      );
    `);

    if (funcCheck.rows[0].exists) {
      console.log('✅ Função log_ops_action verificada');
    } else {
      console.error('❌ Função log_ops_action não foi criada');
      process.exit(1);
    }

    console.log('\n🎉 Tijolo 14 - Auditoria Operacional aplicada com sucesso!');
    console.log(
      '📝 Próximos passos:',
    );
    console.log('   1. Definir OPS_ADMIN_TOKEN em .env.local');
    console.log('   2. Refatorar /estado/feedback para usar rota protegida');
    console.log('   3. Adicionar audit log ao /estado');
  } catch (err) {
    console.error('❌ Erro aplicando migração:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
