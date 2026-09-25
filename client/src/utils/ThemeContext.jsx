import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or default to true (dark theme)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme_preference');
      if (stored) {
        return stored === 'dark';
      }
    }
    return true; // Default to dark as per mockup
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
