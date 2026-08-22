import { prisma } from "./prisma";

/**
 * Records a system log entry
 */
export async function createLog(
    weddingId: string,
    action: "CHECK_IN" | "GIFT" | "UPDATE" | "DELETE" | "CREATE" | "LOGIN_FAILURE",
    description: string,
    actorName: string,
    metadata?: { ip?: string, userAgent?: string }
) {
    try {
        return await prisma.log.create({
            data: {
                weddingId,
                action,
                description,
                actorName,
                ip: metadata?.ip,
                userAgent: metadata?.userAgent
            }
        });
    } catch (error) {
        console.error("Failed to create log:", error);
    }
}
