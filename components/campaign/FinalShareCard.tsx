import { CampaignAvatar } from './CampaignAvatar';
import { CampaignMark } from './CampaignMark';
import { GameQRCode } from './GameQRCode';
import type { Game } from '@/lib/games/catalog';
import styles from './FinalShareCard.module.css';

interface FinalShareCardProps {
  game: Game;
  resultTitle: string;
  resultSummary: string;
  resultId?: string;
  onDownload?: () => void;
  showAvatar?: boolean;
  showQR?: boolean;
  onQrClick?: () => void;
}

export function FinalShareCard({
  game,
  resultTitle,
  resultSummary,
  resultId,
  showAvatar = true,
  showQR = true,
  onQrClick,
}: FinalShareCardProps) {
  return (
    <div className={styles.card} data-result-id={resultId}>
      <div className={styles.header}>
        {showAvatar && (
          <div className={styles.avatarSection}>
            <CampaignAvatar size="large" expression="smile" />
          </div>
        )}
        <div className={styles.gameInfo}>
          <div className={styles.gameIcon}>{game.icon}</div>
          <h2 className={styles.gameTitle}>{game.title}</h2>
          <p className={styles.gameSubtitle}>{game.shortDescription}</p>
        </div>
      </div>

      <div className={styles.result}>
        <h3 className={styles.resultTitle}>{resultTitle}</h3>
        <p className={styles.resultSummary}>{resultSummary}</p>
      </div>

      <div className={styles.metadata}>
        <div className={styles.metaChips}>
          {game.series && (
            <span className={styles.chip}>
              <span className={styles.chipIcon}>🧱</span>
              {game.series.replace('serie-', '')}
            </span>
          )}
          {game.territoryScope && (
            <span className={styles.chip}>
              <span className={styles.chipIcon}>🗺</span>
              {game.territoryScope}
            </span>
          )}
          {game.pace && (
            <span className={styles.chip}>
              <span className={styles.chipIcon}>⚡</span>
              {game.pace}
            </span>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <CampaignMark compact />
          <p className={styles.cta}>Pre-campanha Alexandre Fonseca para Deputado Estadual RJ</p>
          <p className={styles.ctaSecondary}>
            {showQR
              ? 'Jogue, compare, compartilhe e reentre pelo QR'
              : 'Jogue, compare e compartilhe com quem vive essa realidade'}
          </p>
        </div>
        {showQR && (
          <div className={styles.footerQR}>
            <GameQRCode gameSlug={game.slug} resultId={resultId} size={100} onClick={onQrClick} includeLabel />
          </div>
        )}
      </div>

      {resultId && (
        <div className={styles.watermark}>
          #{resultId.slice(0, 8)}
        </div>
      )}
    </div>
  );
}
