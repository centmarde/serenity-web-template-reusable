import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Smile } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useThoughtsStore } from "../../../stores/thoughtsData";
import { useSettingsStore } from "../../../stores/settings";
import EmojiPicker from "../components/EmojiPicker";

interface AddThoughtsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isGf: boolean;
  personName: string;
  onSuccess?: () => void;
}

const AddThoughtsDialog: React.FC<AddThoughtsDialogProps> = ({
  isOpen,
  onClose,
  isGf,
  personName,
  onSuccess
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const { createThought } = useThoughtsStore();
  const { getThemeColor } = useSettingsStore();
  const themeColor = getThemeColor();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const newThought = await createThought({
        content: content.trim(),
        is_gf: isGf
      });
      
      if (newThought) {
        console.log(`✅ Successfully added new thought for ${personName}!`);
        setContent("");
        onClose();
        onSuccess?.(); // Trigger refetch in component
      } else {
        console.error("Failed to create thought: No data returned");
      }
    } catch (error) {
      console.error("Failed to create thought:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      // Fallback: append to end
      setContent(prev => prev + emoji);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleClose = () => {
    setContent("");
    setShowEmojiPicker(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`${isMobile ? 'max-w-[90vw]' : 'max-w-md'}`}
        style={isMobile && showEmojiPicker ? { 
          transform: 'translateY(-20vh)',
          transition: 'transform 0.2s ease-out' 
        } : {}}>
        <DialogHeader>
          <DialogTitle 
            className="text-xl font-bold"
            style={{ color: themeColor }}
          >
            💭 New Evil Thought
          </DialogTitle>
          <DialogDescription>
            What's really on {personName}'s mind right now?
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 ${isMobile ? 'py-2' : 'py-4'}`}>
          <div className="space-y-2">
            <Label htmlFor="thought-content" className="text-sm font-medium">
              {isGf ? "Her" : "His"} Secret Thought
            </Label>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="thought-content"
                placeholder={isGf 
                  ? "What's she really thinking... 😈" 
                  : "What's he really thinking... 🤔"
                }
                value={content}
                onChange={handleTextareaChange}
                className="min-h-[100px] resize-none pr-12"
                style={{
                  borderColor: `${themeColor}40`
                }}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-opacity-20 transition-all duration-200 z-10"
                      style={{
                        backgroundColor: showEmojiPicker ? `${themeColor}20` : 'transparent',
                        color: themeColor
                      }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8}>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <span>{showEmojiPicker ? 'Hide' : 'Add'} emojis</span>
                      <span className="text-xs opacity-70">😊💭✨</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Floating EmojiPicker */}
              {showEmojiPicker && (
                <div 
                  className="absolute top-0 z-50"
                  style={isMobile ? {
                    right: '0',
                    left: 'auto',
                    top: '100%',
                    marginTop: '8px',
                    minWidth: '280px',
                    maxWidth: '90vw'
                  } : {
                    left: '100%',
                    marginLeft: '8px',
                    minWidth: '300px'
                  }}
                >
                  <div 
                    className="relative"
                    style={{
                      filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))',
                    }}
                  >
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    
                    {/* Arrow pointer */}
                    <div
                      className="absolute"
                      style={isMobile ? {
                        top: '-8px',
                        right: '16px',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid white',
                        filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1))'
                      } : {
                        left: '-8px',
                        top: '16px',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '8px solid white',
                        filter: 'drop-shadow(-2px 0 4px rgba(0, 0, 0, 0.1))'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`flex justify-end space-x-2 ${isMobile ? 'pt-2' : 'pt-4'}`}>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              style={{
                backgroundColor: themeColor,
                borderColor: themeColor
              }}
              className="text-white hover:opacity-90"
            >
              {isSubmitting ? "Adding..." : "Add Thought"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddThoughtsDialog;