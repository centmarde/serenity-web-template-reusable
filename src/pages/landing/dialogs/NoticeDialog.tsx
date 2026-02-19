import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettingsStore, type DialogMessages } from '../../../stores/settings';
import { useThemeStore } from '../../../stores/theme';
import { useIsMobile } from '../../../hooks/use-mobile';
import { AlertTriangle, Heart, Code } from 'lucide-react';

interface NoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoticeDialog: React.FC<NoticeDialogProps> = ({ open, onOpenChange }) => {
  const isMobile = useIsMobile();
  const {
    getCallsign,
    getAppName,
    getDialogMessages,
    loadSettings,
    waitForCallsign,
    waitForAppName
  } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } = useThemeStore();
  const [displayData, setDisplayData] = useState<{
    callsign: string;
    appName: string;
    themeColor: string;
    dialogMessages: DialogMessages;
  } | null>(null);

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
        const appName = await waitForAppName();
        const themeColor = getCurrentThemeColor();
        const dialogMessages = getDialogMessages();

        setDisplayData({
          callsign,
          appName,
          themeColor,
          dialogMessages
        });
      } catch (error) {
        console.error('Failed to initialize notice dialog data:', error);
        // Provide fallback data from settings or defaults
        try {
          const fallbackCallsign = getCallsign() || 'User';
          const fallbackAppName = getAppName() || 'Love Space';
          const fallbackThemeColor = getCurrentThemeColor() || '#F2A6A6';
          const fallbackDialogMessages = getDialogMessages();

          setDisplayData({
            callsign: fallbackCallsign,
            appName: fallbackAppName,
            themeColor: fallbackThemeColor,
            dialogMessages: fallbackDialogMessages
          });
        } catch {
          // Last resort fallback
          const lastResortDialogMessages = {
            welcomeMessage: "Welcome to your personal love space",
            workInProgressNotice: "This system is currently under active development. Some features may be incomplete or subject to change. I appreciate your patience",
            featureComingSoon: "This feature is currently being built with love and attention to detail. Thank you for your patience",
            counterDialogDescription: "Every moment with you has been a treasure. Here's how long we've been creating beautiful memories together.",
            betaBadge: "Beta Version",
            madeWithLove: "Made with 💝",
            inDevelopment: "In Development",
            comingSoon: "Coming Soon 🚀"
          };
          setDisplayData({
            callsign: 'User',
            appName: 'Love Space',
            themeColor: '#F2A6A6',
            dialogMessages: lastResortDialogMessages
          });
        }
      }
    };

    initializeData();
  }, [
    initializeTheme,
    waitForInitialization,
    loadSettings,
    waitForCallsign,
    waitForAppName,
    getCurrentThemeColor,
    getCallsign,
    getAppName,
    getDialogMessages
  ]);

  const handleContinue = () => {
    onOpenChange(false);
  };

  if (!displayData) {
    return null; // Don't render until data is ready
  }

  const { callsign, appName, themeColor, dialogMessages } = displayData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`w-full ${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'sm:max-w-2xl lg:max-w-4xl max-w-[95vw]'}`}
        style={{
          borderColor: themeColor,
          borderWidth: '2px'
        }}
      >
        {isMobile ? (
          /* Mobile Layout - GIF on Top */
          <div className="flex flex-col space-y-4">
            {/* GIF and Heart Icon - Top for Mobile */}
            <div className="flex flex-col items-center space-y-3">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Heart 
                  className="w-6 h-6"
                  style={{ color: themeColor }}
                  fill={`${themeColor}40`}
                />
              </div>

              {/* Animated GIF */}
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src="/assets/sorry.gif" 
                    alt="Work in progress animation"
                    className="w-40 h-40 object-contain rounded-lg"
                    style={{ 
                      border: `2px solid ${themeColor}40`
                    }}
                  />
                  <div 
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
              </div>
            </div>

            {/* Content Below for Mobile */}
            <div className="space-y-3">
              <DialogHeader className="text-center">
                <DialogTitle 
                  className="text-lg font-semibold"
                  style={{ color: themeColor }}
                >
                  Hey there, {callsign}! 💕
                </DialogTitle>
                
                <DialogDescription className="space-y-2">
                  <p className="text-sm">
                    Welcome to <span className="font-semibold">{appName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This love space is crafted just for you with all the care in the world.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <Alert 
                className="border-0"
                style={{ 
                  backgroundColor: `${themeColor}10`,
                  borderLeft: `4px solid ${themeColor}`
                }}
              >
                <AlertTriangle 
                  className="h-3 w-3" 
                  style={{ color: themeColor }}
                />
                <AlertDescription className="text-xs">
                  <strong>Work in Progress Notice</strong>
                  <br />
                  {dialogMessages.workInProgressNotice} {callsign}. 🥹
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                  style={{ 
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                    borderColor: `${themeColor}30`
                  }}
                >
                  <Code className="w-3 h-3" />
                  {dialogMessages.betaBadge}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: themeColor,
                    color: themeColor
                  }}
                >
                  {dialogMessages.madeWithLove}
                </Badge>
              </div>

              <div className="flex justify-center pt-2">
                <Button 
                  onClick={handleContinue}
                  className="min-w-28 text-sm"
                  style={{
                    backgroundColor: themeColor,
                    borderColor: themeColor,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColor}e0`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = themeColor;
                  }}
                >
                  Continue to Love Space
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout - Side by Side */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Column - GIF and Heart Icon */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Heart 
                  className="w-8 h-8"
                  style={{ color: themeColor }}
                  fill={`${themeColor}40`}
                />
              </div>

              {/* Animated GIF */}
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src="/assets/sorry.gif" 
                    alt="Work in progress animation"
                    className="w-60 h-60 object-contain rounded-lg"
                    style={{ 
                      border: `2px solid ${themeColor}40`
                    }}
                  />
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
              </div>
            </div>

            {/* Center & Right Columns - Content */}
            <div className="md:col-span-2 space-y-4">
              <DialogHeader className="text-left">
                <DialogTitle 
                  className="text-xl font-semibold"
                  style={{ color: themeColor }}
                >
                  Hey there, {callsign}! 💕
                </DialogTitle>
                
                <DialogDescription className="space-y-2">
                  <p className="text-base">
                    Welcome to <span className="font-semibold">{appName}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This love space is crafted just for you with all the care in the world.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <Alert 
                className="border-0"
                style={{ 
                  backgroundColor: `${themeColor}10`,
                  borderLeft: `4px solid ${themeColor}`
                }}
              >
                <AlertTriangle 
                  className="h-4 w-4" 
                  style={{ color: themeColor }}
                />
                <AlertDescription className="text-sm">
                  <strong>Work in Progress Notice</strong>
                  <br />
                  {dialogMessages.workInProgressNotice} {callsign}. 🥹
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                  style={{ 
                    backgroundColor: `${themeColor}15`,
                    color: themeColor,
                    borderColor: `${themeColor}30`
                  }}
                >
                  <Code className="w-3 h-3" />
                  {dialogMessages.betaBadge}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: themeColor,
                    color: themeColor
                  }}
                >
                  {dialogMessages.madeWithLove}
                </Badge>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleContinue}
                  className="min-w-30"
                  style={{
                    backgroundColor: themeColor,
                    borderColor: themeColor,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColor}e0`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = themeColor;
                  }}
                >
                  Continue to Love Space
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDialog;
