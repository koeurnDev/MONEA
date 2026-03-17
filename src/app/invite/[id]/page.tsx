import { prisma } from "@/lib/prisma";
import { Metadata } from 'next';
import { notFound } from "next/navigation";
import { WeddingData } from "@/components/templates/types";
import dynamic from 'next/dynamic';
const KhmerLegacy = dynamic(() => import("@/components/templates/KhmerLegacy"), { ssr: false });

import { unstable_cache } from "next/cache";

const getWedding = unstable_cache(
    async (id: string) => {
        const wedding = await prisma.wedding.findUnique({
            where: { id },
            select: {
                id: true,
                groomName: true,
                brideName: true,
                location: true,
                date: true,
                eventType: true,
                templateId: true,
                themeSettings: true,
                status: true,
                createdAt: true,
                activities: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        time: true,
                        description: true,
                        order: true,
                        icon: true
                    }
                },
                galleryItems: {
                    orderBy: { createdAt: 'desc' },
                    take: 24,
                    select: {
                        url: true,
                        type: true,
                        caption: true
                    }
                }
            }
        });

        if (!wedding) return null;

        // Parse themeSettings if it's a string
        let themeSettings = {};
        if (wedding.themeSettings && typeof wedding.themeSettings === 'string') {
            try {
                themeSettings = JSON.parse(wedding.themeSettings);
            } catch (e) {
                console.error("Failed to parse themeSettings", e);
            }
        } else if (typeof wedding.themeSettings === 'object') {
            themeSettings = wedding.themeSettings || {};
        }

        return { ...wedding, themeSettings } as unknown as WeddingData;
    },
    ['wedding-invite'],
    { revalidate: 3600 }
);

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const wedding = await getWedding(params.id);
    if (!wedding) return { title: 'Wedding Not Found' };

    const title = `${wedding.groomName} & ${wedding.brideName} | អាពាហ៍ពិពាហ៍`;
    const description = `យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញលោកអ្នកចូលរួមក្នុងកម្មវិធីមង្គលការរបស់យើងនៅថ្ងៃទី ${new Date(wedding.date).toLocaleDateString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}.`;

    // Better image handling
    let imageUrl = '/images/share-cover.jpg';
    if (wedding.themeSettings?.shareImage) {
        imageUrl = wedding.themeSettings.shareImage;
    } else if (wedding.themeSettings?.heroImage) {
        imageUrl = wedding.themeSettings.heroImage;
    } else if (wedding.galleryItems && wedding.galleryItems.length > 0) {
        imageUrl = wedding.galleryItems[0].url;
    }

    // Ensure absolute URL for metadata images
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com';
    const heroImage = wedding.themeSettings?.heroImage || '';
    const ogImageUrl = `${baseUrl}/api/og?groom=${encodeURIComponent(wedding.groomName)}&bride=${encodeURIComponent(wedding.brideName)}&date=${encodeURIComponent(new Date(wedding.date).toISOString())}&type=${wedding.eventType || 'wedding'}&image=${encodeURIComponent(heroImage)}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
            type: 'article',
            siteName: 'MONEA Wedding',
            locale: 'km_KH',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
        alternates: {
            canonical: `${baseUrl}/invite/${params.id}`,
        }
    };
}

// Client-side tracker component
import { GuestViewTracker } from "@/components/analytics/GuestViewTracker";
import { SafeBoundary } from "@/components/ui/SafeBoundary";

export default async function InvitationPage({ params, searchParams }: { params: { id: string }, searchParams: { to?: string, g?: string } }) {
    const wedding = await getWedding(params.id);
    const guestName = searchParams?.to ? decodeURIComponent(searchParams.to) : undefined;
    const guestId = searchParams?.g;

    if (!wedding) {
        return notFound();
    }

    const weddingData = (wedding as unknown) as WeddingData;

    return (
        <>
            <GuestViewTracker weddingId={wedding.id} guestId={guestId} guestName={guestName} />
            <SafeBoundary name="Wedding Template (Khmer Legacy)" isSilent={true}>
                <KhmerLegacy wedding={weddingData} guestName={guestName} />
            </SafeBoundary>
        </>
    );
}
