import type {
    ResolvedTemplateConfig,
    TemplateSection,
    WeddingData,
    VisibilityKey,
} from "../types";
import { normalizeWeddingActivities } from "../../../lib/wedding-activities.ts";

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
    const labelAliases = {
        invite_title: "invitationTitle",
        hero_subtitle: "heroSubtitle",
        hero_button: "heroButton",
        gallery_title: "galleryTitle",
    } as const;
    const normalizedLabels = { ...labels };
    for (const [legacyKey, currentKey] of Object.entries(labelAliases)) {
        const legacyValue = rawLabels?.[legacyKey];
        if (!normalizedLabels[currentKey] && legacyValue) {
            normalizedLabels[currentKey] = legacyValue;
        }
    }
    const normalizedVisibility = {
        ...visibility,
        showTimeline: visibility.showTimeline ?? legacyShowSchedule,
    };
    if (scheduleTitle) normalizedLabels.scheduleTitle = scheduleTitle;

    return {
        wedding: {
            ...wedding,
            activities: normalizeWeddingActivities(wedding.activities),
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
