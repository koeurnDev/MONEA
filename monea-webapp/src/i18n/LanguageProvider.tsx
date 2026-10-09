import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import km from './km.json';

type Locale = 'en' | 'km';
type Translations = typeof km;

interface LanguageContextType {
  locale: Locale;
  t: (path: string, params?: Record<string, any>) => any;
  setLocale: (locale: Locale) => void;
}

/**
 * Locale dictionaries.
 *
 * `km` is the only locale that can be active on first paint (the provider forces
 * it), so it is the only one bundled into the entry chunk. `en.json` alone is
 * ~72 KB of raw JSON - previously it was a static import and therefore parsed by
 * every visitor, including the ~100% of traffic on the Khmer locale. It is now
 * fetched on demand the first time a caller actually switches to English, and
 * cached in this module for the rest of the session.
 */
const DICTIONARIES: Partial<Record<Locale, Translations>> = { km };

const dictionaryLoaders: Record<Locale, () => Promise<Translations>> = {
  km: () => Promise.resolve(km as Translations),
  en: () => import('./en.json').then((mod) => mod.default as unknown as Translations),
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLocale = 'km' }: { children: ReactNode, initialLocale?: Locale }) => {
  // Always use 'km' for now as requested
  const [locale, setLocaleState] = useState<Locale>('km');
  const [dictionary, setDictionary] = useState<Translations>(
    () => DICTIONARIES[initialLocale] ?? (km as Translations)
  );

  useEffect(() => {
    // If someone has 'en' cookie, we reset it to 'km'
    if (typeof window !== 'undefined' && locale !== 'km') {
        setLocaleState('km');
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    const cached = DICTIONARIES[locale];
    if (cached) {
      setDictionary(cached);
      return;
    }
    dictionaryLoaders[locale]()
      .then((loaded) => {
        if (cancelled) return;
        DICTIONARIES[locale] = loaded;
        setDictionary(loaded);
      })
      .catch(() => {
        // Keep the already-loaded dictionary rather than rendering blank text.
      });
    return () => { cancelled = true; };
  }, [locale]);

  // Sync with cookie and persistence
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
    // Force a reload of server components to sync the locale
    if (typeof window !== 'undefined') {
        window.location.reload();
    }
  };

    const t = (path: string, params?: Record<string, any>): any => {
        const keys = path.split('.');
        let result: any = dictionary;
        
        const returnObjects = params?.returnObjects === true;

        // Standard lookup
        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                return params?.defaultValue !== undefined ? params.defaultValue : path;
            }
        }
        
        // If we found an object/array and caller asked for it, return it
        if (typeof result !== 'string' && returnObjects) {
            return result;
        }

        // If it's not a string and we didn't ask for object, return path (fallback)
        if (typeof result !== 'string') return params?.defaultValue !== undefined ? params.defaultValue : path;

        // Simple string replacement for params
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (key !== 'returnObjects') {
                    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
                }
            });
        }
        
        return result;
    };

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
