import { z } from "zod";

export const guestbookSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),

  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(500, "Message cannot exceed 500 characters"),

  weddingId: z
    .string()
    .trim()
    .min(1, "Wedding ID is required"),

  // Honeypot field for bot protection (should be left empty by real users)
  website: z
    .string()
    .optional()
    .nullable(),
});

// TypeScript Type Derived from Schema
export type CreateGuestbookInput = z.infer<typeof guestbookSchema>;