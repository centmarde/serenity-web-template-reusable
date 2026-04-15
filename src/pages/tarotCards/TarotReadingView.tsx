import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../stores/settings";
import { useThemeStore } from "../../stores/theme";
import { useTarotSelectionStore } from "../../stores/tarotSelectionData";
import { useIsMobile } from "../../hooks/use-mobile";
import { TarotReading } from "./components/TarotReading";
import { Button } from "@/components/ui/button";
import type { TarotCard } from "../../composables/tarotConstant";

interface ComponentData {
  themeColor: string;
  callsign: string;
  gfName: string;
  appName: string;
}

interface TarotReadingViewProps {
  onNavigate?: (path: string) => void;
}

const TarotReadingView: React.FC<TarotReadingViewProps> = ({ onNavigate }) => {
  const { getCallsign, getGfName, getAppName, loadSettings } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization, getSafeThemeColor } = useThemeStore();
  const { getSelectedCards, hasValidSelection, markReadingGenerated, getReadingContext } = useTarotSelectionStore();
  const isMobile = useIsMobile();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        setData({
          themeColor: getCurrentThemeColor() || getSafeThemeColor(),
          callsign: getCallsign(),
          gfName: getGfName(),
          appName: getAppName()
        });

        // Reading context is already set in store when "Create Reading" was clicked
        const isGfReading = getReadingContext();
        console.log(`🔮 TarotReadingView initialized for: ${isGfReading ? 'girlfriend' : 'user'}`);
        
        // Get selected cards from the store
        const storeCards = getSelectedCards();
        if (hasValidSelection()) {
          setSelectedCards(storeCards);
          markReadingGenerated(); // Mark that reading has been generated
        }
        
      } catch (error) {
        console.error('Failed to initialize TarotReadingView:', error);
        setData({
          themeColor: getSafeThemeColor(),
          callsign: "Love",
          gfName: "Beautiful",
          appName: "Love Space"
        });
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [
    getAppName,
    getCallsign,
    getCurrentThemeColor,
    getGfName,
    getReadingContext,
    getSafeThemeColor,
    getSelectedCards,
    hasValidSelection,
    initializeTheme,
    loadSettings,
    markReadingGenerated,
    waitForInitialization
  ]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your mystical reading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ${isMobile ? 'px-2 py-2' : 'px-16 py-4'}`}
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}08, ${data.themeColor}15, #ffffff)`,
      }}
    >
      <div className={`w-full ${isMobile ? 'space-y-2' : 'space-y-4'}`}>
       
        
        <TarotReading
          selectedCards={selectedCards}
          themeColor={data.themeColor}
          showReading={selectedCards.length === 6}
        />

        {selectedCards.length !== 6 && (
          <div className="text-center py-4">
            <p className="text-gray-600 text-base">
              No reading available. Please select 6 cards from the tarot deck first.
            </p>
            <Button 
              onClick={() => onNavigate ? onNavigate('/tarot-cards') : (window.location.href = '/tarot-cards')}
              className="inline-block mt-3 px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-200"
              style={{ 
                backgroundColor: data.themeColor,
                color: "white"
              }}
            >
              Select Your Cards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarotReadingView;