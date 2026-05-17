import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";
import { useThemeStore } from "../stores/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EvilThoughtsBadge from "./EvilThoughtsBadge";
import OpsDialog from "../pages/landing/dialogs/OpsDialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getNavRoutes } from "../utils/routes";
import { isFeatureActive } from "../utils/helpers";
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
  Zap,
  Menu,
  X
} from "lucide-react";

interface NavbarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath = "/", onNavigate }) => {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const appName = useSettingsStore((s) => s.settings?.appName) ?? "Love Space";

  const initializeTheme = useThemeStore((s) => s.initializeTheme);
  const themeColor = useThemeStore((s) => s.currentThemeColor) ?? "#F2A6A6";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [showOpsDialog, setShowOpsDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadSettings();
      } catch (error) {
        console.error("Failed to load settings:", error);
      }

      try {
        await initializeTheme();
      } catch (error) {
        console.error("Failed to initialize theme:", error);
      }
    };

    void initialize();
  }, [initializeTheme, loadSettings]);

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

  const handleNavClick = (path: string, name: string) => {
    if (name !== "Home" && !isFeatureActive(name)) {
      setSelectedFeature(name);
      setShowOpsDialog(true);
      setIsMobileNavOpen(false);
      return;
    }

    if (onNavigate) {
      onNavigate(path);
    }

    setIsMobileNavOpen(false);
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
        <Drawer open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen} direction="right">
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
                const isEvilThoughts = route.path === "/evil-thoughts";
                
                return (
                  <Button
                    key={route.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavClick(route.path, route.name)}
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
                      <span className="relative inline-flex">
                        <IconComponent size={14} />
                        {isEvilThoughts && (
                          <EvilThoughtsBadge className="absolute -top-2 -right-2" />
                        )}
                      </span>
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

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden flex-1 items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="flex items-center justify-center p-1.5 rounded-md h-8 w-8"
                style={{
                  color: themeColor,
                  border: `1px solid ${themeColor}20`,
                }}
                aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
                title={isMobileNavOpen ? "Close" : "Menu"}
              >
                {isMobileNavOpen ? <X size={16} /> : <Menu size={16} />}
              </Button>
            </div>
          </div>

          <DrawerContent className="lg:hidden">
            <DrawerHeader className="flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/assets/navbar.gif"
                  alt="Logo"
                  className="w-8 h-8 rounded-full border"
                  style={{ borderColor: `${themeColor}40` }}
                />
                <DrawerTitle
                  className="truncate"
                  style={{ color: themeColor }}
                >
                  {appName || "Menu"}
                </DrawerTitle>
              </div>

              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="h-8 w-8 p-1.5"
                  style={{ color: themeColor }}
                  aria-label="Close navigation"
                  title="Close"
                >
                  <X size={16} />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            {/* Mobile Navigation - Drawer List */}
            <div className="px-4 pb-4 flex flex-col gap-2 pt-20">
              {navRoutes.map((route) => {
                const IconComponent = getIconComponent(route.icon || 'Heart');
                const isActive = currentPath === route.path;
                const label = route.path === "/" ? "Home" : route.name.replace("Our ", "").replace("with Me", "");
                const isEvilThoughts = route.path === "/evil-thoughts";

                return (
                  <Button
                    key={route.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavClick(route.path, route.name)}
                    className={`w-full flex items-center justify-start gap-3 px-3 py-2 rounded-md transition-all duration-200 h-11 ${
                      isActive
                        ? "shadow-sm"
                        : "hover:scale-[1.02]"
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
                    <span className="relative inline-flex">
                      <IconComponent size={18} />
                      {isEvilThoughts && (
                        <EvilThoughtsBadge className="absolute -top-2 -right-2" />
                      )}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)" }}
                    >
                      {label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
      </nav>

      <OpsDialog
        open={showOpsDialog}
        onOpenChange={setShowOpsDialog}
        featureName={selectedFeature}
      />
    </Card>
  );
};

export default Navbar;
