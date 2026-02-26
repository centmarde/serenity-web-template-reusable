import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSettingsStore } from "@/stores/settings";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music2 } from "lucide-react";

interface SpotifyPlayerProps {
  themeColor: string;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ themeColor }) => {
  const { waitForSongTitle, waitForSongArtist, waitForSongUrl } = useSettingsStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [songInfo, setSongInfo] = useState({ title: "", artist: "", url: "" });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  // Load settings
  useEffect(() => {
    Promise.all([waitForSongTitle(), waitForSongArtist(), waitForSongUrl()])
      .then(([title, artist, url]) => {
        setSongInfo({ title, artist, url });
        setHasAudio(!!url);
      })
      .catch(() => {
        setSongInfo({ title: "Falling", artist: "Iration", url: "" });
        setHasAudio(false);
      });
  }, [waitForSongTitle, waitForSongArtist, waitForSongUrl]);

  // Auto-play when src is set
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !songInfo.url) return;
    audio.volume = volume;
    // Attempt autoplay
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songInfo.url]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying, hasAudio]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isDragging) return;
    setCurrentTime(audio.currentTime);
  }, [isDragging]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  }, [duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const handleSkipBack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }, []);

  const handleSkipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  }, [duration]);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="w-full"
      style={{
        background: "linear-gradient(135deg, #121212 0%, #1a1a2e 60%, #0d0d1a 100%)",
        borderRadius: "clamp(12px, 2.5vw, 20px)",
        padding: "clamp(14px, 3vw, 24px)",
        border: `1px solid ${themeColor}30`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${themeColor}15, inset 0 1px 0 ${themeColor}20`,
      }}
    >
      {/* Hidden audio element */}
      {hasAudio && (
        <audio
          ref={audioRef}
          src={songInfo.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          loop={false}
          preload="metadata"
        />
      )}

      {/* Song Info Row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Album art / placeholder */}
        <div
          className="shrink-0 flex items-center justify-center rounded-lg"
          style={{
            width: "clamp(44px, 10vw, 56px)",
            height: "clamp(44px, 10vw, 56px)",
            background: `linear-gradient(135deg, ${themeColor}40, ${themeColor}15)`,
            border: `1.5px solid ${themeColor}50`,
            boxShadow: isPlaying ? `0 0 14px ${themeColor}50` : "none",
            transition: "box-shadow 0.4s ease",
          }}
        >
          <Music2
            size={20}
            color={themeColor}
            className={isPlaying ? "animate-pulse" : ""}
          />
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold truncate"
            style={{
              color: "#ffffff",
              fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
              lineHeight: 1.3,
            }}
          >
            {songInfo.title || "—"}
          </p>
          <p
            className="truncate"
            style={{
              color: "#b3b3b3",
              fontSize: "clamp(0.7rem, 2vw, 0.85rem)",
              lineHeight: 1.3,
            }}
          >
            {songInfo.artist || "—"}
          </p>
        </div>

        {/* Heart badge */}
        <span
          className="shrink-0 text-sm"
          style={{ color: themeColor, fontSize: "clamp(0.85rem, 2vw, 1rem)" }}
        >
          ♥
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div
          ref={progressRef}
          className="relative w-full cursor-pointer group"
          style={{ height: "4px", borderRadius: "2px", background: "#535353" }}
          onClick={handleProgressClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
          {/* Filled track */}
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-100"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${themeColor}, ${themeColor}cc)`,
            }}
          />
          {/* Thumb dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `calc(${progressPercent}% - 6px)`,
              background: "#ffffff",
              boxShadow: `0 0 4px ${themeColor}`,
            }}
          />
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-1">
          <span style={{ color: "#b3b3b3", fontSize: "clamp(0.6rem, 1.5vw, 0.72rem)" }}>
            {formatTime(currentTime)}
          </span>
          <span style={{ color: "#b3b3b3", fontSize: "clamp(0.6rem, 1.5vw, 0.72rem)" }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Skip Back */}
        <button
          onClick={handleSkipBack}
          disabled={!hasAudio}
          className="flex items-center justify-center rounded-full transition-all"
          style={{
            width: "clamp(32px, 7vw, 40px)",
            height: "clamp(32px, 7vw, 40px)",
            background: "transparent",
            color: hasAudio ? "#b3b3b3" : "#535353",
            cursor: hasAudio ? "pointer" : "not-allowed",
          }}
          title="-10s"
        >
          <SkipBack size={16} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={handlePlayPause}
          disabled={!hasAudio}
          className="flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: "clamp(42px, 9vw, 52px)",
            height: "clamp(42px, 9vw, 52px)",
            background: hasAudio ? themeColor : "#535353",
            boxShadow: hasAudio ? `0 0 16px ${themeColor}60` : "none",
            cursor: hasAudio ? "pointer" : "not-allowed",
            border: "none",
            transition: "transform 0.15s ease, box-shadow 0.3s ease",
          }}
        >
          {isPlaying ? (
            <Pause size={20} color="#000" />
          ) : (
            <Play size={20} color="#000" style={{ marginLeft: "2px" }} />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={handleSkipForward}
          disabled={!hasAudio}
          className="flex items-center justify-center rounded-full transition-all"
          style={{
            width: "clamp(32px, 7vw, 40px)",
            height: "clamp(32px, 7vw, 40px)",
            background: "transparent",
            color: hasAudio ? "#b3b3b3" : "#535353",
            cursor: hasAudio ? "pointer" : "not-allowed",
          }}
          title="+10s"
        >
          <SkipForward size={16} />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 max-w-35 ml-auto">
          <button
            onClick={() => setIsMuted((m) => !m)}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} color="#b3b3b3" />
            ) : (
              <Volume2 size={16} color="#b3b3b3" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1"
            style={{
              accentColor: themeColor,
              height: "4px",
              cursor: "pointer",
              outline: "none",
            }}
          />
        </div>
      </div>

      
    </div>
  );
};

export default SpotifyPlayer;
