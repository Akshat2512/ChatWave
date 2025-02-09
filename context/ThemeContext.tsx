import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme, StyleSheet, } from 'react-native';
import useStorage from '@/hooks/useStorage';
import { Colors } from '@/constants/Colors';

type ThemeContextType = {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
  themeTextStyle: { color: string; },
  themeContainerStyle: { backgroundColor: string; }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(systemColorScheme || 'light');
  const storage = useStorage();

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    const storedTheme = await storage.getItem('@Theme_Mode');
    if (storedTheme) {
      setColorMode(storedTheme as 'light' | 'dark');
    }
  };

  const toggleColorMode = async () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    await storage.setItem('@Theme_Mode', newMode);
  };
  

  const themeTextStyle = colorMode === 'dark' ? Colors.darkThemeText : Colors.lightThemeText;
  const themeContainerStyle = colorMode === 'dark' ? Colors.darkContainer : Colors.lightContainer;
      
  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode, themeTextStyle, themeContainerStyle}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

