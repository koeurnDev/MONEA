import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com';

    // Static routes
    const staticRoutes = [
        '',
        '/terms-and-conditions',
        '/privacy-policy',
        '/maintenance',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.5,
    }));

    // Dynamic public wedding routes (optional: only if you want public viewing indexed)
    // For now, let's keep it clean with just static pages to prioritize brand visibility.
    
    return [...staticRoutes];
}
