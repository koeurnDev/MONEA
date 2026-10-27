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

// Bulk copy demo data from source template to multiple targets
// IMPORTANT: This must be defined BEFORE /:templateId route
adminTemplatePreviewRouter.post("/bulk-copy", async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    if (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER) {
        return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return c.json({ error: "Invalid payload" }, 400);
    }

    const payload = body as Record<string, unknown>;
    const sourceTemplateId = payload.sourceTemplateId;
    const targetTemplateIds = payload.targetTemplateIds;

    // Validate source template ID
    if (typeof sourceTemplateId !== "string" || !isValidTemplateId(sourceTemplateId)) {
        return c.json({ error: "Invalid source template ID" }, 400);
    }

    // Validate target template IDs
    if (!Array.isArray(targetTemplateIds) || targetTemplateIds.length === 0) {
        return c.json({ error: "Target template IDs must be a non-empty array" }, 400);
    }

    for (const id of targetTemplateIds) {
        if (typeof id !== "string" || !isValidTemplateId(id)) {
            return c.json({ error: `Invalid target template ID: ${id}` }, 400);
        }
    }

    try {
        // Fetch source template preview data
        const sourcePreview = await prisma.templatePreview.findUnique({
            where: { templateId: sourceTemplateId },
            select: { previewData: true },
        });

        if (!sourcePreview || !sourcePreview.previewData) {
            return c.json({ error: `Source template "${sourceTemplateId}" has no demo data` }, 404);
        }

        const sourceData = sourcePreview.previewData as Record<string, unknown>;

        // Prepare base data to copy (exclude template-specific settings)
        const baseCopyData = {
            groomName: sourceData.groomName,
            brideName: sourceData.brideName,
            groomFather: sourceData.groomFather,
            groomMother: sourceData.groomMother,
            brideFather: sourceData.brideFather,
            brideMother: sourceData.brideMother,
            date: sourceData.date,
            time: sourceData.time,
            location: sourceData.location,
            locationName: sourceData.locationName,
            mapUrl: sourceData.mapUrl,
            galleryItems: sourceData.galleryItems,
            activities: sourceData.activities,
            eventType: sourceData.eventType,
        };

        // Copy theme settings but exclude template-specific color presets
        const sourceThemeSettings = sourceData.themeSettings as Record<string, unknown> | undefined;
        const baseThemeSettings: Record<string, unknown> = {};

        if (sourceThemeSettings && typeof sourceThemeSettings === "object") {
            // Copy universal settings
            const universalSettings = [
                'heroImage', 'heroImagePublicId', 'heroImagePosition', 'heroImageX', 'heroImageScale',
                'heroImageBrightness', 'heroImageContrast',
                'musicUrl', 'musicUrlPublicId',
                'mapLink',
                'videoUrl',
                'loveStory', 'story', 'groomStory', 'brideStory',
                'welcomeMessage', 'invitationText', 'acknowledgment',
                'groomVow', 'brideVow', 'mainQuote',
                'customLabels',
                'storyImages', 'storyImageCaptions', 'storyImagePublicId', 'storyImagePublicIds',
                'visibility',
                'hiddenPhotoSlots', 'hiddenGalleryPhotoKeys',
                'galleryStyle',
                'facebookUrl', 'telegramUrl', 'phoneNumber', 'showSocialLinks',
                'lunarDate',
                'bankAccounts',
                'parents',
                'giftRegistry',
                'fontStyle', 'nameFont', 'nameSeparator',
                'customTypographyUrl', 'customTypographyPublicId', 'customTypographyScale', 'customTypographyY', 'customTypographyDropShadow',
                'customMonogramUrl', 'customMonogramPublicId', 'customMonogramScale', 'customMonogramY', 'customMonogramDropShadow',
                'groomPhoto', 'bridePhoto',
                'groomImagePosition', 'groomImageX', 'groomImageY', 'groomImageScale',
                'brideImagePosition', 'brideImageX', 'brideImageY', 'brideImageScale',
                'paymentQrUrl', 'locationQrUrl', 'locationQrPublicId',
                'passcode',
                'socialPreviewImage', 'socialPreviewImagePublicId',
            ];

            for (const key of universalSettings) {
                if (key in sourceThemeSettings) {
                    baseThemeSettings[key] = sourceThemeSettings[key];
                }
            }

            // Copy photo layout positions (editorial pans, etc.)
            for (const key of Object.keys(sourceThemeSettings)) {
                if (
                    key.includes('Pan') || key.includes('Image') && 
                    !universalSettings.includes(key) &&
                    !key.includes('Color') && !key.includes('Preset')
                ) {
                    baseThemeSettings[key] = sourceThemeSettings[key];
                }
            }
        }

        const copyData = {
            ...baseCopyData,
            themeSettings: baseThemeSettings,
        };

        // Copy to each target template
        const results: { templateId: string; success: boolean; error?: string }[] = [];

        for (const targetTemplateId of targetTemplateIds as string[]) {
            try {
                // Prepare data for this specific target
                const targetData = {
                    ...copyData,
                    templateId: targetTemplateId,
                };

                const sanitizedData = sanitizeObject<Record<string, unknown>>(targetData);
                delete sanitizedData.id;

                // Filter out certificates
                const galleryItems = sanitizedData.galleryItems;
                if (Array.isArray(galleryItems)) {
                    sanitizedData.galleryItems = galleryItems.filter((item) => (
                        !item || typeof item !== "object" || Array.isArray(item) || item.type !== "CERTIFICATE"
                    ));
                }

                // Remove private certificate from theme settings
                const themeSettings = sanitizedData.themeSettings;
                if (themeSettings && typeof themeSettings === "object" && !Array.isArray(themeSettings)) {
                    const cleanThemeSettings = { ...(themeSettings as Record<string, unknown>) };
                    delete cleanThemeSettings.privateCertificate;
                    sanitizedData.themeSettings = cleanThemeSettings;
                }

                const serializedData = JSON.stringify(sanitizedData);
                if (!serializedData) {
                    results.push({ templateId: targetTemplateId, success: false, error: "Serialization failed" });
                    continue;
                }

                const persistedData = JSON.parse(serializedData) as Prisma.InputJsonObject;

                // Upsert the preview data
                await prisma.templatePreview.upsert({
                    where: { templateId: targetTemplateId },
                    update: {
                        previewData: persistedData,
                        updatedBy: user.id,
                    },
                    create: {
                        templateId: targetTemplateId,
                        previewData: persistedData,
                        updatedBy: user.id,
                    },
                });

                results.push({ templateId: targetTemplateId, success: true });
            } catch (error) {
                console.error(`[BULK_COPY] Failed to copy to ${targetTemplateId}:`, error);
                results.push({ 
                    templateId: targetTemplateId, 
                    success: false, 
                    error: error instanceof Error ? error.message : "Unknown error" 
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failedResults = results.filter(r => !r.success);

        return c.json({
            success: successCount > 0,
            message: `Successfully copied demo data from "${sourceTemplateId}" to ${successCount}/${targetTemplateIds.length} template(s)`,
            results,
            failed: failedResults.length > 0 ? failedResults : undefined,
        });
    } catch (error) {
        console.error("[BULK_COPY]", error);
        return c.json({ error: "Failed to bulk copy template previews" }, 500);
    }
});

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
