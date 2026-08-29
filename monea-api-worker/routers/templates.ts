import { Hono } from 'hono'
import { getDb } from "@/lib/drizzle"
import { weddings, weddingTemplateVersions } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { getServerUser } from "@/lib/auth"
import { ROLES } from "@/lib/constants"

const templatesRouter = new Hono()

templatesRouter.get('/versions', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const weddingId = c.req.query("weddingId");

        if (!weddingId) {
            return c.json({ error: "Wedding ID is required" }, 400);
        }

        const db = getDb(c.env);
        const wedding = await db.select({ userId: weddings.userId })
            .from(weddings)
            .where(eq(weddings.id, weddingId))
            .limit(1)
            .then((r: any) => r[0]);

        if (!wedding || (wedding.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER)) {
            return c.json({ error: "Unauthorized access to this wedding" }, 403);
        }

        const versions = await db.select()
            .from(weddingTemplateVersions)
            .where(eq(weddingTemplateVersions.weddingId, weddingId))
            .orderBy(desc(weddingTemplateVersions.createdAt));

        return c.json(versions);
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_GET]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

templatesRouter.post('/versions', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const { weddingId, versionName, description } = body;

        if (!weddingId || !versionName) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const db = getDb(c.env);
        const wedding = await db.select({
            userId: weddings.userId,
            templateId: weddings.templateId,
            themeSettings: weddings.themeSettings
        })
            .from(weddings)
            .where(eq(weddings.id, weddingId))
            .limit(1)
            .then((r: any) => r[0]);

        if (!wedding || (wedding.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER)) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        const version = await db.insert(weddingTemplateVersions)
            .values({
                id: `vtv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                weddingId,
                versionName,
                description,
                templateId: wedding.templateId,
                themeData: (wedding.themeSettings as any) || {},
                createdBy: (user as any).name || user.userId || (user as any).id
            })
            .returning()
            .then((r: any) => r[0]);

        return c.json(version);
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_POST]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

templatesRouter.delete('/versions', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.query("id");

        if (!id) {
            return c.json({ error: "Version ID is required" }, 400);
        }

        const db = getDb(c.env);
        const version = await db.select({
            id: weddingTemplateVersions.id,
            weddingId: weddingTemplateVersions.weddingId,
            userId: weddings.userId
        })
            .from(weddingTemplateVersions)
            .leftJoin(weddings, eq(weddingTemplateVersions.weddingId, weddings.id))
            .where(eq(weddingTemplateVersions.id, id))
            .limit(1)
            .then((r: any) => r[0]);

        if (!version) {
            return c.json({ error: "Version not found" }, 404);
        }

        if (version.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        await db.delete(weddingTemplateVersions)
            .where(eq(weddingTemplateVersions.id, id));

        return c.json({ success: true });
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_DELETE]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

templatesRouter.patch('/versions', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const { id } = body;

        if (!id) {
            return c.json({ error: "Version ID is required" }, 400);
        }

        const db = getDb(c.env);
        const version = await db.select({
            id: weddingTemplateVersions.id,
            weddingId: weddingTemplateVersions.weddingId,
            templateId: weddingTemplateVersions.templateId,
            themeData: weddingTemplateVersions.themeData,
            userId: weddings.userId
        })
            .from(weddingTemplateVersions)
            .leftJoin(weddings, eq(weddingTemplateVersions.weddingId, weddings.id))
            .where(eq(weddingTemplateVersions.id, id))
            .limit(1)
            .then((r: any) => r[0]);

        if (!version) {
            return c.json({ error: "Version not found" }, 404);
        }

        if (version.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        await db.update(weddings)
            .set({
                templateId: version.templateId,
                themeSettings: version.themeData as any,
                updatedAt: new Date()
            })
            .where(eq(weddings.id, version.weddingId));

        return c.json({ success: true, templateId: version.templateId, themeSettings: version.themeData });
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_PATCH]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default templatesRouter;
