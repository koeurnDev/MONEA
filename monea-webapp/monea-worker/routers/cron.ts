import { Hono } from 'hono'
import { prisma } from '@/lib/prisma'
import { sendTelegramAlert } from '@/lib/telegram'

const cronRouter = new Hono()

cronRouter.get('/daily-security', async (c) => {
    const authHeader = c.req.header('authorization') || "";
    const expected = `Bearer ${process.env.CRON_SECRET || "UNSET"}`;

    // Constant-time comparison using Web Crypto (CF Workers compatible)
    const encoder = new TextEncoder();
    const aBytes = encoder.encode(authHeader);
    const bBytes = encoder.encode(expected);
    let mismatch = aBytes.length !== bBytes.length ? 1 : 0;
    const len = Math.min(aBytes.length, bBytes.length);
    for (let i = 0; i < len; i++) mismatch |= aBytes[i] ^ bBytes[i];
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

        const totalLogins = await prisma.securityLog.count({
            where: { event: "LOGIN_SUCCESS", createdAt: dateRange }
        });

        const failedAttempts = await prisma.securityLog.count({
            where: { event: "LOGIN_FAILED", createdAt: dateRange }
        });

        const uniqueAttackerIps = (await prisma.securityLog.findMany({
            where: { event: "LOGIN_FAILED", createdAt: dateRange },
            distinct: ['ip'],
            select: { ip: true }
        })).length;

        const lockedStaff = await prisma.staff.count({ where: { lockedUntil: { gt: now } } });
        const lockedUsers = await prisma.user.count({ where: { lockedUntil: { gt: now } } });
        const totalLocked = lockedStaff + lockedUsers;

        const blockedIps = await prisma.ipSecurity.count({ where: { blockedUntil: { gt: now } } });

        const countryStats = await prisma.securityLog.groupBy({
            by: ['geoIp'],
            where: { event: "LOGIN_FAILED", createdAt: dateRange },
            _count: { geoIp: true },
            orderBy: { _count: { geoIp: 'desc' } }
        });
        const topCountry = countryStats.find((s: any) => s.geoIp && s.geoIp !== "UNKNOWN")?.geoIp || "N/A";

        const emailStats = await prisma.securityLog.groupBy({
            by: ['email'],
            where: { event: "LOGIN_FAILED", createdAt: dateRange },
            _count: { email: true },
            orderBy: { _count: { email: 'desc' } }
        });
        const topEmail = emailStats.find((s: any) => s.email)?.email || "N/A";

        const totalRequests = totalLogins + failedAttempts;
        const failureRate = totalRequests === 0 ? 0 : (failedAttempts / totalRequests) * 100;
        const failureRateStr = failureRate.toFixed(1) + "%";

        const statusIcon = failureRate > 40 || failedAttempts > 200 || blockedIps > 20 ? '🚨' : (failureRate > 20 ? '⚠️' : '🟢');
        const statusText = failureRate > 40 || failedAttempts > 200 || blockedIps > 20 ? 'HIGH RISK DETECTED' : (failureRate > 20 ? 'Elevated Risk' : 'Stable');

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

        await sendTelegramAlert(report).catch(console.error);

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

        if (statusIcon === '🚨') {
            await sendTelegramAlert(`🚨 *HIGH RISK ESCALATION*\n\nSystem detects a possible brute force or credential stuffing campaign. \nFailure Rate: ${failureRateStr}\nBlocked IPs: ${blockedIps}`).catch(console.error);
        }

        return c.json({ success: true, message: "Report generated, saved to DB, and sent to Telegram." });
    } catch (error) {
        console.error("Cron Error generating report:", error);
        return c.text("Internal Server Error", 500);
    }
});

export default cronRouter;
