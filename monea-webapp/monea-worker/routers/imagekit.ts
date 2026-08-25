import { Hono } from 'hono'
import { imagekitAuthSign, imagekitDelete } from '@/lib/imagekit-edge'
import { getServerUser } from '@/lib/auth'

const imagekitRouter = new Hono()

imagekitRouter.get('/auth', async (c) => {
    try {
        const user = await getServerUser(c.req.raw)
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.VITE_IMAGEKIT_PUBLIC_KEY || ""
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || ""
        const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.VITE_IMAGEKIT_URL_ENDPOINT || ""

        if (!privateKey || !publicKey) {
            return c.json({ error: 'ImageKit credentials not configured' }, 400)
        }

        const token = crypto.randomUUID()
        const expire = Math.floor(Date.now() / 1000) + 1800 // 30 minutes

        const signature = await imagekitAuthSign(token, expire, privateKey)

        return c.json({
            token,
            expire,
            signature,
            publicKey,
            urlEndpoint
        })
    } catch (e: any) {
        return c.json({ error: e.message || 'Failed to generate ImageKit auth' }, 500)
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
        const folder = (formData.get('folder') as string) || '/monea_uploads'

        if (!file) {
            return c.json({ error: 'No file provided' }, 400)
        }

        const uploadBody = new FormData()
        uploadBody.append('file', file)
        uploadBody.append('fileName', fileName)
        uploadBody.append('folder', folder)
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
        if (!fileId) {
            return c.json({ error: 'fileId is required' }, 400)
        }

        const success = await imagekitDelete(fileId)
        return c.json({ success })
    } catch (e: any) {
        return c.json({ error: e.message || 'Delete failed' }, 500)
    }
})

export default imagekitRouter
