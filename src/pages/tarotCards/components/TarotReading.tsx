import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
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
  if (!showReading || selectedCards.length !== 6) return null;

  return (
    <Card 
      className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in duration-700"
      style={{ borderColor: themeColor }}
    >
      <CardHeader>
        <CardTitle 
          className="text-center flex items-center justify-center gap-2"
          style={{ color: themeColor }}
        >
          <Sparkles size={24} className="animate-pulse" />
          Your Mystical Reading
          <Sparkles size={24} className="animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {selectedCards.map((card, index) => (
            <div 
              key={card.name}
              className="flex gap-4 p-4 rounded-lg animate-in slide-in-from-left duration-500"
              style={{ 
                backgroundColor: `${themeColor}10`,
                animationDelay: `${index * 200}ms` 
              }}
            >
              <div className="flex-none">
                <img
                  src={getImagePath(card.image)}
                  alt={card.name}
                  className="w-16 h-24 object-cover rounded shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/tarotCard.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <h4 
                  className="font-semibold mb-2"
                  style={{ color: themeColor }}
                >
                  {index + 1}. {card.name}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {card.description.split('\n\n')[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};