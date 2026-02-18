import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";
import { sanitizeObject } from "@/lib/sanitize";
import * as z from "zod";

const giftSchema = z.object({
    amount: z.coerce.number().positive("Amount must be positive"),
    currency: z.string().min(1),
    method: z.string().optional(),
    guestId: z.string().optional().nullable(),
    guestName: z.string().optional(),
    source: z.string().optional(),
});

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get("limit");

        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) weddingId = wedding.id;
        }

        if (!weddingId) return NextResponse.json([]);

        const gifts = await prisma.gift.findMany({
            where: { weddingId },
            include: { guest: true },
            orderBy: { createdAt: "desc" },
            take: limit ? parseInt(limit) : undefined,
        });

        const decryptedGifts = gifts.map(gift => ({
            ...gift,
            guest: gift.guest ? {
                ...gift.guest,
                phone: gift.guest.phone ? decrypt(gift.guest.phone) : gift.guest.phone
            } : gift.guest
        }));

        return NextResponse.json({ gifts: decryptedGifts, role: user.role });
    } catch (e) {
        return errorResponse("Failed to fetch gifts");
    }
}

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { data, error } = await validateRequest(req, giftSchema);
    if (error) return error;

    const sanitizedData = sanitizeObject<z.infer<typeof giftSchema>>(data);

    try {
        let wedding;
        if (user.type === "staff") {
            wedding = await prisma.wedding.findUnique({ where: { id: user.weddingId! } });
        } else {
            wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (!wedding) {
                wedding = await prisma.wedding.create({
                    data: { userId: user.userId, groomName: "Groom", brideName: "Bride", date: new Date() }
                });
            }
        }

        if (!wedding) return errorResponse("Wedding not found", 404);

        let finalGuestId = null;
        let displayName = sanitizedData.guestName || "Unknown Guest";

        if (sanitizedData.guestId && sanitizedData.guestId !== "new") {
            finalGuestId = sanitizedData.guestId;
            const existingGuest = await prisma.guest.findUnique({ where: { id: finalGuestId } });
            if (existingGuest) displayName = existingGuest.name;
        } else if (sanitizedData.guestName) {
            const newGuest = await prisma.guest.create({
                data: {
                    name: sanitizedData.guestName,
                    source: sanitizedData.source || null,
                    weddingId: wedding.id
                }
            });
            finalGuestId = newGuest.id;
        }

        const gift = await prisma.gift.create({
            data: {
                amount: sanitizedData.amount,
                currency: sanitizedData.currency,
                method: sanitizedData.method,
                weddingId: wedding.id,
                guestId: finalGuestId,
            },
            include: { guest: true }
        });

        await createLog(wedding.id, "GIFT", `Recorded gift: ${gift.amount} ${gift.currency} from ${displayName}`, user.email || user.role);

        return NextResponse.json(gift);
    } catch (e) {
        return errorResponse("Failed to record gift");
    }
}
