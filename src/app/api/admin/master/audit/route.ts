import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const action = searchParams.get("action") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 50;
        const skip = (page - 1) * limit;

        const where: any = {
            OR: [
                { description: { contains: search } },
                { actorName: { contains: search } },
                { wedding: { groomName: { contains: search } } },
                { wedding: { brideName: { contains: search } } }
            ]
        };

        if (action) {
            where.action = action;
        }

        const logs = await prisma.log.findMany({
            where,
            include: {
                wedding: {
                    select: { groomName: true, brideName: true, id: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: skip
        });

        const total = await prisma.log.count({ where });

        return NextResponse.json({
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Master Audit Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
