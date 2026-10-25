export const TEMPLATE_AVAILABILITY_DEFAULTS = {
    "khmer-legacy": true,
    "modern-minimal": true,
    "fortune-harmony": true,
    "blossom-romance": true,
    "nea-m05": true,
    "emerald-garden": true,
    "anniversary-elegant": true,
    "garden-editorial": true,
} as const;

export type TemplateId = keyof typeof TEMPLATE_AVAILABILITY_DEFAULTS;
export type TemplateAvailability = Record<TemplateId, boolean>;

export type TemplateEventType = "wedding" | "anniversary" | "both";

export interface TemplateMetadata {
    title: string;
    description: string;
    image: string;
    eventType: TemplateEventType;
}

export type TemplateMetadataMap = Record<TemplateId, TemplateMetadata>;

export const TEMPLATE_METADATA_DEFAULTS: TemplateMetadataMap = {
    "khmer-legacy": {
        title: "Khmer Legacy",
        description: "រចនាបែបប្រពៃណីខ្មែរ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        image: "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg",
        eventType: "both",
    },
    "modern-minimal": {
        title: "ទំនើប សាមញ្ញ",
        description: "រចនាស្អាតសាមញ្ញ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        image: "/images/bg_tunnel.webp",
        eventType: "both",
    },
    "fortune-harmony": {
        title: "ប្រណីត - Fortune Harmony",
        description: "រចនាបែបប្រណីត សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        image: "/assets/fortune-harmony/fortune-crimson-bg.jpg",
        eventType: "both",
    },
    "blossom-romance": {
        title: "Rose Garden",
        description: "រចនាបែបផ្កា ទន់ភ្លន់ និងរ៉ូម៉ង់ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        image: "/assets/blossom-romance/blossom-arch-bg.jpg",
        eventType: "both",
    },
    "nea-m05": {
        title: "NEA - Olive & Gold",
        description: "រចនាបែបក្រដាសធៀបខ្មែរ សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        image: "/khmer-invite-starter-kit/elements/crest.svg",
        eventType: "both",
    },
    "emerald-garden": {
        title: "Emerald Garden",
        description: "រចនាបែបសួនបៃតង សម្រាប់ពិធីមង្គលការ និងភ្ជាប់ពាក្យ",
        image: "/assets/emerald-garden/emerald-garden-bg.jpg",
        eventType: "both",
    },
    "anniversary-elegant": {
        title: "Anniversary Elegant",
        description: "រចនាបែបឆើតឆាយសម្រាប់ពិធីភ្ជាប់ពាក្យ",
        image: "/assets/anniversary-elegant/anniversary-elegant-bg.webp",
        eventType: "anniversary",
    },
    "garden-editorial": {
        title: "Palace Bloom",
        description: "រចនាបែបវិមានផ្កា ទន់ភ្លន់ និងប្រណីត ជាមួយពណ៌មាស",
        image: "/assets/blossom-romance/blossom-arch-bg.jpg",
        eventType: "wedding",
    },
};

export function normalizeTemplateAvailability(value: unknown): TemplateAvailability {
    const availability: TemplateAvailability = { ...TEMPLATE_AVAILABILITY_DEFAULTS };
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return availability;
    }

    for (const templateId of Object.keys(availability) as TemplateId[]) {
        const enabled = (value as Record<string, unknown>)[templateId];
        if (typeof enabled === "boolean") {
            availability[templateId] = enabled;
        }
    }

    return availability;
}

export function normalizeTemplateMetadata(value: unknown): TemplateMetadataMap {
    const metadata = structuredClone(TEMPLATE_METADATA_DEFAULTS);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return metadata;
    }

    const stored = value as Record<string, unknown>;
    for (const templateId of Object.keys(metadata) as TemplateId[]) {
        const entry = stored[templateId];
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            continue;
        }

        const candidate = entry as Record<string, unknown>;
        const current = metadata[templateId];
        if (typeof candidate.title === "string" && candidate.title.trim()) {
            current.title = candidate.title;
        }
        if (typeof candidate.description === "string") {
            current.description = candidate.description;
        }
        if (typeof candidate.image === "string" && candidate.image.trim()) {
            current.image = candidate.image;
        }
        if (
            candidate.eventType === "wedding"
            || candidate.eventType === "anniversary"
            || candidate.eventType === "both"
        ) {
            current.eventType = candidate.eventType;
        }
    }
    return metadata;
}

export function isTemplateEnabled(
    availability: TemplateAvailability,
    templateId: string,
): boolean {
    return Object.hasOwn(availability, templateId)
        && availability[templateId as TemplateId] === true;
}

export function isTemplateCompatible(
    metadata: TemplateMetadataMap,
    templateId: string,
    eventType: string | undefined,
): boolean {
    if (!isTemplateId(templateId)) return false;
    const supported = metadata[templateId].eventType;
    return supported === "both" || !eventType || supported === eventType;
}

export function isTemplateId(value: string): value is TemplateId {
    return Object.hasOwn(TEMPLATE_AVAILABILITY_DEFAULTS, value);
}
