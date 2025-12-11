/**
 * Form-specific type definitions
 * Extracted from form components to improve type safety and reusability
 */

import { CrawlSite } from "./api";

// =============================================================================
// FORM PROPS INTERFACES
// =============================================================================

export interface BaseFormProps<T = Record<string, unknown>> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: T) => void;
}

// Upload Document Form
export interface UploadDocumentFormProps extends BaseFormProps {
  onUpload?: (file: File, metadata: DocumentUploadMetadata) => void;
}

export interface DocumentUploadMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  isPublic?: boolean;
}

// Add Source Form
export interface AddSourceFormProps extends BaseFormProps<CrawlSiteData> {
  onSubmit: (data: CrawlSiteData) => void;
  editData?: CrawlSite;
}

// Use the API version of CrawlSiteData for consistency
import { CrawlSiteData as APICrawlSiteData } from '@/services/api/api';

export type CrawlSiteData = APICrawlSiteData;

// Create Integration Form
export interface CreateIntegrationFormProps extends BaseFormProps<IntegrationFormData> {
  onSubmit: (data: IntegrationFormData) => void;
}

export interface IntegrationFormData {
  name: string;
  slug?: string;
  description: string;
  status?: string;
  owner?: string;
  tags?: string[];
  publicId?: string;
  type?: "web" | "mobile" | "api" | "custom";
  environment?: "staging" | "production" | "both";
  settings?: {
    enableChat: boolean;
    enableSearch: boolean;
    enableSuggestions: boolean;
    maxTokens?: number;
    temperature?: number;
  };
  branding?: {
    primaryColor?: string;
    logo?: string;
    customCSS?: string;
  };
}

// Create API Key Form
export interface CreateApiKeyFormProps extends BaseFormProps<ApiKeyFormData> {
  onSubmit: (data: ApiKeyFormData) => void;
}

export interface ApiKeyFormData {
  name: string;
  description: string;
  permissions: string[];
  expiresAt?: Date;
  environment: "staging" | "production";
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
}

// Edit Document Form
export interface EditDocumentFormProps extends BaseFormProps {
  document: DocumentEditData;
  onUpdate: (id: string, updates: Partial<DocumentEditData>) => void;
}

export interface DocumentEditData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  content?: string;
  metadata?: Record<string, any>;
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface FormFieldState {
  value: string | number | boolean | null;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

// =============================================================================
// FORM SUBMISSION TYPES
// =============================================================================

export interface FormSubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  lastSubmitted?: Date;
}

export interface FormSubmissionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string>;
}

// =============================================================================
// DYNAMIC FORM TYPES
// =============================================================================

export interface DynamicFormConfig {
  fields: DynamicFormField[];
  layout?: "vertical" | "horizontal" | "grid";
  submitText?: string;
  resetText?: string;
  validation?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
  };
}

export interface DynamicFormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "radio" | "file" | "date" | "time" | "datetime";
  placeholder?: string;
  defaultValue?: string | number | boolean | null;
  options?: { value: string | number; label: string; disabled?: boolean }[];
  validation?: ValidationRule;
  conditional?: {
    field: string;
    value: string | number | boolean | null;
    operator?: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  };
  visibility?: {
    field: string;
    value: string | number | boolean | null;
    operator?: "equals" | "notEquals" | "contains";
  };
  styling?: {
    width?: "full" | "half" | "third" | "quarter";
    className?: string;
  };
}

// =============================================================================
// FORM WIZARD TYPES
// =============================================================================

export interface FormWizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<Record<string, unknown>>;
  validation?: (data: Record<string, unknown>) => boolean | string;
  isOptional?: boolean;
}

export interface FormWizardProps {
  steps: FormWizardStep[];
  initialData?: Record<string, any>;
  onComplete: (data: Record<string, any>) => void;
  onCancel?: () => void;
  allowBackNavigation?: boolean;
  showProgress?: boolean;
}

// =============================================================================
// FILE UPLOAD TYPES
// =============================================================================

export interface FileUploadConfig {
  accept: string[];
  maxSize: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onUpload?: (files: File[]) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

export interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  error: string | null;
}

// =============================================================================
// SEARCH AND FILTER FORM TYPES
// =============================================================================

export interface SearchFormProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  placeholder?: string;
  showFilters?: boolean;
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
  author?: string;
  [key: string]: string | number | boolean | null | string[] | { start: Date; end: Date } | undefined;
}

// =============================================================================
// FORM UTILITY TYPES
// =============================================================================

export type FormMode = "create" | "edit" | "view";
export type FormSize = "sm" | "md" | "lg";

export interface FormConfig {
  mode: FormMode;
  size?: FormSize;
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  resetOnCancel?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
}

// Generic form data type
export type FormData<T = Record<string, any>> = T & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
};
