/**
 * ImageKit edge-compatible utilities.
 * Uses Web Crypto API — works natively in Cloudflare Workers, Next.js Edge, and browser runtimes.
 */

/**
 * Universal Environment Variable Extractor for Cloudflare Worker & Node.js
 */
function getEnvVar(key: string, env?: any): string {
  if (env && env[key]) return env[key];
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || "";
  }
  return "";
}

/**
 * Generates an authentication signature for ImageKit client uploads via Web Crypto API (HMAC-SHA1).
 */
export async function imagekitAuthSign(
  token: string,
  expire: number,
  privateKey: string
): Promise<string> {
  if (!privateKey) {
    throw new Error("[ImageKit Edge] Private key is required to sign authentication tokens.");
  }

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
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Safely encodes a string into Base64 format across all JavaScript environments.
 */
function safeBtoa(str: string): string {
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str).toString("base64");
}

/**
 * Deletes an asset from ImageKit via REST API on Edge Network.
 */
export async function imagekitDelete(
  fileId: string,
  privateKeyOverride?: string,
  env?: any
): Promise<boolean> {
  if (!fileId) return false;

  const privateKey =
    privateKeyOverride ||
    getEnvVar("IMAGEKIT_PRIVATE_KEY", env) ||
    getEnvVar("VITE_IMAGEKIT_PRIVATE_KEY", env);

  if (!privateKey) {
    console.error("[ImageKit Edge Error] Missing IMAGEKIT_PRIVATE_KEY environment variable.");
    return false;
  }

  try {
    const authHeader = `Basic ${safeBtoa(`${privateKey}:`)}`;
    const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    // Return true if deletion was successful or if file was already deleted (404)
    return res.ok || res.status === 404;
  } catch (error) {
    console.error("[ImageKit Delete Exception]:", error);
    return false;
  }
}