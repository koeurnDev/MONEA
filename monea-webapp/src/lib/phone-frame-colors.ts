export const PHONE_FRAME_COLORS = {
    black: {
        label: "Black Titanium",
        gradient: "linear-gradient(160deg, #45484d 0%, #25282d 48%, #101216 100%)",
        side: "#34373c",
    },
    white: {
        label: "White Titanium",
        gradient: "linear-gradient(160deg, #f7f7f4 0%, #d9dadd 48%, #aeb1b7 100%)",
        side: "#c8cacf",
    },
    natural: {
        label: "Natural Titanium",
        gradient: "linear-gradient(160deg, #a9a49b 0%, #77736c 48%, #4e4b46 100%)",
        side: "#88847c",
    },
    desert: {
        label: "Desert Titanium",
        gradient: "linear-gradient(160deg, #d6b69e 0%, #ad866d 48%, #765943 100%)",
        side: "#b28e75",
    },
} as const;

export type PhoneFrameColor = keyof typeof PHONE_FRAME_COLORS;

export function isPhoneFrameColor(value: unknown): value is PhoneFrameColor {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(PHONE_FRAME_COLORS, value);
}
