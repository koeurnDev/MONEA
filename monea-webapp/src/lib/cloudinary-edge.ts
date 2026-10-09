/**
 * Cloudinary edge-compatible utilities.
 * Uses Web Crypto API — no Node.js crypto module required.
 * Works in Cloudflare Workers, Next.js Edge Runtime, and Node.js.
 */

/**
 * Signs a Cloudinary API request using HMAC-SHA1 via Web Crypto API.
 * Replaces cloudinary.utils.api_sign_request() from the Node SDK.
 */
export async function cloudinarySign(
    paramsToSign: Record<string, any>,
    apiSecret: string,
): Promise<string> {
    const normalizedParams = Object.entries(paramsToSign).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(',') : value,
    ] as [string, unknown]);
    const canonicalString = normalizedParams
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, value]) => {
            return `${key}=${value}`.replace(/&/g, "%26");
        })
        .join("&") + apiSecret;

    const enc = new TextEncoder();
    const msgData = enc.encode(canonicalString);

    // Use SHA-1 (Cloudinary requires SHA-1 for upload signatures)
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgData);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Deletes a Cloudinary asset via REST API.
 * Replaces cloudinary.uploader.destroy() from the Node SDK.
 */
export async function cloudinaryDelete(
    publicId: string,
    resourceType: string = "image",
): Promise<{ result: string }> {
    const cloudName = 
        (typeof process !== 'undefined' && (process.env?.CLOUDINARY_CLOUD_NAME || process.env?.VITE_CLOUDINARY_CLOUD_NAME || process.env?.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)) ||
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME) ||
        "";

    const apiKey = 
        (typeof process !== 'undefined' && (process.env?.CLOUDINARY_API_KEY || process.env?.VITE_CLOUDINARY_API_KEY || process.env?.NEXT_PUBLIC_CLOUDINARY_API_KEY)) ||
        (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CLOUDINARY_API_KEY) ||
        "";

    const apiSecret = 
        (typeof process !== 'undefined' && (process.env?.CLOUDINARY_API_SECRET || process.env?.CLOUDINARY_SECRET)) ||
        "";

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary server configuration is missing");
    }

    const timestamp    = Math.floor(Date.now() / 1000).toString();
    const paramsToSign = { public_id: publicId, timestamp };
    const signature    = await cloudinarySign(paramsToSign, apiSecret);

    const formData = new URLSearchParams({
        public_id:     publicId,
        timestamp,
        api_key:       apiKey,
        signature,
    });

    const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
        { method: "POST", body: formData },
    );
    return res.json() as Promise<{ result: string }>;
}
