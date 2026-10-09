import { Hono } from 'hono'
import { imagekitDelete, imagekitGetFilePath } from '@/lib/imagekit-edge'
import { getServerUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ROLES } from '@/lib/constants'

const imagekitRouter = new Hono()

imagekitRouter.get('/auth', async (c) => {
    try {
        const user = await getServerUser(c.req.raw)
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        // Client-signed uploads cannot constrain the destination folder to the authenticated user.
        return c.json({ error: 'Use the authenticated ImageKit upload endpoint.' }, 409)
    } catch (e: any) {
        return c.json({ error: e.message || 'Failed to authenticate ImageKit upload' }, 500)
    }
})

imagekitRouter.post('/upload', async (c) => {
    try {
        const user = await getServerUser(c.req.raw)
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || ""
        if (!privateKey) {
            return c.json({ error: 'ImageKit private key missing' }, 400)
        }

        const formData = await c.req.formData()
        const file = formData.get('file')
        const fileName = (formData.get('fileName') as string) || `monea_${Date.now()}`
        const userId = user.userId || user.id
        if (!userId) {
            return c.json({ error: 'Authenticated user ID is unavailable' }, 401)
        }

        if (!file) {
            return c.json({ error: 'No file provided' }, 400)
        }

        const uploadBody = new FormData()
        uploadBody.append('file', file)
        uploadBody.append('fileName', fileName)
        uploadBody.append('folder', `/users/${encodeURIComponent(userId)}/uploads`)
        uploadBody.append('useUniqueFileName', 'true')

        const authHeader = 'Basic ' + btoa(`${privateKey}:`)
        const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            },
            body: uploadBody
        })

        if (!ikRes.ok) {
            const errText = await ikRes.text()
            return c.json({ error: 'ImageKit upload failed', details: errText }, ikRes.status as any)
        }

        const data = await ikRes.json()
        return c.json({
            success: true,
            provider: 'imagekit',
            fileId: (data as any).fileId,
            url: (data as any).url,
            thumbnailUrl: (data as any).thumbnailUrl,
            width: (data as any).width,
            height: (data as any).height,
            size: (data as any).size
        })
    } catch (e: any) {
        return c.json({ error: e.message || 'Upload failed' }, 500)
    }
})

imagekitRouter.post('/delete', async (c) => {
    try {
        const user = await getServerUser(c.req.raw)
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const { fileId } = await c.req.json()
        if (typeof fileId !== 'string' || !fileId.trim() || fileId.length > 128) {
            return c.json({ error: 'fileId is required' }, 400)
        }

        if (user.role !== ROLES.PLATFORM_OWNER) {
            const userId = user.userId || user.id
            if (!userId) {
                return c.json({ error: 'Authenticated user ID is unavailable' }, 401)
            }

            const filePath = await imagekitGetFilePath(fileId, undefined, c.env)
            if (!filePath) {
                return c.json({ error: 'ImageKit asset not found' }, 404)
            }

            const pathSegments = filePath.split('/').filter(Boolean)
            const belongsToUser = pathSegments[0] === 'users' && pathSegments[1] === userId
            const weddingId = pathSegments[0] === 'users' ? null : pathSegments[0]
            const belongsToWedding = weddingId
                ? await prisma.wedding.findFirst({
                    where: { id: weddingId, userId },
                    select: { id: true },
                })
                : null

            if (!belongsToUser && !belongsToWedding) {
                return c.json({ error: 'ImageKit asset not found' }, 404)
            }
        }

        const success = await imagekitDelete(fileId, undefined, c.env)
        return c.json({ success })
    } catch (e: any) {
        return c.json({ error: e.message || 'Delete failed' }, 500)
    }
})

export default imagekitRouter
