import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingOverlayProps {
  isOpen: boolean;
  themeColor?: string;
  title?: string;
  description?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  themeColor = "#F2A6A6",
  title = "Loading…",
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[11000] flex items-center justify-center bg-white/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Card className="w-[min(420px,90vw)]">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className="h-12 w-12 rounded-full border-4 border-gray-200 animate-spin"
              style={{ borderTopColor: themeColor }}
            />
            <div className="font-semibold" style={{ color: themeColor }}>
              {title}
            </div>
            {description ? (
              <div className="text-sm text-gray-600">{description}</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingOverlay;
