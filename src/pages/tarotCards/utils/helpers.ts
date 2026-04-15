/**
 * Helper functions for tarot cards functionality
 */

/**
 * Calculates the end date by adding 30 days to the created date
 * @param createdAt - The creation date (ISO string or Date object)
 * @returns ISO string of the end date (30 days after creation)
 */
export const calculateEndDate = (createdAt: string | Date): string => {
  const createdDate = new Date(createdAt);
  
  // Add 30 days to the created date
  const endDate = new Date(createdDate);
  endDate.setDate(endDate.getDate() + 30);
  
  return endDate.toISOString();
};

/**
 * Checks if a tarot reading has expired based on its end_date
 * @param endDate - The end date (ISO string)
 * @returns boolean indicating if the reading has expired
 */
export const isReadingExpired = (endDate: string | null): boolean => {
  if (!endDate) return false;
  
  const now = new Date();
  const expireDate = new Date(endDate);
  
  return now > expireDate;
};

/**
 * Gets the remaining days until a reading expires
 * @param endDate - The end date (ISO string)
 * @returns number of days remaining (0 if expired)
 */
export const getRemainingDays = (endDate: string | null): number => {
  if (!endDate) return 0;
  
  const now = new Date();
  const expireDate = new Date(endDate);
  
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
export const formatDisplayDate = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats time for display
 * @param date - The date (ISO string or Date object)
 * @returns formatted time string
 */
export const formatDisplayTime = (date: string | Date): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};