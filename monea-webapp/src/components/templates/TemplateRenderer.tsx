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
    const isModernMinimal = templateId === "modern-minimal";
    const canvasWidthClass = isModernMinimal
        ? "max-w-[430px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-none"
        : "max-w-[430px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[540px]";

    return (
        <div className="template-responsive-canvas min-h-screen w-full min-w-0 bg-[#e8e8e8]">
            <div className={`mx-auto min-h-screen w-full min-w-0 bg-white shadow-2xl ${canvasWidthClass}`}>
                <Template
                    key={templateId || "blossom-romance"}
                    wedding={normalized.wedding}
                    config={normalized.config}
                    guestName={guestName}
                />
            </div>
        </div>
    );
}
