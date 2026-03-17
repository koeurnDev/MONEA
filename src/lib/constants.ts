/**
 * MONEA Platform Roles
 * 
 * Terminology for Developers & UI:
 * - PLATFORM_OWNER (SUPERADMIN): Controls the entire platform, manages all events and users.
 * - EVENT_MANAGER (ADMIN): The user who owns/manages a specific wedding/event.
 * - EVENT_STAFF (STAFF): Personnel hired for a specific wedding (e.g., check-in, donation management).
 */

export const ROLES = {
    PLATFORM_OWNER: "SUPERADMIN",
    EVENT_MANAGER: "ADMIN",
    EVENT_STAFF: "STAFF"
} as const;

export const ROLE_LABELS: Record<Role, string> = {
    [ROLES.PLATFORM_OWNER]: "Platform Owner",
    [ROLES.EVENT_MANAGER]: "Event Manager",
    [ROLES.EVENT_STAFF]: "Event Staff"
};

export type Role = typeof ROLES[keyof typeof ROLES];

// Helper to check if a user is an owner/admin of the platform
export const isPlatformOwner = (role: string) => role === ROLES.PLATFORM_OWNER;

// Helper to check if a user is an event manager
export const isEventManager = (role: string) => role === ROLES.EVENT_MANAGER;

// Helper to check if a user is event staff
export const isEventStaff = (role: string) => role === ROLES.EVENT_STAFF;
// --- Middleware & Auth Specific Constants ---

export const COOKIE_NAMES = {
    TOKEN: "token",
    STAFF_TOKEN: "staff_token",
    REFRESH_TOKEN: "refresh_token",
} as const;

export const AUTH_URLS = {
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
} as const;

export const JWT_CONFIG = {
    ISSUER: "monea:app",
    AUDIENCE: {
        USER: "user",
        STAFF: "staff",
        ADMIN: "admin",
    },
} as const;

export const BLOCKED_BOTS = [
    "python-requests", "curl", "wget", "headlesschrome", "puppeteer", 
    "playwright", "phantomjs", "scrapy", "urllib",
    "GPTBot", "CCBot", "ChatGPT-User", "Omgilibot", "FacebookBot", "PerplexityBot",
    "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot",
    "sogou", "exabot", "facebot", "ia_archiver"
];

export const SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": 
        "default-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://plus.unsplash.com wss:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://upload-widget.cloudinary.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://plus.unsplash.com https://*.google.com https://*.gstatic.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "frame-src 'self' https://challenges.cloudflare.com https://www.youtube.com https://youtube.com https://upload-widget.cloudinary.com; " +
        "connect-src 'self' https://challenges.cloudflare.com https://api.cloudinary.com https://upload-widget.cloudinary.com https://*.sentry.io wss:; " +
        "media-src 'self' data: blob: https://res.cloudinary.com; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "frame-ancestors 'none'; " +
        "form-action 'self';",
} as const;
