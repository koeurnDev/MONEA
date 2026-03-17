import { z } from "zod";

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  time: z.string().min(1, "Time is required").max(50),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
});

export const activityUpdateSchema = activitySchema.partial();
