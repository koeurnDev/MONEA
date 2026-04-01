import { NextResponse } from "next/server";
import { PaymentService } from "@/services/PaymentService";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const {
            packageType,
            currency = "USD",
            orderId = "UPG-" + Date.now()
        } = await req.json();

        // Find the wedding associated with this user
        const wedding = await prisma.wedding.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

        // 1. Fetch Dynamic Prices from DB
        const config = await prisma.systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });
        const stadPrice = config?.stadPrice ?? 9.00;
        const proPrice = config?.proPrice ?? 19.00;
        console.log(`[API/KHQR] Prices - Stad: ${stadPrice}, Pro: ${proPrice}`);

        // 2. Strict Merchant Details (from environment variables)
        const MERCHANT_NAME = process.env.BAKONG_MERCHANT_NAME || "MONEA";
        const ACCOUNT_ID = process.env.BAKONG_ACCOUNT_ID;
        if (!ACCOUNT_ID) {
            console.error("[API/KHQR] BAKONG_ACCOUNT_ID is not set in environment variables.");
            return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
        }

        // 3. Strict Amount Validation
        let amount = 0;
        if (packageType === "PRO") {
            amount = stadPrice;
        } else if (packageType === "PREMIUM") {
            amount = proPrice;
        } else {
            return NextResponse.json({ error: "Invalid package type" }, { status: 400 });
        }

        const result = await PaymentService.generateKHQR({
            amount,
            currency: "USD",
            merchantName: MERCHANT_NAME,
            accountID: ACCOUNT_ID,
            orderId,
            weddingId: wedding.id
        });
        console.log("[API/KHQR] USD QR Generated successfully for Order:", orderId);

        return NextResponse.json({
            qr: result.qr,
            orderId: result.orderId,
            md5: result.md5,
            success: true
        });

    } catch (e: any) {
        console.error("[API/KHQR] Server Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
