import { prisma } from "@/lib/prisma";
import { LogAction } from "@prisma/client";

export async function logActivity(weddingId: string, action: string, description: string, actorName: string) {
    try {
        await prisma.log.create({
            data: {
                weddingId,
                action: action as LogAction,
                description,
                actorName
            }
        });
    } catch (e) {
        console.error("Failed to log activity:", e);
    }
}
