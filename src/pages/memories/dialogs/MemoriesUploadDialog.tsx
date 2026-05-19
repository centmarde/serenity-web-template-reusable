import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Calendar,
  Heart,
  Image as ImageIcon,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { useThemeStore } from "../../../stores/theme";
import { useMemoriesStore } from "../../../stores/memoriesData";
import { useMemoryMilestonesStore } from "../../../stores/memoriesMilestoneData";
import { useMemoryImagesStore } from "../../../stores/memoriesImagesData";
import { toast } from "sonner";
import { AiSuggestion } from "../components/AiSuggestion";
import NullaRewardsDialog from "../../nulla/dialogs/NullaRewardsDialog";

interface MemoriesUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  details: string[];
  imageFiles: File[];
}

export const MemoriesUploadDialog: React.FC<MemoriesUploadDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { getCurrentThemeColor } = useThemeStore();
  const memoriesStore = useMemoriesStore();
  const milestonesStore = useMemoryMilestonesStore();
  const imagesStore = useMemoryImagesStore();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Today's date
    details: [],
    imageFiles: [],
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentDetail, setCurrentDetail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isBoyfriend, setIsBoyfriend] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get theme color with fallback
  let themeColor: string;
  try {
    themeColor = getCurrentThemeColor();
  } catch {
    themeColor = "#F2A6A6";
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleImagesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not a valid image file`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} must be smaller than 5MB`);
        return;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    }

    setFormData((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles],
    }));

    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }));

    setPreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the removed URL
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newUrls;
    });
  };

  const handleAddDetail = () => {
    if (currentDetail.trim()) {
      setFormData((prev) => ({
        ...prev,
        details: [...prev.details, currentDetail.trim()],
      }));
      setCurrentDetail("");
    }
  };

  const handleRemoveDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Please enter a memory title");
      return false;
    }
    if (!formData.date) {
      setError("Please select a date");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    // Store the form data for the async operation
    const memoryTitle = formData.title.trim();
    const memoryDescription = formData.description.trim();
    const memoryDate = formData.date;
    const memoryDetails = [...formData.details];
    const memoryImages = [...formData.imageFiles];

    // Show loading toast
    const loadingToastId = toast.loading("Creating memory...", {
      description: "Please wait while we save your beautiful memory",
    });

    // Reset form immediately for better UX
    resetForm();

    try {
      // 1. Create memory first
      const memoryData = {
        title: memoryTitle,
        description: memoryDescription || undefined,
        date: memoryDate,
      };

      const createdMemory = await memoriesStore.createMemory(memoryData);

      // 2. Upload images directly linked to the memory
      if (memoryImages.length > 0) {
        for (const imageFile of memoryImages) {
          // Upload image directly linked to the memory (more efficient)
          await imagesStore.uploadImage(imageFile, createdMemory.id);
        }
      }

      // 3. Create and link milestones to the memory
      if (memoryDetails.length > 0) {
        for (const detail of memoryDetails) {
          await milestonesStore.createMilestone({
            milestone: detail,
            memories_id: createdMemory.id, // Directly link to memory
          });
        }
      }

      // Success - dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success("Memory Created! 💕", {
        description: `Your memory "${memoryTitle}" has been successfully saved with all the beautiful details`,
        duration: 4000,
      });

      // Close dialog and trigger reload after successful creation
      onClose();
      onSuccess?.();

      // Only show rewards dialog if not boyfriend mode
      if (!isBoyfriend) {
        setIsRewardsOpen(true);
      }
    } catch (err) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create memory";
      toast.error("Creation Failed", {
        description: errorMessage,
        duration: 5000,
        action: {
          label: "Try Again",
          onClick: () => {
            toast.info("Please try creating the memory again", {
              description:
                "The upload dialog has been closed. Please click upload again to retry.",
              duration: 3000,
            });
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      details: [],
      imageFiles: [],
    });

    // Clean up preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setCurrentDetail("");
    setError(null);
  };

  const handleClose = () => {
    // Always allow closing - if loading, the operation continues in background
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-5 h-5" style={{ color: themeColor }} />
              Add New Memory
            </DialogTitle>
            <DialogDescription>
              Capture a special moment in your relationship timeline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Memory Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Memory Title *
              </Label>
              <div className="relative overflow-hidden">
                <Input
                  id="title"
                  placeholder="Our first date, Anniversary celebration..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full pr-32 overflow-hidden"
                  style={
                    {
                      borderColor: formData.title ? themeColor : undefined,
                      "--tw-ring-color": themeColor,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    } as React.CSSProperties
                  }
                />
                <div className="absolute top-1 right-1 z-10">
                  <AiSuggestion
                    type="title"
                    currentText={formData.title}
                    context={{
                      date: formData.date,
                      existingDescription: formData.description,
                      details: formData.details,
                    }}
                    onSuggestionSelect={(suggestion) =>
                      handleInputChange("title", suggestion)
                    }
                    themeColor={themeColor}
                  />
                </div>
              </div>
            </div>

            {/* Memory Date */}
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full"
                style={
                  {
                    borderColor: formData.date ? themeColor : undefined,
                    "--tw-ring-color": themeColor,
                  } as React.CSSProperties
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <div className="relative overflow-hidden">
                <Textarea
                  id="description"
                  placeholder="Tell the story of this beautiful memory..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="min-h-[80px] resize-none pr-32 whitespace-pre-wrap break-all overflow-hidden"
                  style={
                    {
                      borderColor: formData.description
                        ? themeColor
                        : undefined,
                      "--tw-ring-color": themeColor,
                      wordBreak: "break-all",
                      overflowWrap: "anywhere",
                    } as React.CSSProperties
                  }
                />
                <div className="absolute top-1 right-1 z-10">
                  <AiSuggestion
                    type="description"
                    currentText={formData.description}
                    context={{
                      date: formData.date,
                      existingTitle: formData.title,
                      details: formData.details,
                    }}
                    onSuggestionSelect={(suggestion) =>
                      handleInputChange("description", suggestion)
                    }
                    themeColor={themeColor}
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details" className="text-sm font-medium">
                Details (Optional)
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 relative overflow-hidden">
                  <Input
                    id="details"
                    placeholder="First Date, Anniversary, Birthday..."
                    value={currentDetail}
                    onChange={(e) => setCurrentDetail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddDetail()}
                    className="w-full pr-32 overflow-hidden"
                    style={
                      {
                        borderColor: currentDetail ? themeColor : undefined,
                        "--tw-ring-color": themeColor,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      } as React.CSSProperties
                    }
                  />
                  <div className="absolute top-1 right-1 z-10">
                    <AiSuggestion
                      type="detail"
                      currentText={currentDetail}
                      context={{
                        date: formData.date,
                        existingTitle: formData.title,
                        existingDescription: formData.description,
                        details: formData.details,
                      }}
                      onSuggestionSelect={(suggestion) =>
                        setCurrentDetail(suggestion)
                      }
                      themeColor={themeColor}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddDetail}
                  disabled={!currentDetail.trim()}
                  variant="outline"
                  style={{
                    borderColor: themeColor,
                    color: themeColor,
                  }}
                >
                  Add
                </Button>
              </div>
              {formData.details.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.details.map((detail, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                      style={{
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                      }}
                    >
                      {detail}
                      <X
                        className="w-3 h-3 cursor-pointer hover:bg-red-100 rounded"
                        onClick={() => handleRemoveDetail(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Images Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Memory Photos (Optional)
              </Label>

              {/* Upload Area */}
              <Card
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Upload className="w-8 h-8 text-neutral-400 mb-3" />
                  <p className="text-sm text-neutral-600 text-center">
                    Click to upload images
                  </p>
                  <p className="text-xs text-neutral-500 text-center mt-1">
                    PNG, JPG, GIF up to 5MB each • Multiple files supported
                  </p>
                </CardContent>
              </Card>

              {/* Preview Images */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <Card key={index}>
                      <CardContent className="p-2">
                        <div className="relative">
                          <img
                            src={url}
                            alt={`Memory preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 w-6 h-6 p-0"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <Badge
                          variant="secondary"
                          className="mt-1 text-xs truncate w-full"
                        >
                          {formData.imageFiles[index]?.name}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesSelect}
                className="hidden"
              />
            </div>

            {/* Boyfriend Mode Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-boyfriend" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Boyfriend Mode
                </Label>
                <Switch
                  id="is-boyfriend"
                  checked={isBoyfriend}
                  onCheckedChange={setIsBoyfriend}
                />
              </div>
              <p className="text-xs text-gray-500">
                {isBoyfriend
                  ? "Reward dialog will be skipped for this memory."
                  : "You'll receive a bundle reward after creating this memory."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.title.trim()}
                className="flex-1"
                style={{
                  backgroundColor: themeColor,
                  borderColor: themeColor,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Memory...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Create Memory
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <NullaRewardsDialog
        open={isRewardsOpen}
        onOpenChange={setIsRewardsOpen}
        rewardMode="bundle"
      />
    </>
  );
};
