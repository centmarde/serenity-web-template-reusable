import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, Heart } from "lucide-react";

interface SentConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  themeColor: string;
  letterTitle: string;
  recipientName: string;
}

const SentConfirmationDialog: React.FC<SentConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isSubmitting,
  themeColor,
  letterTitle,
  recipientName,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="max-w-sm"
        style={{ borderColor: themeColor, borderWidth: 2 }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Heart
              size={20}
              fill={themeColor}
              color={themeColor}
              className="animate-pulse shrink-0"
            />
            <span style={{ color: themeColor }}>Send this love letter?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-1">
            <span className="block text-gray-600">
              You're about to send{" "}
              <span className="font-semibold text-gray-800">
                "{letterTitle}"
              </span>{" "}
              to{" "}
              <span className="font-semibold" style={{ color: themeColor }}>
                {recipientName}
              </span>
              .
            </span>
            <span className="block text-gray-500 text-xs mt-2">
              This will be saved and delivered with all your love 💕
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            style={{ borderColor: themeColor, color: themeColor }}
            className="transition-all duration-200"
          >
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className="text-white font-medium transition-all duration-200 hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Yes, Send it!</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SentConfirmationDialog;
