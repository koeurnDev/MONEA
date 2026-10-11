const getRelativeLuminance = (color: string): number | null => {
    const hex = color.replace(/^#/, "");
    if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return null;

    const channels = hex.length === 3
        ? [...hex].map((channel) => Number.parseInt(channel + channel, 16))
        : [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
    const [red, green, blue] = channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

export const getContrastingTextColor = (backgroundColor: string): "#000000" | "#ffffff" => {
    const luminance = getRelativeLuminance(backgroundColor);
    if (luminance === null) return "#ffffff";

    const whiteContrast = 1.05 / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / 0.05;
    return blackContrast >= whiteContrast ? "#000000" : "#ffffff";
};
