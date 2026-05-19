import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Heart } from 'lucide-react';
import MemoriesWidget from './components/MemoriesWidget';
import { MemoriesUploadDialog } from './dialogs/MemoriesUploadDialog';
import { Button } from '../../components/ui/button';
import { useThemeStore } from '../../stores/theme';
import { useSettingsStore } from '../../stores/settings';
import { useMemoriesStore } from '../../stores/memoriesData';

export const MemoriesView: React.FC = () => {
  const { getCurrentThemeColor, waitForInitialization } = useThemeStore();
  const { loadSettings } = useSettingsStore();
  const { checkCanAddMemory, canAddMemory } = useMemoriesStore();
  const [themeColor, setThemeColor] = useState<string>('#F2A6A6');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // Key to trigger widget reload

  // Refresh data after successful memory creation
  const handleMemorySuccess = useCallback(async () => {
    // Force refresh the permission check since a new memory was just created
    await checkCanAddMemory(true);
    // Trigger widget reload by incrementing key
    setReloadKey(prev => prev + 1);
    // Close the dialog
    setIsUploadDialogOpen(false);
  }, [checkCanAddMemory]);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        await waitForInitialization();
        await loadSettings();
        const color = getCurrentThemeColor();
        setThemeColor(color);
        
        // Check if user can add a new memory
        await checkCanAddMemory();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Use fallback color
        setThemeColor('#F2A6A6');
        setIsLoading(false);
      }
    };
    initializeTheme();
  }, [getCurrentThemeColor, waitForInitialization, loadSettings, checkCanAddMemory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900"
      style={{
        background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}20, #ffffff)`,
      }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r opacity-10"
          style={{
            background: `linear-gradient(to right, ${themeColor}, ${themeColor}80, ${themeColor})`,
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{
              background: `linear-gradient(to right, ${themeColor}, ${themeColor}dd, ${themeColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Our Beautiful Memories
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8">
            Every moment we've shared together has been a treasure. 
            Here's our journey through time, filled with love, laughter, and endless joy.
          </p>
          
          {/* Add Memory Button */}
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            disabled={canAddMemory === false}
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              backgroundColor: themeColor,
              borderColor: themeColor,
            }}
          >
            <Plus className="w-5 h-5" />
            Add New Memory
          </Button>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative">
        <MemoriesWidget key={reloadKey} />
      </div>

      {/* Footer Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div 
          className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border"
          style={{
            borderColor: `${themeColor}30`,
            backgroundColor: `${themeColor}05`,
          }}
        >
          <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            More memories to come...
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Our story continues to unfold with each passing day. 
            Every new adventure adds another precious memory to our collection.
          </p>
        </div>
      </div>

      {/* Floating Action Button - Alternative placement */}
      <Button
        onClick={() => setIsUploadDialogOpen(true)}
        disabled={canAddMemory === false}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{
          backgroundColor: themeColor,
          borderColor: themeColor,
        }}
      >
        <Heart className="w-6 h-6 text-white" />
      </Button>

      {/* Upload Dialog */}
      <MemoriesUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={handleMemorySuccess}
      />
    </div>
  );
};

export default MemoriesView;
