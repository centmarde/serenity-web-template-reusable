import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useSettingsStore } from "../../../stores/settings";

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Access Restricted",
  description = "Enter password to add thoughts to the boyfriend side"
}) => {
  const { getBfThoughtsPassword, getThemeColor } = useSettingsStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const isMobile = useIsMobile();

  const themeColor = getThemeColor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    try {
      const correctPassword = getBfThoughtsPassword();
      
      // Add a small delay to prevent brute force attempts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (password === correctPassword) {
        setPassword("");
        setError("");
        onSuccess();
        onClose();
      } else {
        setError("Incorrect password. Try again.");
        setPassword("");
      }
    } catch (err) {
      setError("Failed to verify password. Please try again.");
      console.error("Password verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className={`${isMobile ? 'max-w-[90vw]' : 'max-w-md'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock 
              size={20} 
              style={{ color: themeColor }}
            />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p 
            className="text-sm text-gray-600"
            style={{ color: `${themeColor}80` }}
          >
            {description}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter password..."
                  className="pr-10"
                  style={{
                    borderColor: error ? "#ef4444" : `${themeColor}40`
                  }}
                  disabled={isVerifying}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isVerifying}
                >
                  {showPassword ? (
                    <EyeOff size={16} style={{ color: themeColor }} />
                  ) : (
                    <Eye size={16} style={{ color: themeColor }} />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                {error}
              </p>
            )}
            
            <div className={`flex gap-3 justify-end ${isMobile ? 'pt-1' : 'pt-2'}`}>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!password.trim() || isVerifying}
                style={{
                  backgroundColor: themeColor,
                  color: "white",
                  opacity: (!password.trim() || isVerifying) ? 0.6 : 1
                }}
              >
                {isVerifying ? "Verifying..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;