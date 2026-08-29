/**
 * Edge-compatible Sanitization Utility for MONEA
 * Optimized for Cloudflare Workers, Hono, and Next.js Runtimes.
 */

/**
 * Fast & Safe HTML Entity Encoder (Zero External Dependencies, Pure Edge)
 */
export function sanitize(input: any): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // 1. If it's a URL or media path, validate and strip dangerous protocols
  if (/^(https?:\/\/|\/|data:image\/|blob:|tel:|mailto:)/i.test(trimmed)) {
    if (/^\s*(javascript|vbscript|data:text\/html):/i.test(trimmed)) {
      return "";
    }
    // Clean up any previously double-escaped entities
    return trimmed
      .replace(/&amp;/g, "&")
      .replace(/&#x2F;/g, "/")
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"');
  }

  // 2. Strip dangerous script, iframe, style and HTML tags
  return trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "");
}

/**
 * Recursively sanitizes an entire payload (Objects, Arrays, Strings)
 * Preserves Dates, Buffers, and non-string primitive values.
 */
export function sanitizeObject<T>(obj: any): T {
  if (obj === null || typeof obj !== "object") {
    return typeof obj === "string" ? (sanitize(obj) as unknown as T) : obj;
  }

  // Preserve Special Objects
  if (
    obj instanceof Date ||
    obj instanceof ArrayBuffer ||
    (typeof Uint8Array !== "undefined" && obj instanceof Uint8Array)
  ) {
    return obj as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      result[key] = sanitize(val);
    } else if (
      val instanceof Date ||
      val instanceof ArrayBuffer ||
      (typeof Uint8Array !== "undefined" && val instanceof Uint8Array)
    ) {
      result[key] = val;
    } else if (typeof val === "object" && val !== null) {
      result[key] = sanitizeObject(val);
    } else {
      result[key] = val;
    }
  }

  return result as T;
}