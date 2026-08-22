import { Hono } from 'hono'
import { prisma, queryRaw, executeRaw } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { ROLES } from "@/lib/constants"
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance"
import redis from "@/lib/redis"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adminMasterRouter = new Hono()

function escapeCSV(val: any) {
    if (val === null || val === undefined) return "";
    const sanitized = String(val).replace(/,/g, " ");
    if (sanitized.startsWith('=') || sanitized.startsWith('+') || sanitized.startsWith('-') || sanitized.startsWith('@')) {
        return `'${sanitized}`;
    }
    return sanitized;
}

// ─── Weddings ─────────────────────────────────────────────────────────────────
adminMasterRouter.get('/weddings', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const search = c.req.query("search") || "";
        const page = parseInt(c.req.query("page") || "1");
        const limit = 20;
        const skip = (page - 1) * limit;
        const searchPattern = `%${search}%`;

        const weddings = await queryRaw(`
            SELECT 
                w.*,
                json_build_object('name', u.name, 'email', u.email) as user,
                json_build_object('guests', (SELECT count(*) FROM "Guest" g WHERE g."weddingId" = w.id), 
                                'gifts', (SELECT count(*) FROM "Gift" gi WHERE gi."weddingId" = w.id)) as _count
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            WHERE w."groomName" ILIKE $1 OR w."brideName" ILIKE $1 OR w."weddingCode" ILIKE $1
            ORDER BY w."createdAt" DESC
            LIMIT $2 OFFSET $3
        `, searchPattern, limit, skip);

        const totalResults = await queryRaw(`
            SELECT count(*) as count FROM "Wedding"
            WHERE "groomName" ILIKE $1 OR "brideName" ILIKE $1 OR "weddingCode" ILIKE $1
        `, searchPattern);
        
        const total = Number(totalResults[0]?.count || 0);

        return c.json({
            weddings,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Master Weddings Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Users ────────────────────────────────────────────────────────────────────
adminMasterRouter.get('/users', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const search = c.req.query("search") || "";
        const page = parseInt(c.req.query("page") || "1");
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
                include: { _count: { select: { weddings: true } } },
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
    } catch (error) {
        return c.json({ error: "Failed to fetch users" }, 500);
    }
});

adminMasterRouter.patch('/users', async (c) => {
    try {
        const admin = await getServerUser();
        if (!admin || admin.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { userId, role, revokeSessions } = body;

        if (!userId) {
            return c.json({ error: "User ID required" }, 400);
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (revokeSessions) updateData.sessionsRevokedAt = new Date();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return c.json(updatedUser);
    } catch (error) {
        return c.json({ error: "Failed to update user" }, 500);
    }
});

// ─── Support Tickets ──────────────────────────────────────────────────────────
adminMasterRouter.get('/support', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const tickets = await (prisma as any).supportTicket.findMany({
            include: {
                wedding: { select: { groomName: true, brideName: true } },
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return c.json(tickets);
    } catch (error) {
        return c.json({ error: "Failed to fetch tickets" }, 500);
    }
});

adminMasterRouter.patch('/support', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { id, status } = body;

        const ticket = await (prisma as any).supportTicket.update({
            where: { id },
            data: { status }
        });

        return c.json(ticket);
    } catch (error) {
        return c.json({ error: "Failed to update ticket" }, 500);
    }
});

// ─── Stats ────────────────────────────────────────────────────────────────────
adminMasterRouter.get('/stats', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const [
            totalWeddings,
            activeWeddings,
            totalGuests,
            totalGifts,
            totalUsers,
            blacklistedIPs,
            recentWeddings
        ] = await Promise.all([
            prisma.wedding.count(),
            prisma.wedding.count({ where: { status: "ACTIVE" } }),
            prisma.guest.count(),
            prisma.gift.count(),
            prisma.user.count(),
            (prisma as any).blacklistedIP.count(),
            prisma.wedding.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, groomName: true, brideName: true, createdAt: true, status: true, packageType: true }
            })
        ]);

        const giftStats = await prisma.gift.groupBy({
            by: ['currency'],
            _sum: { amount: true }
        });

        const dbHealth = await prisma.$queryRaw`SELECT 1`.then(() => "HEALTHY").catch(() => "UNHEALTHY");

        return c.json({
            stats: { totalWeddings, activeWeddings, totalGuests, totalGifts, totalUsers, blacklistedIPs, dbHealth },
            giftStats,
            recentWeddings
        });
    } catch (error) {
        console.error("Master Stats Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
adminMasterRouter.get('/settings', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        let config = await (prisma as any).systemConfig.findUnique({ where: { id: "GLOBAL" } });

        if (!config) {
            config = await (prisma as any).systemConfig.create({ data: { id: "GLOBAL" } });
        }

        return c.json(config);
    } catch (error) {
        return c.json({ error: "Failed to fetch config" }, 500);
    }
});

