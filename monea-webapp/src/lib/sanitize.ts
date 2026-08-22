import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes an input string to prevent XSS using DOMPurify.
 */
export function sanitize(input: any): string {
    if (typeof input !== "string") return "";
    
    // Modern industrial-grade sanitization
    return DOMPurify.sanitize(input.trim(), {
        ALLOWED_TAGS: [], // No HTML allowed for standard fields
        ALLOWED_ATTR: []
    });
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
