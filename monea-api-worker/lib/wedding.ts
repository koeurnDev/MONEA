import { z } from "zod";
import { EventType, WeddingStatus } from "@prisma/client";

/**
 * Zod Schema for Creating & Recording Weddings / Events in MONEA
 */
export const weddingSchema = z
  .object({
    groomName: z
      .string()
      .trim()
      .min(2, "សូមបញ្ចូលឈ្មោះកូនកំលោះ")
      .max(100, "ឈ្មោះកូនកំលោះមិនអាចលើសពី ១០០ តួអក្សរឡើយ"),

    brideName: z
      .string()
      .trim()
      .min(2, "សូមបញ្ចូលឈ្មោះកូនក្រមុំ")
      .max(100, "ឈ្មោះកូនក្រមុំមិនអាចលើសពី ១០០ តួអក្សរឡើយ"),

    // Coerces ISO string/Date input safely while rejecting missing dates.
    date: z.preprocess(
      (value) => value === null ? undefined : value,
      z.coerce.date({ message: "សូមជ្រើសរើសកាលបរិច្ឆេទត្រឹមត្រូវ" })
    ),

    location: z
      .string()
      .trim()
      .max(250, "ទីតាំងមិនអាចលើសពី ២៥០ តួអក្សរឡើយ")
      .optional()
      .nullable(),

    // Native Enum validation for Prisma Types
    status: z
      .nativeEnum(WeddingStatus, { message: "ស្ថានភាពអាពាហ៍ពិពាហ៍មិនត្រឹមត្រូវ" })
      .optional()
      .default(WeddingStatus.ACTIVE),

    eventType: z
      .nativeEnum(EventType, { message: "ប្រភេទកម្មវិធីមិនត្រឹមត្រូវ" })
      .optional()
      .default(EventType.wedding),

    templateId: z.string().trim().optional().nullable(),
    paymentInfo: z.string().trim().optional().nullable(),

    // Dynamic Record Object handling
    themeSettings: z.record(z.string(), z.any()).optional().nullable(),

    galleryItems: z
      .array(
        z.object({
          url: z.string().trim().optional().nullable(),
          publicId: z.string().trim().optional().nullable(),
          type: z.string().trim().optional().default("IMAGE"),
          caption: z.string().trim().optional().nullable(),
        })
      )
      .optional()
      .nullable(),

    activities: z
      .array(
        z.object({
          title: z.string().trim().max(200, "ចំណងជើងកម្មវិធីមិនអាចលើសពី ២០០ តួអក្សរ").optional().nullable(),
          time: z.string().trim().max(100, "ម៉ោងមិនអាចលើសពី ១០០ តួអក្សរ").optional().nullable(),
          description: z.string().trim().optional().nullable(),
          icon: z.string().trim().optional().nullable(),
          publicId: z.string().trim().optional().nullable(),
          order: z.coerce.number().int().optional().default(0),
        })
      )
      .optional()
      .nullable(),
  });

/**
 * Partial Schema for Updating Wedding Records
 */
export const weddingUpdateSchema = weddingSchema.partial().extend({
  weddingId: z.string().trim().min(1, "Wedding ID ត្រូវបានតម្រូវ"),
  groomName: z.string().trim().max(100, "ឈ្មោះកូនកំលោះមិនអាចលើសពី ១០០ តួអក្សរឡើយ").optional().nullable(),
  brideName: z.string().trim().max(100, "ឈ្មោះកូនក្រមុំមិនអាចលើសពី ១០០ តួអក្សរឡើយ").optional().nullable(),
  date: z.coerce.date({ message: "ទម្រង់កាលបរិច្ឆេទមិនត្រឹមត្រូវ" }).optional().nullable(),
});

// Derived TypeScript Types
export type CreateWeddingInput = z.infer<typeof weddingSchema>;
export type UpdateWeddingInput = z.infer<typeof weddingUpdateSchema>;