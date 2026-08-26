import { z } from "zod";

/**
 * Zod Schema for Creating & Recording Gifts/Donations in MONEA
 */
export const giftSchema = z
  .object({
    amount: z.coerce
      .number({ message: "ចំនួនទឹកប្រាក់ត្រូវតែបញ្ចូល" })
      .positive("ចំនួនទឹកប្រាក់ត្រូវតែជាលេខវិជ្ជមាន (ធំជាង ០)"),
    
    currency: z.enum(["USD", "KHR"], {
      message: "សូមជ្រើសរើសរូបិយប័ណ្ណ (USD ឬ KHR)",
    }),

    method: z
      .string()
      .trim()
      .max(50, "វិធីសាស្ត្រទូទាត់មិនអាចលើសពី ៥០ តួអក្សរ")
      .optional()
      .default("CASH"),

    guestId: z
      .string()
      .trim()
      .nullable()
      .optional(),

    guestName: z
      .string()
      .trim()
      .max(100, "ឈ្មោះភ្ញៀវមិនអាចលើសពី ១០០ តួអក្សរ")
      .optional(),

    notes: z
      .string()
      .trim()
      .max(255, "ចំណាំមិនអាចលើសពី ២៥៥ តួអក្សរ")
      .optional()
      .nullable(),

    source: z
      .string()
      .trim()
      .max(50)
      .optional()
      .default("MANUAL_ENTRY"),
  })
  .refine(
    (data) => data.guestId || (data.guestName && data.guestName.length > 0),
    {
      message: "ត្រូវមាន Guest ID ឬ ឈ្មោះភ្ញៀវយ៉ាងតិចមួយ",
      path: ["guestName"],
    }
  );

/**
 * Partial Schema for Updating Gifts
 */
export const giftUpdateSchema = giftSchema.partial();

export type GiftInput = z.infer<typeof giftSchema>;
export type GiftUpdateInput = z.infer<typeof giftUpdateSchema>;