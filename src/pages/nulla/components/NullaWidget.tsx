import React, { useEffect, useMemo } from "react";
import { nullaModesImages } from "../helpers/nullaModesImages";
import { useNullasStore } from "../../../stores/nullasData";
import { getNextMode } from "../helpers/nullaCounter";

interface NullaWidgetProps {
  themeColor: string;
  overrideModeKey?: string | null;
}

const NullaWidget: React.FC<NullaWidgetProps> = ({
  themeColor,
  overrideModeKey,
}) => {
  const { fetchNullas, updateNulla } = useNullasStore();
  const getLatestNulla = useNullasStore((state) => state.getLatestNulla);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);

  const modeMap = useMemo(() => {
    return new Map(nullaModesImages.map((mode) => [mode.key, mode]));
  }, []);

  const formatLabel = (key: string) =>
    key
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const activeMode = useMemo(() => {
    if (overrideModeKey) {
      const overrideMode = modeMap.get(overrideModeKey);
      if (overrideMode) return overrideMode;
    }

    const nextMode = latestNulla?.mode
      ? modeMap.get(latestNulla.mode)
      : undefined;
    return nextMode ?? nullaModesImages[0];
  }, [latestNulla, modeMap, overrideModeKey]);

  const isBrowserReload = () => {
    const entries = performance.getEntriesByType("navigation");
    if (entries.length > 0) {
      return (entries[0] as PerformanceNavigationTiming).type === "reload";
    }

    return performance.navigation?.type === 1;
  };

  useEffect(() => {
    const loadLatest = async () => {
      if (!isBrowserReload()) return;

      await fetchNullas();
      const latest = getLatestNulla();

      if (!latest) return;
      const now = Date.now();
      const nextMode = getNextMode(latest, now);
      if (nextMode && nextMode !== latest.mode) {
        await updateNulla(latest.id, { mode: nextMode });
      }
    };

    void loadLatest();
  }, [fetchNullas, getLatestNulla, updateNulla]);

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
        className="w-full text-left"
        style={{
          border: `1px solid ${themeColor}20`,
          borderRadius: "14px",
          padding: "min(14px, 4vw)",
          backgroundColor: `${themeColor}08`,
        }}
      >
        <div className="text-center text-sm text-gray-700">
          <strong>Mode:</strong> {latestNulla?.mode ?? "Unknown"}
        </div>
      </div>
    </div>
  );
};

export default NullaWidget;
