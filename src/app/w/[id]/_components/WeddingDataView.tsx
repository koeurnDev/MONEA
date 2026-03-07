```typescript
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import VIPPremiumKhmer from "@/components/templates/VIPPremiumKhmer";
import KhmerLegacy from "@/components/templates/KhmerLegacy";
import { notFound } from "next/navigation";
import { AnalyticsTracker } from "./AnalyticsTracker";
import { RSVPForm } from "./RSVPForm";
import { m } from "framer-motion";
import { Wedding, Activity, GalleryItem } from "@prisma/client";

// Define a type for the wedding object with its included relations
type WeddingWithRelations = Wedding & {
    activities: Activity[];
    galleryItems: GalleryItem[];
};

export async function WeddingDataView({ id, template }: { id: string; template?: string }) {
    // Cache this heavy database query for 60 minutes or until invalidated by a tag
    // This solves the slow data fetching issue on the edge runtime for dynamic routes
    const getCachedWedding = unstable_cache(
        async (weddingId: string): Promise<WeddingWithRelations | null> => {
            return await prisma.wedding.findUnique({
                where: { id: weddingId },
                include: {
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
        [`wedding - ${ id } `],
        { revalidate: 3600, tags: [`wedding - ${ id } `] }
    );

    const wedding = await getCachedWedding(id);

    if (!wedding) {
        return notFound();
    }

    // Priority: URL Param > DB Value > Default
    const templateId = template || wedding.templateId || "vip-premium-khmer";

    const rsvpEnabled = (wedding as any).themeSettings?.rsvpEnabled !== false;

    switch (templateId) {
        case "khmer-legacy":
            return (
                <>
                    <AnalyticsTracker weddingId={id} />
                    <KhmerLegacy wedding={wedding as any} />
                    {rsvpEnabled && (
                        <div className="fixed bottom-24 right-6 z-50">
                            {/* Floating RSVP button or section would go here,
                                 but for now let's append it to the end of the template flow */}
                        </div>
                    )}
                </>
            );
        case "vip-premium-khmer":
        default:
            return (
                <>
                    <AnalyticsTracker weddingId={id} />
                    <VIPPremiumKhmer wedding={wedding as any} />
                    {rsvpEnabled && (
                        <div className="bg-[#0A0A0A] py-20 px-6 border-t border-white/5">
                            <div className="max-w-4xl mx-auto">
                                <RevealSection>
                                    <div className="text-center mb-12">
                                        <h2 className="font-khmer text-3xl font-black text-white mb-4 uppercase tracking-widest">ការឆ្លើយតប (RSVP)</h2>
                                        <div className="h-1 w-20 bg-[#D4AF37] mx-auto rounded-full" />
                                    </div>
                                    <RSVPForm weddingId={id} primaryColor="#D4AF37" />
                                </RevealSection>
                            </div>
                        </div>
                    )}
                </>
            );
    }
}

function RevealSection({ children }: { children: React.ReactNode }) {
    return (
        <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            {children}
        </m.div>
    );
}