adminMasterRouter.post('/settings', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { maintenanceMode, allowNewSignups, globalCheckIn, stadPrice, proPrice, maintenanceStart, maintenanceEnd } = body;

        const config = await (prisma as any).systemConfig.upsert({
            where: { id: "GLOBAL" },
            update: {
                maintenanceMode,
                maintenanceStart: maintenanceStart ? new Date(maintenanceStart) : null,
                maintenanceEnd: maintenanceEnd ? new Date(maintenanceEnd) : null,
                allowNewSignups,
                globalCheckIn,
                stadPrice: parseFloat(stadPrice),
                proPrice: parseFloat(proPrice)
            },
            create: {
                id: "GLOBAL",
                maintenanceMode,
                maintenanceStart: maintenanceStart ? new Date(maintenanceStart) : null,
                maintenanceEnd: maintenanceEnd ? new Date(maintenanceEnd) : null,
                allowNewSignups,
                globalCheckIn,
                stadPrice: parseFloat(stadPrice),
                proPrice: parseFloat(proPrice)
            }
        });

        const ip = c.req.header("x-forwarded-for") || "unknown";
        const userAgent = c.req.header("user-agent") || "unknown";

        await SystemGovernance.logAction(
            user.userId,
            (user as any).name || "Admin",
            GOVERNANCE_ACTIONS.CONFIG_UPDATE,
            { maintenanceMode, allowNewSignups, globalCheckIn },
            ip,
            userAgent
        );

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

        return c.json(config);
    } catch (error) {
        console.error("Settings Update Error:", error);
        return c.json({ error: "Failed to update config" }, 500);
    }
});

