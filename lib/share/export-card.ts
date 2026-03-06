/**
 * export-card.ts
 * Helper para exportar o share card como imagem PNG.
 * Funciona apenas no browser (client-side).
 */

export interface ExportCardOptions {
  filename?: string;
  scale?: number;
}

/**
 * Captura um elemento DOM e faz download como PNG.
 * Retorna `true` em sucesso, `false` em falha.
 */
export async function exportCardAsImage(
  element: HTMLElement,
  options: ExportCardOptions = {}
): Promise<boolean> {
  const { filename = 'resultado-hub-jogos.png', scale = 2 } = options;

  try {
    const { toPng } = await import('html-to-image');

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: scale,
      // garante que fontes e estilos sejam incluídos
      includeQueryParams: true,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    return true;
  } catch (error) {
    console.error('[exportCardAsImage] Falha ao exportar card:', error);
    return false;
  }
}

/**
 * Gera um nome de arquivo coerente com jogo e resultado.
 */
export function buildCardFilename(gameSlug: string, resultId: string): string {
  const slug = gameSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const result = resultId.slice(0, 8).replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `resultado-${slug}-${result}.png`;
}
