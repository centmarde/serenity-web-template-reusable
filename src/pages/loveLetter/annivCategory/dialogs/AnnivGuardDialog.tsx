import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Clock } from "lucide-react";
import { calculateAnniversaryCountdown } from "@/utils/helpers";
import type { AnniversaryCountdown } from "@/utils/helpers";

interface AnnivGuardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupleOfficialDate: string;
  themeColor: string;
  onNavigateToAnniversary?: () => void;
}

const AnnivGuardDialog: React.FC<AnnivGuardDialogProps> = ({
  open,
  onOpenChange,
  coupleOfficialDate,
  themeColor,
  onNavigateToAnniversary
}) => {
  // Ensure we have a valid date before calculating
  const isValidDate = coupleOfficialDate && coupleOfficialDate.length > 0;
  const anniversaryInfo: AnniversaryCountdown = isValidDate ? 
    calculateAnniversaryCountdown(coupleOfficialDate) : 
    {
      nextAnniversaryNumber: 1,
      daysUntilAnniversary: 365,
      isToday: false,
      ordinalSuffix: 'st'
    };
  
  // Debug logging to check the calculation
  console.log('Anniversary Debug:', {
    coupleOfficialDate,
    isValidDate,
    anniversaryInfo,
    currentDate: new Date().toISOString()
  });

  const handleOpenAnyway = () => {
    onOpenChange(false);
    if (onNavigateToAnniversary) {
      onNavigateToAnniversary();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-2" 
        style={{ borderColor: `${themeColor}30` }}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {anniversaryInfo.isToday ? (
              <>
                <img
                  src="/assets/dudu-cute.gif"
                  alt="Anniversary celebration"
                  className="w-36 h-36 mx-auto rounded-xl opacity-95"
                />
              </>
            ) : (
              <>
                <img
                  src="/assets/guard.gif"
                  alt="Not yet time"
                  className="w-40 h-40 mx-auto rounded-xl opacity-95"
                />
              </>
            )}
          </div>
          
          <DialogTitle className="text-xl font-bold text-gray-800">
            {anniversaryInfo.isToday ? (
              "🎉 Happy Anniversary! 🎉"
            ) : (
              "Oops! Not quite time yet..."
            )}
          </DialogTitle>
          
          <DialogDescription className="text-gray-600 space-y-3 text-center">
            {anniversaryInfo.isToday ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold" style={{ color: themeColor }}>
                  Today is your {anniversaryInfo.nextAnniversaryNumber}{anniversaryInfo.ordinalSuffix} anniversary! 🥳
                </p>
                <p>
                  This special letter has been waiting for this exact moment. 
                  Ready to celebrate this milestone together? ✨
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  This letter is meant to be opened on our {anniversaryInfo.nextAnniversaryNumber}{anniversaryInfo.ordinalSuffix} anniversary! 
                </p>
                <div className="flex items-center justify-center gap-2 my-3 p-3 rounded-lg"
                  style={{ backgroundColor: `${themeColor}10` }}>
                  <Clock size={20} style={{ color: themeColor }} />
                  <span className="font-bold text-lg" style={{ color: themeColor }}>
                    {isNaN(anniversaryInfo.daysUntilAnniversary) ? 'Calculating...' : 
                     `${anniversaryInfo.daysUntilAnniversary} ${anniversaryInfo.daysUntilAnniversary === 1 ? 'day' : 'days'} remaining`}
                  </span>
                </div>
                <p className="text-sm">
                  This special letter is meant to be a surprise for that perfect day! 
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-center mt-6">
          <Button
            onClick={anniversaryInfo.isToday ? handleOpenAnyway : () => onOpenChange(false)}
            className="px-8 py-2 text-white font-semibold flex items-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            <Heart size={16} fill="white" />
            {anniversaryInfo.isToday ? "Open Anniversary Letter" : "I'll Wait Patiently 💕"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnivGuardDialog;
