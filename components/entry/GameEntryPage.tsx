'use client';

// Game Entry Page Template
// T70 — Premium Pre-Play Layer
// Unified entry-page template supporting all game genres

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Game, GameGenre, GAME_GENRE_LABELS, GAME_PACE_LABELS, TERRITORY_SCOPE_LABELS, POLITICAL_THEME_LABELS } from '@/lib/games/catalog';
import { trackEntryPageView, trackEntryPrimaryPlayClick } from '@/lib/hub/analytics';
import { ProgressionBadge } from '@/components/hub/ProgressionBadge';
import styles from './GameEntryPage.module.css';

// --- Types ---

export interface GameEntryPageProps {
  game: Game;
  heroMedia?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  relatedGames?: Game[];
  whyItMatters?: WhyItMattersContent;
  howItWorks?: HowItWorksContent;
  shareData?: {
    title: string;
    description: string;
    url: string;
  };
}

export interface WhyItMattersContent {
  struggle: string;
  relevance: string;
  invitation: string;
}

export interface HowItWorksContent {
  mechanics: string[];
  controls?: string;
  objectives?: string;
  screenshots?: { src: string; alt: string }[];
  beforeYouPlay?: string[];
}

export interface TrustIndicator {
  icon: string;
  label: string;
  value: string;
}

// --- Main Entry Page Component ---

export function GameEntryPage({
  game,
  heroMedia,
  secondaryCta,
  relatedGames,
  whyItMatters,
  howItWorks,
  shareData,
}: GameEntryPageProps) {
  // Track page view on mount
  useEffect(() => {
    trackEntryPageView(game);
  }, [game]);

  const handlePlayClick = () => {
    trackEntryPrimaryPlayClick(game);
  };

  return (
    <article className={styles.entryPage} data-game-slug={game.slug}>
      {/* Premium Top Section */}
      <HeroSection
        game={game}
        media={heroMedia}
        onPlayClick={handlePlayClick}
        secondaryCta={secondaryCta}
      />

      {/* Trust / Expectation Row */}
      <TrustRow game={game} />

      {/* Why It Matters */}
      {whyItMatters && (
        <WhyItMattersSection content={whyItMatters} themes={game.politicalThemes} />
      )}

      {/* Genre-Aware Onboarding */}
      <GenreOnboarding genre={game.genre} />

      {/* How It Works (for richer games) */}
      {howItWorks && <HowItWorksSection content={howItWorks} />}

      {/* Related Discovery */}
      {relatedGames && relatedGames.length > 0 && (
        <RelatedDiscoverySection
          game={game}
          relatedGames={relatedGames}
        />
      )}

      {/* Share Readiness */}
      {shareData && <ShareSection data={shareData} game={game} />}

      {/* Back Navigation */}
      <BackSection />
    </article>
  );
}

// --- Hero Section (Premium Above-the-Fold) ---

interface HeroSectionProps {
  game: Game;
  media?: GameEntryPageProps['heroMedia'];
  onPlayClick: () => void;
  secondaryCta?: GameEntryPageProps['secondaryCta'];
}

function HeroSection({ game, media, onPlayClick, secondaryCta }: HeroSectionProps) {
  return (
    <section className={styles.heroSection}>
      {/* Visual Media Area */}
      <div className={styles.mediaContainer}>
        {media?.type === 'image' ? (
          <Image
            src={media.src}
            alt={media.alt || `${game.title} cover`}
            fill
            className={styles.heroImage}
            priority
          />
        ) : media?.type === 'video' ? (
          <video
            src={media.src}
            className={styles.heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className={styles.heroPlaceholder} style={{ backgroundColor: game.color }}>
            <span className={styles.heroIcon}>{game.icon}</span>
          </div>
        )}
        <div className={styles.mediaOverlay} />
      </div>

      {/* Content Overlay */}
      <div className={styles.heroContent}>
        {/* Title + Premise */}
        <div className={styles.titleGroup}>
          <ProgressionBadge type="novo" />
          <h1 className={styles.gameTitle}>{game.title}</h1>
          <p className={styles.gamePremise}>{game.shortDescription}</p>
        </div>

        {/* Quick Metadata Row */}
        <div className={styles.quickMeta}>
          <span className={styles.metaItem}>{GAME_GENRE_LABELS[game.genre]}</span>
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaItem}>{GAME_PACE_LABELS[game.pace]}</span>
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaItem}>
            {game.difficulty === 'easy' ? 'Fácil' : game.difficulty === 'medium' ? 'Médio' : 'Desafiador'}
          </span>
        </div>

        {/* Primary CTA */}
        <div className={styles.ctaGroup}>
          <Link
            href={game.kind === 'arcade' ? `/arcade/${game.slug}` : `/play/${game.slug}`}
            className={styles.primaryCta}
            onClick={onPlayClick}
          >
            <span className={styles.ctaIcon}>▶</span>
            <span className={styles.ctaLabel}>{game.cta}</span>
          </Link>

          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className={styles.secondaryCta}
              onClick={secondaryCta.onClick}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>

        {/* Framing */}
        <p className={styles.heroFraming}>{game.campaignRole}</p>
      </div>
    </section>
  );
}

