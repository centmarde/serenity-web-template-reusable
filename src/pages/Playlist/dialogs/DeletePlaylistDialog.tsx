import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import type { Song } from "../../../stores/songsData";

interface DeleteSongDialogProps {
  song: Song | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export const DeleteSongDialog: React.FC<DeleteSongDialogProps> = ({
  song,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!song) return;
    setIsDeleting(true);
    await onConfirm(song.id);
    setIsDeleting(false);
  };

  const handleClose = () => {
    if (isDeleting) return;
    onClose();
  };

  return (
    <Dialog open={!!song} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-500">
            <span className="flex items-center gap-2">
              <Trash2 size={16} className="text-red-500" />
              Delete Song
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">
              "{song?.title || "this song"}"
            </span>
            ?{" "}
            <span className="text-red-400">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Deleting…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Trash2 size={12} />
                Delete
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
