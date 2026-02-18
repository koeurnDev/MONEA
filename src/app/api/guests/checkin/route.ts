import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/logger";
import { decrypt } from "@/lib/encryption";

// Helper to get context from either Admin Token or Staff Token
async function getAuthContext() {
    const token = cookies().get("token")?.value;
    if (token) {
        const decoded = verifyToken(token) as any;
        if (decoded && decoded.userId) return { type: "ADMIN", ...decoded };
    }

    const staffToken = cookies().get("staff_token")?.value;
    if (staffToken) {
        const decoded = verifyToken(staffToken) as any;
        if (decoded && decoded.staffId) return { type: "STAFF", ...decoded };
    }

    return null;
}

// GET: Lookup guest by ID (Code)
export async function GET(req: Request) {
    const context = await getAuthContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    try {
        const guest = await prisma.guest.findUnique({
            where: { id: code },
            include: { wedding: true }
        });

        if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

        // Authorization Check
        if (context.type === "ADMIN") {
            if (guest.wedding.userId !== context.userId) {
                return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
        } else if (context.type === "STAFF") {
            if (guest.weddingId !== context.weddingId) {
                return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
        }

        // Decrypt guest phone
        if (guest.phone) {
            guest.phone = decrypt(guest.phone);
        }

        return NextResponse.json(guest);
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST: Check-in + optional Gift
export async function POST(req: Request) {
    const context = await getAuthContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { guestId, giftAmount, giftCurrency } = body;

        if (!guestId) return NextResponse.json({ error: "Guest ID required" }, { status: 400 });

        const guest = await prisma.guest.findUnique({
            where: { id: guestId }
        });

        if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

        // Authorization Check
        if (context.type === "ADMIN") {
            const wedding = await prisma.wedding.findUnique({ where: { id: guest.weddingId } });
            if (wedding?.userId !== context.userId) {
                return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
        } else if (context.type === "STAFF") {
            if (guest.weddingId !== context.weddingId) {
                return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
        }

        // Update Guest status
        await prisma.guest.update({
            where: { id: guestId },
            data: {
                hasArrived: true,
                arrivedAt: new Date(),
            }
        });

        const actorName = context.type === "STAFF" ? `Staff: ${context.name}` : "Admin";

        // If Gift provided, record it
        if (giftAmount && giftAmount > 0) {
            await prisma.gift.create({
                data: {
                    amount: giftAmount,
                    currency: giftCurrency || "USD",
                    method: "CASH_AT_EVENT",
                    guestId: guest.id,
                    weddingId: guest.weddingId
                }
            });
            await logActivity(guest.weddingId, "GIFT", `Received ${giftAmount} ${giftCurrency} from ${guest.name}`, actorName);
        } else {
            await logActivity(guest.weddingId, "CHECK_IN", `Checked in guest ${guest.name}`, actorName);
        }

        // Decrypt guest phone before returning
        if (guest.phone) {
            guest.phone = decrypt(guest.phone);
        }

        return NextResponse.json({ success: true, guest });
    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
