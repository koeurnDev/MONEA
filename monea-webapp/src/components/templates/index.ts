import { lazy, ComponentType } from "react";
import { WeddingData, TemplateProps } from "./types";

export * from "./types";

/**
 * Dynamic Template Registry for MONEA.
 * Uses React.lazy for code splitting and scalable template registration.
 */
export const TEMPLATE_REGISTRY: Record<string, ComponentType<TemplateProps>> = {
    "khmer-legacy": lazy(() => import("./KhmerLegacy").then(m => ({ default: m.default || (m as any).KhmerLegacy }))),
    "modern-minimal": lazy(() => import("./ModernMinimal").then(m => ({ default: m.default || (m as any).ModernMinimal }))),
    "anniversary-elegant": lazy(() => import("./AnniversaryElegant").then(m => ({ default: m.default || (m as any).AnniversaryElegant }))),
    "blossom-romance": lazy(() => import("./BlossomRomance").then(m => ({ default: m.default || (m as any).BlossomRomance }))),
    "emerald-garden": lazy(() => import("./EmeraldGarden").then(m => ({ default: m.default || (m as any).EmeraldGarden }))),
    "fortune-harmony": lazy(() => import("./FortuneHarmony").then(m => ({ default: m.default || (m as any).FortuneHarmony }))),
};

/**
 * Helper to retrieve a template component safely with fallback to 'khmer-legacy'.
 */
export const getTemplateComponent = (templateId?: string | null): ComponentType<TemplateProps> => {
    if (templateId && TEMPLATE_REGISTRY[templateId]) {
        return TEMPLATE_REGISTRY[templateId];
    }
    return TEMPLATE_REGISTRY["khmer-legacy"];
};
