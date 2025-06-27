import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark';
  sidebarExpanded: boolean;
  compactView: boolean;
  notificationsEnabled: boolean;
  dashboardLayout: 'default' | 'compact' | 'expanded';
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  sidebarExpanded: true,
  compactView: false,
  notificationsEnabled: true,
  dashboardLayout: 'default'
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);
  
  // Load preferences from localStorage on initial render
  useEffect(() => {
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      try {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences(parsedPreferences);
      } catch (error) {
        console.error('Failed to parse stored preferences:', error);
      }
    }
    
    // Apply theme
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    
    setLoaded(true);
  }, []);
  
  // Update localStorage when preferences change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // Apply theme change to document
      document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    }
  }, [preferences, loaded]);
  
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const toggleTheme = () => {
    setPreferences(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };
  
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };
  
  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        toggleTheme,
        isDarkMode: preferences.theme === 'dark',
        resetPreferences
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export default PreferencesProvider;