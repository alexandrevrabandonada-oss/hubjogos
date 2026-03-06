#!/usr/bin/env node

/**
 * Seed Script para Tijolo 12 - Validação com Dados Reais
 * 
 * Popula Supabase com dados realísticos para validação de:
 * - Views analíticas
 * - Triagem de feedback
 * - Snapshots/exports
 * - /estado e /estado/feedback
 * 
 * Uso: node tools/seed-tijolo-12.js
 */

const fs = require('fs');
const path = require('path');

// ===== Environment Loading (same as beta-export.js) =====
function loadLocalEnv() {
  const candidates = ['.env.local', '.env'];
  for (const name of candidates) {
    const filePath = path.join(__dirname, '..', name);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadLocalEnv();

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Debug - Supabase URL length:', supabase_url?.length || 0);
console.log('Debug - Supabase Key length:', supabase_key?.length || 0);

if (!supabase_url || !supabase_key) {
  console.error('❌ Supabase not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabase_url);
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabase_key ? '(set, length: ' + supabase_key.length + ')' : '(not set)');
  process.exit(1);
}

// ===== Test Data Generation =====

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function generateAnonymousId() {
  return `anon_${Math.random().toString(36).slice(2, 15)}`;
}

const GAMES = [
  { slug: 'tijolo-01', title: 'Estado da Nação', engine: 'quiz' },
  { slug: 'tijolo-04', title: 'Ministério', engine: 'branching' },
  { slug: 'tijolo-05', title: 'Simulador Econômico', engine: 'simulation' },
  { slug: 'tijolo-06', title: 'Mapa Interativo', engine: 'map' },
];

const UTM_SOURCES = ['direto', 'google', 'facebook', 'twitter'];
const FEEDBACK_RATINGS = ['positive', 'neutral', 'negative'];
const FEEDBACK_COMMENTS = [
  'Excelente conteúdo! Muito educativo.',
  'Bacana, mas um pouco confuso no meio.',
  'Não gostei muito da experiência.',
  'Adorei! Fez-me pensar diferente.',
  'Meio chato, mas aprendi algo novo.',
  'Perfeito! Espero mais como este.',
  'Senti falta de mais contexto.',
  'Muito legal! Compartilhei com amigos.',
];

// Generate realistic sessions
function generateSessions() {
  const sessions = [];
  const baseFeedback = [];

  // 6 variações de sessões para validação completa
  for (let i = 0; i < 6; i++) {
    const game = GAMES[i % GAMES.length];
    const anonId = generateAnonymousId();
    const sessionId = generateId('sess');
    const utmSource = UTM_SOURCES[i % UTM_SOURCES.length];
    
    // Mix: algumas completas, algumas não
    const shouldComplete = i !== 2 && i !== 4; // Sessions 2 e 4 não completam
    const completedAt = shouldComplete ? new Date(Date.now() - Math.random() * 86400000).toISOString() : null;

    const session = {
      session_id: sessionId,
      anonymous_id: anonId,
      slug: game.slug,
      engine_kind: game.engine,
      engine_id: `eng_${game.engine}_${i}`,
      status: shouldComplete ? 'completed' : 'started',
      started_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      completed_at: completedAt,
      utm_source: utmSource,
      utm_medium: i % 2 === 0 ? 'organic' : 'referral',
      utm_campaign: `pce_2026_m${(i % 3) + 1}`,
      utm_content: `hero_${i % 2 === 0 ? 'image' : 'text'}`,
      referrer: i % 3 === 0 ? `https://example${i}.com` : null,
      initial_path: '/explorar',
      experiments: i > 3 ? JSON.stringify([{ key: 'ui_variant', variant: `v${(i % 2) + 1}` }]) : null,
    };

    sessions.push(session);

    // Gerar eventos para cada sessão
    const eventCount = Math.floor(Math.random() * 8) + 2; // 2-10 events
    for (let j = 0; j < eventCount; j++) {
      const event = {
        session_id: sessionId,
        anonymous_id: anonId,
        event_name: j === 0 ? 'game_start' : (j === eventCount - 1 && shouldComplete) ? (Math.random() > 0.5 ? 'result_copy' : 'link_copy') : 'page_navigation',
        slug: game.slug,
        engine_kind: game.engine,
        engine_id: `eng_${game.engine}_${i}`,
        step: j === 0 ? 'intro' : `step_${j}`,
        result_id: null,
        cta_id: null,
        metadata: j === 0 
          ? { screen: 'title', timestamp: Date.now() } 
          : j === eventCount - 1 && shouldComplete
            ? { action: 'shared' }
            : { screen: 'content', choice: j % 3 },
        experiments: i > 3 ? JSON.stringify([{ key: 'ui_variant', variant: `v${(i % 2) + 1}` }]) : null,
        created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      };
      sessions.push({
        _type: 'event',
        parent: i,
        data: event,
      });
    }

    // Resultado se completou
    if (shouldComplete) {
      sessions.push({
        _type: 'result',
        parent: i,
        data: {
          session_id: sessionId,
          anonymous_id: anonId,
          slug: game.slug,
          engine_kind: game.engine,
          engine_id: `eng_${game.engine}_${i}`,
          result_id: generateId('res'),
          result_title: `Resultado Descoberta ${i + 1}`,
          summary: `Você aprendeu que... ${i % 2 === 0 ? 'o sistema é mais complexo do que inicialmente pensava e múltiplas perspectivas enriquecem' : 'há diversas maneiras válidas de entender uma situação'}`,
          created_at: completedAt,
        },
      });
    }

    // Feedback (nem sempre, mix de ratings)
    if (Math.random() > 0.3) {
      const rating = FEEDBACK_RATINGS[Math.floor(Math.random() * FEEDBACK_RATINGS.length)];
      const hasComment = Math.random() > 0.4;
      
      baseFeedback.push({
        feedback_id: generateId('fb'),
        session_id: sessionId,
        anonymous_id: anonId,
        slug: game.slug,
        engine_kind: game.engine,
        rating,
        comment: hasComment ? FEEDBACK_COMMENTS[Math.floor(Math.random() * FEEDBACK_COMMENTS.length)] : null,
        triage_status: Math.random() > 0.7 ? 'reviewed' : 'pending',
        triaged_at: Math.random() > 0.7 ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      });
    }
  }

  return { sessions, baseFeedback };
}

// ===== API Calls =====
async function insertIntoSupabase(table, records) {
  const url = `${supabase_url}/rest/v1/${table}`;
  
  console.log(`📤 Posting to ${url}...`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabase_key,
        'Authorization': `Bearer ${supabase_key}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Failed to insert into ${table}:`, response.status, text);
      return false;
    }

    console.log(`✅ Inserted ${records.length} records into ${table}`);
    return true;
  } catch (err) {
    console.error(`❌ Error inserting into ${table}:`, err.message);
    return false;
  }
}

