/**
 * Safe console utilities to prevent object conversion errors
 */

/**
 * Safely logs an object to console without causing conversion errors
 * @param message - The message to log
 * @param data - The data to log (can be any type)
 */
export function safeLog(message: string, data?: unknown): void {
  try {
    if (data === undefined || data === null) {
      console.log(message, data);
      return;
    }
    
    // For primitive types, log directly
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      console.log(message, data);
      return;
    }
    
    // For objects, try to safely convert
    if (typeof data === 'object') {
      try {
        // Try JSON.stringify first
        const jsonString = JSON.stringify(data, null, 2);
        console.log(message, jsonString);
      } catch (jsonError) {
        // If JSON.stringify fails, try toString
        try {
          console.log(message, data.toString());
        } catch (toStringError) {
          // Last resort: log object type
          console.log(message, `[object ${data.constructor?.name || 'Object'}]`);
        }
      }
      return;
    }
    
    // For any other type, try direct logging
    console.log(message, data);
  } catch (error) {
    // Ultimate fallback
    console.log(message, '[Unable to log data]');
  }
}

/**
 * Safely logs an error to console
 * @param message - The error message
 * @param error - The error object
 */
export function safeLogError(message: string, error: unknown): void {
  try {
    console.error(message, error?.message || error?.toString() || error);
  } catch (logError) {
    console.error(message, '[Unable to log error]');
  }
}

/**
 * Safely logs a warning to console
 * @param message - The warning message
 * @param data - Optional data to log
 */
export function safeLogWarning(message: string, data?: unknown): void {
  try {
    if (data !== undefined) {
      safeLog(message, data);
    } else {
      console.warn(message);
    }
  } catch (error) {
    console.warn(message, '[Unable to log warning data]');
  }
}
