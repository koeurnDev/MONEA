export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";
import { sanitizeObject } from "@/lib/sanitize";
import { z } from "zod";
import { guestSchema } from "@/lib/validations/guest";
import { standardLimiter, getIP } from "@/lib/ratelimit";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const ip = getIP(req);
        const { success } = await standardLimiter.limit(ip);
        if (!success) return errorResponse("Too many requests", 429);

        let weddingId = null;
        if (user.role === ROLES.PLATFORM_OWNER || user.role === ROLES.EVENT_STAFF) {
            weddingId = user.weddingId;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.id } });
            if (wedding) weddingId = wedding.id;
        }

        if (!weddingId) return NextResponse.json([]);

        // Raw SQL for durability
        const guests = await prisma.$queryRaw<any[]>`
            SELECT id, "weddingId", name, "group", source, "guestCode", "sequenceNumber", "createdAt", "updatedAt"
            FROM "Guest"
            WHERE "weddingId" = ${weddingId}
            ORDER BY "createdAt" DESC
        `;

        const decryptedGuests = guests.map(guest => {
            const { phone, ...guestData } = guest;
            return {
                ...guestData,
                // Prioritize 'source' for address, fallback to 'group'
                source: guest.source && guest.source !== 'GIFT_ENTRY' ? guest.source : (guest.group || null),
                phone: phone ? decrypt(phone) : null
            };
        });

        return NextResponse.json(decryptedGuests);
    } catch (error: any) {
        console.error(`[Guests API] GET Error: ${error.message}`, {
            stack: error.stack,
            weddingId: (req as any).weddingId // Custom prop if set
        });
        return errorResponse(`Failed to fetch guests: ${error.message}`, 500);
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const ip = getIP(req);
        const { success } = await standardLimiter.limit(ip);
        if (!success) return errorResponse("Too many requests", 429);

        const { data, error } = await validateRequest(req, guestSchema);
        if (error) return error;

        const sanitizedData = sanitizeObject<any>(data);

        let weddingId = (user as any).weddingId;
        if (!weddingId) {
            const weddingRecord = await prisma.wedding.findFirst({ where: { userId: user.id } });
            if (!weddingRecord) {
                const newWedding = await prisma.wedding.create({
                    data: {
                        userId: user.id, groomName: "Groom", brideName: "Bride",
                        date: new Date(), packageType: "FREE"
                    }
                });
                weddingId = newWedding.id;
            } else {
                weddingId = weddingRecord.id;
            }
        }

        if (!weddingId) return errorResponse("Wedding not found", 404);
        const wedding = { id: weddingId };

        // Generate Guest Code using Raw SQL
        const countResult = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = ${wedding.id}`;
        const count = Number(countResult[0]?.count || 0);
        const guestCode = `G${String(count + 1).padStart(3, '0')}`;
        
        const guestId = crypto.randomUUID();
        const encryptedPhone = sanitizedData.phone ? encrypt(sanitizedData.phone) : null;

        // Calculate next sequence number for this wedding
        const seqResult = await prisma.$queryRaw<any[]>`SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = ${wedding.id}`;
        const sequenceNumber = Number(seqResult[0]?.count || 0) + 1;

        await prisma.$executeRaw`
            INSERT INTO "Guest" ("id", "weddingId", "name", "group", "source", "guestCode", "sequenceNumber", "updatedAt", "createdAt", "phone")
            VALUES (${guestId}, ${wedding.id}, ${sanitizedData.name}, ${sanitizedData.group || sanitizedData.source || "None"}, ${sanitizedData.source || "GIFT_ENTRY"}, ${guestCode}, ${sequenceNumber}, NOW(), NOW(), ${encryptedPhone})
        `;

        const rawGuests = await prisma.$queryRaw<any[]>`SELECT id, "weddingId", name, "group", source, "guestCode", "sequenceNumber", "phone" FROM "Guest" WHERE id = ${guestId} LIMIT 1`;
        const guest = rawGuests[0];

        await createLog(wedding.id, "CREATE", `Added guest: ${guest.name}`, user.email || user.role);
        if (guest.phone) guest.phone = decrypt(guest.phone);

        return NextResponse.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] POST Error: ${error.message}`, {
            stack: error.stack
        });
        return errorResponse(`Failed to create guest: ${error.message}`, 500);
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { data, error } = await validateRequest(req, guestSchema.partial().extend({ id: z.string() }));
        if (error) return error;

        const { id, ...updateFields } = data!;
        const sanitizedFields = sanitizeObject<any>(updateFields);

        const existingGuest = await prisma.guest.findUnique({ where: { id } });
        if (!existingGuest) return errorResponse("Guest not found", 404);

        let weddingId = null;
        if (user.role === ROLES.PLATFORM_OWNER || user.role === ROLES.EVENT_STAFF) {
            weddingId = user.weddingId;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.id } });
            if (wedding) weddingId = wedding.id;
        }

        if (existingGuest.weddingId !== weddingId) return errorResponse("Access denied", 403);

        const guest = await prisma.guest.update({
            where: { id },
            data: sanitizedFields
        });

        await createLog(guest.weddingId, "UPDATE", `Updated guest: ${guest.name}`, user.email || user.role);
        if (guest.phone) guest.phone = decrypt(guest.phone);

        return NextResponse.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] PATCH Error: ${error.message}`);
        return errorResponse("Failed to update guest", 500);
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return errorResponse("ID required", 400);

        const guest = await prisma.guest.findUnique({ where: { id } });
        if (!guest) return errorResponse("Guest not found", 404);

        let weddingId = null;
        if (user.role === ROLES.PLATFORM_OWNER || user.role === ROLES.EVENT_STAFF) {
            weddingId = user.weddingId;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.id } });
            if (wedding) weddingId = wedding.id;
        }

        if (guest.weddingId !== weddingId) return errorResponse("Access denied", 403);

        await prisma.guest.delete({ where: { id } });
        await createLog(guest.weddingId, "DELETE", `Deleted guest: ${guest.name}`, user.email || user.role);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`[Guests API] DELETE Error: ${error.message}`);
        return errorResponse("Failed to delete guest", 500);
    }
}
