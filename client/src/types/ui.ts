/**
 * UI component type definitions
 * Extracted from UI components to improve type safety and reusability
 */

import { LucideIcon } from "lucide-react";

// =============================================================================
// ANIMATION TYPES
// =============================================================================

export type AnimationType = "bounce" | "pulse" | "wiggle" | "heart" | "star" | "sparkle";

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  repeat?: number | "infinite";
  ease?: string;
}

// =============================================================================
// POINTER TYPES
// =============================================================================

export interface AnimatedPointerProps {
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  animation?: AnimationType;
  className?: string;
  children?: React.ReactNode;
}

export interface PointerTypes {
  Click: React.ComponentType<AnimatedPointerProps>;
  Upload: React.ComponentType<AnimatedPointerProps>;
  Search: React.ComponentType<AnimatedPointerProps>;
  Download: React.ComponentType<AnimatedPointerProps>;
  Edit: React.ComponentType<AnimatedPointerProps>;
  Delete: React.ComponentType<AnimatedPointerProps>;
  Save: React.ComponentType<AnimatedPointerProps>;
  Refresh: React.ComponentType<AnimatedPointerProps>;
  Play: React.ComponentType<AnimatedPointerProps>;
  Pause: React.ComponentType<AnimatedPointerProps>;
  Archive: React.ComponentType<AnimatedPointerProps>;
  Copy: React.ComponentType<AnimatedPointerProps>;
}

// =============================================================================
// THEME TYPES
// =============================================================================

export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  input: string;
  ring: string;
  chart: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  config: ThemeConfig;
  isDark: boolean;
}

// =============================================================================
// LAYOUT TYPES
// =============================================================================

export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  content: {
    padding: number;
    maxWidth: number;
  };
}

export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavItem {
  id: string;
  name: string;
  path: string;
  icon?: LucideIcon | string;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  activeNavItems: string[];
}

// =============================================================================
// MODAL AND DIALOG TYPES
// =============================================================================

export interface ModalConfig {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  backdrop?: "static" | "closable";
  animation?: "fade" | "slide" | "zoom";
  position?: "center" | "top" | "bottom";
}

export interface DialogState {
  isOpen: boolean;
  data?: Record<string, unknown>;
  config?: ModalConfig;
}

// =============================================================================
// TOAST AND NOTIFICATION TYPES
// =============================================================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastConfig {
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export interface ToastState {
  id: string;
  config: ToastConfig;
  isVisible: boolean;
  isRemoving: boolean;
}

// =============================================================================
// LOADING AND PROGRESS TYPES
// =============================================================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: "spinner" | "dots" | "skeleton" | "progress";
}

export interface ProgressConfig {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  showValue?: boolean;
  animated?: boolean;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface TableConfig<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  sorting?: {
    key: string;
    direction: "asc" | "desc";
    onSort: (key: string, direction: "asc" | "desc") => void;
  };
  selection?: {
    selected: string[];
    onSelect: (selected: string[]) => void;
    selectable?: (item: T) => boolean;
  };
}

// =============================================================================
// CHART TYPES
// =============================================================================

export type ChartType = "line" | "bar" | "pie" | "area" | "scatter" | "radar";

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: "top" | "bottom" | "left" | "right";
      };
      tooltip?: {
        enabled?: boolean;
      };
    };
    scales?: {
      x?: {
        display?: boolean;
        title?: string;
      };
      y?: {
        display?: boolean;
        title?: string;
        beginAtZero?: boolean;
      };
    };
  };
}

// =============================================================================
// FORM INPUT TYPES
// =============================================================================

export interface InputConfig {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outlined";
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: LucideIcon;
}

export interface SelectConfig {
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
}

// =============================================================================
// BUTTON TYPES
// =============================================================================

export interface ButtonConfig {
  variant?: "default" | "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

// =============================================================================
// CARD TYPES
// =============================================================================

export interface CardConfig {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  clickable?: boolean;
}

// =============================================================================
// AVATAR TYPES
// =============================================================================

export interface AvatarConfig {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square";
  fallback?: string;
  status?: "online" | "offline" | "away" | "busy";
  statusColor?: string;
}

// =============================================================================
// BADGE TYPES
// =============================================================================

export interface BadgeConfig {
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface SizeConfig {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export interface SpacingConfig {
  margin?: number | string;
  padding?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
}

export interface FlexConfig {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  gap?: number | string;
}

// =============================================================================
// EVENT HANDLER TYPES
// =============================================================================

export interface ClickHandler {
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  onRightClick?: (event: React.MouseEvent) => void;
}

export interface KeyboardHandler {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyUp?: (event: React.KeyboardEvent) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

export interface FocusHandler {
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

export interface ChangeHandler {
  onChange?: (value: string | number | boolean | null) => void;
  onValueChange?: (value: string | number | boolean | null) => void;
}
