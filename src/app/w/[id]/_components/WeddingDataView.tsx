import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import VIPPremiumKhmer from "@/components/templates/VIPPremiumKhmer";
import KhmerLegacy from "@/components/templates/KhmerLegacy";
import { notFound } from "next/navigation";

export async function WeddingDataView({ id, template }: { id: string; template?: string }) {
    // Cache this heavy database query for 60 minutes or until invalidated by a tag
    // This solves the slow data fetching issue on the edge runtime for dynamic routes
    const getCachedWedding = unstable_cache(
        async (weddingId: string) => {
            return await prisma.wedding.findUnique({
                where: { id: weddingId },
                include: {
                    activities: {
                        orderBy: { order: 'asc' }
                    },
                    galleryItems: {
                        orderBy: { createdAt: 'desc' },
                        take: 8
                    }
                }
            });
        },
        [`wedding-${id}`],
        { revalidate: 3600, tags: [`wedding-${id}`] }
    );

    const wedding = await getCachedWedding(id);

    if (!wedding) {
        return notFound();
    }

    // Priority: URL Param > DB Value > Default
    const templateId = template || wedding.templateId || "vip-premium-khmer";

    switch (templateId) {
        case "khmer-legacy":
            return <KhmerLegacy wedding={wedding as any} />;
        case "vip-premium-khmer":
        default:
            return <VIPPremiumKhmer wedding={wedding as any} />;
    }
}
