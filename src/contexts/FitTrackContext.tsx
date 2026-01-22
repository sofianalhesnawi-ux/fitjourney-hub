import React, { createContext, useContext, ReactNode } from 'react';
import { useFitTrackData } from '@/hooks/useFitTrackData';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage, type UseLanguageReturn } from '@/hooks/useLanguage';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

type FitTrackContextType = ReturnType<typeof useFitTrackData> & {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
} & UseLanguageReturn;

const FitTrackContext = createContext<FitTrackContextType | null>(null);

export function FitTrackProvider({ children }: { children: ReactNode }) {
  const fitTrackData = useFitTrackData();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const languageData = useLanguage();
  
  // Update document title and meta based on language
  useDocumentMeta(languageData.language);

  return (
    <FitTrackContext.Provider value={{ ...fitTrackData, theme, setTheme, resolvedTheme, ...languageData }}>
      {children}
    </FitTrackContext.Provider>
  );
}

export function useFitTrack() {
  const context = useContext(FitTrackContext);
  if (!context) {
    throw new Error('useFitTrack must be used within a FitTrackProvider');
  }
  return context;
}
