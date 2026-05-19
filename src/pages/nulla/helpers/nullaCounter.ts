import type { NullaRecord } from "../../../stores/nullasData";

export const toDateSafe = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value: string | null | undefined) => {
  const parsed = toDateSafe(value);
  return parsed
    ? parsed.toLocaleString("en-PH", { timeZone: "Asia/Manila" })
    : "Not yet";
};

export const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
};

export const getHungryStatus = (
  latestNulla: NullaRecord | null,
  nowMs: number,
) => {
  if (!latestNulla) return "Unknown";
  const lastEaten = toDateSafe(latestNulla.last_eaten);
  if (!lastEaten || !nowMs) return "Unknown";
  const oneDayMs = 24 * 60 * 60 * 1000;
  const fortyEightHoursMs = 2 * 24 * 60 * 60 * 1000;
  const eatenDurationMs = (latestNulla.eaten_duration ?? 0) * 60 * 60 * 1000;
  const elapsedMs = nowMs - lastEaten.getTime();
  const hungryAt = lastEaten.getTime() + oneDayMs + eatenDurationMs;
  const starvingAt = lastEaten.getTime() + fortyEightHoursMs + eatenDurationMs;
  if (elapsedMs >= fortyEightHoursMs + eatenDurationMs || nowMs >= starvingAt) {
    return "Starving";
  }
  const remaining = hungryAt - nowMs;
  return remaining <= 0 ? "Hungry" : `In ${formatDuration(remaining)}`;
};

export const getStressStatus = (
  latestNulla: NullaRecord | null,
  nowMs: number,
) => {
  if (!latestNulla) return "Unknown";
  const lastPlaying = toDateSafe(latestNulla.last_playing);
  if (!lastPlaying || !nowMs) return "Unknown";
  const oneDayMs = 24 * 60 * 60 * 1000;
  const fortyEightHoursMs = 2 * 24 * 60 * 60 * 1000;
  const playingDurationMs =
    (latestNulla.playing_duration ?? 0) * 60 * 60 * 1000;
  const stressAt = lastPlaying.getTime() + oneDayMs + playingDurationMs;
  const sickAt = lastPlaying.getTime() + fortyEightHoursMs + playingDurationMs;
  if (nowMs >= sickAt) return "Sick";
  const remaining = stressAt - nowMs;
  return remaining <= 0 ? "Stressed" : `In ${formatDuration(remaining)}`;
};

export const getNextMode = (latestNulla: NullaRecord | null, nowMs: number) => {
  if (!latestNulla) return null;
  const hungryStatus = getHungryStatus(latestNulla, nowMs);
  const stressStatus = getStressStatus(latestNulla, nowMs);

  if (hungryStatus === "Unknown" || stressStatus === "Unknown") return null;

  if (hungryStatus === "Starving" && stressStatus === "Sick") {
    return "dying";
  }

  if (hungryStatus === "Starving") return "starving";
  if (stressStatus === "Sick") return "sick";
  if (stressStatus === "Stressed") return "stress";
  if (hungryStatus === "Hungry") return "hungry";

  if (hungryStatus.startsWith("In ") && stressStatus.startsWith("In ")) {
    return "happy";
  }

  return null;
};

export const getSinceLastEaten = (
  latestNulla: NullaRecord | null,
  nowMs: number,
) => {
  if (!latestNulla?.last_eaten) return "Unknown";
  const lastEaten = toDateSafe(latestNulla.last_eaten);
  if (!lastEaten || !nowMs) return "Unknown";
  return formatDuration(nowMs - lastEaten.getTime());
};

export const getSinceLastPlaying = (
  latestNulla: NullaRecord | null,
  nowMs: number,
) => {
  if (!latestNulla?.last_playing) return "Unknown";
  const lastPlaying = toDateSafe(latestNulla.last_playing);
  if (!lastPlaying || !nowMs) return "Unknown";
  return formatDuration(nowMs - lastPlaying.getTime());
};
