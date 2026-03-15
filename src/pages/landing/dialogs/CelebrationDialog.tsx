import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../../stores/settings';
import { useThemeStore } from '../../../stores/theme';
import { useIsMobile } from '../../../hooks/use-mobile';
import { baseAIService } from '../../../lib/AiCelebrationResponse';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Calendar, Sparkles, PartyPopper, Cake } from 'lucide-react';

interface CelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CelebrationData {
  isCelebration: boolean;
  celebrationType: 'monthsary' | 'anniversary' | null;
  monthsCompleted: number;
  yearsCompleted: number;
  exactDate: Date;
  coupleOfficialDate: string;
}

const CelebrationDialog: React.FC<CelebrationDialogProps> = ({ open, onOpenChange }) => {
  const isMobile = useIsMobile();
  const {
    getCallsign,
    getGfName,
    getCoupleOfficialDate,
    loadSettings,
    waitForCallsign,
    waitForGfName,
    waitForCoupleOfficialDate
  } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  
  const [displayData, setDisplayData] = useState<{
    callsign: string;
    gfName: string;
    themeColor: string;
    celebration: CelebrationData;
    aiPersonalMessage?: string;
  } | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  // Generate AI-powered personal message only
  const generatePersonalMessage = async (
    celebrationType: 'monthsary' | 'anniversary',
    monthsCompleted: number,
    yearsCompleted: number,
    callsign: string,
    gfName: string
  ): Promise<string> => {
    setIsGeneratingMessage(true);
    
    try {
      const count = celebrationType === 'monthsary' ? monthsCompleted : yearsCompleted;
      const timeUnit = celebrationType === 'monthsary' ? 'month' : 'year';
      const timeUnitPlural = celebrationType === 'monthsary' ? 'months' : 'years';
      
      const prompt = `Write a heartfelt personal message for ${callsign} celebrating our ${count} ${count === 1 ? timeUnit : timeUnitPlural} ${celebrationType}. 
      
      The message should be:
      - Personal and romantic, but authentic (not overly dramatic)
      - About 60-80 words long
      - Express gratitude for the time together
      - Mention how special they make every day
      - Include hope for the future together
      - End with a loving sentiment
      
      Write as if you're ${gfName} writing to ${callsign}. Make it warm, loving, and genuine.`;

      const response = await baseAIService.generateSimpleMessage({
        prompt,
        userName: callsign,
        maxWords: 80
      });
      
      if (response.success && response.generatedMessage) {
        return response.generatedMessage;
      } else {
        console.warn('AI message generation failed, using fallback:', response.error);
        return `Thank you for being the most amazing partner. Every day with you is a celebration! Every moment we share together has been a beautiful adventure, and I can't wait for all the memories we'll create in the future. You bring so much joy, love, and happiness into my life, ${callsign}. I love you more than words can express! 💖`;
      }
    } catch (error) {
      console.error('Error generating personal message:', error);
      return `Thank you for being the most amazing partner. Every day with you is a celebration! Every moment we share together has been a beautiful adventure, and I can't wait for all the memories we'll create in the future. You bring so much joy, love, and happiness into my life, ${callsign}. I love you more than words can express! 💖`;
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Calculate if today is a monthsary or anniversary
  const calculateCelebration = (coupleOfficialDate: string): CelebrationData => {
    const startDate = new Date(coupleOfficialDate);
    const today = new Date();
    
    // Set both dates to start of day for accurate comparison
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if it's the same day of the month
    const isSameDayOfMonth = startDay.getDate() === currentDay.getDate();
    
    if (!isSameDayOfMonth) {
      return {
        isCelebration: false,
        celebrationType: null,
        monthsCompleted: 0,
        yearsCompleted: 0,
        exactDate: today,
        coupleOfficialDate
      };
    }
    
    // Calculate total months elapsed
    const totalMonthsElapsed = (currentDay.getFullYear() - startDay.getFullYear()) * 12 + 
                                (currentDay.getMonth() - startDay.getMonth());
    
    // Must be at least 1 month
    if (totalMonthsElapsed < 1) {
      return {
        isCelebration: false,
        celebrationType: null,
        monthsCompleted: 0,
        yearsCompleted: 0,
        exactDate: today,
        coupleOfficialDate
      };
    }
    
    // Check if it's a full year anniversary
    const yearsCompleted = totalMonthsElapsed / 12;
    const isAnniversary = Number.isInteger(yearsCompleted) && yearsCompleted >= 1;
    
    return {
      isCelebration: true,
      celebrationType: isAnniversary ? 'anniversary' : 'monthsary',
      monthsCompleted: totalMonthsElapsed,
      yearsCompleted: Math.floor(yearsCompleted),
      exactDate: today,
      coupleOfficialDate
    };
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize theme first
        await initializeTheme();
        await waitForInitialization();

        // Load settings
        await loadSettings();

        // Wait for all required data
        const callsign = await waitForCallsign();
        const gfName = await waitForGfName();
        const coupleOfficialDate = await waitForCoupleOfficialDate();
        const themeColor = getCurrentThemeColor();

        const celebration = calculateCelebration(coupleOfficialDate);

        // If it's a celebration, generate AI personal message
        let aiPersonalMessage = undefined;
        if (celebration.isCelebration && celebration.celebrationType) {
          aiPersonalMessage = await generatePersonalMessage(
            celebration.celebrationType,
            celebration.monthsCompleted,
            celebration.yearsCompleted,
            callsign,
            gfName
          );
        }

        setDisplayData({
          callsign,
          gfName,
          themeColor,
          celebration,
          aiPersonalMessage
        });
      } catch (error) {
        console.error('Failed to initialize celebration dialog data:', error);
        // Provide fallback data
        const fallbackCallsign = getCallsign() || 'darling';
        const fallbackGfName = getGfName() || 'Love';
        const fallbackThemeColor = getCurrentThemeColor() || '#F2A6A6';
        const fallbackDate = getCoupleOfficialDate() || '2025-01-01';
        const fallbackCelebration = calculateCelebration(fallbackDate);
        
        // Generate fallback AI personal message if it's a celebration
        let fallbackAiPersonalMessage = undefined;
        if (fallbackCelebration.isCelebration && fallbackCelebration.celebrationType) {
          fallbackAiPersonalMessage = `Thank you for being the most amazing partner. Every day with you is a celebration! Every moment we share together has been a beautiful adventure, and I can't wait for all the memories we'll create in the future. You bring so much joy, love, and happiness into my life, ${fallbackCallsign}. I love you more than words can express! 💖`;
        }
        
        setDisplayData({
          callsign: fallbackCallsign,
          gfName: fallbackGfName,
          themeColor: fallbackThemeColor,
          celebration: fallbackCelebration,
          aiPersonalMessage: fallbackAiPersonalMessage
        });
      }
    };

    if (open) {
      initializeData();
    }
  }, [
    open,
    initializeTheme,
    waitForInitialization,
    loadSettings,
    waitForCallsign,
    waitForGfName,
    waitForCoupleOfficialDate,
    getCurrentThemeColor,
    getCallsign,
    getGfName,
    getCoupleOfficialDate
  ]);

  const handleClose = () => {
    onOpenChange(false);
  };

  // Don't render if no data or not a celebration
  if (!displayData || !displayData.celebration.isCelebration) {
    return null;
  }

  const { callsign, themeColor, celebration, aiPersonalMessage } = displayData;
  const { celebrationType, monthsCompleted, yearsCompleted } = celebration;

  // Static messages for main content
  const celebrationMessages = {
    monthsary: {
      title: `Happy ${monthsCompleted} Month${monthsCompleted === 1 ? '' : 's'} Together! 🎉`,
      subtitle: `${monthsCompleted} month${monthsCompleted === 1 ? '' : 's'} of love, laughter, and beautiful memories`,
      description: `Today marks ${monthsCompleted} wonderful month${monthsCompleted === 1 ? '' : 's'} since we officially became a couple. Every moment with you has been a treasure, and I can't wait for all the adventures still to come! 💕`,
      badge: `${monthsCompleted} Month Milestone`,
      gif: '/assets/peach-goma.gif'
    },
    anniversary: {
      title: `Happy ${yearsCompleted} Year Anniversary! 🎊`,
      subtitle: `${yearsCompleted} amazing year${yearsCompleted === 1 ? '' : 's'} of love and togetherness`,
      description: `Today we celebrate ${yearsCompleted} incredible year${yearsCompleted === 1 ? '' : 's'} together! From our first day to this moment, every memory we've created has been precious. Here's to many more years of love, growth, and happiness together! 💖`,
      badge: `${yearsCompleted} Year${yearsCompleted === 1 ? '' : 's'} Strong`,
      gif: '/assets/blee.gif'
    }
  };

  const currentMessage = celebrationType ? celebrationMessages[celebrationType] : celebrationMessages.monthsary;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`w-full ${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'sm:max-w-2xl lg:max-w-4xl max-w-[95vw]'}`}
        style={{
          borderColor: themeColor,
          borderWidth: '3px',
          backgroundColor: '#ffffff'
        }}
      >
        {isMobile ? (
          /* Mobile Layout */
          <div className="flex flex-col space-y-4">
            {/* Celebration Icon and GIF - Top for Mobile */}
            <div className="flex flex-col items-center space-y-3">
              <div 
                className="p-3 rounded-full animate-pulse"
                style={{ backgroundColor: `${themeColor}30` }}
              >
                {celebrationType === 'anniversary' ? (
                  <Cake 
                    className="w-8 h-8"
                    style={{ color: themeColor }}
                    fill={`${themeColor}60`}
                  />
                ) : (
                  <PartyPopper 
                    className="w-8 h-8"
                    style={{ color: themeColor }}
                    fill={`${themeColor}60`}
                  />
                )}
              </div>

              {/* Animated GIF */}
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={currentMessage.gif}
                    alt="Celebration animation"
                    className="w-48 h-48 object-contain rounded-lg"
                    style={{ 
                      border: `3px solid ${themeColor}`,
                      boxShadow: `0 0 20px ${themeColor}40`
                    }}
                  />
                  <div 
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-ping"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
              </div>
            </div>

            {/* Content Below for Mobile */}
            <div className="space-y-4">
              <DialogHeader className="text-center space-y-2">
                <DialogTitle 
                  className="text-xl font-bold"
                  style={{ color: themeColor }}
                >
                  {currentMessage.title}
                </DialogTitle>
                
                <DialogDescription className="space-y-3">
                  <p className="text-base font-semibold text-gray-700">
                    {currentMessage.subtitle}
                  </p>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {currentMessage.description}
                  </p>
                </DialogDescription>
              </DialogHeader>

              <Card 
                className="border-0"
                style={{ 
                  backgroundColor: `${themeColor}15`,
                  borderLeft: `4px solid ${themeColor}`
                }}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart 
                      className="h-4 w-4" 
                      style={{ color: themeColor }}
                      fill={themeColor}
                    />
                    <span className="text-sm font-medium" style={{ color: themeColor }}>
                      To my dearest {callsign} 💕
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {isGeneratingMessage ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">Generating personal message...</span>
                        <Heart className="w-3 h-3 animate-pulse" style={{ color: themeColor }} />
                      </span>
                    ) : (
                      aiPersonalMessage || `Thank you for being the most amazing partner. Every day with you is a celebration! Every moment we share together has been a beautiful adventure, and I can't wait for all the memories we'll create in the future. You bring so much joy, love, and happiness into my life, ${callsign}. I love you more than words can express! 💖`
                    )}
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                  style={{ 
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                    borderColor: `${themeColor}40`,
                    border: '1px solid'
                  }}
                >
                  <Calendar className="w-3 h-3" />
                  {currentMessage.badge}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: themeColor,
                    color: themeColor
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Special Day
                </Badge>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleClose}
                  className="px-6"
                  style={{ 
                    backgroundColor: themeColor,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColor}dd`;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = themeColor;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" fill="white" />
                  Continue to Our Love Space
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout - Side by Side */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Column - GIF and Icon */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="p-4 rounded-full animate-pulse"
                style={{ backgroundColor: `${themeColor}30` }}
              >
                {celebrationType === 'anniversary' ? (
                  <Cake 
                    className="w-10 h-10"
                    style={{ color: themeColor }}
                    fill={`${themeColor}60`}
                  />
                ) : (
                  <PartyPopper 
                    className="w-10 h-10"
                    style={{ color: themeColor }}
                    fill={`${themeColor}60`}
                  />
                )}
              </div>

              {/* Animated GIF */}
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={currentMessage.gif}
                    alt="Celebration animation"
                    className="w-64 h-64 object-contain rounded-lg"
                    style={{ 
                      border: `3px solid ${themeColor}`,
                      boxShadow: `0 0 25px ${themeColor}40`
                    }}
                  />
                  <div 
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full animate-ping"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
              </div>
            </div>

            {/* Center & Right Columns - Content */}
            <div className="md:col-span-2 space-y-4">
              <DialogHeader className="text-left space-y-3">
                <DialogTitle 
                  className="text-2xl font-bold"
                  style={{ color: themeColor }}
                >
                  {currentMessage.title}
                </DialogTitle>
                
                <DialogDescription className="space-y-3">
                  <p className="text-lg font-semibold text-gray-700">
                    {currentMessage.subtitle}
                  </p>
                  
                  <p className="text-base text-gray-600 leading-relaxed">
                    {currentMessage.description}
                  </p>
                </DialogDescription>
              </DialogHeader>

              <Card 
                className="border-0"
                style={{ 
                  backgroundColor: `${themeColor}15`,
                  borderLeft: `4px solid ${themeColor}`
                }}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart 
                      className="h-5 w-5" 
                      style={{ color: themeColor }}
                      fill={themeColor}
                    />
                    <span className="text-base font-medium" style={{ color: themeColor }}>
                      To my dearest {callsign} 💕
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isGeneratingMessage ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-pulse">Generating personal message...</span>
                        <Heart className="w-4 h-4 animate-pulse" style={{ color: themeColor }} />
                      </span>
                    ) : (
                      aiPersonalMessage || `Thank you for being the most amazing partner. Every day with you is a celebration! Every moment we share together has been a beautiful adventure, and I can't wait for all the memories we'll create in the future. You bring so much joy, love, and happiness into my life, ${callsign}. I love you more than words can express! 💖`
                    )}
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                  style={{ 
                    backgroundColor: `${themeColor}20`,
                    color: themeColor,
                    borderColor: `${themeColor}40`,
                    border: '1px solid'
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  {currentMessage.badge}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: themeColor,
                    color: themeColor
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Special Day
                </Badge>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleClose}
                  className="px-8"
                  style={{ 
                    backgroundColor: themeColor,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColor}dd`;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = themeColor;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" fill="white" />
                  Continue to Our Love Space
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationDialog;
