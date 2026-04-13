import React, { useState, useEffect, useCallback } from 'react';
import { useMemoryImagesStore} from '../stores/memoriesImagesData';
import { useSettingsStore } from '../stores/settings';

interface GlassPanel {
  id: string;
  imageSrc: string | null;
  position: { top: string; left: string };
  size: { width: string; height: string };
  rotation: string;
  animationDelay: string;
  shimmerDuration: string;
  opacity: number;
}

interface Particle {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  animationDuration: string;
  animationDelay: string;
}

interface MemoryGlassOverlayProps {
  className?: string;
}

const MemoryGlassOverlay: React.FC<MemoryGlassOverlayProps> = ({ className = "" }) => {
  const { fetchImages, images } = useMemoryImagesStore();
  const { getThemeColor } = useSettingsStore();
  
  const [glassPanels, setGlassPanels] = useState<GlassPanel[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize glass panels with random positions and properties
  const initializeGlassPanels = useCallback(() => {
    const panelCount = 8; // Number of glass panels
    const panels: GlassPanel[] = [];

    for (let i = 0; i < panelCount; i++) {
      panels.push({
        id: `panel-${i}`,
        imageSrc: null,
        position: {
          top: `${Math.random() * 80 + 10}%`, // 10% to 90%
          left: `${Math.random() * 80 + 10}%`, // 10% to 90%
        },
        size: {
          width: `clamp(120px, ${Math.random() * 15 + 10}vw, 300px)`,
          height: `clamp(120px, ${Math.random() * 15 + 10}vw, 300px)`,
        },
        rotation: `${Math.random() * 360}deg`,
        animationDelay: `${Math.random() * 5}s`,
        shimmerDuration: `${Math.random() * 8 + 4}s`,
        opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
      });
    }

    setGlassPanels(panels);
  }, []);

  // Initialize floating particles with random positions and properties
  const initializeParticles = useCallback(() => {
    const particleCount = 20;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 4 + 2}px`,
        height: `${Math.random() * 4 + 2}px`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
      });
    }

    setParticles(newParticles);
  }, []);

  // Load images on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchImages(); // Fetch ALL images from database
        initializeGlassPanels();
        initializeParticles();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MemoryGlassOverlay:', error);
        initializeGlassPanels(); // Still create panels even without images
        initializeParticles(); // Still create particles even without images
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initialize();
    }
  }, [fetchImages, isInitialized, initializeGlassPanels, initializeParticles]);

  // Randomly update panel images with intervals
  useEffect(() => {
    if (!isInitialized || images.length === 0 || glassPanels.length === 0) {
      return;
    }

    const updateRandomPanel = () => {
      const randomPanelIndex = Math.floor(Math.random() * glassPanels.length);
      const randomImageIndex = Math.floor(Math.random() * images.length);
      const selectedImage = images[randomImageIndex];

      if (selectedImage && selectedImage.image_src) {
        setGlassPanels(prevPanels => 
          prevPanels.map((panel, index) => 
            index === randomPanelIndex 
              ? { 
                  ...panel, 
                  imageSrc: selectedImage.image_src,
                  opacity: Math.random() * 0.4 + 0.2 // 0.2 to 0.6 when image is present
                }
              : panel
          )
        );
      }
    };

    // Update random panels with different intervals
    const intervals = [
      setInterval(updateRandomPanel, 3000), // Every 3 seconds
      setInterval(updateRandomPanel, 5000), // Every 5 seconds
      setInterval(updateRandomPanel, 7000), // Every 7 seconds
    ];

    // Initial random updates
    setTimeout(updateRandomPanel, 1000);
    setTimeout(updateRandomPanel, 2000);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isInitialized, images, glassPanels.length]);

  // Periodically shuffle panel positions for dynamic effect
  useEffect(() => {
    if (!isInitialized) return;

    const shufflePositions = () => {
      setGlassPanels(prevPanels => 
        prevPanels.map(panel => ({
          ...panel,
          position: {
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
          },
          rotation: `${Math.random() * 360}deg`,
        }))
      );
    };

    const shuffleInterval = setInterval(shufflePositions, 15000); // Every 15 seconds

    return () => clearInterval(shuffleInterval);
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  const themeColor = getThemeColor();

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{
        background: `linear-gradient(135deg, 
          ${themeColor}05 0%, 
          transparent 25%, 
          ${themeColor}03 50%, 
          transparent 75%, 
          ${themeColor}05 100%)`,
      }}
    >
      {/* Ambient floating particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-pulse"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.width,
              height: particle.height,
              backgroundColor: `${themeColor}30`,
              animationDuration: particle.animationDuration,
              animationDelay: particle.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Glass memory panels */}
      {glassPanels.map((panel) => (
        <div
          key={panel.id}
          className="absolute transition-all duration-[3000ms] ease-in-out"
          style={{
            top: panel.position.top,
            left: panel.position.left,
            width: panel.size.width,
            height: panel.size.height,
            transform: `translate(-50%, -50%) rotate(${panel.rotation}) scale(${panel.imageSrc ? 1 : 0.8})`,
            animationDelay: panel.animationDelay,
          }}
        >
          {/* Glass effect container */}
          <div
            className="w-full h-full rounded-3xl relative overflow-hidden"
            style={{
              background: panel.imageSrc 
                ? `linear-gradient(135deg, ${themeColor}15, transparent 40%, ${themeColor}25)` 
                : `linear-gradient(135deg, ${themeColor}10, ${themeColor}20)`,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: `1px solid ${themeColor}30`,
              boxShadow: `
                0 8px 32px ${themeColor}20,
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `,
              opacity: panel.opacity,
            }}
          >
            {/* Memory image */}
            {panel.imageSrc && (
              <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                style={{
                  backgroundImage: `url(${panel.imageSrc})`,
                  opacity: 0.6,
                  filter: 'blur(1px) brightness(1.1) contrast(0.9)',
                  mixBlendMode: 'soft-light',
                }}
              />
            )}

            {/* Gradient overlay for depth */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 0%, 
                  ${themeColor}10 20%, 
                  transparent 40%, 
                  ${themeColor}15 60%, 
                  transparent 80%, 
                  ${themeColor}05 100%)`,
              }}
            />

            {/* Glass reflection effect */}
            <div
              className="absolute top-0 left-0 w-full h-1/2 rounded-t-3xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
              }}
            />

            {/* Shimmer effect */}
            <div
              className="absolute inset-0 rounded-3xl opacity-0 animate-pulse"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 30%, 
                  rgba(255,255,255,0.1) 50%, 
                  transparent 70%)`,
                animationDuration: panel.shimmerDuration,
                animationDelay: panel.animationDelay,
              }}
            />
          </div>
        </div>
      ))}

      {/* Additional depth layers */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 25% 25%, ${themeColor}15 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, ${themeColor}10 0%, transparent 50%)`,
        }}
      />
    </div>
  );
};

export default MemoryGlassOverlay;