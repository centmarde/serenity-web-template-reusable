import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  themeColor?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  onOpenChange,
  themeColor = "#F2A6A6",
  title = "Oops, something went wrong!",
  message = "Your letter couldn't be sent. Please try again.",
  onRetry,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm text-center"
        style={{ borderColor: "#f87171", borderWidth: 2 }}
      >
        {/* GIF */}
        <div className="flex justify-center pt-2">
          <img
            src="/assets/sad.gif"
            alt="Error"
            style={{
              width: "min(140px, 40vw)",
              height: "auto",
              borderRadius: "12px",
            }}
          />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <h2 className="text-xl font-bold text-red-500">{title}</h2>
        </div>

        {/* Message */}
        <p className="text-gray-500 text-sm mt-1 leading-relaxed px-2">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-4 pb-1">
          {onRetry && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onRetry();
              }}
              className="w-full text-white font-medium transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{ backgroundColor: themeColor }}
            >
              Try Again 💌
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full transition-all duration-200"
            style={{ borderColor: "#f87171", color: "#f87171" }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;
