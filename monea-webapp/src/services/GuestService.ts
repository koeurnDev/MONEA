import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { Guest } from "@prisma/client";

export class GuestService {
    /**
     * Fetches paginated guests for a wedding.
     */
    static async getGuests(weddingId: string, options: { limit?: number; offset?: number } = {}) {
        const { limit = 50, offset = 0 } = options;

        const [guests, total] = await Promise.all([
            prisma.guest.findMany({
                where: { weddingId },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    weddingId: true,
                    name: true,
                    group: true,
                    source: true,
                    guestCode: true,
                    sequenceNumber: true,
                    phone: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            prisma.guest.count({ where: { weddingId } })
        ]);

        const decryptedGuests = guests.map(guest => ({
            ...guest,
            phone: guest.phone ? decrypt(guest.phone) : null
        }));

        return {
            items: decryptedGuests,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        };
    }

    /**
     * Creates a new guest with automatic code generation.
     */
    static async createGuest(weddingId: string, data: { name: string; group?: string; source?: string; phone?: string }) {
        return await prisma.$transaction(async (tx) => {
            const count = await tx.guest.count({ where: { weddingId } });
            const guestCode = `G${String(count + 1).padStart(3, '0')}`;
            const sequenceNumber = count + 1;

            const encryptedPhone = data.phone ? encrypt(data.phone) : null;

            const guest = await tx.guest.create({
                data: {
                    id: crypto.randomUUID(),
                    weddingId,
                    name: data.name,
                    group: data.group || data.source || "None",
                    source: data.source || "GIFT_ENTRY",
                    guestCode,
                    sequenceNumber,
                    phone: encryptedPhone
                }
            });

            if (guest.phone) guest.phone = decrypt(guest.phone);
            return guest;
        });
    }

    static async updateGuest(id: string, weddingId: string, data: Partial<Omit<Guest, "id" | "weddingId" | "createdAt" | "updatedAt">>) {
        const existing = await prisma.guest.findUnique({ where: { id } });
        
        if (!existing || existing.weddingId !== weddingId) {
            throw new Error("Guest not found or access denied");
        }

        const updateData: any = { ...data };
        if (updateData.phone) updateData.phone = encrypt(updateData.phone);
        if (updateData.guestCode) delete updateData.guestCode; // Prevent manual code override
        if (updateData.sequenceNumber) delete updateData.sequenceNumber;

        const guest = await prisma.guest.update({
            where: { id },
            data: updateData
        });

        if (guest.phone) guest.phone = decrypt(guest.phone);
        return guest;
    }

    static async deleteGuest(id: string, weddingId: string) {
        const existing = await prisma.guest.findUnique({ where: { id } });
        if (!existing || existing.weddingId !== weddingId) {
            throw new Error("Guest not found or access denied");
        }

        return await prisma.guest.delete({ where: { id } });
    }
}
