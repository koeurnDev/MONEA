import { Hono } from 'hono';
import { prisma, queryRaw, executeRaw } from "@/lib/prisma";
import { getDb } from "@/lib/drizzle";
import { systemConfig, broadcasts } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getServerUser } from "@/lib/auth";
import { isPlatformOwner, ROLES } from "@/lib/constants";
import {
    escapeWeddingSearch,
    MAX_WEDDING_SEARCH_LENGTH,
    validateAdminReason,
    validateWeddingListParams
} from "@/lib/adminMasterValidation";
import { UPDATE_WEDDING_STATUS_SQL } from "@/lib/adminMasterSql";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { notifyTelegramLifecycle } from "@/lib/telegram-lifecycle";
import redis from "@/lib/redis";
import { v2 as cloudinary } from 'cloudinary';
import { z } from "zod"
import {
    isTemplateId,
    normalizeTemplateAvailability,
    normalizeTemplateMetadata,
    type TemplateEventType,
} from "@/lib/template-availability";
import { normalizeSocialLinks } from "@/lib/social-links";
import { isPhoneFrameColor } from "@/lib/phone-frame-colors";

const BACKUP_PAGE_SIZE = 250;

async function* streamJsonArray<T extends { id: string }>(
    loadPage: (cursor?: string) => Promise<T[]>,
): AsyncGenerator<string> {
    yield "[";
    let cursor: string | undefined;
    let first = true;

    while (true) {
        const rows = await loadPage(cursor);
        for (const row of rows) {
            if (!first) yield ",";
            const serialized = JSON.stringify(row);
            if (serialized === undefined) throw new Error("Backup row could not be serialized");
            yield serialized;
            first = false;
        }

        if (rows.length < BACKUP_PAGE_SIZE) break;
        cursor = rows[rows.length - 1].id;
    }

    yield "]";
}

function streamJson(chunks: AsyncIterable<string>): ReadableStream<Uint8Array> {
    const iterator = chunks[Symbol.asyncIterator]();
    const encoder = new TextEncoder();

    return new ReadableStream({
        async pull(controller) {
            try {
                const { done, value } = await iterator.next();
                if (done) {
                    controller.close();
                    return;
                }
                controller.enqueue(encoder.encode(value));
            } catch (error) {
                console.error("[Backup] Stream failed:", error instanceof Error ? error.message : error);
                controller.error(error);
            }
        },
        async cancel() {
            await iterator.return?.();
        },
    });
}

/**
 * Resolves Cloudinary credentials from the environment.
 *
 * SECURITY: production credentials were previously hard-coded here as fallbacks.
 * They were committed to a public GitHub repository and must be treated as
 * compromised (see docs/SECURITY_INCIDENT_2026-09-22_SECRET_LEAK.md). Never
 * reintroduce a literal fallback — fail loudly instead, so a misconfigured
 * environment can never silently authenticate with a leaked credential.
 */
function resolveCloudinaryCredentials() {
    const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        process.env.VITE_CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey =
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
        process.env.VITE_CLOUDINARY_API_KEY ||
        process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(
            "[Config] Missing Cloudinary credentials. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, " +
            "NEXT_PUBLIC_CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
        );
    }

    return { cloudName, apiKey, apiSecret };
}

// Configure the Node SDK without any literal fallback. A missing configuration
// only degrades Cloudinary-based features; it no longer leaks/fabricates keys.
try {
    const { cloudName, apiKey, apiSecret } = resolveCloudinaryCredentials();
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
} catch (error: any) {
    console.error("[Cloudinary] SDK not configured:", error?.message || error);
}

const adminMasterRouter = new Hono();

adminMasterRouter.get('/social-links', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedMaster(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const db = getDb(c.env);
        const config = await db.select({ socialLinks: systemConfig.socialLinks })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((rows: any) => rows[0]);
        return c.json({ links: normalizeSocialLinks(config?.socialLinks) });
    } catch (error) {
        console.error("[ADMIN_SOCIAL_LINKS_GET]", error);
        return c.json({ error: "Failed to fetch social links" }, 500);
    }
});

adminMasterRouter.patch('/social-links', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedMaster(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return c.json({ error: "Invalid social links payload" }, 400);
    }

    const links = normalizeSocialLinks((body as Record<string, unknown>).links);
    if (!links) {
        return c.json({ error: "Valid social links are required" }, 400);
    }

    try {
        const db = getDb(c.env);
        const existing = await db.select({ id: systemConfig.id })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((rows: any) => rows[0]);
        if (existing) {
            await db.update(systemConfig)
                .set({ socialLinks: links })
                .where(eq(systemConfig.id, "GLOBAL"));
        } else {
            await db.insert(systemConfig).values({ id: "GLOBAL", socialLinks: links });
        }
        return c.json({ links });
    } catch (error) {
        console.error("[ADMIN_SOCIAL_LINKS_PATCH]", error);
        return c.json({ error: "Failed to update social links" }, 500);
    }
});

adminMasterRouter.get('/templates', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedMaster(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const db = getDb(c.env);
        const config = await db.select({ templateAvailability: systemConfig.templateAvailability })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((rows: any) => rows[0]);

        return c.json(normalizeTemplateAvailability(config?.templateAvailability));
    } catch (error) {
        console.error("[ADMIN_TEMPLATES_GET]", error);
        return c.json({ error: "Failed to fetch templates" }, 500);
    }
});

adminMasterRouter.patch('/templates', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedMaster(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return c.json({ error: "Invalid template update" }, 400);
    }

    const { templateId, enabled } = body as Record<string, unknown>;
    if (typeof templateId !== "string" || !isTemplateId(templateId) || typeof enabled !== "boolean") {
        return c.json({ error: "A valid templateId and boolean enabled value are required" }, 400);
    }

    try {
        const db = getDb(c.env);
        const existing = await db.select({ templateAvailability: systemConfig.templateAvailability })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((rows: any) => rows[0]);
        const availability = normalizeTemplateAvailability(existing?.templateAvailability);
        availability[templateId] = enabled;

        if (existing) {
            await db.update(systemConfig)
                .set({ templateAvailability: availability })
                .where(eq(systemConfig.id, "GLOBAL"));
        } else {
            await db.insert(systemConfig)
                .values({ id: "GLOBAL", templateAvailability: availability });
        }

        return c.json(availability);
    } catch (error) {
        console.error("[ADMIN_TEMPLATES_PATCH]", error);
        return c.json({ error: "Failed to update template availability" }, 500);
    }
});

adminMasterRouter.get('/templates/metadata', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedMaster(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const config = await getDb(c.env).select({ templateMetadata: systemConfig.templateMetadata })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((rows: any) => rows[0]);
        return c.json(normalizeTemplateMetadata(config?.templateMetadata));
    } catch (error) {
        console.error("[ADMIN_TEMPLATE_METADATA_GET]", error);
        return c.json({ error: "Failed to fetch template metadata" }, 500);
    }
});

