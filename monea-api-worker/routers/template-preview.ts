import { Hono } from "hono";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sanitizeObject } from "@/lib/sanitize";
import type { Prisma } from "@prisma/client";

const templatePreviewRouter = new Hono();
export const adminTemplatePreviewRouter = new Hono();

const isValidTemplateId = (value: string) =>
    value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

templatePreviewRouter.get("/:templateId", async (c) => {
    const templateId = c.req.param("templateId");
    if (!isValidTemplateId(templateId)) {
        return c.json({ error: "Invalid template ID" }, 400);
    }

    try {
        const preview = await prisma.templatePreview.findUnique({
            where: { templateId },
            select: { previewData: true, updatedAt: true },
        });
        c.header("Cache-Control", "no-store");
        return c.json({
            data: {
                templateId,
                previewData: preview?.previewData ?? {},
                updatedAt: preview?.updatedAt ?? null,
            },
        });
    } catch (error) {
        console.error("[TEMPLATE_PREVIEW_GET]", error);
        return c.json({ error: "Failed to fetch template preview" }, 500);
    }
});

adminTemplatePreviewRouter.post("/:templateId", async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    if (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER) {
        return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const templateId = c.req.param("templateId");
    if (!isValidTemplateId(templateId)) {
        return c.json({ error: "Invalid template ID" }, 400);
    }

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return c.json({ error: "Invalid preview payload" }, 400);
    }

    const previewData = (body as Record<string, unknown>).previewData;
    if (!previewData || typeof previewData !== "object" || Array.isArray(previewData)) {
        return c.json({ error: "Invalid preview data" }, 400);
    }

    const sanitizedPreviewData = sanitizeObject<Record<string, unknown>>(previewData);
    delete sanitizedPreviewData.templateId;
    delete sanitizedPreviewData.id;
    const galleryItems = sanitizedPreviewData.galleryItems;
    if (Array.isArray(galleryItems)) {
        sanitizedPreviewData.galleryItems = galleryItems.filter((item) => (
            !item || typeof item !== "object" || Array.isArray(item) || item.type !== "CERTIFICATE"
        ));
    }
    const storedThemeSettings = sanitizedPreviewData.themeSettings;
    if (storedThemeSettings && typeof storedThemeSettings === "object" && !Array.isArray(storedThemeSettings)) {
        const themeSettings = { ...(storedThemeSettings as Record<string, unknown>) };
        delete themeSettings.privateCertificate;
        sanitizedPreviewData.themeSettings = themeSettings;
    }

    try {
        const serializedPreviewData = JSON.stringify(sanitizedPreviewData);
        if (!serializedPreviewData) {
            return c.json({ error: "Invalid preview data" }, 400);
        }
        const persistedPreviewData = JSON.parse(serializedPreviewData) as Prisma.InputJsonObject;
        const preview = await prisma.templatePreview.upsert({
            where: { templateId },
            update: {
                previewData: persistedPreviewData,
                updatedBy: user.id,
            },
            create: {
                templateId,
                previewData: persistedPreviewData,
                updatedBy: user.id,
            },
            select: { previewData: true, updatedAt: true },
        });

        return c.json({
            data: {
                templateId,
                previewData: preview.previewData,
                updatedAt: preview.updatedAt,
            },
            message: "Template preview saved successfully",
        });
    } catch (error) {
        console.error("[TEMPLATE_PREVIEW_SAVE]", error);
        return c.json({ error: "Failed to save template preview" }, 500);
    }
});

export default templatePreviewRouter;
