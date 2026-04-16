import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { TarotCardProps } from "../types";
import { getImagePath, calculateCardPosition } from "../utils";

/**
 * Individual tarot card component with animations and interactions
 * Handles card positioning, animations, and visual states
 */
export const TarotCardComponent: React.FC<TarotCardProps> = ({
  card,
  index,
  themeColor,
  isRevealed,
  isFlipped,
  isSelected,
  isAnimating,
  animationPhase,
  selectedCards,
  onClick,
  isMobile,
  totalCards
}) => {
  const canSelect = (animationPhase === 'selecting') && (selectedCards.length < 6 || isSelected);
  const { leftPosition, topPosition, rotation, isMobileLayout } = calculateCardPosition(index, totalCards, isMobile, animationPhase);
  
  // Add slight rotation variation during compression for visual reshuffling effect
  const compressionRotation = animationPhase === 'compressing' 
    ? rotation + (index % 3 - 1) * 5 // Slight rotation variation (-5, 0, +5 degrees)
    : rotation;

  return (
    <div
      className={`absolute transition-all duration-700 ${
        animationPhase === 'selecting' && canSelect ? 'cursor-pointer hover:scale-105' : ''
      } ${!canSelect && animationPhase === 'selecting' ? 'opacity-50' : 'opacity-100'}`}
      style={{
        left: isMobileLayout ? `calc(50% + ${leftPosition}px)` : `calc(50% + ${leftPosition}px)`,
        top: isMobileLayout ? `calc(50% + ${topPosition}px)` : '50%',
        transform: `
          ${isMobileLayout ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)'} 
          rotate(${compressionRotation}deg)
          ${animationPhase === 'compressing' ? 'scale(0.85) rotateY(10deg)' : ''}
          ${isAnimating ? (isMobileLayout ? 'scale(1.1)' : 'translateY(-20px) scale(1.1)') : ''}
          ${isSelected ? (isMobileLayout ? 'translateY(-55px) scale(1.15)' : 'translateY(-90px) scale(1.12)') : ''}
        `,
        transformOrigin: 'center center',
        zIndex: isSelected ? 1000 : isAnimating ? 999 : 100 + index,
        opacity: isRevealed || animationPhase === 'selecting' ? 1 : 0,
        transition: animationPhase === 'compressing' 
          ? `all 1.2s ease-in-out ${index * 80}ms` // Longer, staggered transition for compression
          : `all 0.7s ease-in-out ${index * 50}ms`,
      }}
      onClick={() => canSelect && onClick()}
    >
      <Card
        className={`transition-all duration-500 ${
          isSelected ? 'ring-4 ring-opacity-75 shadow-2xl' : ''
        } ${isAnimating ? 'animate-pulse' : ''} ${
          animationPhase === 'compressing' ? 'animate-pulse' : ''
        }`}
        style={{
          width: isMobileLayout ? '70px' : '100px',
          height: isMobileLayout ? '105px' : '150px',
          borderColor: isSelected ? themeColor : '#e5e7eb',
          '--tw-ring-color': isSelected ? themeColor : 'transparent',
          boxShadow: isSelected ? `0 0 40px ${themeColor}60` : 
                     animationPhase === 'compressing' ? `0 0 20px ${themeColor}40` : 
                     '0 4px 8px rgba(0,0,0,0.1)',
          background: isFlipped && !isSelected ? '#4a5568' : 'white',
        } as React.CSSProperties}
      >
        <CardContent className="p-2 h-full">
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            {/* Face Down State */}
            {isFlipped && !isSelected && (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(45deg, ${themeColor}40, ${themeColor}60)`,
                }}
              >
                <Sparkles 
                  size={20} 
                  color="white" 
                  className="animate-pulse" 
                />
              </div>
            )}
            
            {/* Face Up State */}
            {((animationPhase === 'revealing' && isRevealed) || isSelected) && (
              <img
                src={getImagePath(card.image)}
                alt={card.name}
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  filter: isSelected ? 'brightness(1.2) saturate(1.2)' : 'brightness(1)',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/tarotCard.png';
                }}
              />
            )}
            
            {/* Selected Card Overlay */}
            {isSelected && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <div className="text-center">
                  <Sparkles 
                    size={16} 
                    color="white" 
                    className="animate-spin mx-auto" 
                  />
                  <div 
                    className="text-white font-bold text-xs mt-1 drop-shadow-lg"
                  >
                    {selectedCards.findIndex(c => c.name === card.name) + 1}
                  </div>
                </div>
              </div>
            )}
            
            {/* Animation Ping Effect */}
            {isAnimating && (
              <div className="absolute inset-0 bg-white bg-opacity-40 animate-ping rounded-lg"></div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};