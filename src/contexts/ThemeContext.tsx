import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkColors, LightColors, ThemeColors } from '../constants/theme';

const THEME_STORAGE_KEY = 'theme_preference';

export interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [manualTheme, setManualTheme] = useState<'dark' | 'light' | null>(null);

  // Load saved preference on mount
  useEffect(() => {
    let isMounted = true;

    async function loadThemePreference() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && (saved === 'dark' || saved === 'light')) {
          setManualTheme(saved);
        }
      } catch (error) {
        console.warn('[ThemeContext] Error loading theme preference:', error);
      }
    }

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const isDark = useMemo(() => {
    if (manualTheme !== null) {
      return manualTheme === 'dark';
    }
    return systemColorScheme === 'dark';
  }, [manualTheme, systemColorScheme]);

  const toggleTheme = useCallback(async () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setManualTheme(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.warn('[ThemeContext] Error saving theme preference:', error);
    }
  }, [isDark]);

  const colors = useMemo(() => {
    return isDark ? DarkColors : LightColors;
  }, [isDark]);

  const value = useMemo(
    () => ({
      colors,
      isDark,
      toggleTheme,
    }),
    [colors, isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
