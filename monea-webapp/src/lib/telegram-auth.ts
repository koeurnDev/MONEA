
import crypto from 'crypto';

/**
 * Verifies the data received from Telegram Login Widget.
 * The verification is done by creating a hash of the data (excluding 'hash')
 * using HMAC-SHA256 with the SHA256 of the bot token as the key.
 */
export function verifyTelegramAuth(data: any): boolean {
    const { hash, ...authData } = data;

    if (!hash) return false;

    // 1. Sort the keys alphabetically
    const dataCheckString = Object.keys(authData)
        .sort()
        .map((key) => `${key}=${authData[key]}`)
        .join('\n');

    // 2. Create the secret key (SHA256(token))
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error("TELEGRAM_BOT_TOKEN is missing in environment variables");
        return false;
    }

    const secretKey = crypto
        .createHash('sha256')
        .update(token)
        .digest();

    // 3. Compute the hash
    const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // 4. Compare computed hash with the provided hash
    return hmac === hash;
}
