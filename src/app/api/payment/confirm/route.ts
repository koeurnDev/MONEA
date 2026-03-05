export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    try {
        const { packageType } = await req.json(); // "PRO" or "PREMIUM"

        if (!packageType) return errorResponse("Package required", 400);

        let wedding;
        if (user.role === "STAFF") {
            wedding = await prisma.wedding.findUnique({ where: { id: (user as any).weddingId } });
        } else {
            wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        }
        if (!wedding) {
            console.error("Payment Error: Wedding not found for userId", user.userId);
            return NextResponse.json({ error: "រកមិនឃើញទិន្នន័យមង្គលការ (Wedding Not Found)" }, { status: 404 });
        }

        // Logic for expiration
        let expiresAt = null;
        if (packageType === "PRO") {
            const date = new Date();
            date.setDate(date.getDate() + 30); // 30 days
            expiresAt = date;
        } else if (packageType === "PREMIUM") {
            // Null means forever, or set to 100 years
            const date = new Date();
            date.setFullYear(date.getFullYear() + 100);
            expiresAt = date;
        }

        const updated = await prisma.wedding.update({
            where: { id: wedding.id },
            data: {
                packageType,
                paymentStatus: "PAID",
                expiresAt,
                status: "ACTIVE" // improved UX: auto-activate if not active
            }
        });

        console.log("Payment Success: Updated wedding", wedding.id, "to", packageType);

        return NextResponse.json({ success: true, wedding: updated });

    } catch (error) {
        console.error("Payment Server Error:", error);
        return NextResponse.json({ error: "មានបញ្ហាបច្ចេកទេស (Internal Server Error)" }, { status: 500 });
    }
}
