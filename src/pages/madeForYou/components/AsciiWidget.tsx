import React, { useState, useEffect } from "react";
import { AsciiArt } from "@/components/ui/ascii-art";

interface AsciiWidgetProps {
  themeColor?: string;
  title?: string;
}

const LARGE_SCREEN_BREAKPOINT = 1024;

const AsciiWidget: React.FC<AsciiWidgetProps> = () => {
  const [resolution, setResolution] = useState(
    window.innerWidth >= LARGE_SCREEN_BREAKPOINT ? 200 : 120
  );

  useEffect(() => {
    const handleResize = () => {
      setResolution(window.innerWidth >= LARGE_SCREEN_BREAKPOINT ? 200 : 120);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "clamp(400px, 100vw, 200vh)",
        background: "#0a0a0a",
      }}
    >
      <AsciiArt
        src="/assets/ascii/set1.jpg"
        resolution={resolution}
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
