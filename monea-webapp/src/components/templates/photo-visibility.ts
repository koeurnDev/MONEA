import type { WeddingData } from "./types";

type GalleryPhoto = WeddingData["galleryItems"][number];

export function getGalleryPhotoKey(item: GalleryPhoto): string {
    return item.publicId || item.url;
}

export function getWeddingWithPhotoVisibility<T extends WeddingData>(wedding: T): T {
    const hiddenSlots = new Set(wedding.themeSettings?.hiddenPhotoSlots || []);
    const hiddenGalleryPhotos = new Set(wedding.themeSettings?.hiddenGalleryPhotoKeys || []);
    const hidePhotos = (items: GalleryPhoto[]) => items.map((item, index) => {
        const isHidden = index < 11
            ? hiddenSlots.has(index)
            : hiddenGalleryPhotos.has(getGalleryPhotoKey(item));
        return isHidden ? { ...item, url: "" } : item;
    });
    const galleryItems = hidePhotos(wedding.galleryItems || []);
    const themeSettings = {
        ...wedding.themeSettings,
        ...(hiddenSlots.has(0) ? { heroImage: "", coverImageUrl: "" } : {}),
    };
    if (Array.isArray(themeSettings.galleryItems)) {
        themeSettings.galleryItems = hidePhotos(themeSettings.galleryItems);
    }

    return {
        ...wedding,
        groomPhoto: hiddenSlots.has(9) ? "" : wedding.groomPhoto,
        bridePhoto: hiddenSlots.has(10) ? "" : wedding.bridePhoto,
        galleryItems,
        themeSettings,
    };
}
