export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";
import { sanitizeObject } from "@/lib/sanitize";
import { giftSchema } from "@/lib/validations/gift";
import { getIP } from "@/lib/utils";
import { GiftService } from "@/services/GiftService";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function logError(api: string, error: any, context?: any) {
    const logPath = path.join(process.cwd(), "tmp/api-errors.log");
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${api} ERROR: ${error.message}\nStack: ${error.stack}\nContext: ${JSON.stringify(context || {})}\n\n`;
    try {
        fs.appendFileSync(logPath, entry);
    } catch (e) {}
}

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return NextResponse.json({ items: [], pagination: { total: 0, limit, offset, hasMore: false }, role: user.role });

        const result = await GiftService.getGifts(weddingId, { limit, offset });
        return NextResponse.json({ ...result, role: user.role });
    } catch (error: any) {
        console.error(`[Gifts API] GET ERROR:`, error);
        return errorResponse("Failed to fetch gifts", 500);
    }
}

export async function POST(req: Request) {
    let user: any = null;
    let body: any = null;
    try {
        user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        const { data, error } = await validateRequest(req, giftSchema);
        if (error) return error;

        body = sanitizeObject<any>(data);
        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

        if (!weddingId) return errorResponse("Wedding not found", 404);

        const gift = await GiftService.createGift(weddingId, body);
        return NextResponse.json(gift);
    } catch (error: any) {
        console.error(`[Gifts API] POST ERROR:`, error);
        logError("Gifts POST", error, { userId: user?.id, body });
        return errorResponse("Failed to save gift", 500, error.message);
    }
}
