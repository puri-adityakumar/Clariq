import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ResearchJob, 
  CreateResearchRequest,
  ResearchJobFilters,
  ResearchJobStats,
  researchService
} from './research-enhanced';

export interface UseResearchJobsState {
  jobs: ResearchJob[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: ResearchJobFilters;
  stats: ResearchJobStats | null;
}

export interface UseResearchJobsActions {
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createJob: (data: CreateResearchRequest) => Promise<ResearchJob>;
  deleteJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  duplicateJob: (jobId: string) => Promise<void>;
  setFilters: (filters: Partial<ResearchJobFilters>) => void;
  clearFilters: () => void;
  archiveOldJobs: (olderThanDays?: number) => Promise<number>;
}

export interface UseResearchJobsResult extends UseResearchJobsState, UseResearchJobsActions {}

/**
 * Enhanced hook for managing research jobs with advanced features
 */
export function useResearchJobs(
  userId: string | null,
  initialLimit = 25
): UseResearchJobsResult {
  const [state, setState] = useState<UseResearchJobsState>({
    jobs: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      limit: initialLimit,
      offset: 0,
      hasMore: false,
    },
    filters: {},
    stats: null,
  });

  const loadingRef = useRef(false);

  const fetchJobs = useCallback(async (reset = false) => {
    if (!userId || loadingRef.current) return;

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const offset = reset ? 0 : state.pagination.offset;
      const { jobs: newJobs, total } = await researchService.getResearchJobs(
        userId,
        state.filters,
        state.pagination.limit,
        offset
      );

      setState(prev => ({
        ...prev,
        jobs: reset ? newJobs : [...prev.jobs, ...newJobs],
        loading: false,
        pagination: {
          ...prev.pagination,
          total,
          offset: reset ? newJobs.length : prev.pagination.offset + newJobs.length,
          hasMore: (reset ? newJobs.length : prev.pagination.offset + newJobs.length) < total,
        },
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch jobs',
      }));
    } finally {
      loadingRef.current = false;
    }
  }, [userId, state.filters, state.pagination.limit, state.pagination.offset]);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    try {
      const stats = await researchService.getResearchStats(userId);
      setState(prev => ({ ...prev, stats }));
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, offset: 0 },
    }));
    await fetchJobs(true);
    await fetchStats();
  }, [fetchJobs, fetchStats]);

  const loadMore = useCallback(async () => {
    if (state.pagination.hasMore && !loadingRef.current) {
      await fetchJobs(false);
    }
  }, [fetchJobs, state.pagination.hasMore]);

  const createJob = useCallback(async (data: CreateResearchRequest): Promise<ResearchJob> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const newJob = await researchService.createResearchJob(data);
      setState(prev => ({
        ...prev,
        jobs: [newJob, ...prev.jobs],
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + 1,
        },
      }));
      await fetchStats();
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    }
  }, [fetchStats]);

  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, error: null }));
      await researchService.deleteResearchJob(jobId, userId);
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.filter(job => job.$id !== jobId),
        pagination: {
          ...prev.pagination,
          total: Math.max(0, prev.pagination.total - 1),
        },
      }));
      await fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    }
  }, [userId, fetchStats]);

  const retryJob = useCallback(async (jobId: string): Promise<void> => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, error: null }));
      const updatedJob = await researchService.retryResearchJob(jobId, userId);
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(job => job.$id === jobId ? updatedJob : job),
      }));
      await fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry job';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    }
  }, [userId, fetchStats]);

  const duplicateJob = useCallback(async (jobId: string): Promise<void> => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, error: null }));
      const newJob = await researchService.duplicateResearchJob(jobId, userId);
      setState(prev => ({
        ...prev,
        jobs: [newJob, ...prev.jobs],
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total + 1,
        },
      }));
      await fetchStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate job';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    }
  }, [userId, fetchStats]);

  const setFilters = useCallback((newFilters: Partial<ResearchJobFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, offset: 0 },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, offset: 0 },
    }));
  }, []);

  const archiveOldJobs = useCallback(async (olderThanDays = 30): Promise<number> => {
    if (!userId) return 0;

    try {
      setState(prev => ({ ...prev, error: null }));
      const archivedCount = await researchService.archiveOldJobs(userId, olderThanDays);
      await refresh(); // Refresh the list after archiving
      return archivedCount;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive old jobs';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw err;
    }
  }, [userId, refresh]);

  // Initial load and filter changes
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, state.filters]);

  return {
    ...state,
    refresh,
    loadMore,
    createJob,
    deleteJob,
    retryJob,
    duplicateJob,
    setFilters,
    clearFilters,
    archiveOldJobs,
  };
}

