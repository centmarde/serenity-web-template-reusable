/**
 * Helper functions for tarot cards functionality
 */

const PH_TIME_ZONE = "Asia/Manila";

type TimeZoneParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const getTimeZoneParts = (date: Date, timeZone: string): TimeZoneParts => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.get("year")),
    month: Number(map.get("month")),
    day: Number(map.get("day")),
    hour: Number(map.get("hour")),
    minute: Number(map.get("minute")),
    second: Number(map.get("second")),
  };
};

export const getDateInTimeZone = (
  value: string | Date,
  timeZone: string,
): Date => {
  const source = value instanceof Date ? value : new Date(value);
  const parts = getTimeZoneParts(source, timeZone);
  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
  );
};

export const getTimeZoneDayMs = (
  value: string | Date,
  timeZone: string,
): number => {
  const source = value instanceof Date ? value : new Date(value);
  const parts = getTimeZoneParts(source, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day);
};

/**
 * Calculates the end date by adding 30 days to the created date
 * @param createdAt - The creation date (ISO string or Date object)
 * @returns ISO string of the end date (30 days after creation)
 */
export const calculateEndDate = (createdAt: string | Date): string => {
  // Normalize to Philippines time zone so expiration is based on local date rules.
  const createdDate = getDateInTimeZone(createdAt, PH_TIME_ZONE);

  // Add 30 days in the same time zone context.
  const endDate = new Date(createdDate);
  endDate.setUTCDate(endDate.getUTCDate() + 30);

  return endDate.toISOString();
};

/**
 * Checks if a tarot reading has expired based on its end_date
 * @param endDate - The end date (ISO string)
 * @returns boolean indicating if the reading has expired
 */
export const isReadingExpired = (endDate: string | null): boolean => {
  if (!endDate) return false;

  const now = getDateInTimeZone(new Date(), PH_TIME_ZONE);
  const expireDate = getDateInTimeZone(endDate, PH_TIME_ZONE);

  return now > expireDate;
};

/**
 * Gets the remaining days until a reading expires
 * @param endDate - The end date (ISO string)
 * @returns number of days remaining (0 if expired)
 */
export const getRemainingDays = (endDate: string | null): number => {
  if (!endDate) return 0;

  const now = getDateInTimeZone(new Date(), PH_TIME_ZONE);
  const expireDate = getDateInTimeZone(endDate, PH_TIME_ZONE);

  if (now > expireDate) return 0;

  const diffTime = expireDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Formats a date for display
 * @param date - The date (ISO string or Date object)
 * @returns formatted date string
 */
export const formatDisplayDate = (
  date: string | Date,
  timeZone: string = PH_TIME_ZONE,
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats time for display
 * @param date - The date (ISO string or Date object)
 * @returns formatted time string
 */
export const formatDisplayTime = (
  date: string | Date,
  timeZone: string = PH_TIME_ZONE,
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TAROT_TIME_ZONE = PH_TIME_ZONE;
