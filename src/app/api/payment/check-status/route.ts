import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";
import { PaymentService } from "@/services/PaymentService";

const rateLimitMap = new Map<string, number>();

export async function POST(req: Request) {
    console.log("[API/Check-Status] Processing POST request...");
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    // 0. Simple Rate Limiting (800ms to allow 1.5s - 2s polling buffer)
    const now = Date.now();
    const lastRequest = rateLimitMap.get(user.userId) || 0;
    if (now - lastRequest < 800) {
        return errorResponse("Too many requests. Please wait.", 429);
    }
    rateLimitMap.set(user.userId, now);

    try {
        const { md5, orderId, packageType: reqPackageType } = await req.json();
        
        const wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, packageType: true, paymentStatus: true }
        });

        if (!wedding) return errorResponse("Wedding not found", 404);
        
        // Fallback to the requested packageType or PRO if not specified
        const finalPackageType = reqPackageType || "PRO";
        
        const accountID = process.env.BAKONG_ACCOUNT_ID || "";

        // Perform real Bakong verification
        const result = await PaymentService.verifyBakongTransaction(
            wedding.id, 
            md5, 
            orderId, 
            finalPackageType,
            accountID
        );

        return NextResponse.json({ 
            status: result.status, 
            packageType: result.status === "PAID" ? finalPackageType : wedding.packageType,
            simulated: (result as any).simulated,
            alreadyPaid: (result as any).alreadyPaid
        });

    } catch (e: any) {
        console.error("[API/Check-Status] Error:", e);
        return errorResponse("Server Error", 500);
    }
}
