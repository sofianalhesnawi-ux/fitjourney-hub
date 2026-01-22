import { useEffect } from 'react';
import type { Language } from '@/lib/translations';

const documentMeta = {
  en: {
    title: 'FitTrack - Personal Fitness Tracker',
    description: 'Track your workouts, nutrition, body metrics, and fitness goals with FitTrack. Your personal fitness journey companion.'
  },
  ar: {
    title: 'فيت تراك - متتبع اللياقة الشخصي',
    description: 'تتبع تمارينك وتغذيتك وقياسات جسمك وأهداف لياقتك مع فيت تراك. رفيقك في رحلة اللياقة البدنية.'
  }
};

export function useDocumentMeta(language: Language) {
  useEffect(() => {
    const meta = documentMeta[language];
    
    // Update document title
    document.title = meta.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description);
    }
    
    // Update OG title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', meta.title);
    }
    
    // Update OG description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', meta.description);
    }
    
    // Update HTML lang and dir attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
}
