import bcrypt from "bcryptjs";

function getPepper(): string {
    const pepper = process.env.SECURITY_PEPPER;
    if (process.env.NODE_ENV === "production" && (!pepper || pepper === "monea-default-pepper-ch4ng3-me")) {
        throw new Error("[CRITICAL] SECURITY_PEPPER is missing or using default in production!");
    }
    if (!pepper) {
        console.warn("[Security] SECURITY_PEPPER is missing. Using insecure fallback for development.");
        return "monea-dev-fallback-pepper";
    }
    return pepper;
}

function applyPepper(plainText: string): string {
    return plainText + getPepper();
}

export const CryptoUtils = {
    /**
     * Hashes a string with a server-side pepper.
     */
    async hash(plainText: string, saltRounds = 10): Promise<string> {
        return bcrypt.hash(applyPepper(plainText), saltRounds);
    },

    async compare(plainText: string, hashed: string): Promise<boolean> {
        // 1. Try with current PEPPER
        const match = await bcrypt.compare(applyPepper(plainText), hashed);
        if (match) return true;

        // 2. Fallback: Try with legacy default pepper
        // This is necessary for users created during the transition or on local dev
        const legacyPepper = "monea-default-pepper-ch4ng3-me";
        return bcrypt.compare(plainText + legacyPepper, hashed);
    }
};
