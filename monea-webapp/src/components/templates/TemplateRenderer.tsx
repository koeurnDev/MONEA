import { getTemplateComponent } from "./index";
import type { WeddingData } from "./types";
import { normalizeWeddingForTemplate } from "./shared/template-settings";

interface TemplateRendererProps {
    wedding: WeddingData;
    guestName?: string;
    templateId?: string | null;
}

export function TemplateRenderer({
    wedding,
    guestName,
    templateId = wedding.templateId,
}: TemplateRendererProps) {
    const normalized = normalizeWeddingForTemplate({
        ...wedding,
        templateId: templateId ?? wedding.templateId,
    });
    const Template = getTemplateComponent(templateId);

    return (
        <Template
            key={templateId || "blossom-romance"}
            wedding={normalized.wedding}
            config={normalized.config}
            guestName={guestName}
        />
    );
}
