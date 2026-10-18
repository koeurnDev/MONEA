import { useEffect, useState } from "react";
import { moneaClient } from "@/lib/api-client";
import {
    DEFAULT_SOCIAL_LINKS,
    isSocialLinks,
    type SocialLink,
} from "@/lib/social-links";

export function useSocialLinks(): SocialLink[] {
    const [links, setLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const response = await moneaClient.get<{ links: unknown }>("/api/system/social-links", {
                cache: "no-store",
            });
            if (cancelled) return;
            if (response.error) {
                console.error("[Social Links] Could not load configured links:", response.error);
                return;
            }
            const loadedLinks = response.data?.links;
            if (loadedLinks === null || loadedLinks === undefined) return;
            if (!isSocialLinks(loadedLinks)) {
                console.error("[Social Links] API returned an invalid links payload");
                return;
            }
            setLinks(loadedLinks);
        };
        const task = window.setTimeout(() => { void load(); }, 200);
        return () => {
            cancelled = true;
            window.clearTimeout(task);
        };
        // Load the public settings once; changes arrive on the next page load.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return links;
}
