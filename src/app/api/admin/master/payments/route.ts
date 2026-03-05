export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const pendingWeddings = await prisma.wedding.findMany({
            where: {
                OR: [
                    { paymentStatus: "PENDING" },
                    { paymentStatus: "AWAITING_VERIFICATION" }
                ],
                packageType: { not: "FREE" }
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(pendingWeddings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { weddingId, status, packageType } = body;

        if (!weddingId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updatedWedding = await prisma.wedding.update({
            where: { id: weddingId },
            data: {
                paymentStatus: status, // "PAID"
                packageType: packageType || undefined,
            }
        });

        // Log the administrative action
        await prisma.log.create({
            data: {
                action: "PAYMENT_APPROVAL",
                description: `Superadmin ${user.email} approved payment for wedding ${weddingId}. Plan: ${packageType}`,
                actorName: (user as any).name || (user as any).email,
                weddingId: weddingId
            }
        });

        return NextResponse.json(updatedWedding);
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
    }
}
