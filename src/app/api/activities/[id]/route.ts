export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { errorResponse } from "@/lib/api-utils";
import { createLog } from "@/lib/audit-utils";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    let weddingId = null;
    if (user.role === "STAFF") {
        weddingId = (user as any).weddingId;
    } else {
        const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        if (wedding) weddingId = wedding.id;
    }

    if (!weddingId) return errorResponse("Wedding not found", 404);

    const activityId = params.id;
    const body = await req.json();
    const { title, time, description } = sanitizeObject<any>(body);

    if (!title || !time) {
        return errorResponse("Title and Time are required", 400);
    }

    // Protection: Length limits
    if (title.length > 100) return errorResponse("Title too long (Max 100)", 400);
    if (description && description.length > 1000) return errorResponse("Description too long (Max 1000)", 400);

    try {
        const activity = await prisma.activity.update({
            where: {
                id: activityId,
                weddingId: weddingId, // ensure the activity belongs to this user's wedding
            },
            data: {
                title,
                time,
                description,
            },
        });

        await createLog(weddingId, "UPDATE", `Updated activity: ${title}`, user.email || user.role);

        return NextResponse.json(activity);
    } catch (error) {
        return errorResponse("Failed to update activity");
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    let weddingId = null;
    if (user.role === "STAFF") {
        weddingId = (user as any).weddingId;
    } else {
        const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        if (wedding) weddingId = wedding.id;
    }

    if (!weddingId) return errorResponse("Wedding not found", 404);

    const activityId = params.id;

    try {
        const deleted = await prisma.activity.delete({
            where: {
                id: activityId,
                weddingId: weddingId, // ensure the activity belongs to this user's wedding
            },
        });

        await createLog(weddingId, "DELETE", `Deleted activity: ${deleted.title}`, user.email || user.role);

        return NextResponse.json({ success: true });
    } catch (error) {
        return errorResponse("Failed to delete activity");
    }
}
