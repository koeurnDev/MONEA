export const CHUNK_RELOAD_KEY = 'monea:chunk-reload-at'

export async function clearAppAssetCaches(): Promise<void> {
  if (!('caches' in window) || !navigator.onLine) return

  const cacheNames = await window.caches.keys()
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('monea-'))
      .map((name) => window.caches.delete(name)),
  )
}