// ─── Security: Unlock ─────────────────────────────────────────────────────────
adminMasterRouter.post('/security/unlock', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
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
    } catch (e) {
        console.error("[Unlock API Error]", e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Security: Stats ──────────────────────────────────────────────────────────
adminMasterRouter.get('/security/stats', async (c) => {
    const user = await getServerUser();
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
    } catch (e) {
        console.error(e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Security: Revoke All ─────────────────────────────────────────────────────
adminMasterRouter.post('/security/revoke', async (c) => {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const staffRes = await prisma.staff.updateMany({ data: { sessionsRevokedAt: new Date() } });
        const userRes = await prisma.user.updateMany({ data: { sessionsRevokedAt: new Date() } });
        const totalRevoked = staffRes.count + userRes.count;

        const ip = c.req.header("x-forwarded-for") || "unknown";
        await SystemGovernance.logAction(
            user.userId,
            (user as any).name || user.email || "Admin",
            GOVERNANCE_ACTIONS.REVOKE_SESSIONS,
            { revokedCount: totalRevoked, target: "ALL_ACCOUNTS" },
            ip,
            c.req.header("user-agent") || "unknown"
        );

        return c.json({ success: true, count: totalRevoked, details: { staff: staffRes.count, users: userRes.count } });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Security: Blacklist ──────────────────────────────────────────────────────
adminMasterRouter.get('/security/blacklist', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const blacklist = await (prisma as any).blacklistedIP.findMany({ orderBy: { createdAt: "desc" } });
        return c.json(blacklist);
    } catch (error) {
        return c.json({ error: "Failed to fetch blacklist" }, 500);
    }
});

adminMasterRouter.post('/security/blacklist', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { ip, reason } = await c.req.json();
        if (!ip) return c.json({ error: "IP is required" }, 400);

        const entry = await (prisma as any).blacklistedIP.upsert({
            where: { ip },
            create: { ip, reason },
            update: { reason }
        });

        await redis.set(`blacklist:ip:${ip}`, "1");
        return c.json(entry);
    } catch (error) {
        return c.json({ error: "Failed to update blacklist" }, 500);
    }
});

adminMasterRouter.delete('/security/blacklist', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.query("id");
        if (!id) return c.json({ error: "ID is required" }, 400);

        const entry = await (prisma as any).blacklistedIP.findUnique({ where: { id } });
        if (entry) {
            await (prisma as any).blacklistedIP.delete({ where: { id } });
            await redis.del(`blacklist:ip:${entry.ip}`);
        }

        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete" }, 500);
    }
});

// ─── Payments ─────────────────────────────────────────────────────────────────
adminMasterRouter.get('/payments', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const configs = await queryRaw('SELECT "stadPrice", "proPrice" FROM "SystemConfig" LIMIT 1');
        const config = configs[0] || null;

        const pendingWeddings = await queryRaw(`
            SELECT 
                w.id,
                w."groomName",
                w."brideName",
                w."packageType",
                w."paymentStatus",
                w.status,
                w."paymentHash",
                w."bakongTrxId",
                w."createdAt",
                json_build_object('name', u.name, 'email', u.email) as user
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            WHERE w."packageType" != 'FREE'
            ORDER BY w."createdAt" DESC
        `);

        return c.json({
            weddings: pendingWeddings || [],
            pricing: { standard: config?.stadPrice || 9, pro: config?.proPrice || 19 }
        });
    } catch (error) {
        console.error("Payment Fetch Error:", error);
        return c.json({ error: "Failed to fetch payments" }, 500);
    }
});

adminMasterRouter.post('/payments', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { weddingId, status, packageType } = body;

        if (!weddingId || !status) {
            return c.json({ error: "Missing required fields" }, 400);
        }

        let retries = 3;
        const weddingStatus = status === 'PAID' ? 'ACTIVE' : (status === 'REJECTED' ? 'INACTIVE' : 'PENDING');
        
        while (retries > 0) {
            try {
                await executeRaw(`
                    UPDATE "Wedding"
                    SET "paymentStatus" = $1, "status" = $2, "packageType" = COALESCE($3, "packageType")
                    WHERE "id" = $4
                `, status, weddingStatus, packageType || null, weddingId);
                break;
            } catch (err: any) {
                retries--;
                if (retries === 0) throw err;
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        const updatedWeddings = await queryRaw('SELECT * FROM "Wedding" WHERE id = $1 LIMIT 1', weddingId);
        const updatedWedding = updatedWeddings[0];

        await SystemGovernance.logAction(
            user.id,
            user.name || user.email || "Platform Owner",
            GOVERNANCE_ACTIONS.CONFIG_UPDATE,
            { target: "WEDDING_PAYMENT", weddingId, packageType, status }
        );

        return c.json(updatedWedding || { success: true });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return c.json({ error: "Failed to verify payment" }, 500);
    }
});

// ─── Maintenance Tasks ────────────────────────────────────────────────────────
adminMasterRouter.get('/maintenance/tasks', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const dbHealth = await prisma.$queryRaw`SELECT 1`.then(() => "HEALTHY").catch(() => "UNHEALTHY");

        let cloudinaryHealth = "UNKNOWN";
        try {
            const result = await cloudinary.api.ping();
            if (result && result.status === "ok") cloudinaryHealth = "HEALTHY";
        } catch (e) {
            cloudinaryHealth = "UNHEALTHY";
        }

        const [userCount, weddingCount, guestCount, logCount] = await Promise.all([
            prisma.user.count(),
            prisma.wedding.count(),
            prisma.guest.count(),
            prisma.log.count()
        ]);

        return c.json({
            users: userCount,
            weddings: weddingCount,
            guests: guestCount,
            logs: logCount,
            health: dbHealth === "HEALTHY" && cloudinaryHealth === "HEALTHY" ? "HEALTHY" : "DEGRADED",
            services: { database: dbHealth, cloudinary: cloudinaryHealth },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return c.json({ error: "Failed to run diagnostics" }, 500);
    }
});

