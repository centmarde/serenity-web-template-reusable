import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '../../../stores/settings';
import { useThemeStore } from '../../../stores/theme';
import { useIsMobile } from '../../../hooks/use-mobile';
import { calculateRelationshipStats, type RelationshipStats } from '../../../utils/helpers';
import { Heart, Calendar, Clock } from 'lucide-react';
import { type DialogMessages } from '../../../stores/settings';

interface CounterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailedStats extends RelationshipStats {
  totalHours: number;
}

const CounterDialog: React.FC<CounterDialogProps> = ({ open, onOpenChange }) => {
  const isMobile = useIsMobile();
  const {
    getCallsign,
    getGfName,
    getCoupleOfficialDate,
    getDialogMessages,
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
    stats: DetailedStats;
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
        const gfName = await waitForGfName();
        const coupleOfficialDate = await waitForCoupleOfficialDate();
        const themeColor = getCurrentThemeColor();
        const dialogMessages = getDialogMessages();
        
        const basicStats = calculateRelationshipStats(coupleOfficialDate);
        const detailedStats: DetailedStats = {
          ...basicStats,
          totalHours: basicStats.totalDays * 24
        };

        setDisplayData({
          callsign,
          gfName,
          themeColor,
          stats: detailedStats,
          dialogMessages
        });
      } catch (error) {
        console.error('Failed to initialize counter dialog data:', error);
        // Provide fallback data from settings or defaults
        try {
          const fallbackCallsign = getCallsign() || 'darling';
          const fallbackGfName = getGfName() || 'Love';
          const fallbackDate = getCoupleOfficialDate() || '2025-01-01';
          const fallbackThemeColor = getCurrentThemeColor() || '#F2A6A6';
          const fallbackDialogMessages = getDialogMessages();
          
          const fallbackStats = calculateRelationshipStats(fallbackDate);
          setDisplayData({
            callsign: fallbackCallsign,
            gfName: fallbackGfName,
            themeColor: fallbackThemeColor,
            stats: {
              ...fallbackStats,
              totalHours: fallbackStats.totalDays * 24
            },
            dialogMessages: fallbackDialogMessages
          });
        } catch {
          // Last resort fallback
          const lastResortStats = calculateRelationshipStats('2025-01-01');
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
            callsign: 'darling',
            gfName: 'Love',
            themeColor: '#F2A6A6',
            stats: {
              ...lastResortStats,
              totalHours: lastResortStats.totalDays * 24
            },
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
    waitForGfName,
    waitForCoupleOfficialDate,
    getCurrentThemeColor,
    getCallsign,
    getGfName,
    getCoupleOfficialDate,
    getDialogMessages
  ]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!displayData) {
    return null; // Don't render until data is ready
  }

  const { callsign, themeColor, stats, dialogMessages } = displayData;

  const statCards = [
    {
      icon: Calendar,
      label: 'Years',
      value: stats.years,
      subtitle: stats.years === 1 ? 'year' : 'years'
    },
    {
      icon: Calendar,
      label: 'Months',
      value: stats.months,
      subtitle: stats.months === 1 ? 'month' : 'months'
    },
  
    {
      icon: Clock,
      label: 'Total Hours',
      value: stats.totalHours.toLocaleString(),
      subtitle: 'hours together'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`w-full ${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'sm:max-w-3xl max-w-[95vw]'}`}
        style={{
          borderColor: themeColor,
          borderWidth: '2px'
        }}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div 
              className={`p-3 rounded-full ${isMobile ? 'p-2' : 'p-3'}`}
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Heart 
                className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}
                style={{ color: themeColor }}
                fill={`${themeColor}40`}
              />
            </div>
          </div>

          <DialogTitle 
            className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}
            style={{ color: themeColor }}
          >
            Our Love Journey, {callsign} 💕
          </DialogTitle>
          
          <DialogDescription className={`${isMobile ? 'text-sm' : 'text-base'}`}>
            {dialogMessages.counterDialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* Main Counter Display */}
          <Card 
            className={`text-center ${isMobile ? 'p-4' : 'p-6'}`}
            style={{
              backgroundColor: `${themeColor}10`,
              border: `2px solid ${themeColor}30`
            }}
          >
            <CardContent className="p-0">
             
              <p className={`text-gray-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
                you survived {stats.totalDays.toLocaleString()} days with me 😆
              </p>
            </CardContent>
          </Card>

          {/* Detailed Stats Grid */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card 
                  key={index}
                  className={`text-center hover:shadow-lg transition-shadow ${isMobile ? 'p-3' : 'p-4'}`}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: `1px solid ${themeColor}20`
                  }}
                >
                  <CardContent className="p-0 space-y-2">
                    <div className="flex justify-center">
                      <IconComponent 
                        size={isMobile ? 20 : 24} 
                        style={{ color: themeColor }}
                      />
                    </div>
                    <p 
                      className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}
                      style={{ color: themeColor }}
                    >
                      {stat.value}
                    </p>
                    <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {stat.subtitle}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: `${themeColor}15`,
                color: themeColor,
                borderColor: `${themeColor}30`
              }}
            >
              💝 {dialogMessages.madeWithLove}
            </Badge>
            <Badge 
              variant="outline"
              style={{ 
                borderColor: themeColor,
                color: themeColor
              }}
            >
              🌟 Forever & Always
            </Badge>
          </div>
        </div>

        <div className={`flex justify-center ${isMobile ? 'pt-3' : 'pt-4'}`}>
          <Button 
            onClick={handleClose}
            className={`${isMobile ? 'min-w-28 text-sm' : 'min-w-32'}`}
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
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounterDialog;
