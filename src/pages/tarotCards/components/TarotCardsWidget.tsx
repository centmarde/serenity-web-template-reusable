import React, { useState, useEffect } from "react";
import { tarotCards, type TarotCard } from "../../../composables/tarotConstant";
import type { TarotCardsWidgetProps } from "../types";
import { useAnimationSequence } from "../hooks/useAnimationSequence";
import { TarotHeader } from "./TarotHeader";
import { TarotCardComponent } from "./TarotCardComponent";
import { TarotReading } from "./TarotReading";

/**
 * Main tarot cards widget component
 * Orchestrates the tarot card selection experience with animations
 */

/**
 * Fisher-Yates shuffle algorithm for randomizing card order
 * Uses function declaration to avoid JSX parsing issues with generics
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const TarotCardsWidget: React.FC<TarotCardsWidgetProps> = ({ 
  themeColor, 
  isMobile,
  selectedCards: externalSelectedCards,
  setSelectedCards: externalSetSelectedCards,
  setAnimationPhase: externalSetAnimationPhase,
  setShowReading: externalSetShowReading
}) => {
  const [internalSelectedCards, setInternalSelectedCards] = useState<TarotCard[]>([]);
  const [internalShowReading, setInternalShowReading] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);
  
  // Create shuffled cards array once on component mount
  const [shuffledCards] = useState<TarotCard[]>(() => shuffleArray(tarotCards));
  
  // Create a second shuffle for compression phase
  const [compressedCards] = useState<TarotCard[]>(() => shuffleArray(tarotCards));
  
  // Animation sequence hook (must be before currentCards calculation)
  const {
    isLoading,
    animationPhase,
    revealedCards,
    flippedCards,
  } = useAnimationSequence();
  
  // Determine which card array to use based on animation phase
  const currentCards = animationPhase === 'compressing' || animationPhase === 'flipping' || animationPhase === 'selecting' 
    ? compressedCards 
    : shuffledCards;
  
  // Use external state for mobile, internal state for desktop
  const selectedCards = isMobile && externalSelectedCards !== undefined ? externalSelectedCards : internalSelectedCards;
  const setSelectedCards = isMobile && externalSetSelectedCards ? externalSetSelectedCards : setInternalSelectedCards;
  const showReading = isMobile && externalSetShowReading ? false : internalShowReading; // Mobile reading handled externally
  const setShowReading = isMobile && externalSetShowReading ? externalSetShowReading : setInternalShowReading;

  // Sync animation phase to external state for mobile
  useEffect(() => {
    if (isMobile && externalSetAnimationPhase) {
      externalSetAnimationPhase(animationPhase);
    }
  }, [animationPhase, isMobile, externalSetAnimationPhase]);

  const handleCardClick = (card: TarotCard) => {
    if (animationPhase !== 'selecting') return;

    if (selectedCards.length >= 6 && !selectedCards.find(c => c.name === card.name)) {
      return;
    }

    setAnimatingCard(card.name);
    setTimeout(() => setAnimatingCard(null), 600);

    const isSelected = selectedCards.find(c => c.name === card.name);
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => c.name !== card.name));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };



  const revealReading = () => {
    if (selectedCards.length === 6) {
      setShowReading(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        ></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header Section - Only show in desktop, mobile renders it separately */}
      {!isMobile && (
        <TarotHeader
          themeColor={themeColor}
          animationPhase={animationPhase}
          selectedCards={selectedCards}
          onRevealReading={revealReading}
          showReading={showReading}
          isMobile={isMobile}
        />
      )}

      {/* Deck of Cards Layout */}
      <div className="flex justify-center items-center" style={{ minHeight: isMobile ? '350px' : '400px' }}>
        <div 
          className="relative"
          style={{
            width: isMobile ? '100%' : 'min(1200px, 85vw)',
            height: isMobile ? '300px' : '300px',
            maxWidth: isMobile ? '400px' : '1200px',
          }}
        >
          {currentCards.map((card, index) => {
            const isRevealed = revealedCards.includes(card.name);
            const isFlipped = flippedCards.includes(card.name);
            const isSelected = !!selectedCards.find(c => c.name === card.name);
            const isAnimating = animatingCard === card.name;
            
            return (
              <TarotCardComponent
                key={`${card.name}-${animationPhase}`} // Include phase in key to trigger re-render on reshuffle
                card={card}
                index={index}
                themeColor={themeColor}
                isRevealed={isRevealed}
                isFlipped={isFlipped}
                isSelected={isSelected}
                isAnimating={isAnimating}
                animationPhase={animationPhase}
                selectedCards={selectedCards}
                onClick={() => handleCardClick(card)}
                isMobile={isMobile}
                totalCards={currentCards.length}
              />
            );
          })}
        </div>
      </div>



      {/* Tarot Reading Display */}
      <TarotReading
        selectedCards={selectedCards}
        themeColor={themeColor}
        showReading={showReading}
      />
    </div>
  );
};

export default TarotCardsWidget;