import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit2, Trash2, Wifi } from "lucide-react";
import { useSettingsStore } from "../../../stores/settings";
import { useThoughtsStore, useRealtimeStatus, type Thought } from "../../../stores/thoughtsData";
import AddThoughtsDialog from "../dialogs/AddThoughtsDialog";
import UpdateThoughtsDialog from "../dialogs/UpdateThoughtsDialog";
import DeleteThoughtsConfirmationDialog from "../dialogs/DeleteThoughtsConfirmationDialog";

interface EvilThoughtsWidgetProps {
  personType: 'girlfriend' | 'boyfriend';
  personName: string;
  avatarUrl?: string;
  isGf: boolean;
}

const EvilThoughtsWidget: React.FC<EvilThoughtsWidgetProps> = ({
  personType,
  personName,
  avatarUrl,
  isGf
}) => {
  const { getThemeColor } = useSettingsStore();
  const { initializeThoughts, getGfThoughts, getBfThoughts, unsubscribe, isInitialized, refreshThoughts } = useThoughtsStore();
  const { isRealtimeActive } = useRealtimeStatus();
  const themeColor = getThemeColor();

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  useEffect(() => {
    const initializeWithRealtime = async () => {
      try {
        if (!isInitialized) {
          console.log(`🔄 Initializing real-time subscription for ${personType}...`);
          await initializeThoughts();
          console.log(`✅ Real-time subscription active for ${personType}!`);
        }
      } catch (error) {
        console.error('Failed to initialize real-time thoughts:', error);
      }
    };

    initializeWithRealtime();

    // Cleanup subscription on unmount
    return () => {
      console.log(`🔌 Cleaning up real-time subscription for ${personType}`);
      unsubscribe();
    };
  }, [initializeThoughts, unsubscribe, isInitialized, personType]);

  // Get thoughts for this person type
  const personThoughts = isGf ? getGfThoughts() : getBfThoughts();
  const displayThoughts = personThoughts.slice(0, 4);

  const formatTimeAgo = (created_at: string) => {
    const date = new Date(created_at);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours === 1) return '1h ago';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return '1d ago';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1w ago';
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return '1mo ago';
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    
    return new Date(created_at).toLocaleDateString();
  };

  const handleEditThought = (thought: Thought) => {
    setSelectedThought(thought);
    setShowUpdateDialog(true);
  };

  const handleDeleteThought = (thought: Thought) => {
    setSelectedThought(thought);
    setShowDeleteDialog(true);
  };

  const renderEmptyThoughtButton = (index: number) => {
    const position = getThoughtPosition(index);
    return (
      <div
        key={`empty-${index}`}
        className="absolute z-20"
        style={{ ...position }}
      >
        <Button
          variant="ghost"
          onClick={() => setShowAddDialog(true)}
          className="h-auto p-4 text-center transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-dashed"
          style={{
            backgroundColor: `${themeColor}10`,
            backdropFilter: 'blur(8px)',
            maxWidth: position.maxWidth,
            borderRadius: '20px',
            borderColor: `${themeColor}40`,
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Plus 
            size={20} 
            style={{ color: themeColor }}
          />
          <span 
            className="text-xs font-medium"
            style={{ 
              color: themeColor,
              fontSize: 'clamp(0.6rem, 1.4vw, 0.7rem)'
            }}
          >
            Add Thought
          </span>
        </Button>
      </div>
    );
  };

  const renderThoughtBubble = (thought: Thought, index: number) => {
    const position = getThoughtPosition(index);
    return (
      <div
        key={thought.id}
        className="absolute z-20 group"
        style={{ ...position }}
      >
        <Button
          variant="ghost"
          className="h-auto p-3 text-left whitespace-normal transform hover:scale-105 transition-all duration-200 shadow-lg relative"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            maxWidth: position.maxWidth,
            borderRadius: '20px',
            border: `2px solid ${themeColor}30`,
            position: 'relative',
            minHeight: 'auto',
            height: 'auto',
            boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px ${themeColor}20`,
            cursor: 'default'
          }}
          onClick={(e) => e.preventDefault()}
        >
          {/* Action buttons - show on hover */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                handleEditThought(thought);
              }}
            >
              <Edit2 size={12} className="text-blue-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteThought(thought);
              }}
            >
              <Trash2 size={12} className="text-red-600" />
            </Button>
          </div>

          <div className="space-y-1 w-full pr-8">
            <p
              className="text-gray-700 leading-snug mb-2"
              style={{
                fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                lineHeight: '1.3',
                wordWrap: 'break-word',
                textAlign: 'left'
              }}
            >
              {thought.content}
            </p>
            <div className="flex items-center justify-end mt-2">
              <span
                className="text-gray-400"
                style={{
                  fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)'
                }}
              >
                {formatTimeAgo(thought.created_at)}
              </span>
            </div>
          </div>

          {/* Thought bubble tail */}
          <div
            className="absolute"
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              transform: 'rotate(45deg)',
              border: `1px solid ${themeColor}30`,
              ...(index === 0 ? { bottom: '-6px', left: '50%', marginLeft: '-6px' } :
                  index === 1 ? { top: '50%', left: '-6px', marginTop: '-6px' } :
                  index === 2 ? { top: '-6px', left: '50%', marginLeft: '-6px' } :
                  { top: '50%', right: '-6px', marginTop: '-6px' })
            }}
          />
        </Button>
      </div>
    );
  };

  // Position the thoughts around the circle (top, right, bottom, left)
  const getThoughtPosition = (index: number) => {
    const positions = [
      // Top
      { 
        top: '5%', 
        left: '50%', 
        transform: 'translateX(-50%)',
        maxWidth: 'min(180px, 32vw)'
      },
      // Right
      { 
        top: '50%', 
        right: '5%', 
        transform: 'translateY(-50%)',
        maxWidth: 'min(160px, 28vw)'
      },
      // Bottom
      { 
        bottom: '5%', 
        left: '50%', 
        transform: 'translateX(-50%)',
        maxWidth: 'min(180px, 32vw)'
      },
      // Left
      { 
        top: '50%', 
        left: '5%', 
        transform: 'translateY(-50%)',
        maxWidth: 'min(160px, 28vw)'
      }
    ];
    return positions[index % 4];
  };

  return (
    <Card 
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: `${themeColor}08`,
        borderColor: `${themeColor}30`,
        borderWidth: '2px',
        height: 'min(500px, 70vh)',
        minHeight: '400px'
      }}
    >
      <CardContent className="p-0 h-full relative">
        {/* Central Avatar */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div 
            className="relative p-1 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${themeColor}40, ${themeColor}60)`,
              boxShadow: `0 4px 20px ${themeColor}30`
            }}
          >
            <Avatar className="h-20 w-20 border-3 border-white">
              <AvatarImage 
                src={avatarUrl || (personType === 'girlfriend' ? '/assets/images/sample-gf-avatar.jpg' : '/assets/images/sample-bf-avatar.jpg')} 
                alt={personName}
                className="object-cover"
                onError={(e) => {
                  // Fallback to a solid color circle with emoji if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <AvatarFallback 
                className="text-white text-xl font-bold"
                style={{ 
                  backgroundColor: themeColor,
                  fontSize: 'clamp(1rem, 3vw, 1.25rem)'
                }}
              >
                {personType === 'girlfriend' ? '👩‍❤️‍💋‍👨' : '👨‍❤️‍💋‍👩'}
              </AvatarFallback>
            </Avatar>
            
            {/* Real-time indicator */}
            {isRealtimeActive && (
              <div 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                style={{
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                }}
                title="Real-time updates active"
              >
                <Wifi size={8} className="text-white" />
              </div>
            )}
          </div>
        </div>

       

        {/* Thoughts positioned around the circle */}
        {Array.from({ length: 4 }, (_, index) => {
          const thought = displayThoughts[index];
          return thought 
            ? renderThoughtBubble(thought, index)
            : renderEmptyThoughtButton(index);
        })}

        {/* Subtle connecting lines (optional decorative element) */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full opacity-20">
            <defs>
              <linearGradient id={`gradient-${personType}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: themeColor, stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: themeColor, stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            {Array.from({ length: 4 }, (_, index) => {
              const angle = (index * 90) - 45; // -45, 45, 135, 225 degrees
              const centerX = 50;
              const centerY = 50;
              const radius = 25;
              const endX = centerX + radius * Math.cos(angle * Math.PI / 180);
              const endY = centerY + radius * Math.sin(angle * Math.PI / 180);
              
              return (
                <line
                  key={index}
                  x1={`${centerX}%`}
                  y1={`${centerY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke={`url(#gradient-${personType})`}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              );
            })}
          </svg>
        </div>
      </CardContent>

      {/* CRUD Dialogs */}
      <AddThoughtsDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        isGf={isGf}
        personName={personName}
        onSuccess={() => {
          console.log('🔄 Refetching thoughts after add...');
          refreshThoughts();
        }}
      />

      <UpdateThoughtsDialog
        isOpen={showUpdateDialog}
        onClose={() => {
          setShowUpdateDialog(false);
          setSelectedThought(null);
        }}
        thought={selectedThought}
        personName={personName}
        onSuccess={() => {
          console.log('🔄 Refetching thoughts after update...');
          refreshThoughts();
        }}
      />

      <DeleteThoughtsConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedThought(null);
        }}
        thought={selectedThought}
        personName={personName}
        onSuccess={() => {
          console.log('🔄 Refetching thoughts after delete...');
          refreshThoughts();
        }}
      />
    </Card>
  );
};

export default EvilThoughtsWidget;