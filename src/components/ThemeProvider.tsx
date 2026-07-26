import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BrutalistTheme } from '../tokens';

interface ThemeContextType {
  theme: BrutalistTheme;
  setTheme: (theme: BrutalistTheme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: BrutalistTheme }> = ({
  children,
  defaultTheme = 'dark'
}) => {
  const [theme, setThemeState] = useState<BrutalistTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('brutalist_theme') as BrutalistTheme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('dark', 'dim', 'sketch');
    root.classList.add(theme);
    localStorage.setItem('brutalist_theme', theme);
  }, [theme]);

  const setTheme = (t: BrutalistTheme) => setThemeState(t);

  const cycleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'dark') return 'dim';
      if (prev === 'dim') return 'sketch';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
