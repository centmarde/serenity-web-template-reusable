import { useState, useEffect, useCallback } from "react";
import { tarotCards } from "../../../composables/tarotConstant";
import type { AnimationPhase } from "../types";

/**
 * Custom hook for managing the complex tarot card animation sequence
 * Handles the four-phase animation: loading -> revealing -> compressing -> flipping -> selecting
 */
export const useAnimationSequence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('loading');
  const [revealedCards, setRevealedCards] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);

  const startFlipAnimation = useCallback(() => {
    // Phase 4: Flip all cards face down
    tarotCards.forEach((card, index) => {
      setTimeout(() => {
        setFlippedCards(prev => [...prev, card.name]);
        
        // After last card is flipped, enable selection
        if (index === tarotCards.length - 1) {
          setTimeout(() => {
            setAnimationPhase('selecting');
          }, 500);
        }
      }, index * 30); // Faster flip animation
    });
  }, []);

  const startCompressAnimation = useCallback(() => {
    // Phase 3: Compress all cards together
    setAnimationPhase('compressing');
    
    // After compression animation completes, start flipping
    setTimeout(() => {
      setAnimationPhase('flipping');
      startFlipAnimation();
    }, 1200); // Allow time for compression animation
  }, [startFlipAnimation]);

  const startRevealAnimation = useCallback(() => {
    // Phase 2: Reveal cards one by one (face up)
    tarotCards.forEach((card, index) => {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, card.name]);
        
        // After last card is revealed, wait then start compression
        if (index === tarotCards.length - 1) {
          setTimeout(() => {
            startCompressAnimation();
          }, 1000);
        }
      }, index * 50); // Stagger reveal by 50ms each
    });
  }, [startCompressAnimation]);

  const resetAnimations = useCallback(() => {
    setRevealedCards([]);
    setFlippedCards([]);
    setAnimationPhase('revealing');
    setTimeout(() => startRevealAnimation(), 100);
  }, [startRevealAnimation]);

  useEffect(() => {
    // Phase 1: Loading -> revealing -> compressing -> flipping -> selecting
    const startAnimationSequence = () => {
      setTimeout(() => {
        setIsLoading(false);
        setAnimationPhase('revealing');
        startRevealAnimation();
      }, 800);
    };

    startAnimationSequence();
  }, [startRevealAnimation]);

  return {
    isLoading,
    animationPhase,
    revealedCards,
    flippedCards,
    resetAnimations
  };
};