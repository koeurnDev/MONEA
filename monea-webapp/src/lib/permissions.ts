export const FREE_TRIAL_DAYS = 14;

export function isFreeTrialExpired(wedding: any): boolean {
    if (!wedding || wedding.packageType !== "FREE") return false;
    const created = new Date(wedding.createdAt);
    if (Number.isNaN(created.getTime())) return true;
    const limit = new Date(created);
    limit.setDate(limit.getDate() + FREE_TRIAL_DAYS);
    return new Date() > limit;
}

export function isEditingLocked(wedding: any): boolean {
    if (!wedding) return true;
    if (process.env.NODE_ENV === "development") return false; // Unlock for local development

    // 1. Administrative override or Paid status always unlocks
    // If they have paid or the payment is being verified, they should not be locked out.
    if (wedding.paymentStatus === "PAID" || wedding.paymentStatus === "AWAITING_VERIFICATION") {
        return false;
    }

    // 2. Lifetime Packages
    if (wedding.packageType === "PREMIUM" || wedding.packageType === "PRO") {
        // If it's a paid package but for some reason paymentStatus isn't updated, 
        // we check expiresAt as a fallback.
        if (wedding.expiresAt) {
            const expiry = new Date(wedding.expiresAt);
            const now = new Date();
            return now > expiry;
        }
        return false; // No expiry set for a paid plan means lifetime
    }

    // Free plans can use the M1 template for 14 days.
    if (wedding.packageType === "FREE") {
        const created = new Date(wedding.createdAt);
        if (Number.isNaN(created.getTime())) return true;

        const limit = new Date(created);
        limit.setDate(limit.getDate() + FREE_TRIAL_DAYS);
        return new Date() > limit;
    }

    return false;
}
