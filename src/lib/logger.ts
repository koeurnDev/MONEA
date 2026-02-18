import { prisma } from "@/lib/prisma";

export async function logActivity(weddingId: string, action: string, description: string, actorName: string) {
    try {
        await prisma.log.create({
            data: {
                weddingId,
                action,
                description,
                actorName
            }
        });
    } catch (e) {
        console.error("Failed to log activity:", e);
    }
}
