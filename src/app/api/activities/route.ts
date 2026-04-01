export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { errorResponse } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";

export async function GET() {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

    if (!weddingId) return NextResponse.json([]);

    const activities = await prisma.activity.findMany({
        where: { weddingId },
        orderBy: { order: "asc" },
    });

    return NextResponse.json(activities);
}

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { title, time, description, icon } = sanitizeObject<any>(body);

    if (!title || !time) {
        return errorResponse("Title and Time are required", 400);
    }

    // Protection: Length limits
    if (title.length > 100) return errorResponse("Title too long (Max 100)", 400);
    if (description && description.length > 1000) return errorResponse("Description too long (Max 1000)", 400);

    const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
    if (!weddingId) return errorResponse("Wedding not found", 404);

    // Get next order
    const lastActivity = await prisma.activity.findFirst({
        where: { weddingId },
        orderBy: { order: 'desc' }
    });
    const newOrder = (lastActivity?.order || 0) + 1;

    const activity = await prisma.activity.create({
        data: {
            title,
            time,
            description,
            icon,
            order: newOrder,
            weddingId: weddingId,
        },
    });

    await createLog(weddingId, "CREATE", `Created activity: ${title}`, user.email || user.role);

    return NextResponse.json(activity);
}
