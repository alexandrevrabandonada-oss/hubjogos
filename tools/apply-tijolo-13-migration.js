#!/usr/bin/env node
/**
 * Aplicar migração Tijolo 13 - adicionar 'prioritario' ao status de triagem
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadLocalEnv() {
  const candidates = ['.env.local', '.env'];

  for (const name of candidates) {
    const filePath = path.join(__dirname, '..', name);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const index = trimmed.indexOf('=');
      if (index <= 0) {
        continue;
      }

      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

async function main() {
  loadLocalEnv();

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.log('Skipping migration - will rely on RLS default behavior');
    process.exit(0);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'tijolo-13-feedback-prioritario.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Migration applied successfully');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