// --- Trust / Expectation Row ---

interface TrustRowProps {
  game: Game;
}

function TrustRow({ game }: TrustRowProps) {
  const indicators: TrustIndicator[] = [
    {
      icon: '⏱️',
      label: 'Duração',
      value: game.pace === 'quick' ? 'Curto' : game.pace === 'session' ? 'Médio' : 'Profundo',
    },
    {
      icon: '📱',
      label: 'Dispositivo',
      value: game.deviceSupport.length === 2 ? 'Ambos' : game.deviceSupport[0] === 'mobile' ? 'Mobile' : 'Desktop',
    },
    {
      icon: '👤',
      label: 'Jogadores',
      value: 'Solo',
    },
    {
      icon: game.isNew ? '✨' : game.isFeatured ? '⭐' : '🎮',
      label: 'Status',
      value: game.isNew ? 'Novo' : game.isFeatured ? 'Destaque' : 'Disponível',
    },
    {
      icon: '🔓',
      label: 'Acesso',
      value: 'Sem cadastro',
    },
  ];

  return (
    <section className={styles.trustRow}>
      {indicators.map((indicator, index) => (
        <div key={index} className={styles.trustItem}>
          <span className={styles.trustIcon}>{indicator.icon}</span>
          <span className={styles.trustValue}>{indicator.value}</span>
          <span className={styles.trustLabel}>{indicator.label}</span>
        </div>
      ))}
    </section>
  );
}

// --- Why It Matters Section ---

interface WhyItMattersSectionProps {
  content: WhyItMattersContent;
  themes: Game['politicalThemes'];
}

