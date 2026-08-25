/**
 * Safe Google Maps URL utilities for MONEA templates.
 * Prevents X-Frame-Options Denied errors in iframes and creates reliable navigation links.
 */

export const getMapEmbedUrl = (location?: string | null, venueName?: string | null): string => {
    const loc = (location || "").trim();
    const venue = (venueName || "").trim();

    // If it's already an embed URL, return as is
    if (loc.includes("google.com/maps/embed")) {
        return loc;
    }

    // If it's a maps link with ?q= parameter, extract the query
    if (loc.includes("google.com") && loc.includes("q=")) {
        try {
            const url = new URL(loc);
            const q = url.searchParams.get("q");
            if (q && q.trim()) {
                return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
            }
        } catch (e) {}
    }

    // If location is a raw URL or "https://maps.google.com", prioritize venue name
    let query = venue;
    if (!query && loc && !loc.startsWith("http")) {
        query = loc;
    }
    if (!query) {
        query = "Koh Pich Convention and Exhibition Centre Phnom Penh Cambodia";
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
};

export const getDirectMapUrl = (location?: string | null, venueName?: string | null): string => {
    const loc = (location || "").trim();
    const venue = (venueName || "").trim();

    if (loc.startsWith("http://") || loc.startsWith("https://")) {
        if (loc !== "https://maps.google.com" && loc !== "https://maps.google.com/") {
            return loc;
        }
    }

    const query = venue || (loc && !loc.startsWith("http") ? loc : "Koh Pich Convention and Exhibition Centre Phnom Penh Cambodia");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
