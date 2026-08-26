import { z } from "zod";

/**
 * Zod Schema for Submitting Guestbook Messages in MONEA
 */
export const guestbookSchema = z.object({
  guestName: z
    .string({ message: "សូមបញ្ចូលឈ្មោះរបស់អ្នក" })
    .trim()
    .min(1, "ឈ្មោះមិនអាចទទេបានទេ")
    .max(100, "ឈ្មោះមិនអាចលើសពី ១០០ តួអក្សរឡើយ"),

  message: z
    .string({ message: "សូមបញ្ចូលសារពរជ័យរបស់អ្នក" })
    .trim()
    .min(1, "សារពរជ័យមិនអាចទទេបានទេ")
    .max(1000, "សារពរជ័យមិនអាចលើសពី ១០០០ តួអក្សរឡើយ"),

  weddingId: z
    .string({ message: "Wedding ID ត្រូវបានតម្រូវ" })
    .trim()
    .min(1, "Wedding ID មិនអាចទទេបានទេ"),

  // Anti-spam Honeypot Field (Must be left empty by legitimate users)
  website: z.string().optional(),
});

/**
 * Partial Schema for Updating Guestbook Entries
 */
export const guestbookUpdateSchema = guestbookSchema.partial().extend({
  id: z.string().min(1, "Guestbook entry ID is required"),
});

export type GuestbookInput = z.infer<typeof guestbookSchema>;
export type GuestbookUpdateInput = z.infer<typeof guestbookUpdateSchema>;