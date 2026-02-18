
import { useState, useEffect } from 'react';
import Landing from './pages/LandingView';
import LoadingView from './pages/LoadingView';
import { useSettingsStore } from './stores/settings';
import { useThemeStore } from './stores/theme';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'landing'>('loading');
  
  const { loadSettings } = useSettingsStore();
  const { initializeTheme } = useThemeStore();

  // Initialize settings and theme when app starts
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadSettings();
        await initializeTheme();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Continue anyway with fallback values
      }
    };
    
    initialize();
  }, [loadSettings, initializeTheme]);

  const handleLoadingComplete = () => {
    setCurrentView('landing');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {currentView === 'loading' && (
        <LoadingView onLoadingComplete={handleLoadingComplete} />
      )}
      
      {currentView === 'landing' && <Landing />}
    </div>
  );
}

export default App;
