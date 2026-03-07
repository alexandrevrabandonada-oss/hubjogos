import { QRCodeCanvas } from 'qrcode.react';
import styles from './GameQRCode.module.css';

interface GameQRCodeProps {
  gameSlug: string;
  resultId?: string;
  size?: number;
  level?: 'L' | 'M' | 'H' | 'Q';
  includeLabel?: boolean;
  onClick?: () => void;
}

/**
 * Componente QR code para card final
 * 
 * O QR aponta para a share page do resultado
 * ou para a página de jogo para reentrada
 */
export function GameQRCode({
  gameSlug,
  resultId,
  size = 120,
  level = 'H',
  includeLabel = false,
  onClick,
}: GameQRCodeProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub-jogos-pre-campanha.vercel.app';
  const targetPath = resultId ? `/share/${gameSlug}/${resultId}` : `/play/${gameSlug}`;
  const qrValue = `${baseUrl}${targetPath}`;

  return (
    <div className={`${styles.container}`}>
      <button type="button" className={styles.qrButton} onClick={onClick} aria-label="Abrir link do QR">
        <QRCodeCanvas
          value={qrValue}
          size={size}
          level={level}
          includeMargin={true}
          className={styles.qr}
          title="QR code para abrir o jogo"
          aria-label="QR code para abrir o jogo"
        />
      </button>
      {includeLabel && (
        <p className={styles.label}>Escaneie para jogar</p>
      )}
    </div>
  );
}
