export const PHONE_FRAME_COLORS = ["black", "white", "natural", "desert"] as const;

export type PhoneFrameColor = typeof PHONE_FRAME_COLORS[number];

const phoneFrameColorSet: ReadonlySet<string> = new Set(PHONE_FRAME_COLORS);

export function isPhoneFrameColor(value: unknown): value is PhoneFrameColor {
    return typeof value === "string" && phoneFrameColorSet.has(value);
}
