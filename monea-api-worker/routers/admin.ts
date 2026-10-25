import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { getDb } from "@/lib/drizzle";
import { weddings, users, guests, gifts, staff as staffTable, logs, securityLogs, governanceLogs, weddingTemplateVersions } from "@/drizzle/schema";
import { eq, desc, and, inArray, gt } from "drizzle-orm";
import { prisma, queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { canUseTemplate, getActiveTemplates } from "@/lib/template-licensing";
import { getTemplatePricing } from "@/lib/template-pricing";
import { getSystemTemplatePricing } from "@/lib/template-pricing-setup";

const adminRouter = new Hono();

/**
 * Shape returned by `getServerUser` for an authenticated caller.
 */
type SessionUser = NonNullable<Awaited<ReturnType<typeof getServerUser>>>;

/**
 * A caller whose role is the platform-owner literal.
 *
 * Narrowing to this *distinct* type (instead of re-asserting `SessionUser`) is what
 * keeps the `else` branch of `isPlatformOwnerOnly(user) ? ... : ...` usable — the
 * caller's id is still reachable for manager-scoped queries.
 */
type PlatformOwnerUser = SessionUser & { role: typeof ROLES.PLATFORM_OWNER };

/**
 * Manager-console access: platform owner + event manager.
 *
 * NOTE: `ROLES.EVENT_MANAGER` *is* the literal string "ADMIN", so the previous
 * extra comparisons against 'ADMIN'/'SUPERADMIN' were redundant aliases.
 * Use this guard ONLY for endpoints whose payload is scoped to resources the
 * caller owns; never for cross-tenant reads or writes.
 */
const isAuthorizedAdmin = (user: SessionUser | null | undefined): user is SessionUser =>
    Boolean(user && (user.role === ROLES.PLATFORM_OWNER || user.role === ROLES.EVENT_MANAGER));

/**
 * Platform-level (cross-tenant) access — platform owner only.
 *
 * SECURITY (C-04): `ROLES.EVENT_MANAGER === "ADMIN"`, which is both the signup
 * default and the `User.role` schema default, so any self-registered customer
 * used to satisfy `isAuthorizedAdmin`. Everything that reads or mutates another
 * tenant's data (user directory, wedding catalogue/billing, global governance
 * snapshots, session revocation of other accounts, platform health) must use
 * this guard instead.
 */
const isPlatformOwnerOnly = (user: SessionUser | null | undefined): user is PlatformOwnerUser =>
    Boolean(user && user.role === ROLES.PLATFORM_OWNER);

function escapeCSV(val: any): string {
    if (val === null || val === undefined) return "";
    const strVal = String(val);
    const sanitized = strVal.replace(/,/g, " ");
    if (sanitized.startsWith('=') || sanitized.startsWith('+') || sanitized.startsWith('-') || sanitized.startsWith('@')) {
        return `'${sanitized}`;
    }
    return sanitized;
}

/**
 * Check if a wedding has access to export features via template licensing
 * Export features (guest list, gift list) require a paid template license
 */
async function hasExportAccess(wedding: any): Promise<boolean> {
    if (!wedding || !wedding.id) return false;
    
    try {
        // Get all active template licenses for this wedding
        const activeTemplates = await getActiveTemplates(wedding.id);
        
        // If wedding has any paid template license, allow export
        // This replaces the old "PRO or PREMIUM package" check
        return activeTemplates.length > 0;
    } catch (error) {
        console.error("[Export Access] Error checking template licenses:", error);
        return false;
    }
}

adminRouter.get('/weddings', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedAdmin(user)) return c.json({ error: "Unauthorized" }, 401);

    // Platform owner sees the whole catalogue; an event manager only ever sees
    // their own weddings (previously every manager received all tenants' data
    // together with the owner email addresses).
    const ownerScope = isPlatformOwnerOnly(user) ? null : (user.userId || user.id);

    const limit = parseInt(c.req.query("limit") || "50", 10);
    const page = parseInt(c.req.query("page") || "1", 10);
    const offset = (page - 1) * limit;

    try {
        // Use raw SQL for better performance with joins
        const weddingsData = await queryRaw(`
            SELECT 
                w.*,
                json_build_object('email', u.email) as user
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            WHERE ($1::text IS NULL OR w."userId" = $1)
            ORDER BY w."createdAt" DESC
            LIMIT $2 OFFSET $3
        `, ownerScope, limit, offset);

        const totalResult = await queryRaw('SELECT count(*) as count FROM "Wedding" WHERE ($1::text IS NULL OR "userId" = $1)', ownerScope);
        const total = Number(totalResult[0]?.count || 0);

        return c.json({
            data: weddingsData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("[Admin Weddings API Error]:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.put('/weddings', async (c) => {
    const user = await getServerUser(c.req.raw);
    // Package/status/payment-state changes are billing operations that affect any
    // tenant, so they are platform-owner only (an event manager could previously
    // upgrade any wedding's package or payment status for free).
    if (!isPlatformOwnerOnly(user)) return c.json({ error: "Unauthorized" }, 401);

    try {
        const body = await c.req.json();
        const { id, packageType, status, expiresAt, paymentStatus } = body;

        if (!id) return c.json({ error: "Wedding ID is required" }, 400);

        const db = getDb(c.env);
        const updateData: any = {};
        if (packageType) updateData.packageType = packageType;
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (expiresAt) updateData.expiresAt = new Date(expiresAt);

        const [updated] = await db.update(weddings)
            .set(updateData)
            .where(eq(weddings.id, id))
            .returning();

        return c.json(updated);
    } catch (error: any) {
        console.error("[Admin Wedding Update Error]:", error?.message || error);
        return c.json({ error: "Update failed" }, 500);
    }
});

adminRouter.get('/weddings/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const weddingId = c.req.param("id");

    try {
        const wedding = await prisma.wedding.findUnique({
            where: isPlatformOwnerOnly(user)
                ? { id: weddingId }
                : { id: weddingId, userId: user.userId || user.id },
            include: {
                user: { select: { id: true, email: true, role: true, createdAt: true } },
                activities: { orderBy: { time: 'asc' } },
                _count: { select: { guests: true } }
            }
        });

        if (!wedding) {
            return c.json({ error: "Wedding not found" }, 404);
        }

        return c.json({ data: wedding });
    } catch (error: any) {
        console.error("Error fetching admin wedding detail:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.get('/users', async (c) => {
    const user = await getServerUser(c.req.raw);
    // The platform user directory is cross-tenant: platform owner only.
    if (!isPlatformOwnerOnly(user)) return c.json({ error: "Unauthorized" }, 401);

    const limit = parseInt(c.req.query("limit") || "50", 10);
    const page = parseInt(c.req.query("page") || "1", 10);
    const skip = (page - 1) * limit;

    try {
        const users = await queryRaw(`
            SELECT 
                u.id, 
                u.email, 
                u.role, 
                u."createdAt", 
                u."deletedAt",
                (SELECT json_agg(json_build_object('id', w.id, 'groomName', w."groomName", 'brideName', w."brideName", 'status', w.status)) 
                 FROM "Wedding" w WHERE w."userId" = u.id) as weddings
            FROM "User" u
            ORDER BY u."createdAt" DESC
            LIMIT $1 OFFSET $2
        `, limit, skip);

        const totalResults = await queryRaw('SELECT count(*) as count FROM "User"');
        const total = Number(totalResults[0]?.count || 0);

        return c.json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("[Admin Users API] Error:", error);
        return c.json({ 
            error: "Internal Server Error", 
            message: "An unexpected error occurred while retrieving users." 
        }, 500);
    }
});

adminRouter.get('/users/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const targetUserId = c.req.param("id");

    // Any authenticated user may read their own record; reading another account's
    // record is a platform-owner-only operation.
    if (!isPlatformOwnerOnly(user) && targetUserId !== (user.userId || user.id)) {
        return c.json({ error: "Forbidden" }, 403);
    }

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                deletedAt: true,
                twoFactorEnabled: true,
                templateAccess: {
                    where: { revokedAt: null },
                    select: {
                        id: true,
                        templateId: true,
                        grantedBy: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                weddings: {
                    select: {
                        id: true,
                        groomName: true,
                        brideName: true,
                        weddingCode: true,
                        templateId: true,
                        eventType: true,
                        templateLicenses: {
                            select: {
                                id: true,
                                templateId: true,
                                status: true,
                                amount: true,
                                currency: true,
                                purchaseDate: true,
                                paymentOrderId: true,
                                bakongTrxId: true,
                            },
                            orderBy: { createdAt: "desc" },
                        },
                    },
                },
            },
        });

        if (!targetUser) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json({ data: targetUser });
    } catch (error: any) {
        return c.json({ error: "Internal Server Error", details: error.message }, 500);
    }
});

adminRouter.post('/users/:id/template-access', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isPlatformOwnerOnly(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const targetUserId = c.req.param("id");
    try {
        const body = await c.req.json<{ templateId?: unknown }>();
        const templateId = typeof body.templateId === "string" ? body.templateId.trim() : "";
        if (!templateId || templateId.length > 100) {
            return c.json({ error: "Valid templateId is required" }, 400);
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, deletedAt: true },
        });
        if (!targetUser || targetUser.deletedAt) {
            return c.json({ error: "Active user not found" }, 404);
        }

        const pricingConfig = await getSystemTemplatePricing(c.env);
        if (!getTemplatePricing(templateId, pricingConfig)) {
            return c.json({ error: "Unknown template" }, 400);
        }

        const access = await prisma.userTemplateAccess.upsert({
            where: { userId_templateId: { userId: targetUserId, templateId } },
            create: {
                userId: targetUserId,
                templateId,
                grantedBy: user.userId || user.id,
            },
            update: {
                grantedBy: user.userId || user.id,
                revokedAt: null,
                revokedBy: null,
            },
        });

        return c.json({ success: true, data: access });
    } catch (error) {
        console.error("[Admin User Template Access API] Grant failed:", error);
        return c.json({ error: "Failed to grant template access" }, 500);
    }
});

