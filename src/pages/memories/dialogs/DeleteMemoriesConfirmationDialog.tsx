import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useThemeStore } from '../../../stores/theme';
import type { Memory } from '../../../stores/memoriesData';

interface DeleteMemoriesConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memory: Memory | null;
  verificationCode: string;
}

export const DeleteMemoriesConfirmationDialog: React.FC<DeleteMemoriesConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  memory,
  verificationCode
}) => {
  const { getCurrentThemeColor } = useThemeStore();
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  // Get theme color with fallback
  let themeColor: string;
  try {
    themeColor = getCurrentThemeColor();
  } catch {
    themeColor = '#F2A6A6';
  }

  const handleConfirm = () => {
    if (inputCode.trim() === verificationCode) {
      setInputCode('');
      setError('');
      onClose(); // Auto-close the confirmation dialog
      onConfirm(); // Execute the deletion
    } else {
      setError('Verification code does not match');
    }
  };

  const handleClose = () => {
    setInputCode('');
    setError('');
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCode(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (!memory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirm Delete Memory
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-2">
              <strong>Warning:</strong> This action cannot be undone.
            </p>
            <p className="text-sm text-red-700">
              You are about to delete: <strong>{memory.title || 'Untitled Memory'}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-code">
              Enter verification code: <strong style={{ color: themeColor }}>{verificationCode}</strong>
            </Label>
            <Input
              id="verification-code"
              value={inputCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{ borderColor: error ? '#ef4444' : undefined }}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!inputCode.trim()}
          >
            Delete Memory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMemoriesConfirmationDialog;
