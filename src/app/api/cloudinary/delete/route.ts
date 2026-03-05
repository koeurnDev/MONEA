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

        // SECURITY: IDOR Protection
        // Enforce that users can only delete files within their own wedding folders
        // Platform Owners can delete anything.
        if (user.role !== ROLES.PLATFORM_OWNER) {
            const weddingId = (user as any).weddingId;
            // Public IDs in Cloudinary usually look like "wedding-id/filename"
            if (weddingId && !public_id.startsWith(`${weddingId}/`)) {
                console.warn(`[Security] Unauthorized Cloudinary delete attempt by ${user.userId} for ID: ${public_id}`);
                return NextResponse.json({ error: 'Forbidden: You do not own this file' }, { status: 403 });
            } else if (!weddingId && user.type === "admin") {
                // If they are an admin but not owner, find their wedding
                const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
                if (!wedding || !public_id.startsWith(`${wedding.id}/`)) {
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
