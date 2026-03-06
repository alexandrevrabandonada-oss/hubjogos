import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Hub de Jogos da Pré-Campanha',
  description:
    'Hub político-jogável que transforma pautas urbanas em experiências de escolha, consequência e ação cidadã. Beta público aberto.',
  keywords: [
    'jogos políticos',
    'educação política',
    'pré-campanha',
    'simulação urbana',
    'interativo',
    'pwa',
    'participação cidadã',
    'orçamento participativo',
    'mobilidade urbana',
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
      'Jogue conflitos reais da cidade e descubra leituras políticas acionáveis. Beta público aberto.',
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
      'Jogue conflitos reais da cidade e descubra leituras políticas acionáveis.',
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
        <meta name="theme-color" content="#11100e" />
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
