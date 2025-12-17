/**
 * Helper Utilities
 * General purpose utility functions
 */

// Array Helpers
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const sample = <T>(array: T[], count: number = 1): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
};

// Object Helpers
export const pick = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
};

export const flatten = (obj: unknown, prefix: string = ''): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  if (typeof obj !== 'object' || obj === null) {
    return result;
  }
  
  for (const key in obj as Record<string, unknown>) {
    if ((obj as Record<string, unknown>).hasOwnProperty(key)) {
      const value = (obj as Record<string, unknown>)[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (isObject(value) && !Array.isArray(value)) {
        Object.assign(result, flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
  }
  
  return result;
};

// String Helpers
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const camelCase = (str: string): string => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

export const kebabCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
};

export const snakeCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase();
};

export const pascalCase = (str: string): string => {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
            .replace(/\s+/g, '');
};

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Clipboard Helpers
export const copyToClipboardSafe = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).clipboard && typeof (navigator as any).clipboard.writeText === 'function') {
      await (navigator as any).clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to fallback
  }

  try {
    if (typeof document === 'undefined') return false;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
};

// Number Helpers
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
  return Math.floor(random(min, max + 1));
};

export const round = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// Date Helpers
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  return date >= startOfWeek && date <= endOfWeek;
};

export const isThisMonth = (date: Date): boolean => {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Async Helpers
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: number } = {}
): Promise<T> => {
  const { retries = 3, delay = 1000, backoff = 2 } = options;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      await sleep(delay * Math.pow(backoff, i));
    }
  }
  
  throw new Error('Retry failed');
};

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Promise timed out after ${ms}ms`));
    }, ms);
    
    promise.then(
      result => {
        clearTimeout(timer);
        resolve(result);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
};

// Type Helpers
export const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

export const isNull = (value: unknown): value is null => {
  return value === null;
};

export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

export const isNil = (value: unknown): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};

// URL Helpers
export const getUrlParams = (url: string): Record<string, string> => {
  const params = new URLSearchParams(new URL(url).search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of Array.from(params.entries())) {
    result[key] = value;
  }
  
  return result;
};

export const buildUrl = (base: string, params: Record<string, any>): string => {
  const url = new URL(base);
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  
  return url.toString();
};

// Debounce and Throttle
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
