import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/terms-and-conditions', '/privacy-policy', '/maintenance'],
                disallow: ['/dashboard/', '/admin/', '/api/', '/_next/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
