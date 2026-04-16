import React, { useState, useEffect } from "react";
import { tarotCards, type TarotCard } from "../../../composables/tarotConstant";
import type { TarotCardsWidgetProps } from "../types";
import { useAnimationSequence } from "../hooks/useAnimationSequence";
import { TarotHeader } from "./TarotHeader";
import { TarotCardComponent } from "./TarotCardComponent";

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
  onNavigate,
  selectedCards: externalSelectedCards,
  setSelectedCards: externalSetSelectedCards,
  setAnimationPhase: externalSetAnimationPhase
}) => {
  const [internalSelectedCards, setInternalSelectedCards] = useState<TarotCard[]>([]);
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

  // Sync animation phase to external state for mobile
  useEffect(() => {
    if (isMobile && externalSetAnimationPhase) {
      externalSetAnimationPhase(animationPhase);
    }
  }, [animationPhase, isMobile, externalSetAnimationPhase]);

  const handleCardClick = (card: TarotCard) => {
    if (animationPhase !== 'selecting') return;

    // Check if card is already selected - if so, do nothing (no deselect to avoid cheating)
    if (selectedCards.find(c => c.name === card.name)) {
      return;
    }

    // Only allow selection if less than 6 cards selected
    if (selectedCards.length >= 6) {
      return;
    }

    setAnimatingCard(card.name);
    setTimeout(() => setAnimatingCard(null), 600);

    // Only add to selection (no deselect)
    setSelectedCards([...selectedCards, card]);
  };



  // Reveal reading functionality now handled by navigation to /tarot-cards/continue

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
          isMobile={isMobile}
          onNavigate={onNavigate || (() => {})}
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



      {/* Tarot Reading now handled in separate route */}
    </div>
  );
};

export default TarotCardsWidget;