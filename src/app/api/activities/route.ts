import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded as { userId: string, role: string } | null;
}

export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
    if (!wedding) return NextResponse.json([]);

    const activities = await prisma.activity.findMany({
        where: { weddingId: wedding.id },
        orderBy: { order: "asc" },
    });

    return NextResponse.json(activities);
}

export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, time, description } = body;

    if (!title || !time) {
        return NextResponse.json({ error: "Title and Time are required" }, { status: 400 });
    }

    let wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
    if (!wedding) {
        wedding = await prisma.wedding.create({
            data: { userId: user.userId, groomName: "Groom", brideName: "Bride", date: new Date() }
        });
    }

    // Get next order
    const lastActivity = await prisma.activity.findFirst({
        where: { weddingId: wedding.id },
        orderBy: { order: 'desc' }
    });
    const newOrder = (lastActivity?.order || 0) + 1;

    const activity = await prisma.activity.create({
        data: {
            title,
            time,
            description,
            order: newOrder,
            weddingId: wedding.id,
        },
    });

    return NextResponse.json(activity);
}
