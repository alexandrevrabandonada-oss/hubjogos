import Image from 'next/image';
import styles from './CampaignAvatar.module.css';

type AvatarSize = 'small' | 'medium' | 'large' | 'hero';
type AvatarVariant = 'portrait' | 'icon' | 'busto';
type AvatarExpression = 'neutral' | 'smile' | 'determined';
type AvatarGlasses = 'auto' | 'on' | 'off';

interface CampaignAvatarProps {
  size?: AvatarSize;
  variant?: AvatarVariant;
  expression?: AvatarExpression;
  glasses?: AvatarGlasses;
  fullBody?: boolean;
  className?: string;
  alt?: string;
  priority?: boolean;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  small: 48,
  medium: 80,
  large: 120,
  hero: 200,
};

/**
 * Resolve quale asset SVG usar baseado nos props
 * V2 assets prefere expressões diferentes
 * Fallback para v1 base.svg se necessário
 */
function resolveAvatarSrc(
  expression: AvatarExpression,
  glasses: AvatarGlasses
): string {
  // Se glasses=on, sempre usa portrait-glasses
  if (glasses === 'on') {
    return '/campaign/avatar/v2/portrait-glasses.svg';
  }

  // ResolveExpression (glasses=auto ou off)
  switch (expression) {
    case 'smile':
      return '/campaign/avatar/v2/portrait-smile.svg';
    case 'determined':
      return '/campaign/avatar/v2/portrait-determined.svg';
    case 'neutral':
    default:
      return '/campaign/avatar/v2/portrait-neutral.svg';
  }
}

export function CampaignAvatar({
  size = 'medium',
  variant = 'portrait',
  expression = 'neutral',
  glasses = 'auto',
  fullBody = false,
  className,
  alt = 'Alexandre Fonseca',
  priority = false,
}: CampaignAvatarProps) {
  const dimensions = SIZE_MAP[size];
  const classes = [styles.avatar, styles[size], styles[variant], className]
    .filter(Boolean)
    .join(' ');

  const avatarSrc = resolveAvatarSrc(expression, glasses);

  return (
    <div
      className={classes}
      role="img"
      data-full-body={fullBody ? 'true' : 'false'}
      aria-label={`${alt} - ${expression}${glasses === 'on' ? ' com óculos' : ''}`}
    >
      <Image
        src={avatarSrc}
        alt={alt}
        width={dimensions}
        height={dimensions}
        priority={priority || size === 'hero'}
        className={styles.image}
      />
    </div>
  );
}

