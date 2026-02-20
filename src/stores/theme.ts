import { create } from 'zustand';
import { useSettingsStore } from './settings';

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  card: string;
  cardForeground: string;
  border: string;
  ring: string;
}

interface ThemeStore {
  currentThemeColor: string | null;
  isDark: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeTheme: () => Promise<void>;
  setThemeColor: (color: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  getCurrentThemeColor: () => string;
  isThemeInitialized: () => boolean;
  waitForInitialization: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  currentThemeColor: null,
  isDark: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  initializeTheme: async () => {
    const { isLoading, isInitialized } = get();
    
    if (isInitialized || isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Load theme preferences from settings
      const themeColor = await useSettingsStore.getState().waitForThemeColor();
      const isDark = await useSettingsStore.getState().waitForIsDarkMode();
      
      set({ 
        currentThemeColor: themeColor, 
        isDark,
        isInitialized: true, 
        isLoading: false,
        error: null
      });

      // Apply theme colors to DOM
      updateThemeColors(themeColor, isDark);

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newIsDark = e.matches;
        set({ isDark: newIsDark });
        const currentColor = get().currentThemeColor;
        if (currentColor) {
          updateThemeColors(currentColor, newIsDark);
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize theme';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isInitialized: false 
      });
      throw new Error(errorMessage);
    }
  },

  setThemeColor: (color: string) => {
    const { isInitialized, isDark } = get();
    if (!isInitialized) {
      throw new Error('Theme manager not initialized. Cannot set theme color.');
    }
    set({ currentThemeColor: color });
    updateThemeColors(color, isDark);
  },

  toggleDarkMode: () => {
    const { isDark, currentThemeColor } = get();
    const newIsDark = !isDark;
    set({ isDark: newIsDark });
    document.documentElement.classList.toggle('dark', newIsDark);
    if (currentThemeColor) {
      updateThemeColors(currentThemeColor, newIsDark);
    }
  },

  setDarkMode: (isDark: boolean) => {
    const { currentThemeColor } = get();
    set({ isDark });
    document.documentElement.classList.toggle('dark', isDark);
    if (currentThemeColor) {
      updateThemeColors(currentThemeColor, isDark);
    }
  },

  getCurrentThemeColor: () => {
    const { currentThemeColor } = get();
    if (!currentThemeColor) {
      throw new Error('Theme color not initialized. Settings must be loaded first.');
    }
    return currentThemeColor;
  },

  isThemeInitialized: () => {
    return get().isInitialized && get().currentThemeColor !== null;
  },

  waitForInitialization: async () => {
    const { isInitialized } = get();
    if (isInitialized) {
      return;
    }
    
    await get().initializeTheme();
  }
}));

// Helper function to convert hex to OKLCH (simplified)
function hexToOklch(hex: string): { l: number; c: number; h: number } {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Simple approximation for OKLCH conversion
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const chroma = Math.sqrt(Math.pow(r - luminance, 2) + Math.pow(g - luminance, 2) + Math.pow(b - luminance, 2));
  const hue = Math.atan2(g - luminance, r - luminance) * 180 / Math.PI;
  
  return {
    l: luminance,
    c: chroma * 0.4,
    h: hue < 0 ? hue + 360 : hue
  };
}

// Helper function to generate theme colors based on the theme color and dark mode
function generateThemeColors(themeColor: string, isDark: boolean): ThemeColors {
  const oklch = hexToOklch(themeColor);
  
  if (isDark) {
    return {
      primary: `oklch(${Math.min(0.8, oklch.l + 0.3)} ${oklch.c} ${oklch.h})`,
      primaryForeground: `oklch(0.1 0 0)`,
      secondary: `oklch(0.25 ${oklch.c * 0.3} ${oklch.h})`,
      secondaryForeground: `oklch(0.9 0 0)`,
      accent: `oklch(0.3 ${oklch.c * 0.5} ${oklch.h})`,
      accentForeground: `oklch(0.95 0 0)`,
      destructive: `oklch(0.7 0.2 15)`,
      card: `oklch(0.18 0 0)`,
      cardForeground: `oklch(0.95 0 0)`,
      border: `oklch(0.3 ${oklch.c * 0.2} ${oklch.h})`,
      ring: `oklch(${oklch.l} ${oklch.c * 0.8} ${oklch.h})`
    };
  } else {
    return {
      primary: `oklch(${Math.max(0.3, oklch.l - 0.2)} ${oklch.c} ${oklch.h})`,
      primaryForeground: `oklch(0.98 0 0)`,
      secondary: `oklch(0.96 ${oklch.c * 0.1} ${oklch.h})`,
      secondaryForeground: `oklch(0.2 0 0)`,
      accent: `oklch(0.94 ${oklch.c * 0.2} ${oklch.h})`,
      accentForeground: `oklch(0.2 0 0)`,
      destructive: `oklch(0.55 0.2 15)`,
      card: `oklch(0.98 0 0)`,
      cardForeground: `oklch(0.15 0 0)`,
      border: `oklch(0.9 ${oklch.c * 0.1} ${oklch.h})`,
      ring: `oklch(${oklch.l} ${oklch.c * 0.6} ${oklch.h})`
    };
  }
}

// Helper function to update DOM with theme colors
function updateThemeColors(themeColor: string, isDark: boolean) {
  const colors = generateThemeColors(themeColor, isDark);
  const root = document.documentElement;

  // Update CSS custom properties
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.accentForeground);
  root.style.setProperty('--destructive', colors.destructive);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--card-foreground', colors.cardForeground);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--ring', colors.ring);

  // Update the corresponding color-* properties for Tailwind
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-foreground', colors.accentForeground);
  root.style.setProperty('--color-destructive', colors.destructive);
  root.style.setProperty('--color-card', colors.card);
  root.style.setProperty('--color-card-foreground', colors.cardForeground);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-ring', colors.ring);
}

// Create singleton instance for backward compatibility
class ThemeManagerCompat {
  async initTheme(): Promise<void> {
    return useThemeStore.getState().initializeTheme();
  }

  async waitForInitialization(): Promise<void> {
    return useThemeStore.getState().waitForInitialization();
  }

  getCurrentThemeColor(): string {
    return useThemeStore.getState().getCurrentThemeColor();
  }

  toggleDarkMode(): void {
    useThemeStore.getState().toggleDarkMode();
  }

  setDarkMode(isDark: boolean): void {
    useThemeStore.getState().setDarkMode(isDark);
  }

  async setThemeColor(color: string): Promise<void> {
    useThemeStore.getState().setThemeColor(color);
  }

  isThemeInitialized(): boolean {
    return useThemeStore.getState().isThemeInitialized();
  }

  isDarkMode(): boolean {
    return useThemeStore.getState().isDark;
  }
}

export const themeManager = new ThemeManagerCompat();
export const themeStore = themeManager; // Alias for backward compatibility