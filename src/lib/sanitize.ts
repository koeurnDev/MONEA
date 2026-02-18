import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes an input string to prevent XSS.
 * Also trims and handles null/undefined.
 */
export function sanitize(input: any): string {
    if (typeof input !== "string") return "";

    // 1. Basic trimming
    let value = input.trim();

    // 2. DOMPurify for HTML escaping
    return DOMPurify.sanitize(value);
}

/**
 * Sanitizes an entire object (e.g., request body)
 */
export function sanitizeObject<T>(obj: any): T {
    const result: any = {};
    for (const key in obj) {
        if (typeof obj[key] === "string") {
            result[key] = sanitize(obj[key]);
        } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            result[key] = sanitizeObject(obj[key]);
        } else {
            result[key] = obj[key];
        }
    }
    return result as T;
}
