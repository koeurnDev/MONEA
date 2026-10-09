import type {
    ResolvedTemplateConfig,
    TemplateSection,
    WeddingData,
    VisibilityKey,
} from "../types";

const sectionVisibilityKeys: Record<TemplateSection, VisibilityKey> = {
    hero: "showHero",
    gallery: "showGallery",
    story: "showStory",
    timeline: "showTimeline",
    guestbook: "showGuestbook",
    map: "showMap",
    gift: "showGift",
    eventInfo: "showEventInfo",
    contact: "showContact",
};

export const isSectionVisible = (
    config: ResolvedTemplateConfig,
    section: TemplateSection,
): boolean => config.visibility[sectionVisibilityKeys[section]] !== false;

export const normalizeWeddingForTemplate = (wedding: WeddingData): {
    wedding: WeddingData;
    config: ResolvedTemplateConfig;
} => {
    const settings = wedding.themeSettings;
    const rawVisibility = settings?.visibility;
    const { showSchedule: legacyShowSchedule, ...visibility } = rawVisibility || {};
    const rawLabels = settings?.customLabels;
    const { schedule_title: legacyScheduleTitle, ...labels } = rawLabels || {};
    const scheduleTitle = labels.scheduleTitle?.trim() || legacyScheduleTitle?.trim();
    const normalizedVisibility = {
        ...visibility,
        showTimeline: visibility.showTimeline ?? legacyShowSchedule,
    };
    const normalizedLabels = {
        ...labels,
        ...(scheduleTitle ? { scheduleTitle } : {}),
    };

    return {
        wedding: {
            ...wedding,
            activities: Array.isArray(wedding.activities) ? wedding.activities : [],
            galleryItems: Array.isArray(wedding.galleryItems) ? wedding.galleryItems : [],
            themeSettings: settings
                ? {
                    ...settings,
                    visibility: normalizedVisibility,
                    customLabels: normalizedLabels,
                }
                : settings,
        },
        config: {
            visibility: normalizedVisibility,
            labels: normalizedLabels,
        },
    };
};
