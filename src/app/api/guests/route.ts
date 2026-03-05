export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";
import { sanitizeObject } from "@/lib/sanitize";
import * as z from "zod";


const guestSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional().nullable(),
    group: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
});

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) weddingId = wedding.id;
        }

        if (!weddingId) return NextResponse.json([]);

        const guests = await prisma.guest.findMany({
            where: { weddingId },
            orderBy: { createdAt: "desc" }
        });

        const decryptedGuests = guests.map(guest => ({
            ...guest,
            phone: guest.phone ? decrypt(guest.phone) : guest.phone
        }));

        return NextResponse.json(decryptedGuests);
    } catch (e) {
        return errorResponse("Failed to fetch guests");
    }
}

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { data, error } = await validateRequest(req, guestSchema);
    if (error) return error;

    const sanitizedData = sanitizeObject<z.infer<typeof guestSchema>>(data);

    try {
        let wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        if (!wedding) {
            wedding = await prisma.wedding.create({
                data: {
                    userId: user.userId,
                    groomName: "Groom",
                    brideName: "Bride",
                    date: new Date(),
                }
            });
        }

        const guest = await prisma.guest.create({
            data: {
                ...sanitizedData,
                phone: sanitizedData.phone ? encrypt(sanitizedData.phone) : null,
                weddingId: wedding.id
            }
        });

        await createLog(wedding.id, "CREATE", `Added guest: ${guest.name}`, user.email || user.role);

        if (guest.phone) guest.phone = decrypt(guest.phone);
        return NextResponse.json(guest);
    } catch (e) {
        return errorResponse("Failed to create guest");
    }
}

export async function PATCH(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { data, error } = await validateRequest(req, guestSchema.partial().extend({ id: z.string() }));
    if (error) return error;

    try {
        const { id, ...updateFields } = data!;

        // SECURITY: Ownership Check (IDOR Prevention)
        const existingGuest = await prisma.guest.findUnique({ where: { id } });
        if (!existingGuest) return errorResponse("Guest not found", 404);

        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) weddingId = wedding.id;
        }

        if (existingGuest.weddingId !== weddingId) {
            console.error(`[Security] IDOR attempt by user ${user.userId} on guest ${id}`);
            return errorResponse("Access denied", 403);
        }

        const guest = await prisma.guest.update({
            where: { id },
            data: updateFields
        });

        await createLog(guest.weddingId, "UPDATE", `Updated guest: ${guest.name}`, user.email || user.role);

        if (guest.phone) guest.phone = decrypt(guest.phone);
        return NextResponse.json(guest);
    } catch (e) {
        return errorResponse("Failed to update guest");
    }
}

export async function DELETE(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return errorResponse("ID required", 400);

    try {
        const guest = await prisma.guest.findUnique({ where: { id } });
        if (!guest) return errorResponse("Guest not found", 404);

        // SECURITY: Ownership Check (IDOR Prevention)
        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) weddingId = wedding.id;
        }

        if (guest.weddingId !== weddingId) {
            console.error(`[Security] IDOR attempt by user ${user.userId} to delete guest ${id}`);
            return errorResponse("Access denied", 403);
        }

        await prisma.guest.delete({ where: { id } });
        await createLog(guest.weddingId, "DELETE", `Deleted guest: ${guest.name}`, user.email || user.role);

        return NextResponse.json({ success: true });
    } catch (e) {
        return errorResponse("Failed to delete guest");
    }
}
