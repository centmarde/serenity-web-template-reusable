import React, { useState, useEffect } from 'react';
import { Timeline } from '@/components/ui/timeline';
import { Heart, Calendar, MapPin, Gift, Star, Camera, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteMemoriesDialog } from '../dialogs/DeleteMemoriesDialog';
import { EditMemoriesDialog } from '../dialogs/EditMemoriesDialog';
import { useThemeStore } from '../../../stores/theme';
import { useMemoriesStore, type Memory } from '../../../stores/memoriesData';
import { useMemoryMilestonesStore } from '../../../stores/memoriesMilestoneData';
import { useMemoryImagesStore } from '../../../stores/memoriesImagesData';


export const MemoriesWidget: React.FC = () => {
  const { getCurrentThemeColor } = useThemeStore();
  const memoriesStore = useMemoriesStore();
  const milestonesStore = useMemoryMilestonesStore();
  const imagesStore = useMemoryImagesStore();
  

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  
  // Get theme color with fallback
  let themeColor: string;
  try {
    themeColor = getCurrentThemeColor();
  } catch {
    themeColor = '#F2A6A6'; // Fallback color
  }

  // Initialize data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all data from stores
        await Promise.all([
          memoriesStore.fetchMemories(),
          milestonesStore.fetchMilestones(),
          imagesStore.fetchImages()
        ]);

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load memories';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeData();
  }, [memoriesStore, milestonesStore, imagesStore]);

  // Helper function to get milestone icon
  const getMilestoneIcon = (milestoneText: string | null): React.ReactNode => {
    if (!milestoneText) return <Heart className="w-6 h-6" style={{ color: themeColor }} />;
    
    const milestone = milestoneText.toLowerCase();
    if (milestone.includes('date')) return <Heart className="w-6 h-6" style={{ color: themeColor }} />;
    if (milestone.includes('anniversary')) return <Calendar className="w-6 h-6" style={{ color: themeColor }} />;
    if (milestone.includes('trip') || milestone.includes('getaway')) return <MapPin className="w-6 h-6" style={{ color: themeColor }} />;
    if (milestone.includes('birthday') || milestone.includes('surprise')) return <Gift className="w-6 h-6" style={{ color: themeColor }} />;
    if (milestone.includes('concert') || milestone.includes('night')) return <Star className="w-6 h-6" style={{ color: themeColor }} />;
    if (milestone.includes('holiday') || milestone.includes('photo')) return <Camera className="w-6 h-6" style={{ color: themeColor }} />;
    
    // Default icon
    return <Heart className="w-6 h-6" style={{ color: themeColor }} />;
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Dialog handlers
  const handleEditMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setShowEditDialog(true);
  };

  const handleDeleteMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setShowDeleteDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedMemory(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedMemory(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        ></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg">Failed to load memories</p>
          <p className="text-neutral-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (memoriesStore.memories.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 mx-auto text-neutral-400" />
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            No Memories Yet
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Start creating beautiful memories together!
          </p>
        </div>
      </div>
    );
  }

  // Convert Supabase data to timeline format
  const timelineData = memoriesStore.memories.map((memory) => {
    // Find related milestones using the new schema
    const milestones = milestonesStore.milestones.filter(m => 
      m.memories_id === memory.id
    );
    
    const primaryMilestone = milestones[0] || null;

    // Find related images using the new schema
    const images = imagesStore.images.filter(img => 
      img.memories_id === memory.id
    );

    return {
      title: formatDate(memory.date),
      content: (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-lg flex-shrink-0"
              style={{
                backgroundColor: `${themeColor}15`,
                border: `1px solid ${themeColor}30`,
              }}
            >
              {getMilestoneIcon(primaryMilestone?.milestone || null)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 leading-tight"
                    style={{
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.3'
                    }}
                  >
                    {memory.title || 'Untitled Memory'}
                  </h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditMemory(memory)}
                    className="h-8 w-8 p-0 hover:bg-neutral-100"
                    style={{ color: themeColor }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMemory(memory)}
                    className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {memory.description && (
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {memory.description}
                </p>
              )}
              
              {/* Display multiple milestones/details with bullets */}
              {milestones.length > 0 && (
                <div className="mb-4">
                  <ul className="space-y-1">
                    {milestones.map((milestone, index) => (
                      <li 
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div 
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: themeColor }}
                        />
                        <span 
                          className="font-medium"
                          style={{ color: themeColor }}
                        >
                          {milestone.milestone}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Display images with carousel and clickable full view */}
              {images.length > 0 && (
                <div className="mt-4 w-full">
                  {images.length === 1 ? (
                    // Single image - full width display with dialog
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={images[0].image_src || ''}
                          alt={memory.title || 'Memory'}
                          className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>{memory.title || 'Memory Image'}</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <img
                            src={images[0].image_src || ''}
                            alt={memory.title || 'Memory'}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    // Multiple images - carousel display with dialogs
                    <Carousel className="w-full">
                      <CarouselContent>
                        {images.map((img, index) => (
                          <CarouselItem key={index}>
                            <Dialog>
                              <DialogTrigger asChild>
                                <img
                                  src={img.image_src || ''}
                                  alt={`${memory.title || 'Memory'} ${index + 1}`}
                                  className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>{memory.title || 'Memory Image'} ({index + 1} of {images.length})</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center">
                                  <img
                                    src={img.image_src || ''}
                                    alt={`${memory.title || 'Memory'} ${index + 1}`}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious 
                        className="left-2" 
                        style={{ backgroundColor: `${themeColor}90`, borderColor: themeColor }}
                      />
                      <CarouselNext 
                        className="right-2" 
                        style={{ backgroundColor: `${themeColor}90`, borderColor: themeColor }}
                      />
                    </Carousel>
                  )}
                </div>
              )}
              
              {/* No fallback needed since we get all images from the same source */}
            </div>
          </div>
        </div>
      ),
    };
  });

  return (
    <>
      <Timeline data={timelineData} />
      
      {/* Edit Memory Dialog */}
      <EditMemoriesDialog
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
        memory={selectedMemory}
      />
      
      {/* Delete Memory Dialog */}
      <DeleteMemoriesDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        memory={selectedMemory}
      />
    </>
  );
};

export default MemoriesWidget;
