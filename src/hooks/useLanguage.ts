import { useState, useEffect, useCallback, useMemo } from 'react';
import { translations, type Language, type Translations } from '@/lib/translations';

const LANGUAGE_KEY = 'fittrack-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored === 'ar' || stored === 'en') {
        return stored;
      }
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    
    // Update document direction and language
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  // Set initial direction on mount
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Translation accessor
  const t = useMemo(() => translations[language], [language]);

  return {
    language,
    setLanguage,
    isRTL,
    direction,
    t,
  };
}

export type UseLanguageReturn = ReturnType<typeof useLanguage>;
