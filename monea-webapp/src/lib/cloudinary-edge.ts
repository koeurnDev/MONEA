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
    // Build sorted param string (Cloudinary spec)
    const str = Object.keys(paramsToSign)
        .sort()
        .map(k => `${k}=${Array.isArray(paramsToSign[k]) ? paramsToSign[k].join(",") : paramsToSign[k]}`)
        .join("&") + apiSecret;

    const enc     = new TextEncoder();
    const keyData = enc.encode(apiSecret);
    const msgData = enc.encode(str.slice(0, str.length - apiSecret.length) + apiSecret);

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
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const apiKey    = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

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
