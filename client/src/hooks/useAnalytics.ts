import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
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
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsAPI.getOverview,
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false, // Disabled to prevent excessive requests
    retry: 1, // Only retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get queries
export const useAnalyticsQueries = (params?: { limit?: number; offset?: number; start_date?: string; end_date?: string }) => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'queries', params],
    queryFn: () => analyticsAPI.getQueries(params),
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get popular terms
export const useAnalyticsPopular = (params?: { start_date?: string; end_date?: string }) => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'popular', params],
    queryFn: () => analyticsAPI.getPopular(params),
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get dashboard data
export const useAnalyticsDashboard = (timeRange?: string) => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'dashboard', timeRange],
    queryFn: () => analyticsAPI.getDashboard(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get satisfaction time series
export const useAnalyticsSatisfactionTimeSeries = (timeRange?: string) => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'satisfaction-time-series', timeRange],
    queryFn: () => analyticsAPI.getSatisfactionTimeSeries(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get source coverage
export const useAnalyticsSourceCoverage = () => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'source-coverage'],
    queryFn: analyticsAPI.getSourceCoverage,
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get popular queries
export const useAnalyticsPopularQueries = (timeRange?: string) => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'popular-queries', timeRange],
    queryFn: () => analyticsAPI.getPopularQueries(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 📊 Analytics hook - Get hard queries
export const useAnalyticsHardQueries = (timeRange?: string) => {
  // Check for CORB/CORS errors - disable polling if present
  const hasCORBError = typeof window !== 'undefined' && (window as any).__HAS_CORB_CORS_ERROR;

  const query = useQuery({
    queryKey: ['analytics', 'hard-queries', timeRange],
    queryFn: () => analyticsAPI.getHardQueries(timeRange ? { time_range: timeRange } : undefined),
    staleTime: 300000, // 5 minutes
    refetchInterval: hasCORBError ? false : 300000, // Refetch every 5 minutes (reduced from 60s), disabled on CORB errors
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  // Handle CORB/CORS errors
  useEffect(() => {
    if (query.error) {
      const error: any = query.error;
      const isCORBError = error.message?.includes('CORB') || error.message?.includes('Cross-Origin');
      const isCORSError = error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('blocked');
      if ((isCORBError || isCORSError) && typeof window !== 'undefined') {
        (window as any).__HAS_CORB_CORS_ERROR = true;
      }
    }
  }, [query.error]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

