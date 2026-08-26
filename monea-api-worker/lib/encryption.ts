/**
 * Simple symmetric encryption for PII fields (phone numbers, payment info).
 * Uses AES-GCM via Web Crypto API (async) — compatible with Cloudflare Workers & Node.js.
 *
 * Format: iv_hex:authTag_hex:ciphertext_hex
 *
 * NOTE: All encrypt/decrypt functions are async. Callers must await them.
 */

const IV_LENGTH = 12;

let _cachedKey: CryptoKey | null = null;

async function getDerivedKey(): Promise<CryptoKey> {
    if (_cachedKey) return _cachedKey;

    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey && process.env.NODE_ENV === 'production') {
        throw new Error('[CRITICAL] ENCRYPTION_KEY is missing in production!');
    }
    const keyMaterial = rawKey || 'default-hex-key-32-chars-long-placeholder';

    const encoded = new TextEncoder().encode(keyMaterial);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);

    _cachedKey = await globalThis.crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
    return _cachedKey;
}

function toHex(buffer: ArrayBuffer | Uint8Array): string {
    return Array.from(buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer)
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    return bytes;
}

export async function encrypt(text: string): Promise<string> {
    if (!text) return text;
    const key = await getDerivedKey();
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(text);

    const cipherBuffer = await globalThis.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        key,
        encoded,
    );

    const full = new Uint8Array(cipherBuffer);
    const ciphertext = full.slice(0, full.length - 16);
    const authTag = full.slice(full.length - 16);

    return `${toHex(iv)}:${toHex(authTag)}:${toHex(ciphertext)}`;
}

export async function decrypt(encryptedData: string): Promise<string | null> {
    if (!encryptedData || !encryptedData.includes(':')) return encryptedData;
    try {
        const [ivHex, authTagHex, cipherHex] = encryptedData.split(':');
        if (!ivHex || !authTagHex || !cipherHex) return encryptedData;

        const key = await getDerivedKey();
        const ivArr = fromHex(ivHex);
        const authTag = fromHex(authTagHex);
        const ciphertext = fromHex(cipherHex);

        // Combine ciphertext + authTag into a plain ArrayBuffer (strict TS compatible)
        const combinedBuf = new ArrayBuffer(ciphertext.length + authTag.length);
        const combinedView = new Uint8Array(combinedBuf);
        combinedView.set(ciphertext);
        combinedView.set(authTag, ciphertext.length);

        const ivBuf = new ArrayBuffer(ivArr.length);
        new Uint8Array(ivBuf).set(ivArr);

        const plainBuffer = await globalThis.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBuf, tagLength: 128 },
            key,
            combinedBuf,
        );
        return new TextDecoder().decode(plainBuffer);
    } catch {
        return null;
    }
}
