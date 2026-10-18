import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SignJWT } from "jose";
import { onRequest as onWeddingRequest } from "../functions/w/[id].ts";
import { onRequest as onInviteRequest } from "../functions/invite/[id].ts";
import { onRequest as onPagesMiddleware } from "../functions/_middleware.ts";
import { isRecommendedSocialPreviewAspectRatio } from "../src/lib/social-preview.ts";

const previewImage = "https://res.cloudinary.com/monea/image/upload/v1/wedding/preview.jpg";
const previewTitle = "Our wedding & celebration";

test("social preview aspect ratio accepts landscape cards and flags unsuitable shapes", () => {
    assert.equal(isRecommendedSocialPreviewAspectRatio(1200, 630), true);
    assert.equal(isRecommendedSocialPreviewAspectRatio(1600, 1000), true);
    assert.equal(isRecommendedSocialPreviewAspectRatio(1000, 1000), false);
    assert.equal(isRecommendedSocialPreviewAspectRatio(630, 1200), false);
    assert.equal(isRecommendedSocialPreviewAspectRatio(0, 630), false);
});

function createBotContext(path) {
    return {
        request: new Request(`https://moneoez.com${path}`, {
            headers: { "user-agent": "TelegramBot" },
        }),
        params: { id: "wedding-123" },
        next: async () => new Response(
            "<!doctype html><html><head><title>MONEA</title><meta property=\"og:image\" content=\"https://moneoez.com/logo.png\"></head><body></body></html>",
            { headers: { "content-type": "text/html;charset=UTF-8" } },
        ),
    };
}

test("server-rendered wedding and invite previews use configured image and title", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => Response.json({
        id: "wedding-123",
        groomName: "A",
        brideName: "B",
        eventType: "wedding",
        socialPreviewImage: previewImage,
        socialPreviewTitle: previewTitle,
        heroImage: "https://res.cloudinary.com/monea/image/upload/v1/wedding/hero.jpg",
    });

    try {
        for (const [path, handler] of [
            ["/w/wedding-123", onWeddingRequest],
            ["/invite/wedding-123", onInviteRequest],
        ]) {
            const response = await handler(createBotContext(path));
            const html = await response.text();

            assert.match(html, /<title>Our wedding &amp; celebration<\/title>/);
            assert.match(html, /property="og:image" content="https:\/\/res\.cloudinary\.com\/monea\/image\/upload\/c_fill,w_1200,h_630,g_auto,q_auto,f_jpg\/v1\/wedding\/preview\.jpg"/);
            assert.match(html, /name="twitter:image" content="https:\/\/res\.cloudinary\.com\/monea\/image\/upload\/c_fill,w_1200,h_630,g_auto,q_auto,f_jpg\/v1\/wedding\/preview\.jpg"/);
        }
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("invalid data URL social previews fall back to the public hero image", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => Response.json({
        id: "wedding-123",
        socialPreviewImage: "data:image/png;base64,not-public",
        heroImage: "https://res.cloudinary.com/monea/image/upload/v1/wedding/hero.jpg",
    });

    try {
        const response = await onWeddingRequest(createBotContext("/w/wedding-123"));
        const html = await response.text();

        assert.match(html, /property="og:image" content="https:\/\/res\.cloudinary\.com\/monea\/image\/upload\/c_fill,w_1200,h_630,g_auto,q_auto,f_jpg\/v1\/wedding\/hero\.jpg"/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("SEO API and editor persist social preview metadata as public URLs", async () => {
    const apiSource = await readFile(
        new URL("../../monea-api-worker/routers/wedding.ts", import.meta.url),
        "utf8",
    );
    const editorSource = await readFile(
        new URL("../src/app/dashboard/design/components/Step5Extra.tsx", import.meta.url),
        "utf8",
    );

    assert.match(apiSource, /socialPreviewImage:\s*typeof themeSettings\.socialPreviewImage === "string"/);
    assert.match(apiSource, /themeSettings\.socialPreviewImage\.length <= 2048/);
    assert.match(apiSource, /socialPreviewTitle:\s*typeof .*invite_title === "string"/);
    assert.match(editorSource, /resourceType:\s*"image"/);
    assert.match(editorSource, /socialPreviewImage:\s*url/);
    assert.match(editorSource, /Preview ពេលផ្ញើ Link/);
    assert.match(editorSource, /isRecommendedSocialPreviewAspectRatio\(image\.width, image\.height\)/);
    assert.match(editorSource, /សមាមាត្រប្រហែល 1\.91:1/);
    assert.match(editorSource, /role="status"/);
    assert.match(editorSource, /src=\{socialPreviewImage\}/);
    assert.match(editorSource, /line-clamp-2 text-sm font-bold text-foreground">\{socialPreviewTitle\}/);
    assert.doesNotMatch(editorSource, /reader\.readAsDataURL\(file\)/);
});

test("Cloudflare Pages maintenance middleware redirects visitors but allows admin sessions", async () => {
    const originalFetch = globalThis.fetch;
    const secret = "test-maintenance-secret";
    let statusChecks = 0;
    globalThis.fetch = async () => {
        statusChecks += 1;
        return Response.json({ maintenance: true });
    };

    try {
        const baseContext = {
            env: { VITE_API_URL: "https://api.example.test", JWT_SECRET: secret },
            next: async () => new Response("app"),
        };
        const visitorResponse = await onPagesMiddleware({
            ...baseContext,
            request: new Request("https://moneoez.com/dashboard"),
        });
        assert.equal(visitorResponse.status, 302);
        assert.equal(visitorResponse.headers.get("location"), "https://moneoez.com/maintenance");

        const statusChecksBeforeAsset = statusChecks;
        const assetResponse = await onPagesMiddleware({
            ...baseContext,
            request: new Request("https://moneoez.com/assets/app.js"),
        });
        assert.equal(assetResponse.status, 200);
        assert.equal(statusChecks, statusChecksBeforeAsset);

        const adminToken = await new SignJWT({ role: "SUPERADMIN" })
            .setProtectedHeader({ alg: "HS256" })
            .sign(new TextEncoder().encode(secret));
        const adminResponse = await onPagesMiddleware({
            ...baseContext,
            request: new Request("https://moneoez.com/dashboard", {
                headers: { cookie: `token=${adminToken}` },
            }),
        });
        assert.equal(adminResponse.status, 200);
        assert.equal(await adminResponse.text(), "app");
    } finally {
        globalThis.fetch = originalFetch;
    }
});
