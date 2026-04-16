import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useTarotSelectionStore } from "../../../stores/tarotSelectionData";
import { aiTarotReadingService } from "../../../lib/AiTarotReading";
import LoadingOverlay from "@/components/LoadingOverlay";
import type { TarotReadingProps } from "../types";
import { getImagePath } from "../utils";

// Prevent duplicate AI generation calls (React 18 StrictMode runs effects twice in dev)
const IN_FLIGHT_AI_GENERATIONS = new Set<string>();

/**
 * Displays the final tarot reading with automatic AI-generated interpretations
 * Automatically generates personalized AI readings for each card position
 */
export const TarotReading: React.FC<TarotReadingProps> = ({
  selectedCards,
  themeColor,
  showReading
}) => {
  const isMobile = useIsMobile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  
  // Store access
  const { 
    getAiReadingSession, 
    setAiReadingSession, 
    hasAiReading,
    getReadingContext
  } = useTarotSelectionStore();
  
  // Get AI reading session if exists
  const aiSession = getAiReadingSession();
  const hasGeneratedReading = hasAiReading();
  
  // Custom titles for each card position - memoized to prevent re-creation
  const cardTitles = useMemo(() => [
    "How you feel about yourself",
    "What you want most right now",
    "Your fears",
    "What is going for you",
    "What is going against you",
    "The likely outcome"
  ], []);
  
  // Memoized key to track when we should generate a new reading
  // Include reading context so gf/user readings don't collide
  const shouldGenerateKey = useMemo(() => {
    const contextKey = getReadingContext() ? 'gf' : 'user';
    return `${selectedCards.map(c => c.name).join(',')}-${showReading}-${contextKey}`;
  }, [selectedCards, showReading, getReadingContext]);

  // Stable function to generate AI reading
  const generateAiReadingAutomatic = useCallback(async () => {
    // Only generate if we have cards, reading is shown, and no AI reading exists yet
    if (selectedCards.length !== 6 || !showReading || hasGeneratedReading || isGenerating || hasAttemptedGeneration) {
      return;
    }

    // Avoid duplicate calls (e.g. React StrictMode remount)
    if (IN_FLIGHT_AI_GENERATIONS.has(shouldGenerateKey)) {
      console.log('🔮 AI generation already in-flight, skipping duplicate call');
      return;
    }

    IN_FLIGHT_AI_GENERATIONS.add(shouldGenerateKey);
    setIsGenerating(true);
    setHasAttemptedGeneration(true);
    console.log('🔮 Auto-generating AI tarot reading...');

    try {
      const response = await aiTarotReadingService.generateTarotReading({
        selectedCards,
        cardTitles
      });
      
      if (response.success && response.session) {
        // Get current reading context from store
        const isGfReading = getReadingContext();
        console.log(`🔮 Auto-generated AI reading for: ${isGfReading ? 'girlfriend' : 'user'}`);
        
        // Pass the reading context to setAiReadingSession
        setAiReadingSession(response.session, isGfReading);
        console.log('🔮 AI tarot reading auto-generated successfully!');
      } else {
        console.error('Failed to generate AI reading:', response.error);
      }
    } catch (error) {
      console.error('Error auto-generating AI reading:', error);
    } finally {
      setIsGenerating(false);
      IN_FLIGHT_AI_GENERATIONS.delete(shouldGenerateKey);
    }
  }, [selectedCards, cardTitles, showReading, hasGeneratedReading, isGenerating, hasAttemptedGeneration, setAiReadingSession, getReadingContext, shouldGenerateKey]);

  // Reset attempt flag when shouldGenerateKey changes (new card selection)
  useEffect(() => {
    setHasAttemptedGeneration(false);
  }, [shouldGenerateKey]);

  // Automatically generate AI reading when component shows
  useEffect(() => {
    generateAiReadingAutomatic();
  }, [generateAiReadingAutomatic]);
  
  if (!showReading || selectedCards.length !== 6) return null;

  return (
    <Card 
      className="w-full mt-4 animate-in fade-in duration-700"
      style={{ borderColor: themeColor }}
    >
      <LoadingOverlay
        isOpen={isGenerating}
        themeColor={themeColor}
        title="Generating your reading…"
        description="Interpreting the cards"
      />

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
          Your Personalized Reading
          <Sparkles size={isMobile ? 24 : 32} className="animate-pulse" />
        </CardTitle>
        
        {/* Auto-generation Loading State */}
        {isGenerating && (
          <div className="text-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" style={{ color: themeColor }} />
              <span className="text-sm" style={{ color: themeColor }}>
                Generating your personalized reading...
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={isMobile ? 'space-y-4' : 'space-y-8'}>
          {selectedCards.map((card, index) => {
            // Get AI reading for this card if available
            const aiReading = hasGeneratedReading && aiSession?.readings[index];
            const useAiReading = aiReading && aiReading.cardIndex === index;
            
            return (
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
                    Card {index + 1}: {cardTitles[index]} »
                  </h4>
                  <h5 
                    className={`font-medium opacity-80 ${
                      isMobile ? 'text-sm mb-1' : 'text-base mb-2'
                    }`}
                    style={{ color: themeColor }}
                  >
                    {card.name}
                  </h5>
                  
                  {/* AI Reading or Loading */}
                  {useAiReading ? (
                    <div className={`text-gray-700 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                      <p>{aiReading.aiInterpretation}</p>
                    </div>
                  ) : isGenerating ? (
                    <div className={`text-gray-500 italic leading-relaxed ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      <p>Generating personalized interpretation...</p>
                    </div>
                  ) : (
                    <div className={`text-gray-700 leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
                      <p>{card.description.split('\n\n')[0]}</p>
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};