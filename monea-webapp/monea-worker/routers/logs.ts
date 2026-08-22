import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"

const logsRouter = new Hono()

logsRouter.get('/', async (c) => {
    try {
        const user = await getServerUser();
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId || (user as any).id } }))?.id;
        if (!weddingId) return c.json([]);

        const logs = await prisma.log.findMany({
            where: { weddingId: weddingId },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return c.json(logs);
    } catch (error: any) {
        console.error("Error fetching logs:", error);
        return c.json({ error: "Internal Server Error", details: error.message }, 500);
    }
});

export default logsRouter;
