'use server'

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';
import { redirect } from "next/navigation";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData) {
    const file = formData.get("file") as File;
    const weddingId = formData.get("weddingId") as string;
    const caption = formData.get("caption") as string;

    if (!file || !weddingId) {
        throw new Error("Missing file or weddingId");
    }

    // Validation: File Type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        throw new Error("Invalid file type. Only images and videos are allowed.");
    }

    // Validation: File Size (e.g., 10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw new Error("File too large. Maximum size is 10MB.");
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary via Stream
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "wedding_uploads",
                    resource_type: "auto", // Auto-detect image or video
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // Create DB record
        await prisma.galleryItem.create({
            data: {
                url: result.secure_url,
                type: result.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
                caption: caption,
                weddingId: weddingId
            }
        });

    } catch (error) {
        console.error("Upload error:", error);
        throw new Error("Upload failed");
    }

    redirect(`/w/${weddingId}/gallery`);
}


export async function submitGuestbookEntry(formData: FormData) {
    const weddingId = formData.get("weddingId") as string;
    const guestName = formData.get("guestName") as string;
    const message = formData.get("message") as string;
    const honeypot = formData.get("website_url") as string;

    // Honeypot check: If this hidden field is filled, it's a bot
    if (honeypot) {
        console.warn(`[Security] Honeypot trigger! Bot detected via Guestbook. Wedding: ${weddingId}`);
        return; // Silently ignore bot submission
    }

    if (!weddingId || !guestName || !message) {
        throw new Error("Missing fields");
    }

    // Validation
    if (guestName.length > 50) throw new Error("Name too long");
    if (message.length > 500) throw new Error("Message too long");

    await prisma.guestbookEntry.create({
        data: {
            weddingId,
            guestName,
            message,
        }
    });

    redirect(`/w/${weddingId}/guestbook`);
}