adminMasterRouter.post('/maintenance/tasks', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const { action } = await c.req.json();

        if (action === "VACUUM") {
            await prisma.$executeRawUnsafe("VACUUM");
            return c.json({ success: true, message: "Database optimized successfully" });
        }

        return c.json({ error: "Invalid action" }, 400);
    } catch (error) {
        return c.json({ error: "Maintenance action failed" }, 500);
    }
});

adminMasterRouter.delete('/maintenance/tasks', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.log.deleteMany({
            where: { createdAt: { lt: thirtyDaysAgo } }
        });

        return c.json({ success: true, deletedCount: result.count });
    } catch (error) {
        return c.json({ error: "Cleanup failed" }, 500);
    }
});

// ─── Export CSV ───────────────────────────────────────────────────────────────
adminMasterRouter.get('/export', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
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
            escapeCSV(w.user.email),
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
    } catch (error) {
        console.error("Export Error:", error);
        return c.json({ error: "Failed to export data" }, 500);
    }
});

// ─── Broadcast ────────────────────────────────────────────────────────────────
adminMasterRouter.get('/broadcast', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const broadcasts = await prisma.broadcast.findMany({ orderBy: { createdAt: "desc" } });
        return c.json(broadcasts);
    } catch (error) {
        return c.json({ error: "Failed to fetch broadcasts" }, 500);
    }
});

adminMasterRouter.post('/broadcast', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const body = await c.req.json();
        const { title, message, type, expiresAt, scheduledAt } = body;

        const broadcast = await prisma.broadcast.create({
            data: {
                title,
                message,
                type: type || "INFO",
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: true
            }
        });

        return c.json(broadcast);
    } catch (error) {
        return c.json({ error: "Failed to create broadcast" }, 500);
    }
});

adminMasterRouter.delete('/broadcast', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const id = c.req.query("id");
        if (!id) return c.json({ error: "ID required" }, 400);

        await prisma.broadcast.delete({ where: { id } });
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete broadcast" }, 500);
    }
});

// ─── Audit ────────────────────────────────────────────────────────────────────
adminMasterRouter.get('/audit', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const search = c.req.query("search") || "";
        const action = c.req.query("action") || "";
        const page = parseInt(c.req.query("page") || "1");
        const limit = 50;
        const skip = (page - 1) * limit;

        const where: any = {
            OR: [
                { description: { contains: search } },
                { actorName: { contains: search } },
                { wedding: { groomName: { contains: search } } },
                { wedding: { brideName: { contains: search } } }
            ]
        };

        if (action) where.action = action;

        const logs = await prisma.log.findMany({
            where,
            include: { wedding: { select: { groomName: true, brideName: true, id: true } } },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: skip
        });

        const total = await prisma.log.count({ where });

        return c.json({
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Master Audit Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
adminMasterRouter.get('/analytics', async (c) => {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const weddingsByMonth = await prisma.$queryRaw`
            SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*)::int as count 
            FROM "Wedding" 
            GROUP BY month 
            ORDER BY month DESC 
            LIMIT 12
        `;

        const giftsByMonth = await prisma.$queryRaw`
            SELECT to_char("createdAt", 'YYYY-MM') as month, SUM(amount)::float as total, currency
            FROM "Gift" 
            GROUP BY month, currency
            ORDER BY month DESC 
            LIMIT 24
        `;

        const packageDist = await prisma.wedding.groupBy({
            by: ['packageType'],
            _count: true
        });

        return c.json({ weddingsByMonth, giftsByMonth, packageDist });
    } catch (error) {
        console.error("Master Analytics Error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default adminMasterRouter;