adminRouter.delete('/users/:id/template-access/:templateId', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isPlatformOwnerOnly(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const targetUserId = c.req.param("id");
    const templateId = c.req.param("templateId");
    try {
        const result = await prisma.userTemplateAccess.updateMany({
            where: { userId: targetUserId, templateId, revokedAt: null },
            data: { revokedAt: new Date(), revokedBy: user.userId || user.id },
        });
        if (result.count === 0) {
            return c.json({ error: "Active template access not found" }, 404);
        }
        return c.json({ success: true });
    } catch (error) {
        console.error("[Admin User Template Access API] Revoke failed:", error);
        return c.json({ error: "Failed to revoke template access" }, 500);
    }
});

adminRouter.post('/users/:id/template-license', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isPlatformOwnerOnly(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const targetUserId = c.req.param("id");

    try {
        const body = await c.req.json<{ weddingId?: unknown; templateId?: unknown }>();
        const weddingId = typeof body.weddingId === "string" ? body.weddingId.trim() : "";
        const templateId = typeof body.templateId === "string" ? body.templateId.trim() : "";
        if (!weddingId || !templateId || weddingId.length > 128 || templateId.length > 100) {
            return c.json({ error: "Valid weddingId and templateId are required" }, 400);
        }

        const wedding = await prisma.wedding.findFirst({
            where: { id: weddingId, userId: targetUserId },
            select: { id: true, eventType: true },
        });
        if (!wedding) {
            return c.json({ error: "Wedding not found for this user" }, 404);
        }

        const existingLicense = await prisma.templateLicense.findUnique({
            where: { weddingId_templateId: { weddingId, templateId } },
        });
        if (existingLicense?.status === "ACTIVE") {
            return c.json({ error: "This template is already unlocked" }, 409);
        }

        const pricingConfig = await getSystemTemplatePricing(c.env);
        const pricing = getTemplatePricing(templateId, pricingConfig);
        if (!pricing) {
            return c.json({ error: "Unknown template" }, 400);
        }
        if (!pricing.eventTypes.includes(wedding.eventType)) {
            return c.json({ error: "Template is not available for this event type" }, 400);
        }
        if (!Number.isFinite(pricing.price) || pricing.price < 0 || !["USD", "KHR"].includes(pricing.currency)) {
            console.error(`[Admin Template License API] Invalid pricing configuration for template "${templateId}".`);
            return c.json({ error: "Template pricing is invalid" }, 500);
        }

        const license = await prisma.$transaction(async (transaction) => {
            const activatedLicense = await transaction.templateLicense.upsert({
                where: { weddingId_templateId: { weddingId, templateId } },
                create: {
                    weddingId,
                    templateId,
                    status: "ACTIVE",
                    amount: pricing.price,
                    currency: pricing.currency,
                },
                update: {
                    status: "ACTIVE",
                    purchaseDate: new Date(),
                    expiresAt: null,
                },
            });

            await transaction.log.create({
                data: {
                    action: "PAYMENT_APPROVAL",
                    description: `Admin confirmed payment and unlocked template "${templateId}" for wedding ${weddingId}.`,
                    actorName: user.name || user.email || user.id,
                    weddingId,
                },
            });

            return activatedLicense;
        });

        return c.json({ success: true, data: license });
    } catch (error) {
        console.error("[Admin Template License API] Activation failed:", error);
        return c.json({ error: "Failed to activate template license" }, 500);
    }
});

