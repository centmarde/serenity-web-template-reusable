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
import { useSettingsStore } from '../../../stores/settings';
import { useThemeStore } from '../../../stores/theme';
import { AlertTriangle, Code,  } from 'lucide-react';

interface OpsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

const OpsDialog: React.FC<OpsDialogProps> = ({ open, onOpenChange, featureName = "This Feature" }) => {
  const { getCallsign, getAppName, isLoading: settingsLoading } = useSettingsStore();
  const { isThemeInitialized, getCurrentThemeColor } = useThemeStore();
  const [displayData, setDisplayData] = useState<{
    callsign: string;
    appName: string;
    themeColor: string;
  } | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Wait for both settings and theme to be ready
        if (!settingsLoading && isThemeInitialized()) {
          const callsign = getCallsign();
          const appName = getAppName();
          const themeColor = getCurrentThemeColor();

          setDisplayData({
            callsign,
            appName,
            themeColor
          });
        }
      } catch (error) {
        console.error('Failed to initialize ops dialog data:', error);
        // Provide fallback data
        setDisplayData({
          callsign: 'User',
          appName: 'Love Space',
          themeColor: '#F2A6A6'
        });
      }
    };

    initializeData();
  }, [settingsLoading, isThemeInitialized, getCallsign, getAppName, getCurrentThemeColor]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!displayData) {
    return null; // Don't render until data is ready
  }

  const { callsign,  themeColor } = displayData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl lg:max-w-4xl w-full max-w-[95vw]"
        style={{
          borderColor: themeColor,
          borderWidth: '2px'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Column - GIF and Tools Icon */}
          <div className="flex flex-col items-center space-y-4">
         

            {/* Animated GIF */}
            <div className="flex justify-center">
              <div 
               
                
              >
                <img 
                  src="/assets/sad.gif" 
                  alt="Development in progress animation"
                  className="w-60 h-60 object-contain rounded-lg"
                  
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
                Oops! {callsign}! 🚧
              </DialogTitle>
              
              <DialogDescription className="space-y-2">
                <p className="text-base">
                  <span className="font-semibold">{featureName}</span> is under construction!
                </p>
                <p className="text-sm text-muted-foreground">
                  I'm working hard to bring you this amazing feature. It'll be ready soon! ✨
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
                <strong>Feature Under Development</strong>
                <br />
                This feature is currently being built with love and attention to detail. Thank you for your patience, {callsign}! 💝
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
                In Development
              </Badge>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: themeColor,
                  color: themeColor
                }}
              >
                Coming Soon 🚀
              </Badge>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleClose}
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
                Got it!
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpsDialog;