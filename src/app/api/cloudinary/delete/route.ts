export const dynamic = 'force-dynamic';

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { public_id, resource_type = 'image' } = await request.json();

        if (!public_id) {
            return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
        }

        // 1. Path Traversal & Format Validation
        const isSafeId = /^[a-zA-Z0-9_\-/]+$/.test(public_id) && !public_id.includes("..");
        if (!isSafeId) {
            console.error(`[Security] Malicious public_id detected: ${public_id}`);
            return NextResponse.json({ error: 'Invalid public_id format' }, { status: 400 });
        }

        // 2. Platform Owner bypass
        if (user.role !== ROLES.PLATFORM_OWNER) {
            // 3. Database Ownership Check (Trust the DB, not just the prefix)
            const file = await prisma.galleryItem.findFirst({
                where: { publicId: public_id }
            });

            const weddingId = user.weddingId || (await prisma.wedding.findFirst({ where: { userId: user.id } }))?.id;

            if (!file) {
                // If not in galleryItem, check if it starts with wedding folder (legacy)
                if (!weddingId || !public_id.startsWith(`${weddingId}/`)) {
                    console.warn(`[Security] Unauthorized Cloudinary delete attempt by ${user.id} for ID: ${public_id}`);
                    return NextResponse.json({ error: 'Forbidden: You do not own this file' }, { status: 403 });
                }
            } else {
                // Verify wedding ownership
                if (file.weddingId !== weddingId) {
                    console.warn(`[Security] BOLA/IDOR attempt: User ${user.id} tried deleting file ${public_id} owned by wedding ${file.weddingId}`);
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            }
        }

        const result = await cloudinary.uploader.destroy(public_id, { resource_type });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
