import type { ComponentType } from "react";
import type { TemplateProps } from "./types";
import { TEMPLATE_DEFINITIONS, TEMPLATE_REGISTRY } from "./template-config";

export * from "./types";
export * from "./template-config";

export const getTemplateComponent = (templateId?: string | null): ComponentType<TemplateProps> => {
    const definition = templateId ? TEMPLATE_DEFINITIONS[templateId as keyof typeof TEMPLATE_DEFINITIONS] : undefined;
    if (definition) return definition.component;

    if (templateId) {
        console.warn(`[templates] Unknown template "${templateId}", using "blossom-romance".`);
    }
    return TEMPLATE_REGISTRY["blossom-romance"];
};
