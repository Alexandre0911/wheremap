import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dark, light } from '../theme';

const ThemeContext = createContext(null);
const THEME_KEY = '@wheremap/theme_mode';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('auto');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        setMode(saved);
      }
    });
  }, []);

  const effectiveScheme = mode === 'auto' ? systemScheme || 'dark' : mode;
  const theme = effectiveScheme === 'light' ? light : dark;

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto';
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, mode, toggleTheme, isDark: effectiveScheme === 'dark' }), [theme, mode, toggleTheme, effectiveScheme]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}