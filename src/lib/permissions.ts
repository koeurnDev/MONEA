export function isEditingLocked(wedding: any): boolean {
    if (!wedding) return true;

    // Admin/Owner roles might override this in future, but for now strict date check
    if (wedding.packageType === "PREMIUM") return false; // Lifetime access

    if (wedding.expiresAt) {
        const expiry = new Date(wedding.expiresAt);
        const now = new Date();
        return now > expiry;
    }

    // Default: If no expiresAt set (legacy or fresh free tier), we might enforce default or allow.
    // For MVP, if package is FREE and created > 3 days ago, lock it.
    if (wedding.packageType === "FREE") {
        const created = new Date(wedding.createdAt);
        const limit = new Date(created);
        limit.setDate(limit.getDate() + 3); // 3 days free trial logic
        return new Date() > limit;
    }

    return false;
}
