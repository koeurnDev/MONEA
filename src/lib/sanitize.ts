/**
 * Sanitizes an input string to prevent XSS.
 * Basic version using standard character escaping for App Router compatibility.
 */
export function sanitize(input: any): string {
    if (typeof input !== "string") return "";

    const value = input.trim();
    
    // Simple native escaping to avoid isomorphic-dompurify loading issues in Turbopack
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Sanitizes an entire object (e.g., request body)
 */
export function sanitizeObject<T>(obj: any): T {
    const result: any = {};
    for (const key in obj) {
        if (typeof obj[key] === "string") {
            result[key] = sanitize(obj[key]);
        } else if (typeof obj[key] === "number" || typeof obj[key] === "boolean") {
            result[key] = obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            result[key] = sanitizeObject(obj[key]);
        } else if (Array.isArray(obj[key])) {
            result[key] = obj[key].map(item =>
                typeof item === "object" && item !== null ? sanitizeObject(item) : (typeof item === "string" ? sanitize(item) : item)
            );
        } else {
            result[key] = obj[key];
        }
    }
    return result as T;
}
