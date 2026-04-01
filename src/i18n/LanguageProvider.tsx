"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from './en.json';
import km from './km.json';

type Locale = 'en' | 'km';
type Translations = typeof en;

interface LanguageContextType {
  locale: Locale;
  t: (path: string, params?: Record<string, any>) => any;
  setLocale: (locale: Locale) => void;
}

const translations: Record<Locale, any> = { en, km };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children, initialLocale = 'km' }: { children: ReactNode, initialLocale?: Locale }) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

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
        let result: any = translations[locale];
        
        const returnObjects = params?.returnObjects === true;

        // Standard lookup
        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                return path;
            }
        }
        
        // If we found an object/array and caller asked for it, return it
        if (typeof result !== 'string' && returnObjects) {
            return result;
        }

        // If it's not a string and we didn't ask for object, return path (fallback)
        if (typeof result !== 'string') return path;

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
