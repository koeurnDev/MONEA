export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded as { userId: string, role: string } | null;
}

// GET: Fetch all wishes for a specific wedding
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let weddingId = searchParams.get('weddingId');

        // If no weddingId param, try to infer from session (for Dashboard)
        if (!weddingId) {
            const user = await getUser();
            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) weddingId = wedding.id;
        }

        if (!weddingId) {
            return NextResponse.json({ error: 'Wedding ID is required or Wedding not found' }, { status: 400 });
        }

        const wishes = await prisma.guestbookEntry.findMany({
            where: { weddingId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(wishes);
    } catch (error) {
        console.error('Error fetching wishes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Add a new wish
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { guestName, message, weddingId } = body;

        if (!guestName || !message || !weddingId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newWish = await prisma.guestbookEntry.create({
            data: {
                guestName,
                message,
                weddingId,
            },
        });

        return NextResponse.json(newWish);
    } catch (error) {
        console.error('Error adding wish:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
