import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings";
import { useThemeStore } from "@/stores/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight, Music, Palette } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LyricPosterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LyricPosterDialog: React.FC<LyricPosterDialogProps> = ({ isOpen, onClose }) => {
  const { getCallsign } = useSettingsStore();
  const { getCurrentThemeColor } = useThemeStore();
  const isMobile = useIsMobile();
  
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showingMessage, setShowingMessage] = useState(false);

  const narratorMessages = [
    {
      text: `Hey gorgeous ${getCallsign() || "baby"}! 🎵`,
      delay: 0
    },
    {
      text: `I spent weeks learning canvas programming and image processing just to create this magical lyrics poster for you! ✨`,
      delay: 2000
    },
    {
      text: "I researched color theory, contrast algorithms, and text rendering techniques to make your favorite song lyrics come alive visually...",
      delay: 4000
    },
    {
      text: "Every character you see is actually a letter from the song lyrics! I mapped the brightness of each pixel to create this unique art form 💖",
      delay: 6000
    },
    {
      text: "The colors blend from our theme color in the shadows to pure white in the highlights - representing how your love brightens my world ✨",
      delay: 8000
    },
    {
      text: `Every pixel was crafted with love, ${getCallsign() || "beautiful"}. This is our song, painted in words, just for you! 💝`,
      delay: 10000
    }
  ];

  useEffect(() => {
    setThemeColor(getCurrentThemeColor());
  }, [getCurrentThemeColor]);

  useEffect(() => {
    if (isOpen) {
      setCurrentMessageIndex(0);
      setShowingMessage(false);
      
      // Start the message sequence
      const timer = setTimeout(() => {
        setShowingMessage(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showingMessage && currentMessageIndex < narratorMessages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 4000); // 4 seconds between messages

      return () => clearTimeout(timer);
    }
  }, [showingMessage, currentMessageIndex, narratorMessages.length]);

  const handleSkip = () => {
    setCurrentMessageIndex(narratorMessages.length - 1);
    setShowingMessage(true);
  };

  const handleNext = () => {
    if (currentMessageIndex < narratorMessages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
      setShowingMessage(true);
    }
  };

  const handlePrevious = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(prev => prev - 1);
      setShowingMessage(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="p-0 overflow-hidden border-0 z-50 animate-in zoom-in-95 duration-300"
        style={{
          background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}20, #ffffff)`,
          border: `3px solid ${themeColor}`,
          borderRadius: isMobile ? '16px' : '20px',
          maxWidth: isMobile ? 'min(350px, 95vw)' : 'min(500px, 90vw)',
          maxHeight: isMobile ? '85vh' : '90vh',
          margin: isMobile ? 'min(8px, 2vw)' : 'min(16px, 4vw)',
          boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 100vmax rgba(0,0,0,0.4)`
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-0">
          <div 
            className="relative text-center"
            style={{
              background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}30)`,
              borderBottom: `2px solid ${themeColor}40`,
              padding: isMobile ? 'min(12px, 3vw) min(16px, 4vw)' : 'min(16px, 4vw) min(24px, 6vw)'
            }}
          >
            <DialogTitle 
              className="flex items-center justify-center font-bold"
              style={{ 
                color: themeColor,
                fontSize: isMobile ? 'clamp(1rem, 4vw, 1.2rem)' : 'clamp(1.1rem, 3.5vw, 1.3rem)',
                gap: isMobile ? '8px' : '12px'
              }}
            >
              <Music size={isMobile ? 16 : 20} />
              {isMobile ? "Lyric Art Magic" : "Musical Lyric Art Creation"}
              <Palette size={isMobile ? 16 : 20} />
            </DialogTitle>
            
            <Badge 
              variant="secondary" 
              className="mt-2"
              style={{ 
                backgroundColor: `${themeColor}20`,
                color: themeColor,
                border: `1px solid ${themeColor}50`
              }}
            >
              <Heart size={14} className="mr-1" />
              Coded with Musical Love
            </Badge>
          </div>
        </DialogHeader>

        <div 
          style={{
            padding: isMobile ? 'min(16px, 4vw)' : 'min(24px, 6vw)',
            maxHeight: isMobile ? '60vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible'
          }}
        >
          {/* Narrator GIF Section */}
          <Card 
            className="mb-6 overflow-hidden border-2"
            style={{ borderColor: `${themeColor}50` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Narrator GIF */}
                <div 
                  className="shrink-0 rounded-full p-2 border-2"
                  style={{ 
                    borderColor: themeColor,
                    background: `${themeColor}10`
                  }}
                >
                  <img
                    src="/assets/explain.gif"
                    alt="Your boyfriend explaining his musical creation"
                    className="w-16 h-16 rounded-full object-cover"
                    style={{
                      filter: `sepia(1) hue-rotate(${themeColor === '#F2A6A6' ? '320deg' : '0deg'}) saturate(1.2)`,
                    }}
                  />
                </div>

                {/* Message Bubble */}
                <div 
                  className="flex-1 p-4 rounded-2xl relative"
                  style={{
                    background: `${themeColor}15`,
                    border: `2px solid ${themeColor}30`
                  }}
                >
                  {/* Speech bubble tail */}
                  <div
                    className="absolute left-0 top-4 w-0 h-0"
                    style={{
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: `12px solid ${themeColor}15`,
                      marginLeft: '-12px'
                    }}
                  />
                  
                  {showingMessage && (
                    <p 
                      className="text-sm font-medium leading-relaxed animate-fade-in"
                      style={{ 
                        color: '#333',
                        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                      }}
                    >
                      {narratorMessages[currentMessageIndex]?.text}
                    </p>
                  )}

                  {!showingMessage && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ 
                          backgroundColor: themeColor,
                          animationDelay: '0ms'
                        }}
                      />
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ 
                          backgroundColor: themeColor,
                          animationDelay: '150ms'
                        }}
                      />
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ 
                          backgroundColor: themeColor,
                          animationDelay: '300ms'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span 
                className="text-xs font-medium"
                style={{ color: `${themeColor}` }}
              >
                Progress
              </span>
              <span 
                className="text-xs"
                style={{ color: '#666' }}
              >
                {currentMessageIndex + 1} / {narratorMessages.length}
              </span>
            </div>
            <div 
              className="w-full h-2 rounded-full"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: themeColor,
                  width: `${((currentMessageIndex + 1) / narratorMessages.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Navigation and Action Buttons */}
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'grid grid-cols-2 gap-4'}`}>
            {/* Navigation Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'justify-center' : 'justify-start'}`}>
              <Button
                variant="outline"
                onClick={handlePrevious}
                size={isMobile ? "sm" : "sm"}
                disabled={currentMessageIndex === 0}
                style={{
                  borderColor: `${themeColor}50`,
                  color: themeColor,
                  opacity: currentMessageIndex === 0 ? 0.5 : 1,
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}
                className="hover:bg-opacity-20 flex items-center gap-1"
              >
                <ChevronLeft size={isMobile ? 14 : 16} />
                {isMobile ? "Prev" : "Previous"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNext}
                size={isMobile ? "sm" : "sm"}
                disabled={currentMessageIndex === narratorMessages.length - 1}
                style={{
                  borderColor: `${themeColor}50`,
                  color: themeColor,
                  opacity: currentMessageIndex === narratorMessages.length - 1 ? 0.5 : 1,
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}
                className="hover:bg-opacity-20 flex items-center gap-1"
              >
                Next
                <ChevronRight size={isMobile ? 14 : 16} />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'justify-center w-full' : 'justify-end'}`}>
              {currentMessageIndex < narratorMessages.length - 1 && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  size={isMobile ? "sm" : "sm"}
                  style={{
                    borderColor: `${themeColor}50`,
                    color: themeColor,
                    fontSize: isMobile ? '0.8rem' : '0.875rem'
                  }}
                  className="hover:bg-opacity-20"
                >
                  {isMobile ? "Skip" : "Skip to End"}
                </Button>
              )}
              
              <Button
                onClick={onClose}
                size={isMobile ? "sm" : "sm"}
                style={{
                  backgroundColor: themeColor,
                  color: 'white',
                  border: 'none',
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}
                className="hover:opacity-90 flex items-center gap-2"
              >
                <Heart size={isMobile ? 14 : 16} />
                {isMobile ? "So amazing! 🎵" : "This is so amazing! 🎵"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LyricPosterDialog;
