import { Hono } from 'hono';
import { getDb } from "@/lib/drizzle";
import { weddings, activities } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { getServerUser } from "@/lib/auth";
import { createLog } from "@/lib/audit-utils";
import { activitySchema, activityUpdateSchema } from "@/lib/validations/activity";
import { generateId } from "@/lib/drizzle-helpers";

const activitiesRouter = new Hono();

/**
 * Helper to resolve weddingId safely from authenticated user context
 */
async function resolveWeddingId(user: any, env: any): Promise<string | null> {
    if (user?.weddingId) return user.weddingId;
    const userId = user?.userId || user?.id;
    if (!userId) return null;
    
    const db = getDb(env);
    const wedding = await db.select({ id: weddings.id })
        .from(weddings)
        .where(eq(weddings.userId, userId))
        .limit(1)
        .then((r: any) => r[0]);
    
    return wedding?.id || null;
}

activitiesRouter.get('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user, c.env);
    if (!weddingId) return c.json([]);

    const db = getDb(c.env);
    const activitiesData = await db.select()
        .from(activities)
        .where(eq(activities.weddingId, weddingId))
        .orderBy(activities.order);

    return c.json(activitiesData);
});

activitiesRouter.post('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON format" }, 400);
    }

    // Validate payload using Zod schema for robustness
    const validated = activitySchema.safeParse(body);
    if (!validated.success) {
        return c.json({ error: validated.error.issues }, 400);
    }

    const { title, time, description, icon } = validated.data;
    if (!title || !time) {
        return c.json({ error: "Title and Time are required" }, 400);
    }

    const weddingId = await resolveWeddingId(user, c.env);
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const db = getDb(c.env);
    
    // Get last activity order
    const lastActivity = await db.select()
        .from(activities)
        .where(eq(activities.weddingId, weddingId))
        .orderBy(desc(activities.order))
        .limit(1)
        .then((r: any) => r[0]);
    
    const newOrder = (lastActivity?.order ?? 0) + 1;

    const newActivity = await db.insert(activities).values({
        id: generateId(),
        title,
        time,
        description: description || null,
        icon: icon || null,
        order: newOrder,
        weddingId,
    }).returning();

    const activity = newActivity[0];

    await createLog(weddingId, "CREATE", `Created activity: ${title}`, user.email || (user as any).role || "system");

    return c.json(activity);
});

activitiesRouter.put('/reorder', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user, c.env);
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON format" }, 400);
    }

    const items: { id: string; order: number }[] = Array.isArray(body)
        ? (typeof body[0] === 'string'
            ? body.map((id: string, idx: number) => ({ id, order: idx }))
            : body)
        : (body?.items || []);

    if (!items.length) return c.json({ error: "No items provided for reordering" }, 400);

    try {
        const db = getDb(c.env);
        
        // Update each activity's order
        await Promise.all(
            items.map((item, idx) =>
                db.update(activities)
                    .set({ order: item.order !== undefined ? item.order : idx })
                    .where(and(
                        eq(activities.id, item.id),
                        eq(activities.weddingId, weddingId)
                    ))
            )
        );

        const updated = await db.select()
            .from(activities)
            .where(eq(activities.weddingId, weddingId))
            .orderBy(activities.order);

        return c.json(updated);
    } catch (error: any) {
        console.error("[Activities Reorder Error]:", error?.message || error);
        return c.json({ error: "Failed to reorder activities" }, 500);
    }
});

activitiesRouter.put('/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user, c.env);
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const activityId = c.req.param("id");
    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON format" }, 400);
    }

    const validated = activityUpdateSchema.safeParse(body);
    if (!validated.success) {
        return c.json({ error: validated.error.issues }, 400);
    }

    const { title, time, description, icon } = validated.data;

    try {
        const db = getDb(c.env);
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (time !== undefined) updateData.time = time;
        if (description !== undefined) updateData.description = description;
        if (icon !== undefined) updateData.icon = icon;

        const updatedActivity = await db.update(activities)
            .set(updateData)
            .where(and(
                eq(activities.id, activityId),
                eq(activities.weddingId, weddingId)
            ))
            .returning();

        if (!updatedActivity[0]) {
            return c.json({ error: "Activity not found" }, 404);
        }

        const activity = updatedActivity[0];

        await createLog(weddingId, "UPDATE", `Updated activity: ${activity.title}`, user.email || (user as any).role || "system");

        return c.json(activity);
    } catch (error: any) {
        console.error("[Activity Update Error]:", error?.message || error);
        return c.json({ error: "Failed to update activity or activity not found" }, 500);
    }
});

activitiesRouter.delete('/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user, c.env);
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const activityId = c.req.param("id");

    try {
        const db = getDb(c.env);
        
        const deleted = await db.delete(activities)
            .where(and(
                eq(activities.id, activityId),
                eq(activities.weddingId, weddingId)
            ))
            .returning();

        if (!deleted[0]) {
            return c.json({ error: "Activity not found" }, 404);
        }

        await createLog(weddingId, "DELETE", `Deleted activity: ${deleted[0].title}`, user.email || (user as any).role || "system");

        return c.json({ success: true });
    } catch (error: any) {
        console.error("[Activity Delete Error]:", error?.message || error);
        return c.json({ error: "Failed to delete activity or activity not found" }, 500);
    }
});

export default activitiesRouter;