import { useQuery } from '@tanstack/react-query';
import { 
  analyticsAPI, 
  AnalyticsOverviewData,
  AnalyticsQueriesResponse,
  AnalyticsPopularResponse,
  AnalyticsDashboardResponse,
  SatisfactionTimeSeriesResponse,
  SourceCoverageResponse,
  PopularQueriesResponse,
  HardQueriesResponse,
} from '@/services/api/api';

// 📊 Analytics hook - Get overview data
export const useAnalyticsOverview = () => {
  const query = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsAPI.getOverview,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get queries
export const useAnalyticsQueries = (params?: { limit?: number; offset?: number; start_date?: string; end_date?: string }) => {
  const query = useQuery({
    queryKey: ['analytics', 'queries', params],
    queryFn: () => analyticsAPI.getQueries(params),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get popular terms
export const useAnalyticsPopular = (params?: { start_date?: string; end_date?: string }) => {
  const query = useQuery({
    queryKey: ['analytics', 'popular', params],
    queryFn: () => analyticsAPI.getPopular(params),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get dashboard data
export const useAnalyticsDashboard = (timeRange?: string) => {
  const query = useQuery({
    queryKey: ['analytics', 'dashboard', timeRange],
    queryFn: () => analyticsAPI.getDashboard(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get satisfaction time series
export const useAnalyticsSatisfactionTimeSeries = (timeRange?: string) => {
  const query = useQuery({
    queryKey: ['analytics', 'satisfaction-time-series', timeRange],
    queryFn: () => analyticsAPI.getSatisfactionTimeSeries(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get source coverage
export const useAnalyticsSourceCoverage = () => {
  const query = useQuery({
    queryKey: ['analytics', 'source-coverage'],
    queryFn: analyticsAPI.getSourceCoverage,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get popular queries
export const useAnalyticsPopularQueries = (timeRange?: string) => {
  const query = useQuery({
    queryKey: ['analytics', 'popular-queries', timeRange],
    queryFn: () => analyticsAPI.getPopularQueries(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get hard queries
export const useAnalyticsHardQueries = (timeRange?: string) => {
  const query = useQuery({
    queryKey: ['analytics', 'hard-queries', timeRange],
    queryFn: () => analyticsAPI.getHardQueries(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

