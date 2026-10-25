export type LimitedJsonBodyResult =
    | { kind: "ok"; value: unknown }
    | { kind: "invalid" }
    | { kind: "too_large" };

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function readJsonBodyLimited(
    req: Request,
    maxBytes: number,
): Promise<LimitedJsonBodyResult> {
    const declaredLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        return { kind: "too_large" };
    }
    if (!req.body) return { kind: "invalid" };

    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > maxBytes) {
                await reader.cancel();
                return { kind: "too_large" };
            }
            chunks.push(value);
        }

        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return { kind: "ok", value: JSON.parse(new TextDecoder().decode(bytes)) };
    } catch {
        return { kind: "invalid" };
    } finally {
        reader.releaseLock();
    }
}
