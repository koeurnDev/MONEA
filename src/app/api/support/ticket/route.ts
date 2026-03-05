export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sendTelegramAlert, escapeHtml } from "@/lib/telegram";
import { sanitizeObject } from "@/lib/sanitize";
import { errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { subject, message, priority } = sanitizeObject<any>(body);
        let { weddingId } = body;

        if (!subject || !message) {
            return errorResponse("Missing subject or message", 400);
        }

        // SPAM/Content Protection: Length limits
        if (subject.length > 100) return errorResponse("Subject too long (Max 100)", 400);
        if (message.length > 2000) return errorResponse("Message too long (Max 2000)", 400);

        // If weddingId is missing, try to find the user's first wedding
        if (!weddingId) {
            const firstWedding = await prisma.wedding.findFirst({
                where: { userId: user.userId },
                select: { id: true }
            });
            if (firstWedding) {
                weddingId = firstWedding.id;
                console.log(`[Support API] No weddingId provided, used fallback: ${weddingId}`);
            } else {
                return NextResponse.json({ error: "No wedding found. Please create a wedding first." }, { status: 400 });
            }
        }

        // Verify user owns the wedding
        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true }
        });

        if (!wedding || wedding.userId !== user.userId) {
            console.error(`[Support API] Access denied. User ${user.userId} tried to access wedding ${weddingId} owned by ${wedding?.userId}`);
            return NextResponse.json({ error: "Invalid wedding ID or access denied" }, { status: 403 });
        }

        const ticket = await (prisma as any).supportTicket.create({
            data: {
                subject,
                message,
                priority: priority || "NORMAL",
                weddingId,
                userId: user.userId,
                status: "OPEN"
            }
        });

        // Await telegram alert to ensure it completes
        const userEmail = (user as any).email || "Unknown";
        const priorityEmoji = (ticket as any).priority === "HIGH" ? "🔴" : "🔵";
        const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/master/support`;

        await sendTelegramAlert(
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

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Support Ticket Error:", error);
        return NextResponse.json({ error: "Failed to submit ticket" }, { status: 500 });
    }
}
