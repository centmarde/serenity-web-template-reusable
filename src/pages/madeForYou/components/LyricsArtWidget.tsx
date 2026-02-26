import React from "react";
import LyricsPoster from "@/components/ui/lyricsPoster";

const LyricsArtWidget: React.FC = () => {
  return (
    <div className="flex flex-col w-full ">
      {/* Section header */}
      <div className="flex items-center gap-2 px-6">
       
        
      </div>

      {/* The poster — full width, no side padding */}
      <LyricsPoster />
    </div>
  );
};

export default LyricsArtWidget;
