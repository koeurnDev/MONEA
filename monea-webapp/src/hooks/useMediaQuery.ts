import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query.
 *
 * This app is client-rendered (Vite SPA), so `window.matchMedia` is available
 * synchronously on the very first render. Initialising from it means we never
 * render the wrong breakpoint branch, which matters for images: an eager `<img>`
 * inside a `display:none` responsive branch is still downloaded by the browser,
 * so rendering both branches doubles image transfer on every device.
 *
 * Usage: const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Re-sync in case the query resolved differently between render and effect.
    setMatches(list.matches);

    // Safari < 14 only supports the deprecated addListener API.
    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    }
    ;(list as MediaQueryList & { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(onChange);
    return () => {
      ;(list as MediaQueryList & { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(onChange);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
