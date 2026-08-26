import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { Guest } from "@prisma/client";

export class GuestService {
  /**
   * Fetches paginated guests for a specific wedding with decrypted phone numbers.
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
          updatedAt: true,
        },
      }),
      prisma.guest.count({ where: { weddingId } }),
    ]);

    // Async decryption for all phone numbers
    const decryptedGuests = await Promise.all(
      guests.map(async (guest) => ({
        ...guest,
        phone: guest.phone ? await decrypt(guest.phone) : null,
      }))
    );

    return {
      items: decryptedGuests,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Creates a new guest with safe code generation and race-condition fallback.
   */
  static async createGuest(
    weddingId: string,
    data: { name: string; group?: string; source?: string; phone?: string | null }
  ) {
    const cleanName = data.name.trim();
    const cleanPhone = data.phone ? data.phone.trim() : null;
    const encryptedPhone = cleanPhone ? await encrypt(cleanPhone) : null;

    return await prisma.$transaction(async (tx) => {
      const count = await tx.guest.count({ where: { weddingId } });
      const guestCode = `G${String(count + 1).padStart(3, "0")}`;
      const sequenceNumber = count + 1;
      const guestId = globalThis.crypto.randomUUID();

      try {
        const guest = await tx.guest.create({
          data: {
            id: guestId,
            weddingId,
            name: cleanName,
            group: data.group?.trim() || data.source?.trim() || "None",
            source: data.source?.trim() || "GIFT_ENTRY",
            guestCode,
            sequenceNumber,
            phone: encryptedPhone,
          },
        });

        if (guest.phone) guest.phone = await decrypt(guest.phone);
        return guest;
      } catch (error: any) {
        // Handle P2002 Unique Constraint Race Condition for guestCode
        if (error.code === "P2002") {
          const fallbackCode = `G${String(count + 2).padStart(3, "0")}-R`;
          const guest = await tx.guest.create({
            data: {
              id: globalThis.crypto.randomUUID(),
              weddingId,
              name: cleanName,
              group: data.group?.trim() || data.source?.trim() || "None",
              source: data.source?.trim() || "GIFT_ENTRY",
              guestCode: fallbackCode,
              sequenceNumber: count + 2,
              phone: encryptedPhone,
            },
          });

          if (guest.phone) guest.phone = await decrypt(guest.phone);
          return guest;
        }
        throw error;
      }
    });
  }

  /**
   * Updates existing guest details securely with IDOR Protection.
   */
  static async updateGuest(
    id: string,
    weddingId: string,
    data: Partial<Omit<Guest, "id" | "weddingId" | "createdAt" | "updatedAt">>
  ) {
    const existing = await prisma.guest.findUnique({ where: { id } });

    if (!existing || existing.weddingId !== weddingId) {
      throw new Error("Guest not found or access denied");
    }

    const updateData: Record<string, any> = { ...data };

    // Prevent overriding system sequence numbers
    delete updateData.guestCode;
    delete updateData.sequenceNumber;

    if (updateData.name && typeof updateData.name === "string") {
      updateData.name = updateData.name.trim();
    }

    // Safely handle phone number updating/clearing
    if (typeof updateData.phone !== "undefined") {
      if (updateData.phone && typeof updateData.phone === "string" && updateData.phone.trim().length > 0) {
        updateData.phone = await encrypt(updateData.phone.trim());
      } else {
        updateData.phone = null;
      }
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: updateData,
    });

    if (guest.phone) guest.phone = await decrypt(guest.phone);
    return guest;
  }

  /**
   * Deletes a guest record with IDOR protection.
   */
  static async deleteGuest(id: string, weddingId: string) {
    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing || existing.weddingId !== weddingId) {
      throw new Error("Guest not found or access denied");
    }

    return await prisma.guest.delete({ where: { id } });
  }
}