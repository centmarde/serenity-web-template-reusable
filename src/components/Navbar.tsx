import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";
import { useThemeStore } from "../stores/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getNavRoutes } from "../utils/routes";
import { 
  Mail, 
  Camera, 
  Music, 
  Gift, 
  Gamepad2, 
  Target,
  Heart,
 /*  Sun,
  Moon, */
  Zap
} from "lucide-react";

interface NavbarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath = "/", onNavigate }) => {
  const { getAppName, loadSettings } = useSettingsStore();
  const { getCurrentThemeColor, initializeTheme, waitForInitialization,/*  toggleDarkMode, isDark */ } = useThemeStore();
  
  const [appName, setAppName] = useState<string>("");
  const [themeColor, setThemeColor] = useState<string>("#F2A6A6");

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();
        
        setAppName(getAppName());
        setThemeColor(getCurrentThemeColor());
      } catch (error) {
        console.error('Failed to initialize navbar:', error);
        setAppName("Love Space");
        setThemeColor(getCurrentThemeColor() || "#F2A6A6");
      }
    };
    initialize();
  }, [getAppName, getCurrentThemeColor, initializeTheme, loadSettings, waitForInitialization]);

  const navRoutes = getNavRoutes();

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return Heart;
      case 'Mail': return Mail;
      case 'Camera': return Camera;
      case 'Music': return Music;
      case 'Gift': return Gift;
      case 'Gamepad2': return Gamepad2;
      case 'Target': return Target;
      case 'Zap': return Zap;
      default: return Heart;
    }
  };

  const handleNavClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <Card 
      className="w-full shadow-sm sticky top-0 z-[9999] border-0 rounded-none"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${themeColor}20`,
      }}
    >
      <nav className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <img
              src="/assets/navbar.gif"
              alt="Logo"
              className="w-8 h-8 rounded-full border"
              style={{ borderColor: `${themeColor}40` }}
            />
            <h1 
              className="text-base font-medium hidden sm:block"
              style={{ 
                color: themeColor,
                fontSize: "clamp(0.9rem, 2vw, 1rem)"
              }}
            >
              {appName}
            </h1>
            
            {/* Theme Toggle Button */}
      {/*       <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="ml-2 p-1.5 rounded-full hover:scale-105 transition-all duration-200"
              style={{
                color: themeColor,
                border: `1px solid ${themeColor}20`,
                backgroundColor: "transparent"
              }}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </Button> */}
          </div>

          {/* Navigation Tabs - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navRoutes.map((route) => {
              const IconComponent = getIconComponent(route.icon || 'Heart');
              const isActive = currentPath === route.path;
              
              return (
                <Button
                  key={route.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(route.path)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 h-8 ${
                    isActive 
                      ? "shadow-sm" 
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isActive 
                      ? themeColor 
                      : "transparent",
                    color: isActive 
                      ? "white" 
                      : themeColor,
                    border: isActive 
                      ? `1px solid ${themeColor}` 
                      : `1px solid ${themeColor}20`,
                  }}
                >
                  <IconComponent size={14} />
                  <span 
                    className="text-xs font-medium"
                    style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)" }}
                  >
                    {route.path === "/" ? "Home" : route.name.replace("Our ", "").replace("with Me", "")}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation - Compact Icons */}
          <div className="flex lg:hidden flex-1 items-center justify-end gap-1 flex-wrap max-w-full">
            {navRoutes.map((route) => {
              const IconComponent = getIconComponent(route.icon || 'Heart');
              const isActive = currentPath === route.path;
              
              return (
                <Button
                  key={route.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(route.path)}
                  className={`flex items-center justify-center p-1 rounded-md transition-all duration-200 min-w-8 h-8 ${
                    isActive 
                      ? "shadow-sm" 
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isActive 
                      ? themeColor 
                      : "transparent",
                    color: isActive 
                      ? "white" 
                      : themeColor,
                    border: isActive 
                      ? `1px solid ${themeColor}` 
                      : `1px solid ${themeColor}20`,
                  }}
                  title={route.name}
                >
                  <IconComponent size={12} />
                </Button>
              );
            })}
          </div>
        </div>
      </nav>
    </Card>
  );
};

export default Navbar;
