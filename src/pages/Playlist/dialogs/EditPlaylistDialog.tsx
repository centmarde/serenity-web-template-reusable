import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import type { Song } from "../../../stores/songsData";

// ─────────────────────────────────────────
// Edit Dialog
// ─────────────────────────────────────────

interface EditSongDialogProps {
  song: Song | null;
  themeColor: string;
  onClose: () => void;
  onSave: (id: number, title: string, description: string) => Promise<void>;
}

export const EditSongDialog: React.FC<EditSongDialogProps> = ({
  song,
  themeColor,
  onClose,
  onSave,
}) => {
  // Initialize directly from prop — the parent passes `key={song?.id}` to reset on song change
  const [editTitle, setEditTitle] = useState(song?.title ?? "");
  const [editDescription, setEditDescription] = useState(song?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!song) return;
    setIsSaving(true);
    await onSave(song.id, editTitle, editDescription);
    setIsSaving(false);
  };

  const handleClose = () => {
    setEditTitle("");
    setEditDescription("");
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={!!song} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle style={{ color: themeColor }}>
            <span className="flex items-center gap-2">
              <Pencil size={16} style={{ color: themeColor }} />
              Edit Song
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Update the title and description for this song.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Title</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Song title"
              className="h-9 focus-visible:ring-0"
              style={{ borderColor: `${themeColor}50` }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editTitle.trim()) handleSave();
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Song description (optional)"
              className="h-9 focus-visible:ring-0"
              style={{ borderColor: `${themeColor}50` }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editTitle.trim()) handleSave();
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !editTitle.trim()}
            className="h-8 text-xs text-white"
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
