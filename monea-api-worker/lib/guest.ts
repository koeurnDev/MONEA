import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

// Partial applies only to guestSchema; id remains strictly required
export const guestUpdateSchema = guestSchema.partial().extend({
  id: z.string().min(1, "Guest ID is required"),
});

export type Guest = z.infer<typeof guestSchema>;
export type GuestUpdate = z.infer<typeof guestUpdateSchema>;