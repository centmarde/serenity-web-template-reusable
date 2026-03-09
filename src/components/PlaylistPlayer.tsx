import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Music2, Shuffle } from "lucide-react";
import { useSongsSelectors, useSongsActions } from "../stores/songsData";
import { useThemeStore } from "../stores/theme";

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const FALLBACK_THEME_COLOR = "#F2A6A6";

const PlaylistPlayer: React.FC = () => {
  const { currentThemeColor } = useThemeStore();
  const themeColor = currentThemeColor ?? FALLBACK_THEME_COLOR;

  const { isLoading, getSongsWithFullUrls } = useSongsSelectors();
  const { fetchSongs } = useSongsActions();

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0); // increment to re-trigger shuffle
  const manuallyExpandedRef = useRef(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasStartedRef = useRef(false);

  const allSongs = useMemo(() => getSongsWithFullUrls(), [getSongsWithFullUrls]);

  // Derive shuffled list; re-shuffles when allSongs are first loaded or shuffleSeed changes
  const shuffledSongs = useMemo(() => {
    if (allSongs.length === 0) return [];
    return shuffleArray(allSongs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSongs.length, shuffleSeed]);

  // Reset song index when shuffled list changes
  useEffect(() => {
    setCurrentSongIndex(0);
  }, [shuffledSongs]);

  const handleReshuffle = useCallback(() => {
    setShuffleSeed((s) => s + 1);
  }, []);

  const autoExpandBriefly = useCallback(() => {
    if (manuallyExpandedRef.current) return;
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    setIsExpanded(true);
    collapseTimerRef.current = setTimeout(() => {
      if (!manuallyExpandedRef.current) setIsExpanded(false);
    }, 3000);
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const currentSong = shuffledSongs[currentSongIndex];
  const currentAudioUrl = currentSong?.fullAudioUrl ?? null;

  const handleNext = useCallback(() => {
    if (shuffledSongs.length === 0) return;
    setCurrentSongIndex((prev) => (prev + 1) % shuffledSongs.length);
  }, [shuffledSongs.length]);

  const handlePrevious = useCallback(() => {
    if (shuffledSongs.length === 0) return;
    setCurrentSongIndex((prev) => (prev === 0 ? shuffledSongs.length - 1 : prev - 1));
  }, [shuffledSongs.length]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onPlay = () => { setIsPlaying(true); autoExpandBriefly(); };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => handleNext();

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [handleNext, autoExpandBriefly]);

  // Load new source and autoplay when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    audio.pause();
    audio.src = currentAudioUrl;
    audio.volume = 0.7;
    audio.load();
    audio.play().catch(() => {
      // Autoplay may be blocked on first load — user must click play
    });
  }, [currentAudioUrl]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (error) {
        console.error("Playback failed:", error);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (t: number) => {
    if (isNaN(t) || t === 0) return "0:00";
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // On first user interaction anywhere on the page, start playback
  useEffect(() => {
    const startOnInteraction = () => {
      if (hasStartedRef.current) return;
      const audio = audioRef.current;
      if (!audio || !audio.src) return;
      hasStartedRef.current = true;
      audio.play().catch(() => {});
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
    };

    document.addEventListener("click", startOnInteraction);
    document.addEventListener("touchstart", startOnInteraction);
    document.addEventListener("keydown", startOnInteraction);

    return () => {
      document.removeEventListener("click", startOnInteraction);
      document.removeEventListener("touchstart", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
    };
  }, []);

  if (isLoading || shuffledSongs.length === 0) return null;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      <div className="fixed bottom-5 left-5 z-50">

        {/* Collapsed: single music icon button */}
        {!isExpanded && (
          <button
            onClick={() => { manuallyExpandedRef.current = true; setIsExpanded(true); }}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: themeColor }}
            title="Open player"
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-0.5 rounded-full bg-white animate-bounce" style={{ height: '40%', animationDelay: '0ms', animationDuration: '600ms' }} />
                <span className="w-0.5 rounded-full bg-white animate-bounce" style={{ height: '100%', animationDelay: '150ms', animationDuration: '600ms' }} />
                <span className="w-0.5 rounded-full bg-white animate-bounce" style={{ height: '60%', animationDelay: '300ms', animationDuration: '600ms' }} />
                <span className="w-0.5 rounded-full bg-white animate-bounce" style={{ height: '80%', animationDelay: '450ms', animationDuration: '600ms' }} />
              </div>
            ) : (
              <Music2 size={18} color="white" />
            )}
          </button>
        )}

        {/* Expanded: full pill player */}
        {isExpanded && (
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-full shadow-lg backdrop-blur-md"
            style={{
              backgroundColor: "rgba(255,255,255,0.92)",
              border: `1.5px solid ${themeColor}40`,
              minWidth: "280px",
              maxWidth: "380px",
            }}
          >
            {/* Music icon — click to collapse */}
            <button
              onClick={() => { manuallyExpandedRef.current = false; setIsExpanded(false); if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current); }}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: `${themeColor}20` }}
              title="Collapse player"
            >
              <Music2 size={13} color={themeColor} />
            </button>

            {/* Song title + progress */}
            <div className="flex-1 min-w-0">
              <p
                className="truncate font-medium leading-tight"
                style={{ fontSize: "0.72rem", color: "#333" }}
              >
                {currentSong?.title || "Unknown"}
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-1.5 mt-1">
                <span style={{ fontSize: "0.6rem", color: "#999", flexShrink: 0 }}>
                  {formatTime(currentTime)}
                </span>
                <div
                  className="flex-1 h-1 rounded-full cursor-pointer bg-gray-200"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: themeColor,
                      transition: "width 0.3s linear",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.6rem", color: "#999", flexShrink: 0 }}>
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePrevious}
                disabled={shuffledSongs.length <= 1}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                <SkipBack size={12} color={themeColor} />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-105"
                style={{ backgroundColor: themeColor }}
              >
                {isPlaying ? (
                  <Pause size={13} color="white" />
                ) : (
                  <Play size={13} color="white" />
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={shuffledSongs.length <= 1}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                <SkipForward size={12} color={themeColor} />
              </button>

              <button
                onClick={handleReshuffle}
                title="Reshuffle playlist"
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all hover:scale-110 active:scale-90"
              >
                <Shuffle size={11} color={themeColor} />
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default PlaylistPlayer;
