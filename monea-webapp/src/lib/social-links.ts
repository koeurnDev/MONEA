export const SOCIAL_PLATFORMS = ["telegram", "facebook", "instagram", "tiktok", "other"] as const;

export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];

export interface SocialLink {
    platform: SocialPlatform;
    label: string;
    url: string;
}

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
    { platform: "telegram", label: "Telegram", url: "https://t.me/Moneaa.app" },
    { platform: "facebook", label: "Facebook", url: "https://facebook.com" },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com" },
    { platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@moneaa" },
];

export function isSocialLinks(value: unknown): value is SocialLink[] {
    return Array.isArray(value) &&
        value.length <= 12 &&
        value.every((item) => {
            if (
                typeof item !== "object" ||
                item === null ||
                Array.isArray(item) ||
                !("platform" in item) ||
                typeof item.platform !== "string" ||
                !SOCIAL_PLATFORMS.includes(item.platform as SocialPlatform) ||
                !("label" in item) ||
                typeof item.label !== "string" ||
                !item.label.trim() ||
                item.label.length > 50 ||
                !("url" in item) ||
                typeof item.url !== "string" ||
                item.url.length > 2048
            ) {
                return false;
            }

            try {
                const url = new URL(item.url);
                return (url.protocol === "https:" || url.protocol === "http:") &&
                    !url.username && !url.password;
            } catch {
                return false;
            }
        });
}
