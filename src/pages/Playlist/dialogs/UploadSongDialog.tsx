import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, Music, X, CheckCircle2 } from "lucide-react";

interface UploadSongDialogProps {
  isOpen: boolean;
  themeColor: string;
  onClose: () => void;
  onUpload: (file: File, title: string, description: string) => Promise<void>;
}

export const UploadSongDialog: React.FC<UploadSongDialogProps> = ({
  isOpen,
  themeColor,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    // Check if it's an MP3 file
    if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
      setError("Only .mp3 files are allowed");
      return false;
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        // Auto-fill title from filename (without extension)
        const fileName = file.name.replace(/\.mp3$/i, "");
        setTitle(fileName);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        // Auto-fill title from filename (without extension)
        const fileName = file.name.replace(/\.mp3$/i, "");
        setTitle(fileName);
      }
    }
  }, []);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await onUpload(selectedFile, title.trim(), description.trim());
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setError(null);
    setIsDragging(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selectedFile && title.trim() && !isUploading) {
      e.preventDefault();
      handleUpload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: themeColor }}>
            <span className="flex items-center gap-2">
              <Upload size={18} style={{ color: themeColor }} />
              Upload Song
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Add a new song to your playlist. Only .mp3 files are supported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dropzone */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer hover:bg-gray-50"
              style={{
                borderColor: isDragging ? themeColor : "#e5e7eb",
                backgroundColor: isDragging ? `${themeColor}10` : "transparent",
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".mp3,audio/mpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-3">
                <div
                  className="p-4 rounded-full"
                  style={{
                    backgroundColor: `${themeColor}15`,
                    border: `2px solid ${themeColor}30`,
                  }}
                >
                  <Music size={32} style={{ color: themeColor }} />
                </div>
                
                <div>
                  <p className="font-medium text-gray-700 mb-1">
                    Drop your .mp3 file here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="border-2 rounded-lg p-4"
              style={{ borderColor: `${themeColor}40`, backgroundColor: `${themeColor}05` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  <CheckCircle2 size={20} style={{ color: themeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <X size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          {/* Title Input */}
          {selectedFile && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Title <span className="text-red-400">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Song title..."
                  disabled={isUploading}
                  className="h-9 text-sm focus-visible:ring-0"
                  style={{
                    borderColor: `${themeColor}40`,
                    fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                  }}
                  maxLength={100}
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Optional description..."
                  disabled={isUploading}
                  className="h-9 text-sm focus-visible:ring-0"
                  style={{
                    borderColor: `${themeColor}40`,
                    fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                  }}
                  maxLength={200}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="h-9 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || isUploading}
            className="h-9 text-sm text-white"
            style={{
              backgroundColor: themeColor,
              opacity: (!selectedFile || !title.trim() || isUploading) ? 0.5 : 1,
            }}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={14} />
                Upload Song
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
