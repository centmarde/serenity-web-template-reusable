import React, { useEffect, useMemo, useState } from "react";
import { nullaModesImages } from "../helpers/nullaModesimages";
import { useNullasStore } from "../../../stores/nullasData";
import {
  formatDate,
  getHungryStatus,
  getSinceLastEaten,
  getSinceLastPlaying,
  getStressStatus,
  toDateSafe,
} from "../helpers/nullaCounter";

interface NullaWidgetProps {
  themeColor: string;
}

const NullaWidget: React.FC<NullaWidgetProps> = ({ themeColor }) => {
  const { fetchNullas, updateNulla } = useNullasStore();
  const getLatestNulla = useNullasStore((state) => state.getLatestNulla);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const modeMap = useMemo(() => {
    return new Map(nullaModesImages.map((mode) => [mode.key, mode]));
  }, []);

  const formatLabel = (key: string) =>
    key
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const activeMode = useMemo(() => {
    const nextMode = latestNulla?.mode
      ? modeMap.get(latestNulla.mode)
      : undefined;
    return nextMode ?? nullaModesImages[0];
  }, [latestNulla, modeMap]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const loadLatest = async () => {
      await fetchNullas();
      const latest = getLatestNulla();

      if (!latest) return;

      const now = Date.now();
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      const eatenDurationMs = (latest.eaten_duration ?? 0) * 60 * 60 * 1000;
      const playingDurationMs = (latest.playing_duration ?? 0) * 60 * 60 * 1000;

      const lastEaten = toDateSafe(latest.last_eaten);
      const lastPlaying = toDateSafe(latest.last_playing);

      const hungryAt = lastEaten
        ? lastEaten.getTime() + twoDaysMs + eatenDurationMs
        : null;
      const stressAt = lastPlaying
        ? lastPlaying.getTime() + twoDaysMs + playingDurationMs
        : null;
      const starvingAt = lastEaten
        ? lastEaten.getTime() + threeDaysMs + eatenDurationMs
        : null;
      const sickAt = lastPlaying
        ? lastPlaying.getTime() + threeDaysMs + playingDurationMs
        : null;

      const isStarving = starvingAt ? now >= starvingAt : false;
      const isSick = sickAt ? now >= sickAt : false;

      if (isStarving && isSick && latest.mode !== "dying") {
        await updateNulla(latest.id, { mode: "dying" });
        return;
      }

      if (isStarving && latest.mode !== "starving") {
        await updateNulla(latest.id, { mode: "starving" });
        return;
      }

      if (isSick && latest.mode !== "sick") {
        await updateNulla(latest.id, { mode: "sick" });
        return;
      }

      if (hungryAt && now >= hungryAt && latest.mode !== "hungry") {
        await updateNulla(latest.id, { mode: "hungry" });
      } else if (stressAt && now >= stressAt && latest.mode !== "stress") {
        await updateNulla(latest.id, { mode: "stress" });
      }
    };

    void loadLatest();
  }, [fetchNullas, getLatestNulla, updateNulla]);

  const hungryStatus = useMemo(
    () => getHungryStatus(latestNulla, nowMs),
    [latestNulla, nowMs],
  );

  const stressStatus = useMemo(
    () => getStressStatus(latestNulla, nowMs),
    [latestNulla, nowMs],
  );

  const sinceLastEaten = useMemo(
    () => getSinceLastEaten(latestNulla, nowMs),
    [latestNulla, nowMs],
  );

  const sinceLastPlaying = useMemo(
    () => getSinceLastPlaying(latestNulla, nowMs),
    [latestNulla, nowMs],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {activeMode ? (
          <img
            src={activeMode.imageSrc}
            alt={`Nulla ${formatLabel(activeMode.key)}`}
            style={{
              width: "min(260px, 70vw)",
              height: "auto",
            }}
          />
        ) : (
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: themeColor }}
          ></div>
        )}
      </div>

      <div
        className="w-full text-left space-y-2"
        style={{
          border: `1px solid ${themeColor}20`,
          borderRadius: "14px",
          padding: "min(14px, 4vw)",
          backgroundColor: `${themeColor}08`,
        }}
      >
        <div className="text-sm text-gray-700">
          <strong>Mode:</strong> {latestNulla?.mode ?? "Unknown"}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Last eaten:</strong> {formatDate(latestNulla?.last_eaten)}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Since eaten:</strong> {sinceLastEaten}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Hungry status:</strong> {hungryStatus}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Last played:</strong> {formatDate(latestNulla?.last_playing)}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Since played:</strong> {sinceLastPlaying}
        </div>
        <div className="text-sm text-gray-700">
          <strong>Stress status:</strong> {stressStatus}
        </div>
      </div>
    </div>
  );
};

export default NullaWidget;
