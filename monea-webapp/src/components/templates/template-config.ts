import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { TemplateProps, TemplateSection } from "./types";

export type TemplateEventType = "wedding" | "anniversary";

export interface TemplatePresentationMetadata {
    title: string;
    description: string;
    image: string;
    eventType: TemplateEventType | "both";
}

export interface TemplateConfig {
    code: string;
    id: string;
    title: string;
    description: string;
    eventType: TemplateEventType | "both";
    image: string;
    primaryColor: string;
    isFree: boolean;
    comingSoon: boolean;
    selectable: boolean;
    visibilityControls: readonly TemplateSection[];
    component: LazyExoticComponent<ComponentType<TemplateProps>>;
}

const STANDARD_VISIBILITY_CONTROLS = ["story", "gallery", "timeline", "guestbook"] as const satisfies readonly TemplateSection[];

export const TEMPLATE_DEFINITIONS = {
    "khmer-legacy": {
        code: "M-01",
        id: "khmer-legacy",
        title: "Khmer Legacy",
        description: "រចនាបែបប្រពៃណីខ្មែរ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        eventType: "both",
        image: "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg",
        primaryColor: "#E8AC00",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./KhmerLegacy")),
    },
    "modern-minimal": {
        code: "M-02",
        id: "modern-minimal",
        title: "ទំនើប សាមញ្ញ",
        description: "រចនាស្អាតសាមញ្ញ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        eventType: "both",
        image: "/images/bg_tunnel.webp",
        primaryColor: "#0A1226",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./ModernMinimal")),
    },
    "fortune-harmony": {
        code: "M-03",
        id: "fortune-harmony",
        title: "ប្រណីត - Fortune Harmony",
        description: "រចនាបែបប្រណីត សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        eventType: "both",
        image: "/assets/fortune-harmony/fortune-crimson-bg.jpg",
        primaryColor: "#D4AF37",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./FortuneHarmony")),
    },
    "blossom-romance": {
        code: "M-04",
        id: "blossom-romance",
        title: "Rose Garden",
        description: "រចនាបែបផ្កា ទន់ភ្លន់ និងរ៉ូម៉ង់ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        eventType: "both",
        image: "/assets/blossom-romance/blossom-arch-bg.jpg",
        primaryColor: "#B76572",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./BlossomRomance")),
    },
    "nea-m05": {
        code: "M-05",
        id: "nea-m05",
        title: "NEA - Olive & Gold",
        description: "រចនាបែបក្រដាសធៀបខ្មែរ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        eventType: "both",
        image: "/khmer-invite-starter-kit/elements/crest.svg",
        primaryColor: "#A27A43",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./NeaM05")),
    },
    "emerald-garden": {
        code: "M-06",
        id: "emerald-garden",
        title: "Emerald Garden",
        description: "រចនាបែបសួនបៃតង សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        eventType: "both",
        image: "/assets/emerald-garden/emerald-garden-bg.jpg",
        primaryColor: "#1B4332",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./EmeraldGarden")),
    },
    "anniversary-elegant": {
        code: "M-07",
        id: "anniversary-elegant",
        title: "Anniversary Elegant",
        description: "រចនាបែបឆើតឆាយសម្រាប់ពិធីភ្ជាប់ពាក្យ",
        eventType: "anniversary",
        image: "/assets/anniversary-elegant/anniversary-elegant-bg.webp",
        primaryColor: "#8B4B55",
        isFree: false,
        comingSoon: false,
        selectable: true,
        visibilityControls: STANDARD_VISIBILITY_CONTROLS,
        component: lazy(() => import("./AnniversaryElegant")),
    },
} satisfies Record<string, TemplateConfig>;

export const TEMPLATE_REGISTRY: Record<string, ComponentType<TemplateProps>> =
    Object.fromEntries(
        Object.values(TEMPLATE_DEFINITIONS).map(({ id, component }) => [id, component]),
    );

export const TEMPLATE_CATALOG: TemplateConfig[] = Object.values(TEMPLATE_DEFINITIONS)
    .filter((template) => template.selectable);

export const getTemplatesForEventType = (
    eventType: TemplateEventType,
    enabledTemplateIds?: ReadonlySet<string>,
) => {
    const templates = enabledTemplateIds
        ? Object.values(TEMPLATE_DEFINITIONS).filter((template) => enabledTemplateIds.has(template.id))
        : TEMPLATE_CATALOG;

    return templates.filter((template) =>
        template.eventType === eventType || template.eventType === "both",
    );
};

export const getTemplateConfig = (templateId?: string | null) =>
    templateId ? TEMPLATE_DEFINITIONS[templateId as keyof typeof TEMPLATE_DEFINITIONS] || null : null;

const TEMPLATE_IMPORTERS: Record<string, () => Promise<unknown>> = {
    "khmer-legacy": () => import("./KhmerLegacy"),
    "modern-minimal": () => import("./ModernMinimal"),
    "fortune-harmony": () => import("./FortuneHarmony"),
    "blossom-romance": () => import("./BlossomRomance"),
    "emerald-garden": () => import("./EmeraldGarden"),
    "nea-m05": () => import("./NeaM05"),
    "anniversary-elegant": () => import("./AnniversaryElegant"),
};

export function preloadTemplate(templateId?: string | null): void {
    if (!templateId) return;
    const importer = TEMPLATE_IMPORTERS[templateId];
    if (importer) {
        importer().catch(() => {});
    }
}
