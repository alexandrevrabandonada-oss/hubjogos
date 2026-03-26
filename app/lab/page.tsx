'use client';

import Link from 'next/link';
import { getLabGames } from '@/lib/games/catalog';
import { GameCard } from '@/components/hub/GameCard';
import { Section } from '@/components/ui/Section';
import { BetaBanner } from '@/components/ui/BetaBanner';
import { ShellContainer } from '@/components/ui/ShellContainer';
import styles from './page.module.css';

export default function LabPage() {
  const labGames = getLabGames();

  return (
    <div className={styles.page}>
      <BetaBanner />
      
      <header className={styles.intro}>
        <ShellContainer>
          <h1>Laboratório de Experimentos</h1>
          <p>
            Protótipos em estágio inicial, simuladores técnicos e rascunhos de narrativa. 
            Ambiente voltado para teste de mecânicas e feedback de infraestrutura.
          </p>
          
          <div className={styles.warning}>
             <span>⚠️</span>
             <p>Atenção: Estes jogos podem conter bugs, falta de polimento visual e mecânicas em validação.</p>
          </div>
        </ShellContainer>
      </header>

      <main>
        <Section 
          eyebrow="Labs" 
          title="Protótipos Ativos" 
          description={`Exibindo ${labGames.length} experimentos que não estão no catálogo principal.`}
        >
          {labGames.length > 0 ? (
            <div className={styles.grid}>
              {labGames.map(game => (
                <GameCard key={game.id} game={game} laneId="lab-lane" variant="standard" />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>Nenhum experimento ativo no momento.</p>
            </div>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <Link href="/explorar" className={styles.backLink}>
              ← Voltar ao catálogo principal
            </Link>
          </div>
        </Section>
      </main>

      <footer style={{ padding: '4rem 0', textAlign: 'center' }}>
        <ShellContainer>
           <p style={{ color: '#475569', fontSize: '0.8rem' }}>
             © 2026 Hub de Jogos. Labs v1.0.
           </p>
        </ShellContainer>
      </footer>
    </div>
  );
}
