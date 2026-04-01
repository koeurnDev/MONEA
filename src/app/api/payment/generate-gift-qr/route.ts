import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { PaymentService } from "@/services/PaymentService";
import { errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return errorResponse("Unauthorized", 401);

    try {
        const { amount, currency = "USD" } = await req.json();
        if (!amount || amount <= 0) return errorResponse("Invalid amount", 400);

        const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;
        if (!weddingId) return errorResponse("Wedding not found", 404);

        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            include: { user: true }
        });

        if (!wedding) return errorResponse("Wedding not found", 404);

        // Find a Bakong/KHQR account in settings
        const settings = await prisma.wedding.findUnique({
             where: { id: weddingId },
             select: { themeSettings: true }
        });

        const bankAccounts = (settings?.themeSettings as any)?.bankAccounts || [];
        const bakongAccount = bankAccounts.find((acc: any) => 
            acc.bankName?.toLowerCase().includes("bakong") || 
            acc.bankName?.toLowerCase().includes("wing") ||
            acc.bankName?.toLowerCase().includes("aba")
        );

        if (!bakongAccount) {
            // Fallback to platform account if guest hasn't set one up (or return error)
            return errorResponse("No Bakong account configured for this wedding", 400);
        }

        const result = await PaymentService.generateKHQR({
            amount: parseFloat(amount),
            currency: currency as "USD" | "KHR",
            merchantName: bakongAccount.accountName || "Wedding Gift",
            accountID: bakongAccount.accountNumber, // In Bakong, AccountID is the account number
            orderId: `GFT-${weddingId.slice(0, 8)}-${Date.now()}`
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Gift QR] Error:", error.message);
        return errorResponse(error.message || "Failed to generate QR", 500);
    }
}
