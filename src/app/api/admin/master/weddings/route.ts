export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;
        const skip = (page - 1) * limit;

        const weddings = await prisma.wedding.findMany({
            where: {
                OR: [
                    { groomName: { contains: search } },
                    { brideName: { contains: search } },
                    { weddingCode: { contains: search } }
                ]
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { guests: true, gifts: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: skip
        });

        const total = await prisma.wedding.count({
            where: {
                OR: [
                    { groomName: { contains: search } },
                    { brideName: { contains: search } },
                    { weddingCode: { contains: search } }
                ]
            }
        });

        return NextResponse.json({
            weddings,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Master Weddings Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
