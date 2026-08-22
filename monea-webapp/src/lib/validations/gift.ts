import { z } from "zod";

export const giftSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.enum(["USD", "KHR"]),
  method: z.string().optional(),
  guestId: z.string().optional().nullable(),
  guestName: z.string().optional(),
  source: z.string().optional(),
});

export const giftUpdateSchema = giftSchema.partial();
