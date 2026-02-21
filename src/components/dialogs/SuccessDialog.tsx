import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  themeColor: string;
  title?: string;
  message?: string;
  recipientName?: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onOpenChange,
  themeColor,
  title = "Letter Sent!",
  message,
  recipientName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm text-center"
        style={{ borderColor: themeColor, borderWidth: 2 }}
      >
        {/* GIF */}
        <div className="flex justify-center pt-2">
          <img
            src="/assets/peach-goma.gif"
            alt="Success"
            style={{
              width: "min(140px, 40vw)",
              height: "auto",
              borderRadius: "12px",
            }}
          />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Sparkles size={18} style={{ color: themeColor }} />
          <h2
            className="text-xl font-bold"
            style={{ color: themeColor }}
          >
            {title}
          </h2>
          <Sparkles size={18} style={{ color: themeColor }} />
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm mt-1 leading-relaxed px-2">
          {message ?? (
            <>
              Your love letter has been delivered
              {recipientName ? (
                <>
                  {" "}to{" "}
                  <span className="font-semibold" style={{ color: themeColor }}>
                    {recipientName}
                  </span>
                </>
              ) : null}
              {" "}with all your heart 💕
            </>
          )}
        </p>

        {/* Decorative hearts row */}
        <div className="flex justify-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              size={12}
              fill={themeColor}
              color={themeColor}
              className="animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>

        {/* Close button */}
        <div className="mt-4 pb-1">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full text-white font-medium transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{ backgroundColor: themeColor }}
          >
            Yay! 🎉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
