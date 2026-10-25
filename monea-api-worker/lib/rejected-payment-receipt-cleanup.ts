import { cloudinaryDelete } from "@/lib/cloudinary-edge";
import { deleteR2Object, R2_PUBLIC_ID_PREFIX } from "@/lib/r2-storage";
import { executeRaw, queryRaw } from "@/lib/prisma";

const RECEIPT_RETENTION_DAYS = 7;
const CLEANUP_BATCH_SIZE = 100;

interface RejectedReceipt {
    id: string;
    weddingId: string;
    receiptUrl: string;
    rejectedAt: Date | string;
}

interface LegacyRejectedReceipt {
    id: string;
    paymentInfo: string;
    paymentRejectedAt: Date | string;
}

function getReceiptPublicId(receiptUrl: string): string | null {
    try {
        const url = new URL(receiptUrl);
        if (url.hostname === "media.moneoez.com" && url.protocol === "https:") {
            const key = url.pathname.split("/").filter(Boolean).map(decodeURIComponent).join("/");
            return key ? `${R2_PUBLIC_ID_PREFIX}${key}` : null;
        }
        if (url.hostname !== "res.cloudinary.com") return null;

        const segments = url.pathname.split("/").filter(Boolean);
        const uploadIndex = segments.indexOf("upload");
        if (uploadIndex < 0) return null;

        const pathAfterUpload = segments.slice(uploadIndex + 1);
        const versionIndex = pathAfterUpload.findIndex((segment) => /^v\d+$/.test(segment));
        if (versionIndex < 0) return null;

        const publicIdSegments = pathAfterUpload.slice(versionIndex + 1);
        if (publicIdSegments.length === 0) return null;

        const lastIndex = publicIdSegments.length - 1;
        publicIdSegments[lastIndex] = publicIdSegments[lastIndex].replace(/\.[^.]+$/, "");
        return publicIdSegments.every(Boolean) ? publicIdSegments.join("/") : null;
    } catch {
        return null;
    }
}

export async function cleanupRejectedPaymentReceipts(env: Record<string, unknown>): Promise<void> {
    const expiredBefore = new Date(Date.now() - RECEIPT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const receipts = await queryRaw<RejectedReceipt>(
        `SELECT id, "weddingId", "receiptUrl", "rejectedAt"
         FROM "RejectedPaymentReceipt"
         WHERE "rejectedAt" <= $1
         ORDER BY "rejectedAt" ASC
         LIMIT $2`,
        expiredBefore,
        CLEANUP_BATCH_SIZE,
    );

    for (const receipt of receipts) {
        try {
            const current = await queryRaw<{
                paymentInfo: string | null;
                paymentStatus: string;
                paymentRejectedAt: Date | string | null;
            }>(
                `SELECT "paymentInfo", "paymentStatus", "paymentRejectedAt"
                 FROM "Wedding" WHERE id = $1 LIMIT 1`,
                receipt.weddingId,
            );
            const activeReceipt = current[0];
            const sameReceiptIsActive = activeReceipt?.paymentInfo === receipt.receiptUrl
                && (activeReceipt.paymentStatus !== "REJECTED"
                    || (activeReceipt.paymentRejectedAt !== null
                        && new Date(activeReceipt.paymentRejectedAt).getTime() > new Date(receipt.rejectedAt).getTime()));

            if (sameReceiptIsActive) {
                await executeRaw(
                    `DELETE FROM "RejectedPaymentReceipt" WHERE id = $1 AND "rejectedAt" = $2`,
                    receipt.id,
                    receipt.rejectedAt,
                );
                continue;
            }

            const publicId = getReceiptPublicId(receipt.receiptUrl);
            if (!publicId) {
                console.error("[RejectedReceiptCleanup] Could not parse media public ID:", receipt.id);
                continue;
            }

            if (publicId.startsWith(R2_PUBLIC_ID_PREFIX)) {
                await deleteR2Object(env, publicId);
            } else {
                const result = await cloudinaryDelete(publicId, "image", env);
                if (result.result !== "ok" && result.result !== "not found") {
                    console.error("[RejectedReceiptCleanup] Cloudinary deletion failed:", receipt.id, result.result);
                    continue;
                }
            }

            await executeRaw(
                `UPDATE "Wedding"
                 SET "paymentInfo" = NULL, "paymentRejectedAt" = NULL, "updatedAt" = NOW()
                 WHERE id = $1
                   AND "paymentStatus" = 'REJECTED'
                   AND "paymentRejectedAt" = $2
                   AND "paymentInfo" = $3`,
                receipt.weddingId,
                receipt.rejectedAt,
                receipt.receiptUrl,
            );
            await executeRaw(
                `DELETE FROM "RejectedPaymentReceipt" WHERE id = $1 AND "rejectedAt" = $2`,
                receipt.id,
                receipt.rejectedAt,
            );
        } catch (error) {
            console.error("[RejectedReceiptCleanup] Failed to purge receipt:", receipt.id, error);
        }
    }

    const legacyReceipts = await queryRaw<LegacyRejectedReceipt>(
        `SELECT id, "paymentInfo", "paymentRejectedAt"
         FROM "Wedding"
         WHERE "paymentStatus" = 'REJECTED'
           AND "paymentRejectedAt" <= $1
           AND "paymentInfo" IS NOT NULL
           AND "paymentInfo" NOT LIKE 'https://res.cloudinary.com/%'
         ORDER BY "paymentRejectedAt" ASC
         LIMIT $2`,
        expiredBefore,
        CLEANUP_BATCH_SIZE,
    );

    for (const receipt of legacyReceipts) {
        try {
            const publicId = getReceiptPublicId(receipt.paymentInfo);
            if (publicId?.startsWith(R2_PUBLIC_ID_PREFIX)) {
                await deleteR2Object(env, publicId);
            }
            await executeRaw(
                `UPDATE "Wedding"
                 SET "paymentInfo" = NULL, "paymentRejectedAt" = NULL, "updatedAt" = NOW()
                 WHERE id = $1
                   AND "paymentStatus" = 'REJECTED'
                   AND "paymentRejectedAt" = $2
                   AND "paymentInfo" = $3`,
                receipt.id,
                receipt.paymentRejectedAt,
                receipt.paymentInfo,
            );
        } catch (error) {
            console.error("[RejectedReceiptCleanup] Failed to clear legacy receipt:", receipt.id, error);
        }
    }
}
