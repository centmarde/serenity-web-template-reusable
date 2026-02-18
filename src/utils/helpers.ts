/**
 * Date calculation utilities for relationship stats
 */

export interface RelationshipStats {
  days: number;
  months: number;
  years: number;
  totalDays: number;
}

/**
 * Calculate the number of days, months, years, and total days between two dates
 */
export const calculateRelationshipStats = (startDate: string): RelationshipStats => {
  const start = new Date(startDate);
  const current = new Date();
  
  // Calculate total days (using floor for consistent counting)
  const diffTime = Math.abs(current.getTime() - start.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Debug logging
  console.log('calculateRelationshipStats debug:', {
    startDate,
    startDateParsed: start.toISOString(),
    currentDate: current.toISOString(),
    diffTimeMs: diffTime,
    totalDays,
    exactDays: diffTime / (1000 * 60 * 60 * 24)
  });
  
  // Calculate years, months, and remaining days
  let years = current.getFullYear() - start.getFullYear();
  let months = current.getMonth() - start.getMonth();
  let days = current.getDate() - start.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(current.getFullYear(), current.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const result = {
    days,
    months,
    years,
    totalDays
  };
  
  console.log('calculateRelationshipStats result:', result);
  return result;
};

/**
 * Format a date string in a readable format
 */
export const formatRelationshipDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get a formatted relationship duration string
 */
export const getRelationshipDuration = (stats: RelationshipStats): string => {
  const parts = [];
  
  if (stats.years > 0) {
    parts.push(`${stats.years} ${stats.years === 1 ? 'year' : 'years'}`);
  }
  
  if (stats.months > 0) {
    parts.push(`${stats.months} ${stats.months === 1 ? 'month' : 'months'}`);
  }
  
  if (stats.days > 0 && parts.length < 2) {
    parts.push(`${stats.days} ${stats.days === 1 ? 'day' : 'days'}`);
  }
  
  if (parts.length === 0) {
    return 'Today is the beginning!';
  }
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }
  
  return parts.join(', ');
};

/**
 * Generate responsive CSS values using clamp()
 */
export const generateResponsiveStyles = (minValue: string, preferredValue: string, maxValue: string): string => {
  return `clamp(${minValue}, ${preferredValue}, ${maxValue})`;
};

/**
 * Create themed background gradient
 */
export const createThemedGradient = (themeColor: string, opacity1: number = 0.1, opacity2: number = 0.2): string => {
  return `linear-gradient(135deg, ${themeColor}${Math.round(opacity1 * 100).toString(16).padStart(2, '0')}, ${themeColor}${Math.round(opacity2 * 100).toString(16).padStart(2, '0')}, #ffffff)`;
};

/**
 * Create themed box shadow
 */
export const createThemedShadow = (themeColor: string, opacity: number = 0.3): string => {
  return `0 8px 25px ${themeColor}${Math.round(opacity * 100).toString(16).padStart(2, '0')}`;
};