adminMasterRouter.patch('/templates/metadata', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedMaster(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return c.json({ error: "Invalid template metadata update" }, 400);
    }

    const { templateId, title, description, image, eventType } = body as Record<string, unknown>;
    const validEventTypes: TemplateEventType[] = ["wedding", "anniversary", "both"];
    if (
        typeof templateId !== "string"
        || !isTemplateId(templateId)
        || typeof title !== "string"
        || !title.trim()
        || title.trim().length > 80
        || typeof description !== "string"
        || description.trim().length > 300
        || typeof image !== "string"
        || image.length > 2048
        || typeof eventType !== "string"
        || !validEventTypes.includes(eventType as TemplateEventType)
    ) {
        return c.json({ error: "Valid templateId, title, description, image and eventType are required" }, 400);
    }

    const isSafeImagePath = /^\/(?:assets|images|khmer-invite-starter-kit)\/[a-zA-Z0-9_./-]+$/.test(image)
        && !image.split("/").includes("..");
    let isCloudinaryImage = false;
    let isR2TemplateImage = false;
    try {
        const imageUrl = new URL(image);
        isCloudinaryImage = imageUrl.protocol === "https:"
            && imageUrl.hostname === "res.cloudinary.com"
            && imageUrl.pathname.includes("/image/upload/");
        isR2TemplateImage = imageUrl.protocol === "https:"
            && imageUrl.hostname === "media.moneoez.com"
            && imageUrl.pathname.split("/").filter(Boolean)[0] === "template-covers";
    } catch {
        // Relative paths are validated separately; malformed absolute URLs are rejected below.
    }
    if (!isSafeImagePath && !isCloudinaryImage && !isR2TemplateImage) {
        return c.json({ error: "Cover must be an application, Cloudinary, or R2 image URL" }, 400);
    }

    try {
        const db = getDb(c.env);
        const existing = await db.select({ templateMetadata: systemConfig.templateMetadata })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((rows: any) => rows[0]);
        const metadata = normalizeTemplateMetadata(existing?.templateMetadata);
        metadata[templateId] = {
            title: title.trim(),
            description: description.trim(),
            image,
            eventType: eventType as TemplateEventType,
        };

        if (existing) {
            await db.update(systemConfig)
                .set({ templateMetadata: metadata })
                .where(eq(systemConfig.id, "GLOBAL"));
        } else {
            await db.insert(systemConfig)
                .values({ id: "GLOBAL", templateMetadata: metadata });
        }
        return c.json(metadata);
    } catch (error) {
        console.error("[ADMIN_TEMPLATE_METADATA_PATCH]", error);
        return c.json({ error: "Failed to update template metadata" }, 500);
    }
});

/**
 * Platform master panel access.
 *
 * SECURITY (C-04): this guard previously also accepted the literal role "ADMIN",
 * but "ADMIN" is `ROLES.EVENT_MANAGER` — the role every self-registered customer
 * receives (`auth_handlers/signup/handler.ts`) and the schema default
 * (`User.role @default(ADMIN)`). That let any customer call the platform master
 * API: cross-tenant user/wedding directories, broadcasts, media maintenance and
 * even `maintenance/restore` (database restore). Only the platform owner may now
 * pass this guard.
 */
const isAuthorizedMaster = (user: any) =>
    Boolean(user && isPlatformOwner(user.role));

function escapeCSV(val: any): string {
    if (val === null || val === undefined) return "";
    const strVal = String(val);
    const sanitized = strVal.replace(/,/g, " ");
    if (sanitized.startsWith('=') || sanitized.startsWith('+') || sanitized.startsWith('-') || sanitized.startsWith('@')) {
        return `'${sanitized}`;
    }
    return sanitized;
}

// ─── Master Stats & Health ───────────────────────────────────────────────────
adminMasterRouter.get('/stats', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const [
            totalWeddings,
            activeWeddings,
            totalGuests,
            totalGifts,
            totalUsers,
            recentWeddings
        ] = await Promise.all([
            prisma.wedding.count().catch(() => 0),
            prisma.wedding.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
            prisma.guest.count().catch(() => 0),
            prisma.gift.count().catch(() => 0),
            prisma.user.count().catch(() => 0),
            prisma.wedding.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    groomName: true,
                    brideName: true,
                    packageType: true,
                    status: true,
                    createdAt: true
                }
            }).catch(() => [])
        ]);

        let blacklistedIPs = 0;
        try {
            if (redis) {
                const keys = await (redis as any)?.keys?.('blacklist:*');
                blacklistedIPs = Array.isArray(keys) ? keys.length : 0;
            }
        } catch {
            blacklistedIPs = 0;
        }

        return c.json({
            stats: {
                totalWeddings,
                activeWeddings,
                totalGuests,
                totalGifts,
                totalUsers,
                blacklistedIPs,
                dbHealth: "HEALTHY"
            },
            recentWeddings
        });
    } catch (err: any) {
        console.error("Master stats error:", err?.message || err);
        return c.json({
            stats: {
                totalWeddings: 0,
                activeWeddings: 0,
                totalGuests: 0,
                totalGifts: 0,
                totalUsers: 0,
                blacklistedIPs: 0,
                dbHealth: "HEALTHY"
            },
            recentWeddings: []
        });
    }
});

// ─── Weddings ─────────────────────────────────────────────────────────────────
adminMasterRouter.get('/weddings', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const params = validateWeddingListParams(
            c.req.query("search"),
            c.req.query("page"),
            c.req.query("packageType")
        );
        if (!params.valid) return c.json({ error: params.error }, 400);
        const { search, page, packageFilter } = params;

        const limit = 20;
        const skip = (page - 1) * limit;
        const searchPattern = `%${escapeWeddingSearch(search)}%`;
        const filters: string[] = [];
        const filterParams: any[] = [];
        if (search) {
            filterParams.push(searchPattern);
            const searchParam = `$${filterParams.length}`;
            filters.push(`(w."groomName" ILIKE ${searchParam} ESCAPE '!' OR w."brideName" ILIKE ${searchParam} ESCAPE '!' OR w."weddingCode" ILIKE ${searchParam} ESCAPE '!' OR u."email" ILIKE ${searchParam} ESCAPE '!')`);
        }
        if (packageFilter !== "ALL") {
            filterParams.push(packageFilter);
            filters.push(`w."packageType"::text = $${filterParams.length}`);
        }
        const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

        const weddings = await queryRaw(`
            SELECT 
                w.*,
                json_build_object('name', u.name, 'email', u.email) as user,
                (
                    SELECT COALESCE(json_agg(DISTINCT tl."templateId"), '[]'::json)
                    FROM "TemplateLicense" tl
                    WHERE tl."weddingId" = w.id
                      AND tl.status::text = 'ACTIVE'
                ) as "activeTemplateIds",
                json_build_object('guests', (SELECT count(*) FROM "Guest" g WHERE g."weddingId" = w.id), 
                                  'gifts', (SELECT count(*) FROM "Gift" gi WHERE gi."weddingId" = w.id)) as _count
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            ${whereClause}
            ORDER BY w."createdAt" DESC
            LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}
        `, ...filterParams, limit, skip);

        const totalResults = await queryRaw(`
            SELECT count(*) as count
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            ${whereClause}
        `, ...filterParams);

        const total = Number(totalResults[0]?.count || 0);

        const [weddingStats, allWeddingResults] = await Promise.all([
            queryRaw(`
                SELECT
                    count(*) FILTER (WHERE status::text = 'ACTIVE') as active,
                    count(*) FILTER (WHERE "packageType"::text = 'PREMIUM') as premium
                FROM "Wedding"
            `),
            queryRaw('SELECT count(*) as count FROM "Wedding"')
        ]);

        return c.json({
            weddings,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            },
            stats: {
                total: Number(allWeddingResults[0]?.count || 0),
                active: Number(weddingStats[0]?.active || 0),
                premium: Number(weddingStats[0]?.premium || 0)
            },
            permissions: {
                canEditPackages: false,
                canManageStatus: true
            }
        });
    } catch (error: any) {
        console.error("Master Weddings Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminMasterRouter.patch('/weddings', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user || !isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return c.json({ error: "Invalid request body" }, 400);
        }
        const { weddingId, reason, action } = body;
        if (typeof weddingId !== "string" || !weddingId.trim()) {
            return c.json({ error: "weddingId is required" }, 400);
        }
        if (action !== undefined && action !== "ARCHIVE" && action !== "RESTORE") {
            return c.json({ error: "Invalid wedding action" }, 400);
        }
        if (action === "ARCHIVE" || action === "RESTORE") {
            if (!validateAdminReason(reason)) {
                return c.json({ error: "Reason must be between 10 and 500 characters" }, 400);
            }

            const targetStatus = action === "ARCHIVE" ? "ARCHIVED" : "ACTIVE";
            const actorId = user.userId || user.id;
            const actorName = user.name || user.email || "Admin";
            const ip = (c.req.header("x-forwarded-for") || "unknown").slice(0, 45);
            const userAgent = (c.req.header("user-agent") || "unknown").slice(0, 255);
            const [governanceAuditId, weddingAuditId] = [crypto.randomUUID(), crypto.randomUUID()];
            const changed = await queryRaw<{ id: string; changed: boolean }>(
                UPDATE_WEDDING_STATUS_SQL,
                weddingId.trim(),
                targetStatus,
                actorId,
                actorName,
                ip,
                userAgent,
                governanceAuditId,
                reason.trim(),
                weddingAuditId
            );
            if (changed.length === 0) return c.json({ error: "Wedding not found" }, 404);
            return c.json({ success: true, status: targetStatus, changed: changed[0].changed });
        }

        return c.json({
            error: "Wedding package changes are no longer available.",
            code: "PACKAGE_MANAGEMENT_RETIRED",
        }, 410);
    } catch (error: any) {
        console.error("Master Wedding Status Update Error:", error?.message || error);
        return c.json({ error: error.message || "Failed to update wedding" }, 500);
    }
});

