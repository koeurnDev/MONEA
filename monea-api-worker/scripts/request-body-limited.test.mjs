import assert from "node:assert/strict";
import test from "node:test";
import { readJsonBodyLimited } from "../lib/read-json-body-limited.ts";

test("bounded JSON reader parses valid request bodies within the limit", async () => {
    const request = new Request("https://api.example.test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "member@example.test" }),
    });

    assert.deepEqual(await readJsonBodyLimited(request, 128), {
        kind: "ok",
        value: { email: "member@example.test" },
    });
});

test("bounded JSON reader rejects oversized streamed bodies without Content-Length", async () => {
    const payload = new TextEncoder().encode('{"data":"123456789"}');
    const request = new Request("https://api.example.test", {
        method: "POST",
        body: new ReadableStream({
            start(controller) {
                controller.enqueue(payload.slice(0, 8));
                controller.enqueue(payload.slice(8));
                controller.close();
            },
        }),
        duplex: "half",
    });

    assert.deepEqual(await readJsonBodyLimited(request, 16), { kind: "too_large" });
});

test("bounded JSON reader rejects declared oversized bodies before reading", async () => {
    const request = new Request("https://api.example.test", {
        method: "POST",
        headers: { "content-length": "100" },
        body: "{}",
    });

    assert.deepEqual(await readJsonBodyLimited(request, 16), { kind: "too_large" });
});

test("bounded JSON reader rejects malformed JSON and empty bodies", async () => {
    const malformed = new Request("https://api.example.test", {
        method: "POST",
        body: "{",
    });
    const empty = new Request("https://api.example.test", { method: "POST" });

    assert.deepEqual(await readJsonBodyLimited(malformed, 16), { kind: "invalid" });
    assert.deepEqual(await readJsonBodyLimited(empty, 16), { kind: "invalid" });
});
