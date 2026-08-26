import { Hono } from 'hono';
import { prisma } from "@/lib/prisma";
import { sendTelegramAlert } from "@/lib/telegram";

const cronRouter = new Hono();

/**
 * GET /api/cron/daily-security
 * Secure cron job handler that aggregates daily security logs, evaluates risk levels,
 * dispatches Telegram reports/alerts, and stores historical metrics in the database.
 */
cronRouter.get('/daily-security', async (c) => {
    const authHeader = c.req.header('authorization') || "";
    const expected = `Bearer ${process.env.CRON_SECRET || "UNSET"}`;

    // Constant-time comparison using Web Crypto (Cloudflare Workers compatible)
    const encoder = new TextEncoder();
    const aBytes = encoder.encode(authHeader);
    const bBytes = encoder.encode(expected);
    let mismatch = aBytes.length !== bBytes.length ? 1 : 0;
    const len = Math.min(aBytes.length, bBytes.length);
    for (let i = 0; i < len; i++) {
        mismatch |= aBytes[i] ^ bBytes[i];
    }
    
    if (mismatch !== 0) {
        return c.text('Unauthorized', 401);
    }

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dateRange = { gte: yesterday, lt: today };
        const now = new Date();

        const [
            totalLogins,
            failedAttempts,
            uniqueAttackerIpsRows,
            lockedStaff,
            lockedUsers,
            blockedIps,
            countryStats,
            emailStats
        ] = await Promise.all([
            prisma.securityLog.count({
                where: { event: "LOGIN_SUCCESS", createdAt: dateRange }
            }),
            prisma.securityLog.count({
                where: { event: "LOGIN_FAILED", createdAt: dateRange }
            }),
            prisma.securityLog.findMany({
                where: { event: "LOGIN_FAILED", createdAt: dateRange },
                distinct: ['ip'],
                select: { ip: true }
            }),
            prisma.staff.count({ where: { lockedUntil: { gt: now } } }),
            prisma.user.count({ where: { lockedUntil: { gt: now } } }),
            prisma.ipSecurity.count({ where: { blockedUntil: { gt: now } } }),
            prisma.securityLog.groupBy({
                by: ['geoIp'],
                where: { event: "LOGIN_FAILED", createdAt: dateRange },
                _count: { geoIp: true },
                orderBy: { _count: { geoIp: 'desc' } }
            }),
            prisma.securityLog.groupBy({
                by: ['email'],
                where: { event: "LOGIN_FAILED", createdAt: dateRange },
                _count: { email: true },
                orderBy: { _count: { email: 'desc' } }
            })
        ]);

        const uniqueAttackerIps = uniqueAttackerIpsRows.length;
        const totalLocked = lockedStaff + lockedUsers;

        const topCountry = countryStats.find((s: any) => s.geoIp && s.geoIp !== "UNKNOWN")?.geoIp || "N/A";
        const topEmail = emailStats.find((s: any) => s.email)?.email || "N/A";

        const totalRequests = totalLogins + failedAttempts;
        const failureRate = totalRequests === 0 ? 0 : (failedAttempts / totalRequests) * 100;
        const failureRateStr = failureRate.toFixed(1) + "%";

        const isHighRisk = failureRate > 40 || failedAttempts > 200 || blockedIps > 20;
        const isElevated = failureRate > 20;

        const statusIcon = isHighRisk ? '🚨' : (isElevated ? '⚠️' : '🟢');
        const statusText = isHighRisk ? 'HIGH RISK DETECTED' : (isElevated ? 'Elevated Risk' : 'Stable');

        const dateStr = yesterday.toISOString().split('T')[0];

        let report = `📊 *Daily Security Report* – ${dateStr}\n\n`;
        report += `Logins: \`${totalLogins}\`\n`;
        report += `Failures: \`${failedAttempts}\` (${failureRateStr})\n`;
        report += `Active Locks: \`${totalLocked}\`\n`;
        report += `Blocked IPs: \`${blockedIps}\`\n`;
        report += `Unique Attacker IPs: \`${uniqueAttackerIps}\`\n`;
        report += `Top Attack Origin: \`${topCountry}\`\n`;
        report += `Top Targeted Email: \`${topEmail}\`\n\n`;
        report += `Status: ${statusIcon} *${statusText}*`;

        // Send Telegram security report
        await sendTelegramAlert(report).catch((err) => console.error("[Telegram Report Error]:", err));

        // Save daily metrics summary to database
        await prisma.dailySecuritySummary.upsert({
            where: { date: yesterday },
            update: {
                totalLogins,
                failedAttempts,
                blockedIps
            },
            create: {
                date: yesterday,
                totalLogins,
                failedAttempts,
                blockedIps
            }
        });

        // Send high-risk escalation alert if thresholds are breached
        if (isHighRisk) {
            const alertMessage = `🚨 *HIGH RISK ESCALATION*\n\nSystem detects a possible brute force or credential stuffing campaign. \nFailure Rate: ${failureRateStr}\nBlocked IPs: ${blockedIps}`;
            await sendTelegramAlert(alertMessage).catch((err) => console.error("[Telegram Escalation Error]:", err));
        }

        return c.json({ success: true, message: "Report generated, saved to DB, and sent to Telegram." });
    } catch (error: any) {
        console.error("Cron Error generating report:", error?.message || error);
        return c.text("Internal Server Error", 500);
    }
});

export default cronRouter;