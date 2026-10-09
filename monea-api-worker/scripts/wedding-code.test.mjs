import assert from "node:assert/strict";
import test from "node:test";
import { generateWeddingCode } from "../lib/wedding-code.ts";

test("generates unique-format wedding codes", () => {
    const codes = Array.from({ length: 10_000 }, generateWeddingCode);

    assert.ok(codes.every((code) => /^MN-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{16}$/.test(code)));
    assert.equal(new Set(codes).size, codes.length);
});
