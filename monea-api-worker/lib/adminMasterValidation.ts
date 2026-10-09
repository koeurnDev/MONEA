export const MAX_WEDDING_SEARCH_LENGTH = 120;
export const MAX_WEDDING_PAGE = 5000;
export const MAX_ADMIN_REASON_LENGTH = 500;
export const MIN_ADMIN_REASON_LENGTH = 10;

export type WeddingPackageFilter = "ALL" | "FREE" | "PRO" | "PREMIUM";

export function validateWeddingListParams(
    searchValue: string | undefined,
    pageValue: string | undefined,
    packageValue: string | undefined
):
    | { valid: true; search: string; page: number; packageFilter: WeddingPackageFilter }
    | { valid: false; error: string } {
    const search = searchValue ?? "";
    const page = Number(pageValue ?? "1");
    const packageFilter = packageValue ?? "ALL";

    if (search.length > MAX_WEDDING_SEARCH_LENGTH) {
        return { valid: false, error: `search must be at most ${MAX_WEDDING_SEARCH_LENGTH} characters` };
    }
    if (!Number.isInteger(page) || page < 1 || page > MAX_WEDDING_PAGE) {
        return { valid: false, error: `page must be an integer between 1 and ${MAX_WEDDING_PAGE}` };
    }
    if (!["ALL", "FREE", "PRO", "PREMIUM"].includes(packageFilter)) {
        return { valid: false, error: "Invalid packageType" };
    }

    return { valid: true, search, page, packageFilter: packageFilter as WeddingPackageFilter };
}

export function validateAdminReason(reason: unknown): reason is string {
    return typeof reason === "string"
        && reason.trim().length >= MIN_ADMIN_REASON_LENGTH
        && reason.trim().length <= MAX_ADMIN_REASON_LENGTH;
}

export function resolveAdminPackagePayment(
    packageType: unknown,
    disposition: unknown,
    reference: unknown
):
    | { valid: true; paymentStatus: "PENDING" | "PAID"; disposition: "NOT_APPLICABLE" | "PAID" | "WAIVED"; reference: string | null }
    | { valid: false; error: string } {
    if (!["FREE", "PRO", "PREMIUM"].includes(String(packageType))) {
        return { valid: false, error: "Invalid packageType" };
    }
    if (packageType === "FREE") {
        return { valid: true, paymentStatus: "PENDING", disposition: "NOT_APPLICABLE", reference: null };
    }
    if (disposition === "WAIVED") {
        return { valid: true, paymentStatus: "PAID", disposition: "WAIVED", reference: null };
    }
    if (disposition !== "PAID") {
        return { valid: false, error: "Select paid or waived payment" };
    }
    if (typeof reference !== "string" || reference.trim().length < 4 || reference.trim().length > 120) {
        return { valid: false, error: "A payment reference between 4 and 120 characters is required" };
    }

    return {
        valid: true,
        paymentStatus: "PAID",
        disposition: "PAID",
        reference: reference.trim()
    };
}

export function escapeWeddingSearch(search: string): string {
    return search.replace(/[!%_]/g, "!$&");
}
