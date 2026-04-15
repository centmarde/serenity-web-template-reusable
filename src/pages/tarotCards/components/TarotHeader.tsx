import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye } from "lucide-react";
import { useTarotSelectionStore } from "../../../stores/tarotSelectionData";
import type { TarotHeaderProps } from "../types";

/**
 * Header component for the tarot cards interface
 * Shows dynamic titles, progress, and action buttons based on animation phase
 */
export const TarotHeader: React.FC<TarotHeaderProps> = ({
  themeColor,
  animationPhase,
  selectedCards,
  isMobile,
  onNavigate,

}) => {
  const { setSelectedCardsForReading, getReadingContext } = useTarotSelectionStore();

  const handleRevealReading = () => {
    // Get current reading context from store (set when "Create Reading" was clicked)
    const isGfReading = getReadingContext();
    console.log(`🔮 Revealing reading for: ${isGfReading ? 'girlfriend' : 'user'}`);
    
    // Clear any existing cache and save current selection for reading
    setSelectedCardsForReading(selectedCards);
    
    // Navigate to reading view (context is already in store)
    onNavigate('/tarot-cards/continue');
  };
  const getHeaderText = () => {
    switch (animationPhase) {
      case 'revealing': return 'Revealing the Mystical Deck...';
      case 'flipping': return 'Preparing the Cards...';
      case 'selecting': return 'Choose Your 6 Cards';
      default: return 'Choose Your 6 Cards';
    }
  };

  const getSubText = () => {
    switch (animationPhase) {
      case 'revealing': return 'Watch as the cards reveal themselves ✨';
      case 'flipping': return 'The cards are turning face down 🔮';
      case 'selecting': return 'Select exactly 6 cards for your mystical reading ✨';
      default: return 'Select exactly 6 cards for your mystical reading ✨';
    }
  };

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Sparkles size={isMobile ? 20 : 24} color={themeColor} className="animate-pulse" />
        <h2
          className="font-bold text-gray-800"
          style={{
            fontSize: isMobile ? "clamp(1.1rem, 4vw, 1.5rem)" : "clamp(1.25rem, 3vw, 1.75rem)",
            color: "#333333",
          }}
        >
          {getHeaderText()}
        </h2>
        <Sparkles size={isMobile ? 20 : 24} color={themeColor} className="animate-pulse" />
      </div>
      <p
        className="text-gray-600"
        style={{
          fontSize: isMobile ? "clamp(0.8rem, 3vw, 0.95rem)" : "clamp(0.875rem, 2.5vw, 1rem)",
          paddingLeft: isMobile ? "min(16px, 3vw)" : "0",
          paddingRight: isMobile ? "min(16px, 3vw)" : "0",
        }}
      >
        {getSubText()}
      </p>
      
      {/* Selection Progress - Only show during selecting phase */}
      {animationPhase === 'selecting' && (
        <div className={`flex items-center justify-center ${isMobile ? 'flex-col gap-3' : 'gap-4'}`}>
          <div 
            className="px-4 py-2 rounded-full font-medium"
            style={{
              backgroundColor: `${themeColor}20`,
              color: themeColor,
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            {selectedCards.length}/6 cards selected
          </div>
          <div className={`flex items-center justify-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
            {selectedCards.length === 6 && (
              <Button
                onClick={handleRevealReading}
                size={isMobile ? "sm" : "sm"}
                className="gap-1 animate-pulse"
                style={{ backgroundColor: themeColor, borderColor: themeColor }}
              >
                <Eye size={isMobile ? 12 : 14} />
                Reveal Reading
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};