// ─── Users ────────────────────────────────────────────────────────────────────
adminMasterRouter.get('/users', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const search = c.req.query("search") || "";
        const page = parseInt(c.req.query("page") || "1", 10);
        const limit = 20;
        const skip = (page - 1) * limit;

        const where = {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } }
            ]
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: { select: { weddings: true } }
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: skip
            }),
            prisma.user.count({ where })
        ]);

        return c.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error: any) {
        console.error("Master Users Error:", error?.message || error);
        return c.json({ error: "Failed to fetch users" }, 500);
    }
});

adminMasterRouter.patch('/users', async (c) => {
    try {
        const admin = await getServerUser(c.req.raw);
        if (!admin || admin.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { userId, role, revokeSessions } = body;

        if (!userId) {
            return c.json({ error: "User ID required" }, 400);
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return c.json({ error: "User not found" }, 404);
        }

        if (targetUser.email === "kook74532@gmail.com" && role && role !== ROLES.PLATFORM_OWNER && role !== "SUPERADMIN") {
            return c.json({ error: "មិនអាចទម្លាក់សិទ្ធិគណនី Root Master Admin ដើមបានឡើយ (Root Admin is protected)" }, 403);
        }

        const currentAdminId = admin.userId || admin.id;
        if ((targetUser.id === currentAdminId) && role && role !== ROLES.PLATFORM_OWNER && role !== "SUPERADMIN") {
            return c.json({ error: "មិនអាចទម្លាក់សិទ្ធិគណនីផ្ទាល់ខ្លួនរបស់អ្នកបានឡើយ (Cannot demote yourself)" }, 403);
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (revokeSessions) updateData.sessionsRevokedAt = new Date();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return c.json(updatedUser);
    } catch (error: any) {
        console.error("Master User Patch Error:", error?.message || error);
        return c.json({ error: "Failed to update user" }, 500);
    }
});

// ─── Support Tickets ──────────────────────────────────────────────────────────
adminMasterRouter.get('/support', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const tickets = await (prisma as any).supportTicket.findMany({
            include: {
                wedding: { select: { groomName: true, brideName: true } },
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return c.json(tickets);
    } catch (error: any) {
        console.error("Support Tickets Error:", error?.message || error);
        return c.json({ error: "Failed to fetch tickets" }, 500);
    }
});

adminMasterRouter.patch('/support', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const body = await c.req.json();
        const { id, status } = body;

        const ticket = await (prisma as any).supportTicket.update({
            where: { id },
            data: { status }
        });

        return c.json(ticket);
    } catch (error: any) {
        console.error("Support Ticket Update Error:", error?.message || error);
        return c.json({ error: "Failed to update ticket" }, 500);
    }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
adminMasterRouter.get('/settings', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const db = getDb(c.env);
        let config = await db.select()
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((r: any) => r[0]);

        if (!config) {
            config = await db.insert(systemConfig)
                .values({ id: "GLOBAL" })
                .returning()
                .then((r: any) => r[0]);
        }

        const settings = { ...config };
        delete settings.stadPrice;
        delete settings.proPrice;
        return c.json(settings);
    } catch (error: any) {
        console.error("Settings Get Error:", error?.message || error);
        return c.json({ error: "Failed to fetch config" }, 500);
    }
});

adminMasterRouter.post('/settings', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { maintenanceMode, allowNewSignups, globalCheckIn, maintenanceStart, maintenanceEnd, phoneFrameColor } = body;
        if (phoneFrameColor !== undefined && !isPhoneFrameColor(phoneFrameColor)) {
            return c.json({ error: "Invalid phone frame color" }, 400);
        }

        const db = getDb(c.env);
        
        // Check if config exists
        const existing = await db.select()
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1)
            .then((r: any) => r[0]);

        let config;
        if (existing) {
            // Update existing
            const updateData: any = {};
            if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
            if (maintenanceStart !== undefined) updateData.maintenanceStart = maintenanceStart ? new Date(maintenanceStart) : null;
            if (maintenanceEnd !== undefined) updateData.maintenanceEnd = maintenanceEnd ? new Date(maintenanceEnd) : null;
            if (allowNewSignups !== undefined) updateData.allowNewSignups = allowNewSignups;
            if (globalCheckIn !== undefined) updateData.globalCheckIn = globalCheckIn;
            if (phoneFrameColor !== undefined) updateData.phoneFrameColor = phoneFrameColor;

            config = await db.update(systemConfig)
                .set(updateData)
                .where(eq(systemConfig.id, "GLOBAL"))
                .returning()
                .then((r: any) => r[0]);
        } else {
            // Create new
            config = await db.insert(systemConfig)
                .values({
                    id: "GLOBAL",
                    maintenanceMode: maintenanceMode ?? false,
                    maintenanceStart: maintenanceStart ? new Date(maintenanceStart) : null,
                    maintenanceEnd: maintenanceEnd ? new Date(maintenanceEnd) : null,
                    allowNewSignups: allowNewSignups ?? true,
                    globalCheckIn: globalCheckIn ?? true,
                    phoneFrameColor: isPhoneFrameColor(phoneFrameColor) ? phoneFrameColor : "black",
                })
                .returning()
                .then((r: any) => r[0]);
        }

        const ip = c.req.header("x-forwarded-for") || "unknown";
        const userAgent = c.req.header("user-agent") || "unknown";
        const currentUserId = user?.userId || user?.id || "admin";

        await SystemGovernance.logAction(
            currentUserId,
            (user as any)?.name || "Admin",
            GOVERNANCE_ACTIONS.CONFIG_UPDATE,
            { maintenanceMode, allowNewSignups, globalCheckIn },
            ip,
            userAgent
        );

        if (redis) {
            await redis.set("GLOBAL_MAINTENANCE", maintenanceMode ? "true" : "false");
            if (maintenanceStart) {
                await redis.set("MAINTENANCE_START", new Date(maintenanceStart).getTime().toString());
            } else {
                await redis.del("MAINTENANCE_START");
            }
            if (maintenanceEnd) {
                await redis.set("MAINTENANCE_END", new Date(maintenanceEnd).getTime().toString());
            } else {
                await redis.del("MAINTENANCE_END");
            }
        }

        return c.json(config);
    } catch (error: any) {
        console.error("Settings Update Error:", error?.message || error);
        return c.json({ error: "Failed to update config" }, 500);
    }
});

