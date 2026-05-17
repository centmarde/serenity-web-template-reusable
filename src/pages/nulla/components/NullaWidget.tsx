import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  nullaModesImages,
  type NullaModeImage,
} from "../helpers/nullaModesimages";

interface NullaWidgetProps {
  themeColor: string;
}

const NullaWidget: React.FC<NullaWidgetProps> = ({ themeColor }) => {
  const [activeMode, setActiveMode] = useState<NullaModeImage>(
    nullaModesImages[0],
  );

  const formatLabel = (key: string) =>
    key
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <img
          src={activeMode.imageSrc}
          alt={`Nulla ${formatLabel(activeMode.key)}`}
          style={{
            width: "min(260px, 70vw)",
            height: "auto",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {nullaModesImages.map((mode) => {
          const isSelected = mode.key === activeMode.key;
          return (
            <Button
              key={mode.key}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMode(mode)}
              style={{
                backgroundColor: isSelected ? themeColor : "transparent",
                borderColor: themeColor,
                color: isSelected ? "white" : themeColor,
              }}
            >
              {formatLabel(mode.key)}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default NullaWidget;
