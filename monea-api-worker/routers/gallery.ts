import { Hono } from 'hono';
import { getDb } from "@/lib/drizzle";
import { galleryItems } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

const galleryRouter = new Hono();

/**
 * GET /api/gallery/:weddingId
 * Retrieves all gallery items associated with a specific wedding ID
 */
galleryRouter.get('/:weddingId', async (c) => {
    const weddingId = c.req.param("weddingId");

    if (!weddingId) {
        return c.json({ success: false, error: "Wedding ID is required" }, 400);
    }

    try {
        const db = getDb(c.env);
        
        const items = await db
            .select()
            .from(galleryItems)
            .where(eq(galleryItems.weddingId, weddingId))
            .orderBy(desc(galleryItems.createdAt));

        return c.json({ success: true, items });
    } catch (error: any) {
        console.error('[Gallery Fetch Error]:', error?.message || error);
        
        return c.json(
            { 
                success: false, 
                error: "Failed to retrieve gallery items",
                details: error?.message || "Internal Server Error"
            }, 
            500
        );
    }
});

export default galleryRouter;