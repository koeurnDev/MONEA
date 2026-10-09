export const NEA_M05_FONT_OPTIONS = [
    { id: "moul", name: "Moul", family: "Moul", stack: "'Moul', serif" },
    { id: "moulpali", name: "Moulpali", family: "Moulpali", stack: "'Moulpali', serif" },
    { id: "dangrek", name: "Dangrek", family: "Dangrek", stack: "'Dangrek', sans-serif" },
    { id: "koulen", name: "Koulen", family: "Koulen", stack: "'Koulen', sans-serif" },
    { id: "battambang", name: "Battambang", family: "Battambang", stack: "'Battambang', sans-serif" },
    { id: "fasthand", name: "Fasthand", family: "Fasthand", stack: "'Fasthand', cursive" },
    { id: "preahvihear", name: "Preahvihear", family: "Preahvihear", stack: "'Preahvihear', sans-serif" },
    { id: "chenla", name: "Chenla", family: "Chenla", stack: "'Chenla', sans-serif" },
    { id: "content", name: "Content", family: "Content", stack: "'Content', sans-serif" },
    { id: "noto-sans-khmer", name: "Noto Sans Khmer", family: "Noto Sans Khmer", stack: "'Noto Sans Khmer', sans-serif" },
    { id: "odor-mean-chey", name: "Odor Mean Chey", family: "Odor Mean Chey", stack: "'Odor Mean Chey', serif" },
    { id: "siemreap", name: "Siemreap", family: "Siemreap", stack: "'Siemreap', sans-serif" },
    { id: "noto-serif-khmer", name: "Noto Serif Khmer", family: "Noto Serif Khmer", stack: "'Noto Serif Khmer', serif" },
] as const;

export type NeaM05FontId = (typeof NEA_M05_FONT_OPTIONS)[number]["id"];

export function getNeaM05FontStack(fontId: string | undefined, fallback: NeaM05FontId) {
    return NEA_M05_FONT_OPTIONS.find((font) => font.id === fontId)?.stack
        || NEA_M05_FONT_OPTIONS.find((font) => font.id === fallback)!.stack;
}
