import { z } from "zod";

export const activitySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
    
  time: z
    .string()
    .trim()
    .min(1, "Time is required")
    .max(50, "Time cannot exceed 50 characters"),
    
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
    
  icon: z
    .string()
    .trim()
    .optional()
    .nullable(),
    
  order: z.coerce
    .number()
    .int("Order must be an integer")
    .optional()
    .default(0),
});

// Partial schema for update operations
export const activityUpdateSchema = activitySchema.partial();

// TypeScript Types Derived from Schemas
export type CreateActivityInput = z.infer<typeof activitySchema>;
export type UpdateActivityInput = z.infer<typeof activityUpdateSchema>;