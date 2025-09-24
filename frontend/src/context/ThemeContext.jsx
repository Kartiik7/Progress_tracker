import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getProfile, updateProfile } from '../api/user';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const { token } = useAuth();
  const [theme, setTheme] = useState('light'); // Default to light

  // This effect runs when the user logs in or out
  useEffect(() => {
    const fetchAndSetTheme = async () => {
      if (token) {
        try {
          // User is logged in, fetch their saved theme
          const profile = await getProfile();
          const userTheme = profile.settings?.theme || 'light';
          setTheme(userTheme);
        } catch (error) {
          console.error("Failed to fetch user theme", error);
          setTheme('light'); // Fallback on error
        }
      } else {
        // User is logged out, reset to default light theme
        setTheme('light');
      }
    };
    fetchAndSetTheme();
  }, [token]); // Re-run when the auth token changes

  // This effect applies the theme to the document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = async (selectedTheme) => {
    if (theme === selectedTheme) return;

    // Optimistically update the UI
    setTheme(selectedTheme);

    // Save the new theme to the backend
    try {
      await updateProfile({ theme: selectedTheme });
    } catch (error) {
      console.error("Failed to save theme preference", error);
      // Optional: Revert theme if API call fails
    }
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}