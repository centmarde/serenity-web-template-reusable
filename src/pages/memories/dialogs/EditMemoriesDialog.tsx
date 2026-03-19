import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Save, Calendar, FileText, ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../../stores/theme';
import { useMemoriesStore } from '../../../stores/memoriesData';
import { useMemoryMilestonesStore } from '../../../stores/memoriesMilestoneData';
import { useMemoryImagesStore } from '../../../stores/memoriesImagesData';
import { toast } from 'sonner';
import type { Memory } from '../../../stores/memoriesData';

interface EditMemoriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  details: string[];
  newImageFiles: File[];
}

export const EditMemoriesDialog: React.FC<EditMemoriesDialogProps> = ({
  isOpen,
  onClose,
  memory
}) => {
  const { getCurrentThemeColor } = useThemeStore();
  const memoriesStore = useMemoriesStore();
  const milestonesStore = useMemoryMilestonesStore();
  const imagesStore = useMemoryImagesStore();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    details: [],
    newImageFiles: []
  });
  
  const [existingImages, setExistingImages] = useState<Array<{id: number, image_src: string | null}>>([]);
  const [existingMilestones, setExistingMilestones] = useState<Array<{id: number, milestone: string | null}>>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentDetail, setCurrentDetail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get theme color with fallback
  let themeColor: string;
  try {
    themeColor = getCurrentThemeColor();
  } catch {
    themeColor = '#F2A6A6';
  }

  // Initialize form data when memory changes
  useEffect(() => {
    if (memory) {
      // Set basic memory data
      setFormData({
        title: memory.title || '',
        description: memory.description || '',
        date: memory.date ? memory.date.split('T')[0] : '',
        details: [],
        newImageFiles: []
      });

      // Load existing milestones
      const memoryMilestones = milestonesStore.milestones.filter(m => m.memories_id === memory.id);
      setExistingMilestones(memoryMilestones);
      setFormData(prev => ({
        ...prev,
        details: memoryMilestones.map(m => m.milestone || '')
      }));

      // Load existing images
      const memoryImages = imagesStore.images.filter(img => img.memories_id === memory.id);
      setExistingImages(memoryImages);
      
      // Reset images to delete
      setImagesToDelete([]);
    }
  }, [memory, milestonesStore.milestones, imagesStore.images]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      if (!file.type.startsWith('image/')) {
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

    setFormData(prev => ({ 
      ...prev, 
      newImageFiles: [...prev.newImageFiles, ...validFiles] 
    }));
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== index)
    }));

    setPreviewUrls(prev => {
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
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, currentDetail.trim()]
      }));
      setCurrentDetail('');
    }
  };

  const handleRemoveDetail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteExistingImage = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Please enter a memory title');
      return false;
    }
    if (!formData.date) {
      setError('Please select a date');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!memory || !validateForm()) return;

    setIsLoading(true);
    setError(null);

    // Store the form data for the async operation
    const memoryTitle = formData.title.trim();
    const memoryDescription = formData.description.trim();
    const memoryDate = formData.date;
    const memoryDetails = [...formData.details];
    const memoryImages = [...formData.newImageFiles];

    // Immediately close dialog and show loading toast
    const loadingToastId = toast.loading('Updating memory...', {
      description: 'Please wait while we save your beautiful memory',
    });

    // Reset form and close dialog immediately
    resetForm();
    onClose();

    try {
      // 1. Update memory
      await memoriesStore.updateMemory({
        id: memory.id,
        title: memoryTitle,
        description: memoryDescription || undefined,
        date: memoryDate || undefined
      });

      // 2. Handle milestones - remove existing ones and add new ones
      for (const existingMilestone of existingMilestones) {
        await milestonesStore.deleteMilestone(existingMilestone.id);
      }
      
      for (const detail of memoryDetails) {
        if (detail.trim()) {
          await milestonesStore.createMilestone({
            milestone: detail.trim(),
            memories_id: memory.id
          });
        }
      }

      // 3. Delete marked existing images
      for (const imageId of imagesToDelete) {
        await imagesStore.deleteImage(imageId);
      }

      // 4. Upload new images
      for (const imageFile of memoryImages) {
        await imagesStore.uploadImage(imageFile, memory.id);
      }

      // Success - dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success('Memory Updated! 💕', {
        description: `Your memory "${memoryTitle}" has been successfully updated with all the beautiful details`,
        duration: 4000,
      });

    } catch (err) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update memory';
      toast.error('Update Failed', {
        description: errorMsg,
        duration: 5000,
        action: {
          label: 'Try Again',
          onClick: () => {
            // Re-open dialog to try again (this would need parent component support)
            toast.info('Please try editing the memory again', {
              description: 'The edit dialog has been closed. Please click edit again to retry.',
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
      title: '',
      description: '',
      date: '',
      details: [],
      newImageFiles: []
    });
    
    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setImagesToDelete([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setCurrentDetail('');
    setError(null);
  };

  const handleClose = () => {
    // Always allow closing - if loading, the operation continues in background
    resetForm();
    onClose();
  };



  if (!memory) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit3 className="w-5 h-5" style={{ color: themeColor }} />
            Edit Memory
          </DialogTitle>
          <DialogDescription>
            Update your special memory details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Memory Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Memory Title *
            </Label>
            <Input
              id="title"
              placeholder="Our first date, Anniversary celebration..."
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
              style={{ 
                borderColor: formData.title ? themeColor : undefined,
                '--tw-ring-color': themeColor 
              } as React.CSSProperties}
            />
          </div>

          {/* Memory Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full"
              style={{ 
                borderColor: formData.date ? themeColor : undefined,
                '--tw-ring-color': themeColor 
              } as React.CSSProperties}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Tell the story of this beautiful memory..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-20 resize-none"
              style={{ 
                borderColor: formData.description ? themeColor : undefined,
                '--tw-ring-color': themeColor 
              } as React.CSSProperties}
            />
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium">
              Details
            </Label>
            <div className="flex gap-2">
              <Input
                id="details"
                placeholder="First Date, Anniversary, Birthday..."
                value={currentDetail}
                onChange={(e) => setCurrentDetail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDetail()}
                className="flex-1"
                style={{ 
                  borderColor: currentDetail ? themeColor : undefined,
                  '--tw-ring-color': themeColor 
                } as React.CSSProperties}
              />
              <Button
                type="button"
                onClick={handleAddDetail}
                disabled={!currentDetail.trim()}
                variant="outline"
                style={{
                  borderColor: themeColor,
                  color: themeColor
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
                    <span 
                      className="cursor-pointer hover:bg-red-500 hover:text-white rounded p-0.5 transition-colors duration-200"
                      onClick={() => handleRemoveDetail(index)}
                      title="Remove this detail"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Current Photos ({existingImages.length})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingImages.map((image, index) => (
                  <Card key={image.id}>
                    <CardContent className="p-2">
                      <div className="relative">
                        <img
                          src={image.image_src || ''}
                          alt={`Memory image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => handleDeleteExistingImage(image.id)}
                          title="Delete this image"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Current Image
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Add New Photos (Optional)
            </Label>

            {/* Upload Area */}
            <Card 
              className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Upload className="w-8 h-8 text-neutral-400 mb-3" />
                <p className="text-sm text-neutral-600 text-center">
                  Click to upload additional images
                </p>
                <p className="text-xs text-neutral-500 text-center mt-1">
                  PNG, JPG, GIF up to 5MB each • Multiple files supported
                </p>
              </CardContent>
            </Card>

            {/* Preview New Images */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <Card key={index}>
                    <CardContent className="p-2">
                      <div className="relative">
                        <img
                          src={url}
                          alt={`New image preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs truncate w-full">
                        {formData.newImageFiles[index]?.name}
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
              onClick={handleSave}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Memory
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default EditMemoriesDialog;
