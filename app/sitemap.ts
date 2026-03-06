import { MetadataRoute } from 'next';
import { getLiveGames } from '@/lib/games/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Páginas estáticas principais
    const routes = ['', '/explorar', '/sobre', '/participar'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Páginas dinâmicas de jogos (apenas jogos live/beta)
    const liveGames = getLiveGames();
    const gameRoutes = liveGames.map((game) => ({
        url: `${baseUrl}/play/${game.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9, // Aumentando prioridade para páginas de experiências
    }));

    return [...routes, ...gameRoutes];
}
