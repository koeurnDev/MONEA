import { queryRaw } from "@/lib/prisma";
import { Suspense } from "react";
import { WeddingDataView } from "./_components/WeddingDataView";
import { WeddingSkeleton } from "./_components/WeddingSkeleton";
import { unstable_cache } from "next/cache";

// Enable ISR with 60 seconds revalidation for optimal edge caching and TTFB
export const revalidate = 60;

const getWeddingMetadataOnly = unstable_cache(
    async (id: string) => {
        const results = await queryRaw('SELECT "groomName", "brideName", date, "eventType", "themeSettings" FROM "Wedding" WHERE id = $1 LIMIT 1', id);
        return results[0] || null;
    },
    ['wedding-metadata'],
    { revalidate: 3600, tags: ['wedding-metadata'] }
);

export async function generateMetadata({ params }: { params: { id: string } }) {
    const wedding = await getWeddingMetadataOnly(params.id);

    if (!wedding) {
        return {
            title: "Wedding Invitation Not Found",
        };
    }

    const title = `${wedding.groomName} & ${wedding.brideName} - Wedding Invitation`;
    const description = `សូមគោរពអញ្ជើញចូលរួមក្នុងកម្មវិធីមង្គលការរបស់ ${wedding.groomName} និង ${wedding.brideName} នៅថ្ងៃទី ${new Date(wedding.date).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}. Join us in celebrating our special day.`;
    const imageUrl = (wedding.themeSettings as any)?.shareImage || (wedding.themeSettings as any)?.heroImage || '/og-default.jpg';

    // Dynamic OG Image Integration
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com';
    const heroImage = (wedding.themeSettings as any)?.heroImage || '';
    const ogImageUrl = `${baseUrl}/api/og?groom=${encodeURIComponent(wedding.groomName)}&bride=${encodeURIComponent(wedding.brideName)}&date=${encodeURIComponent(new Date(wedding.date).toISOString())}&type=${wedding.eventType || 'wedding'}&image=${encodeURIComponent(heroImage)}`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `${baseUrl}/w/${params.id}`,
            siteName: 'MONEA - Professional E-Invitations',
            locale: 'km_KH',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [ogImageUrl],
            creator: '@monea',
        },
        alternates: {
            canonical: `${baseUrl}/w/${params.id}`,
        },
    };
}

export default function SmartQRPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { template?: string, guestId?: string }
}) {
    // Render the skeleton immediately while the server fetches the wedding data
    // NextJS Streaming SSR will replace this entirely once the DB query resolves
    return (
        <Suspense fallback={<WeddingSkeleton />}>
            <WeddingDataView
                id={params.id}
                template={searchParams.template}
                guestId={searchParams.guestId}
            />
        </Suspense>
    );
}
