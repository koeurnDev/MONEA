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
import {
    getWeddingHeroImage,
    getWeddingPhotoAtSlot,
    getWeddingSectionPhoto,
    getWeddingPhotos,
} from "../src/components/templates/shared/weddingPhotos.ts";
import { getWeddingWithPhotoVisibility } from "../src/components/templates/photo-visibility.ts";
import { TEMPLATE_PAPER_TEXTURES } from "../src/lib/template-paper.ts";
import { createSerialTaskQueue } from "../src/lib/serial-task-queue.ts";
import { normalizeWeddingActivities } from "../src/lib/wedding-activities.ts";
import { DEFAULT_WEDDING } from "../src/data/wedding.ts";
import {
    DEFAULT_ENGAGEMENT_ACTIVITIES,
    DEFAULT_WEDDING_ACTIVITIES,
    getDefaultActivitiesForEventType,
    matchesDefaultActivities,
} from "../src/lib/wedding-activity-defaults.ts";
import {
    getGalleryCardClass,
    getGalleryContainerClass,
    getGalleryDisplayStyle,
    getGalleryImageClass,
} from "../src/components/templates/shared/gallery-layout.ts";
import { getWeddingPhotoSlotAspectRatio } from "../src/lib/wedding-photo-layout.ts";
import { getContrastingTextColor } from "../src/lib/color-contrast.ts";

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

test("template data collapses duplicate schedule activities but keeps distinct entries", () => {
    const repeatedActivity = {
        time: "០៧:០០ ព្រឹក",
        title: "ពិធីហែជំនូន",
        description: "ជួបជុំសាច់ញាតិ និងភ្ញៀវកិត្តិយស",
        icon: null,
        order: 0,
    };
    const { wedding } = normalizeWeddingForTemplate({
        ...createWedding(),
        activities: [
            repeatedActivity,
            { ...repeatedActivity, order: 1 },
            {
                time: "០៨:៣០ ព្រឹក",
                title: "ពិធីសំពះផ្ទឹម",
                description: "ពិធីសិរីសួស្តី",
                icon: null,
                order: 2,
            },
        ],
    });

    assert.deepEqual(wedding.activities, [
        repeatedActivity,
        {
            time: "០៨:៣០ ព្រឹក",
            title: "ពិធីសំពះផ្ទឹម",
            description: "ពិធីសិរីសួស្តី",
            icon: null,
            order: 2,
        },
    ]);
});

test("new wedding invitations start with an editable Khmer wedding programme", async () => {
    const expectedTitles = [
        "ពិធីហែជំនូន",
        "ពិធីសូត្រមន្ត",
        "ពិធីកាត់សក់",
        "ពិធីសំពះផ្ទឹម",
        "ពិធីបង្វិលពពិល",
        "ពិធីបាចផ្កាស្លា",
        "ពិធីចងដៃ",
        "ពិធីជប់លៀង",
    ];
    const { readFile } = await import("node:fs/promises");
    const editorHook = await readFile(
        new URL("../src/app/dashboard/design/hooks/useDesignWizard.ts", import.meta.url),
        "utf8",
    );

    assert.deepEqual(DEFAULT_WEDDING.activities.map(({ title }) => title), expectedTitles);
    assert.deepEqual(
        DEFAULT_WEDDING.activities.map(({ order }) => order),
        expectedTitles.map((_, index) => index),
    );
    assert.deepEqual(DEFAULT_WEDDING.activities, DEFAULT_WEDDING_ACTIVITIES);
    assert.match(editorHook, /activities: DEFAULT_WEDDING_ACTIVITIES\.map\(\(activity\) => \(\{ \.\.\.activity \}\)\)/);
    assert.match(editorHook, /activities: data\.activities,/);
});

test("engagement invitations get their own default programme without replacing edited schedules", async () => {
    const engagementTitles = [
        "ជួបជុំគ្រួសារ និងភ្ញៀវកិត្តិយស",
        "ពិធីសែនព្រេន",
        "ពិធីប្រគល់ចិញ្ចៀន និងជំនូន",
        "ពិធីជូនពរ និងថតរូបអនុស្សាវរីយ៍",
        "ពិសាអាហារថ្ងៃត្រង់",
    ];
    const { readFile } = await import("node:fs/promises");
    const editorHook = await readFile(
        new URL("../src/app/dashboard/design/hooks/useDesignWizard.ts", import.meta.url),
        "utf8",
    );

    assert.deepEqual(
        getDefaultActivitiesForEventType("anniversary").map(({ title }) => title),
        engagementTitles,
    );
    assert.deepEqual(
        DEFAULT_ENGAGEMENT_ACTIVITIES.map(({ order }) => order),
        engagementTitles.map((_, index) => index),
    );
    assert.equal(matchesDefaultActivities(DEFAULT_WEDDING_ACTIVITIES, DEFAULT_WEDDING_ACTIVITIES), true);
    assert.equal(matchesDefaultActivities([], DEFAULT_WEDDING_ACTIVITIES), false);
    assert.equal(
        matchesDefaultActivities(
            [{ ...DEFAULT_WEDDING_ACTIVITIES[0], title: "កម្មវិធីផ្ទាល់ខ្លួន" }],
            DEFAULT_WEDDING_ACTIVITIES,
        ),
        false,
    );
    assert.match(editorHook, /matchesDefaultActivities\(prev\.activities, DEFAULT_WEDDING_ACTIVITIES\)/);
    assert.match(editorHook, /matchesDefaultActivities\(prev\.activities, previousDefaults\)/);
    assert.match(editorHook, /getDefaultActivitiesForEventType\(normalizedType\)\.map\(\(activity\) => \(\{ \.\.\.activity \}\)\)/);
});

