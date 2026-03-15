import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Lock, Calendar } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
  title?: string;
  description?: string;
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  open,
  onOpenChange,
  onAuthSuccess,
  title = "Verify Our Love",
  description = "Enter our special date to continue"
}) => {
  const { waitForCoupleOfficialDate, getThemeColor, getBfName, getGfName } = useSettingsStore();
  const [inputDate, setInputDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [themeColor, setThemeColor] = useState('#F2A6A6');
  const [bfName, setBfName] = useState('');
  const [gfName, setGfName] = useState('');

  // Load settings data
  useEffect(() => {
    const loadData = async () => {
      try {
        await waitForCoupleOfficialDate(); // This loads settings
        setThemeColor(getThemeColor());
        setBfName(getBfName());
        setGfName(getGfName());
      } catch (error) {
        console.error('Failed to load settings:', error);
        setThemeColor('#F2A6A6'); // Fallback
      }
    };
    
    if (open) {
      loadData();
    }
  }, [open, waitForCoupleOfficialDate, getThemeColor, getBfName, getGfName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const correctDate = await waitForCoupleOfficialDate();
      
      if (inputDate.trim() === correctDate) {
        // Mark as authenticated through callback
        onAuthSuccess();
        onOpenChange(false);
        setInputDate(''); // Reset form
      } else {
        setError(`Oops! I think you forgot our special day... 💕 
                 It's the day when ${bfName} and ${gfName} officially became us! ✨`);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Something went wrong. Please try again! 💝');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display (YYYY-MM-DD to a more readable format)
  const formatDateHint = () => {
    return "YYYY-MM-DD format (e.g., 2024-02-14)";
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={() => {}} // Prevent closing
      modal={true}
    >
      <DialogContent 
        className="w-full max-w-md mx-auto"
        style={{
          maxWidth: 'min(500px, 90vw)',
          borderColor: themeColor,
          backgroundColor: `rgba(255, 255, 255, 0.98)`,
          boxShadow: `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 3px ${themeColor}`,
          border: `3px solid ${themeColor}`,
          borderRadius: 'min(15px, 3vw)',
        }}
        showCloseButton={false}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Lock 
                className="h-6 w-6" 
                style={{ color: themeColor }}
              />
            </div>
          </div>
          
          <DialogTitle 
            className="text-xl font-bold flex items-center justify-center gap-2"
            style={{ 
              color: themeColor,
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
            }}
          >
            <Heart className="h-5 w-5" />
            {title}
            <Heart className="h-5 w-5" />
          </DialogTitle>
          
          <DialogDescription 
            className="text-gray-600"
            style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}
          >
            {description}
          </DialogDescription>
        </DialogHeader>

        <Card className="mt-4" style={{ borderColor: `${themeColor}40` }}>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="official-date" 
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: themeColor }}
                >
                  <Calendar className="h-4 w-4" />
                  Our Official Date
                </Label>
                
                <Input
                  id="official-date"
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full"
                  style={{ 
                    borderColor: error ? '#ef4444' : `${themeColor}60`,
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                  }}
                  placeholder="YYYY-MM-DD"
                  disabled={isLoading}
                  required
                />
                
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateHint()}
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <Heart className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  style={{
                    backgroundColor: themeColor,
                    borderColor: themeColor,
                    color: 'white'
                  }}
                  disabled={isLoading || !inputDate.trim()}
                >
                  {isLoading ? 'Verifying...' : 'Verify 💕'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-4">
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ 
              backgroundColor: `${themeColor}10`,
              color: themeColor,
              border: `1px solid ${themeColor}30`
            }}
          >
            Made with 💝
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
