/**
 * MONEA Multi-CDN Unified Storage Engine
 * Automatically routes and load-balances media uploads between Cloudinary & ImageKit.io.
 * Provides zero-downtime auto-failover and high-availability asset delivery.
 */

export interface UnifiedUploadResult {
    success: boolean;
    url: string;
    publicId: string;
    provider: 'cloudinary' | 'imagekit';
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    size?: number;
    error?: string;
}

export interface UploadMediaOptions {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    preferredProvider?: 'cloudinary' | 'imagekit' | 'auto';
    onProgress?: (percent: number) => void;
}

/**
 * Upload to Cloudinary with Edge HMAC signature
 */
async function uploadToCloudinaryInternal(
    file: File, 
    folder: string = "monea_gallery",
    resourceType: string = "image"
): Promise<UnifiedUploadResult> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signRes = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            paramsToSign: { timestamp, folder }
        })
    });

    if (!signRes.ok) {
        throw new Error('Cloudinary signature failed');
    }

    const { signature } = await signRes.json();
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dilx4i5s4";
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || "678179776217443";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!uploadRes.ok) {
        throw new Error('Cloudinary upload request failed');
    }

    const data = await uploadRes.json();
    return {
        success: true,
        url: data.secure_url || data.url,
        publicId: data.public_id,
        provider: 'cloudinary',
        width: data.width,
        height: data.height,
        size: data.bytes
    };
}

/**
 * Upload to ImageKit.io (Backup / Secondary High-Speed CDN)
 */
async function uploadToImageKitInternal(
    file: File,
    folder: string = "/monea_gallery"
): Promise<UnifiedUploadResult> {
    const authRes = await fetch('/api/imagekit/auth');
    if (!authRes.ok) {
        // Fallback to server-side upload endpoint
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name || `monea_${Date.now()}`);
        formData.append("folder", folder);

        const serverRes = await fetch('/api/imagekit/upload', {
            method: 'POST',
            body: formData
        });

        if (!serverRes.ok) throw new Error('ImageKit server-side upload failed');
        const data = await serverRes.json();
        return {
            success: true,
            url: data.url,
            publicId: data.fileId,
            provider: 'imagekit',
            thumbnailUrl: data.thumbnailUrl,
            width: data.width,
            height: data.height,
            size: data.size
        };
    }

    const { token, expire, signature, publicKey } = await authRes.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name || `monea_${Date.now()}`);
    formData.append("publicKey", publicKey);
    formData.append("signature", signature);
    formData.append("expire", expire.toString());
    formData.append("token", token);
    formData.append("folder", folder);
    formData.append("useUniqueFileName", "true");

    const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData
    });

    if (!uploadRes.ok) {
        throw new Error('ImageKit direct upload failed');
    }

    const data = await uploadRes.json();
    return {
        success: true,
        url: data.url,
        publicId: data.fileId,
        provider: 'imagekit',
        thumbnailUrl: data.thumbnailUrl,
        width: data.width,
        height: data.height,
        size: data.size
    };
}

/**
 * Smart Unified Media Uploader with Auto-Failover
 */
export async function uploadMedia(
    file: File,
    options: UploadMediaOptions = {}
): Promise<UnifiedUploadResult> {
    const { 
        folder = "monea_gallery", 
        resourceType = "image",
        preferredProvider = "auto"
    } = options;

    if (preferredProvider === "imagekit") {
        try {
            return await uploadToImageKitInternal(file, `/${folder}`);
        } catch (e: any) {
            console.warn("[Multi-CDN] ImageKit failed, falling back to Cloudinary:", e.message);
            return await uploadToCloudinaryInternal(file, folder, resourceType);
        }
    }

    // Default: Cloudinary Primary -> ImageKit Fallback
    try {
        return await uploadToCloudinaryInternal(file, folder, resourceType);
    } catch (err: any) {
        console.warn("[Multi-CDN] Cloudinary upload failed/full, auto-switching to ImageKit.io:", err.message);
        try {
            return await uploadToImageKitInternal(file, `/${folder}`);
        } catch (ikErr: any) {
            console.error("[Multi-CDN] Both Cloudinary and ImageKit failed:", ikErr.message);
            throw new Error(`Media upload failed on all providers: ${err.message}`);
        }
    }
}

/**
 * Smart Unified Media Deleter
 * Detects whether the URL is from Cloudinary or ImageKit and deletes appropriately.
 */
export async function deleteMedia(
    urlOrPublicId: string,
    resourceType: 'image' | 'video' = 'image'
): Promise<boolean> {
    if (!urlOrPublicId) return true;

    try {
        if (urlOrPublicId.includes("imagekit.io") || urlOrPublicId.startsWith("ik_")) {
            // Extract fileId or delete via ImageKit
            const fileId = urlOrPublicId.includes("/") ? urlOrPublicId.split("/").pop() : urlOrPublicId;
            const res = await fetch('/api/imagekit/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId })
            });
            return res.ok;
        } else {
            // Cloudinary
            const publicId = urlOrPublicId.includes("cloudinary.com") 
                ? (urlOrPublicId.split("/upload/")[1]?.replace(/^v\d+\//, '').split(".")[0] || urlOrPublicId)
                : urlOrPublicId;

            const res = await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
            });
            return res.ok;
        }
    } catch (e) {
        console.warn("[Multi-CDN Delete Error]:", e);
        return false;
    }
}
