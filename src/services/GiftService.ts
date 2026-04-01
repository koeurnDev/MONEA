import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { Currency, PaymentMethod } from "@prisma/client";

export class GiftService {
    /**
     * Fetches paginated gifts with guest details.
     */
    static async getGifts(weddingId: string, options: { limit?: number; offset?: number } = {}) {
        const { limit = 50, offset = 0 } = options;

        const [gifts, total] = await Promise.all([
            prisma.gift.findMany({
                where: { weddingId },
                include: {
                    guest: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            guestCode: true,
                            group: true,
                            source: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset
            }),
            prisma.gift.count({ where: { weddingId } })
        ]);

        const formattedGifts = gifts.map(gift => ({
            ...gift,
            amount: gift.amount.toString(),
            guest: gift.guest ? {
                ...gift.guest,
                phone: gift.guest.phone ? decrypt(gift.guest.phone) : null
            } : null
        }));

        return {
            items: formattedGifts,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        };
    }

    /**
     * Records a new gift, optionally creating or linking a guest.
     */
    static async createGift(weddingId: string, data: {
        amount: number;
        currency: Currency | string;
        method?: string;
        guestId?: string | null;
        guestName?: string;
        source?: string;
    }) {
        // 1. Minimum Data Normalization
        const methodRaw = (data.method || "Cash").trim();
        const methodMap: Record<string, PaymentMethod> = {
            "cash": "Cash", "aba": "ABA", "wing": "Wing", "acleda": "ACLEDA", "khqr": "KHQR", "other": "Other"
        };
        const method = methodMap[methodRaw.toLowerCase()] || (methodRaw.charAt(0).toUpperCase() + methodRaw.slice(1).toLowerCase()) as PaymentMethod;
        const currency = (data.currency || "USD").toUpperCase() as Currency;

        let guestId = data.guestId === "new" || !data.guestId ? null : data.guestId;

        // 2. Resolve/Create Guest (Atomic, Sequential)
        if (!guestId && data.guestName) {
            // First try to find existing
            const existing = await prisma.guest.findFirst({
                where: { weddingId, name: data.guestName },
                select: { id: true }
            });

            if (existing) {
                guestId = existing.id;
            } else {
                // Not found, must create
                const count = await prisma.guest.count({ where: { weddingId } });
                const guestCode = `G${String(count + 1).padStart(3, '0')}`;
                guestId = crypto.randomUUID();
                
                try {
                    await prisma.guest.create({
                        data: {
                            id: guestId,
                            weddingId,
                            name: data.guestName,
                            group: data.source || "None",
                            source: data.source || "GIFT_ENTRY",
                            guestCode,
                            sequenceNumber: count + 1
                        }
                    });
                } catch (error: any) {
                    // Handle race condition if guest was created between findFirst and create
                    if (error.code === 'P2002') {
                         const retryExisting = await prisma.guest.findFirst({
                             where: { weddingId, name: data.guestName },
                             select: { id: true }
                         });
                         if (retryExisting) {
                             guestId = retryExisting.id;
                         } else {
                             // If it's the guestCode that failed, we just retry once with sequence + random
                             const fallbackCode = `G${String(count + 2).padStart(3, '0')}-R`;
                             guestId = crypto.randomUUID();
                             await prisma.guest.create({
                                 data: {
                                     id: guestId,
                                     weddingId,
                                     name: data.guestName,
                                     group: data.source || "None",
                                     source: data.source || "GIFT_ENTRY",
                                     guestCode: fallbackCode,
                                     sequenceNumber: count + 2
                                 }
                             });
                         }
                    } else {
                        throw error;
                    }
                }
            }
        }

        // 3. IDOR Check
        if (guestId) {
             const guest = await prisma.guest.findUnique({ where: { id: guestId } });
             if (!guest || guest.weddingId !== weddingId) throw new Error("Guest access denied");
        }

        // 4. Resolve Gift Sequence (Non-transactional read)
        const giftCount = await prisma.gift.count({ where: { weddingId } });
        const sequenceNumber = giftCount + 1;

        // 5. Atomic Gift Creation (Sequential)
        const gift = await prisma.gift.create({
            data: {
                id: crypto.randomUUID(),
                weddingId,
                guestId,
                amount: data.amount,
                currency: currency,
                method: method,
                sequenceNumber
            },
            include: { guest: true }
        });

        return {
            ...gift,
            amount: gift.amount.toString(),
            guest: gift.guest ? {
                ...gift.guest,
                phone: gift.guest.phone ? decrypt(gift.guest.phone) : null
            } : null
        };
    }
}
