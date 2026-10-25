import { Hono } from "hono";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { standardLimiter, getIP } from "@/lib/ratelimit";
import { deleteR2Object, getR2Bucket, R2_PUBLIC_ID_PREFIX } from "@/lib/r2-storage";
import { createR2PresignedPutUrl } from "@/lib/r2-presign";

const r2Router = new Hono();
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const PRESIGNED_UPLOAD_TTL_SECONDS = 300;
const SAFE_MEDIA_TYPES = new Set([
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/aac",
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "video/mp4",
    "video/ogg",
    "video/quicktime",
    "video/webm",
]);

function normalizeFolder(value: string): string | null {
    const folder = value.trim().replace(/^\/+|\/+$/g, "");
    return folder && folder.length <= 255 && /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(folder)
        ? folder
        : null;
}

function normalizeFileName(value: string): string {
    return value
        .split(/[\\/]/)
        .pop()
        ?.replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(-120) || "upload";
}

async function canAccessFolder(
    user: { userId: string; role: string; weddingId?: string | null },
    folder: string,
): Promise<boolean> {
    if (user.role === ROLES.PLATFORM_OWNER) return true;
    const sessionWeddingId = user.weddingId;
    if (
        folder === user.userId
        || folder.startsWith(`${user.userId}/`)
        || (sessionWeddingId && (folder === sessionWeddingId || folder.startsWith(`${sessionWeddingId}/`)))
    ) {
        return true;
    }

    const weddingId = folder.split("/")[0];
    const wedding = await prisma.wedding.findFirst({
        where: { id: weddingId, userId: user.userId },
        select: { id: true },
    });
    return !!wedding;
}

r2Router.post("/presign", async (c) => {
    const { success } = await standardLimiter.limit(getIP(c.req.raw as any));
    if (!success) return c.json({ error: "Too many upload requests. Please wait." }, 429);

    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const env = c.env as {
        R2_ACCOUNT_ID?: string;
        R2_BUCKET_NAME?: string;
        R2_ACCESS_KEY_ID?: string;
        R2_SECRET_ACCESS_KEY?: string;
        R2_PUBLIC_BASE_URL?: string;
    };
    if (
        !env.R2_ACCOUNT_ID
        || !env.R2_BUCKET_NAME
        || !env.R2_ACCESS_KEY_ID
        || !env.R2_SECRET_ACCESS_KEY
    ) {
        return c.json({ mode: "proxy" as const });
    }
    if (!env.R2_PUBLIC_BASE_URL) return c.json({ error: "R2 public domain is not configured" }, 503);

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON format" }, 400);
    }
    if (!body || typeof body !== "object") {
        return c.json({ error: "Upload details are required" }, 400);
    }
    const request = body as { folder?: unknown; fileName?: unknown; contentType?: unknown; size?: unknown };
    if (
        typeof request.contentType !== "string"
        || !SAFE_MEDIA_TYPES.has(request.contentType.trim().toLowerCase())
        || typeof request.size !== "number"
        || !Number.isSafeInteger(request.size)
        || request.size <= 0
        || request.size > MAX_UPLOAD_BYTES
    ) {
        return c.json({ error: "Invalid or unsupported media upload" }, 400);
    }

    const requestedFolder = typeof request.folder === "string"
        ? request.folder
        : user.weddingId || user.userId;
    const folder = normalizeFolder(requestedFolder);
    if (!folder) return c.json({ error: "Invalid upload folder" }, 400);
    if (!(await canAccessFolder(user, folder))) {
        return c.json({ error: "Forbidden: Unauthorized folder" }, 403);
    }

    let publicBaseUrl: URL;
    try {
        publicBaseUrl = new URL(env.R2_PUBLIC_BASE_URL);
        if (publicBaseUrl.protocol !== "https:") throw new Error("HTTPS is required");
    } catch {
        return c.json({ error: "R2 public domain must be a valid HTTPS URL" }, 503);
    }

    const fileName = normalizeFileName(typeof request.fileName === "string" ? request.fileName : "upload");
    const key = `${folder}/${crypto.randomUUID()}-${fileName}`;
    try {
        const uploadUrl = await createR2PresignedPutUrl(
            {
                accountId: env.R2_ACCOUNT_ID,
                bucketName: env.R2_BUCKET_NAME,
                accessKeyId: env.R2_ACCESS_KEY_ID,
                secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            },
            key,
            request.contentType.trim().toLowerCase(),
        );
        const encodedKey = key.split("/").map(encodeURIComponent).join("/");
        return c.json({
            mode: "direct" as const,
            uploadUrl,
            url: `${publicBaseUrl.toString().replace(/\/$/, "")}/${encodedKey}`,
            publicId: `${R2_PUBLIC_ID_PREFIX}${key}`,
            contentType: request.contentType.trim().toLowerCase(),
            expiresIn: PRESIGNED_UPLOAD_TTL_SECONDS,
        });
    } catch (error) {
        console.error("[R2] Could not create presigned upload:", error instanceof Error ? error.message : error);
        return c.json({ error: "Could not prepare direct upload. Please try again." }, 500);
    }
});

