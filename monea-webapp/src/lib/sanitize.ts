import DOMPurify from "isomorphic-dompurify";
/**
 * Allows only http(s), blob, tel and mailto URLs, same-origin paths, and raster data:image URIs.
 * Blocks javascript:, vbscript:, data:text/html and SVG data URIs (which can carry script).
 */
function isSafeUrlOrMediaPath(value: string): boolean {
    if (/^data:image\/(png|jpe?g|gif|webp|avif)[;,]/i.test(value)) return true;
    if (value.startsWith("/")) return true;
    try {
        const { protocol } = new URL(value);
        return ["http:", "https:", "blob:", "tel:", "mailto:"].includes(protocol);
    } catch {
        return false;
    }
}



/**
 * Sanitizes an input string to prevent XSS without corrupting URLs or slashes.
 */
export function sanitize(input: any): string {
    if (typeof input !== "string") return "";
    const trimmed = input.trim();
    if (!trimmed) return "";
    
    // Check if input is a URL or media path
    if (/^(https?:\/\/|\/|data:image\/|blob:|tel:|mailto:)/i.test(trimmed)) {
        if (!isSafeUrlOrMediaPath(trimmed)) {
            return "";
        }
        // Clean any double-escaped entities in URLs
        return trimmed
            .replace(/&amp;/g, "&")
            .replace(/&#x2F;/g, "/")
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"');
    }

    try {
        let purifier: any = DOMPurify;
        if (purifier && !purifier.sanitize && purifier.default) {
            purifier = purifier.default;
        }
        if (typeof purifier?.sanitize === "function") {
            const sanitized = purifier.sanitize(trimmed, {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
            // Revert slashes and apostrophes that DOMPurify might entity-encode in plain text
            return sanitized.replace(/&#x2F;/g, "/").replace(/&#x27;/g, "'");
        }
    } catch {
        // Silent fallback
    }

    return trimmed
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]*>?/gm, "");
}

/**
 * Sanitizes an entire object (e.g., request body)
 */
export function sanitizeObject<T>(obj: any): T {
    if (obj === null || typeof obj !== "object") return obj;
    
    const result: any = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
        const val = obj[key];
        if (typeof val === "string") {
            result[key] = sanitize(val);
        } else if (val instanceof Date) {
            result[key] = val; // Preserve Date objects
        } else if (typeof val === "object" && val !== null) {
            result[key] = sanitizeObject(val);
        } else {
            result[key] = val;
        }
    }
    return result as T;
}
