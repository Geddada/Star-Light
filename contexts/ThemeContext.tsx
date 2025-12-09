import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('starlight-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to light mode always, ignoring system preference
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const newTheme = theme;
    const oldTheme = newTheme === 'dark' ? 'light' : 'dark';
    
    root.classList.remove(oldTheme);
    root.classList.add(newTheme);
    
    localStorage.setItem('starlight-theme', newTheme);
  }, [theme]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--accent-color', `var(--accent-blue)`);
    // Clean up old value from localStorage if it exists
    localStorage.removeItem('starlight-accent');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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