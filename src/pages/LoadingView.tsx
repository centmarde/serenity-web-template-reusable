import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../stores/settings';

interface LoadingViewProps {
  onLoadingComplete: () => void;
}

const LoadingView: React.FC<LoadingViewProps> = ({ onLoadingComplete }) => {
  const { getRandomTrait, getThemeColor, getStartingGreetings, loadSettings } = useSettingsStore();
  const [currentTrait, setCurrentTrait] = useState<string>('');
  const [themeColor, setThemeColor] = useState<string>('#F2A6A6');
  const [startingGreeting, setStartingGreeting] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        await loadSettings();
        setThemeColor(getThemeColor());
        setStartingGreeting(getStartingGreetings());
        setCurrentTrait(getRandomTrait());
        setIsSettingsLoaded(true);
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback values
        setThemeColor('#F2A6A6');
        setStartingGreeting('love');
        setCurrentTrait('you are amazing');
        setIsSettingsLoaded(true);
      }
    };

    initializeSettings();
  }, [loadSettings, getThemeColor, getStartingGreetings, getRandomTrait]);

  useEffect(() => {
    if (!isSettingsLoaded) return;

    const duration = 5000; // 5 seconds
    const interval = 100; // Update every 100ms
    const totalSteps = duration / interval;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const newProgress = (step / totalSteps) * 100;
      setProgress(newProgress);

      // Change trait every 1.5 seconds (15 steps)
      if (step % 15 === 0) {
        try {
          setCurrentTrait(getRandomTrait());
        } catch (error) {
          console.error('Failed to get random trait:', error);
        }
      }

      if (step >= totalSteps) {
        clearInterval(timer);
        onLoadingComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isSettingsLoaded, getRandomTrait, onLoadingComplete]);

  if (!isSettingsLoaded) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{
              fontSize: '1.5rem',
              color: '#666',
              marginBottom: '20px'
            }}
          >
            Loading your love space...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}40, #ffffff)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Loading Animation */}
      <img 
        src="/assets/loading-gif.gif"
        alt="Loading..."
        style={{
          width: 'min(190px, 40vw)',
          height: 'min(190px, 40vw)',
          maxWidth: '150px',
          maxHeight: '150px',
          marginBottom: 'min(40px, 8vw)',
        }}
      />

      {/* Trait Display */}
      <div 
        style={{
          width: '100%',
          maxWidth: 'min(500px, 90vw)',
          textAlign: 'center',
          padding: 'min(30px, 5vw)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 'min(20px, 4vw)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: `3px solid ${themeColor}`,
          margin: '0 auto min(40px, 8vw) auto'
        }}
      >
        <h2 
          style={{
            color: themeColor,
            fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
            marginBottom: 'min(20px, 4vw)',
            fontWeight: 'bold',
            lineHeight: '1.3'
          }}
        >
          💕 Are you lost, {startingGreeting} ?
        </h2>
        
        <p 
          style={{
            fontSize: 'clamp(1rem, 3.5vw, 1.3rem)',
            color: '#555',
            lineHeight: '1.6',
            fontStyle: 'italic',
            minHeight: 'clamp(40px, 10vw, 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 min(10px, 2vw)',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}
        >
          "{currentTrait}"
        </p>
      </div>

      {/* Progress Bar */}
      <div 
        style={{
          width: 'min(300px, 80vw)',
          height: 'min(8px, 2vw)',
          minHeight: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: 'min(20px, 4vw)'
        }}
      >
        <div 
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: themeColor,
            borderRadius: '4px',
            transition: 'width 0.1s ease-out'
          }}
        />
      </div>

      {/* Loading Text */}
      <p 
        style={{
          color: '#666',
          fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
          margin: 0,
          textAlign: 'center',
          padding: '0 min(20px, 4vw)'
        }}
      >
        Preparing your love space... {Math.round(progress)}%
      </p>
    </div>
  );
};

export default LoadingView;
