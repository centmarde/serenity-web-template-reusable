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
  
  // Calculate total months elapsed since start date
  const totalMonthsElapsed = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth());
  
  // If we haven't reached the day of the month yet, subtract one month
  const adjustedTotalMonths = current.getDate() >= start.getDate() ? totalMonthsElapsed : totalMonthsElapsed - 1;
  
  // Calculate years (remaining months after full years) and total months
  const years = Math.floor(adjustedTotalMonths / 12);
  const months = adjustedTotalMonths; // Total months, not remaining months
  
  // Calculate remaining days for the current month period
  let days = current.getDate() - start.getDate();
  if (days < 0) {
    const lastMonth = new Date(current.getFullYear(), current.getMonth(), 0);
    days += lastMonth.getDate();
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
  try {
    const start = new Date(startDate);
    const current = new Date();
    
    // Validate dates
    if (isNaN(start.getTime())) {
      console.error('Invalid start date:', startDate);
      return {
        nextAnniversaryNumber: 1,
        daysUntilAnniversary: 0,
        isToday: false,
        ordinalSuffix: 'st'
      };
    }
    
    // Debug logging
    console.log('Anniversary calculation debug:', {
      startDate,
      startDateParsed: start.toISOString(),
      currentDate: current.toISOString(),
      startYear: start.getFullYear(),
      currentYear: current.getFullYear()
    });
    
    // Calculate how many complete years have passed
    let yearsCompleted = current.getFullYear() - start.getFullYear();
    
    // Set time to start of day for accurate comparison
    const currentDateOnly = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    const thisYearAnnivDateOnly = new Date(current.getFullYear(), start.getMonth(), start.getDate());
    
    // If we haven't reached this year's anniversary yet, subtract 1 from years completed
    if (currentDateOnly < thisYearAnnivDateOnly) {
      yearsCompleted--;
    }
    
    // Next anniversary number is years completed + 1
    const nextAnniversaryNumber = yearsCompleted + 1;
    
    // Calculate the next anniversary date
    let nextAnniversary: Date;
    
    if (currentDateOnly < thisYearAnnivDateOnly) {
      // This year's anniversary hasn't happened yet
      nextAnniversary = thisYearAnnivDateOnly;
    } else if (currentDateOnly.getTime() === thisYearAnnivDateOnly.getTime()) {
      // Today is the anniversary!
      nextAnniversary = thisYearAnnivDateOnly;
    } else {
      // This year's anniversary has passed, use next year's
      nextAnniversary = new Date(
        current.getFullYear() + 1,
        start.getMonth(),
        start.getDate()
      );
    }
    
    // Calculate days until anniversary
    const diffTime = nextAnniversary.getTime() - currentDateOnly.getTime();
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
    
    const result = {
      nextAnniversaryNumber,
      daysUntilAnniversary,
      isToday,
      ordinalSuffix
    };
    
    console.log('Anniversary calculation result:', result);
    
    return result;
  } catch (error) {
    console.error('Error calculating anniversary countdown:', error);
    return {
      nextAnniversaryNumber: 1,
      daysUntilAnniversary: 0,
      isToday: false,
      ordinalSuffix: 'st'
    };
  }
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

/**
 * Generate secondary/inactive color from primary theme color
 */
export const generateInactiveColor = (themeColor: string): string => {
  // Convert hex to RGB then create a muted version
  const hex = themeColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create a muted version by reducing saturation and increasing lightness
  const mutedR = Math.round(r * 0.6 + 156 * 0.4); // Mix with light gray (156)
  const mutedG = Math.round(g * 0.6 + 163 * 0.4); // Mix with light gray (163)
  const mutedB = Math.round(b * 0.6 + 175 * 0.4); // Mix with light gray (175)
  
  return `rgb(${mutedR}, ${mutedG}, ${mutedB})`;
};

/**
 * Create inactive/secondary card styling
 */
export const createInactiveCardStyles = (themeColor: string) => {
  const inactiveColor = generateInactiveColor(themeColor);
  return {
    backgroundColor: "rgba(249, 250, 251, 0.85)", // Lighter background
    border: `3px solid ${inactiveColor}40`, // More transparent border
    boxShadow: `0 4px 15px ${inactiveColor}20`, // Softer shadow
    color: inactiveColor,
  };
};

/**
 * Create active card styling
 */
export const createActiveCardStyles = (themeColor: string) => {
  return {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    border: `4px solid ${themeColor}`,
    boxShadow: createThemedShadow(themeColor),
    color: themeColor,
  };
};

/**
 * Determine if a feature is active (has a route) or inactive (under development)
 */
export const isFeatureActive = (featureName: string): boolean => {
  const activeFeatures = ["Love Letters", "Made for You", "Our Music Playlist", "Our Memories", "Evil Thoughts"];
  return activeFeatures.includes(featureName);
};

/**
 * Generate a random 6-digit verification code
 */
export const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};