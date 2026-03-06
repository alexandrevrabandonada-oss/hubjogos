const fs = require('fs');

function loadEnv() {
  const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i <= 0) continue;
    const key = trimmed.slice(0, i);
    const value = trimmed.slice(i + 1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase env missing');
  }

  const now = Date.now();
  const makeSession = (variant, idx, completed) => ({
    session_id: `sess_expfix_${variant}_${idx}_${now}`,
    anonymous_id: `anon_expfix_${idx}_${now}`,
    slug: 'tijolo-01',
    engine_kind: 'quiz',
    engine_id: 'eng_quiz_expfix',
    status: completed ? 'completed' : 'started',
    started_at: new Date(now - (idx + 1) * 60000).toISOString(),
    completed_at: completed ? new Date(now - idx * 30000).toISOString() : null,
    utm_source: 'experimento',
    experiments: [{ key: 'ui_variant', variant }],
  });

  const sessions = [
    makeSession('A', 1, true),
    makeSession('A', 2, false),
    makeSession('B', 1, true),
    makeSession('B', 2, true),
  ];

  const events = sessions.map((s, idx) => ({
    session_id: s.session_id,
    anonymous_id: s.anonymous_id,
    event_name: 'game_start',
    slug: s.slug,
    engine_kind: s.engine_kind,
    engine_id: s.engine_id,
    step: 'intro',
    result_id: null,
    cta_id: null,
    metadata: { seed: 'expfix', variant: s.experiments[0].variant, idx },
    experiments: s.experiments,
    created_at: new Date(now - idx * 15000).toISOString(),
  }));

  const headers = {
    'content-type': 'application/json',
    apikey: key,
    authorization: `Bearer ${key}`,
  };

  let res = await fetch(`${url}/rest/v1/game_sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(sessions),
  });
  console.log('sessions_status', res.status);
  if (!res.ok) console.log(await res.text());

  res = await fetch(`${url}/rest/v1/game_events`, {
    method: 'POST',
    headers,
    body: JSON.stringify(events),
  });
  console.log('events_status', res.status);
  if (!res.ok) console.log(await res.text());
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
