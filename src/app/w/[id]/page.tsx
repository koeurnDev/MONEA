export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { WeddingDataView } from "./_components/WeddingDataView";
import { WeddingSkeleton } from "./_components/WeddingSkeleton";

// Enable ISR with 60 seconds revalidation for optimal edge caching and TTFB
export const revalidate = 60;

async function getWeddingMetadataOnly(id: string) {
    return await prisma.wedding.findUnique({
        where: { id },
        select: { groomName: true, brideName: true, date: true, eventType: true, themeSettings: true }
    });
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const wedding = await getWeddingMetadataOnly(params.id);

    if (!wedding) {
        return {
            title: "Wedding Invitation Not Found",
        };
    }

    const title = `${wedding.groomName} & ${wedding.brideName} - Wedding Invitation`;
    const description = `Join us in celebrating our special day on ${new Date(wedding.date).toLocaleDateString()}.`;
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
        },
    };
}

export default function SmartQRPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { template?: string }
}) {
    // Render the skeleton immediately while the server fetches the wedding data
    // NextJS Streaming SSR will replace this entirely once the DB query resolves
    return (
        <Suspense fallback={<WeddingSkeleton />}>
            <WeddingDataView id={params.id} template={searchParams.template} />
        </Suspense>
    );
}
