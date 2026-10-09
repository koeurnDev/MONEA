import { Hono, type Context } from "hono";
import { getDb } from "@/lib/drizzle";
import { galleryItems } from "@/drizzle/schema";
import { desc, eq } from "drizzle-orm";

const galleryRouter = new Hono();

async function listGalleryItems(c: Context, weddingId: string) {
    if (!weddingId) {
        return c.json({ success: false, error: "Wedding ID is required" }, 400);
    }

    try {
        const items = await getDb(c.env)
            .select()
            .from(galleryItems)
            .where(eq(galleryItems.weddingId, weddingId))
            .orderBy(desc(galleryItems.createdAt));

        return c.json({ success: true, data: items, items });
    } catch (error) {
        console.error("[Gallery Fetch Error]:", error);
        return c.json({ success: false, error: "Failed to retrieve gallery items" }, 500);
    }
}

galleryRouter.get("/", async (c) => {
    return listGalleryItems(c, c.req.query("weddingId") || "");
});

galleryRouter.get("/:weddingId", async (c) => {
    return listGalleryItems(c, c.req.param("weddingId"));
});

galleryRouter.post("/", async (c) => {
    return c.json({ error: "Guest gallery uploads are disabled." }, 410);
});

export default galleryRouter;
