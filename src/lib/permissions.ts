export function isEditingLocked(wedding: any): boolean {
    if (!wedding) return true;

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

    // 3. Free Trial Logic
    if (wedding.packageType === "FREE") {
        const created = new Date(wedding.createdAt);
        const limit = new Date(created);
        limit.setDate(limit.getDate() + 3); // 3 days free trial
        return new Date() > limit;
    }

    return false;
}
