/**
 * Cloudinary edge-compatible utilities.
 * Uses Web Crypto API — no Node.js crypto module required.
 * Works in Cloudflare Workers, Next.js Edge Runtime, and Node.js.
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
 * Signs a Cloudinary API request using SHA-1 via Web Crypto API.
 * Compatible with Cloudinary REST API Signature Standard.
 */
export async function cloudinarySign(
  paramsToSign: Record<string, any>,
  apiSecret: string
): Promise<string> {
  if (!apiSecret) {
    throw new Error("[Cloudinary Edge] API Secret is missing for request signing.");
  }

  // Build sorted parameter string according to Cloudinary spec: "k1=v1&k2=v2...apiSecret"
  const str =
    Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${Array.isArray(paramsToSign[k]) ? paramsToSign[k].join(",") : paramsToSign[k]}`)
      .join("&") + apiSecret;

  const enc = new TextEncoder();
  const msgData = enc.encode(str);

  // SHA-1 signature required by Cloudinary Upload/Destroy API
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgData);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deletes a Cloudinary asset via REST API on Edge Runtimes without Node SDK dependencies.
 */
export async function cloudinaryDelete(
  publicId: string,
  resourceType: string = "image",
  env?: any
): Promise<{ result: string }> {
  if (!publicId) {
    return { result: "not found" };
  }

  // Fetch credentials from passed Cloudflare Worker Env or Process Env
  const cloudName =
    getEnvVar("CLOUDINARY_CLOUD_NAME", env) ||
    getEnvVar("VITE_CLOUDINARY_CLOUD_NAME", env) ||
    getEnvVar("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", env);

  const apiKey =
    getEnvVar("CLOUDINARY_API_KEY", env) ||
    getEnvVar("VITE_CLOUDINARY_API_KEY", env) ||
    getEnvVar("NEXT_PUBLIC_CLOUDINARY_API_KEY", env);

  const apiSecret =
    getEnvVar("CLOUDINARY_API_SECRET", env) ||
    getEnvVar("CLOUDINARY_SECRET", env);

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[Cloudinary Edge Error] Missing Cloudinary credentials in Environment variables.");
    return { result: "error: missing credentials" };
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign = { public_id: publicId, timestamp };
  const signature = await cloudinarySign(paramsToSign, apiSecret);

  const formData = new URLSearchParams({
    public_id: publicId,
    timestamp,
    api_key: apiKey,
    signature,
  });

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Cloudinary Destroy Failed] HTTP ${res.status}: ${errorText}`);
      return { result: "error" };
    }

    return (await res.json()) as Promise<{ result: string }>;
  } catch (error: any) {
    console.error("[Cloudinary Exception]:", error?.message || error);
    return { result: "exception" };
  }
}