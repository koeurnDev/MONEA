import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle";
import { systemConfig } from "@/drizzle/schema";

export const DEFAULT_SOCIAL_LINKS = [
    { platform: "telegram", label: "Telegram", url: "https://t.me/Moneaa.app" },
    { platform: "facebook", label: "Facebook", url: "https://facebook.com" },
    { platform: "instagram", label: "Instagram", url: "https://instagram.com" },
    { platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@moneaa" },
] as const;

const SUPPORTED_PLATFORMS = new Set(["telegram", "facebook", "instagram", "tiktok", "other"]);

export interface SocialLink {
    platform: "telegram" | "facebook" | "instagram" | "tiktok" | "other";
    label: string;
    url: string;
}

export function normalizeSocialLinks(value: unknown): SocialLink[] | null {
    if (!Array.isArray(value) || value.length > 12) return null;

    const links: SocialLink[] = [];
    for (const item of value) {
        if (!item || typeof item !== "object" || Array.isArray(item)) return null;
        const candidate = item as Record<string, unknown>;
        if (
            typeof candidate.platform !== "string"
            || !SUPPORTED_PLATFORMS.has(candidate.platform)
            || typeof candidate.label !== "string"
            || !candidate.label.trim()
            || candidate.label.trim().length > 50
            || typeof candidate.url !== "string"
            || !candidate.url.trim()
            || candidate.url.trim().length > 2048
        ) {
            return null;
        }

        let url: URL;
        try {
            url = new URL(candidate.url.trim());
        } catch {
            return null;
        }
        if (
            (url.protocol !== "https:" && url.protocol !== "http:")
            || url.username
            || url.password
        ) {
            return null;
        }

        links.push({
            platform: candidate.platform as SocialLink["platform"],
            label: candidate.label.trim(),
            url: url.toString(),
        });
    }
    return links;
}

export async function getSystemSocialLinks(env?: unknown): Promise<SocialLink[]> {
    const db = getDb(env);
    const config = await db.select({ socialLinks: systemConfig.socialLinks })
        .from(systemConfig)
        .where(eq(systemConfig.id, "GLOBAL"))
        .limit(1)
        .then((rows) => rows[0]);

    if (config?.socialLinks === null || config?.socialLinks === undefined) {
        return [...DEFAULT_SOCIAL_LINKS];
    }

    const links = normalizeSocialLinks(config.socialLinks);
    if (!links) {
        throw new Error("Stored social links have an invalid format");
    }
    return links;
}
