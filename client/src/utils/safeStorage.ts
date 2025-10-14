/**
 * Safe storage utilities to prevent object conversion errors
 */

/**
 * Safely gets an item from localStorage with proper error handling
 * @param key - The storage key
 * @param defaultValue - Default value if item doesn't exist or is invalid
 * @returns The parsed value or default value
 */
export function safeGetItem(key: string, defaultValue: unknown = null): unknown {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    // Try to parse as JSON
    try {
      return JSON.parse(item);
    } catch (parseError) {
      // If JSON parsing fails, return the raw string
      return item;
    }
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Safely sets an item in localStorage with proper serialization
 * @param key - The storage key
 * @param value - The value to store
 * @returns True if successful, false otherwise
 */
export function safeSetItem(key: string, value: unknown): boolean {
  try {
    // Ensure the value can be serialized
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely gets an item from sessionStorage with proper error handling
 * @param key - The storage key
 * @param defaultValue - Default value if item doesn't exist or is invalid
 * @returns The parsed value or default value
 */
export function safeGetSessionItem(key: string, defaultValue: unknown = null): unknown {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) return defaultValue;
    
    // Try to parse as JSON
    try {
      return JSON.parse(item);
    } catch (parseError) {
      // If JSON parsing fails, return the raw string
      return item;
    }
  } catch (error) {
    console.warn(`Failed to get item from sessionStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Safely sets an item in sessionStorage with proper serialization
 * @param key - The storage key
 * @param value - The value to store
 * @returns True if successful, false otherwise
 */
export function safeSetSessionItem(key: string, value: unknown): boolean {
  try {
    // Ensure the value can be serialized
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in sessionStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely removes an item from localStorage
 * @param key - The storage key
 * @returns True if successful, false otherwise
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Safely removes an item from sessionStorage
 * @param key - The storage key
 * @returns True if successful, false otherwise
 */
export function safeRemoveSessionItem(key: string): boolean {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from sessionStorage: ${key}`, error);
    return false;
  }
}

/**
 * Clears all localStorage with error handling
 * @returns True if successful, false otherwise
 */
export function safeClearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage', error);
    return false;
  }
}

/**
 * Clears all sessionStorage with error handling
 * @returns True if successful, false otherwise
 */
export function safeClearSessionStorage(): boolean {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear sessionStorage', error);
    return false;
  }
}
