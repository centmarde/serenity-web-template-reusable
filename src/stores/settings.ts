import { create } from 'zustand';
import axios from 'axios';

export interface DialogMessages {
  welcomeMessage: string;
  workInProgressNotice: string;
  featureComingSoon: string;
  counterDialogDescription: string;
  betaBadge: string;
  madeWithLove: string;
  inDevelopment: string;
  comingSoon: string;
}

export interface Settings {
  themeColor: string;
  isDarkMode: boolean;
  callsign: string;
  gf_name: string;
  bf_name: string;
  appName: string;
  coupleOfficialDate: string;
  startingGreetings: string;
  traits: string[];
  songTitle: string;
  songArtist: string;
  dialogMessages: DialogMessages;
}

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  getThemeColor: () => string;
  getIsDarkMode: () => boolean;
  getCallsign: () => string;
  getGfName: () => string;
  getBfName: () => string;
  getAppName: () => string;
  getCoupleOfficialDate: () => string;
  getStartingGreetings: () => string;
  getTraits: () => string[];
  getRandomTrait: () => string;
  getSongTitle: () => string;
  getSongArtist: () => string;
  getDialogMessages: () => DialogMessages;
  waitForThemeColor: () => Promise<string>;
  waitForIsDarkMode: () => Promise<boolean>;
  waitForCallsign: () => Promise<string>;
  waitForGfName: () => Promise<string>;
  waitForBfName: () => Promise<string>;
  waitForAppName: () => Promise<string>;
  waitForCoupleOfficialDate: () => Promise<string>;
  waitForStartingGreetings: () => Promise<string>;
  waitForTraits: () => Promise<string[]>;
  waitForSongTitle: () => Promise<string>;
  waitForSongArtist: () => Promise<string>;
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
      
      if (fetchedSettings.gf_name === undefined) {
        throw new Error('gf_name not found in settings.json');
      }
      
      if (fetchedSettings.bf_name === undefined) {
        throw new Error('bf_name not found in settings.json');
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

      if (!fetchedSettings.songTitle) {
        throw new Error('songTitle not found in settings.json');
      }

      if (!fetchedSettings.songArtist) {
        throw new Error('songArtist not found in settings.json');
      }
      
      // DialogMessages is optional - if not present, fallbacks will be used
      
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

  getIsDarkMode: () => {
    const { settings } = get();
    if (!settings || settings.isDarkMode === undefined) {
      // Default to false (light mode) if not specified
      return false;
    }
    return settings.isDarkMode;
  },

  getCallsign: () => {
    const { settings } = get();
    if (!settings || settings.callsign === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.callsign;
  },

  getGfName: () => {
    const { settings } = get();
    if (!settings || settings.gf_name === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.gf_name;
  },

  getBfName: () => {
    const { settings } = get();
    if (!settings || settings.bf_name === undefined) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.bf_name;
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

  getSongTitle: () => {
    const { settings } = get();
    if (!settings || !settings.songTitle) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.songTitle;
  },

  getSongArtist: () => {
    const { settings } = get();
    if (!settings || !settings.songArtist) {
      throw new Error('Settings not loaded. Call loadSettings() first.');
    }
    return settings.songArtist;
  },

  getDialogMessages: () => {
    const { settings } = get();
    if (!settings || !settings.dialogMessages) {
      // Provide fallback dialog messages
      return {
        welcomeMessage: "Welcome to your personal love space",
        workInProgressNotice: "This system is currently under active development. Some features may be incomplete or subject to change. I appreciate your patience",
        featureComingSoon: "This feature is currently being built with love and attention to detail. Thank you for your patience",
        counterDialogDescription: "Every moment with you has been a treasure. Here's how long we've been creating beautiful memories together.",
        betaBadge: "Beta Version",
        madeWithLove: "Made with 💝",
        inDevelopment: "In Development",
        comingSoon: "Coming Soon 🚀"
      };
    }
    return settings.dialogMessages;
  },

  waitForThemeColor: async () => {
    await get().loadSettings();
    return get().getThemeColor();
  },

  waitForIsDarkMode: async () => {
    await get().loadSettings();
    return get().getIsDarkMode();
  },

  waitForCallsign: async () => {
    await get().loadSettings();
    return get().getCallsign();
  },

  waitForGfName: async () => {
    await get().loadSettings();
    return get().getGfName();
  },

  waitForBfName: async () => {
    await get().loadSettings();
    return get().getBfName();
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
  },

  waitForSongTitle: async () => {
    await get().loadSettings();
    return get().getSongTitle();
  },

  waitForSongArtist: async () => {
    await get().loadSettings();
    return get().getSongArtist();
  }
}));
