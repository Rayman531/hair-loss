import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  isDarkMode: boolean;
  colorScheme: ThemeMode;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  colorScheme: 'light',
  toggleDarkMode: () => {},
});

const STORAGE_KEY = 'follix_dark_mode';

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'true') {
        setIsDarkMode(true);
      }
    });
  }, []);
  const colorScheme: ThemeMode = isDarkMode ? 'dark' : 'light';

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    AsyncStorage.setItem(STORAGE_KEY, String(newValue));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, colorScheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
