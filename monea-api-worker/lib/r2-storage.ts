interface R2BucketBinding {
    put(
        key: string,
        value: ReadableStream<Uint8Array>,
        options?: {
            httpMetadata?: {
                contentType?: string;
                cacheControl?: string;
            };
        },
    ): Promise<unknown>;
    delete(key: string): Promise<void>;
}

export interface R2StorageEnvironment {
    MONEA_MEDIA?: R2BucketBinding;
}

export const R2_PUBLIC_ID_PREFIX = "r2:";

export function getR2Bucket(env: unknown): R2BucketBinding | null {
    if (!env || typeof env !== "object" || !("MONEA_MEDIA" in env)) return null;
    const bucket = (env as R2StorageEnvironment).MONEA_MEDIA;
    return bucket && typeof bucket.put === "function" && typeof bucket.delete === "function"
        ? bucket
        : null;
}

export async function deleteR2Object(env: unknown, publicId: string): Promise<boolean> {
    if (!publicId.startsWith(R2_PUBLIC_ID_PREFIX)) return false;
    const key = publicId.slice(R2_PUBLIC_ID_PREFIX.length);
    if (!key || key.includes("..") || key.startsWith("/") || key.includes("\\")) {
        throw new Error("Invalid R2 object key");
    }

    const bucket = getR2Bucket(env);
    if (!bucket) throw new Error("R2 media bucket binding is not configured");
    await bucket.delete(key);
    return true;
}
