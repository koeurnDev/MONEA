/**
 * CryptoUtils — CF Workers & Edge compatible password hashing.
 *
 * NEW format  : PBKDF2-SHA256 via Web Crypto API (no Node.js required)
 *               Format: "pbkdf2$<iterations>$<salt_hex>$<hash_hex>"
 *
 * LEGACY format: bcrypt hashes (start with "$2b$" or "$2a$")
 *               Detected automatically — compared via dynamic import of bcryptjs
 *               (bcryptjs still installed for Node.js runtime legacy support)
 *               New hashes are always PBKDF2.
 */

const PBKDF2_ITERATIONS = 100_000; // Max allowed by Cloudflare Workers SubtleCrypto (200k breaks in Workers)
const PBKDF2_KEY_LEN    = 32;      // 256-bit output
const PBKDF2_PREFIX     = "pbkdf2";

function getPepper(): string {
    const pepper = process.env.SECURITY_PEPPER;
    if (process.env.NODE_ENV === "production" && (!pepper || pepper === "monea-default-pepper-ch4ng3-me")) {
        throw new Error("[CRITICAL] SECURITY_PEPPER is missing or using default in production!");
    }
    return pepper || "monea-dev-fallback-pepper";
}

function isBcryptHash(hash: string): boolean {
    return hash.startsWith("$2b$") || hash.startsWith("$2a$") || hash.startsWith("$2y$");
}

/**
 * Derives a PBKDF2 key from plaintext + pepper using Web Crypto API.
 * Returns hex-encoded hash string with embedded salt and iterations.
 */
async function pbkdf2Hash(plainText: string): Promise<string> {
    const pepper   = getPepper();
    const peppered = plainText + pepper;

    const salt     = crypto.getRandomValues(new Uint8Array(16));
    const keyMat   = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(peppered),
        "PBKDF2",
        false,
        ["deriveBits"],
    );
    const derived  = await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
        keyMat,
        PBKDF2_KEY_LEN * 8,
    );

    const saltHex  = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
    const hashHex  = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, "0")).join("");
    return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`;
}

/**
 * Verifies plaintext against a PBKDF2 hash (constant-time via Web Crypto).
 */
async function pbkdf2Compare(plainText: string, stored: string): Promise<boolean> {
    const pepper   = getPepper();
    const peppered = plainText + pepper;

    const parts    = stored.split("$");
    if (parts.length !== 4 || parts[0] !== PBKDF2_PREFIX) return false;

    const iterations = parseInt(parts[1], 10);
    const salt       = new Uint8Array(parts[2].match(/.{2}/g)!.map(h => parseInt(h, 16)));
    const storedHash = new Uint8Array(parts[3].match(/.{2}/g)!.map(h => parseInt(h, 16)));

    const keyMat  = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(peppered),
        "PBKDF2",
        false,
        ["deriveBits"],
    );
    const derived = await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations },
        keyMat,
        storedHash.length * 8,
    );

    // Constant-time comparison
    const candidate = new Uint8Array(derived);
    if (candidate.length !== storedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < candidate.length; i++) diff |= candidate[i] ^ storedHash[i];
    return diff === 0;
}

/**
 * Legacy bcrypt compare — dynamically imported so it only loads in Node.js runtime.
 * CF Workers will never reach this path after full migration.
 */
async function bcryptCompare(plainText: string, hash: string): Promise<boolean> {
    const pepper   = getPepper();
    const peppered = plainText + pepper;
    try {
        const bcrypt = (await import("bcryptjs")).default;
        // Try peppered first, then plain (for very old hashes)
        return (await bcrypt.compare(peppered, hash)) || (await bcrypt.compare(plainText, hash));
    } catch {
        return false;
    }
}

export const CryptoUtils = {
    /**
     * Hashes a string using PBKDF2-SHA256 + server-side pepper.
     * CF Workers & Edge compatible — no Node.js crypto required.
     */
    async hash(plainText: string): Promise<string> {
        return pbkdf2Hash(plainText);
    },

    /**
     * Compares plaintext against a stored hash.
     * Auto-detects format: PBKDF2 (new) or bcrypt (legacy).
     * Bcrypt comparison uses dynamic import — only available in Node.js runtime.
     */
    async compare(plainText: string, hashed: string): Promise<boolean> {
        if (isBcryptHash(hashed)) {
            return bcryptCompare(plainText, hashed);
        }
        return pbkdf2Compare(plainText, hashed);
    },

    /**
     * Returns true if hash is legacy bcrypt format.
     * Use this to trigger lazy migration to PBKDF2 on successful login.
     */
    isLegacy(hashed: string): boolean {
        return isBcryptHash(hashed);
    },
};
