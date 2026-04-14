import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useThoughtsStore } from "../../../stores/thoughtsData";
import { useSettingsStore } from "../../../stores/settings";

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

  const handleClose = () => {
    setContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
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

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="thought-content" className="text-sm font-medium">
              {isGf ? "Her" : "His"} Secret Thought
            </Label>
            <Textarea
              id="thought-content"
              placeholder={isGf 
                ? "What's she really thinking... 😈" 
                : "What's he really thinking... 🤔"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              style={{
                borderColor: `${themeColor}40`
              }}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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