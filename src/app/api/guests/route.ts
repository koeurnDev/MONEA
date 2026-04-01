export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";
import { sanitizeObject } from "@/lib/sanitize";
import { z } from "zod";
import { guestSchema } from "@/lib/validations/guest";
import { standardLimiter, getIP } from "@/lib/ratelimit";
import { GuestService } from "@/services/GuestService";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const ip = getIP(req);
        const { success } = await standardLimiter.limit(ip);
        if (!success) return errorResponse("Too many requests", 429);

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return NextResponse.json({ items: [], pagination: { total: 0, limit, offset, hasMore: false } });

        const result = await GuestService.getGuests(weddingId, { limit, offset });
        return NextResponse.json(result);
    } catch (error: any) {
        const errorLog = `[${new Date().toISOString()}] Guests GET ERROR: ${error.message}\nStack: ${error.stack}\n`;
        require('fs').appendFileSync('tmp/api-errors.log', errorLog);
        return errorResponse("Failed to fetch guests", 500);
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { data, error } = await validateRequest(req, guestSchema);
        if (error) return error;

        const sanitizedData = sanitizeObject<any>(data);
        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

        if (!weddingId) return errorResponse("Wedding not found", 404);

        const guest = await GuestService.createGuest(weddingId, sanitizedData);
        await createLog(weddingId, "CREATE", `Added guest: ${guest.name}`, user.email || user.role);

        return NextResponse.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] POST Error: ${error.message}`);
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
        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

        if (!weddingId) return errorResponse("Wedding not found", 404);

        const guest = await GuestService.updateGuest(id, weddingId, sanitizedFields);
        await createLog(weddingId, "UPDATE", `Updated guest: ${guest.name}`, user.email || user.role);

        return NextResponse.json(guest);
    } catch (error: any) {
        console.error(`[Guests API] PATCH Error: ${error.message}`);
        return errorResponse(error.message || "Failed to update guest", 500);
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return errorResponse("ID required", 400);

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return errorResponse("Wedding not found", 404);

        const guest = await GuestService.deleteGuest(id, weddingId);
        await createLog(weddingId, "DELETE", `Deleted guest: ${guest.name}`, user.email || user.role);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`[Guests API] DELETE Error: ${error.message}`);
        return errorResponse(error.message || "Failed to delete guest", 500);
    }
}