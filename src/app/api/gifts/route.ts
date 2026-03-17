import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";
import { sanitizeObject } from "@/lib/sanitize";
import { giftSchema } from "@/lib/validations/gift";
import { getIP } from "@/lib/utils";

// HELPER: Convert Raw SQL Result (Plain Object) to Prisma-compatible format
const formatGift = (gift: any) => {
    if (!gift) return null;
    return {
        ...gift,
        amount: gift.amount?.toString() || "0",
        createdAt: gift.createdAt || new Date().toISOString(),
        updatedAt: gift.updatedAt || new Date().toISOString()
    };
};

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

        if (!weddingId) return NextResponse.json({ gifts: [], role: user.role });

        // Raw SQL for durability against stale Prisma Client - Using explicit columns to avoid cached plan errors
        const gifts = await prisma.$queryRawUnsafe<any[]>(
            `SELECT g.id, g."weddingId", g."guestId", g.amount, g.currency, g.method, g."sequenceNumber", g."createdAt", g."updatedAt",
                    (SELECT JSON_BUILD_OBJECT('id', gs.id, 'name', gs.name, 'phone', gs.phone, 'guestCode', gs."guestCode", 'group', gs."group", 'source', gs."source") 
                     FROM "Guest" gs WHERE gs.id = g."guestId") as guest
             FROM "Gift" g
             WHERE g."weddingId" = $1
             ORDER BY g."createdAt" DESC
             ${limit ? `LIMIT ${parseInt(limit)}` : ""}`,
            weddingId
        );

        const decryptedGifts = gifts.map(gift => ({
            ...formatGift(gift),
            guest: gift.guest ? {
                ...gift.guest,
                phone: gift.guest.phone ? decrypt(gift.guest.phone) : gift.guest.phone
            } : gift.guest
        }));

        return NextResponse.json({ gifts: decryptedGifts, role: user.role });
    } catch (error: any) {
        console.error(`[Gifts API] GET ERROR:`, error);
        return errorResponse("Failed to fetch gifts", 500);
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { data, error } = await validateRequest(req, giftSchema);
        if (error) return error;

        const body = sanitizeObject<any>(data);

        let weddingId = (user as any).weddingId;
        if (!weddingId) {
            console.log(`[Gifts API] No weddingId in token for user: ${user.id}. Searching in DB...`);
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) {
                weddingId = wedding.id;
                console.log(`[Gifts API] Found wedding ${weddingId} for user ${user.id}`);
            } else {
                console.warn(`[Gifts API] No wedding found in DB for user ${user.id}`);
            }
        }

        if (!weddingId) return errorResponse("Wedding not found", 404);

        let guestId = body.guestId === "new" || !body.guestId ? null : body.guestId;

        // IDOR Check: Ensure the guest belongs to this wedding before proceeding
        if (guestId) {
            const guestOwnership = await prisma.guest.findFirst({
                where: { id: guestId, weddingId },
                select: { id: true }
            });
            if (!guestOwnership) return errorResponse("Guest access denied", 403);
        }

        // Guest logic
        if (!guestId && body.guestName) {
            const existingGuest = await prisma.guest.findFirst({
                where: { weddingId, name: { equals: body.guestName, mode: 'insensitive' } }
            });
            if (existingGuest) {
                guestId = existingGuest.id;
            } else {
                // Generate Guest Code
                const countResult = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = ${weddingId}`;
                const count = Number(countResult[0]?.count || 0);
                const guestCode = `G${String(count + 1).padStart(3, '0')}`;
                
                // INSERT GUEST using Raw SQL to bypass stale Prisma Client
                const newGuestId = crypto.randomUUID();
                await prisma.$executeRaw`
                    INSERT INTO "Guest" ("id", "weddingId", "name", "group", "source", "guestCode", "updatedAt", "createdAt")
                    VALUES (${newGuestId}, ${weddingId}, ${body.guestName}, ${body.source || "None"}, ${body.source || "None"}, ${guestCode}, NOW(), NOW())
                `;
                guestId = newGuestId;
            }
        }

        // Calculate next sequence number for this wedding
        const giftCountResult = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "Gift" WHERE "weddingId" = ${weddingId}`;
        const sequenceNumber = Number(giftCountResult[0]?.count || 0) + 1;

        // INSERT GIFT using Raw SQL
        const fallbackId = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO "Gift" ("id", "weddingId", "guestId", "amount", "currency", "method", "sequenceNumber", "updatedAt", "createdAt") 
            VALUES (${fallbackId}, ${weddingId}, ${guestId}, ${Number(body.amount)}, ${body.currency}::"Currency", ${body.method || "Cash"}::"PaymentMethod", ${sequenceNumber}, NOW(), NOW())
        `;
        
        const rawGifts = await prisma.$queryRaw<any[]>`SELECT id, "weddingId", "guestId", amount, currency, method, "sequenceNumber", "createdAt", "updatedAt" FROM "Gift" WHERE id = ${fallbackId} LIMIT 1`;
        const gift = formatGift(rawGifts[0]);

        // Audit Log
        createLog(weddingId, "GIFT", `បានទទួលចំណងដៃទី #${sequenceNumber} ពី ${body.guestName || 'ភ្ញៀវ'} ចំនួន ${body.amount}${body.currency === 'USD' ? '$' : '៛'}`, user.name || "System", { ip: getIP(req) }).catch(() => {});

        return NextResponse.json(gift);
    } catch (error: any) {
        console.error(`[Gifts API] POST ERROR:`, error);
        try {
            const fs = require('fs');
            fs.appendFileSync('d:/MONEA/debug_api.txt', `${new Date().toISOString()} - [Gifts API] POST ERROR: ${error.message}\n${error.stack}\n`);
        } catch (e) {}
        return errorResponse("Failed to save gift", 500);
    }
}
