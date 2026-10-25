import assert from "node:assert/strict";
import test from "node:test";
import { createR2PresignedPutUrl } from "../lib/r2-presign.ts";

test("R2 presigned PUT URL is short-lived and scoped to the object content type", async () => {
    const url = new URL(await createR2PresignedPutUrl(
        {
            accountId: "account-id",
            bucketName: "monea-media",
            accessKeyId: "access-key",
            secretAccessKey: "test-secret",
        },
        "wedding-id/image name.jpg",
        "image/jpeg",
        new Date("2026-10-25T03:22:54.000Z"),
    ));

    assert.equal(url.origin, "https://account-id.r2.cloudflarestorage.com");
    assert.equal(url.pathname, "/monea-media/wedding-id/image%20name.jpg");
    assert.equal(url.searchParams.get("X-Amz-Algorithm"), "AWS4-HMAC-SHA256");
    assert.equal(url.searchParams.get("X-Amz-Credential"), "access-key/20261025/auto/s3/aws4_request");
    assert.equal(url.searchParams.get("X-Amz-Date"), "20261025T032254Z");
    assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
    assert.equal(url.searchParams.get("X-Amz-SignedHeaders"), "content-type;host");
    assert.match(url.searchParams.get("X-Amz-Signature") || "", /^[a-f0-9]{64}$/);
});
