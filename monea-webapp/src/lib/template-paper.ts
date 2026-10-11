export const TEMPLATE_PAPER_TEXTURES = [
    {
        id: "cream",
        label: "ក្រដាសក្រែម",
        image: "/khmer-invite-starter-kit/textures/paper-cream.webp",
    },
    {
        id: "linen",
        label: "ក្រដាសសរសៃ",
        image: "/khmer-invite-starter-kit/textures/paper-lining.webp",
    },
    {
        id: "plain",
        label: "ក្រដាសរាប",
        image: "none",
    },
] as const;

export type TemplatePaperTextureId = typeof TEMPLATE_PAPER_TEXTURES[number]["id"];

export const getTemplateDefaultPaperColor = (templateId?: string | null): string => ({
    "khmer-legacy": "#FAF9F6",
    "modern-minimal": "#F8F8EC",
    "fortune-harmony": "#FDFBF7",
    "blossom-romance": "#F5EBE6",
    "anniversary-elegant": "#F1ECE5",
}[templateId || ""] || "#F5F0E5");
