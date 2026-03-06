import { describe, expect, it } from 'vitest';
import {
  buildPlayMetadata,
  buildShareMetadata,
  getGameOgImageUrl,
  getResultOgImageUrl,
} from '@/lib/games/metadata';

function firstImage(metadata: ReturnType<typeof buildPlayMetadata>) {
  const images = metadata.openGraph?.images;
  if (!images) {
    return null;
  }
  return Array.isArray(images) ? images[0] : images;
}

describe('metadata builders', () => {
  it('gera metadata de jogo com imagem OG dinâmica', () => {
    const metadata = buildPlayMetadata('abandonado');
    const image = firstImage(metadata);

    expect(metadata.title).toContain('Abandonado');
    expect(image).toMatchObject({
      url: expect.stringContaining('/api/og/game/abandonado'),
      width: 1200,
      height: 630,
    });
  });

  it('gera metadata de share com fallback de título e imagem', () => {
    const metadata = buildShareMetadata({
      gameSlug: 'transporte-urgente',
      resultId: 'fim-exaustao',
    });
    const image = firstImage(metadata as ReturnType<typeof buildPlayMetadata>);

    expect(metadata.title).toContain('Transporte Urgente');
    expect(image).toMatchObject({
      url: expect.stringContaining('/api/og/result/transporte-urgente/fim-exaustao'),
    });
    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe('summary_large_image');
  });

  it('mantém URLs OG estáveis', () => {
    expect(getGameOgImageUrl('voto-consciente')).toContain('/api/og/game/voto-consciente');
    expect(getResultOgImageUrl('abandonado', 'abandono-sistemico')).toContain(
      '/api/og/result/abandonado/abandono-sistemico'
    );
  });
});
