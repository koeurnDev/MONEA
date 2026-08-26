import { z } from "zod";

export const weddingSchema = z.object({
  groomName: z.string().min(1, "Groom name is required").max(50),
  brideName: z.string().min(1, "Bride name is required").max(50),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  location: z.string().min(1, "Location is required").max(200),
  eventType: z.enum(["wedding", "birthday", "anniversary", "graduation", "other"]).default("wedding"),
  paymentInfo: z.string().optional(),
  themeSettings: z.any().optional(),
});

export const weddingUpdateSchema = z.object({
  weddingId: z.string().optional(),
  groomName: z.string().max(50).optional(),
  brideName: z.string().max(50).optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format").optional(),
  location: z.string().max(200).optional(),
  eventType: z.enum(["wedding", "birthday", "anniversary", "graduation", "other"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  templateId: z.string().optional(),
  paymentInfo: z.string().optional(),
  themeSettings: z.any().optional(),
  galleryItems: z.array(z.any()).optional(),
  activities: z.array(z.any()).optional(),
});