test("editor activity normalization removes repeated and blank entries while keeping distinct activities", async () => {
    const repeatedActivity = {
        time: " ០៧:០០   ព្រឹក ",
        title: " ពិធីហែជំនូន ",
        description: "ជួបជុំសាច់ញាតិ",
        icon: null,
        order: 0,
    };
    const activities = normalizeWeddingActivities([
        repeatedActivity,
        { ...repeatedActivity, time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន", order: 1 },
        { time: "", title: "", description: "", order: 2 },
        { time: "", title: "", description: "", order: 3 },
        { time: "០៨:៣០ ព្រឹក", title: "ពិធីសំពះផ្ទឹម", description: "ចងដៃ", order: 4 },
    ]);
    const { readFile } = await import("node:fs/promises");
    const editorHook = await readFile(
        new URL("../src/app/dashboard/design/hooks/useDesignWizard.ts", import.meta.url),
        "utf8",
    );

    assert.equal(activities.length, 2);
    assert.equal(activities[0].order, 0);
    assert.equal(activities[1].title, "ពិធីសំពះផ្ទឹម");
    assert.match(editorHook, /activities: normalizeWeddingActivities\(savedActivities\)/);
    assert.match(editorHook, /activities: savedActivities,\s*\}\);/);
    assert.match(editorHook, /const timer = setTimeout\(\(\) => \{\s*saveChanges\(wedding, \{ silent: true \}\);/);

    const repeatedDefaults = Array.from({ length: 45 }, (_, index) => ({
        ...DEFAULT_WEDDING.activities[index % DEFAULT_WEDDING.activities.length],
        order: index,
    }));
    assert.deepEqual(
        normalizeWeddingActivities(repeatedDefaults).map(({ title }) => title),
        DEFAULT_WEDDING.activities.map(({ title }) => title),
    );
});

test("paper texture choices use only bundled texture assets", () => {
    assert.deepEqual(TEMPLATE_PAPER_TEXTURES.map(({ id }) => id), ["cream", "linen", "plain"]);
    assert.ok(TEMPLATE_PAPER_TEXTURES.every(({ image }) => (
        image === "none" || image.startsWith("/khmer-invite-starter-kit/textures/")
    )));
});

test("template palette preserves text colors and template backgrounds", async () => {
    const { readFile } = await import("node:fs/promises");
    const styles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
    const palette = await readFile(new URL("../src/lib/template-color-palette.ts", import.meta.url), "utf8");

    assert.match(palette, /themeSettings\?\.primaryColor \|\| preset\?\.accent \|\| defaultPrimary/);
    assert.match(palette, /"--monea-palette-on-primary": getContrastingTextColor\(primary\)/);
    assert.match(palette, /preset\?\.foil \|\| `color-mix\(in srgb, \$\{primary\} 35%, white\)`/);
    assert.match(styles, /background-color: var\(--monea-palette-primary\) !important/);
    assert.match(styles, /color: var\(--monea-palette-on-primary\) !important/);
    assert.doesNotMatch(styles, /\.monea-full-palette \[class\*="text-/);
    assert.doesNotMatch(styles, /\.monea-full-palette \[class\*="bg-\[#/);
});

test("standalone template previews render the requested template and event type", async () => {
    const { readFile } = await import("node:fs/promises");
    const previewPage = await readFile(new URL("../src/app/preview/page.tsx", import.meta.url), "utf8");

    assert.match(previewPage, /templateId: templateIdParam/);
    assert.match(previewPage, /templateIdParam === "anniversary-elegant"\s*\?\s*"anniversary"/);
});

test("Fortune Harmony countdown keeps its event date stable across timer updates", async () => {
    const { readFile } = await import("node:fs/promises");
    const hero = await readFile(
        new URL("../src/components/templates/fortune-harmony/HeroSection.tsx", import.meta.url),
        "utf8",
    );

    assert.match(hero, /useMemo\(\s*\(\) => wedding\.date \? new Date\(wedding\.date\) : new Date\(\),\s*\[wedding\.date\],?\s*\)/);
    assert.match(hero, /}, \[eventDate\]\)/);
});

test("template cover and hero headings are exposed consistently to assistive technology", async () => {
    const { readFile } = await import("node:fs/promises");
    const fortuneHero = await readFile(
        new URL("../src/components/templates/fortune-harmony/HeroSection.tsx", import.meta.url),
        "utf8",
    );
    const fortuneEnvelope = await readFile(
        new URL("../src/components/templates/fortune-harmony/EntranceEnvelope.tsx", import.meta.url),
        "utf8",
    );
    const anniversaryHero = await readFile(
        new URL("../src/components/templates/anniversary-elegant/AnniversaryHero.tsx", import.meta.url),
        "utf8",
    );
    const anniversaryTemplate = await readFile(
        new URL("../src/components/templates/AnniversaryElegant.tsx", import.meta.url),
        "utf8",
    );
    const neaTemplate = await readFile(
        new URL("../src/components/templates/NeaM05.tsx", import.meta.url),
        "utf8",
    );
    const previewPage = await readFile(
        new URL("../src/app/preview/page.tsx", import.meta.url),
        "utf8",
    );
    const heroPaths = [
        "../src/components/templates/khmer-legacy/HeroSection.tsx",
        "../src/components/templates/modern-minimal/HeroSection.tsx",
        "../src/components/templates/blossom-romance/HeroSection.tsx",
        "../src/components/templates/emerald-garden/HeroSection.tsx",
    ];
    const coupleHeroes = await Promise.all(heroPaths.map((path) =>
        readFile(new URL(path, import.meta.url), "utf8"),
    ));

    assert.equal([...fortuneHero.matchAll(/<h1\b/g)].length, 1);
    assert.doesNotMatch(fortuneEnvelope, /<h1\b/);
    assert.equal([...anniversaryHero.matchAll(/<h1\b/g)].length, 1);
    assert.match(anniversaryHero, /aria-label=\{`\$\{groomName\} និង \$\{brideName\}`\}/);
    assert.match(anniversaryTemplate, /<h1 className="font-khmer-moul text-base leading-relaxed text-\[#F3E8D0\] drop-shadow-/);
    assert.match(neaTemplate, /role="heading"\s+aria-level=\{1\}/);
    for (const hero of coupleHeroes) {
        assert.equal([...hero.matchAll(/<h1\b/g)].length, 1);
        assert.match(hero, /aria-label=/);
        assert.match(hero, /aria-hidden="true"/);
    }
    assert.match(previewPage, /const ANNIVERSARY_PREVIEW_WEDDING: WeddingData/);
    assert.match(previewPage, /invitationTitle: "សិរីសួស្តី ពិធីភ្ជាប់ពាក្យ"/);
    assert.match(previewPage, /title: "ពិធីបំពាក់ចិញ្ចៀន"/);
});

test("M-07 envelope animates open and respects reduced-motion preferences", async () => {
    const { readFile } = await import("node:fs/promises");
    const anniversaryTemplate = await readFile(
        new URL("../src/components/templates/AnniversaryElegant.tsx", import.meta.url),
        "utf8",
    );

    assert.match(anniversaryTemplate, /useReducedMotion/);
    assert.match(anniversaryTemplate, /setIsOpening\(true\)/);
    assert.match(anniversaryTemplate, /window\.setTimeout\(\(\) => \{\s*setRevealed\(true\)/);
    assert.match(anniversaryTemplate, /animate=\{isOpening\s*\?\s*\{ y: -44, scale: 0\.42, rotate: 28, opacity: 0 \}/);
    assert.match(anniversaryTemplate, /animate=\{isOpening\s*\?\s*\{ y: -560, rotate: -7, opacity: 0 \}/);
    assert.match(anniversaryTemplate, /aspect-\[0\.7\] w-\[min\(70vw,280px\)\]/);
    assert.match(anniversaryTemplate, /សូមអញ្ជើញចូលរួមជាសាក្សី/);
    assert.match(anniversaryTemplate, /strokeDasharray="1 7"/);
    assert.match(anniversaryTemplate, /if \(shouldReduceMotion\) \{\s*setRevealed\(true\)/);
    assert.match(anniversaryTemplate, /const handleForceReveal = \(\) => \{/);
});

test("M-05 programme content grows with the page instead of clipping in a nested scroller", async () => {
    const { readFile } = await import("node:fs/promises");
    const sections = await readFile(
        new URL("../src/components/templates/NeaM05Sections.tsx", import.meta.url),
        "utf8",
    );
    const programmeList = sections.match(/className="([^"]*m05-programme-list[^"]*)"/)?.[1];

    assert.ok(programmeList, "M-05 programme list should be present");
    assert.doesNotMatch(programmeList, /max-h-|overflow-y-auto|overflow-hidden/);
    assert.match(programmeList, /md:pr-4/);
});

test("accent backgrounds select a foreground with readable contrast", () => {
    const contrastRatio = (foreground, background) => {
        const luminance = (color) => {
            const channels = color.match(/[a-f\d]{2}/gi).map((channel) => {
                const value = Number.parseInt(channel, 16) / 255;
                return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
        return (values[0] + 0.05) / (values[1] + 0.05);
    };

    for (const accent of ["#4a543c", "#b18d55", "#2468ac", "#808080", "#ffffff", "#000000"]) {
        const foreground = getContrastingTextColor(accent);
        assert.ok(contrastRatio(foreground, accent) >= 4.5, `${foreground} is not readable on ${accent}`);
    }
    assert.equal(getContrastingTextColor("#ffffff"), "#000000");
    assert.equal(getContrastingTextColor("#000000"), "#ffffff");
});

test("wedding photo slot crop ratios match the labels shown in the editor", () => {
    assert.equal(getWeddingPhotoSlotAspectRatio(0), 3 / 4);
    assert.equal(getWeddingPhotoSlotAspectRatio(1), 16 / 9);
    assert.equal(getWeddingPhotoSlotAspectRatio(2), 3 / 4);
    assert.equal(getWeddingPhotoSlotAspectRatio(3), 3 / 4);
    assert.equal(getWeddingPhotoSlotAspectRatio(4), 3 / 4);
    assert.equal(getWeddingPhotoSlotAspectRatio(5), 16 / 9);
    assert.equal(getWeddingPhotoSlotAspectRatio(6), 16 / 9);
    assert.equal(getWeddingPhotoSlotAspectRatio(9), 3 / 4);
    assert.equal(getWeddingPhotoSlotAspectRatio(10), 3 / 4);
});

test("main invitation photos keep their configured slot when other slots are empty", () => {
    const wedding = {
        ...createWedding(),
        galleryItems: [
            { url: "https://cdn.example/cover.jpg", type: "IMAGE" },
            { url: "", type: "IMAGE" },
            { url: "https://cdn.example/location.jpg", publicId: "location", type: "IMAGE" },
            { url: "https://cdn.example/gift.jpg", publicId: "gift", type: "IMAGE" },
        ],
    };

    assert.equal(getWeddingPhotoAtSlot(wedding, 2)?.url, "https://cdn.example/location.jpg");
    assert.equal(getWeddingPhotoAtSlot(wedding, 3)?.url, "https://cdn.example/gift.jpg");
    assert.equal(getWeddingHeroImage(wedding), "https://cdn.example/cover.jpg");
    assert.deepEqual(getWeddingPhotos(wedding).map(({ url }) => url), [
        "https://cdn.example/cover.jpg",
        "https://cdn.example/location.jpg",
        "https://cdn.example/gift.jpg",
    ]);
});

test("all uploaded photos remain available when some gallery entries lack a public ID", () => {
    const identifiedPhoto = {
        url: "https://cdn.example/identified.jpg",
        publicId: "identified",
        type: "IMAGE",
    };
    const legacyPhoto = {
        url: "https://cdn.example/legacy.jpg",
        type: "IMAGE",
    };
    const wedding = {
        ...createWedding(),
        galleryItems: [identifiedPhoto, legacyPhoto],
    };

    assert.deepEqual(getWeddingPhotos(wedding), [identifiedPhoto, legacyPhoto]);
});

test("main couple photo fills optional template photo slots but respects hidden slots", () => {
    const wedding = {
        ...createWedding(),
        galleryItems: [
            { url: "https://cdn.example/cover.jpg", type: "IMAGE" },
            { url: "https://cdn.example/couple.jpg", type: "IMAGE" },
        ],
    };

    assert.equal(getWeddingSectionPhoto(wedding, 2)?.url, "https://cdn.example/couple.jpg");
    assert.equal(getWeddingSectionPhoto(wedding, 9)?.url, "https://cdn.example/couple.jpg");
    assert.equal(getWeddingSectionPhoto(wedding, 10)?.url, "https://cdn.example/couple.jpg");
    assert.equal(getWeddingSectionPhoto(wedding, 0)?.url, "https://cdn.example/cover.jpg");
    assert.equal(getWeddingSectionPhoto({
        ...wedding,
        themeSettings: { hiddenPhotoSlots: [2] },
    }, 2), undefined);
    assert.equal(getWeddingSectionPhoto({
        ...wedding,
        themeSettings: { hiddenPhotoSlots: [1] },
    }, 2)?.url, "https://cdn.example/cover.jpg");
});

test("every template keeps uploaded photos connected to its photo display", async () => {
    const { readFile } = await import("node:fs/promises");
    const templateRoot = new URL("../src/components/templates/", import.meta.url);
    const [blossom, emerald, fortune, modern, anniversary, nea, khmerHook, khmerTemplate] = await Promise.all([
        readFile(new URL("blossom-romance/GallerySection.tsx", templateRoot), "utf8"),
        readFile(new URL("emerald-garden/GallerySection.tsx", templateRoot), "utf8"),
        readFile(new URL("fortune-harmony/GallerySection.tsx", templateRoot), "utf8"),
        readFile(new URL("modern-minimal/GallerySection.tsx", templateRoot), "utf8"),
        readFile(new URL("anniversary-elegant/AnniversaryGallery.tsx", templateRoot), "utf8"),
        readFile(new URL("NeaM05Sections.tsx", templateRoot), "utf8"),
        readFile(new URL("khmer-legacy/useKhmerLegacy.ts", templateRoot), "utf8"),
        readFile(new URL("KhmerLegacy.tsx", templateRoot), "utf8"),
    ]);

    for (const templateGallery of [blossom, emerald, fortune, modern, anniversary, nea]) {
        assert.match(templateGallery, /getWeddingPhotos\(wedding\)/);
    }
    assert.match(khmerHook, /wedding\?\.galleryItems\s*\|\|\s*\[\]/);
    assert.match(khmerTemplate, /<DynamicGallery[\s\S]*?galleryImages=\{galleryImages\}/);
});

test("gallery display choices map to distinct invitation layouts", () => {
    assert.equal(getGalleryDisplayStyle("unknown"), "masonry");
    assert.match(getGalleryContainerClass("masonry"), /grid-cols-2/);
    assert.match(getGalleryContainerClass("slider"), /snap-x.*overflow-x-auto/);
    assert.match(getGalleryContainerClass("polaroid"), /grid-cols-2/);
    assert.match(getGalleryCardClass("slider", 0), /snap-center/);
    assert.match(getGalleryCardClass("polaroid", 0), /pb-8/);
    assert.match(getGalleryImageClass("polaroid"), /absolute left-2 right-2 top-2 bottom-8/);
    assert.match(getGalleryCardClass("masonry", 0), /row-span-2/);
});

test("gallery is visible separately from optional music and video controls", async () => {
    const { readFile } = await import("node:fs/promises");
    const step4 = await readFile(
        new URL("../src/app/dashboard/design/components/Step4Media.tsx", import.meta.url),
        "utf8",
    );

    assert.match(step4, /<GeneralGallerySection[\s\S]*?<button[\s\S]*?តន្ត្រី និងវីដេអូ/);
    assert.match(step4, /\{showExtraMedia && <>\s*<AudioVideoSection/);
    assert.doesNotMatch(step4, /\{showExtraMedia && <>[\s\S]*?<GeneralGallerySection/);
});

test("photo slot cards stay readable and tappable on narrow screens", async () => {
    const { readFile } = await import("node:fs/promises");
    const slots = await readFile(
        new URL("../src/app/dashboard/design/components/sections/CategorizedSlots.tsx", import.meta.url),
        "utf8",
    );

    assert.match(slots, /grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2/);
    assert.match(slots, /slot\.locationHint/);
    assert.match(slots, /min-h-11 bg-black\/80/);
    assert.match(slots, /w-full h-36 sm:h-auto/);
    assert.doesNotMatch(slots, /description:|slot\.description|cat\.categoryDesc/);
    assert.match(slots, /const basicSlots = configuredSlots\.filter/);
    assert.match(slots, /aria-expanded=\{showAdvancedSlots\}/);
    assert.match(slots, /រូបតាមផ្នែកផ្សេងៗ/);
});

test("paper canvas sections reveal the selected texture under light surfaces", async () => {
    const { readFile } = await import("node:fs/promises");
    const styles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");

    assert.match(styles, /\.monea-paper-canvas section\[class\*="bg-white"\]/);
    assert.match(styles, /background-color: var\(--monea-paper-color[^;]*\) !important/);
    assert.match(styles, /background-image: var\(--monea-paper-texture[^;]*\) !important/);
    assert.match(styles, /background-blend-mode: multiply !important/);
});

test("paper settings reach full template canvases and the modern invitation letter", async () => {
    const { readFile } = await import("node:fs/promises");
    const [khmerLegacy, modernLetter, styles] = await Promise.all([
        readFile(new URL("../src/components/templates/KhmerLegacy.tsx", import.meta.url), "utf8"),
        readFile(new URL("../src/components/templates/modern-minimal/LetterSection.tsx", import.meta.url), "utf8"),
        readFile(new URL("../src/app/globals.css", import.meta.url), "utf8"),
    ]);

    assert.match(khmerLegacy, /monea-paper-canvas w-full min-h-screen relative/);
    assert.doesNotMatch(khmerLegacy, /className="w-full bg-white min-h-screen relative font-serif-elegant/);
    assert.match(modernLetter, /backgroundColor: "var\(--monea-paper-color/);
    assert.match(modernLetter, /backgroundImage: "var\(--monea-paper-texture/);
    assert.match(styles, /\.monea-paper-canvas section\[class\*="bg-\[#E"\]/);
    assert.match(styles, /\.monea-paper-canvas section\[class\*="bg-\[#e"\]/);
});

test("template picker keeps readable cards inside the narrow wizard panel", async () => {
    const { readFile } = await import("node:fs/promises");
    const picker = await readFile(new URL("../src/app/dashboard/design/components/Step1Template.tsx", import.meta.url), "utf8");

    assert.match(picker, /<div className="grid grid-cols-2 gap-3 sm:gap-4">/);
    assert.doesNotMatch(picker, /xl:grid-cols-4|sm:grid-cols-3/);
    assert.match(picker, /aspect-\[4\/5\] w-full/);
    assert.match(picker, /line-clamp-2 min-h-\[2\.5rem\]/);
});

test("design toolbar is translated and sharing waits for a successful save", async () => {
    const { readFile } = await import("node:fs/promises");
    const [page, khmer, english] = await Promise.all([
        readFile(new URL("../src/app/dashboard/design/page.tsx", import.meta.url), "utf8"),
        readFile(new URL("../src/i18n/km.json", import.meta.url), "utf8").then(JSON.parse),
        readFile(new URL("../src/i18n/en.json", import.meta.url), "utf8").then(JSON.parse),
    ]);
    const translatedKeys = [
        "previewSize", "moreActions", "openPreview", "help", "share",
        "saving", "unsaved", "saved", "shareTitle", "shareDescription",
        "copy", "copied", "copyError", "previewError", "shareViaTelegram",
    ];

    for (const locale of [khmer, english]) {
        for (const key of translatedKeys) {
            assert.equal(typeof locale.design.wizard[key], "string", `Missing design.wizard.${key}`);
        }
    }

    assert.match(page, /const openShareAfterSave = async \(\) => \{[\s\S]*?const saved = await saveChanges\(\);[\s\S]*?if \(saved\) \{\s*setCopyLinkError\(false\);\s*setIsShareModalOpen\(true\);/);
    assert.match(page, /aria-label=\{loading \? t\("design\.wizard\.saving"\) : isDirty \? t\("design\.wizard\.unsaved"\) : t\("design\.wizard\.saved"\)\}/);
});

test("mobile invitation preview exposes the save-before-share action", async () => {
    const { readFile } = await import("node:fs/promises");
    const [page, preview] = await Promise.all([
        readFile(new URL("../src/app/dashboard/design/page.tsx", import.meta.url), "utf8"),
        readFile(new URL("../src/app/dashboard/design/components/PreviewSync.tsx", import.meta.url), "utf8"),
    ]);

    assert.match(page, /onClick=\{\(\) => void openShareAfterSave\(\)\}[\s\S]*?t\("design\.wizard\.share"\)/);
    assert.match(page, /disabled=\{!mobilePreviewReady \|\| loading \|\| isMediaUploading \|\| galleryUploading\}/);
    assert.match(page, /onReadyChange=\{setMobilePreviewReady\}/);
    assert.match(preview, /onReadyChange\(true\)/);
    assert.match(preview, /onReadyChange\(false\)/);
    assert.match(page, /\{mounted && <ShareModal \/>}/);
    assert.match(page, /aria-label=\{t\("design\.wizard\.mobileEditor"\)\}/);
});

test("mobile done action saves successfully before leaving the editor", async () => {
    const { readFile } = await import("node:fs/promises");
    const page = await readFile(new URL("../src/app/dashboard/design/page.tsx", import.meta.url), "utf8");

    assert.match(page, /const finishEditing = async \(\) => \{[\s\S]*?if \(await saveChanges\(\)\) \{\s*navigate\("\/dashboard"\);/);
    assert.match(page, /onClick=\{\(\) => void finishEditing\(\)\}[\s\S]*?disabled=\{finishing \|\| loading \|\| isMediaUploading \|\| galleryUploading\}/);
    assert.match(page, /else \{\s*setFinishSaveError\(true\);\s*\}/);
    assert.match(page, /role="alert"[\s\S]*?t\("design\.wizard\.finishSaveError"\)/);
});

test("mobile editor back action saves dirty changes before leaving", async () => {
    const { readFile } = await import("node:fs/promises");
    const page = await readFile(new URL("../src/app/dashboard/design/page.tsx", import.meta.url), "utf8");

    assert.match(page, /const leaveEditor = async \(\) => \{[\s\S]*?if \(!isDirty \|\| await saveChanges\(\)\) \{\s*navigate\("\/dashboard"\);/);
    assert.match(page, /onClick=\{\(\) => void leaveEditor\(\)\}[\s\S]*?disabled=\{leaving \|\| loading \|\| isMediaUploading \|\| galleryUploading\}/);
});

test("save queue serializes requests and continues after a rejected request", async () => {
    const enqueue = createSerialTaskQueue();
    let releaseFirst;
    const firstGate = new Promise((resolve) => {
        releaseFirst = resolve;
    });
    const events = [];

    const first = enqueue(async () => {
        events.push("first-start");
        await firstGate;
        events.push("first-end");
        return "old";
    });
    const second = enqueue(async () => {
        events.push("second-start");
        throw new Error("simulated save failure");
    });
    const third = enqueue(async () => {
        events.push("third-start");
        return "latest";
    });

    await Promise.resolve();
    assert.deepEqual(events, ["first-start"]);
    releaseFirst();

    assert.equal(await first, "old");
    await assert.rejects(second, /simulated save failure/);
    assert.equal(await third, "latest");
    assert.deepEqual(events, [
        "first-start",
        "first-end",
        "second-start",
        "third-start",
    ]);
});

test("mobile share failures are visible and failed clipboard copies select the link", async () => {
    const { readFile } = await import("node:fs/promises");
    const [page, khmer, english] = await Promise.all([
        readFile(new URL("../src/app/dashboard/design/page.tsx", import.meta.url), "utf8"),
        readFile(new URL("../src/i18n/km.json", import.meta.url), "utf8").then(JSON.parse),
        readFile(new URL("../src/i18n/en.json", import.meta.url), "utf8").then(JSON.parse),
    ]);

    assert.match(page, /else \{\s*setShareSaveError\(true\);\s*\}/);
    assert.match(page, /role="alert"[\s\S]*?t\("design\.wizard\.shareSaveError"\)/);
    assert.match(page, /onClick=\{\(event\) => event\.currentTarget\.select\(\)\}/);
    assert.match(page, /shareLinkInputRef\.current\?\.focus\(\);[\s\S]*?shareLinkInputRef\.current\?\.select\(\);/);
    assert.match(page, /supportsNativeShare && \([\s\S]*?t\("design\.wizard\.shareViaDevice"\)/);
    assert.match(page, /await navigator\.share\(\{[\s\S]*?text: t\("design\.wizard\.nativeShareText"\),[\s\S]*?url: shareUrl/);
    assert.match(page, /new URL\("https:\/\/t\.me\/share\/url"\)/);
    assert.match(page, /searchParams\.set\("url", shareUrl\)/);
    assert.match(page, /t\("design\.wizard\.shareViaTelegram"\)/);
    assert.match(page, /max-h-\[calc\(100dvh-2rem\)\] overflow-y-auto/);
    assert.match(page, /w-\[min\(180px,55vw\)\]/);
    assert.match(page, /aria-modal="true"/);
    assert.match(page, /bottom-\[calc\(env\(safe-area-inset-bottom\)\+0\.75rem\)\]/);
    for (const locale of [khmer, english]) {
        assert.equal(typeof locale.design.wizard.shareSaveError, "string");
        assert.equal(typeof locale.design.wizard.shareLink, "string");
        assert.equal(typeof locale.design.wizard.shareViaDevice, "string");
        assert.equal(typeof locale.design.wizard.shareViaTelegram, "string");
        assert.equal(typeof locale.design.wizard.nativeShareText, "string");
        assert.equal(typeof locale.design.wizard.finishing, "string");
        assert.equal(typeof locale.design.wizard.finishSaveError, "string");
    }
});

test("shared guestbook uses translation keys from the invitation namespace", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(
        new URL("../src/components/templates/shared/GuestbookSection.tsx", import.meta.url),
        "utf8",
    );
    const translations = JSON.parse(await readFile(
        new URL("../src/i18n/km.json", import.meta.url),
        "utf8",
    ));

    for (const [, key] of source.matchAll(/t\("(invitation\.guestbook\.[^"]+)"/g)) {
        const value = key.split(".").reduce((current, part) => current?.[part], translations);
        assert.equal(typeof value, "string", `${key} should resolve to a Khmer translation`);
    }
    assert.doesNotMatch(source, /t\("(?:guestbook|template\.guestbook)\./);
    assert.match(source, /wedding\.id === "preview-default" \|\| wedding\.id === "approval-preview"/);
    assert.match(source, /const requestKey = wedding\.id && !isSamplePreview/);
    assert.match(source, /isSamplePreview \? \[\] : undefined/);
    assert.match(source, /isSamplePreview \? \([\s\S]*?previewOnly[\s\S]*?\) : \(/);
    for (const locale of [
        translations,
        JSON.parse(await readFile(new URL("../src/i18n/en.json", import.meta.url), "utf8")),
    ]) {
        assert.equal(typeof locale.invitation.guestbook.previewOnly, "string");
    }
});

test("gallery photo selection safely skips null and malformed entries", () => {
    const uploadedPhoto = {
        url: "https://example.com/photo.jpg",
        type: "IMAGE",
        publicId: "photo-1",
    };
    const wedding = {
        ...createWedding(),
        galleryItems: [null, { url: null, type: "IMAGE" }, uploadedPhoto],
    };

    assert.deepEqual(getWeddingPhotos(wedding), [uploadedPhoto]);
});

test("photo visibility safely skips null gallery entries", () => {
    const galleryItems = Array.from({ length: 11 }, (_, index) => ({
        url: `https://example.com/photo-${index}.jpg`,
        type: "IMAGE",
    }));
    galleryItems.push(null);

    const wedding = getWeddingWithPhotoVisibility({
        ...createWedding(),
        galleryItems,
    });

    assert.equal(wedding.galleryItems.length, 11);
});

test("legacy label keys normalize to labels rendered by the templates", () => {
    const { wedding } = normalizeWeddingForTemplate(createWedding({
        customLabels: {
            invite_title: "Legacy title",
            hero_subtitle: "Legacy subtitle",
            hero_button: "Legacy button",
            gallery_title: "Legacy gallery",
            invitationTitle: "Current title",
        },
    }));

    assert.equal(wedding.themeSettings?.customLabels?.invitationTitle, "Current title");
    assert.equal(wedding.themeSettings?.customLabels?.heroSubtitle, "Legacy subtitle");
    assert.equal(wedding.themeSettings?.customLabels?.heroButton, "Legacy button");
    assert.equal(wedding.themeSettings?.customLabels?.galleryTitle, "Legacy gallery");
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

test("Rose Garden, Emerald Garden, and Fortune Harmony show the cover or couple photo in the hero", async () => {
    const { readFile } = await import("node:fs/promises");
    const heroFiles = [
        "../src/components/templates/blossom-romance/HeroSection.tsx",
        "../src/components/templates/emerald-garden/HeroSection.tsx",
        "../src/components/templates/fortune-harmony/HeroSection.tsx",
    ];

    for (const file of heroFiles) {
        const source = await readFile(new URL(file, import.meta.url), "utf8");
        assert.match(source, /getWeddingSectionPhoto\(wedding, 0\)/, `${file} should select the cover or couple photo`);
        assert.match(source, /src=\{couplePhoto\}/, `${file} should render the selected image`);
    }
});

test("every template gallery and editor photo previews show a fallback when an image fails", async () => {
    const { readFile } = await import("node:fs/promises");
    const galleryFiles = [
        "../src/components/templates/khmer-legacy/GallerySection.tsx",
        "../src/components/templates/modern-minimal/GallerySection.tsx",
        "../src/components/templates/fortune-harmony/GallerySection.tsx",
        "../src/components/templates/blossom-romance/GallerySection.tsx",
        "../src/components/templates/emerald-garden/GallerySection.tsx",
        "../src/components/templates/anniversary-elegant/AnniversaryGallery.tsx",
        "../src/components/templates/NeaM05Sections.tsx",
        "../src/app/dashboard/design/components/sections/CategorizedSlots.tsx",
        "../src/app/dashboard/design/components/sections/GeneralGallerySection.tsx",
    ];

    for (const file of galleryFiles) {
        const source = await readFile(new URL(file, import.meta.url), "utf8");
        assert.match(source, /PhotoImage/, `${file} should use the shared image-load fallback`);
    }

    const photoImage = await readFile(
        new URL("../src/components/templates/shared/PhotoImage.tsx", import.meta.url),
        "utf8",
    );
    assert.match(photoImage, /onError=\{\(event\) => \{\s*setHasError\(true\)/);
    assert.match(photoImage, /មិនអាចបង្ហាញរូបនេះបាន/);
});

test("photo upload UI reports success and failure and retries only failed gallery uploads", async () => {
    const { readFile } = await import("node:fs/promises");
    const mediaStep = await readFile(
        new URL("../src/app/dashboard/design/components/Step4Media.tsx", import.meta.url),
        "utf8",
    );
    const galleryUpload = await readFile(
        new URL("../src/hooks/use-cloudinary.ts", import.meta.url),
        "utf8",
    );
    const gallerySection = await readFile(
        new URL("../src/app/dashboard/design/components/sections/GeneralGallerySection.tsx", import.meta.url),
        "utf8",
    );

    assert.match(mediaStep, /រូបបានបង្ហោះជោគជ័យ/);
    assert.match(mediaStep, /role="alert"/);
    assert.match(galleryUpload, /failedUploads\.push\(file\)/);
    assert.match(galleryUpload, /retryFailedUploads: \(\) => failedFiles\.length > 0/);
    assert.match(gallerySection, /សាកល្បងរូបដែលបរាជ័យម្ដងទៀត/);
});
