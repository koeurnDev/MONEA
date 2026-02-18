import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth"; // Helper to get user from token
import { cookies } from "next/headers";

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    return verifyToken(token) as { userId: string } | null;
}

export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { packageType } = await req.json(); // "PRO" or "PREMIUM"

        if (!packageType) return NextResponse.json({ error: "Package required" }, { status: 400 });

        const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
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
