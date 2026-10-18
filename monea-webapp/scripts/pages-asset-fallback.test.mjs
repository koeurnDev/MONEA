import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/_middleware.ts";

function contextFor(url, response) {
    return {
        request: new Request(url),
        env: {},
        next: async () => response,
    };
}

test("missing static JavaScript does not receive the SPA HTML fallback", async () => {
    const response = await onRequest(contextFor(
        "https://moneoez.com/chunks/missing.js",
        new Response("<!doctype html>", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    ));

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(await response.text(), "Not Found");
});

test("valid static JavaScript responses pass through unchanged", async () => {
    const assetResponse = new Response("export default true", {
        headers: { "Content-Type": "application/javascript" },
    });
    const response = await onRequest(contextFor(
        "https://moneoez.com/chunks/app.js",
        assetResponse,
    ));

    assert.equal(response, assetResponse);
});
