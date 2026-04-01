import { cookies } from 'next/headers';
import en from './en.json';
import km from './km.json';

type Locale = 'en' | 'km';
const translations: Record<Locale, any> = { en, km };

export function getLocale() {
  try {
    const cookieStore = cookies();
    return (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'km';
  } catch (e) {
    // During static generation (prerendering), cookies may not be available.
    // Fallback to default locale to allow the build to proceed.
    return 'km';
  }
}

export function getTranslations(locale?: Locale) {
  const activeLocale = locale || getLocale();
  const dict = translations[activeLocale];

  return (path: string, params?: Record<string, any>): any => {
    const keys = path.split('.');
    let result: any = dict;
    
    const returnObjects = params?.returnObjects === true;

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        return path;
      }
    }
    
    if (typeof result !== 'string' && returnObjects) {
        return result;
    }

    if (typeof result !== 'string') return path;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'returnObjects') {
          result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
        }
      });
    }
    
    return result;
  };
}
