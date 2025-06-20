/**
 * @fileoverview Theme provider for Material Design 3
 * @author WordWise AI Team
 * @version 1.0.0
 * 
 * Theme provider component implementing Material Design 3 theme system.
 * Handles light/dark mode switching and system preference detection.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Available theme options
 */
type Theme = 'dark' | 'light' | 'system';

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

/**
 * Theme context state
 */
interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * Theme provider component
 * 
 * Provides theme context and handles theme switching logic.
 * Supports system preference detection and persistent theme storage.
 * 
 * @component
 * @param children - Child components
 * @param defaultTheme - Default theme to use
 * @param storageKey - Local storage key for theme persistence
 * @param attribute - HTML attribute to set for theme
 * @param enableSystem - Whether to enable system theme detection
 * @param disableTransitionOnChange - Whether to disable transitions during theme change
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dungeons-drafting-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, enableSystem]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Hook to use theme context
 * 
 * @returns Theme context state and setTheme function
 * 
 * @example
 * ```tsx
 * const { theme, setTheme } = useTheme();
 * 
 * const toggleTheme = () => {
 *   setTheme(theme === 'light' ? 'dark' : 'light');
 * };
 * ```
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}; 