export interface UseResearchJobResult {
  job: ResearchJob | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (data: Partial<ResearchJob>) => Promise<void>;
}

/**
 * Enhanced hook for managing a single research job
 */
export function useResearchJob(
  jobId: string | null,
  userId?: string
): UseResearchJobResult {
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedJob = await researchService.getResearchJob(jobId, userId);
      setJob(fetchedJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
      console.error('Error fetching research job:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId, userId]);

  const update = useCallback(async (data: Partial<ResearchJob>) => {
    if (!jobId || !userId) return;

    try {
      setError(null);
      const updatedJob = await researchService.updateResearchJob(jobId, data, userId);
      setJob(updatedJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
      throw err;
    }
  }, [jobId, userId]);

  // Fetch job when jobId changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    job,
    loading,
    error,
    refresh,
    update,
  };
}

/**
 * Hook for auto-refreshing research jobs with intelligent polling
 */
export function useAutoRefreshJobs(
  userId: string | null,
  intervalMs: number = 30000,
  enabledWhenBackground = false
): UseResearchJobsResult {
  const result = useResearchJobs(userId);
  const [isVisible, setIsVisible] = useState(true);

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const shouldRefresh = () => {
      // Only refresh if page is visible or background refresh is enabled
      if (!isVisible && !enabledWhenBackground) return false;
      
      // Only refresh if there are active jobs
      return result.jobs.some(job => 
        job.status === 'pending' || job.status === 'processing'
      );
    };

    const interval = setInterval(() => {
      if (shouldRefresh()) {
        result.refresh();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [userId, intervalMs, isVisible, enabledWhenBackground, result]);

  return result;
}

/**
 * Hook for research job analytics and insights
 */
export function useResearchAnalytics(userId: string | null) {
  const [analytics, setAnalytics] = useState<{
    dailyStats: Array<{ date: string; completed: number; failed: number }>;
    agentPopularity: Array<{ agent: string; count: number }>;
    avgSourcesPerJob: number;
    successRate: number;
    loading: boolean;
    error: string | null;
  }>({
    dailyStats: [],
    agentPopularity: [],
    avgSourcesPerJob: 0,
    successRate: 0,
    loading: false,
    error: null,
  });

  const fetchAnalytics = useCallback(async () => {
    if (!userId) return;

    setAnalytics(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { jobs } = await researchService.getResearchJobs(userId, {}, 1000);
      
      // Calculate daily stats for the last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyStats = last30Days.map(date => {
        const dayJobs = jobs.filter(job => 
          job.completed_at?.startsWith(date) || job.created_at.startsWith(date)
        );
        return {
          date,
          completed: dayJobs.filter(job => job.status === 'completed').length,
          failed: dayJobs.filter(job => job.status === 'failed').length,
        };
      });

      // Calculate agent popularity
      const agentCounts: Record<string, number> = {};
      jobs.forEach(job => {
        job.enabled_agents.forEach(agent => {
          agentCounts[agent] = (agentCounts[agent] || 0) + 1;
        });
      });

      const agentPopularity = Object.entries(agentCounts)
        .map(([agent, count]) => ({ agent, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate other metrics
      const completedJobs = jobs.filter(job => job.status === 'completed');
      const avgSourcesPerJob = completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => sum + (job.total_sources || 0), 0) / completedJobs.length
        : 0;

      const totalFinishedJobs = jobs.filter(job => 
        job.status === 'completed' || job.status === 'failed'
      );
      const successRate = totalFinishedJobs.length > 0
        ? (completedJobs.length / totalFinishedJobs.length) * 100
        : 0;

      setAnalytics(prev => ({
        ...prev,
        dailyStats,
        agentPopularity,
        avgSourcesPerJob: Math.round(avgSourcesPerJob * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
        loading: false,
      }));
    } catch (err) {
      setAnalytics(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch analytics',
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { ...analytics, refresh: fetchAnalytics };
}