
import { useState, useEffect } from 'react';
import LoadingView from './pages/LoadingView';
import DefaultLayout from './layout/Default';
import LandingView from './pages/landing/LandingView';
import AuthView from './pages/auth/AuthView';
import BoyFriendDashboardView from './pages/boyfriendDashboard/BoyFriendDashboardView';
import LyricsArtFullscreenView from './pages/madeForYou/LyricsArtFullscreenView';
import AsciiFullscreenView from './pages/madeForYou/AsciiFullscreenView';
import FlowerGardenView from './pages/madeForYou/FlowerGardenView';
import PlaylistPlayer from './components/PlaylistPlayer';
import { useSettingsStore } from './stores/settings';
import { useThemeStore } from './stores/theme';
import { useInitializeAuth } from './stores/authData';
import { getRouteByPath, isValidRoute } from './utils/routes';
import { useCurrentDialog, useDialogActions, initializeDialogFlow } from './composables/dialogControll';
import AuthDialog from './components/dialogs/AuthDialog';
import { Toaster } from './components/ui/sonner';
import './styles/romantic-fonts.css';

function App() {
  const [currentView, setCurrentView] = useState<'loading' | 'main'>('loading');
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Initialize with current browser location
    const path = window.location.pathname;
    return isValidRoute(path) ? path : '/';
  });
  
  // Dialog controller
  const currentDialog = useCurrentDialog();
  const { handleAuthSuccess: dialogHandleAuthSuccess } = useDialogActions();
  
  const { loadSettings } = useSettingsStore();
  const { initializeTheme } = useThemeStore();
  const initializeAuth = useInitializeAuth();

  // Initialize settings, theme, auth and dialog flow when app starts  
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadSettings();
        await initializeTheme();
        await initializeAuth(); // Initialize authentication state (has built-in safeguard)
        
        // Initialize dialog flow after everything is loaded
        initializeDialogFlow();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Continue anyway with fallback values
        initializeDialogFlow(); // Still initialize dialog flow
      }
    };
    
    initialize();
  }, [loadSettings, initializeTheme, initializeAuth]);

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
    // Dialog flow will be handled automatically by the dialog controller
  };

  const handleNavigate = (path: string) => {
    const route = getRouteByPath(path);
    if (route) {
      // Check if route requires authentication
      const isGirlfriendAuth = localStorage.getItem('girlfriend-authenticated') === 'true';
      if (route.requiresAuth && !isGirlfriendAuth) {
        // If not authenticated, dialog controller will handle showing auth dialog
        return;
      }
      
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
    
    // Render AuthView without layout for auth route
    if (currentPath === '/auth') {
      return <AuthView onNavigate={handleNavigate} />;
    }
    
    // Render BoyFriendDashboardView without layout for boyfriend dashboard route
    if (currentPath === '/boyfriend-dashboard') {
      return <BoyFriendDashboardView onNavigate={handleNavigate} />;
    }

    // Render fullscreen views without layout
    if (currentPath === '/girlfriend/madeforyou/lyrics-art') {
      return <LyricsArtFullscreenView onNavigate={handleNavigate} />;
    }

    if (currentPath === '/girlfriend/madeforyou/ascii-art') {
      return <AsciiFullscreenView onNavigate={handleNavigate} />;
    }

    if (currentPath === '/girlfriend/madeforyou/flower-garden') {
      return <FlowerGardenView onNavigate={handleNavigate} />;
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

      {/* Playlist Player - Mounted immediately on App load, plays across all views */}
      <PlaylistPlayer />

      {/* Global Authentication Dialog - Only show after loading is complete */}
      {currentView === 'main' && currentDialog === 'auth' && (
        <AuthDialog 
          open={true}
          onOpenChange={() => {}} // Dialog controller handles opening/closing
          onAuthSuccess={dialogHandleAuthSuccess}
          title="Welcome Back! 💕"
          description="Let's verify our special day to continue"
        />
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
    
  );
}

export default App;
