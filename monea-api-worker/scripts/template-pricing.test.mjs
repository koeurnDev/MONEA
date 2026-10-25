import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    DEFAULT_TEMPLATE_PRICING,
    normalizeTemplatePricing,
    validateTemplatePricing,
} from "../lib/template-pricing.ts";

test("M2 is the only default free template", () => {
    assert.equal(DEFAULT_TEMPLATE_PRICING["modern-minimal"].price, 0);
    assert.equal(DEFAULT_TEMPLATE_PRICING["modern-minimal"].isFree, true);
    assert.equal(DEFAULT_TEMPLATE_PRICING["khmer-legacy"].price, 25);
    assert.equal(DEFAULT_TEMPLATE_PRICING["khmer-legacy"].isFree, false);
});

test("keeps the Admin-configured M1 price while M2 remains free", () => {
    for (const adminPrice of [15, 25, 39]) {
        const pricing = normalizeTemplatePricing({
            "khmer-legacy": { price: adminPrice, isFree: false, currency: "USD" },
            "modern-minimal": { price: 0, isFree: true, currency: "USD" },
        });

        assert.equal(pricing?.["khmer-legacy"].price, adminPrice);
        assert.equal(pricing?.["khmer-legacy"].isFree, false);
        assert.equal(pricing?.["modern-minimal"].price, 0);
        assert.equal(pricing?.["modern-minimal"].isFree, true);
    }
});

test("new wedding records default to the free M2 template", () => {
    const weddingRouter = readFileSync(new URL("../routers/wedding.ts", import.meta.url), "utf8");

    assert.match(weddingRouter, /templateId \|\| \(!wedding \? "modern-minimal" : undefined\)/);
    assert.match(weddingRouter, /templateId: templateId \|\| "modern-minimal"/);
});

test("normalizes legacy amount fields into the pricing contract used by the app", () => {
    const pricing = normalizeTemplatePricing({
        "nea-m05": { amount: 39, currency: "KHR", originalAmount: 50 },
        "khmer-legacy": { amount: 15, currency: "USD" },
        "modern-minimal": { amount: 0, currency: "USD" },
    });

    assert.equal(pricing?.["nea-m05"].price, 39);
    assert.equal(pricing?.["nea-m05"].originalPrice, 50);
    assert.equal(pricing?.["nea-m05"].onSale, true);
    assert.equal(pricing?.["nea-m05"].currency, "USD");
    assert.equal(pricing?.["nea-m05"].name, DEFAULT_TEMPLATE_PRICING["nea-m05"].name);
    assert.equal(pricing?.["khmer-legacy"].price, 15);
    assert.equal(pricing?.["khmer-legacy"].isFree, false);
    assert.equal(pricing?.["modern-minimal"].price, 0);
    assert.equal(pricing?.["modern-minimal"].isFree, true);
});

test("accepts template prices only in USD", () => {
    const usdPricing = {
        ...DEFAULT_TEMPLATE_PRICING,
        "nea-m05": { ...DEFAULT_TEMPLATE_PRICING["nea-m05"], price: 39, currency: "USD" },
    };
    const khrPricing = {
        ...usdPricing,
        "nea-m05": { ...usdPricing["nea-m05"], currency: "KHR" },
    };

    assert.equal(validateTemplatePricing(usdPricing), true);
    assert.equal(validateTemplatePricing(khrPricing), false);
});

test("preserves normalized pricing values and rejects entries without valid prices", () => {
    const pricing = normalizeTemplatePricing(JSON.stringify({
        "garden-editorial": {
            name: "Garden Editorial",
            price: 15,
            currency: "USD",
            description: "Editorial style",
            eventTypes: ["wedding"],
        },
        invalid: { amount: "not-a-price" },
    }));

    assert.equal(pricing?.["garden-editorial"].price, 15);
    assert.deepEqual(pricing?.["garden-editorial"].eventTypes, ["wedding"]);
    assert.equal(Object.hasOwn(pricing || {}, "invalid"), false);
    assert.equal(normalizeTemplatePricing({ invalid: { price: Number.NaN } }), null);
});
