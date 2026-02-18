import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { weddingId: string } }) {
    const items = await prisma.galleryItem.findMany({
        where: { weddingId: params.weddingId },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
}
