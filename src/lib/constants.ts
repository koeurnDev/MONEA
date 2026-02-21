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
