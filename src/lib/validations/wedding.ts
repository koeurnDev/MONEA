import { z } from "zod";
import { EventType, WeddingStatus } from "@prisma/client";

export const weddingSchema = z.object({
  groomName: z.string().min(1, "Groom name is required").max(100),
  brideName: z.string().min(1, "Bride name is required").max(100),
  date: z.coerce.date(),
  location: z.string().max(200).optional().nullable(),
  status: z.nativeEnum(WeddingStatus).optional().default("ACTIVE"),
  eventType: z.nativeEnum(EventType).optional().default("wedding"),
  templateId: z.string().optional(),
  paymentInfo: z.string().optional().nullable(),
  themeSettings: z.record(z.string(), z.any()).optional(),
  galleryItems: z.array(z.object({
    url: z.string().url().or(z.literal("")).optional().nullable(),
    type: z.string().optional().default("IMAGE"),
    caption: z.string().optional().nullable(),
  })).optional(),
  activities: z.array(z.object({
    title: z.string().min(1).max(100),
    time: z.string().min(1).max(50),
    description: z.string().optional().nullable(),
    order: z.number().int().optional().default(0),
  })).optional(),
});

export const weddingUpdateSchema = weddingSchema.partial().extend({
  weddingId: z.string().optional()
});
