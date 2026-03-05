import bcrypt from "bcryptjs";

const PEPPER = process.env.SECURITY_PEPPER || "monea-default-pepper-ch4ng3-me";

/**
 * Applies a server-side pepper to a string before hashing or comparing.
 * This provides a 2nd layer of security.
 */
function applyPepper(plainText: string): string {
    return plainText + PEPPER;
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
