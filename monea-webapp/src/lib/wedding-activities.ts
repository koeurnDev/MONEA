import type { WeddingData } from "@/components/templates/types";

export const normalizeWeddingActivities = (
    activities: WeddingData["activities"] | null | undefined,
): WeddingData["activities"] => {
    if (!Array.isArray(activities)) return [];

    const seen = new Set<string>();
    return activities.filter((activity) => {
        if (!activity || typeof activity !== "object") return false;

        const fields = [activity.time, activity.title, activity.description]
            .map((value) => typeof value === "string"
                ? value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
                : "");
        if (!fields.some(Boolean)) return false;

        const signature = JSON.stringify(fields);
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
    });
};
