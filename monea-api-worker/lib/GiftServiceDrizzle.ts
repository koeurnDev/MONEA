import { getDb } from "@/lib/drizzle";
import { gifts, guests, weddings } from "@/drizzle/schema";
import { decrypt } from "@/lib/encryption";
import { eq, desc, and } from "drizzle-orm";
type Env = any;

type Currency = "USD" | "KHR";
type PaymentMethod = "Cash" | "ABA" | "Wing" | "ACLEDA" | "KHQR" | "Other";

export class GiftServiceDrizzle {
    /**
     * Fetches paginated gifts with guest details using Drizzle ORM.
     */
    static async getGifts(
        env: Env,
        weddingId: string,
        options: { limit?: number; offset?: number } = {}
    ) {
        const { limit = 50, offset = 0 } = options;
        const db = getDb(env);

        // Fetch gifts with guest join
        const giftsWithGuests = await db
            .select({
                id: gifts.id,
                amount: gifts.amount,
                currency: gifts.currency,
                method: gifts.method,
                weddingId: gifts.weddingId,
                guestId: gifts.guestId,
                sequenceNumber: gifts.sequenceNumber,
                createdAt: gifts.createdAt,
                updatedAt: gifts.updatedAt,
                guest: {
                    id: guests.id,
                    name: guests.name,
                    phone: guests.phone,
                    guestCode: guests.guestCode,
                    group: guests.group,
                    source: guests.source,
                }
            })
            .from(gifts)
            .leftJoin(guests, eq(gifts.guestId, guests.id))
            .where(eq(gifts.weddingId, weddingId))
            .orderBy(desc(gifts.createdAt))
            .limit(limit)
            .offset(offset);

        // Count total gifts
        const totalResult = await db
            .select({ count: gifts.id })
            .from(gifts)
            .where(eq(gifts.weddingId, weddingId));

        const total = totalResult.length;

        // Format gifts with decrypted phone
        const formattedGifts = giftsWithGuests.map(gift => ({
            id: gift.id,
            amount: gift.amount,
            currency: gift.currency,
            method: gift.method,
            weddingId: gift.weddingId,
            guestId: gift.guestId,
            sequenceNumber: gift.sequenceNumber,
            createdAt: gift.createdAt,
            updatedAt: gift.updatedAt,
            guest: gift.guest?.id ? {
                id: gift.guest.id,
                name: gift.guest.name,
                phone: gift.guest.phone ? decrypt(gift.guest.phone) : null,
                guestCode: gift.guest.guestCode,
                group: gift.guest.group,
                source: gift.guest.source,
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
    static async createGift(
        env: Env,
        weddingId: string,
        data: {
            amount: number;
            currency: string;
            method?: string;
            guestId?: string | null;
            guestName?: string;
            source?: string;
        }
    ) {
        const db = getDb(env);

        // 1. Normalize method and currency
        const methodRaw = (data.method || "Cash").trim();
        const methodMap: Record<string, PaymentMethod> = {
            "cash": "Cash", "aba": "ABA", "wing": "Wing", "acleda": "ACLEDA", "khqr": "KHQR", "other": "Other"
        };
        const method = methodMap[methodRaw.toLowerCase()] || 
            (methodRaw.charAt(0).toUpperCase() + methodRaw.slice(1).toLowerCase()) as PaymentMethod;
        const currency = (data.currency || "USD").toUpperCase() as Currency;

        let guestId = data.guestId === "new" || !data.guestId ? null : data.guestId;

        // 2. Resolve/Create Guest (Atomic, Sequential)
        if (!guestId && data.guestName) {
            // First try to find existing
            const existingGuests = await db
                .select({ id: guests.id })
                .from(guests)
                .where(and(
                    eq(guests.weddingId, weddingId),
                    eq(guests.name, data.guestName)
                ))
                .limit(1);

            if (existingGuests.length > 0) {
                guestId = existingGuests[0].id;
            } else {
                // Not found, must create
                const countResult = await db
                    .select({ count: guests.id })
                    .from(guests)
                    .where(eq(guests.weddingId, weddingId));
                
                const count = countResult.length;
                const guestCode = `G${String(count + 1).padStart(3, '0')}`;
                const newGuestId = globalThis.crypto.randomUUID();
                
                try {
                    await db.insert(guests).values({
                        id: newGuestId,
                        weddingId,
                        name: data.guestName,
                        group: data.source || "None",
                        source: data.source || "GIFT_ENTRY",
                        guestCode,
                        sequenceNumber: count + 1,
                    });
                    guestId = newGuestId;
                } catch (error: any) {
                    // Handle race condition if guest was created between findFirst and create
                    console.warn("[GiftService] Race condition detected, retrying guest lookup");
                    const retryExisting = await db
                        .select({ id: guests.id })
                        .from(guests)
                        .where(and(
                            eq(guests.weddingId, weddingId),
                            eq(guests.name, data.guestName)
                        ))
                        .limit(1);
                    
                    if (retryExisting.length > 0) {
                        guestId = retryExisting[0].id;
                    } else {
                        // Fallback with random suffix
                        const fallbackCode = `G${String(count + 2).padStart(3, '0')}-R`;
                        const fallbackGuestId = globalThis.crypto.randomUUID();
                        await db.insert(guests).values({
                            id: fallbackGuestId,
                            weddingId,
                            name: data.guestName,
                            group: data.source || "None",
                            source: data.source || "GIFT_ENTRY",
                            guestCode: fallbackCode,
                            sequenceNumber: count + 2,
                        });
                        guestId = fallbackGuestId;
                    }
                }
            }
        }

        // 3. IDOR Check
        if (guestId) {
            const guestCheck = await db
                .select({ weddingId: guests.weddingId })
                .from(guests)
                .where(eq(guests.id, guestId))
                .limit(1);
            
            if (guestCheck.length === 0 || guestCheck[0].weddingId !== weddingId) {
                throw new Error("Guest access denied");
            }
        }

        // 4. Resolve Gift Sequence
        const giftCountResult = await db
            .select({ count: gifts.id })
            .from(gifts)
            .where(eq(gifts.weddingId, weddingId));
        
        const sequenceNumber = giftCountResult.length + 1;

        // 5. Atomic Gift Creation
        const newGiftId = globalThis.crypto.randomUUID();
        const [newGift] = await db.insert(gifts).values({
            id: newGiftId,
            weddingId,
            guestId,
            amount: data.amount.toString(),
            currency,
            method,
            sequenceNumber
        }).returning();

        // 6. Fetch guest details if exists
        let guestDetails = null;
        if (guestId) {
            const guestResult = await db
                .select()
                .from(guests)
                .where(eq(guests.id, guestId))
                .limit(1);
            
            if (guestResult.length > 0) {
                const g = guestResult[0];
                guestDetails = {
                    id: g.id,
                    name: g.name,
                    phone: g.phone ? decrypt(g.phone) : null,
                    email: g.email,
                    guestCode: g.guestCode,
                    group: g.group,
                    source: g.source,
                };
            }
        }

        return {
            ...newGift,
            amount: newGift.amount,
            guest: guestDetails
        };
    }
}
