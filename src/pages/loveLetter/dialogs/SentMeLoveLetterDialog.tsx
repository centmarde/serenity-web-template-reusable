import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Send } from "lucide-react";

interface ComponentData {
  themeColor: string;
  callsign: string;
  bfName: string;
  gfName: string;
}

interface SentMeLoveLetterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SentMeLoveLetterDialog: React.FC<SentMeLoveLetterDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const {
    getCallsign,
    getBfName,
    getGfName,
    loadSettings,
  } = useSettingsStore();

  const { getCurrentThemeColor, waitForInitialization } = useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [letterTitle, setLetterTitle] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          bfName: getBfName(),
          gfName: getGfName(),
        };

        setData(loadedData);
      } catch (error) {
        console.error("Failed to initialize Send Love Letter Dialog:", error);
      }
    };
    initialize();
  }, [
    waitForInitialization,
    loadSettings,
    getCurrentThemeColor,
    getCallsign,
    getBfName,
    getGfName,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterTitle.trim() || !letterContent.trim()) return;

    setIsSubmitting(true);
    
    // Simulate sending (you can implement actual functionality later)
    setTimeout(() => {
      setIsSubmitting(false);
      setLetterTitle("");
      setLetterContent("");
      onOpenChange(false);
      // You could show a success message here
    }, 1500);
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>

      <DialogContent
        className="sm:max-w-md mx-auto"
        style={{
          borderColor: data.themeColor,
          background: `linear-gradient(135deg, ${data.themeColor}10, ${data.themeColor}20, #ffffff)`,
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-center flex items-center justify-center gap-2"
            style={{ color: data.themeColor }}
          >
            <Heart size={20} fill={data.themeColor} color={data.themeColor} />
            <span style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)" }}>
              Send Me a Love Letter
            </span>
            <Heart size={20} fill={data.themeColor} color={data.themeColor} />
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Input
              placeholder="Letter title..."
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              className="border-2 focus:ring-2 transition-all duration-200"
              style={{
                borderColor: `${data.themeColor}30`,
                backgroundColor: `${data.themeColor}05`,
              }}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Textarea
              placeholder={`Dear ${data.gfName || 'Beautiful'},\n\nWrite your love letter here... 💕`}
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              rows={6}
              className="border-2 focus:ring-2 transition-all duration-200 resize-none"
              style={{
                borderColor: `${data.themeColor}30`,
                backgroundColor: `${data.themeColor}05`,
              }}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 transition-all duration-200"
              style={{
                borderColor: data.themeColor,
                color: data.themeColor,
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: data.themeColor }}
              disabled={isSubmitting || !letterTitle.trim() || !letterContent.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                  />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send size={16} />
                  <span>Send Letter</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SentMeLoveLetterDialog;
