const WEDDING_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateWeddingCode(): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const suffix = Array.from(randomBytes, (byte) => WEDDING_CODE_ALPHABET[byte & 31]).join("");
    return `MN-${suffix}`;
}
