import { create } from 'zustand';
import axios from 'axios';

export interface Settings {
  themeColor: string;
}

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  getThemeColor: () => string;
  waitForThemeColor: () => Promise<string>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  loadSettings: async () => {
    const { isLoading, settings } = get();
    
    // If already loaded, return
    if (settings && !isLoading) {
      return;
    }

    // If already loading, wait for completion
    if (isLoading) {
      return new Promise<void>((resolve, reject) => {
        const checkLoaded = () => {
          const state = get();
          if (!state.isLoading) {
            if (state.error) {
              reject(new Error(state.error));
            } else {
              resolve();
            }
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    set({ isLoading: true, error: null });

    try {
      const response = await axios.get<Settings>('/settings.json');
      const fetchedSettings = response.data;
      
      if (!fetchedSettings.themeColor) {
        throw new Error('Theme color not found in settings.json');
      }
      
      set({ 
        settings: fetchedSettings, 
        isLoading: false, 
        error: null,
        isInitialized: true 
      });
    } catch (error) {
      const errorMessage = 'Unable to load settings from settings.json. Please ensure the file exists and contains a valid themeColor.';
      console.error('Failed to fetch settings:', error);
      set({ 
        settings: null, 
        isLoading: false, 
        error: errorMessage,
        isInitialized: false 
      });
      throw new Error(errorMessage);
    }
  },

  getThemeColor: () => {
    const { settings } = get();
    if (!settings?.themeColor) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.themeColor;
  },

  waitForThemeColor: async () => {
    await get().loadSettings();
    return get().getThemeColor();
  }
}));
