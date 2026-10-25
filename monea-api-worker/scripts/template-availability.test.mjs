import assert from "node:assert/strict";
import test from "node:test";
import {
    isTemplateEnabled,
    isTemplateId,
    isTemplateCompatible,
    normalizeTemplateAvailability,
    normalizeTemplateMetadata,
    TEMPLATE_AVAILABILITY_DEFAULTS,
    TEMPLATE_METADATA_DEFAULTS,
} from "../lib/template-availability.ts";

test("template availability defaults enable the full selectable catalog", () => {
    assert.equal(Object.values(TEMPLATE_AVAILABILITY_DEFAULTS).filter(Boolean).length, 8);
    assert.equal(TEMPLATE_AVAILABILITY_DEFAULTS["emerald-garden"], true);
    assert.equal(TEMPLATE_AVAILABILITY_DEFAULTS["anniversary-elegant"], true);
    assert.equal(TEMPLATE_AVAILABILITY_DEFAULTS["garden-editorial"], true);
});

test("normalization preserves defaults for missing and malformed values", () => {
    assert.deepEqual(normalizeTemplateAvailability(null), TEMPLATE_AVAILABILITY_DEFAULTS);
    assert.deepEqual(normalizeTemplateAvailability(["bad"]), TEMPLATE_AVAILABILITY_DEFAULTS);
    assert.equal(normalizeTemplateAvailability({ "modern-minimal": false })["modern-minimal"], false);
    assert.equal(normalizeTemplateAvailability({ "modern-minimal": "false" })["modern-minimal"], true);
});

test("only known templates can be toggled and disabled templates are not enabled", () => {
    const availability = normalizeTemplateAvailability({ "nea-m05": false });
    assert.equal(isTemplateId("nea-m05"), true);
    assert.equal(isTemplateId("unknown"), false);
    assert.equal(isTemplateEnabled(availability, "nea-m05"), false);
    assert.equal(isTemplateEnabled(availability, "unknown"), false);
});

test("template metadata normalization keeps defaults and does not mutate them", () => {
    const metadata = normalizeTemplateMetadata({
        "modern-minimal": { title: "  My Template  ", eventType: "anniversary" },
        "nea-m05": { title: "" },
        "unknown-template": { title: "Unknown" },
    });

    assert.equal(metadata["modern-minimal"].title, "  My Template  ");
    assert.equal(metadata["modern-minimal"].eventType, "anniversary");
    assert.equal(metadata["modern-minimal"].image, TEMPLATE_METADATA_DEFAULTS["modern-minimal"].image);
    assert.equal(metadata["nea-m05"].title, TEMPLATE_METADATA_DEFAULTS["nea-m05"].title);
    assert.equal(metadata["garden-editorial"].image, TEMPLATE_METADATA_DEFAULTS["garden-editorial"].image);
    assert.equal(TEMPLATE_METADATA_DEFAULTS["modern-minimal"].title, "ទំនើប សាមញ្ញ");
});

test("template event compatibility follows the normalized event type", () => {
    const metadata = normalizeTemplateMetadata({
        "anniversary-elegant": { eventType: "anniversary" },
    });

    assert.equal(isTemplateCompatible(metadata, "anniversary-elegant", "anniversary"), true);
    assert.equal(isTemplateCompatible(metadata, "anniversary-elegant", "wedding"), false);
    assert.equal(isTemplateCompatible(metadata, "khmer-legacy", "anniversary"), true);
    assert.equal(isTemplateCompatible(metadata, "unknown", "wedding"), false);
});
