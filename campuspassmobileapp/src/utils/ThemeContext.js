import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primaryLight: '#86efac',
    background: '#f4fbf6',
    surface: '#fcfffd',
    surfaceSecondary: '#edf9f0',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#d8efe0',
    card: '#fcfffd',
    notification: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  },
};

const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#4ade80',
    primaryHover: '#22c55e',
    primaryLight: '#86efac',
    background: '#09090b',
    surface: '#18181b',
    surfaceSecondary: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: 'rgba(255, 255, 255, 0.08)',
    card: '#18181b',
    notification: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
  },
};

const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        if (storedTheme) {
          setIsDark(storedTheme === 'dark');
        } else {
          setIsDark(true);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('@theme_preference', newTheme ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  if (!isLoaded) return null;

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
