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
 * Constant-time string comparison to prevent cryptographic timing attacks.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifies the data received from Telegram Login Widget / WebApp.
 * Fully compatible with Web Crypto API (Cloudflare Workers & Modern Runtimes).
 * 
 * @param data - The auth payload received from Telegram Widget containing hash & auth_date
 * @param env - Cloudflare Worker environment bindings
 * @param maxAgeSeconds - Maximum allowable token age in seconds (Default: 86400s / 24 hours)
 */
export async function verifyTelegramAuth(
  data: Record<string, any>,
  env?: any,
  maxAgeSeconds: number = 86400
): Promise<boolean> {
  if (!data || typeof data !== "object") return false;

  const { hash, ...authData } = data;
  if (!hash) return false;

  // 1. Replay Attack Prevention (Auth Date Expiry Check)
  if (authData.auth_date) {
    const authDate = Number(authData.auth_date);
    const currentTime = Math.floor(Date.now() / 1000);
    if (isNaN(authDate) || currentTime - authDate > maxAgeSeconds) {
      console.warn("[Telegram Auth] Authentication payload expired or invalid auth_date.");
      return false;
    }
  }

  // Extract Telegram Bot Token dynamically
  const token = getEnvVar("TELEGRAM_BOT_TOKEN", env);
  if (!token) {
    console.error("[Telegram Auth] TELEGRAM_BOT_TOKEN is missing in environment variables.");
    return false;
  }

  try {
    // 2. Sort keys alphabetically (Excluding hash)
    const dataCheckString = Object.keys(authData)
      .sort()
      .map((key) => `${key}=${authData[key]}`)
      .join("\n");

    const encoder = new TextEncoder();

    // 3. Create Secret Key: WebCrypto Digest SHA256("WebAppData" or token)
    // Note: For Telegram Widget Auth, Secret Key is SHA-256 of Bot Token
    const tokenBuffer = encoder.encode(token);
    const secretKeyBuffer = await crypto.subtle.digest("SHA-256", tokenBuffer);

    // 4. Import secret key into Web Crypto for HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretKeyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // 5. Compute the HMAC-SHA256 hash
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(dataCheckString)
    );

    // 6. Convert ArrayBuffer to Hex string
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 7. Timing-safe comparison to prevent timing attacks
    return timingSafeEqualStr(computedHash.toLowerCase(), String(hash).toLowerCase());
  } catch (error) {
    console.error("[Telegram Auth Verification Exception]:", error);
    return false;
  }
}