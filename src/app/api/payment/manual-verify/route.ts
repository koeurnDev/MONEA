import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/services/PaymentService";
import { getServerUser } from "@/lib/auth";

const rateLimitMap = new Map<string, number>();

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 0. Simple Rate Limiting (1 request per 3 seconds for manual verify)
        const now = Date.now();
        const lastRequest = rateLimitMap.get(user.userId) || 0;
        if (now - lastRequest < 3000) {
            return NextResponse.json({ error: "Please wait before verifying again." }, { status: 429 });
        }
        rateLimitMap.set(user.userId, now);

        const body = await req.json();
        const { packageType } = body;

        // 1. Find the wedding for this user
        const wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId },
            select: { id: true, paymentHash: true, paymentStatus: true, paymentInfo: true }
        });

        if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
        if (wedding.paymentStatus === "PAID") return NextResponse.json({ status: "PAID", alreadyPaid: true });
        if (!wedding.paymentHash) return NextResponse.json({ status: "AWAITING_PAYMENT", message: "No recent payment attempt found." });

        const orderId = wedding.paymentInfo || ("MANUAL_REFRESH_" + Date.now());
        const config = await (prisma as any).systemConfig.findUnique({ where: { id: "GLOBAL" } });
        const accountID = (config?.bakongConfig as any)?.accountID || process.env.BAKONG_ACCOUNT_ID;

        if (!accountID) {
            return NextResponse.json({ error: "System misconfiguration: Missing Bakong ID" }, { status: 500 });
        }

        // 3. Trigger Verification using the stored paymentHash (MD5)
        const result: any = await PaymentService.verifyBakongTransaction(
            wedding.id,
            wedding.paymentHash,
            orderId,
            packageType || "PRO",
            accountID
        );

        // Include orderId and estimated amount in response for the receipt
        if (result.status === "PAID") {
            result.orderId = orderId;
            const pricing = await (prisma as any).systemConfig.findUnique({ where: { id: "GLOBAL" } });
            result.amount = (packageType === "PREMIUM") ? (pricing?.proPrice || 19) : (pricing?.stadPrice || 9);
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("[API/PAYMENT/MANUAL-VERIFY] Error:", error);
        return NextResponse.json({ error: "Verification failed", details: error.message }, { status: 500 });
    }
}
