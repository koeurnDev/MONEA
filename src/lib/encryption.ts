import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;
const RAW_KEY = process.env.ENCRYPTION_KEY;

let cachedKey: Buffer | null = null;
function getHashedKey() {
    if (process.env.NODE_ENV === "production" && !RAW_KEY) {
        throw new Error("[CRITICAL] ENCRYPTION_KEY is missing in production. Data privacy cannot be guaranteed.");
    }
    if (!cachedKey) {
        const keyToHash = RAW_KEY || 'default-hex-key-32-chars-long-placeholder';
        cachedKey = crypto.createHash('sha256').update(keyToHash).digest();
    }
    return cachedKey;
}

export function encrypt(text: string): string {
    if (!text) return text;

    const key = getHashedKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:enccryptedText
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
    if (!encryptedData || !encryptedData.includes(':')) return encryptedData;

    try {
        const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
        if (!ivHex || !authTagHex || !encryptedText) return encryptedData;

        const key = getHashedKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return encryptedData; // Return original on failure to avoid breaking things if data was plain
    }
}
