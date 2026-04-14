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
import { Heart, ChevronLeft, ChevronRight, Flower2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FlowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlowersDialog: React.FC<FlowersDialogProps> = ({ isOpen, onClose }) => {
  const { getCallsign} = useSettingsStore();
  const { getCurrentThemeColor } = useThemeStore();
  const isMobile = useIsMobile();
  
  const [themeColor, setThemeColor] = useState("#F2A6A6");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showingMessage, setShowingMessage] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const narratorMessages = [
    {
      text: `Look at this beautiful flower garden I created for you, ${getCallsign() || "my love"}! 🌻`,
      delay: 0,
      image: "/flowers/rose.png"
    },
    {
      text: `I spent days learning CSS animations and 3D transforms just to make these flowers bloom perfectly! ✨`,
      delay: 2000,
      image: "/assets/dudu-cute.gif"
    },
    {
      text: "Each petal was carefully animated with different timing and rotation angles to create the most natural blooming effect...",
      delay: 4000,
      image: "/flowers/tulips.png"
    },
    {
      text: "The vines grow first, then the leaves appear, and finally the beautiful flowers bloom - just like real nature! 🌿",
      delay: 6000,
      image: "/assets/peach-goma.gif"
    },
    {
      text: "I even made sure the animation timing was perfect - vines at 2 seconds, leaves during growth, and flowers at 7 seconds!",
      delay: 8000,
      image: "/flowers/rose1.png"
    },
    {
      text: "The floating hearts and sparkling effects? I coded those thinking of all the love I have for you 💖",
      delay: 10000,
      image: "/assets/celeb.gif"
    },
    {
      text: `Every bloom represents how my love for you grows stronger each day, ${getCallsign() || "beautiful"}. This garden is eternal, just like my feelings! 🌺`,
      delay: 12000,
      image: "/assets/blee.gif"
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

  // Removed auto-next functionality - user now controls navigation manually

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
        className="p-0 overflow-hidden max-w-[95vw] sm:max-w-125"
        showCloseButton={false}
        style={{
          background: '#ffffff',
          border: `3px solid ${themeColor}`,
          borderRadius: isMobile ? '16px' : '20px',
          maxHeight: isMobile ? '85vh' : '90vh',
          boxShadow: `0 20px 40px rgba(0,0,0,0.3)`
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-0">
          <div 
            className="relative text-center"
            style={{
              background: '#ffffff',
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
              <Flower2 size={isMobile ? 16 : 20} />
              {isMobile ? "Blooming Garden" : "Blooming Garden of Love"}
              <Flower2 size={isMobile ? 16 : 20} />
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
              Animated with Pure Love
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
                    background: '#ffffff'
                  }}
                >
                  <img
                    src="/assets/dudu-cute.gif"
                    alt="Your boyfriend showing his flower creation"
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
                    background: '#ffffff',
                    border: `2px solid ${themeColor}30`
                  }}
                >
                  {/* Speech bubble tail */}
                  <div
                    className="absolute left-0 top-4 w-0 h-0"
                    style={{
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderRight: `12px solid #ffffff`,
                      marginLeft: '-12px'
                    }}
                  />
                  
                  {showingMessage && (
                    <div className="space-y-3 animate-fade-in">
                      {/* Message Image */}
                      {narratorMessages[currentMessageIndex]?.image && (
                        <div 
                          className="rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                          onClick={() => setFullscreenImage(narratorMessages[currentMessageIndex].image)}
                        >
                          <img
                            src={narratorMessages[currentMessageIndex].image}
                            alt="Message attachment"
                            className="w-full h-32 object-cover hover:scale-105 transition-transform duration-200"
                            style={{ 
                              maxHeight: isMobile ? '120px' : '128px'
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Message Text */}
                      <p 
                        className="text-sm font-medium leading-relaxed"
                        style={{ 
                          color: '#333',
                          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                        }}
                      >
                        {narratorMessages[currentMessageIndex]?.text}
                      </p>
                    </div>
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
          <div className={`flex gap-2 ${isMobile ? 'flex-col space-y-2' : 'justify-between items-center'}`}>
            {/* Navigation Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'justify-center' : ''}`}>
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
            <div className={`flex gap-2 ${isMobile ? 'justify-center w-full' : ''}`}>
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
                {isMobile ? "Love it! 🌺" : "Aww, I love it! 🌺"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Image Preview Dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent 
          className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] max-h-[95vh] w-fit h-fit"
          style={{
            maxWidth: '95vw',
            maxHeight: '95vh',
            width: 'fit-content',
            height: 'fit-content'
          }}
        >
          <div className="relative bg-white rounded-lg overflow-hidden">
            {/* Close Button */}
            <Button
              onClick={() => setFullscreenImage(null)}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white border-gray-300 shadow-lg"
              style={{
                borderColor: themeColor,
                color: themeColor
              }}
            >
              <span className="text-lg">✕</span>
            </Button>
            
            {/* Image Container */}
            <div className="p-6">
              {fullscreenImage && (
                <img
                  src={fullscreenImage}
                  alt="Image preview"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-lg"
                  style={{
                    minWidth: isMobile ? '280px' : '600px',
                    minHeight: isMobile ? '200px' : '400px'
                  }}
                />
              )}
            </div>
            
            {/* Image Caption */}
            <div 
              className="px-6 pb-6 pt-2 text-center border-t"
              style={{ borderColor: `${themeColor}30` }}
            >
              <p 
                className="text-sm font-medium"
                style={{ color: themeColor }}
              >
                Click outside or press ESC to close
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default FlowersDialog;
