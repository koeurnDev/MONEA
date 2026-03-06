import bcrypt from "bcryptjs";

const PEPPER = process.env.SECURITY_PEPPER;

function applyPepper(plainText: string): string {
    if (process.env.NODE_ENV === "production" && !PEPPER) {
        throw new Error("[CRITICAL] SECURITY_PEPPER is missing in production. Security breach prevented.");
    }
    return plainText + (PEPPER || "monea-default-pepper-ch4ng3-me");
}

export const CryptoUtils = {
    /**
     * Hashes a string with a server-side pepper.
     */
    async hash(plainText: string, saltRounds = 10): Promise<string> {
        return bcrypt.hash(applyPepper(plainText), saltRounds);
    },

    /**
     * Compares a plain text string against a hashed string using the pepper.
     */
    async compare(plainText: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(applyPepper(plainText), hashed);
    }
};
