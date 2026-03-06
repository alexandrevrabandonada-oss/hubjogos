import { ImageResponse } from 'next/og';
import { getGameBySlug } from '@/lib/games/catalog';
import { resolveDefaultResultSummary, resolveGameResultById } from '@/lib/games/results';

export const runtime = 'edge';

const size = {
  width: 1200,
  height: 630,
};

function truncate(text: string, max = 220) {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1)}…`;
}

export async function GET(
  request: Request,
  { params }: { params: { game: string; result: string } }
) {
  const url = new URL(request.url);
  const titleOverride = url.searchParams.get('title') || undefined;
  const summaryOverride = url.searchParams.get('summary') || undefined;

  const headers = {
    'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate',
  };

  const game = getGameBySlug(params.game);
  const resolved = resolveGameResultById(params.game, params.result);

  const title = titleOverride || resolved?.title || 'Resultado da experiência';
  const summary = summaryOverride || resolved?.summary || resolveDefaultResultSummary(params.game);

  if (!game) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#111111',
            color: '#F7F4EB',
            padding: '56px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.85 }}>Hub de Jogos da Pré-Campanha</div>
          <div style={{ fontSize: 58, lineHeight: 1.1, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.85 }}>{truncate(summary)}</div>
        </div>
      ),
      { ...size, headers }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1D1C1A',
          color: '#F7F4EB',
          padding: '56px',
          border: `10px solid ${game.color}`,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 28, opacity: 0.9 }}>{game.title}</div>
          <div style={{ fontSize: 42 }}>{game.icon}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 58, lineHeight: 1.08, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.3, opacity: 0.92 }}>{truncate(summary)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 24,
              border: '2px solid #F7F4EB',
              borderRadius: 999,
              padding: '8px 20px',
            }}
          >
            Resultado compartilhável
          </div>
          <div style={{ fontSize: 26, opacity: 0.82 }}>hub-jogos.exemplo.com</div>
        </div>
      </div>
    ),
    { ...size, headers }
  );
}
