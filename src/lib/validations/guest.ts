import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

export const guestUpdateSchema = guestSchema.partial().extend({
  id: z.string().min(1, "Guest ID is required"),
});
