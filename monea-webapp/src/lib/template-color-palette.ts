import type { CSSProperties } from "react";
import { NEA_M05_COLOR_PRESETS } from "./nea-m05-colors";
import { TEMPLATE_PAPER_TEXTURES } from "./template-paper";
import { getContrastingTextColor } from "./color-contrast";
import type { WeddingData } from "@/components/templates/types";

type PaletteStyles = CSSProperties & {
    "--primary": string;
    "--monea-palette-primary": string;
    "--monea-palette-on-primary": string;
    "--monea-palette-secondary": string;
    "--monea-paper-color": string;
    "--monea-paper-texture": string;
};

export const getTemplatePaperStyles = (
    themeSettings: WeddingData["themeSettings"],
    defaultPaperColor = "#F5F0E5",
): Pick<PaletteStyles, "--monea-paper-color" | "--monea-paper-texture"> => {
    const configuredPaperColor = themeSettings?.paperColor;
    const selectedPalette = NEA_M05_COLOR_PRESETS.find(
        ({ id }) => id === themeSettings?.colorPalettePreset,
    );
    const paperColor = configuredPaperColor && /^#[\da-f]{6}$/i.test(configuredPaperColor)
        ? configuredPaperColor
        : selectedPalette?.paperColor || defaultPaperColor;
    const paperTexture = TEMPLATE_PAPER_TEXTURES.find(
        ({ id }) => id === themeSettings?.paperTexture,
    ) || TEMPLATE_PAPER_TEXTURES[0];

    return {
        "--monea-paper-color": paperColor,
        "--monea-paper-texture": paperTexture.image === "none" ? "none" : `url("${paperTexture.image}")`,
    };
};

export const getTemplatePaletteStyles = (
    themeSettings: WeddingData["themeSettings"],
    defaultPrimary: string,
    defaultPaperColor = "#F5F0E5",
): PaletteStyles => {
    const preset = NEA_M05_COLOR_PRESETS.find(
        ({ id }) => id === themeSettings?.colorPalettePreset,
    );
    const primary = themeSettings?.primaryColor || preset?.accent || defaultPrimary;
    const secondary = preset?.foil || `color-mix(in srgb, ${primary} 35%, white)`;

    return {
        "--primary": primary,
        "--monea-palette-primary": primary,
        "--monea-palette-on-primary": getContrastingTextColor(primary),
        "--monea-palette-secondary": secondary,
        ...getTemplatePaperStyles(themeSettings, defaultPaperColor),
    };
};
