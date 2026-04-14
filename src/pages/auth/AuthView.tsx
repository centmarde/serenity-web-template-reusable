import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettingsStore } from '../../stores/settings';
import { useThemeStore } from '../../stores/theme';
import { useAuthError, useAuthLoading, useIsAuthenticated, useLogin, useClearError } from '../../stores/authData';
import { Heart, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface AuthViewProps {
  onNavigate?: (path: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { getCallsign, getAppName } = useSettingsStore();
  const { getCurrentThemeColor } = useThemeStore();
  
  // Auth store hooks
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const login = useLogin();
  const clearError = useClearError();
  
  const themeColor = getCurrentThemeColor();
  const callsign = getCallsign();
  const appName = getAppName();

  // Note: Auth initialization is handled in App.tsx to avoid infinite loops

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && onNavigate) {
      onNavigate('/boyfriend-dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear any previous errors

    const result = await login(email, password);
    
    if (result.success) {
      // Navigation will be handled by the useEffect above
      console.log('Login successful!');
    }
    // Error handling is managed by the store
  };

  const handleBackToHome = () => {
    if (onNavigate) {
      onNavigate('/');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `white`
      }}
    >
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        {/* Header with back button */}
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

        {/* Login Card */}
        <Card 
          className="shadow-xl"
          style={{
            backgroundColor: 'white',
            borderColor: `${themeColor}30`,
          }}
        >
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div 
                className="p-3 rounded-full mb-2"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <Lock 
                  className="w-8 h-8"
                  style={{ color: themeColor }}
                />
              </div>
            </div>
            
            <CardTitle 
              className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}
              style={{ color: themeColor }}
            >
              Boyfriend Access Only
            </CardTitle>
            
            <p className="text-muted-foreground text-sm">
              This is a special space for someone very special to {callsign} 💕
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="space-y-3">
                <Alert 
                  className="border-0"
                  style={{ 
                    backgroundColor: '#fecaca20',
                    borderLeft: '4px solid #ef4444'
                  }}
                >
                  <AlertDescription className="text-sm text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
                
                <Alert 
                  className="border-0"
                  style={{ 
                    backgroundColor: `${themeColor}10`,
                    borderLeft: `4px solid ${themeColor}`
                  }}
                >
                  <AlertDescription className="text-sm" style={{ color: themeColor }}>
                    💡 Hint: Password starts with "V" and ends with "."
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: themeColor }}
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="your.email@example.com"
                    required
                    style={{
                      borderColor: `${themeColor}30`,
                      '--focus-ring-color': themeColor
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: themeColor }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Your secret password"
                    required
                    style={{
                      borderColor: `${themeColor}30`,
                      '--focus-ring-color': themeColor
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${isMobile ? 'text-sm' : 'text-base'} font-medium`}
                disabled={isLoading}
                style={{
                  backgroundColor: themeColor,
                  borderColor: themeColor,
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = `${themeColor}e0`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = themeColor;
                  }
                }}
              >
                {isLoading ? 'Verifying Love...' : 'Enter Love Space'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                💝 Made with love for {callsign}'s special someone
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AuthView;
