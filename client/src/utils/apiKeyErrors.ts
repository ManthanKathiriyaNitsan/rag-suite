/**
 * API Key Error Messages Utility
 * Provides user-friendly error messages for API key issues
 */

/**
 * Get user-friendly error message for API key issues
 * @param error - The error object from API call
 * @param defaultMessage - Default error message if no specific API key error is found
 * @returns User-friendly error message
 */
export function getUserFriendlyApiKeyErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  // Check if error is related to API key
  if (!error) {
    return defaultMessage;
  }

  // Check for API key validation errors from backend
  const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
  const errorString = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';

  // Check for common API key error patterns
  if (
    errorString.includes('api key') ||
    errorString.includes('apikey') ||
    errorString.includes('api_key') ||
    errorString.includes('authentication') ||
    errorString.includes('unauthorized') ||
    errorString.includes('invalid key') ||
    errorString.includes('expired key') ||
    errorString.includes('missing key')
  ) {
    // Check for specific error types
    if (errorString.includes('missing') || errorString.includes('empty') || errorString.includes('required')) {
      return 'Please enter the API key';
    }
    if (errorString.includes('invalid') || errorString.includes('not valid') || errorString.includes('incorrect')) {
      return 'Please enter a valid API key';
    }
    if (errorString.includes('expired')) {
      return 'API key has expired. Please enter a valid API key';
    }
    // Generic API key error
    return 'Please enter a valid API key';
  }

  // Check for HTTP status codes
  if (error?.response?.status === 401) {
    // 401 could be authentication or API key issue
    if (errorString.includes('api key') || errorString.includes('apikey') || errorString.includes('api_key')) {
      return 'Please enter a valid API key';
    }
    return 'Authentication failed. Please check your API key';
  }

  if (error?.response?.status === 403) {
    return 'Access forbidden. Please check your API key permissions';
  }

  // Return the error detail if available, otherwise default message
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * Validate API key before saving
 * @param apiKey - The API key to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateApiKeyForSave(apiKey: string): { isValid: boolean; message?: string } {
  // Check if API key is empty
  if (!apiKey || apiKey.trim() === '') {
    return { isValid: false, message: 'Please enter the API key' };
  }

  // Check if API key is valid format (at least 32 alphanumeric characters)
  const apiKeyPattern = /^[a-zA-Z0-9]{32,}$/;
  if (!apiKeyPattern.test(apiKey.trim())) {
    return { isValid: false, message: 'Please enter a valid API key' };
  }

  return { isValid: true };
}

