import type { TarotCard } from "../../../composables/tarotConstant";

// Animation phase type
export type AnimationPhase = 'loading' | 'revealing' | 'flipping' | 'selecting';

// Main widget props
export interface TarotCardsWidgetProps {
  themeColor: string;
  isMobile: boolean;
  // Optional props for mobile view when TarotHeader is rendered externally
  selectedCards?: TarotCard[];
  setSelectedCards?: (cards: TarotCard[]) => void;
  setAnimationPhase?: (phase: AnimationPhase) => void;
  setShowReading?: (show: boolean) => void;
}

// Component props interfaces
export interface TarotHeaderProps {
  themeColor: string;
  animationPhase: AnimationPhase;
  selectedCards: TarotCard[];
  onRevealReading: () => void;
  showReading: boolean;
  isMobile: boolean;
}

export interface TarotCardProps {
  card: TarotCard;
  index: number;
  themeColor: string;
  isRevealed: boolean;
  isFlipped: boolean;
  isSelected: boolean;
  isAnimating: boolean;
  animationPhase: AnimationPhase;
  selectedCards: TarotCard[];
  onClick: () => void;
  isMobile: boolean;
}



export interface TarotReadingProps {
  selectedCards: TarotCard[];
  themeColor: string;
  showReading: boolean;
}