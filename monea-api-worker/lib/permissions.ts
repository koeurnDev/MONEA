/**
 * Utility to determine if editing access is locked for a wedding/event.
 * Now uses per-template licensing instead of subscription tiers.
 * Works seamlessly across Edge Runtime, Node.js, and Client Browsers.
 */

export interface WeddingLockCheckPayload {
  status?: string;
  [key: string]: any;
}

/**
 * Universal Environment Variable Extractor
 */
function isDevelopmentMode(env?: any): boolean {
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  }
  if (env && env.NODE_ENV) return env.NODE_ENV === "development";
  if (typeof process !== "undefined" && process.env) {
    return process.env.NODE_ENV === "development";
  }
  return false;
}

/**
 * Checks whether an event/wedding is locked from further editing.
 * Per-template licensing removes the old tier-based locks.
 * Only administrative status prevents editing.
 */
export function isEditingLocked(wedding?: WeddingLockCheckPayload | null, env?: any): boolean {
  if (!wedding) return true;

  // Unlock automatically during local development
  if (isDevelopmentMode(env)) return false;

  // Only administrative status prevents editing
  // With per-template licensing, users can always edit their wedding data
  // but cannot publish/use templates without active licenses
  if (wedding.status === "SUSPENDED" || wedding.status === "DISABLED" || wedding.status === "ARCHIVED") {
    return true;
  }

  // Editing is allowed for all other cases
  // Template licensing is validated separately in per-template publish flows
  return false;
}