export const dynamic = 'force-dynamic';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const body = await request.json();
    const { paramsToSign } = body;

    // Fallback: If no folder is provided, use weddingId or userId from session
    if (paramsToSign && !paramsToSign.folder) {
        const sessionWeddingId = (user as any).weddingId;
        const userId = user.userId;
        paramsToSign.folder = sessionWeddingId || userId;
    }

    if (!paramsToSign || !paramsToSign.folder) {
        return NextResponse.json({ error: "Folder specification required for security" }, { status: 400 });
    }

    // Security: Folder isolation
    if (user.role !== ROLES.PLATFORM_OWNER) {
        const userId = user.userId;
        const sessionWeddingId = (user as any).weddingId;
        const requestedFolder = paramsToSign.folder;
        
        let isAuthorized = false;
        
        // 1. Allow if folder is user's own ID (personal uploads)
        if (requestedFolder.startsWith(userId)) {
            isAuthorized = true;
        } 
        // 2. Allow if folder matches staff's assigned wedding
        else if (sessionWeddingId && requestedFolder.startsWith(sessionWeddingId)) {
            isAuthorized = true;
        }
        // 3. For Admins/Owners: Verify wedding ownership if folder is a wedding ID
        else {
            // Assume the top-level folder name is the wedding ID
            const folderWeddingId = requestedFolder.split('/')[0];
            const wedding = await prisma.wedding.findFirst({
                where: {
                    id: folderWeddingId,
                    userId: userId
                }
            });
            if (wedding) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            console.warn(`[Security] Unauthorized folder upload attempt: ${requestedFolder} by ${userId}`);
            return NextResponse.json({ error: "Forbidden: Unauthorized folder" }, { status: 403 });
        }
    }

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({ signature });
}
