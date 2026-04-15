import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useThoughtsStore, type Thought } from "../../../stores/thoughtsData";


interface DeleteThoughtsConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thought: Thought | null;
  personName: string;
  onSuccess?: () => void;
}

const DeleteThoughtsConfirmationDialog: React.FC<DeleteThoughtsConfirmationDialogProps> = ({
  isOpen,
  onClose,
  thought,
  personName,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();
  const { deleteThought } = useThoughtsStore();

  const handleDelete = async () => {
    if (!thought) return;

    setIsDeleting(true);
    try {
      const result = await deleteThought(thought.id);
      if (result) {
        console.log(`✅ Successfully deleted thought for ${personName}!`);
        onClose();
        onSuccess?.(); // Trigger refetch in component
      }
    } catch (error) {
      console.error("Failed to delete thought:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!thought) return null;

  const truncatedContent = thought.content 
    ? thought.content.length > 50 
      ? `${thought.content.substring(0, 50)}...`
      : thought.content
    : "Empty thought";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[90vw]' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle 
            className="text-xl font-bold text-red-600"
          >
            🗑️ Delete Evil Thought
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {personName}'s secret thought?
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 ${isMobile ? 'py-2' : 'py-4'}`}>
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm text-gray-700 italic">
              "{truncatedContent}"
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(thought.created_at).toLocaleDateString()} at{' '}
              {new Date(thought.created_at).toLocaleTimeString()}
            </p>
          </div>

          <p className="text-sm text-red-600 font-medium">
            ⚠️ This action cannot be undone!
          </p>

          <div className={`flex justify-end space-x-2 ${isMobile ? 'pt-2' : 'pt-4'}`}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete Thought"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteThoughtsConfirmationDialog;