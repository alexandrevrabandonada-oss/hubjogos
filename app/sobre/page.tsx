'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import styles from './page.module.css';

export default function SobrePage() {
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Manifesto"
        title="Por que um hub político-jogável"
        description="Porque pauta pública não pode continuar restrita ao jargão técnico e ao debate distante do território."
      />

      <Section
        eyebrow="Fundamentos"
        title="O projeto em quatro frentes"
        description="Estrutura política, linguagem jogável, tecnologia aberta e ação coletiva."
      >
        <div className={styles.grid}>
          <Card className={styles.col}>
            <div>
              <h2>A Ideia</h2>
              <p>
                A política é complexa. Mas não deveria ser inacessível. O
                <strong>Hub de Jogos da Pré-Campanha</strong> acredita que
                educação política pode ser lúdica, compartilhável e
                transformadora.
              </p>
              <p>
                Cada experiência no hub transforma uma pauta real em uma
                mecânica de jogo que você{' '}
                <strong>vive, escolhe e aprende</strong>.
              </p>
              <p>
                Não é simulação genérica. É política urbana, contemporânea,
                baseada em dilemas reais de quem vive nas cidades.
              </p>
            </div>

          </Card>

          <Card className={styles.col}>
            <div>
              <h2>Por Que Jogos?</h2>
              <p>
                Jogos funcionam. Eles criam envolvimento, geram consequências,
                permitem aprendizado por experimentação.
              </p>
              <p>
                Um quiz sobre política é chato. Uma simulação orçamentária onde
                você de fato enfrenta dilemas? Isso é vício e consciência ao
                mesmo tempo.
              </p>
              <p>
                Além disso, jogos são compartilháveis. Seus resultados, suas
                escolhas, sua pontuação. Isso amplifica o impacto.
              </p>
            </div>

          </Card>

          <Card className={styles.col}>
            <div>
              <h2>Tecnologia</h2>
              <p>
                Construído em<strong>Next.js + React</strong>, com banco em
                <strong>Supabase</strong>, hospedado em<strong>Vercel</strong>.
              </p>
              <p>
                PWA-ready, mobile-first, rápido e escalável. Open source no
                GitHub, pronto para contribuições comunitárias.
              </p>
              <p>
                Cada &quot;tijolo&quot; de desenvolvimento é incrementalmente entregue,
                documentado e testado.
              </p>
            </div>

          </Card>

          <Card className={styles.col}>
            <div>
              <h2>Design & Visual</h2>
              <p>
                Inspirado em universos reais urbanos como VR Abandonada e
                #ÉLUTA. Design contemporâneo, não retro.
              </p>
              <p>
                Sem templates SaaS genéricos. Sem placeholder de startup años
                80. Visual que grita política, abandono, resistência urbana.
              </p>
              <p>
                Acessibilidade integrada. Dark mode por padrão, contraste alto,
                mobile-first em tudo.
              </p>
            </div>
          </Card>
        </div>

        <Card className={styles.teamSection}>
          <h2>Quem faz</h2>
          <p>
            Este é um projeto colaborativo de engenharia, design e território.
            Queremos colaboração em código, pauta e linguagem visual.
          </p>
          <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos">
            Contribuir no GitHub →
          </Link>
        </Card>
      </Section>
    </div>
  );
}
