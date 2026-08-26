import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { createLog } from "@/lib/audit-utils";
import { activitySchema, activityUpdateSchema } from "@/lib/validations/activity";

const activitiesRouter = new Hono();

/**
 * Helper to resolve weddingId safely from authenticated user context
 */
async function resolveWeddingId(user: any): Promise<string | null> {
    if (user?.weddingId) return user.weddingId;
    const userId = user?.userId || user?.id;
    if (!userId) return null;
    const wedding = await prisma.wedding.findFirst({ where: { userId } });
    return wedding?.id || null;
}

activitiesRouter.get('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user);
    if (!weddingId) return c.json([]);

    const activities = await prisma.activity.findMany({
        where: { weddingId },
        orderBy: { order: "asc" },
    });

    return c.json(activities);
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

    const weddingId = await resolveWeddingId(user);
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const lastActivity = await prisma.activity.findFirst({
        where: { weddingId },
        orderBy: { order: 'desc' },
    });
    const newOrder = (lastActivity?.order ?? 0) + 1;

    const activity = await prisma.activity.create({
        data: {
            title,
            time,
            description: description || null,
            icon: icon || null,
            order: newOrder,
            weddingId,
        },
    });

    await createLog(weddingId, "CREATE", `Created activity: ${title}`, user.email || (user as any).role || "system");

    return c.json(activity);
});

activitiesRouter.put('/reorder', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user);
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
        await prisma.$transaction(
            items.map((item, idx) =>
                prisma.activity.updateMany({
                    where: { id: item.id, weddingId },
                    data: { order: item.order !== undefined ? item.order : idx },
                })
            )
        );

        const updated = await prisma.activity.findMany({
            where: { weddingId },
            orderBy: { order: "asc" },
        });

        return c.json(updated);
    } catch (error: any) {
        console.error("[Activities Reorder Error]:", error?.message || error);
        return c.json({ error: "Failed to reorder activities" }, 500);
    }
});

activitiesRouter.put('/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = await resolveWeddingId(user);
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
        const activity = await prisma.activity.update({
            where: {
                id: activityId,
                weddingId,
            },
            data: {
                title: title ?? undefined,
                time: time ?? undefined,
                description,
                icon,
            },
        });

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

    const weddingId = await resolveWeddingId(user);
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const activityId = c.req.param("id");

    try {
        const deleted = await prisma.activity.delete({
            where: {
                id: activityId,
                weddingId,
            },
        });

        await createLog(weddingId, "DELETE", `Deleted activity: ${deleted.title}`, user.email || (user as any).role || "system");

        return c.json({ success: true });
    } catch (error: any) {
        console.error("[Activity Delete Error]:", error?.message || error);
        return c.json({ error: "Failed to delete activity or activity not found" }, 500);
    }
});

export default activitiesRouter;