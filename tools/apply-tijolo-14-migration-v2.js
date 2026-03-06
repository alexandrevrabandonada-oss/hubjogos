/**
 * Script para aplicar migração de auditoria operacional (Tijolo 14)
 * Versão 2: Usa DATABASE_URL diretamente (mais flexível)
 * 
 * Uso: node tools/apply-tijolo-14-migration-v2.js
 * Requer .env.local com DATABASE_URL (ou SUPABASE_URL + SUPABASE_SERVICE_KEY)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  // Carregar variáveis de .env.local se não estiverem em process.env
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

  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!databaseUrl && (!supabaseUrl || !serviceKey)) {
    console.error(
      '❌ Missing DATABASE_URL or (SUPABASE_URL + SUPABASE_SERVICE_KEY) in environment',
    );
    process.exit(1);
  }

  const connectionString = databaseUrl || 
    (() => {
      const url = new URL(supabaseUrl);
      const host = url.hostname;
      const port = 5432;
      const database = 'postgres';
      const user = 'postgres';
      const password = serviceKey;
      return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    })();

  const client = new Client({
    connectionString,
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

    // Verificar count de tabelas
    const countCheck = await client.query(`
      SELECT COUNT(*) as existing_count FROM public.ops_audit_log;
    `);
    const existingCount = countCheck.rows[0].existing_count;
    console.log(`✅ Tabela ops_audit_log tem ${existingCount} registros existentes`);

    console.log('\n🎉 Tijolo 14 - Auditoria Operacional aplicada com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('   1. Definir OPS_ADMIN_TOKEN em .env.local');
    console.log('   2. Testar fluxo de triagem protegida em /estado/feedback');
    console.log('   3. Verificar audit log com npm run beta:ops');
  } catch (err) {
    console.error('❌ Erro aplicando migração:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
