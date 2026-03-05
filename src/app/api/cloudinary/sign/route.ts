export const dynamic = 'force-dynamic';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

export async function POST(request: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { paramsToSign } = body;

    if (!paramsToSign || !paramsToSign.folder) {
        return NextResponse.json({ error: "Folder specification required for security" }, { status: 400 });
    }

    // Security: Folder isolation
    if (user.role !== ROLES.PLATFORM_OWNER) {
        const weddingId = (user as any).weddingId;
        const userId = user.userId;
        const allowedPrefixes = [weddingId, userId].filter(Boolean);

        const isAuthorizedFolder = allowedPrefixes.some(prefix => paramsToSign.folder.startsWith(prefix));
        if (!isAuthorizedFolder) {
            console.warn(`[Security] Unauthorized folder upload attempt: ${paramsToSign.folder} by ${userId}`);
            return NextResponse.json({ error: "Forbidden: Unauthorized folder" }, { status: 403 });
        }
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({ signature });
}
