import { queryRaw } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { AnalyticsTracker } from "./AnalyticsTracker";

// Dynamically import KhmerLegacy as the sole template
const KhmerLegacy = dynamic(() => import("@/components/templates/KhmerLegacy"), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#FDFBF7] animate-pulse" />
});

const FloatingRSVP = dynamic(() => import("./FloatingRSVP").then(mod => mod.FloatingRSVP), {
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
    // Cache the raw SQL result for high-performance TTFB
    const getCachedWedding = unstable_cache(
        async (weddingId: string): Promise<PublicWeddingData | null> => {
            try {
                // Fetch in parallel using stable Raw SQL
                const [weddings, activities, galleryItems] = await Promise.all([
                    queryRaw('SELECT * FROM "Wedding" WHERE id = $1 LIMIT 1', weddingId),
                    queryRaw('SELECT * FROM "Activity" WHERE "weddingId" = $1 ORDER BY "order" ASC', weddingId),
                    queryRaw('SELECT * FROM "GalleryItem" WHERE "weddingId" = $1 ORDER BY "createdAt" DESC LIMIT 24', weddingId)
                ]);

                if (!weddings.length) return null;

                const wedding = weddings[0];
                return {
                    ...wedding,
                    activities,
                    galleryItems
                };
            } catch (e) {
                console.error("[WeddingDataView] Raw SQL fetch failed:", e);
                return null;
            }
        },
        [`wedding-${id}`],
        { revalidate: 60, tags: [`wedding-${id}`] }
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

            <KhmerLegacy wedding={{ ...wedding, guestId } as any} guestName={guestId ? "Guest" : undefined} />

            {rsvpEnabled && (
                <FloatingRSVP weddingId={id} guestId={guestId} />
            )}
        </main>
    );
}
