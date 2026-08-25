import { Hono } from 'hono'
import { getServerUser } from '@/lib/auth'
import { ROLES } from '@/lib/constants'
import { prisma, queryRaw } from '@/lib/prisma'
import { cloudinarySign, cloudinaryDelete } from '@/lib/cloudinary-edge'
import { standardLimiter, getIP } from "@/lib/ratelimit"

const cloudinaryRouter = new Hono()

cloudinaryRouter.post('/sign', async (c) => {
    const ip = getIP(c.req.raw as any);
    const { success } = await standardLimiter.limit(ip);
    if (!success) {
        return c.json({ error: "Too many upload requests. Please wait." }, 429);
    }

    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }
    const { paramsToSign } = body;

    if (paramsToSign && !paramsToSign.folder) {
        paramsToSign.folder = (user as any).weddingId || user.userId;
    }

    if (!paramsToSign?.folder) {
        return c.json({ error: "Folder specification required for security" }, 400);
    }

    // IDOR check — non-owners can only sign for their own folder
    if (user.role !== ROLES.PLATFORM_OWNER) {
        const userId          = user.userId;
        const sessionWeddingId = (user as any).weddingId;
        const requestedFolder  = paramsToSign.folder;

        let isAuthorized = requestedFolder.startsWith(userId)
            || (sessionWeddingId && requestedFolder.startsWith(sessionWeddingId));

        if (!isAuthorized) {
            const folderWeddingId = requestedFolder.split('/')[0];
            const wedding = await prisma.wedding.findFirst({
                where: { id: folderWeddingId, userId },
            });
            isAuthorized = !!wedding;
        }

        if (!isAuthorized) {
            console.warn(`[Security] Unauthorized folder upload: ${requestedFolder} by ${userId}`);
            return c.json({ error: "Forbidden: Unauthorized folder" }, 403);
        }
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const signature = await cloudinarySign(paramsToSign, apiSecret);
    return c.json({ signature });
});

cloudinaryRouter.post('/delete', async (c) => {
    const ip = getIP(c.req.raw as any);
    const { success } = await standardLimiter.limit(ip);
    if (!success) {
        return c.json({ error: "Too many delete requests. Please wait." }, 429);
    }

    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    try {
        const { public_id, resource_type = 'image' } = await c.req.json();

        if (!public_id) return c.json({ error: 'Public ID is required' }, 400);

        const isSafeId = /^[a-zA-Z0-9_\-/]+$/.test(public_id) && !public_id.includes("..");
        if (!isSafeId) {
            console.error(`[Security] Malicious public_id: ${public_id}`);
            return c.json({ error: 'Invalid public_id format' }, 400);
        }

        // Ownership check for non-owners
        if (user.role !== ROLES.PLATFORM_OWNER) {
            const files = await queryRaw('SELECT "weddingId" FROM "GalleryItem" WHERE "publicId" = $1 LIMIT 1', public_id);
            const file  = files[0];

            let weddingId = (user as any).weddingId;
            if (!weddingId) {
                const rows = await queryRaw('SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1', user.userId);
                weddingId  = rows[0]?.id;
            }

            if (!file) {
                if (!weddingId || !public_id.startsWith(`${weddingId}/`)) {
                    console.warn(`[Security] Unauthorized Cloudinary delete: ${user.userId} → ${public_id}`);
                    return c.json({ error: 'Forbidden: You do not own this file' }, 403);
                }
            } else if (file.weddingId !== weddingId) {
                console.warn(`[Security] IDOR: ${user.userId} tried deleting ${public_id} owned by ${file.weddingId}`);
                return c.json({ error: 'Forbidden' }, 403);
            }
        }

        const result = await cloudinaryDelete(public_id, resource_type);
        return c.json({ success: true, result });
    } catch (error) {
        console.error('[cloudinary/delete]', error);
        return c.json({ error: 'Failed to delete image' }, 500);
    }
});

export default cloudinaryRouter;
