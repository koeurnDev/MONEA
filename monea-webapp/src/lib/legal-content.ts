export type LegalDocument = {
    title: string;
    lastUpdated: string;
    body: string;
};

export type LegalContent = {
    privacy: Record<"km" | "en", LegalDocument>;
    terms: Record<"km" | "en", LegalDocument>;
};

type TranslationSection = {
    title?: unknown;
    [key: string]: unknown;
};

export function createLegalDocument(source: unknown): LegalDocument {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
        throw new Error("Legal translation content is invalid");
    }

    const data = source as Record<string, unknown>;
    const sections = Object.entries(data)
        .filter(([key, value]) => /^s\d+$/.test(key) && !!value && typeof value === "object" && !Array.isArray(value))
        .sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)));
    const blocks: string[] = [];

    for (const [, rawSection] of sections) {
        const section = rawSection as TranslationSection;
        if (typeof section.title === "string" && section.title.trim()) {
            blocks.push(`## ${section.title.trim()}`);
        }

        for (const [key, value] of Object.entries(section)) {
            if (key === "title") continue;
            if (typeof value === "string" && value.trim()) {
                blocks.push(value.trim());
            } else if (Array.isArray(value)) {
                const items = value.filter((item): item is string => typeof item === "string" && !!item.trim());
                if (items.length) blocks.push(items.map((item) => `- ${item.trim()}`).join("\n"));
            }
        }
    }

    if (typeof data.title !== "string" || !data.title.trim() || typeof data.lastUpdated !== "string") {
        throw new Error("Legal translation is missing its title or last-updated label");
    }

    return {
        title: data.title,
        lastUpdated: data.lastUpdated,
        body: blocks.join("\n\n"),
    };
}

export function isLegalDocument(value: unknown): value is LegalDocument {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const document = value as Record<string, unknown>;
    return typeof document.title === "string"
        && typeof document.lastUpdated === "string"
        && typeof document.body === "string";
}

export function isLegalContent(value: unknown): value is LegalContent {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const content = value as Record<string, unknown>;
    const hasLanguages = (document: unknown) => {
        if (!document || typeof document !== "object" || Array.isArray(document)) return false;
        const localized = document as Record<string, unknown>;
        return isLegalDocument(localized.km) && isLegalDocument(localized.en);
    };
    return hasLanguages(content.privacy) && hasLanguages(content.terms);
}

export function parseLegalBody(body: string) {
    return body.split(/\r?\n\s*\r?\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            if (block.startsWith("## ")) {
                return { type: "heading" as const, text: block.slice(3).trim() };
            }

            const lines = block.split(/\r?\n/);
            if (lines.every((line) => line.trimStart().startsWith("- "))) {
                return {
                    type: "list" as const,
                    items: lines.map((line) => line.trimStart().slice(2)),
                };
            }

            return { type: "paragraph" as const, text: block };
        });
}
