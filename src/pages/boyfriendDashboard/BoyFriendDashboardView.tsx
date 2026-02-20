import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '../../stores/settings';
import { useThemeStore } from '../../stores/theme';
import { useAuthActions, useAuthLoading, useUser } from '../../stores/authData';
import { Heart, ArrowLeft, LogOut } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface BoyFriendDashboardViewProps {
  onNavigate?: (path: string) => void;
}

const BoyFriendDashboardView: React.FC<BoyFriendDashboardViewProps> = ({ onNavigate }) => {
  const isMobile = useIsMobile();
  const { getCallsign, getAppName } = useSettingsStore();
  const { getCurrentThemeColor } = useThemeStore();
  
  // Auth state
  const user = useUser();
  const isLoading = useAuthLoading();
  const { logout } = useAuthActions();
  
  const themeColor = getCurrentThemeColor();
  const callsign = getCallsign();
  const appName = getAppName();

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    // Redirect to auth page after logout
    if (onNavigate) {
      onNavigate('/auth');
    }
  };

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}05)`
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-sm"
            style={{ color: themeColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {appName}
          </Button>
          
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm"
                style={{ color: themeColor }}
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            )}
            
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Heart 
                className="w-5 h-5"
                style={{ color: themeColor }}
                fill={`${themeColor}40`}
              />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <Card 
          className="mb-6 shadow-xl"
          style={{
            borderColor: `${themeColor}30`,
            borderWidth: '2px'
          }}
        >
          <CardHeader className="text-center">
            <CardTitle 
              className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}
              style={{ color: themeColor }}
            >
              Welcome, {callsign}'s Special Someone! 💕
            </CardTitle>
            <p className="text-muted-foreground">
              This is your exclusive access to {callsign}'s love space
            </p>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="space-y-4">
              <div 
                className="p-6 rounded-lg"
                style={{ backgroundColor: `${themeColor}10` }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: themeColor }}>
                  🚧 Under Construction 🚧
                </h3>
                <p className="text-muted-foreground text-sm">
                  This special dashboard is being built with love and care. 
                  Soon you'll have access to exclusive features, messages, and surprises 
                  that {callsign} has prepared just for you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="p-4" style={{ borderColor: `${themeColor}20` }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: themeColor }}>
                    Coming Soon:
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 text-left">
                    <li>• Private messages from {callsign}</li>
                    <li>• Exclusive photo memories</li>
                    <li>• Special date planning tools</li>
                    <li>• Love letter archive</li>
                  </ul>
                </Card>

                <Card className="p-4" style={{ borderColor: `${themeColor}20` }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: themeColor }}>
                    Your Privileges:
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 text-left">
                    <li>• Full access to all features</li>
                    <li>• Priority support from {callsign}</li>
                    <li>• Early access to new features</li>
                    <li>• Unlimited love and attention 💝</li>
                  </ul>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💝 This space is crafted with infinite love for someone very special
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoyFriendDashboardView;