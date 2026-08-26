/**
 * Utility to determine if editing access is locked for a wedding/event.
 * Works seamlessly across Edge Runtime, Node.js, and Client Browsers.
 */

export interface WeddingLockCheckPayload {
  status?: string;
  paymentStatus?: string;
  packageType?: string;
  expiresAt?: string | Date | null;
  createdAt?: string | Date | null;
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
 */
export function isEditingLocked(wedding?: WeddingLockCheckPayload | null, env?: any): boolean {
  if (!wedding) return true;

  // Unlock automatically during local development
  if (isDevelopmentMode(env)) return false;

  // 1. Administrative Status Lockdown
  if (wedding.status === "SUSPENDED" || wedding.status === "DISABLED" || wedding.status === "ARCHIVED") {
    return true;
  }

  // 2. Paid / Awaiting Verification status unlocks editing
  if (wedding.paymentStatus === "PAID" || wedding.paymentStatus === "AWAITING_VERIFICATION") {
    return false;
  }

  // 3. Premium & Pro Tier Logic
  if (wedding.packageType === "PREMIUM" || wedding.packageType === "PRO") {
    if (wedding.expiresAt) {
      const expiry = new Date(wedding.expiresAt);
      if (!isNaN(expiry.getTime())) {
        return new Date() > expiry;
      }
    }
    // Lifetime access if no expiration date is specified
    return false;
  }

  // 4. Free Trial Expiration Logic (3-Day Limit)
  if (wedding.packageType === "FREE" || !wedding.packageType) {
    if (!wedding.createdAt) return true; // Lock if creation date missing

    const created = new Date(wedding.createdAt);
    if (isNaN(created.getTime())) return true; // Lock on invalid date

    const trialLimit = new Date(created);
    trialLimit.setDate(trialLimit.getDate() + 3); // 3 days trial period

    return new Date() > trialLimit;
  }

  return false;
}