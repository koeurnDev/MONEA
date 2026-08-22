import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { sanitizeObject } from "@/lib/sanitize"
import { createLog } from "@/lib/audit-utils"
import { activityUpdateSchema } from "@/lib/validations/activity"

const activitiesRouter = new Hono()

activitiesRouter.get('/', async (c) => {
    const user = await getServerUser();
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId || (user as any).id } }))?.id;

    if (!weddingId) return c.json([]);

    const activities = await prisma.activity.findMany({
        where: { weddingId },
        orderBy: { order: "asc" },
    });

    return c.json(activities);
});

activitiesRouter.post('/', async (c) => {
    const user = await getServerUser();
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }
    const { title, time, description, icon } = sanitizeObject<any>(body);

    if (!title || !time) {
        return c.json({ error: "Title and Time are required" }, 400);
    }

    if (title.length > 100) return c.json({ error: "Title too long (Max 100)" }, 400);
    if (description && description.length > 1000) return c.json({ error: "Description too long (Max 1000)" }, 400);

    const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId || (user as any).id } }))?.id;
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const lastActivity = await prisma.activity.findFirst({
        where: { weddingId },
        orderBy: { order: 'desc' }
    });
    const newOrder = (lastActivity?.order || 0) + 1;

    const activity = await prisma.activity.create({
        data: {
            title,
            time,
            description,
            icon,
            order: newOrder,
            weddingId: weddingId,
        },
    });

    await createLog(weddingId, "CREATE", `Created activity: ${title}`, (user as any).email || user.role);

    return c.json(activity);
});

activitiesRouter.put('/:id', async (c) => {
    const user = await getServerUser();
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId || (user as any).id } }))?.id;
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const activityId = c.req.param("id");
    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
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
                weddingId: weddingId,
            },
            data: {
                title,
                time,
                description,
                icon,
            },
        });

        await createLog(weddingId, "UPDATE", `Updated activity: ${title}`, (user as any).email || user.role);

        return c.json(activity);
    } catch (error) {
        return c.json({ error: "Failed to update activity" }, 500);
    }
});

activitiesRouter.delete('/:id', async (c) => {
    const user = await getServerUser();
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId || (user as any).id } }))?.id;
    if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

    const activityId = c.req.param("id");

    try {
        const deleted = await prisma.activity.delete({
            where: {
                id: activityId,
                weddingId: weddingId,
            },
        });

        await createLog(weddingId, "DELETE", `Deleted activity: ${deleted.title}`, (user as any).email || user.role);

        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete activity" }, 500);
    }
});

export default activitiesRouter;