// ===== Main =====
async function main() {
  console.log('🌱 Seeding Supabase com dados para Tijolo 12 Validation...\n');

  const { sessions: allSessions, baseFeedback } = generateSessions();

  // Separate by type
  const gameSessions = [];
  const gameEvents = [];
  const gameResults = [];

  for (const item of allSessions) {
    if (item._type === 'event') {
      gameEvents.push(item.data);
    } else if (item._type === 'result') {
      gameResults.push(item.data);
    } else {
      gameSessions.push(item);
    }
  }

  console.log(`📊 Dados a ser insertados:`);
  console.log(`   - ${gameSessions.length} game_sessions`);
  console.log(`   - ${gameEvents.length} game_events`);
  console.log(`   - ${gameResults.length} game_results`);
  console.log(`   - ${baseFeedback.length} feedback_records\n`);

  // Insert in order
  const success = 
    await insertIntoSupabase('game_sessions', gameSessions) &&
    await insertIntoSupabase('game_events', gameEvents) &&
    await insertIntoSupabase('game_results', gameResults) &&
    await insertIntoSupabase('feedback_records', baseFeedback);

  if (success) {
    console.log('\n✨ Seed completo! Dados populados com sucesso em Supabase.');
    console.log('\n📱 Próximos passos:');
    console.log('   1. npm run beta:export');
    console.log('   2. npm run beta:snapshot -- --format=json');
    console.log('   3. Navegar para /estado');
    console.log('   4. Navegar para /estado/feedback');
  } else {
    console.error('\n❌ Seed falhou. Verifique logs acima.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