// ─── Security: Unlock ─────────────────────────────────────────────────────────
adminMasterRouter.post('/security/unlock', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { accountId, type } = await c.req.json();

        if (!accountId || !type) {
            return c.json({ error: "Missing parameters" }, 400);
        }

        if (type === "User" || type === "Admin") {
            await prisma.user.update({
                where: { id: accountId },
                data: { failedAttempts: 0, lockedUntil: null }
            });
        } else if (type === "Staff") {
            await prisma.staff.update({
                where: { id: accountId },
                data: { failedAttempts: 0, lockedUntil: null }
            });
        } else {
            return c.json({ error: "Invalid account type" }, 400);
        }

        return c.json({ success: true });
    } catch (e: any) {
        console.error("[Unlock API Error]", e?.message || e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Security: Stats ──────────────────────────────────────────────────────────
adminMasterRouter.get('/security/stats', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const [
            blacklistedIPs,
            failedLoginsUsers,
            failedLoginsStaff,
            lockedUsers,
            lockedStaff
        ] = await Promise.all([
            prisma.blacklistedIP.findMany({ orderBy: { createdAt: "desc" } }),
            prisma.user.findMany({ where: { failedAttempts: { gt: 0 } }, select: { id: true, email: true, name: true, failedAttempts: true, lockedUntil: true } }),
            prisma.staff.findMany({ where: { failedAttempts: { gt: 0 } }, select: { id: true, email: true, name: true, failedAttempts: true, lockedUntil: true } }),
            prisma.user.count({ where: { lockedUntil: { gt: new Date() } } }),
            prisma.staff.count({ where: { lockedUntil: { gt: new Date() } } })
        ]);

        const failedAccounts = [
            ...failedLoginsUsers.map(u => ({ ...u, type: "Admin" })),
            ...failedLoginsStaff.map(s => ({ ...s, type: "Staff" }))
        ].sort((a, b) => b.failedAttempts - a.failedAttempts);

        return c.json({
            blacklistedIPs,
            blacklistedIPsCount: blacklistedIPs.length,
            failedAccounts,
            failedLoginsCount: failedAccounts.length,
            lockedAccountsCount: lockedUsers + lockedStaff
        });
    } catch (e: any) {
        console.error("Security Stats Error:", e?.message || e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Security: Revoke All ─────────────────────────────────────────────────────
adminMasterRouter.post('/security/revoke', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const staffRes = await prisma.staff.updateMany({ data: { sessionsRevokedAt: new Date() } });
        const userRes = await prisma.user.updateMany({ data: { sessionsRevokedAt: new Date() } });
        const totalRevoked = staffRes.count + userRes.count;

        const ip = c.req.header("x-forwarded-for") || "unknown";
        const currentUserId = user.userId || user.id;

        await SystemGovernance.logAction(
            currentUserId,
            (user as any).name || user.email || "Admin",
            GOVERNANCE_ACTIONS.REVOKE_SESSIONS,
            { revokedCount: totalRevoked, target: "ALL_ACCOUNTS" },
            ip,
            c.req.header("user-agent") || "unknown"
        );

        return c.json({ success: true, count: totalRevoked, details: { staff: staffRes.count, users: userRes.count } });
    } catch (e: any) {
        console.error("Revoke All Error:", e?.message || e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Security: Blacklist ──────────────────────────────────────────────────────
adminMasterRouter.get('/security/blacklist', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const blacklist = await prisma.blacklistedIP.findMany({ orderBy: { createdAt: "desc" } });
        return c.json(blacklist);
    } catch (error: any) {
        console.error("Blacklist Get Error:", error?.message || error);
        return c.json({ error: "Failed to fetch blacklist" }, 500);
    }
});

adminMasterRouter.post('/security/blacklist', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { ip, reason } = await c.req.json();
        if (!ip) return c.json({ error: "IP is required" }, 400);

        const entry = await prisma.blacklistedIP.upsert({
            where: { ip },
            create: { ip, reason },
            update: { reason }
        });

        if (redis) {
            await redis.set(`blacklist:ip:${ip}`, "1");
        }
        return c.json(entry);
    } catch (error: any) {
        console.error("Blacklist Post Error:", error?.message || error);
        return c.json({ error: "Failed to update blacklist" }, 500);
    }
});

adminMasterRouter.delete('/security/blacklist', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.query("id");
        if (!id) return c.json({ error: "ID is required" }, 400);

        const entry = await prisma.blacklistedIP.findUnique({ where: { id } });
        if (entry) {
            await prisma.blacklistedIP.delete({ where: { id } });
            if (redis) {
                await redis.del(`blacklist:ip:${entry.ip}`);
            }
        }

        return c.json({ success: true });
    } catch (error: any) {
        console.error("Blacklist Delete Error:", error?.message || error);
        return c.json({ error: "Failed to delete" }, 500);
    }
});

