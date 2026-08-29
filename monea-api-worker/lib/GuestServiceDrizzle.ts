import { getDb } from "./drizzle"
import { guests } from "@/drizzle/schema"
import { eq, desc, sql, count } from "drizzle-orm"
import { encrypt, decrypt } from "./encryption"
import { generateId } from "./drizzle-helpers"

export class GuestServiceDrizzle {
  /**
   * Fetches paginated guests for a specific wedding with optimized phone handling.
   */
  static async getGuests(weddingId: string, env: any, options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options;
    const db = getDb(env);

    console.log(`[GuestService] Starting fetch for wedding ${weddingId}`);
    
    try {
      // Fetch guests - phone will be filtered on client side for security
      const guestsData = await db
        .select()
        .from(guests)
        .where(eq(guests.weddingId, weddingId))
        .orderBy(desc(guests.createdAt))
        .limit(limit)
        .offset(offset);
      
      console.log(`[GuestService] Fetched ${guestsData.length} guests from DB`);
      
      // Mark phone as [ENCRYPTED] for security (client-side doesn't need actual values)
      const sanitizedGuests = guestsData.map(guest => ({
        ...guest,
        phone: guest.phone ? '[ENCRYPTED]' : null
      }));
      
      console.log(`[GuestService] Sanitized guest data`);

      // Get total count
      const totalResult = await db
        .select({ count: count(guests.id) })
        .from(guests)
        .where(eq(guests.weddingId, weddingId));

      const total = totalResult[0]?.count || 0;
      console.log(`[GuestService] Total count: ${total}`);

      return {
        items: sanitizedGuests,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error: any) {
      console.error(`[GuestService] ERROR:`, error);
      console.error(`[GuestService] Error message:`, error?.message);
      console.error(`[GuestService] Error stack:`, error?.stack);
      throw error;
    }
  }

  /**
   * Creates a new guest with safe code generation and race-condition fallback.
   */
  static async createGuest(
    weddingId: string,
    env: any,
    data: { name: string; group?: string; source?: string; phone?: string | null }
  ) {
    const db = getDb(env);
    
    const cleanName = data.name.trim();
    const cleanPhone = data.phone ? data.phone.trim() : null;
    const encryptedPhone = cleanPhone ? await encrypt(cleanPhone) : null;

    // Get current count
    const countResult = await db
      .select({ count: count(guests.id) })
      .from(guests)
      .where(eq(guests.weddingId, weddingId));
    
    const guestCount = countResult[0]?.count || 0;
    const guestCode = `G${String(guestCount + 1).padStart(3, "0")}`;
    const sequenceNumber = guestCount + 1;
    const guestId = generateId();

    try {
      const newGuest = await db.insert(guests).values({
        id: guestId,
        weddingId,
        name: cleanName,
        group: data.group?.trim() || data.source?.trim() || "None",
        source: data.source?.trim() || "GIFT_ENTRY",
        guestCode,
        sequenceNumber,
        phone: encryptedPhone,
      }).returning();

      const guest = newGuest[0];
      
      // Decrypt phone for response
      if (guest.phone) {
        return { ...guest, phone: await decrypt(guest.phone) };
      }
      return guest;
    } catch (error: any) {
      // Handle unique constraint race condition for guestCode
      if (error.message?.includes('unique') || error.code === '23505') {
        const fallbackCode = `G${String(guestCount + 2).padStart(3, "0")}-R`;
        const newGuest = await db.insert(guests).values({
          id: generateId(),
          weddingId,
          name: cleanName,
          group: data.group?.trim() || data.source?.trim() || "None",
          source: data.source?.trim() || "GIFT_ENTRY",
          guestCode: fallbackCode,
          sequenceNumber: guestCount + 2,
          phone: encryptedPhone,
        }).returning();

        const guest = newGuest[0];
        if (guest.phone) {
          return { ...guest, phone: await decrypt(guest.phone) };
        }
        return guest;
      }
      throw error;
    }
  }

  /**
   * Updates existing guest details securely with IDOR Protection.
   */
  static async updateGuest(
    id: string,
    weddingId: string,
    env: any,
    data: Partial<{
      name: string;
      group: string;
      source: string;
      phone: string | null;
      rsvpStatus: string;
      adultsCount: number;
      childrenCount: number;
      rsvpNotes: string | null;
      hasArrived: boolean;
      views: number;
    }>
  ) {
    const db = getDb(env);
    
    // Check if guest exists and belongs to this wedding
    const existing = await db
      .select()
      .from(guests)
      .where(eq(guests.id, id))
      .limit(1)
      .then(r => r[0]);

    if (!existing || existing.weddingId !== weddingId) {
      throw new Error("Guest not found or access denied");
    }

    const updateData: any = { ...data };

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

    const updatedGuest = await db
      .update(guests)
      .set(updateData)
      .where(eq(guests.id, id))
      .returning();

    const guest = updatedGuest[0];
    
    // Decrypt phone for response
    if (guest.phone) {
      return { ...guest, phone: await decrypt(guest.phone) };
    }
    return guest;
  }

  /**
   * Deletes a guest record with IDOR protection.
   */
  static async deleteGuest(id: string, weddingId: string, env: any) {
    const db = getDb(env);
    
    // Check if guest exists and belongs to this wedding
    const existing = await db
      .select()
      .from(guests)
      .where(eq(guests.id, id))
      .limit(1)
      .then(r => r[0]);
      
    if (!existing || existing.weddingId !== weddingId) {
      throw new Error("Guest not found or access denied");
    }

    const deletedGuest = await db
      .delete(guests)
      .where(eq(guests.id, id))
      .returning();

    return deletedGuest[0];
  }
}
