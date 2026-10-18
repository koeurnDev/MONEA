export const NETWORK_ERROR_MESSAGE =
    "សូមពិនិត្យសេវាអ៊ីនធឺណិតរបស់អ្នក ហើយព្យាយាមម្ដងទៀត។";

const NETWORK_ERROR_PATTERN =
    /failed to fetch|fetch failed|networkerror|network request failed|load failed|err_internet_disconnected|err_network_changed|err_connection|name_not_resolved/i;

export function isNetworkError(error: unknown): boolean {
    if (typeof error === "string") return NETWORK_ERROR_PATTERN.test(error);
    if (!(error instanceof Error)) return false;
    if (error.name === "AbortError") return false;

    return NETWORK_ERROR_PATTERN.test(error.message);
}

export function notifyNetworkError(error: unknown): void {
    if (typeof window !== "undefined" && isNetworkError(error)) {
        window.dispatchEvent(new Event("monea:network-error"));
    }
}
