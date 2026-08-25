/**
 * ImageKit edge-compatible utilities.
 * Uses Web Crypto API — works natively in Cloudflare Workers and browser runtimes.
 */

export async function imagekitAuthSign(
    token: string,
    expire: number,
    privateKey: string
): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(privateKey),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode(`${token}${expire}`)
    );
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function imagekitDelete(
    fileId: string,
    privateKeyOverride?: string
): Promise<boolean> {
    const privateKey = privateKeyOverride || 
        (typeof process !== 'undefined' && process.env?.IMAGEKIT_PRIVATE_KEY) || 
        "";
    
    if (!privateKey) return false;

    const authHeader = 'Basic ' + btoa(`${privateKey}:`);
    const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
        method: "DELETE",
        headers: { 'Authorization': authHeader }
    });
    return res.ok || res.status === 404;
}
