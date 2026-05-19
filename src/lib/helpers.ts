/**
 * Common utility functions for the application
 * Moved from AI files to reduce code duplication and improve maintainability
 */

// ============================================================================
// Common Utility Functions
// ============================================================================

/**
 * Creates a personalized greeting based on time of day
 * @param userName - The name of the user to greet
 * @returns A formatted greeting with appropriate emoji
 */
export function getTimeBasedGreeting(userName: string): string {
  const hour = new Date().getHours();
  let greeting = "";

  if (hour < 6) {
    greeting = `Good night, ${userName} 🌙`;
  } else if (hour < 12) {
    greeting = `Good morning, ${userName} ☀️`;
  } else if (hour < 17) {
    greeting = `Good afternoon, ${userName} 🌤️`;
  } else if (hour < 21) {
    greeting = `Good evening, ${userName} 🌆`;
  } else {
    greeting = `Good night, ${userName} 🌙`;
  }

  return greeting;
}

/**
 * Formats AI response text for HTML display
 * Converts newlines to HTML line breaks
 * @param response - The raw response text from AI
 * @returns HTML-formatted string
 */
export function formatResponse(response: string): string {
  return response.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>").trim();
}

// ============================================================================
// Date and Time Utilities
// ============================================================================

/**
 * Calculates the number of months between two dates
 * @param startDate - The start date (relationship start)
 * @param endDate - The end date (default: current date)
 * @returns Number of months between the dates
 */
export function calculateMonthsBetween(
  startDate: string | Date,
  endDate: Date = new Date(),
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();

  return yearsDiff * 12 + monthsDiff;
}

/**
 * Calculates the number of years between two dates
 * @param startDate - The start date (relationship start)
 * @param endDate - The end date (default: current date)
 * @returns Number of years between the dates
 */
export function calculateYearsBetween(
  startDate: string | Date,
  endDate: Date = new Date(),
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let years = end.getFullYear() - start.getFullYear();

  // Adjust if the anniversary hasn't occurred this year
  if (
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
  ) {
    years--;
  }

  return years;
}

/**
 * Formats a date string for display
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  locale: string = "en-US",
): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString; // Return original if formatting fails
  }
}

/**
 * Formats a date-time string as MM-DD-YYYY HH:MM (24-hour)
 * @param dateString - The date string to format
 * @returns Formatted date-time string or fallback
 */
export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "Not yet";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not yet";

  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "pm" : "am";

  return `${monthName} ${day}, ${year} ${hours12}:${minutes} ${meridiem}`;
}

// ============================================================================
// AI-Specific Utilities
// ============================================================================

/**
 * Generates fallback celebration messages when AI is unavailable
 * @param celebrationType - Type of celebration ('monthsary' | 'anniversary')
 * @param count - Number of months/years being celebrated
 * @param userName - Name of the user being celebrated
 * @returns Structured celebration message object
 */
export function getFallbackCelebrationMessage(
  celebrationType: "monthsary" | "anniversary",
  count: number,
  userName: string,
): {
  title: string;
  subtitle: string;
  personalMessage: string;
  tone: "romantic" | "playful" | "heartfelt" | "joyful";
} {
  if (celebrationType === "monthsary") {
    return {
      title: `Happy ${count} Month${count === 1 ? "" : "s"} Together! 🎉`,
      subtitle: `${count} month${count === 1 ? "" : "s"} of love, laughter, and beautiful memories`,
      personalMessage: `My dearest ${userName}, today marks ${count} wonderful month${count === 1 ? "" : "s"} since we officially became a couple. Every moment with you has been a treasure, and I can't wait for all the adventures still to come! Thank you for being the most amazing partner. Every day with you is a celebration! 💕`,
      tone: "romantic" as const,
    };
  } else {
    return {
      title: `Happy ${count} Year Anniversary! 🎊`,
      subtitle: `${count} amazing year${count === 1 ? "" : "s"} of love and togetherness`,
      personalMessage: `Today we celebrate ${count} incredible year${count === 1 ? "" : "s"} together! From our first day to this moment, every memory we've created has been precious. Here's to many more years of love, growth, and happiness together! Thank you for being my everything, ${userName}. 💖`,
      tone: "heartfelt" as const,
    };
  }
}

/**
 * Generates fallback comfort messages when AI is unavailable
 * @param userName - Name of the user needing comfort
 * @param partnerName - Name of the partner providing comfort
 * @returns Structured comfort message object
 */
export function getFallbackComfortMessage(
  userName: string,
  partnerName: string,
): {
  title: string;
  content: string;
  tone: "gentle" | "encouraging" | "loving" | "supportive";
  category: string;
} {
  return {
    title: "You Are Loved",
    content: `Dear ${userName}, I know things feel overwhelming right now, but I want you to know that you're not alone. Even in your darkest moments, remember that you are deeply loved and cherished. Your feelings are valid, and it's okay to not be okay sometimes. Take your time to heal, be gentle with yourself, and know that brighter days are ahead. You are stronger than you know, and I believe in you completely. With all my love, ${partnerName} 💕`,
    tone: "loving" as const,
    category: "comfort",
  };
}

// ============================================================================
// String and Text Utilities
// ============================================================================

/**
 * Truncates text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text with suffix if needed
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to title case
 * @param str - The string to convert
 * @returns String in title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates if a string is a valid email format
 * @param email - The email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a date string is in YYYY-MM-DD format
 * @param dateString - The date string to validate
 * @returns True if valid date format
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Checks if a value is empty or null/undefined
 * @param value - The value to check
 * @returns True if value is empty, null, or undefined
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object")
    return Object.keys(value as Record<string, unknown>).length === 0;
  return false;
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Safely executes an async function with error handling
 * @param fn - The async function to execute
 * @param fallback - Fallback value to return on error
 * @returns Promise that resolves to the function result or fallback
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("Async operation failed:", error);
    return fallback;
  }
}

/**
 * Creates a debounced version of a function
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// Export all utilities as a namespace for organized imports
// ============================================================================

export const helpers = {
  // Common utilities
  getTimeBasedGreeting,
  formatResponse,

  // Date utilities
  calculateMonthsBetween,
  calculateYearsBetween,
  formatDate,

  // AI utilities
  getFallbackCelebrationMessage,
  getFallbackComfortMessage,

  // String utilities
  truncateText,
  capitalizeFirst,
  toTitleCase,

  // Validation utilities
  isValidEmail,
  isValidDateFormat,
  isEmpty,

  // Error handling utilities
  safeAsync,
  debounce,
};

export default helpers;
