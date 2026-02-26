import React from "react";
import { AsciiArt } from "@/components/ui/ascii-art";

interface AsciiWidgetProps {
  themeColor?: string;
  title?: string;
}

const AsciiWidget: React.FC<AsciiWidgetProps> = () => {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "200vh",
        aspectRatio: "2 / 3",
        background: "#0a0a0a",
      }}
    >
      <AsciiArt
        src="/assets/ascii/set1.jpg"
        resolution={220}
        charset="dense"
        colored={true}
        backgroundColor="#0a0a0a"
        animated={true}
        animationStyle="matrix"
        animateOnView={true}
        objectFit="contain"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default AsciiWidget;
