/**
 * Utility to safely resolve Next.js 15 Promise-based route params and searchParams.
 * Seamlessly backwards-compatible with Next.js 14 and earlier synchronous params.
 */

type ParamsPromise<T extends Record<string, any>> = Promise<T> | T;

/**
 * Resolves Next.js 15 Promise params or plain sync params object into concrete values.
 */
export async function resolveParams<T extends Record<string, any>>(
  params: ParamsPromise<T>
): Promise<T> {
  if (!params) return {} as T;

  // Check if params is a Promise or Thenable object
  if (params instanceof Promise || typeof (params as any)?.then === "function") {
    return await params; // ✅ Correctly await the promise to unwrap T
  }

  return params;
}

/**
 * Helper to safely extract dynamic `id` parameter from Next.js route params.
 */
export async function getIdFromParams(
  params: ParamsPromise<{ id?: string; [key: string]: any }>
): Promise<string> {
  const resolved = await resolveParams(params);
  return resolved?.id || "";
}

/**
 * Helper to safely extract dynamic `weddingId` parameter for MONEA routes.
 */
export async function getWeddingIdFromParams(
  params: ParamsPromise<{ weddingId?: string; id?: string; [key: string]: any }>
): Promise<string> {
  const resolved = await resolveParams(params);
  return resolved?.weddingId || resolved?.id || "";
}