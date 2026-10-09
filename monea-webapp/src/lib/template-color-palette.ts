import type { CSSProperties } from "react";
import { NEA_M05_COLOR_PRESETS } from "./nea-m05-colors";
import type { WeddingData } from "@/components/templates/types";

type PaletteStyles = CSSProperties & {
    "--primary": string;
    "--monea-palette-primary": string;
    "--monea-palette-secondary": string;
};

export const getTemplatePaletteStyles = (
    themeSettings: WeddingData["themeSettings"],
    defaultPrimary: string,
): PaletteStyles => {
    const preset = NEA_M05_COLOR_PRESETS.find(
        ({ id }) => id === themeSettings?.colorPalettePreset,
    );
    const primary = themeSettings?.primaryColor || preset?.accent || defaultPrimary;

    return {
        "--primary": primary,
        "--monea-palette-primary": primary,
        "--monea-palette-secondary": preset?.envelopeLight || primary,
    };
};