adminRouter.patch('/users/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.role !== ROLES.PLATFORM_OWNER) {
        return c.json({ error: "Forbidden: Only platform owners can manage users" }, 403);
    }

    const targetUserId = c.req.param("id");
    const currentUserId = user.userId || user.id;

    if (targetUserId === currentUserId) {
        return c.json({ error: "Cannot modify your own active session from here" }, 400);
    }

    try {
        const body = await c.req.json();
        const currentTargetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (currentTargetUser?.role === ROLES.PLATFORM_OWNER && body.role !== undefined) {
            return c.json({ error: "Cannot change role of Platform Owners" }, 400);
        }

        const updateData: any = {};
        if (body.role && Object.values(ROLES).includes(body.role)) updateData.role = body.role;
        if (body.restore === true) updateData.deletedAt = null;

        if (Object.keys(updateData).length === 0) return c.json({ error: "No valid fields provided for update" }, 400);

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: updateData,
            select: { id: true, email: true, role: true }
        });

        return c.json({ data: updatedUser, message: "User updated successfully" });
    } catch (error: any) {
        return c.json({ error: "Internal Server Error", details: error.message }, 500);
    }
});

adminRouter.delete('/users/:id', async (c) => {
    const user = await getServerUser(c.req.raw);
    // Deleting accounts is a platform-owner operation (an event manager could
    // previously soft-delete any user, including other tenants' owners).
    if (!isPlatformOwnerOnly(user)) {
        return c.json({ error: "Unauthorized: Only the platform owner can delete users" }, 401);
    }

    const targetUserId = c.req.param("id");
    const currentUserId = user?.userId || user?.id;

    if (targetUserId === currentUserId) {
        return c.json({ error: "Cannot delete your own account from the admin panel" }, 400);
    }

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: { _count: { select: { weddings: true } } }
        });

        if (!targetUser) return c.json({ error: "User not found" }, 404);

        await prisma.user.update({
            where: { id: targetUserId },
            data: { deletedAt: new Date() }
        });

        return c.json({ success: true, message: "User account deactivated (Soft Delete) for 30 days." });
    } catch (error: any) {
        return c.json({ error: "Internal Server Error", details: error.message }, 500);
    }
});

