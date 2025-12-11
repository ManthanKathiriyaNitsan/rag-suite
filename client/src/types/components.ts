/**
 * Component-specific type definitions
 * Extracted from components to improve type safety and reusability
 */

import { User } from "./api";

// =============================================================================
// TAB COMPONENTS
// =============================================================================

// Overview Tab
export interface OverviewTabData {
  name: string;
  slug: string;
  description: string;
  status: string;
  ownerId: string;
  tags: string[];
}

export interface OverviewTabProps {
  data: OverviewTabData;
  users?: User[];
  onChange: (data: OverviewTabData) => void;
}

// Config Tab
export interface ConfigData {
  // RAG Settings
  ragModel: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  contextWindow: number;
  retrievalCount: number;
  similarityThreshold: number;
  
  // Behavior Settings
  enableChat: boolean;
  enableSearch: boolean;
  enableSuggestions: boolean;
  enableCitations: boolean;
  enableFollowUps: boolean;
  
  // Response Behavior
  responseMode: "precise" | "balanced" | "creative";
  fallbackResponse: string;
  maxResponseLength: number;
  enableStreaming: boolean;
  
  // Privacy & Security
  logConversations: boolean;
  retainData: boolean;
  dataRetentionDays: number;
  allowAnonymous: boolean;
  requireAuth: boolean;
  allowedDomains: string[];
  
  // Rate Limiting
  rateLimitPerUser: number;
  rateLimitWindow: number; // minutes
  
  // Content Filtering
  enableProfanityFilter: boolean;
  contentModerationLevel: "strict" | "moderate" | "relaxed";
  blockedTerms: string[];
}

export interface ConfigTabProps {
  data: ConfigData;
  onChange: (data: ConfigData) => void;
}

// A/B Testing Tab
export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configVersionId?: string;
  trafficWeight: number;
  isControl: boolean;
  isActive: boolean;
  metrics: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    confidenceInterval: [number, number];
    significance: number;
    isWinner: boolean;
    liftOverControl: number;
  };
}

export interface ABTestExperiment {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "completed";
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  primaryMetric: string;
  targetAudience: string;
  createdAt: Date;
  createdBy: string;
}

export interface ABTestingTabProps {
  experiments: ABTestExperiment[];
  onCreateExperiment: (experiment: Partial<ABTestExperiment>) => void;
  onUpdateExperiment: (id: string, updates: Partial<ABTestExperiment>) => void;
  onDeleteExperiment: (id: string) => void;
}

// Analytics Tab
export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  trend: "up" | "down" | "neutral";
  target?: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsTabProps {
  kpis: KPIMetric[];
  chartData: ChartDataPoint[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

// Permissions Tab
export interface PermissionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending" | "suspended";
  lastActive: Date;
  invitedAt?: Date;
  invitedBy?: string;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface PermissionsTabProps {
  users: PermissionUser[];
  roles: Role[];
  onInviteUser: (email: string, role: string) => void;
  onUpdateUserRole: (userId: string, role: string) => void;
  onRemoveUser: (userId: string) => void;
}

// Versions Tab
export interface VersionChange {
  field: string;
  oldValue: string | number | boolean | object | null;
  newValue: string | number | boolean | object | null;
  type: "added" | "modified" | "removed";
}

export interface Version {
  id: string;
  version: string;
  description: string;
  changes: VersionChange[];
  createdBy: string;
  createdAt: Date;
  deployedAt?: Date;
  status: "draft" | "published" | "deployed" | "archived";
  isCurrent: boolean;
  rollbackTo?: string;
}

export interface VersionsTabProps {
  versions: Version[];
  onCreateVersion: (version: Partial<Version>) => void;
  onDeployVersion: (versionId: string) => void;
  onRollbackToVersion: (versionId: string) => void;
}

// =============================================================================
// PAGE COMPONENTS
// =============================================================================

// RAG Tuning Page
export interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: { title: string; url: string; snippet: string }[];
  ragSettings?: {
    topK?: number;
    similarityThreshold?: number;
    maxTokens?: number;
    useReranker?: boolean;
  };
  queryString?: string; // Original query string
  // 📊 Server response data
  serverMessage?: string; // Server response message with actual TopK
  actualTopK?: number; // Actual TopK used by server
  actualReranker?: boolean; // Actual reranker status from server
}

// Integrations Page
export interface Integration {
  id: string;
  name: string;
  slug: string;
  publicId: string;
  description: string;
  status: "active" | "paused" | "archived";
  environments: Array<"staging" | "production">;
  lastPublish: Date | null;
  queriesLast7d: number;
  errorsLast7d: number;
  queriesLast30d: number;
  errorsLast30d: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Feedback Page
export interface FeedbackItem {
  id: string;
  query: string;
  excerpt: string;
  vote: "up" | "down";
  reasons: string[];
  createdAt: Date;
  sessionId: string;
  fullAnswer: string;
  citations: { title: string; url: string }[];
  userAgent: string;
  ipAddress: string;
}

// Crawl Page
export interface CrawlJob {
  id: string;
  source: string;
  started: Date;
  duration: string;
  pages: number;
  errors: number;
  status: "Completed" | "Running" | "Failed" | "Pending";
}

// =============================================================================
// COMMON COMPONENT PROPS
// =============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: unknown, item: T) => React.ReactNode;
  }[];
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface SearchableListProps<T> {
  items: T[];
  searchKey: keyof T;
  renderItem: (item: T, index: number) => React.ReactNode;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Status = "idle" | "loading" | "success" | "error";
export type Size = "sm" | "md" | "lg" | "xl";
export type Variant = "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";

// Form field types
export type FormFieldType = "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "radio" | "file";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
  pattern?: string;
  errorMessage?: string;
  validation?: (value: unknown) => string | null;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}
