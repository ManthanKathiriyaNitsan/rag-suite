/**
 * Formatting Utilities
 * String, number, date, and data formatting functions
 */

// Date Formatting
export const formatDate = (date: Date | string | number, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'relative':
      return getRelativeTime(dateObj);
    default:
      return dateObj.toLocaleDateString();
  }
};

export const formatTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  return dateObj.toLocaleTimeString();
};

export const formatDateTime = (date: Date | string | number): string => {
  return `${formatDate(date, 'short')} ${formatTime(date)}`;
};

// Number Formatting
export const formatNumber = (num: number, options?: {
  decimals?: number;
  thousandSeparator?: boolean;
  currency?: string;
  compact?: boolean;
}): string => {
  const {
    decimals = 2,
    thousandSeparator = true,
    currency,
    compact = false
  } = options || {};

  if (compact && Math.abs(num) >= 1000) {
    return formatCompactNumber(num);
  }

  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: currency ? 2 : decimals,
    maximumFractionDigits: decimals,
    useGrouping: thousandSeparator,
    style: currency ? 'currency' : 'decimal',
    currency: currency || 'USD'
  });

  return formatter.format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(2)} ${sizes[i]}`;
};

// String Formatting
export const formatString = (str: string, options?: {
  capitalize?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  trim?: boolean;
  maxLength?: number;
  ellipsis?: boolean;
}): string => {
  let result = str;

  if (options?.trim) {
    result = result.trim();
  }

  if (options?.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
    if (options.ellipsis) {
      result += '...';
    }
  }

  if (options?.capitalize) {
    result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  } else if (options?.uppercase) {
    result = result.toUpperCase();
  } else if (options?.lowercase) {
    result = result.toLowerCase();
  }

  return result;
};

export const formatSlug = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const formatInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// URL Formatting
export const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.href;
  } catch {
    return url;
  }
};

export const formatDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// Data Formatting
export const formatObject = (obj: Record<string, unknown>, options?: {
  maxDepth?: number;
  showFunctions?: boolean;
  showUndefined?: boolean;
}): string => {
  const {
    maxDepth = 3,
    showFunctions = false,
    showUndefined = false
  } = options || {};

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function' && !showFunctions) {
      return '[Function]';
    }
    if (value === undefined && !showUndefined) {
      return '[Undefined]';
    }
    return value;
  }, 2);
};

export const formatArray = (arr: unknown[], options?: {
  separator?: string;
  maxItems?: number;
  showEllipsis?: boolean;
}): string => {
  const {
    separator = ', ',
    maxItems,
    showEllipsis = true
  } = options || {};

  if (!Array.isArray(arr)) {
    return String(arr);
  }

  let result = arr;
  
  if (maxItems && arr.length > maxItems) {
    result = arr.slice(0, maxItems);
    if (showEllipsis) {
      result.push('...');
    }
  }

  return result.join(separator);
};

// Helper Functions
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

const formatCompactNumber = (num: number): string => {
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`;
  }
  if (absNum >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`;
  }
  if (absNum >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K`;
  }
  
  return num.toString();
};
