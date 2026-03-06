import { ImageResponse } from 'next/og';
import { getGameBySlug } from '@/lib/games/catalog';

export const runtime = 'edge';

const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  void request;
  const game = getGameBySlug(params.slug);

  const headers = {
    'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate',
  };

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
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 700 }}>Jogo não encontrado</div>
          <div style={{ fontSize: 30, opacity: 0.8 }}>Explore outros jogos em /explorar</div>
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
          <div style={{ fontSize: 28, opacity: 0.9 }}>Hub de Jogos da Pré-Campanha</div>
          <div style={{ fontSize: 42 }}>{game.icon}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 64, lineHeight: 1.05, fontWeight: 700 }}>{game.title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.3, opacity: 0.92 }}>{game.shortDescription}</div>
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
            {game.kind}
          </div>
          <div style={{ fontSize: 26, opacity: 0.82 }}>Jogue e compartilhe sua leitura política</div>
        </div>
      </div>
    ),
    { ...size, headers }
  );
}
