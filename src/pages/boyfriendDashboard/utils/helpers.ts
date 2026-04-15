/**
 * Date formatting utilities for BoyFriend Dashboard
 */

/**
 * Formats a date string to "Month-DD-YYYY" format (e.g., "March-01-2026")
 * @param dateString - The date string to format
 * @returns Formatted date string or 'Unknown' if invalid
 */
export const formatDateForDashboard = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}-${day}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
};

/**
 * Formats a date string to a more detailed format for display
 * @param dateString - The date string to format  
 * @returns Formatted date and time string
 */
export const formatDateTimeDetailed = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting detailed date:', error);
    return 'Unknown';
  }
};

/**
 * Checks if a date is today
 * @param dateString - The date string to check
 * @returns True if the date is today, false otherwise
 */
export const isToday = (dateString: string | undefined): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Gets a relative time string (e.g., "2 hours ago", "yesterday")
 * @param dateString - The date string to format
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return formatDateForDashboard(dateString);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown';
  }
};