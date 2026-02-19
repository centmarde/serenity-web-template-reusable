
import { useState, useEffect } from 'react';
import LoadingView from './pages/LoadingView';
import DefaultLayout from './layout/Default';
import LandingView from './pages/LandingView';
import { useSettingsStore } from './stores/settings';
import { useThemeStore } from './stores/theme';
import { getRouteByPath } from './utils/routes';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'main'>('loading');
  const [currentPath, setCurrentPath] = useState<string>('/');
  
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
    setCurrentView('main');
  };

  const handleNavigate = (path: string) => {
    const route = getRouteByPath(path);
    if (route) {
      setCurrentPath(path);
    }
  };

  const renderMainContent = () => {
    // Render LandingView without layout for home route
    if (currentPath === '/') {
      return <LandingView onNavigate={handleNavigate} />;
    }
    
    // All other routes use DefaultLayout
    return (
      <DefaultLayout 
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {currentView === 'loading' && (
        <LoadingView onLoadingComplete={handleLoadingComplete} />
      )}
      
      {currentView === 'main' && renderMainContent()}
    </div>
  );
}

export default App;
