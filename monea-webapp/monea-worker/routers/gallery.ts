import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"

const galleryRouter = new Hono()

galleryRouter.get('/:weddingId', async (c) => {
    const weddingId = c.req.param("weddingId");
    const items = await prisma.galleryItem.findMany({
        where: { weddingId },
        orderBy: { createdAt: 'desc' },
    });

    return c.json({ items });
});

export default galleryRouter;
