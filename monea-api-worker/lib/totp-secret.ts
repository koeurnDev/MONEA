import { decrypt, encrypt } from "@/lib/encryption";

const ENCRYPTED_SECRET_PATTERN = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i;

export function isEncryptedTotpSecret(value: string): boolean {
    return ENCRYPTED_SECRET_PATTERN.test(value);
}

export async function encryptTotpSecret(secret: string): Promise<string> {
    return encrypt(secret);
}

export async function decryptAndMigrateTotpSecret(
    storedSecret: string,
    persistEncryptedSecret: (encryptedSecret: string) => Promise<unknown>,
): Promise<string> {
    if (isEncryptedTotpSecret(storedSecret)) {
        const secret = await decrypt(storedSecret);
        if (!secret) {
            throw new Error("Unable to decrypt stored TOTP secret; verify ENCRYPTION_KEY.");
        }
        return secret;
    }

    const encryptedSecret = await encryptTotpSecret(storedSecret);
    await persistEncryptedSecret(encryptedSecret);
    return storedSecret;
}
