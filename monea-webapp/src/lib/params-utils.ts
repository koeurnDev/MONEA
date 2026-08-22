/**
 * Utility to handle Next.js 15's Promise-based params
 * Works with both old and new Next.js versions
 */

type ParamsPromise<T extends Record<string, string>> = Promise<T> | T;

export async function resolveParams<T extends Record<string, string>>(
    params: ParamsPromise<T>
): Promise<T> {
    if (params instanceof Promise) {
        return params;
    }
    return params;
}

// Helper to extract id from params (common use case)
export async function getIdFromParams(
    params: ParamsPromise<{ id: string }>
): Promise<string> {
    const resolved = await resolveParams(params);
    return resolved.id;
}