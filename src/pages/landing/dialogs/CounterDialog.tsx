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
import { calculateRelationshipStats, type RelationshipStats } from '../../../utils/helpers';
import { Heart, Calendar, Clock} from 'lucide-react';

interface CounterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailedStats extends RelationshipStats {
  totalHours: number;
}

const CounterDialog: React.FC<CounterDialogProps> = ({ open, onOpenChange }) => {
  const { getCallsign, getCouplename, getCoupleOfficialDate, isLoading: settingsLoading } = useSettingsStore();
  const { isThemeInitialized, getCurrentThemeColor } = useThemeStore();
  const [displayData, setDisplayData] = useState<{
    callsign: string;
    couplename: string;
    themeColor: string;
    stats: DetailedStats;
  } | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Wait for both settings and theme to be ready
        if (!settingsLoading && isThemeInitialized()) {
          const callsign = getCallsign();
          const couplename = getCouplename();
          const themeColor = getCurrentThemeColor();
          const coupleOfficialDate = getCoupleOfficialDate();
          
          const basicStats = calculateRelationshipStats(coupleOfficialDate);
          const detailedStats: DetailedStats = {
            ...basicStats,
            totalHours: basicStats.totalDays * 24
          };

          setDisplayData({
            callsign,
            couplename,
            themeColor,
            stats: detailedStats
          });
        }
      } catch (error) {
        console.error('Failed to initialize counter dialog data:', error);
        // Provide fallback data
        const fallbackStats = calculateRelationshipStats('2025-01-01');
        setDisplayData({
          callsign: 'darling',
          couplename: 'Love',
          themeColor: '#F2A6A6',
          stats: {
            ...fallbackStats,
            totalHours: fallbackStats.totalDays * 24
          }
        });
      }
    };

    initializeData();
  }, [settingsLoading, isThemeInitialized, getCallsign, getCouplename, getCurrentThemeColor, getCoupleOfficialDate]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!displayData) {
    return null; // Don't render until data is ready
  }

  const { callsign, themeColor, stats } = displayData;

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
        className="sm:max-w-3xl w-full max-w-[95vw]"
        style={{
          borderColor: themeColor,
          borderWidth: '2px'
        }}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
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
          </div>

          <DialogTitle 
            className="text-2xl font-bold"
            style={{ color: themeColor }}
          >
            Our Love Journey, {callsign} 💕
          </DialogTitle>
          
          <DialogDescription className="text-base">
            Every moment with you has been a treasure. Here's how long we've been creating beautiful memories together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Counter Display */}
          <Card 
            className="p-6 text-center"
            style={{
              backgroundColor: `${themeColor}10`,
              border: `2px solid ${themeColor}30`
            }}
          >
            <CardContent className="p-0">
              <p 
                className="text-3xl font-bold mb-2"
                style={{ color: themeColor }}
              >
                {stats.totalDays.toLocaleString()}
              </p>
              <p className="text-lg text-gray-600">
                Days Together
              </p>
            </CardContent>
          </Card>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card 
                  key={index}
                  className="p-4 text-center hover:shadow-lg transition-shadow"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: `1px solid ${themeColor}20`
                  }}
                >
                  <CardContent className="p-0 space-y-2">
                    <div className="flex justify-center">
                      <IconComponent 
                        size={24} 
                        style={{ color: themeColor }}
                      />
                    </div>
                    <p 
                      className="text-xl font-semibold"
                      style={{ color: themeColor }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">
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
              💝 Still Counting
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

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleClose}
            className="min-w-32"
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
