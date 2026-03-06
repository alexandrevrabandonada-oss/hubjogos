'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import styles from './page.module.css';

const channels = [
  {
    icon: '💻',
    title: 'Contribuir com código',
    description:
      'Aprimore componentes, engines e infraestrutura em Next.js + TypeScript.',
    href: 'https://github.com/alexandrevrabandonada-oss/hubjogos',
    action: 'Repositório',
  },
  {
    icon: '🎨',
    title: 'Design e linguagem visual',
    description:
      'Refine sistema visual, legibilidade política e consistência entre módulos.',
    href: 'https://github.com/alexandrevrabandonada-oss/hubjogos/issues',
    action: 'Issues de design',
  },
  {
    icon: '💡',
    title: 'Sugerir novas pautas',
    description:
      'Traga conflitos reais de cidade, trabalho, transporte, orçamento e participação.',
    href: 'https://github.com/alexandrevrabandonada-oss/hubjogos/discussions',
    action: 'Abrir discussão',
  },
  {
    icon: '🧪',
    title: 'Teste e feedback',
    description:
      'Jogue, reporte atrito de UX e indique onde a leitura política ficou fraca.',
    href: 'https://github.com/alexandrevrabandonada-oss/hubjogos/issues',
    action: 'Reportar feedback',
  },
  {
    icon: '📢',
    title: 'Circular o conteúdo',
    description:
      'Leve os resultados para grupos de bairro, redes e espaços de formação política.',
    href: '/',
    action: 'Voltar ao hub',
  },
  {
    icon: '🤝',
    title: 'Articular comunidade',
    description:
      'Proponha rodas de conversa, oficinas e ativações do hub em território.',
    href: 'https://github.com/alexandrevrabandonada-oss/hubjogos/discussions',
    action: 'Conectar pessoas',
  },
];

export default function ParticiparPage() {
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Participação"
        title="Transforme jogo em mobilização"
        description="Este projeto é aberto: cresce quando mais pessoas conectam código, design e pauta real."
      />

      <Section
        eyebrow="Canais"
        title="Como participar agora"
        description="Escolha um ponto de entrada e contribua para fortalecer o hub como ferramenta política."
      >
        <div className={styles.grid}>
          {channels.map((channel) => (
            <Card key={channel.title} className={styles.card} interactive>
              <span className={styles.icon} aria-hidden>
                {channel.icon}
              </span>
              <h3>{channel.title}</h3>
              <p>{channel.description}</p>
              <Link href={channel.href}>{channel.action} →</Link>
            </Card>
          ))}
        </div>

        <Card className={styles.finalCTA}>
          <h2>Pronto para começar?</h2>
          <p>
            A melhor contribuição é a que conecta experiência jogável com
            leitura política concreta.
          </p>
          <Link href="https://github.com/alexandrevrabandonada-oss/hubjogos">
            Acessar repositório principal →
          </Link>
        </Card>
      </Section>
    </div>
  );
}
