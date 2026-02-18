import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
        where: { accessToken: token } as any,
        include: { wedding: true }
    });

    if (!staff) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    return NextResponse.json({
        valid: true,
        staff: {
            name: staff.name,
            weddingCode: (staff.wedding as any).weddingCode
        }
    });
}
