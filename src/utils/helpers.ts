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
 * Calculate anniversary countdown information
 */
export interface AnniversaryCountdown {
  nextAnniversaryNumber: number;
  daysUntilAnniversary: number;
  isToday: boolean;
  ordinalSuffix: string;
}

/**
 * Get anniversary countdown details
 */
export const calculateAnniversaryCountdown = (startDate: string): AnniversaryCountdown => {
  const start = new Date(startDate);
  const current = new Date();
  
  // Calculate how many complete years have passed
  let yearsCompleted = current.getFullYear() - start.getFullYear();
  
  // Check if we've passed this year's anniversary date
  const thisYearAnniversary = new Date(
    current.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  
  // If we haven't reached this year's anniversary yet, subtract 1 from years completed
  if (current < thisYearAnniversary) {
    yearsCompleted--;
  }
  
  // Next anniversary number is years completed + 1
  const nextAnniversaryNumber = yearsCompleted + 1;
  
  // Calculate the next anniversary date
  let nextAnniversary: Date;
  
  if (current < thisYearAnniversary) {
    // This year's anniversary hasn't happened yet
    nextAnniversary = thisYearAnniversary;
  } else if (current.getTime() === thisYearAnniversary.getTime()) {
    // Today is the anniversary!
    nextAnniversary = thisYearAnniversary;
  } else {
    // This year's anniversary has passed, use next year's
    nextAnniversary = new Date(
      current.getFullYear() + 1,
      start.getMonth(),
      start.getDate()
    );
  }
  
  // Calculate days until anniversary
  const diffTime = nextAnniversary.getTime() - current.getTime();
  const daysUntilAnniversary = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Check if today is the anniversary
  const isToday = daysUntilAnniversary === 0;
  
  // Get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (n: number): string => {
    if (n >= 11 && n <= 13) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const ordinalSuffix = getOrdinalSuffix(nextAnniversaryNumber);
  
  return {
    nextAnniversaryNumber,
    daysUntilAnniversary,
    isToday,
    ordinalSuffix
  };
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