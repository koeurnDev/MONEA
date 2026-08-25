import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getServerUser } from "@/lib/auth"
import { sendTelegramAlert, escapeHtml } from "@/lib/telegram"
import { sanitizeObject } from "@/lib/sanitize"

const supportRouter = new Hono()

supportRouter.post('/ticket', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const { subject, message, priority } = sanitizeObject<any>(body);
        let { weddingId } = body;

        if (!subject || !message) {
            return c.json({ error: "Missing subject or message" }, 400);
        }

        if (subject.length > 100) return c.json({ error: "Subject too long (Max 100)" }, 400);
        if (message.length > 2000) return c.json({ error: "Message too long (Max 2000)" }, 400);

        if (!weddingId) {
            const firstWedding = await prisma.wedding.findFirst({
                where: { userId: user.userId || (user as any).id },
                select: { id: true }
            });
            if (firstWedding) {
                weddingId = firstWedding.id;
            } else {
                return c.json({ error: "No wedding found. Please create a wedding first." }, 400);
            }
        }

        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true }
        });

        if (!wedding || wedding.userId !== (user.userId || (user as any).id)) {
            return c.json({ error: "Invalid wedding ID or access denied" }, 403);
        }

        const ticket = await (prisma as any).supportTicket.create({
            data: {
                subject,
                message,
                priority: priority || "NORMAL",
                weddingId,
                userId: user.userId || (user as any).id,
                status: "OPEN"
            }
        });

        const userEmail = (user as any).email || "Unknown";
        const priorityEmoji = (ticket as any).priority === "HIGH" ? "🔴" : "🔵";
        const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/master/support`;

        sendTelegramAlert(
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🎫 <b>NEW SUPPORT TICKET</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `🆔 <b>Ticket:</b> <code>${escapeHtml((ticket as any).id)}</code>\n` +
            `${priorityEmoji} <b>Priority:</b> <code>${escapeHtml((ticket as any).priority)}</code>\n\n` +
            `👤 <b>USER DETAILS</b>\n` +
            `<b>Email:</b> <code>${escapeHtml(userEmail)}</code>\n` +
            `<b>Wedding:</b> <code>${escapeHtml(weddingId)}</code>\n\n` +
            `📝 <b>CONTENT</b>\n` +
            `<b>Subject:</b> <i>${escapeHtml(subject)}</i>\n\n` +
            `<b>Message:</b>\n` +
            `<code>${escapeHtml((ticket as any).message)}</code>\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🔗 <a href="${adminUrl}">Open Support Desk</a>`,
            `✨ <b>MONEA SYSTEM ALERT</b> ✨`
        ).catch(err => console.error("[Telegram] Error in route:", err));

        return c.json(ticket);
    } catch (error) {
        console.error("Support Ticket Error:", error);
        return c.json({ error: "Failed to submit ticket" }, 500);
    }
});

export default supportRouter;
