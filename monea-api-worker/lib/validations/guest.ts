import { z } from "zod";

export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
    
  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .nullable(),
    
  group: z
    .string()
    .trim()
    .max(50, "Group name cannot exceed 50 characters")
    .optional()
    .nullable(),
    
  source: z
    .string()
    .trim()
    .max(50, "Source cannot exceed 50 characters")
    .optional()
    .nullable(),
});

// Partial schema for updating guest information
export const guestUpdateSchema = guestSchema.partial().extend({
  id: z.string().trim().min(1, "Guest ID is required"),
});

// TypeScript Types Derived from Schemas
export type CreateGuestInput = z.infer<typeof guestSchema>;
export type UpdateGuestInput = z.infer<typeof guestUpdateSchema>;