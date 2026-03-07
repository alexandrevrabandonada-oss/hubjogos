import Image from 'next/image';
import styles from './CampaignAvatar.module.css';

type AvatarSize = 'small' | 'medium' | 'large' | 'hero';
type AvatarVariant = 'portrait' | 'icon' | 'busto';

interface CampaignAvatarProps {
  size?: AvatarSize;
  variant?: AvatarVariant;
  className?: string;
  alt?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  small: 48,
  medium: 80,
  large: 120,
  hero: 200,
};

export function CampaignAvatar({
  size = 'medium',
  variant = 'portrait',
  className,
  alt = 'Alexandre Fonseca',
}: CampaignAvatarProps) {
  const dimensions = SIZE_MAP[size];
  const classes = [styles.avatar, styles[size], styles[variant], className]
    .filter(Boolean)
    .join(' ');

  // Por enquanto usando o SVG base para todas as variantes
  // No futuro, quando variantes específicas forem criadas, usar switch/case
  const avatarSrc = '/campaign/avatar/base.svg';

  return (
    <div className={classes} role="img" aria-label={alt}>
      <Image
        src={avatarSrc}
        alt={alt}
        width={dimensions}
        height={dimensions}
        priority={size === 'hero'}
        className={styles.image}
      />
    </div>
  );
}
