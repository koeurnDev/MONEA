import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes an input string to prevent XSS.
 */
export function sanitize(input: any): string {
    if (typeof input !== "string") return "";
    
    try {
        let purifier: any = DOMPurify;
        if (purifier && !purifier.sanitize && purifier.default) {
            purifier = purifier.default;
        }
        if (typeof purifier?.sanitize === "function") {
            return purifier.sanitize(input.trim(), {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
        }
    } catch {
        // Silent fallback
    }

    return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