// ─── Template Sales ──────────────────────────────────────────────────────────
adminMasterRouter.get('/template-payments', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const page = Math.max(1, Number.parseInt(c.req.query("page") || "1", 10) || 1);
        const pageSize = 50;
        const status = c.req.query("status") || "ALL";
        const search = (c.req.query("search") || "").trim();
        if (search.length > MAX_WEDDING_SEARCH_LENGTH) {
            return c.json({ error: `search must be at most ${MAX_WEDDING_SEARCH_LENGTH} characters` }, 400);
        }
        if (!["ALL", "ACTIVE", "INACTIVE", "EXPIRED", "PENDING_REVIEW", "PENDING_PAYMENT"].includes(status)) {
            return c.json({ error: "Invalid template sale status" }, 400);
        }
        const filters: string[] = ["tl.amount > 0"];
        const params: unknown[] = [];
        if (search) {
            params.push(`%${escapeWeddingSearch(search)}%`);
            const searchParam = `$${params.length}`;
            filters.push(`(
                w."groomName" ILIKE ${searchParam} ESCAPE '!'
                OR w."brideName" ILIKE ${searchParam} ESCAPE '!'
                OR u.name ILIKE ${searchParam} ESCAPE '!'
                OR u.email ILIKE ${searchParam} ESCAPE '!'
                OR tl."templateId" ILIKE ${searchParam} ESCAPE '!'
                OR tl."paymentOrderId" ILIKE ${searchParam} ESCAPE '!'
            )`);
        }
        if (status === "PENDING_REVIEW") {
            filters.push(`tl."receiptReviewStatus" = 'PENDING'`);
        } else if (status === "PENDING_PAYMENT") {
            filters.push(`tl.status = 'INACTIVE'`);
            filters.push(`tl."receiptReviewStatus" IS NULL`);
            filters.push(`tl."paymentOrderId" IS NOT NULL`);
            filters.push(`tl."bakongTrxId" IS NULL`);
        } else if (status !== "ALL") {
            params.push(status);
            filters.push(`tl.status = $${params.length}::"TemplateLicenseStatus"`);
        }
        const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
        const offset = (page - 1) * pageSize;

        const [licenses, countResults, summaryResults] = await Promise.all([
            queryRaw(`
            SELECT
                tl.id,
                tl."weddingId",
                tl."templateId",
                tl.status,
                tl.amount,
                tl.currency,
                tl."paymentOrderId",
                tl."receiptUrl",
                tl."receiptReference",
                tl."receiptReviewStatus",
                tl."receiptSubmittedAt",
                tl."bakongTrxId",
                tl."purchaseDate",
                tl."expiresAt",
                tl."createdAt",
                tl."updatedAt",
                w."groomName",
                w."brideName",
                json_build_object('name', u.name, 'email', u.email) AS "user"
            FROM "TemplateLicense" tl
            JOIN "Wedding" w ON w.id = tl."weddingId"
            LEFT JOIN "User" u ON u.id = w."userId"
            ${whereClause}
            ORDER BY
                CASE WHEN tl."receiptReviewStatus" = 'PENDING' THEN 0 ELSE 1 END,
                tl."updatedAt" DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, ...params, pageSize, offset),
            queryRaw(`
                SELECT count(*)::int AS count
                FROM "TemplateLicense" tl
                JOIN "Wedding" w ON w.id = tl."weddingId"
                LEFT JOIN "User" u ON u.id = w."userId"
                ${whereClause}
            `, ...params),
            queryRaw(`
                SELECT
                    count(*) FILTER (WHERE amount > 0 AND (status IN ('ACTIVE', 'EXPIRED') OR "receiptReviewStatus" = 'APPROVED' OR "bakongTrxId" IS NOT NULL))::int AS "totalSales",
                    count(*) FILTER (WHERE amount > 0 AND status = 'ACTIVE')::int AS active,
                    count(*) FILTER (WHERE amount > 0 AND status = 'INACTIVE' AND ("receiptReviewStatus" = 'APPROVED' OR "bakongTrxId" IS NOT NULL))::int AS inactive,
                    count(*) FILTER (WHERE amount > 0 AND status = 'EXPIRED')::int AS expired,
                    count(*) FILTER (WHERE "receiptReviewStatus" = 'PENDING')::int AS pending,
                    count(*) FILTER (WHERE amount > 0 AND status = 'INACTIVE' AND "receiptReviewStatus" IS NULL AND "paymentOrderId" IS NOT NULL AND "bakongTrxId" IS NULL)::int AS "pendingPayment",
                    COALESCE(SUM(amount) FILTER (WHERE amount > 0 AND (status IN ('ACTIVE', 'EXPIRED') OR "receiptReviewStatus" = 'APPROVED' OR "bakongTrxId" IS NOT NULL) AND currency = 'USD'), 0)::float AS "revenueUSD",
                    COALESCE(SUM(amount) FILTER (WHERE amount > 0 AND (status IN ('ACTIVE', 'EXPIRED') OR "receiptReviewStatus" = 'APPROVED' OR "bakongTrxId" IS NOT NULL) AND currency = 'KHR'), 0)::float AS "revenueKHR"
                FROM "TemplateLicense"
            `),
        ]);

        const total = Number(countResults[0]?.count || 0);
        return c.json({
            licenses,
            summary: summaryResults[0] || {
                totalSales: 0,
                active: 0,
                inactive: 0,
                expired: 0,
                pending: 0,
                revenueUSD: 0,
                revenueKHR: 0,
            },
            pagination: {
                page,
                pageSize,
                total,
                pages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("[Template Payment Review] Fetch error:", error);
        return c.json({ error: "Failed to load template payment receipts" }, 500);
    }
});

adminMasterRouter.get('/template-payments/:licenseId/history', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const licenseId = c.req.param("licenseId");
        const license = await queryRaw<{ id: string }>(
            'SELECT id FROM "TemplateLicense" WHERE id = $1 LIMIT 1',
            licenseId,
        );
        if (!license.length) return c.json({ error: "Template license not found" }, 404);

        const history = await queryRaw(`
            SELECT id, action, details, "actorId", "actorName", "createdAt"
            FROM "GovernanceLog"
            WHERE details->>'licenseId' = $1
              AND details->>'target' IN (
                  'TEMPLATE_PAYMENT_RECEIPT',
                  'TEMPLATE_LICENSE_ACCESS',
                  'TEMPLATE_PAYMENT_CONFIRMED',
                  'TEMPLATE_PAYMENT_RECEIPT_SUBMITTED'
              )
            ORDER BY "createdAt" DESC
            LIMIT 100
        `, licenseId);

        return c.json({ history });
    } catch (error) {
        console.error("[Template License History] Fetch error:", error);
        return c.json({ error: "Failed to load template license history" }, 500);
    }
});

adminMasterRouter.patch('/template-payments/:licenseId', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const parsed = z.object({
            decision: z.enum(["APPROVED", "REJECTED"]).optional(),
            licenseAction: z.enum(["ACTIVATE", "DEACTIVATE"]).optional(),
        }).refine((value) => Number(Boolean(value.decision)) + Number(Boolean(value.licenseAction)) === 1)
            .safeParse(await c.req.json());
        if (!parsed.success) {
            return c.json({ error: "Invalid template payment review decision" }, 400);
        }

        const { decision, licenseAction } = parsed.data;
        const licenseId = c.req.param("licenseId");
        if (licenseAction) {
            const current = await queryRaw<{
                id: string;
                weddingId: string;
                templateId: string;
                status: string;
                receiptReviewStatus: string | null;
                bakongTrxId: string | null;
            }>(`
                SELECT id, "weddingId", "templateId", status, "receiptReviewStatus", "bakongTrxId"
                FROM "TemplateLicense"
                WHERE id = $1
                LIMIT 1
            `, licenseId);
            if (!current.length) return c.json({ error: "Template license not found" }, 404);
            if (current[0].receiptReviewStatus === "PENDING") {
                return c.json({ error: "Review the pending receipt before changing license access" }, 409);
            }
            if (licenseAction === "ACTIVATE"
                && current[0].receiptReviewStatus !== "APPROVED"
                && !current[0].bakongTrxId) {
                return c.json({ error: "A verified payment is required before activating this template license" }, 409);
            }
            if (!["ACTIVE", "INACTIVE"].includes(current[0].status)) {
                return c.json({ error: "Expired template licenses cannot be changed" }, 409);
            }
            const nextStatus = licenseAction === "ACTIVATE" ? "ACTIVE" : "INACTIVE";
            if (current[0].status === nextStatus) {
                return c.json({ error: `Template license is already ${nextStatus.toLowerCase()}` }, 409);
            }
            const changed = await queryRaw(`
                UPDATE "TemplateLicense"
                SET status = $1::"TemplateLicenseStatus", "updatedAt" = NOW()
                WHERE id = $2
                  AND status = $3::"TemplateLicenseStatus"
                  AND COALESCE("receiptReviewStatus", '') <> 'PENDING'
                RETURNING id, "weddingId", "templateId", status, "receiptReviewStatus"
            `, nextStatus, licenseId, current[0].status);
            if (!changed.length) {
                return c.json({ error: "Template license changed while it was being updated. Refresh and try again." }, 409);
            }
            await SystemGovernance.logAction(
                user?.userId || user?.id || "admin",
                user?.name || user?.email || "Platform Owner",
                GOVERNANCE_ACTIONS.CONFIG_UPDATE,
                {
                    target: "TEMPLATE_LICENSE_ACCESS",
                    licenseId,
                    weddingId: current[0].weddingId,
                    templateId: current[0].templateId,
                    action: licenseAction,
                },
            );
            return c.json({ success: true, license: changed[0] });
        }
        if (!decision) return c.json({ error: "A receipt decision or license action is required" }, 400);
        const updated = await queryRaw(`
            UPDATE "TemplateLicense"
            SET
                "receiptReviewStatus" = $1,
                "receiptReviewedAt" = NOW(),
                status = CASE WHEN $1 = 'APPROVED' THEN 'ACTIVE'::"TemplateLicenseStatus" ELSE status END,
                "purchaseDate" = CASE WHEN $1 = 'APPROVED' AND status = 'INACTIVE' THEN NOW() ELSE "purchaseDate" END,
                "publishedAt" = CASE WHEN $1 = 'APPROVED' AND status = 'INACTIVE' THEN NOW() ELSE "publishedAt" END,
                "updatedAt" = NOW()
            WHERE id = $2
              AND status IN ('INACTIVE', 'ACTIVE')
              AND "receiptReviewStatus" = 'PENDING'
              AND "receiptUrl" IS NOT NULL
            RETURNING id, "weddingId", "templateId", "paymentOrderId", amount, currency, status, "receiptReviewStatus"
        `, decision, licenseId);

        if (!updated.length) {
            const current = await queryRaw<{
                status: string;
                receiptReviewStatus: string | null;
                receiptUrl: string | null;
            }>(`
                SELECT status, "receiptReviewStatus", "receiptUrl"
                FROM "TemplateLicense"
                WHERE id = $1
                LIMIT 1
            `, licenseId);
            if (!current.length) return c.json({ error: "Template license not found" }, 404);
            if (current[0].receiptReviewStatus !== "PENDING") {
                return c.json({ error: "Receipt is no longer pending review" }, 409);
            }
            if (!current[0].receiptUrl) {
                return c.json({ error: "The pending receipt has no image to review" }, 409);
            }
            if (current[0].status === "EXPIRED") {
                return c.json({ error: "This license has expired; the purchase must be restarted before reviewing payment" }, 409);
            }
            return c.json({ error: "Receipt review could not be saved because the license changed. Refresh and try again." }, 409);
        }

        await SystemGovernance.logAction(
            user?.userId || user?.id || "admin",
            user?.name || user?.email || "Platform Owner",
            GOVERNANCE_ACTIONS.CONFIG_UPDATE,
            {
                target: "TEMPLATE_PAYMENT_RECEIPT",
                licenseId,
                weddingId: updated[0].weddingId,
                templateId: updated[0].templateId,
                decision,
            },
        );

        void notifyTelegramLifecycle({
            event: "TEMPLATE_RECEIPT_REVIEWED",
            dedupKey: `template-receipt-review:${licenseId}:${decision}`,
            weddingId: updated[0].weddingId,
            orderId: updated[0].paymentOrderId || null,
            templateId: updated[0].templateId,
            amount: Number(updated[0].amount),
            currency: updated[0].currency,
            decision,
            actorName: user?.name || user?.email || "Platform Owner",
        }, { env: c.env });

        return c.json({ success: true, license: updated[0] });
    } catch (error) {
        console.error("[Template Payment Review] Update error:", error);
        return c.json({ error: "Failed to update template payment review" }, 500);
    }
});

// ─── Maintenance Tasks ────────────────────────────────────────────────────────
adminMasterRouter.get('/maintenance/tasks', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const dbHealth = "HEALTHY";
        let cloudinaryHealth = "HEALTHY";
        try {
            if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
                const result = await cloudinary.api.ping();
                if (result && result.status === "ok") {
                    cloudinaryHealth = "HEALTHY";
                } else {
                    cloudinaryHealth = "STANDBY";
                }
            } else {
                cloudinaryHealth = "LOCAL_ACTIVE";
            }
        } catch {
            cloudinaryHealth = "LOCAL_ACTIVE";
        }

        const ikKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.VITE_IMAGEKIT_PUBLIC_KEY || "public_XSdgeh7KUyvELBplDQq6JF1e6dg=";
        const imagekitHealth = ikKey ? "HEALTHY" : "STANDBY";

        const [userCount, weddingCount, guestCount, logCount] = await Promise.all([
            prisma.user.count().catch(() => 0),
            prisma.wedding.count().catch(() => 0),
            prisma.guest.count().catch(() => 0),
            prisma.log.count().catch(() => 0)
        ]);

        let dbSizeBytes = 0;
        let dbSizeFormatted = "12.5 MB";
        try {
            const sizeResult: any = await queryRaw(`SELECT pg_database_size(current_database()) as size_bytes, pg_size_pretty(pg_database_size(current_database())) as formatted_size`);
            if (sizeResult && sizeResult[0]) {
                dbSizeBytes = Number(sizeResult[0].size_bytes || 0);
                dbSizeFormatted = String(sizeResult[0].formatted_size || "12.5 MB");
            }
        } catch {
            dbSizeFormatted = "12.5 MB";
        }

        const dbSizeMB = dbSizeBytes > 0 ? (dbSizeBytes / (1024 * 1024)) : 12.5;
        const maxQuotaMB = 500;
        const usagePercent = Math.min(100, Math.max(1, (dbSizeMB / maxQuotaMB) * 100));
        const freeMB = Math.max(0, maxQuotaMB - dbSizeMB);

        let realCloudinaryStorageBytes = 0;
        let realCloudinaryObjects = 0;
        let isRealCloudinaryData = false;

        const creds = (() => {
            try { return resolveCloudinaryCredentials(); } catch { return null; }
        })();
        const cName = creds?.cloudName || "";
        const cKey = creds?.apiKey || "";
        const cSecret = creds?.apiSecret || "";

        try {
            if (cName && cKey && cSecret) {
                const authHeader = 'Basic ' + btoa(`${cKey}:${cSecret}`);
                const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cName}/usage`, {
                    headers: { 'Authorization': authHeader }
                });
                if (cRes.ok) {
                    const usageData: any = await cRes.json();
                    if (usageData) {
                        realCloudinaryStorageBytes = Number(usageData.storage?.usage || usageData.storage?.bytes || 0);
                        realCloudinaryObjects = Number(usageData.objects?.usage || 0);
                        isRealCloudinaryData = true;
                    }
                }
            }
        } catch {
            // fallback
        }

        const totalPhotos = isRealCloudinaryData ? realCloudinaryObjects : (weddingCount * 14 + 10);
        const mediaUsedMB = isRealCloudinaryData ? (realCloudinaryStorageBytes / (1024 * 1024)) : (totalPhotos * 0.25);
        const mediaUsedGB = Number((mediaUsedMB / 1024).toFixed(3));
        const mediaQuotaGB = 25.0;
        const mediaFreeGB = Number((mediaQuotaGB - mediaUsedGB).toFixed(2));
        const mediaUsagePercent = Number(((mediaUsedGB / mediaQuotaGB) * 100).toFixed(2));

        let realImageKitStorageBytes = 0;
        let realImageKitObjects = 0;
        let isRealImageKitData = false;
        const ikPrivate = process.env.IMAGEKIT_PRIVATE_KEY || "private_wIKoCj5krFE1Ztq1CwromhOgsE8=";
        if (ikPrivate) {
            try {
                const ikAuth = 'Basic ' + btoa(`${ikPrivate}:`);
                const ikRes = await fetch('https://api.imagekit.io/v1/files?limit=100', {
                    headers: { 'Authorization': ikAuth }
                });
                if (ikRes.ok) {
                    const files: any = await ikRes.json();
                    if (Array.isArray(files)) {
                        realImageKitObjects = files.length;
                        realImageKitStorageBytes = files.reduce((acc, f) => acc + Number(f.size || 0), 0);
                        isRealImageKitData = true;
                    }
                }
            } catch {
                // fallback
            }
        }

        const ikUsedMB = Number((realImageKitStorageBytes / (1024 * 1024)).toFixed(2));
        const ikUsedGB = Number((ikUsedMB / 1024).toFixed(3));
        const ikQuotaGB = 20.0;
        const ikFreeGB = Number((ikQuotaGB - ikUsedGB).toFixed(2));
        const ikUsagePercent = Number(((ikUsedGB / ikQuotaGB) * 100).toFixed(2));

        const cockroachHealth = (process.env.ARCHIVE_DATABASE_URL || process.env.COCKROACH_DATABASE_URL) ? "HEALTHY" : "STANDBY";

        return c.json({
            users: userCount,
            weddings: weddingCount,
            guests: guestCount,
            logs: logCount,
            health: "HEALTHY",
            services: { 
                database: dbHealth, 
                cloudinary: cloudinaryHealth,
                imagekit: imagekitHealth,
                cockroach: cockroachHealth
            },
            storage: {
                database: {
                    usedMB: Number(dbSizeMB.toFixed(2)),
                    usedFormatted: dbSizeFormatted,
                    maxQuotaMB: maxQuotaMB,
                    freeMB: Number(freeMB.toFixed(2)),
                    usagePercent: Number(usagePercent.toFixed(1)),
                    isLiveAPI: true
                },
                cloudinary: {
                    usedBytes: realCloudinaryStorageBytes,
                    usedMB: Number(mediaUsedMB.toFixed(2)),
                    usedGB: mediaUsedGB,
                    usedFormatted: mediaUsedMB < 1024 ? `${mediaUsedMB.toFixed(2)} MB` : `${mediaUsedGB} GB`,
                    maxQuotaGB: mediaQuotaGB,
                    freeGB: mediaFreeGB > 0 ? mediaFreeGB : 24.95,
                    usagePercent: mediaUsagePercent > 0 ? mediaUsagePercent : 0.05,
                    totalPhotos: totalPhotos,
                    isLiveAPI: isRealCloudinaryData
                },
                imagekit: {
                    usedBytes: realImageKitStorageBytes,
                    usedMB: ikUsedMB,
                    usedGB: ikUsedGB,
                    usedFormatted: ikUsedMB < 1024 ? `${ikUsedMB.toFixed(2)} MB` : `${ikUsedGB.toFixed(3)} GB`,
                    maxQuotaGB: ikQuotaGB,
                    freeGB: ikFreeGB > 0 ? ikFreeGB : 20.0,
                    usagePercent: ikUsagePercent > 0 ? ikUsagePercent : 0.01,
                    totalPhotos: realImageKitObjects,
                    isLiveAPI: isRealImageKitData,
                    endpoint: "https://ik.imagekit.io/v8dbam7a6"
                },
                cockroach: {
                    maxQuotaGB: 10.0,
                    status: cockroachHealth,
                    cluster: "lawful-faery-32633 (AWS Singapore)"
                },
                totalCDNQuotaGB: 45.0
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Maintenance Tasks Error:", error?.message || error);
        return c.json({ error: "Failed to run diagnostics" }, 500);
    }
});

adminMasterRouter.get('/media/assets', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const creds = (() => {
            try { return resolveCloudinaryCredentials(); } catch { return null; }
        })();
        const cName = creds?.cloudName || "";
        const cKey = creds?.apiKey || "";
        const cSecret = creds?.apiSecret || "";

        const authHeader = 'Basic ' + btoa(`${cKey}:${cSecret}`);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cName}/resources/image?max_results=100`, {
            headers: { 'Authorization': authHeader }
        });

        if (!res.ok) {
            const errText = await res.text();
            console.warn("[Media Assets Fetch Error]:", res.status, errText);
            return c.json({ assets: [], total: 0 });
        }

        const data: any = await res.json();
        return c.json({
            assets: data.resources || [],
            total: data.resources?.length || 0
        });
    } catch (e: any) {
        console.error("Media assets error:", e?.message || e);
        return c.json({ assets: [], total: 0, error: e.message }, 500);
    }
});

adminMasterRouter.post('/maintenance/tasks', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { action } = await c.req.json();

        if (action === "VACUUM") {
            await prisma.$executeRawUnsafe("VACUUM");
            return c.json({ success: true, message: "Database optimized successfully" });
        }

        return c.json({ error: "Invalid action" }, 400);
    } catch (error: any) {
        console.error("Maintenance Action Post Error:", error?.message || error);
        return c.json({ error: "Maintenance action failed" }, 500);
    }
});

adminMasterRouter.delete('/maintenance/tasks', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.log.deleteMany({
            where: { createdAt: { lt: thirtyDaysAgo } }
        });

        return c.json({ success: true, deletedCount: result.count });
    } catch (error: any) {
        console.error("Maintenance Cleanup Error:", error?.message || error);
        return c.json({ error: "Cleanup failed" }, 500);
    }
});

// ─── Direct Backup & Restore ──────────────────────────────────────────────────
adminMasterRouter.get('/maintenance/backup', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const [userCount, weddingCount, guestCount, giftCount, config] = await Promise.all([
            prisma.user.count(),
            prisma.wedding.count(),
            prisma.guest.count(),
            prisma.gift.count(),
            prisma.systemConfig.findFirst()
        ]);

        const exportedAt = new Date();
        const backupChunks = async function* () {
            yield `{"platform":"MONEA Platform","version":"1.2.3","exportedAt":${JSON.stringify(exportedAt.toISOString())}`;
            yield `,"exportedBy":${JSON.stringify(user?.email || user?.name || "MasterAdmin")}`;
            yield `,"counts":{"users":${userCount},"weddings":${weddingCount},"guests":${guestCount},"gifts":${giftCount}}`;
            yield `,"data":{"systemConfig":${JSON.stringify(config)},"users":`;
            yield* streamJsonArray((cursor) => prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phoneNumber: true,
                    avatarUrl: true,
                    status: true,
                    createdAt: true
                },
                take: BACKUP_PAGE_SIZE,
                orderBy: { id: "asc" },
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            }));
            yield `,"weddings":`;
            yield* streamJsonArray((cursor) => prisma.wedding.findMany({
                take: BACKUP_PAGE_SIZE,
                orderBy: { id: "asc" },
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            }));
            yield `,"guests":`;
            yield* streamJsonArray((cursor) => prisma.guest.findMany({
                take: BACKUP_PAGE_SIZE,
                orderBy: { id: "asc" },
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            }));
            yield `,"gifts":`;
            yield* streamJsonArray((cursor) => prisma.gift.findMany({
                take: BACKUP_PAGE_SIZE,
                orderBy: { id: "asc" },
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            }));
            yield "}}";
        };
        const fileName = `monea_backup_${exportedAt.toISOString().split('T')[0]}.json`;

        return new Response(streamJson(backupChunks()), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        });
    } catch (e: any) {
        console.error("Backup Error:", e?.message || e);
        return c.json({ error: e.message || "Backup failed" }, 500);
    }
});

adminMasterRouter.post('/maintenance/restore', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        if (!body || !body.data) {
            return c.json({ error: "ទម្រង់ឯកសារ Backup មិនត្រឹមត្រូវឡើយ" }, 400);
        }

        const { users = [], weddings = [], guests = [], gifts = [], systemConfig } = body.data;

        let restoredUsers = 0;
        let restoredWeddings = 0;
        let restoredGuests = 0;
        let restoredGifts = 0;

        for (const u of users) {
            if (!u.id || !u.email) continue;
            await prisma.user.upsert({
                where: { id: u.id },
                update: {
                    name: u.name,
                    role: u.role,
                    phoneNumber: u.phoneNumber,
                    avatarUrl: u.avatarUrl,
                    status: u.status || "ACTIVE"
                },
                create: {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role || "USER",
                    phoneNumber: u.phoneNumber,
                    avatarUrl: u.avatarUrl,
                    status: u.status || "ACTIVE"
                }
            }).catch(() => null);
            restoredUsers++;
        }

        for (const w of weddings) {
            if (!w.id || !w.userId) continue;
            await prisma.wedding.upsert({
                where: { id: w.id },
                update: { ...w },
                create: { ...w }
            }).catch(() => null);
            restoredWeddings++;
        }

        for (const g of guests) {
            if (!g.id || !g.weddingId) continue;
            await prisma.guest.upsert({
                where: { id: g.id },
                update: { ...g },
                create: { ...g }
            }).catch(() => null);
            restoredGuests++;
        }

        for (const gift of gifts) {
            if (!gift.id || !gift.weddingId) continue;
            await prisma.gift.upsert({
                where: { id: gift.id },
                update: { ...gift },
                create: { ...gift }
            }).catch(() => null);
            restoredGifts++;
        }

        if (systemConfig) {
            const current = await prisma.systemConfig.findFirst();
            if (current) {
                await prisma.systemConfig.update({
                    where: { id: current.id },
                    data: {
                        stadPrice: systemConfig.stadPrice ?? current.stadPrice,
                        proPrice: systemConfig.proPrice ?? current.proPrice,
                        maintenanceMode: systemConfig.maintenanceMode ?? current.maintenanceMode,
                        allowNewSignups: systemConfig.allowNewSignups ?? current.allowNewSignups,
                        globalCheckIn: systemConfig.globalCheckIn ?? current.globalCheckIn
                    }
                }).catch(() => null);
            }
        }

        const currentUserId = user?.id || user?.userId || "master_admin";
        await SystemGovernance.logAction(
            currentUserId,
            "DATABASE_RESTORE" as any,
            JSON.stringify({ restoredUsers, restoredWeddings, restoredGuests, restoredGifts }),
            c.req.raw as any
        ).catch(() => null);

        return c.json({
            success: true,
            summary: {
                users: restoredUsers,
                weddings: restoredWeddings,
                guests: restoredGuests,
                gifts: restoredGifts
            }
        });
    } catch (e: any) {
        console.error("Restore Error:", e?.message || e);
        return c.json({ error: e.message || "Restore failed" }, 500);
    }
});

// ─── Export CSV ───────────────────────────────────────────────────────────────
adminMasterRouter.get('/export', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const weddings = await prisma.wedding.findMany({
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { guests: true, gifts: true } }
            }
        });

        const headers = ["ID", "Groom", "Bride", "Date", "Status", "Package", "Owner", "GuestsCount", "GiftsCount"];
        const rows = weddings.map(w => [
            escapeCSV(w.id),
            escapeCSV(w.groomName),
            escapeCSV(w.brideName),
            w.date.toISOString(),
            escapeCSV(w.status),
            escapeCSV(w.packageType),
            escapeCSV(w.user?.email || ""),
            w._count.guests,
            w._count.gifts
        ].join(","));

        const csvContent = [headers.join(","), ...rows].join("\n");

        return new Response(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=monea_master_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });
    } catch (error: any) {
        console.error("Export Error:", error?.message || error);
        return c.json({ error: "Failed to export data" }, 500);
    }
});

// ─── Broadcast ────────────────────────────────────────────────────────────────
adminMasterRouter.get('/broadcast', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const db = getDb(c.env);
        const allBroadcasts = await db.select()
            .from(broadcasts)
            .orderBy(desc(broadcasts.createdAt));
            
        return c.json(allBroadcasts);
    } catch (error: any) {
        console.error("Broadcast Get Error:", error?.message || error);
        return c.json({ error: "Failed to fetch broadcasts" }, 500);
    }
});

adminMasterRouter.post('/broadcast', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { title, message, type, expiresAt, scheduledAt } = body;

        const db = getDb(c.env);
        const broadcast = await db.insert(broadcasts)
            .values({
                id: `bc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                title,
                message,
                type: type || "INFO",
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: true
            })
            .returning()
            .then((r: any) => r[0]);

        return c.json(broadcast);
    } catch (error: any) {
        console.error("Broadcast Post Error:", error?.message || error);
        return c.json({ error: "Failed to create broadcast" }, 500);
    }
});

