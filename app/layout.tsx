import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Hub de Jogos da Pré-Campanha',
  description:
    'Plataforma interativa de jogos e experiências que transformam pautas políticas em mecânicas lúdicas, educativas e orientadas para ação cidadã.',
  keywords: [
    'jogos',
    'política',
    'campanha',
    'interativo',
    'pwa',
    'educação',
  ],
  authors: [{ name: 'Hub de Jogos Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Hub de Jogos da Pré-Campanha',
    title: 'Hub de Jogos da Pré-Campanha',
    description:
      'Transforme pautas políticas em experiências jogáveis e compartilháveis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hub de Jogos da Pré-Campanha',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub de Jogos da Pré-Campanha',
    description:
      'Transforme pautas políticas em experiências jogáveis e compartilháveis.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA */}
        <meta name="theme-color" content="#0a0e27" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
