import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import type { TarotReadingProps } from "../types";
import { getImagePath } from "../utils";

/**
 * Displays the final tarot reading with selected cards and their descriptions
 * Shows each card with its interpretation in a detailed format
 */
export const TarotReading: React.FC<TarotReadingProps> = ({
  selectedCards,
  themeColor,
  showReading
}) => {
  const isMobile = useIsMobile();
  
  if (!showReading || selectedCards.length !== 6) return null;

  return (
    <Card 
      className="w-full mt-4 animate-in fade-in duration-700"
      style={{ borderColor: themeColor }}
    >
      <CardHeader>
        <CardTitle 
          className={`text-center flex items-center justify-center font-bold ${
            isMobile 
              ? 'gap-2 text-lg flex-col sm:flex-row' 
              : 'gap-3 text-2xl'
          }`}
          style={{ color: themeColor }}
        >
          <Sparkles size={isMobile ? 24 : 32} className="animate-pulse" />
          Your Mystical Reading
          <Sparkles size={isMobile ? 24 : 32} className="animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={isMobile ? 'space-y-4' : 'space-y-8'}>
          {selectedCards.map((card, index) => (
            <div 
              key={card.name}
              className={`rounded-lg animate-in slide-in-from-left duration-500 ${
                isMobile 
                  ? 'flex flex-col gap-3 p-3' 
                  : 'flex gap-6 p-6'
              }`}
              style={{ 
                backgroundColor: `${themeColor}10`,
                animationDelay: `${index * 200}ms` 
              }}
            >
              <div className={isMobile ? 'flex justify-center' : 'flex-none'}>
                <img
                  src={getImagePath(card.image)}
                  alt={card.name}
                  className={`object-contain rounded shadow-lg bg-white ${
                    isMobile 
                      ? 'w-57 h-90 py-5' 
                      : 'w-57 h-90 py-5'
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/tarotCard.png';
                  }}
                />
              </div>
              <div className={isMobile ? 'text-center' : 'flex-1'}>
                <h4 
                  className={`font-semibold ${
                    isMobile 
                      ? 'mb-2 text-base' 
                      : 'mb-3 text-lg'
                  }`}
                  style={{ color: themeColor }}
                >
                  Card {index + 1}: {card.name} »
                </h4>
                <p className={`text-gray-700 leading-relaxed ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  {card.description.split('\n\n')[0]}
                </p>
                {card.description.split('\n\n')[1] && (
                  <p className={`text-gray-600 leading-relaxed ${
                    isMobile 
                      ? 'mt-2 text-sm' 
                      : 'mt-3'
                  }`}>
                    {card.description.split('\n\n')[1]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};