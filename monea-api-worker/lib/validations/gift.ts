import { z } from "zod";

export const giftSchema = z.object({
  amount: z.coerce
    .number({ message: "Amount must be a valid number" }) // ប្តូរពី invalid_type_error -> message
    .min(0.01, "Amount must be greater than 0"),
    
  currency: z
    .enum(["USD", "KHR"], { message: "Currency must be USD or KHR" }) // ប្តូរពី errorMap -> message
    .default("USD"),
    
  method: z
    .string()
    .trim()
    .max(50, "Method cannot exceed 50 characters")
    .optional()
    .nullable(),
    
  guestId: z
    .string()
    .trim()
    .optional()
    .nullable(),
    
  guestName: z
    .string()
    .trim()
    .max(100, "Guest name cannot exceed 100 characters")
    .optional()
    .nullable(),
    
  source: z
    .string()
    .trim()
    .max(50, "Source cannot exceed 50 characters")
    .optional()
    .nullable(),
});

export const giftUpdateSchema = giftSchema.partial();

export type CreateGiftInput = z.infer<typeof giftSchema>;
export type UpdateGiftInput = z.infer<typeof giftUpdateSchema>;