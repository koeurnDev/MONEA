export type GalleryDisplayStyle = "masonry" | "slider" | "polaroid";

export const getGalleryDisplayStyle = (value: unknown): GalleryDisplayStyle =>
    value === "slider" || value === "polaroid" ? value : "masonry";

export const getGalleryContainerClass = (style: GalleryDisplayStyle): string => {
    if (style === "slider") {
        return "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3";
    }

    return style === "polaroid"
        ? "grid grid-cols-2 gap-4"
        : "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5";
};

export const getGalleryCardClass = (
    style: GalleryDisplayStyle,
    index: number,
): string => {
    if (style === "slider") {
        return "h-56 w-[82%] shrink-0 snap-center sm:h-72 sm:w-[60%]";
    }
    if (style === "polaroid") {
        return `aspect-square bg-white p-2 pb-8 shadow-lg ${
            index % 2 === 0 ? "-rotate-1" : "rotate-1"
        }`;
    }

    return index % 3 === 0
        ? "row-span-2 aspect-[3/4]"
        : "aspect-square";
};

export const getGalleryImageClass = (style: GalleryDisplayStyle): string =>
    style === "polaroid"
        ? "absolute left-2 right-2 top-2 bottom-8 h-auto w-auto object-cover"
        : "h-full w-full object-cover";
