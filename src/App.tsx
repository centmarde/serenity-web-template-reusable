
import { useState, useEffect } from 'react';
import LoadingView from './pages/LoadingView';
import DefaultLayout from './layout/Default';
import LandingView from './pages/LandingView';
import { useSettingsStore } from './stores/settings';
import { useThemeStore } from './stores/theme';
import { getRouteByPath, isValidRoute } from './utils/routes';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'main'>('loading');
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Initialize with current browser location
    const path = window.location.pathname;
    return isValidRoute(path) ? path : '/';
  });
  
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

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(isValidRoute(path) ? path : '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoadingComplete = () => {
    setCurrentView('main');
  };

  const handleNavigate = (path: string) => {
    const route = getRouteByPath(path);
    if (route) {
      // Update browser URL without page refresh
      window.history.pushState({}, '', path);
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
