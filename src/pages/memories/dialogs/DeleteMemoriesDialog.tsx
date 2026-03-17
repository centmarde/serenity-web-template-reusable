import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '../../../stores/theme';
import { useMemoriesStore } from '../../../stores/memoriesData';
import { useMemoryMilestonesStore } from '../../../stores/memoriesMilestoneData';
import { useMemoryImagesStore } from '../../../stores/memoriesImagesData';
import { generateSixDigitCode } from '../../../utils/helpers';
import { DeleteMemoriesConfirmationDialog } from './DeleteMemoriesConfirmationDialog';
import { toast } from 'sonner';
import type { Memory } from '../../../stores/memoriesData';

interface DeleteMemoriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
}

export const DeleteMemoriesDialog: React.FC<DeleteMemoriesDialogProps> = ({
  isOpen,
  onClose,
  memory
}) => {
  const { getCurrentThemeColor } = useThemeStore();
  const memoriesStore = useMemoriesStore();
  const milestonesStore = useMemoryMilestonesStore();
  const imagesStore = useMemoryImagesStore();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Get theme color with fallback
  let themeColor: string;
  try {
    themeColor = getCurrentThemeColor();
  } catch {
    themeColor = '#F2A6A6';
  }

  const handleInitialDelete = () => {
    const code = generateSixDigitCode();
    setVerificationCode(code);
    setShowConfirmation(true);
  };

  const handleConfirmedDelete = async () => {
    if (!memory) return;

    // Store memory info for the async operation
    const memoryTitle = memory.title || 'Untitled';
    const memoryId = memory.id;

    // Immediately close dialogs and show loading toast
    const loadingToastId = toast.loading('Deleting memory...', {
      description: 'Please wait while we remove your memory and all related data',
    });

    // Close all dialogs immediately
    setShowConfirmation(false);
    onClose();

    try {
      // Delete related milestones first
      const relatedMilestones = milestonesStore.milestones.filter(m => m.memories_id === memoryId);
      for (const milestone of relatedMilestones) {
        await milestonesStore.deleteMilestone(milestone.id);
      }

      // Delete related images
      const relatedImages = imagesStore.images.filter(img => img.memories_id === memoryId);
      for (const image of relatedImages) {
        await imagesStore.deleteImage(image.id);
      }

      // Finally delete the memory
      await memoriesStore.deleteMemory(memoryId);

      // Success - dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success('Memory Deleted 🗑️', {
        description: `Your memory "${memoryTitle}" has been permanently deleted`,
        duration: 4000,
      });

    } catch (error) {
      console.error('Failed to delete memory:', error);
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete memory';
      toast.error('Delete Failed', {
        description: errorMsg,
        duration: 5000,
        action: {
          label: 'Try Again',
          onClick: () => {
            toast.info('Please try deleting the memory again', {
              description: 'The delete dialog has been closed. Please click delete again to retry.',
              duration: 3000,
            });
          },
        },
      });
    }
  };

  const handleClose = () => {
    // Always allow closing - if deleting, the operation continues in background
    setShowConfirmation(false);
    onClose();
  };

  const handleConfirmationClose = () => {
    // Always allow closing the confirmation dialog
    setShowConfirmation(false);
  };



  if (!memory) return null;

  // Count related items
  const relatedMilestones = milestonesStore.milestones.filter(m => m.memories_id === memory.id);
  const relatedImages = imagesStore.images.filter(img => img.memories_id === memory.id);

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Memory
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${themeColor}10`,
                borderColor: `${themeColor}30`
              }}
            >
              <h4 className="font-semibold text-lg mb-2">{memory.title || 'Untitled Memory'}</h4>
              {memory.description && (
                <p className="text-sm text-neutral-600 mb-2">{memory.description}</p>
              )}
              {memory.date && (
                <p className="text-sm text-neutral-500">
                  Date: {new Date(memory.date).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-orange-800 font-medium mb-1">
                    This will permanently delete:
                  </p>
                  <ul className="text-orange-700 space-y-1">
                    <li>• The memory: "{memory.title || 'Untitled Memory'}"</li>
                    {relatedMilestones.length > 0 && (
                      <li>• {relatedMilestones.length} related milestone{relatedMilestones.length > 1 ? 's' : ''}</li>
                    )}
                    {relatedImages.length > 0 && (
                      <li>• {relatedImages.length} related image{relatedImages.length > 1 ? 's' : ''}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleInitialDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteMemoriesConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmedDelete}
        memory={memory}
        verificationCode={verificationCode}
      />
    </>
  );
};

export default DeleteMemoriesDialog;