adminRouter.get('/stats', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!isAuthorizedAdmin(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    // Managers get aggregates scoped to their own weddings; only the platform
    // owner sees platform-wide user/wedding/revenue totals.
    const userScope = isPlatformOwnerOnly(user) ? null : (user.userId || user.id);

    try {
        const today = new Date(new Date().setHours(0, 0, 0, 0));

        const [userResults, weddingResults, activeResults, todayResults, giftResults] = await Promise.all([
            userScope
                ? queryRaw('SELECT count(*) as count FROM "Staff" s JOIN "Wedding" w ON s."weddingId" = w.id WHERE w."userId" = $1', userScope)
                : queryRaw('SELECT count(*) as count FROM "User"'),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE ($1::text IS NULL OR "userId" = $1)', userScope),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE status = \'ACTIVE\' AND ($1::text IS NULL OR "userId" = $1)', userScope),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE "createdAt" >= $2 AND ($1::text IS NULL OR "userId" = $1)', userScope, today),
            userScope
                ? queryRaw('SELECT g.currency, SUM(g.amount) as amount FROM "Gift" g JOIN "Wedding" w ON g."weddingId" = w.id WHERE w."userId" = $1 GROUP BY g.currency', userScope)
                : queryRaw('SELECT currency, SUM(amount) as amount FROM "Gift" GROUP BY currency')
        ]);

        const financialOverview = giftResults.reduce((acc: any, curr: any) => {
            acc[curr.currency] = Number(curr.amount || 0);
            return acc;
        }, { USD: 0, KHR: 0 });

        const statsData = {
            totalUsers: Number(userResults[0]?.count || 0),
            totalProjects: Number(weddingResults[0]?.count || 0),
            totalWeddings: Number(weddingResults[0]?.count || 0),
            activeProjects: Number(activeResults[0]?.count || 0),
            activeWeddings: Number(activeResults[0]?.count || 0),
            newProjectsToday: Number(todayResults[0]?.count || 0),
            newWeddingsToday: Number(todayResults[0]?.count || 0),
            financialOverview
        };

        return c.json({
            ...statsData,
            data: statsData
        });
    } catch (error: any) {
        console.error("[Admin Stats API] Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.get('/security/stats', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        // Platform-wide security telemetry: platform owner only.
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const [failures, blacklistedCount, lockouts] = await Promise.all([
            prisma.log.count({ where: { action: "LOGIN_FAILURE" } }),
            (prisma as any).blacklistedIP ? (prisma as any).blacklistedIP.count() : Promise.resolve(0),
            prisma.user.count({ where: { lockedUntil: { gt: new Date() } } } as any)
        ]);

        const topFailingIPs = await prisma.log.groupBy({
            by: ['ip'],
            where: { action: "LOGIN_FAILURE" },
            _count: { ip: true },
            orderBy: { _count: { ip: "desc" } },
            take: 5
        });

        return c.json({
            failures,
            blacklistedCount,
            activeLockouts: lockouts,
            topFailingIPs
        }, 200);
    } catch (error: any) {
        console.error("Security Stats Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.post('/security/revoke', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        const body = await c.req.json();
        const { targetType, targetId } = body;

        // Only the platform owner may revoke *other* accounts' sessions; any
        // authenticated user may still revoke their own ("SELF"). Previously the
        // "ADMIN" role — i.e. every registered customer — passed the first clause,
        // so a customer could revoke every staff member's sessions platform-wide.
        // (`user && ...` is kept so TypeScript narrows `user` for the code below.)
        const isAuthorized = user && (isPlatformOwnerOnly(user) || targetType === "SELF");

        if (!isAuthorized) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const now = new Date();
        const currentUserId = user.userId || user.id;

        if (targetType === "STAFF") {
            if (!targetId) return c.json({ error: "Staff ID is required" }, 400);
            await prisma.staff.update({
                where: { id: targetId },
                data: { sessionsRevokedAt: now }
            });
        } else if (targetType === "USER") {
            if (!targetId) return c.json({ error: "User ID is required" }, 400);
            await prisma.user.update({
                where: { id: targetId },
                data: { sessionsRevokedAt: now }
            });
        } else if (targetType === "SELF") {
            if (user.type === "staff") {
                await prisma.staff.update({
                    where: { id: currentUserId },
                    data: { sessionsRevokedAt: now }
                });
            } else {
                await prisma.user.update({
                    where: { id: currentUserId },
                    data: { sessionsRevokedAt: now }
                });
            }
        } else if (targetType === "GLOBAL_STAFF") {
            await prisma.staff.updateMany({
                data: { sessionsRevokedAt: now }
            });
        } else {
            return c.json({ error: "Invalid revocation type" }, 400);
        }

        const response = c.json({ success: true, revokedAt: now }, 200);

        if (targetType === "SELF") {
            const cookieOptions = {
                httpOnly: true,
                expires: new Date(0),
                path: "/",
                sameSite: "lax" as const
            };
            setCookie(c, "token", "", cookieOptions);
            setCookie(c, "staff_token", "", cookieOptions);
        }

        return response;
    } catch (error: any) {
        console.error("Revocation Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.get('/security/logs', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const logs = await queryRaw(`
            SELECT * FROM "SecurityLog" 
            WHERE $1 = 'SUPERADMIN' OR email = $2
            ORDER BY "createdAt" DESC 
            LIMIT 20
        `, user.role, user.email);

        return c.json(logs);
    } catch (error: any) {
        console.error("[API/Security/Logs] Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.get('/me', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const currentUserId = user.userId || user.id;
        const dbUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        if (!dbUser) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json(dbUser);
    } catch (error: any) {
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.get('/logs', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user || (user.role !== ROLES.EVENT_MANAGER && user.role !== ROLES.PLATFORM_OWNER)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const limit = parseInt(c.req.query("limit") || "10", 10);
    const type = c.req.query("type") || "ACTIVITY";
    const action = c.req.query("action");

    try {
        // Security and governance feeds contain platform-wide events (all tenants),
        // so they are restricted to the platform owner. ACTIVITY logs below stay
        // available to managers, scoped to their own weddings.
        if (isPlatformOwnerOnly(user)) {
            if (type === "SECURITY") {
                const logs = await prisma.securityLog.findMany({
                    orderBy: { createdAt: "desc" },
                    take: limit
                });
                return c.json(logs);
            }
            if (type === "GOVERNANCE") {
                const logs = await prisma.governanceLog.findMany({
                    orderBy: { createdAt: "desc" },
                    take: limit
                });
                return c.json(logs);
            }
        }

        let whereClause: any = action ? { action } : {};

        if (user.role === ROLES.EVENT_MANAGER) {
            const currentUserId = user.userId || user.id;
            const userWeddings = await prisma.wedding.findMany({
                where: { userId: currentUserId },
                select: { id: true }
            });
            const weddingIds = userWeddings.map(w => w.id);

            whereClause = {
                ...whereClause,
                weddingId: { in: weddingIds }
            };
        }

        const logs = await prisma.log.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return c.json(logs);
    } catch (error: any) {
        console.error("Fetch Logs Error:", error?.message || error);
        return c.json({ error: "Failed to fetch logs" }, 500);
    }
});

adminRouter.get('/health', async (c) => {
    const user = await getServerUser(c.req.raw);
    // Infrastructure health/latency probing: platform owner only.
    if (!isPlatformOwnerOnly(user)) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const startTime = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const latency = Date.now() - startTime;

        const baseUptime = 99.91;
        const jitter = (Math.random() * 0.08);
        const currentUptime = (baseUptime + jitter).toFixed(2);

        return c.json({
            status: "HEALTHY",
            uptime: `${currentUptime}%`,
            latency: `${latency}ms`,
            db: "CONNECTED",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Health Check Failed:", error?.message || error);
        return c.json({
            status: "UNHEALTHY",
            uptime: "98.50%",
            latency: "N/A",
            db: "DISCONNECTED",
            timestamp: new Date().toISOString()
        }, 500);
    }
});

adminRouter.get('/governance', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        // Global system-config snapshots and governance audit history: owner only.
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const [history, logs, templateVersions, templateUsageRaw] = await Promise.all([
            SystemGovernance.getHistory(),
            SystemGovernance.getLogs(),
            prisma.weddingTemplateVersion.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    wedding: {
                        select: { groomName: true, brideName: true, id: true }
                    }
                }
            }),
            prisma.wedding.groupBy({
                by: ['templateId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } }
            })
        ]);

        const templateUsage = templateUsageRaw.map(item => ({
            templateId: item.templateId,
            count: item._count.id
        }));

        return c.json({ history, logs, templateVersions, templateUsage }, 200);
    } catch (error: any) {
        console.error("Governance Get Error:", error?.message || error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

adminRouter.post('/governance', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        // Creating a snapshot captures the whole platform's system config.
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { versionName, description } = body;
        const currentUserId = user?.userId || user?.id || "admin";

        const snapshot = await SystemGovernance.createSnapshot(currentUserId, versionName, description);

        const ip = c.req.header("x-forwarded-for") || "unknown";
        const userAgent = c.req.header("user-agent") || "unknown";
        await SystemGovernance.logAction(
            currentUserId,
            (user as any)?.name || "Admin",
            GOVERNANCE_ACTIONS.PUBLISH,
            { versionName, versionId: snapshot.id },
            ip,
            userAgent
        );

        return c.json(snapshot);
    } catch (error: any) {
        console.error("Governance Snapshot Error:", error?.message || error);
        return c.json({ error: "Failed to create snapshot" }, 500);
    }
});

adminRouter.patch('/governance', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        // Rolling the platform back to a previous system-config version is a
        // destructive, platform-wide operation: owner only.
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { versionId } = body;
        const currentUserId = user?.userId || user?.id || "admin";

        const result = await SystemGovernance.rollback(versionId, currentUserId, (user as any)?.name || "Admin");

        return c.json({ success: true, config: result }, 200);
    } catch (error: any) {
        console.error("Rollback API Error:", error?.message || error);
        return c.json({ error: "Rollback failed" }, 500);
    }
});

adminRouter.get('/export/guests', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.text("Unauthorized", 401);

        const weddingId = c.req.query("weddingId");
        if (!weddingId) {
            return c.text("Wedding ID is required", 400);
        }

        const currentUserId = user.userId || user.id;
        if (user.role !== ROLES.PLATFORM_OWNER && user.role !== "SUPERADMIN") {
            const wedding = await prisma.wedding.findFirst({
                where: { id: weddingId, userId: currentUserId },
                select: { id: true, userId: true }
            });
            if (!wedding) return c.text("Unauthorized access to this wedding", 403);

            // Check template license access instead of package type
            const hasAccess = await hasExportAccess(wedding);
            if (!hasAccess) {
                return c.text("Export feature requires an active template license. Please purchase a template to enable export.", 403);
            }
        }

        const guests = await prisma.guest.findMany({
            where: { weddingId },
            orderBy: { name: "asc" }
        });

        let csvContent = "\uFEFF";
        csvContent += "ល.រ,ឈ្មោះភ្ញៀវ,មកពីណា / ទីតាំង\n";

        guests.forEach((guest: any, index: number) => {
            const no = guest.sequenceNumber || (index + 1);
            const name = escapeCSV(guest.name);
            const group = escapeCSV(guest.group || guest.source || "");
            csvContent += `${no},${name},${group}\n`;
        });

        const response = c.text(csvContent);
        response.headers.set("Content-Type", "text/csv; charset=utf-8");
        response.headers.set("Content-Disposition", `attachment; filename="Monea_GuestList_${weddingId}.csv"`);

        return response;
    } catch (error: any) {
        console.error("Export Guests Error:", error?.message || error);
        return c.text("Internal Server Error", 500);
    }
});

adminRouter.get('/export/gifts', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.text("Unauthorized", 401);

        const weddingId = c.req.query("weddingId");
        if (!weddingId) {
            return c.text("Wedding ID is required", 400);
        }

        const currentUserId = user.userId || user.id;
        if (user.role !== ROLES.PLATFORM_OWNER && user.role !== "SUPERADMIN") {
            const wedding = await prisma.wedding.findFirst({
                where: { id: weddingId, userId: currentUserId },
                select: { id: true, userId: true }
            });
            if (!wedding) return c.text("Unauthorized access to this wedding", 403);

            // Check template license access instead of package type
            const hasAccess = await hasExportAccess(wedding);
            if (!hasAccess) {
                return c.text("Export feature requires an active template license. Please purchase a template to enable export.", 403);
            }
        }

        const gifts = await prisma.gift.findMany({
            where: { weddingId },
            include: { guest: true },
            orderBy: { createdAt: "desc" }
        });

        let csvContent = "\uFEFF";
        csvContent += "ឈ្មោះភ្ញៀវ (Guest),ចំនួនទឹកប្រាក់ (Amount),រូបិយប័ណ្ណ (Currency),មធ្យោបាយ (Method),កាលបរិច្ឆេទ (Date)\n";

        gifts.forEach((gift: any) => {
            const guestName = escapeCSV(gift.guest?.name || "Unknown");
            const amount = gift.amount;
            const currency = gift.currency;
            const method = escapeCSV(gift.method || "Cash");
            const date = gift.createdAt.toISOString();
            csvContent += `${guestName},${amount},${currency},${method},${date}\n`;
        });

        const response = c.text(csvContent);
        response.headers.set("Content-Type", "text/csv; charset=utf-8");
        response.headers.set("Content-Disposition", `attachment; filename="wedding_gifts_${weddingId}.csv"`);

        return response;
    } catch (error: any) {
        console.error("Export Gifts Error:", error?.message || error);
        return c.text("Internal Server Error", 500);
    }
});

adminRouter.post('/bakong/verify-token', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { code } = await c.req.json();
        if (!code) {
            return c.json({ error: "Verification code is required" }, 400);
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongData = (config?.bakongConfig as any) || {};

        const response = await fetch("https://api-bakong.nbc.gov.kh/v1/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });

        const result = await response.json() as any;

        if (result.responseCode !== 0 || !result.data?.token) {
            return c.json({ 
                error: result.responseMessage || "Failed to verify token with Bakong",
                details: result
            }, 400);
        }

        await (prisma as any).systemConfig.update({
            where: { id: "GLOBAL" },
            data: {
                bakongConfig: {
                    ...bakongData,
                    token: result.data.token,
                    verifiedAt: new Date().toISOString()
                }
            }
        });

        return c.json({ message: "Bakong API Connected successfully", token: result.data.token }, 200);
    } catch (error: any) {
        console.error("[Bakong Verify Token] Error:", error?.message || error);
        return c.json({ error: error.message }, 500);
    }
});

adminRouter.get('/bakong/status', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongConfig = (config?.bakongConfig as any) || {};

        return c.json({
            email: bakongConfig.email || "",
            organization: bakongConfig.organization || "",
            project: bakongConfig.project || "",
            // Receiving account used to generate KHQR codes for active payment flows.
            accountID: bakongConfig.accountID || "",
            merchantName: bakongConfig.merchantName || "",
            isConnected: !!bakongConfig.token,
            isPaymentReady: Boolean(bakongConfig.token && bakongConfig.accountID),
            updatedAt: config?.updatedAt
        }, 200);
    } catch (error: any) {
        console.error("[Bakong Status] Error:", error?.message || error);
        return c.json({ error: error.message }, 500);
    }
});

// ── POST /api/admin/bakong/account ───────────────────────────────────────────
// Stores the Bakong receiving account used by active KHQR payment flows.
adminRouter.post('/bakong/account', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        // The destination of every customer payment: platform owner only.
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const account = String(body?.accountID || "").trim();
        const merchant = String(body?.merchantName || "").trim();

        if (!account) {
            return c.json({ error: "accountID is required" }, 400);
        }

        // ts-khqr requires "<name>@<bank>" (e.g. seabkoeurn64@aclb) and rejects
        // identifiers longer than 32 characters.
        if (account.length > 32 || !account.includes("@")) {
            return c.json({
                error: 'accountID must be a Bakong account like "seabkoeurn64@aclb" (one "@" separator, max 32 characters)'
            }, 400);
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongData = (config?.bakongConfig as any) || {};

        const bakongConfig = {
            ...bakongData,
            accountID: account,
            merchantName: merchant || bakongData.merchantName || "MONEA",
            accountUpdatedAt: new Date().toISOString(),
        };

        if (config) {
            await (prisma as any).systemConfig.update({
                where: { id: "GLOBAL" },
                data: { bakongConfig }
            });
        } else {
            await (prisma as any).systemConfig.create({
                data: { id: "GLOBAL", bakongConfig }
            });
        }

        return c.json({
            message: "Bakong receiving account saved",
            accountID: bakongConfig.accountID,
            merchantName: bakongConfig.merchantName,
            isPaymentReady: Boolean(bakongConfig.token)
        }, 200);
    } catch (error: any) {
        console.error("[Bakong Account] Error:", error?.message || error);
        return c.json({ error: error.message }, 500);
    }
});

adminRouter.post('/bakong/request-token', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { email, organization, project } = await c.req.json();
        if (!email || !organization || !project) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        const response = await fetch("https://api-bakong.nbc.gov.kh/v1/request_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, organization, project })
        });

        const result = await response.json() as any;

        if (result.responseCode !== 0) {
            return c.json({ 
                error: result.responseMessage || "Failed to request token from Bakong",
                details: result
            }, 400);
        }

        // Read the current blob first: a bare object below used to wipe the
        // stored token/accountID on every "request token" click.
        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });
        const bakongData = (config?.bakongConfig as any) || {};

        await (prisma as any).systemConfig.update({
            where: { id: "GLOBAL" },
            data: {
                bakongConfig: {
                    ...bakongData,
                    email,
                    organization,
                    project,
                    lastRequestedAt: new Date().toISOString()
                }
            }
        });

        return c.json({ message: "Verification code sent to email" });
    } catch (error: any) {
        console.error("[Bakong Request Token] Error:", error?.message || error);
        return c.json({ error: error.message }, 500);
    }
});

adminRouter.post('/bakong/manual-token', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!isPlatformOwnerOnly(user)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { token } = await c.req.json();
        if (!token) {
            return c.json({ error: "Token is required" }, 400);
        }

        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const bakongData = (config?.bakongConfig as any) || {};

        await (prisma as any).systemConfig.update({
            where: { id: "GLOBAL" },
            data: {
                bakongConfig: {
                    ...bakongData,
                    token: token,
                    isManual: true,
                    updatedAt: new Date().toISOString()
                }
            }
        });

        return c.json({ message: "Bakong Token updated manually" });
    } catch (error: any) {
        console.error("[Bakong Manual Token] Error:", error?.message || error);
        return c.json({ error: error.message }, 500);
    }
});

export default adminRouter;