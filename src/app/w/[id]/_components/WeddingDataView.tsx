import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { AnalyticsTracker } from "./AnalyticsTracker";

// Dynamically import KhmerLegacy as the sole template
const KhmerLegacy = dynamic(() => import("@/components/templates/KhmerLegacy"), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#FDFBF7] animate-pulse" />
});

const RSVPForm = dynamic(() => import("./RSVPForm").then(mod => mod.RSVPForm), {
    ssr: false
});

const RevealSection = dynamic(() => import("@/components/templates/shared/CinematicComponents").then(mod => mod.RevealSection), {
    ssr: false
});

// Define precise type for public-facing data
type PublicWeddingData = {
    id: string;
    groomName: string;
    brideName: string;
    date: Date;
    location: string | null;
    eventType: import("@prisma/client").EventType;
    templateId: string | null;
    themeSettings: import("@prisma/client").Prisma.JsonValue;
    activities: import("@prisma/client").Activity[];
    galleryItems: import("@prisma/client").GalleryItem[];
};

export async function WeddingDataView({ id, template, guestId }: { id: string; template?: string; guestId?: string }) {
    // Cache this heavy database query for better TTFB (Time to First Byte)
    const getCachedWedding = unstable_cache(
        async (weddingId: string): Promise<PublicWeddingData | null> => {
            return await prisma.wedding.findUnique({
                where: { id: weddingId },
                select: {
                    id: true,
                    groomName: true,
                    brideName: true,
                    date: true,
                    location: true,
                    eventType: true,
                    templateId: true,
                    themeSettings: true,
                    activities: {
                        orderBy: { order: 'asc' }
                    },
                    galleryItems: {
                        orderBy: { createdAt: 'desc' },
                        take: 24
                    }
                }
            });
        },
        [`wedding-${id}`],
        { revalidate: 60, tags: [`wedding-${id}`] } // Revalidate every 60s at the Edge
    );

    const wedding = await getCachedWedding(id);

    if (!wedding) {
        return notFound();
    }

    // Parse theme settings correctly
    let themeSettings: any = {};
    try {
        if (typeof wedding.themeSettings === 'string') {
            themeSettings = JSON.parse(wedding.themeSettings);
        } else if (wedding.themeSettings) {
            themeSettings = wedding.themeSettings;
        }
    } catch (e) {
        console.error("Failed to parse themeSettings in WeddingDataView", e);
    }

    const rsvpEnabled = themeSettings.rsvpEnabled !== false;

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            <AnalyticsTracker weddingId={id} />

            <KhmerLegacy wedding={{ ...wedding, guestId } as any} />

            {rsvpEnabled && (
                <div className="fixed bottom-24 right-6 z-50">
                    <div className="max-w-4xl mx-auto">
                        <RevealSection>
                            <div className="text-center mb-12">
                                <h2 className="font-khmer text-3xl font-black text-white mb-4 uppercase tracking-widest">ការឆ្លើយតប (RSVP)</h2>
                                <div className="h-1 w-20 bg-[#D4AF37] mx-auto rounded-full" />
                            </div>
                            <RSVPForm weddingId={id} guestId={guestId} primaryColor="#D4AF37" />
                        </RevealSection>
                    </div>
                </div>
            )}
        </main>
    );
}
