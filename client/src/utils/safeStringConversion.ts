/**
 * Safely converts any value to a string without causing "Cannot convert object to primitive value" errors
 * @param value - The value to convert to string
 * @returns A safe string representation of the value
 */
export function safeStringConversion(value: unknown): string {
  try {
    // Handle null and undefined
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    // Handle primitive types
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    
    // Handle objects
    if (typeof value === 'object') {
      // Handle Date objects
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Handle Arrays
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      
      // Handle other objects
      try {
        return JSON.stringify(value);
      } catch (jsonError) {
        // If JSON.stringify fails, try toString
        try {
          return value.toString();
        } catch (toStringError) {
          // Last resort: return object type
          return `[object ${value.constructor?.name || 'Object'}]`;
        }
      }
    }
    
    // For any other type, try String() constructor
    try {
      return String(value);
    } catch (error) {
      return '[Unable to convert to string]';
    }
  } catch (error) {
    // Ultimate fallback
    return '[Conversion error]';
  }
}

/**
 * Safely converts a value to string for display purposes, with length limits
 * @param value - The value to convert
 * @param maxLength - Maximum length of the returned string (default: 1000)
 * @returns A safe, truncated string representation
 */
export function safeStringConversionForDisplay(value: unknown, maxLength: number = 1000): string {
  const converted = safeStringConversion(value);
  return converted.length > maxLength 
    ? converted.substring(0, maxLength) + '...' 
    : converted;
}       
  
