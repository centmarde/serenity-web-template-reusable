import { create } from 'zustand';
import axios from 'axios';

export interface Settings {
  themeColor: string;
  callsign: string;
  couplename: string;
  appName: string;
  coupleOfficialDate: string;
  startingGreetings: string;
  traits: string[];
}

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  getThemeColor: () => string;
  getCallsign: () => string;
  getCouplename: () => string;
  getAppName: () => string;
  getCoupleOfficialDate: () => string;
  getStartingGreetings: () => string;
  getTraits: () => string[];
  getRandomTrait: () => string;
  waitForThemeColor: () => Promise<string>;
  waitForCallsign: () => Promise<string>;
  waitForCouplename: () => Promise<string>;
  waitForAppName: () => Promise<string>;
  waitForCoupleOfficialDate: () => Promise<string>;
  waitForStartingGreetings: () => Promise<string>;
  waitForTraits: () => Promise<string[]>;
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
      
      // Validate required fields
      if (fetchedSettings.callsign === undefined) {
        throw new Error('Callsign not found in settings.json');
      }
      
      if (fetchedSettings.couplename === undefined) {
        throw new Error('Couplename not found in settings.json');
      }
      
      if (fetchedSettings.appName === undefined) {
        throw new Error('App name not found in settings.json');
      }
      
      if (fetchedSettings.coupleOfficialDate === undefined) {
        throw new Error('Couple official date not found in settings.json');
      }
      
      if (fetchedSettings.startingGreetings === undefined) {
        throw new Error('Starting greetings not found in settings.json');
      }
      
      if (!fetchedSettings.traits || !Array.isArray(fetchedSettings.traits) || fetchedSettings.traits.length === 0) {
        throw new Error('Traits array not found or empty in settings.json');
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

  getCallsign: () => {
    const { settings } = get();
    if (!settings || settings.callsign === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.callsign;
  },

  getCouplename: () => {
    const { settings } = get();
    if (!settings || settings.couplename === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.couplename;
  },

  getAppName: () => {
    const { settings } = get();
    if (!settings || settings.appName === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.appName;
  },

  getCoupleOfficialDate: () => {
    const { settings } = get();
    if (!settings || settings.coupleOfficialDate === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.coupleOfficialDate;
  },

  getStartingGreetings: () => {
    const { settings } = get();
    if (!settings || settings.startingGreetings === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.startingGreetings;
  },

  getTraits: () => {
    const { settings } = get();
    if (!settings || !settings.traits || !Array.isArray(settings.traits)) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.traits;
  },

  getRandomTrait: () => {
    const traits = get().getTraits();
    if (traits.length === 0) {
      throw new Error('No traits available.');
    }
    const randomIndex = Math.floor(Math.random() * traits.length);
    return traits[randomIndex];
  },

  waitForThemeColor: async () => {
    await get().loadSettings();
    return get().getThemeColor();
  },

  waitForCallsign: async () => {
    await get().loadSettings();
    return get().getCallsign();
  },

  waitForCouplename: async () => {
    await get().loadSettings();
    return get().getCouplename();
  },

  waitForAppName: async () => {
    await get().loadSettings();
    return get().getAppName();
  },

  waitForCoupleOfficialDate: async () => {
    await get().loadSettings();
    return get().getCoupleOfficialDate();
  },

  waitForStartingGreetings: async () => {
    await get().loadSettings();
    return get().getStartingGreetings();
  },

  waitForTraits: async () => {
    await get().loadSettings();
    return get().getTraits();
  }
}));
