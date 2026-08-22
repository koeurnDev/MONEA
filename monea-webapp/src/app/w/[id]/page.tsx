import { queryRaw } from "@/lib/prisma";
import { Suspense } from "react";
import WeddingDataView from "./_components/WeddingDataView";
import { WeddingSkeleton } from "./_components/WeddingSkeleton";
import { unstable_cache } from "next/cache";

// Enable ISR replaced by fully dynamic Server Component for stability

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
    const description = `Join us in celebrating our special day on ${new Date(wedding.date).toLocaleDateString()}.`;
    const imageUrl = (wedding.themeSettings as any)?.shareImage || (wedding.themeSettings as any)?.heroImage || '/og-default.jpg';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: imageUrl }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function Page({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { template?: string, guestId?: string }
}) {
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