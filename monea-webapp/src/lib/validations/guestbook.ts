import { z } from "zod";

export const guestbookSchema = z.object({
  guestName: z.string().min(1, "Name is required").max(50),
  message: z.string().min(1, "Message is required").max(500),
  weddingId: z.string().min(1, "Wedding ID is required"),
  website: z.string().optional(), // Honeypot field
});