function WhyItMattersSection({ content, themes }: WhyItMattersSectionProps) {
  return (
    <section className={styles.whyItMatters} data-section="why-it-matters">
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Por que isso importa</h2>

        <div className={styles.matterContent}>
          <div className={styles.matterBlock}>
            <h3 className={styles.matterSubTitle}>A luta</h3>
            <p className={styles.matterText}>{content.struggle}</p>
          </div>

          <div className={styles.matterBlock}>
            <h3 className={styles.matterSubTitle}>Por que agora</h3>
            <p className={styles.matterText}>{content.relevance}</p>
          </div>

          <div className={styles.matterBlock}>
            <h3 className={styles.matterSubTitle}>O convite</h3>
            <p className={styles.matterText}>{content.invitation}</p>
          </div>
        </div>

        <div className={styles.themeChips}>
          {themes.map(theme => (
            <span key={theme} className={styles.themeChip}>
              {POLITICAL_THEME_LABELS[theme]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Genre-Aware Onboarding ---

interface GenreOnboardingProps {
  genre: GameGenre;
}

const GENRE_CUES: Record<GameGenre, {
  title: string;
  cues: string[];
  expectation: string;
}> = {
  arcade: {
    title: 'Experiência Arcade',
    cues: ['Ação imediata', 'Sessões curtas', 'Reflexos e timing'],
    expectation: 'Ideal para momentos rápidos. Entre, jogue, sinta.',
  },
  platform: {
    title: 'Experiência de Plataforma',
    cues: ['Movimento preciso', 'Desafios de navegação', 'Superar obstáculos'],
    expectation: 'Cada movimento conta. Pratique para dominar.',
  },
  simulation: {
    title: 'Experiência de Simulação',
    cues: ['Pensamento sistêmico', 'Causa e efeito', 'Explorar dinâmicas'],
    expectation: 'Entenda como as partes se conectam. Observe padrões.',
  },
  management: {
    title: 'Experiência de Gestão',
    cues: ['Trade-offs de recursos', 'Planejamento estratégico', 'Tomada de decisão'],
    expectation: 'Cada escolha tem custo. Pense antes de agir.',
  },
  strategy: {
    title: 'Experiência de Estratégia',
    cues: ['Consequências de longo prazo', 'Sequenciamento', 'Posicionamento'],
    expectation: 'Ações hoje moldam amanhã. Jogue com visão.',
  },
  narration: {
    title: 'Experiência de Narrativa',
    cues: ['Escolhas significativas', 'Imersão', 'Tempo de leitura'],
    expectation: 'Entre na história. Suas decisões importam.',
  },
  quiz: {
    title: 'Experiência Quiz',
    cues: ['Reflexão rápida', 'Descoberta pessoal', 'Aprendizado'],
    expectation: 'Responda com sinceridade. Descubra algo sobre você.',
  },
};

function GenreOnboarding({ genre }: GenreOnboardingProps) {
  const cues = GENRE_CUES[genre];

  return (
    <section className={styles.genreOnboarding} data-section="genre-cues">
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>{cues.title}</h2>

        <div className={styles.cuesGrid}>
          {cues.cues.map((cue, index) => (
            <div key={index} className={styles.cueItem}>
              <span className={styles.cueNumber}>{index + 1}</span>
              <span className={styles.cueText}>{cue}</span>
            </div>
          ))}
        </div>

        <p className={styles.expectationText}>{cues.expectation}</p>
      </div>
    </section>
  );
}

// --- How It Works Section (for richer games) ---

interface HowItWorksSectionProps {
  content: HowItWorksContent;
}

function HowItWorksSection({ content }: HowItWorksSectionProps) {
  return (
    <section className={styles.howItWorks} data-section="how-it-works">
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Como funciona</h2>

        {/* Mechanics */}
        <div className={styles.mechanicsBlock}>
          <h3 className={styles.subSectionTitle}>Mecânicas principais</h3>
          <ul className={styles.mechanicsList}>
            {content.mechanics.map((mechanic, index) => (
              <li key={index} className={styles.mechanicItem}>
                <span className={styles.mechanicBullet}>▸</span>
                {mechanic}
              </li>
            ))}
          </ul>
        </div>

        {/* Controls */}
        {content.controls && (
          <div className={styles.controlsBlock}>
            <h3 className={styles.subSectionTitle}>Controles</h3>
            <p className={styles.controlsText}>{content.controls}</p>
          </div>
        )}

        {/* Objectives */}
        {content.objectives && (
          <div className={styles.objectivesBlock}>
            <h3 className={styles.subSectionTitle}>Objetivo</h3>
            <p className={styles.objectivesText}>{content.objectives}</p>
          </div>
        )}

        {/* Before You Play */}
        {content.beforeYouPlay && content.beforeYouPlay.length > 0 && (
          <div className={styles.beforePlayBlock}>
            <h3 className={styles.subSectionTitle}>Antes de jogar</h3>
            <ul className={styles.beforePlayList}>
              {content.beforeYouPlay.map((item, index) => (
                <li key={index} className={styles.beforePlayItem}>
                  <span className={styles.checkIcon}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Screenshots */}
        {content.screenshots && content.screenshots.length > 0 && (
          <div className={styles.screenshotsBlock}>
            <h3 className={styles.subSectionTitle}>Imagens</h3>
            <div className={styles.screenshotsGrid}>
              {content.screenshots.map((screenshot, index) => (
                <div key={index} className={styles.screenshotItem}>
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    fill
                    className={styles.screenshotImage}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// --- Related Discovery Section ---

interface RelatedDiscoverySectionProps {
  game: Game;
  relatedGames: Game[];
}

function RelatedDiscoverySection({ game, relatedGames }: RelatedDiscoverySectionProps) {
  return (
    <section className={styles.relatedDiscovery} data-section="related-games">
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Continue explorando</h2>

        <div className={styles.relatedGrid}>
          {relatedGames.slice(0, 3).map(relatedGame => (
            <Link
              key={relatedGame.slug}
              href={`/games/${relatedGame.slug}`}
              className={styles.relatedCard}
            >
              <div className={styles.relatedIcon}>{relatedGame.icon}</div>
              <div className={styles.relatedInfo}>
                <h3 className={styles.relatedTitle}>{relatedGame.title}</h3>
                <p className={styles.relatedMeta}>
                  {GAME_GENRE_LABELS[relatedGame.genre]} • {GAME_PACE_LABELS[relatedGame.pace]}
                </p>
                <p className={styles.relatedReason}>
                  {getRelatedReason(game, relatedGame)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function getRelatedReason(source: Game, target: Game): string {
  if (target.genre === source.genre) {
    return `Mesmo gênero: ${GAME_GENRE_LABELS[target.genre].toLowerCase()}`;
  }
  if (target.territoryScope === source.territoryScope) {
    return `Mesmo território: ${TERRITORY_SCOPE_LABELS[target.territoryScope]}`;
  }
  const sharedThemes = target.politicalThemes.filter(t => source.politicalThemes.includes(t));
  if (sharedThemes.length > 0) {
    return `Tema: ${POLITICAL_THEME_LABELS[sharedThemes[0]]}`;
  }
  if (target.pace !== source.pace) {
    return target.pace === 'quick' ? 'Alternativa mais curta' : 'Experiência mais profunda';
  }
  return 'Você pode gostar';
}

// --- Share Section ---

interface ShareSectionProps {
  data: NonNullable<GameEntryPageProps['shareData']>;
  game: Game;
}

function ShareSection({ data, game }: ShareSectionProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${data.description} ${data.url}`);
        alert('Link copiado para a área de transferência!');
      } catch {
        // Clipboard not available
      }
    }
  };

  return (
    <section className={styles.shareSection} data-section="share">
      <div className={styles.sectionContainer}>
        <h2 className={styles.sectionTitle}>Compartilhe</h2>
        <p className={styles.shareText}>
          Espalhe esta experiência e convide outras pessoas para o projeto político.
        </p>
        <button className={styles.shareButton} onClick={handleShare}>
          <span>📤</span>
          Compartilhar
        </button>
      </div>
    </section>
  );
}

// --- Back Section ---

function BackSection() {
  return (
    <section className={styles.backSection}>
      <Link href="/" className={styles.backLink}>
        ← Voltar ao Hub
      </Link>
    </section>
  );
}

export default GameEntryPage;
