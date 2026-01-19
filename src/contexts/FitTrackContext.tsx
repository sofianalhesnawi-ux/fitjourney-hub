import React, { createContext, useContext, ReactNode } from 'react';
import { useFitTrackData } from '@/hooks/useFitTrackData';
import { useTheme } from '@/hooks/useTheme';

type FitTrackContextType = ReturnType<typeof useFitTrackData> & {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
};

const FitTrackContext = createContext<FitTrackContextType | null>(null);

export function FitTrackProvider({ children }: { children: ReactNode }) {
  const fitTrackData = useFitTrackData();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <FitTrackContext.Provider value={{ ...fitTrackData, theme, setTheme, resolvedTheme }}>
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