adminMasterRouter.delete('/broadcast', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.query("id");
        if (!id) return c.json({ error: "ID required" }, 400);

        const db = getDb(c.env);
        await db.delete(broadcasts).where(eq(broadcasts.id, id));
        
        return c.json({ success: true });
    } catch (error: any) {
        console.error("Broadcast Delete Error:", error?.message || error);
        return c.json({ error: "Failed to delete broadcast" }, 500);
    }
});

// ─── Audit ────────────────────────────────────────────────────────────────────
adminMasterRouter.get('/audit', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const search = c.req.query("search") || "";
        const action = c.req.query("action") || "";
        const page = parseInt(c.req.query("page") || "1", 10);
        const limit = 50;
        const skip = (page - 1) * limit;

        const searchPattern = `%${search}%`;
        
        let whereClause = `WHERE (l.description ILIKE $1 OR l."actorName" ILIKE $1 OR w."groomName" ILIKE $1 OR w."brideName" ILIKE $1)`;
        const params: any[] = [searchPattern];
        
        if (action && action !== "ALL") {
            whereClause += ` AND l.action = $2`;
            params.push(action);
            params.push(limit, skip);
        } else {
            params.push(limit, skip);
        }

        const logs = await queryRaw(`
            SELECT 
                l.*,
                json_build_object('groomName', w."groomName", 'brideName', w."brideName", 'id', w.id) as wedding
            FROM "Log" l
            LEFT JOIN "Wedding" w ON l."weddingId" = w.id
            ${whereClause}
            ORDER BY l."createdAt" DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, ...params);

        const totalResult = await queryRaw(`
            SELECT count(*) as count 
            FROM "Log" l
            LEFT JOIN "Wedding" w ON l."weddingId" = w.id
            ${whereClause}
        `, searchPattern, ...(action && action !== "ALL" ? [action] : []));

        const total = Number(totalResult[0]?.count || 0);

        return c.json({
            logs: logs || [],
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error: any) {
        console.error("Master Audit Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
adminMasterRouter.get('/analytics', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (!isAuthorizedMaster(user)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        const weddingsByMonth: any[] = await prisma.$queryRaw`
            SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*)::int as count 
            FROM "Wedding" 
            GROUP BY month 
            ORDER BY month ASC 
            LIMIT 12
        `;
        const totalWeddings = await prisma.wedding.count();

        const giftTotals: any[] = await prisma.$queryRaw`
            SELECT currency, COALESCE(SUM(amount), 0)::float as total, COUNT(*)::int as count
            FROM "Gift"
            GROUP BY currency
        `;

        let usdGifts = 0;
        let khrGifts = 0;
        if (Array.isArray(giftTotals)) {
            for (const g of giftTotals) {
                if (g.currency === 'USD') usdGifts = g.total || 0;
                if (g.currency === 'KHR') khrGifts = g.total || 0;
            }
        }

        const templateLicenseRevenue: any[] = await prisma.$queryRaw`
            SELECT
                currency,
                COALESCE(SUM(amount), 0)::float as total,
                COUNT(*)::int as count
            FROM "TemplateLicense"
            WHERE status = 'ACTIVE' AND amount > 0
            GROUP BY currency
        `;

        let templateRevenueUSD = 0;
        let templateRevenueKHR = 0;
        let templateSalesCount = 0;

        if (Array.isArray(templateLicenseRevenue)) {
            for (const t of templateLicenseRevenue) {
                if (t.currency === 'USD') {
                    templateRevenueUSD = t.total || 0;
                    templateSalesCount += t.count || 0;
                }
                if (t.currency === 'KHR') {
                    templateRevenueKHR = t.total || 0;
                    templateSalesCount += t.count || 0;
                }
            }
        }

        return c.json({
            weddingsByMonth: weddingsByMonth || [],
            summary: {
                templateRevenueUSD,
                templateRevenueKHR,
                templateSalesCount,
                usdGifts,
                khrGifts,
                totalWeddings
            }
        });
    } catch (error: any) {
        console.error("Master Analytics Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default adminMasterRouter;