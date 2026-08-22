import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { ROLES } from "@/lib/constants"

const templatesRouter = new Hono()

templatesRouter.get('/versions', async (c) => {
    try {
        const user = await getServerUser();
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const weddingId = c.req.query("weddingId");

        if (!weddingId) {
            return c.json({ error: "Wedding ID is required" }, 400);
        }

        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true }
        });

        if (!wedding || (wedding.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER)) {
            return c.json({ error: "Unauthorized access to this wedding" }, 403);
        }

        const versions = await prisma.weddingTemplateVersion.findMany({
            where: { weddingId },
            orderBy: { createdAt: 'desc' }
        });

        return c.json(versions);
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_GET]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

templatesRouter.post('/versions', async (c) => {
    try {
        const user = await getServerUser();
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

        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true, templateId: true, themeSettings: true }
        });

        if (!wedding || (wedding.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER)) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        const version = await prisma.weddingTemplateVersion.create({
            data: {
                weddingId,
                versionName,
                description,
                templateId: wedding.templateId,
                themeData: (wedding.themeSettings as any) || {},
                createdBy: (user as any).name || user.userId || (user as any).id
            }
        });

        return c.json(version);
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_POST]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

templatesRouter.delete('/versions', async (c) => {
    try {
        const user = await getServerUser();
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.query("id");

        if (!id) {
            return c.json({ error: "Version ID is required" }, 400);
        }

        const version = await prisma.weddingTemplateVersion.findUnique({
            where: { id },
            include: { wedding: true }
        });

        if (!version) {
            return c.json({ error: "Version not found" }, 404);
        }

        if (version.wedding.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        await prisma.weddingTemplateVersion.delete({
            where: { id }
        });

        return c.json({ success: true });
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_DELETE]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

templatesRouter.patch('/versions', async (c) => {
    try {
        const user = await getServerUser();
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

        const version = await prisma.weddingTemplateVersion.findUnique({
            where: { id },
            include: { wedding: true }
        });

        if (!version) {
            return c.json({ error: "Version not found" }, 404);
        }

        if (version.wedding.userId !== (user.userId || (user as any).id) && user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        await prisma.wedding.update({
            where: { id: version.weddingId },
            data: {
                templateId: version.templateId,
                themeSettings: version.themeData as any,
                updatedAt: new Date()
            }
        });

        return c.json({ success: true, templateId: version.templateId, themeSettings: version.themeData });
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_PATCH]", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default templatesRouter;
