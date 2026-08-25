import { z } from "zod";
import { EventType, WeddingStatus } from "@prisma/client";

export const weddingSchema = z.object({
  groomName: z.string().max(100).optional().nullable(),
  brideName: z.string().max(100).optional().nullable(),
  date: z.any().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  status: z.nativeEnum(WeddingStatus).optional().default("ACTIVE"),
  eventType: z.nativeEnum(EventType).optional().default("wedding"),
  templateId: z.string().optional().nullable(),
  paymentInfo: z.string().optional().nullable(),
  themeSettings: z.record(z.string(), z.any()).optional().nullable(),
  galleryItems: z.array(z.object({
    url: z.string().optional().nullable(),
    publicId: z.string().optional().nullable(),
    type: z.string().optional().default("IMAGE"),
    caption: z.string().optional().nullable(),
  })).optional().nullable(),
  activities: z.array(z.object({
    title: z.string().max(200).optional().nullable(),
    time: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    publicId: z.string().optional().nullable(),
    order: z.number().int().optional().default(0),
  })).optional().nullable(),
});

export const weddingUpdateSchema = weddingSchema.partial().extend({
  weddingId: z.string().optional().nullable()
});

