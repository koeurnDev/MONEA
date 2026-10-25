const encoder = new TextEncoder();

export interface R2PresignConfig {
    accountId: string;
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
}

function encodeRfc3986(value: string): string {
    return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
        `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
}

function bytesToHex(bytes: ArrayBuffer): string {
    return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string): Promise<string> {
    return bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function hmac(key: ArrayBuffer | Uint8Array<ArrayBuffer>, value: string): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
}

export async function createR2PresignedPutUrl(
    config: R2PresignConfig,
    objectKey: string,
    contentType: string,
    now = new Date(),
): Promise<string> {
    const host = `${config.accountId}.r2.cloudflarestorage.com`;
    const date = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const shortDate = date.slice(0, 8);
    const region = "auto";
    const service = "s3";
    const scope = `${shortDate}/${region}/${service}/aws4_request`;
    const uri = `/${encodeRfc3986(config.bucketName)}/${objectKey
        .split("/")
        .map(encodeRfc3986)
        .join("/")}`;
    const parameters: [string, string][] = [
        ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
        ["X-Amz-Credential", `${config.accessKeyId}/${scope}`],
        ["X-Amz-Date", date],
        ["X-Amz-Expires", "300"],
        ["X-Amz-SignedHeaders", "content-type;host"],
    ];
    const canonicalQuery = parameters
        .map(([key, value]) => [encodeRfc3986(key), encodeRfc3986(value)] as const)
        .sort(([keyA, valueA], [keyB, valueB]) =>
            keyA < keyB ? -1 : keyA > keyB ? 1 : valueA < valueB ? -1 : valueA > valueB ? 1 : 0,
        )
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
    const canonicalRequest = [
        "PUT",
        uri,
        canonicalQuery,
        `content-type:${contentType.trim()}\nhost:${host}\n`,
        "content-type;host",
        "UNSIGNED-PAYLOAD",
    ].join("\n");
    const stringToSign = [
        "AWS4-HMAC-SHA256",
        date,
        scope,
        await sha256(canonicalRequest),
    ].join("\n");
    const dateKey = await hmac(encoder.encode(`AWS4${config.secretAccessKey}`), shortDate);
    const regionKey = await hmac(dateKey, region);
    const serviceKey = await hmac(regionKey, service);
    const signingKey = await hmac(serviceKey, "aws4_request");
    const signature = bytesToHex(await hmac(signingKey, stringToSign));

    return `https://${host}${uri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
