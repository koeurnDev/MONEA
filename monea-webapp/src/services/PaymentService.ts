import { KHQR, TAG, CURRENCY, COUNTRY } from "ts-khqr";
import { prisma, executeRaw } from "@/lib/prisma";

export interface QRPayload {
    amount: number;
    currency: "USD" | "KHR";
    merchantName: string;
    accountID: string;
    orderId: string;
    weddingId?: string;
}

export class PaymentService {
    /**
     * Generates a Bakong KHQR for a given payload.
     */
    static async generateKHQR(payload: QRPayload) {
        try {
            const safeBillNumber = (payload.orderId || `BILL-${Date.now().toString(36)}`).slice(0, 24);

            const result = KHQR.generate({
                tag:                 TAG.INDIVIDUAL,
                accountID:           payload.accountID,
                merchantName:        payload.merchantName || "MONEA",
                merchantCity:        "Phnom Penh",
                amount:              Number(payload.amount),
                currency:            payload.currency === "USD" ? CURRENCY.USD : CURRENCY.KHR,
                countryCode:         COUNTRY.KH,
                expirationTimestamp: Date.now() + 10 * 60 * 1000, // 10 minutes
                additionalData:      { billNumber: safeBillNumber },
            });

            if (result.status.code !== 0 || !result.data) {
                throw new Error(result.status.message || "Failed to generate KHQR");
            }

            const qrData  = result.data.qr;
            const md5Hash = result.data.md5;
            const orderId = safeBillNumber;

            if (payload.weddingId && md5Hash) {
                await executeRaw(
                    `UPDATE "Wedding" SET "paymentHash" = $1, "paymentInfo" = $2 WHERE "id" = $3`,
                    md5Hash,
                    orderId,
                    payload.weddingId
                );
            }

            return {
                qr: qrData,
                md5: md5Hash,
                orderId: orderId
            };
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Verifies a Bakong transaction with a 2-layer safety check.
     */
    static async verifyBakongTransaction(
        weddingId: string, 
        md5: string, 
        orderId: string, 
        packageType: string,
        accountID: string
    ): Promise<{ status: string; alreadyPaid: boolean; method?: string; message?: string }> {
        const token = process.env.BAKONG_API_TOKEN;
        if (!token) throw new Error("BAKONG_API_TOKEN is not configured.");

        // VULNERABILITY FIX: Extract true packageType from secure orderId to prevent price manipulation
        let actualPackageType = packageType;
        if (orderId && orderId.startsWith("UPG-")) {
            const parts = orderId.split("-");
            if (parts.length >= 2 && (parts[1] === "PRO" || parts[1] === "PREMIUM")) {
                actualPackageType = parts[1];
            }
        }

        try {
            // --- LAYER 0: DATABASE CHECK ---
            const wedding = await prisma.wedding.findUnique({
                where: { id: weddingId },
                select: { paymentStatus: true, packageType: true }
            });

            if (!wedding) throw new Error("Wedding record not found.");

            if (wedding.paymentStatus === "PAID" && wedding.packageType === actualPackageType) {
                return { status: "PAID", alreadyPaid: true };
            }

            // --- PREPARE API PROBE ---
            const isUat = accountID.includes("uat@bkrt") || accountID.includes("@uat") || (process.env.BAKONG_API_URL || "").includes("uat");
            const baseUrl = isUat ? "https://api-bakong-uat.nbc.gov.kh" : "https://api-bakong.nbc.gov.kh";
            const timeout = 12000; 

            const headers = { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            // --- LAYER 1: MD5 PROBE (PRIMARY) ---
            if (md5) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);

                    const response = await fetch(`${baseUrl}/v1/check_transaction_by_md5`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ md5, merchant_id: accountID }),
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const result = await response.json();
                        if (result.responseCode === 0 && result.data) {
                            console.log(`[Bakong/SUCCESS] MD5 match for Wedding: ${weddingId}`);
                            await this.activateWedding(weddingId, result.data.hash, actualPackageType);
                            return { status: "PAID", alreadyPaid: false, method: "MD5" };
                        }
                    }
                } catch (err: any) {
                    console.warn(`[Bakong/L1] MD5 probe failed: ${err.message}`);
                }
            }

            // --- LAYER 2: EXTERNAL ID PROBE (FALLBACK) ---
            if (orderId) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);

                    const response = await fetch(`${baseUrl}/v1/check_transaction_by_external_id`, {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ external_id: orderId, merchant_id: accountID }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const result = await response.json();
                        if (result.responseCode === 0 && result.data) {
                            console.log(`[Bakong/SUCCESS] ExtID match for Order: ${orderId}`);
                            await this.activateWedding(weddingId, result.data.hash, actualPackageType);
                            return { status: "PAID", alreadyPaid: false, method: "ExternalID" };
                        }
                    }
                } catch (err: any) {
                    console.error(`[Bakong/L2] Fallback failed: ${err.message}`);
                }
            }

            return { status: "PENDING", alreadyPaid: false };
        } catch (e: any) {
            console.error("[Bakong/System] Major verification error:", e.message);
            return { status: "ERROR", message: e.message, alreadyPaid: false };
        }
    }

    /**
     * Activates a wedding package using raw SQL.
     */
    static async activateWedding(weddingId: string, trxHash: string, packageType: string) {
        let attempts = 3;
        while (attempts > 0) {
            try {
                await executeRaw(
                    `UPDATE "Wedding" SET 
                        "paymentStatus" = $1, 
                        "status" = $2, 
                        "bakongTrxId" = $3, 
                        "packageType" = $4::"PackageType",
                        "updatedAt" = NOW()
                    WHERE "id" = $5`,
                    "PAID", "ACTIVE", trxHash, packageType, weddingId
                );
                console.info(`[DB/Activation] Wedding ${weddingId} successfully upgraded to ${packageType}.`);
                return;
            } catch (err: any) {
                attempts--;
                console.error(`[DB/Activation] Attempt failed (${attempts} left): ${err.message}`);
                if (attempts === 0) {
                    // Final fallback to Prisma update
                    await prisma.wedding.update({
                        where: { id: weddingId },
                        data: {
                            paymentStatus: 'PAID',
                            status: 'ACTIVE',
                            bakongTrxId: trxHash,
                            packageType: packageType as any
                        }
                    });
                } else {
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }
    }
}
