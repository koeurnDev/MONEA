import assert from "node:assert/strict";
import test from "node:test";
import {
    normalizeWeddingForTemplate,
    isSectionVisible,
} from "../src/components/templates/shared/template-settings.ts";
import {
    TEMPLATE_CATALOG,
    TEMPLATE_DEFINITIONS,
    TEMPLATE_REGISTRY,
    getTemplatesForEventType,
} from "../src/components/templates/template-config.ts";
import {
    TEMPLATE_AVAILABILITY_DEFAULTS,
    TEMPLATE_METADATA_DEFAULTS,
} from "../../monea-api-worker/lib/template-availability.ts";

const createWedding = (themeSettings = {}) => ({
    id: "template-contract-test",
    groomName: "A",
    brideName: "B",
    date: "2026-01-01",
    location: null,
    activities: undefined,
    galleryItems: undefined,
    themeSettings,
});

test("normalizes legacy visibility and schedule title keys", () => {
    const { wedding, config } = normalizeWeddingForTemplate(createWedding({
        visibility: { showSchedule: false },
        customLabels: { schedule_title: "Legacy schedule title" },
    }));

    assert.equal(config.visibility.showTimeline, false);
    assert.equal(config.labels.scheduleTitle, "Legacy schedule title");
    assert.equal(isSectionVisible(config, "timeline"), false);
    assert.equal(wedding.themeSettings?.visibility?.showSchedule, undefined);
    assert.equal(wedding.themeSettings?.customLabels?.schedule_title, undefined);
    assert.equal(isSectionVisible(config, "guestbook"), true);
});

test("canonical keys take precedence and missing content is normalized", () => {
    const { wedding, config } = normalizeWeddingForTemplate(createWedding({
        visibility: { showTimeline: true, showSchedule: false },
        customLabels: {
            scheduleTitle: "Current title",
            schedule_title: "Legacy title",
        },
    }));

    assert.equal(config.visibility.showTimeline, true);
    assert.equal(config.labels.scheduleTitle, "Current title");
    assert.deepEqual(wedding.activities, []);
    assert.deepEqual(wedding.galleryItems, []);
    assert.equal(isSectionVisible(config, "gallery"), true);
    assert.equal(isSectionVisible(config, "guestbook"), true);
    const { config: hiddenGuestbookConfig } = normalizeWeddingForTemplate(createWedding({
        visibility: { showGuestbook: false },
    }));
    assert.equal(isSectionVisible(hiddenGuestbookConfig, "guestbook"), false);
});

test("registry and selectable catalog are derived from the same definitions", () => {
    assert.equal(Object.keys(TEMPLATE_DEFINITIONS).length, 7);
    assert.equal(Object.keys(TEMPLATE_REGISTRY).length, 7);
    assert.equal(TEMPLATE_CATALOG.length, 7);
    assert.ok(TEMPLATE_CATALOG.every(({ id }) => TEMPLATE_REGISTRY[id]));
    assert.equal(TEMPLATE_DEFINITIONS["emerald-garden"].selectable, true);
    assert.equal(TEMPLATE_DEFINITIONS["anniversary-elegant"].selectable, true);
    for (const [id, definition] of Object.entries(TEMPLATE_DEFINITIONS)) {
        assert.equal(definition.id, id);
        assert.deepEqual(definition.visibilityControls, ["story", "gallery", "timeline", "guestbook"]);
    }
});

test("runtime availability can activate registered templates outside the static catalog", () => {
    assert.deepEqual(
        getTemplatesForEventType("wedding", new Set(["emerald-garden"])).map(({ id }) => id),
        ["emerald-garden"],
    );
    assert.deepEqual(getTemplatesForEventType("wedding", new Set()), []);
    assert.ok(getTemplatesForEventType("anniversary", new Set(["anniversary-elegant"]))
        .some(({ id }) => id === "anniversary-elegant"));
});

test("frontend registry IDs stay aligned with API availability defaults", () => {
    assert.deepEqual(
        Object.keys(TEMPLATE_AVAILABILITY_DEFAULTS).sort(),
        Object.keys(TEMPLATE_DEFINITIONS).sort(),
    );
    assert.deepEqual(
        Object.entries(TEMPLATE_AVAILABILITY_DEFAULTS)
            .filter(([, enabled]) => enabled)
            .map(([id]) => id)
            .sort(),
        TEMPLATE_CATALOG.map(({ id }) => id).sort(),
    );
    for (const [id, definition] of Object.entries(TEMPLATE_DEFINITIONS)) {
        assert.equal(TEMPLATE_METADATA_DEFAULTS[id].title, definition.title);
        assert.equal(TEMPLATE_METADATA_DEFAULTS[id].description, definition.description);
        assert.equal(TEMPLATE_METADATA_DEFAULTS[id].image, definition.image);
        assert.equal(TEMPLATE_METADATA_DEFAULTS[id].eventType, definition.eventType);
    }
});

test("all template story sections render the configured story image collection", async () => {
    const { readFile } = await import("node:fs/promises");
    const storyTemplates = [
        "../src/components/templates/BlossomRomance.tsx",
        "../src/components/templates/EmeraldGarden.tsx",
        "../src/components/templates/FortuneHarmony.tsx",
        "../src/components/templates/NeaM05Sections.tsx",
        "../src/components/templates/anniversary-elegant/AnniversaryStory.tsx",
        "../src/components/templates/khmer-legacy/LoveStorySection.tsx",
        "../src/components/templates/modern-minimal/LoveStorySection.tsx",
    ];

    for (const templatePath of storyTemplates) {
        const source = await readFile(new URL(templatePath, import.meta.url), "utf8");
        assert.match(source, /\.map\(/, `${templatePath} should render each story image`);
        assert.match(source, /storyImageCaptions/, `${templatePath} should render its image caption`);
    }
});
