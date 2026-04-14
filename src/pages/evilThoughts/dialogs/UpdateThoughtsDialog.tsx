import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useThoughtsStore, type Thought } from "../../../stores/thoughtsData";
import { useSettingsStore } from "../../../stores/settings";

interface UpdateThoughtsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thought: Thought | null;
  personName: string;
  onSuccess?: () => void;
}

const UpdateThoughtsDialog: React.FC<UpdateThoughtsDialogProps> = ({
  isOpen,
  onClose,
  thought,
  personName,
  onSuccess
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateThought } = useThoughtsStore();
  const { getThemeColor } = useSettingsStore();
  const themeColor = getThemeColor();

  useEffect(() => {
    if (thought && isOpen) {
      setContent(thought.content || "");
    }
  }, [thought, isOpen]);

  const handleSubmit = async () => {
    if (!thought || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateThought(thought.id, {
        content: content.trim()
      });
      if (result) {
        console.log(`✅ Successfully updated thought for ${personName}!`);
        onClose();
        onSuccess?.(); // Trigger refetch in component
      }
    } catch (error) {
      console.error("Failed to update thought:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent("");
    onClose();
  };

  if (!thought) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle 
            className="text-xl font-bold"
            style={{ color: themeColor }}
          >
            ✏️ Edit Evil Thought
          </DialogTitle>
          <DialogDescription>
            Update what's really on {personName}'s mind...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-thought-content" className="text-sm font-medium">
              {thought.is_gf ? "Her" : "His"} Secret Thought
            </Label>
            <Textarea
              id="edit-thought-content"
              placeholder={thought.is_gf 
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
              {isSubmitting ? "Updating..." : "Update Thought"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateThoughtsDialog;