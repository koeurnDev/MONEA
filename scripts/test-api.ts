
import { prisma } from "../src/lib/prisma";

async function testApi() {
    try {
        console.log("---- Testing Broadcast Fetch ----");
        const now = new Date();
        const broadcasts = await prisma.broadcast.findMany({
            where: {
                active: true,
                AND: [
                    {
                        OR: [
                            { scheduledAt: null },
                            { scheduledAt: { lte: now } }
                        ]
                    },
                    {
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: now } }
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log("SUCCESS:", broadcasts.length, "items found.");
    } catch (e: any) {
        console.error("API FAILED ERROR:", e.message);
        console.error("STK:", e.stack);
    }
}

testApi();
