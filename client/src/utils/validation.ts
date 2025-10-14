/**
 * Validation Utilities
 * Form and data validation functions
 */

import { VALIDATION_RULES, VALIDATION_PATTERNS, VALIDATION_LIMITS } from '@/constants/validation';

// Email Validation
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.EMAIL.test(email) && email.length <= VALIDATION_LIMITS.MAX_EMAIL_LENGTH;
};

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: VALIDATION_RULES.EMAIL.MESSAGE };
  }
  
  return { isValid: true };
};

// Password Validation
export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  return password.length >= VALIDATION_LIMITS.MIN_PASSWORD_LENGTH &&
         password.length <= VALIDATION_LIMITS.MAX_PASSWORD_LENGTH &&
         VALIDATION_PATTERNS.PASSWORD.test(password);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION_LIMITS.MIN_PASSWORD_LENGTH) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > VALIDATION_LIMITS.MAX_PASSWORD_LENGTH) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
    return { isValid: false, message: VALIDATION_RULES.PASSWORD.MESSAGE };
  }
  
  return { isValid: true };
};

// Username Validation
export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  
  return username.length >= VALIDATION_LIMITS.MIN_USERNAME_LENGTH &&
         username.length <= VALIDATION_LIMITS.MAX_USERNAME_LENGTH &&
         VALIDATION_PATTERNS.USERNAME.test(username);
};

export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < VALIDATION_LIMITS.MIN_USERNAME_LENGTH) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > VALIDATION_LIMITS.MAX_USERNAME_LENGTH) {
    return { isValid: false, message: 'Username must be less than 50 characters' };
  }
  
  if (!VALIDATION_PATTERNS.USERNAME.test(username)) {
    return { isValid: false, message: VALIDATION_RULES.USERNAME.MESSAGE };
  }
  
  return { isValid: true };
};

// Name Validation
export const isValidName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  return name.length >= VALIDATION_LIMITS.MIN_NAME_LENGTH &&
         name.length <= VALIDATION_LIMITS.MAX_NAME_LENGTH &&
         VALIDATION_PATTERNS.NAME.test(name);
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.length < VALIDATION_LIMITS.MIN_NAME_LENGTH) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > VALIDATION_LIMITS.MAX_NAME_LENGTH) {
    return { isValid: false, message: 'Name must be less than 100 characters' };
  }
  
  if (!VALIDATION_PATTERNS.NAME.test(name)) {
    return { isValid: false, message: VALIDATION_RULES.NAME.MESSAGE };
  }
  
  return { isValid: true };
};

// URL Validation
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return VALIDATION_PATTERNS.URL.test(url);
};

export const validateUrl = (url: string): { isValid: boolean; message?: string } => {
  if (!url) {
    return { isValid: false, message: 'URL is required' };
  }
  
  if (!isValidUrl(url)) {
    return { isValid: false, message: VALIDATION_RULES.URL.MESSAGE };
  }
  
  return { isValid: true };
};

// Phone Validation
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_PATTERNS.PHONE.test(phone);
};

export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (!isValidPhone(phone)) {
    return { isValid: false, message: VALIDATION_RULES.PHONE.MESSAGE };
  }
  
  return { isValid: true };
};

// API Key Validation
export const isValidApiKey = (apiKey: string): boolean => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  return VALIDATION_PATTERNS.API_KEY.test(apiKey);
};

export const validateApiKey = (apiKey: string): { isValid: boolean; message?: string } => {
  if (!apiKey) {
    return { isValid: false, message: 'API key is required' };
  }
  
  if (!isValidApiKey(apiKey)) {
    return { isValid: false, message: VALIDATION_RULES.API_KEY.MESSAGE };
  }
  
  return { isValid: true };
};

// File Validation
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!file || !allowedTypes) return false;
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file: File, maxSize: number = VALIDATION_LIMITS.MAX_FILE_SIZE): boolean => {
  if (!file) return false;
  return file.size <= maxSize;
};

export const validateFile = (file: File, options?: {
  allowedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
}): { isValid: boolean; message?: string } => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  
  const { allowedTypes, maxSize = VALIDATION_LIMITS.MAX_FILE_SIZE } = options || {};
  
  if (allowedTypes && !isValidFileType(file, allowedTypes)) {
    return { isValid: false, message: 'File type is not supported' };
  }
  
  if (!isValidFileSize(file, maxSize)) {
    return { isValid: false, message: `File size must be less than ${formatFileSize(maxSize)}` };
  }
  
  return { isValid: true };
};

// Search Query Validation
export const isValidSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== 'string') return false;
  
  const trimmed = query.trim();
  return trimmed.length >= VALIDATION_LIMITS.MIN_SEARCH_QUERY_LENGTH &&
         trimmed.length <= VALIDATION_LIMITS.MAX_SEARCH_QUERY_LENGTH;
};

export const validateSearchQuery = (query: string): { isValid: boolean; message?: string } => {
  if (!query) {
    return { isValid: false, message: 'Search query is required' };
  }
  
  const trimmed = query.trim();
  
  if (trimmed.length < VALIDATION_LIMITS.MIN_SEARCH_QUERY_LENGTH) {
    return { isValid: false, message: 'Search query must be at least 2 characters long' };
  }
  
  if (trimmed.length > VALIDATION_LIMITS.MAX_SEARCH_QUERY_LENGTH) {
    return { isValid: false, message: 'Search query must be less than 1000 characters' };
  }
  
  return { isValid: true };
};

// Message Validation
export const isValidMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') return false;
  return message.length <= VALIDATION_LIMITS.MAX_MESSAGE_LENGTH;
};

export const validateMessage = (message: string): { isValid: boolean; message?: string } => {
  if (!message) {
    return { isValid: false, message: 'Message is required' };
  }
  
  if (message.length > VALIDATION_LIMITS.MAX_MESSAGE_LENGTH) {
    return { isValid: false, message: 'Message must be less than 2000 characters' };
  }
  
  return { isValid: true };
};

// Generic Validation
export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateRequired = (value: unknown, fieldName: string = 'Field'): { isValid: boolean; message?: string } => {
  if (!isRequired(value)) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

// Form Validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (data: Record<string, unknown>, rules: Record<string, (value: unknown) => { isValid: boolean; message?: string }>): ValidationResult => {
  const errors: Record<string, string> = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(data[field]);
    if (!result.isValid && result.message) {
      errors[field] = result.message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper Functions
const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};
