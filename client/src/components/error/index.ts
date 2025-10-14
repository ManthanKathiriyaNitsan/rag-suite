export { default as ErrorBoundary } from './ErrorBoundary';
export { default as PageErrorBoundary } from './PageErrorBoundary';
export { default as ComponentErrorBoundary } from './ComponentErrorBoundary';

// Re-export error reporting service
export { errorReportingService } from '@/services/errorReporting';

// Re-export hooks
export { useErrorBoundary, useAsyncError } from '@/hooks/useErrorBoundary';
