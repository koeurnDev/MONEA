import { Facebook, Instagram, Link2, Send } from "lucide-react";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import type { SocialPlatform } from "@/lib/social-links";

interface SocialMediaIconProps {
    platform: SocialPlatform;
    size?: number;
    className?: string;
}

export function SocialMediaIcon({ platform, size = 16, className }: SocialMediaIconProps) {
    if (platform === "telegram") return <Send size={size} className={className} />;
    if (platform === "facebook") return <Facebook size={size} className={className} />;
    if (platform === "instagram") return <Instagram size={size} className={className} />;
    if (platform === "tiktok") return <TikTokIcon size={size} className={className} />;
    return <Link2 size={size} className={className} />;
}