r2Router.post("/upload", async (c) => {
    const { success } = await standardLimiter.limit(getIP(c.req.raw as any));
    if (!success) return c.json({ error: "Too many upload requests. Please wait." }, 429);

    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const env = c.env as { MONEA_MEDIA?: unknown; R2_PUBLIC_BASE_URL?: string };
    const bucket = getR2Bucket(env);
    if (!bucket) return c.json({ error: "R2 media bucket is not configured" }, 503);
    if (!env.R2_PUBLIC_BASE_URL) return c.json({ error: "R2 public domain is not configured" }, 503);

    const contentType = c.req.header("content-type")?.split(";")[0].trim().toLowerCase() || "";
    if (!SAFE_MEDIA_TYPES.has(contentType)) {
        return c.json({ error: "This file type is not supported" }, 415);
    }

    const contentLength = Number(c.req.header("content-length"));
    if (!Number.isSafeInteger(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_BYTES) {
        return c.json({ error: "File must be between 1 byte and 100 MB" }, 413);
    }

    const requestedFolder = c.req.query("folder") || user.weddingId || user.userId;
    const folder = normalizeFolder(requestedFolder);
    if (!folder) return c.json({ error: "Invalid upload folder" }, 400);
    if (!(await canAccessFolder(user, folder))) {
        return c.json({ error: "Forbidden: Unauthorized folder" }, 403);
    }

    const body = c.req.raw.body;
    if (!body) return c.json({ error: "No file content provided" }, 400);

    const requestedName = c.req.header("x-file-name") || "upload";
    let fileName: string;
    try {
        fileName = decodeURIComponent(requestedName);
    } catch {
        return c.json({ error: "Invalid file name" }, 400);
    }
    const safeFileName = normalizeFileName(fileName);
    const key = `${folder}/${crypto.randomUUID()}-${safeFileName}`;

    let publicBaseUrl: URL;
    try {
        publicBaseUrl = new URL(env.R2_PUBLIC_BASE_URL);
        if (publicBaseUrl.protocol !== "https:") throw new Error("HTTPS is required");
    } catch {
        return c.json({ error: "R2 public domain must be a valid HTTPS URL" }, 503);
    }

    try {
        await bucket.put(key, body, {
            httpMetadata: {
                contentType,
                cacheControl: "public, max-age=31536000, immutable",
            },
        });
        const encodedKey = key.split("/").map(encodeURIComponent).join("/");
        return c.json({
            success: true,
            url: `${publicBaseUrl.toString().replace(/\/$/, "")}/${encodedKey}`,
            publicId: `${R2_PUBLIC_ID_PREFIX}${key}`,
            size: contentLength,
            contentType,
        });
    } catch (error) {
        console.error("[R2] Upload failed:", error instanceof Error ? error.message : error);
        return c.json({ error: "R2 upload failed. Please try again." }, 502);
    }
});

r2Router.post("/delete", async (c) => {
    const { success } = await standardLimiter.limit(getIP(c.req.raw as any));
    if (!success) return c.json({ error: "Too many delete requests. Please wait." }, 429);

    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON format" }, 400);
    }
    if (!body || typeof body !== "object" || !("publicId" in body) || typeof body.publicId !== "string") {
        return c.json({ error: "R2 public ID is required" }, 400);
    }

    const publicId = body.publicId;
    if (!publicId.startsWith(R2_PUBLIC_ID_PREFIX)) return c.json({ error: "Invalid R2 public ID" }, 400);
    const key = publicId.slice(R2_PUBLIC_ID_PREFIX.length);
    const folder = normalizeFolder(key.split("/").slice(0, -1).join("/"));
    if (!folder || !(await canAccessFolder(user, folder))) {
        return c.json({ error: "Forbidden: You do not own this file" }, 403);
    }

    try {
        const deleted = await deleteR2Object(c.env, publicId);
        return c.json({ success: deleted });
    } catch (error) {
        console.error("[R2] Delete failed:", error instanceof Error ? error.message : error);
        return c.json({ error: "Failed to delete R2 object" }, 502);
    }
});

export default r2Router;
