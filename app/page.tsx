'use client';

import { 
  games, 
  getFeaturedGames, 
  getGamesByPoliticalTheme
} from '@/lib/games/catalog';
import { BetaBanner } from '@/components/ui/BetaBanner';
import { ShellContainer } from '@/components/ui/ShellContainer';
import { Section } from '@/components/ui/Section';
import { EditorialMasthead } from '@/components/hub/EditorialMasthead';
import { PortfolioLane } from '@/components/hub/PortfolioLane';
import { CampaignAvatar } from '@/components/campaign/CampaignAvatar';
import styles from './page.module.css';

// Progression surfaces and logic
import { ContinueJogando, JogadosRecentemente, ProximoPasso, VocePodeGostar, VoltarParaLuta } from '@/components/hub/ProgressionSurfaces';
import { loadProgression } from '@/lib/hub/progression';

export default function Home() {
  const featuredGames = getFeaturedGames();
  const quickGames = games.filter(g => g.pace === 'quick');
  const deepGames = games.filter(g => g.pace === 'deep' || g.pace === 'session');

  // Load progression state (client-side only)
  let progression;
  if (typeof window !== 'undefined') {
    progression = loadProgression();
  } else {
    progression = { recentlyPlayed: [], completedGames: [], lastSession: null, favorites: [], genreAffinity: {}, territoryAffinity: {} };
  }

  // Helper to get games by slug
  const getGamesBySlugs = (slugs) => games.filter(g => slugs.includes(g.slug));

  // Surfaces data
  const recentlyPlayedGames = getGamesBySlugs(progression.recentlyPlayed || []);
  const completedGames = getGamesBySlugs(progression.completedGames || []);
  // For demo: next step, recommendations, and related struggle can be editorial or based on progression logic
  const proximoPassoGames = []; // TODO: fill with recommendation logic
  const vocePodeGostarGames = []; // TODO: fill with recommendation logic
  const voltarParaLutaGames = []; // TODO: fill with recommendation logic

  return (
    <>
      <BetaBanner />

      <EditorialMasthead 
        eyebrow="Hub de Jogos | Rio em Comum"
        title="O Portfólio de Disputa pelo Futuro do RJ"
        description="Explore um ecossistema de jogos políticos criados para organizar pautas, denunciar o abandono e projetar saídas coletivas. Do arcade rápido ao simulador profundo."
        primaryAction={{ label: 'Explorar Todos os Jogos', href: '#explorar' }}
        secondaryAction={{ label: 'Conhecer a Campanha', href: '/sobre' }}
        stats={[
          { label: 'Jogos Ativos', value: '14+' },
          { label: 'Territórios', value: '5+' },
          { label: 'Jogadores', value: '1k+' }
        ]}
      />

      {/* Progression/return surfaces — only render if relevant */}
      <ContinueJogando games={recentlyPlayedGames} />
      <JogadosRecentemente games={completedGames} />
      <ProximoPasso games={proximoPassoGames} />
      <VocePodeGostar games={vocePodeGostarGames} />
      <VoltarParaLuta games={voltarParaLutaGames} />

      <section id="explorar" style={{ paddingTop: '40px' }}>
        <PortfolioLane 
          laneId="featured" 
          category="Curadoria" 
          title="Experiências em Foco" 
          games={featuredGames} 
          cardVariant="featured"
        />

        <PortfolioLane 
          laneId="theme-popular" 
          category="Tema: Poder Popular" 
          title="Organização e Autogestão" 
          games={getGamesByPoliticalTheme('organizacao-popular').concat(getGamesByPoliticalTheme('cooperativismo'))} 
        />

        <PortfolioLane 
          laneId="quick-play" 
          category="Sessões Curtas" 
          title="Quick-play (1-3 min)" 
          games={quickGames} 
          cardVariant="compact"
        />

        <PortfolioLane 
          laneId="deep-play" 
          category="Narrativa e Simulação" 
          title="Experiências de Aprofundamento" 
          games={deepGames} 
        />
      </section>

      <Section 
        eyebrow="O Projeto" 
        title="Campanha como Portfólio Coletivo"
        description="Acreditamos que a política deve ser jogada, testada e construída em comum. Cada jogo aqui é uma porta de entrada para uma pauta real de Rio de Janeiro."
      >
        <div className={styles.campaignFinalBlock}>
          <div className={styles.avatarWrap}>
            <CampaignAvatar size="large" expression="determined" />
          </div>
          <div className={styles.campaignText}>
            <h3>Alexandre Fonseca para Deputado</h3>
            <p>Este Hub não é apenas entretenimento. É uma infraestrutura de comunicação política descentralizada. Jogue, compartilhe e ajude a pautar o que importa.</p>
            <div className={styles.footerCtas}>
              <a href="https://instagram.com/alexandrefonseca" className={styles.footerLink}>Instagram</a>
              <a href="https://whatsapp.com/..." className={styles.footerLink}>Grupo de Apoio</a>
              <a href="/participar" className={styles.footerLink}>Sugerir Novo Jogo</a>
            </div>
          </div>
        </div>
      </Section>

      <footer className={styles.footerV2}>
        <ShellContainer>
          <div className={styles.footerBottom}>
            <p>© 2026 Hub de Jogos Pré-Campanha. Rio em Comum.</p>
            <div className={styles.footerMisc}>
              <span>v1.2.0-portfolio</span>
              <a href="/estado">Dashboard Operacional</a>
            </div>
          </div>
        </ShellContainer>
      </footer>
    </>
  );
}
